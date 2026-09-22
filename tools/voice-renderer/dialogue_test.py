#!/usr/bin/env python3
"""Validate and render a multi-voice ElevenLabs v3 dialogue test.

The dialogue JSON keeps source dialogue in a dedicated ``text`` field and
performance direction in ``direction``. This lets us prove that directions
never alter the translated lines before sending the combined input to the
Text to Dialogue endpoint.
"""

from __future__ import annotations

import argparse
import array
import datetime as dt
import hashlib
import json
import math
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import wave
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
DOTENV_PATH = Path(__file__).resolve().parent / ".env"
DEFAULT_SCRIPT = (
    REPO_ROOT
    / "stories/the-spare-room/translations/svenska/audio/prov-hamnen.json"
)
DEFAULT_OUT_DIR = REPO_ROOT / "dist/stories/the-spare-room/audio/sv/prov-hamnen"
API_ROOT = "https://api.elevenlabs.io"
OUTPUT_FORMAT = "pcm_24000"
SAMPLE_RATE = 24_000
CHANNELS = 1
SAMPLE_WIDTH = 2
MAX_REQUEST_CHARS = 2_000


def load_dotenv(path: Path) -> None:
    """Load the local key without ever logging its value."""
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        os.environ.setdefault(key.strip(), value)


def api_key() -> str:
    load_dotenv(DOTENV_PATH)
    value = os.environ.get("ELEVENLABS_API_KEY") or os.environ.get("XI_API_KEY")
    if not value:
        raise RuntimeError(f"Ingen ElevenLabs-nyckel hittades i {DOTENV_PATH}")
    return value


def load_plan(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def source_dialogue(plan: dict) -> tuple[list[tuple[str, str]], str]:
    spec = plan["source"]
    source_path = REPO_ROOT / spec["path"]
    lines = source_path.read_text(encoding="utf-8").splitlines()
    start = lines.index(spec["start_anchor"])
    final_stage_index = lines.index(spec["final_stage_anchor"], start)
    dialogue: list[tuple[str, str]] = []
    pattern = re.compile(r"\*\*(RUT|HELENA|KIM):\*\* (.*)")
    for line in lines[start : final_stage_index + 1]:
        match = pattern.fullmatch(line)
        if match:
            dialogue.append((match.group(1), match.group(2)))
    final_stage = lines[final_stage_index].removeprefix("*").removesuffix("*")
    return dialogue, final_stage


def render_text(item: dict) -> str:
    direction = item.get("direction", "").strip()
    text = item.get("text", "").strip()
    return " ".join(part for part in (direction, text) if part)


def validate(plan: dict) -> dict:
    expected, final_stage = source_dialogue(plan)
    actual = [
        (item["speaker"], item["text"])
        for item in plan["items"]
        if item["kind"] == "dialogue"
    ]
    errors: list[str] = []
    expected_count = plan["source"]["expected_dialogue_lines"]
    if len(expected) != expected_count:
        errors.append(
            f"Källintervallet innehåller {len(expected)} repliker, väntade {expected_count}."
        )
    if actual != expected:
        for index, (wanted, got) in enumerate(zip(expected, actual), start=1):
            if wanted != got:
                errors.append(f"Replik {index}: källa={wanted!r}, manus={got!r}")
        if len(actual) != len(expected):
            errors.append(f"Manuset har {len(actual)} repliker, källan {len(expected)}.")
    if final_stage != plan["source"]["required_final_stage"]:
        errors.append("Den avslutande scenanvisningen motsvarar inte källan.")

    voices = plan["voices"]
    for index, item in enumerate(plan["items"], start=1):
        if item.get("speaker") not in voices:
            errors.append(f"Post {index} har okänd talare: {item.get('speaker')!r}")
        if not render_text(item):
            errors.append(f"Post {index} saknar renderbar text.")

    char_count = sum(len(render_text(item)) for item in plan["items"])
    if char_count > MAX_REQUEST_CHARS:
        errors.append(
            f"Rendertexten är {char_count} tecken; API-gränsen är {MAX_REQUEST_CHARS}."
        )
    if errors:
        raise ValueError("\n".join(errors))
    return {
        "dialogue_lines": len(actual),
        "source_dialogue_lines": len(expected),
        "dialogue_exact_match": actual == expected,
        "final_stage_exact_match": final_stage
        == plan["source"]["required_final_stage"],
        "render_items": len(plan["items"]),
        "render_characters": char_count,
        "max_request_characters": MAX_REQUEST_CHARS,
    }


def request_json(path: str, key: str) -> tuple[int, dict]:
    request = urllib.request.Request(
        API_ROOT + path,
        headers={"xi-api-key": key},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status, json.load(response)


def verify_api(plan: dict, key: str) -> dict:
    status, models = request_json("/v1/models", key)
    selected = next(
        (model for model in models if model.get("model_id") == plan["model_id"]), None
    )
    if not selected or not selected.get("can_do_text_to_speech"):
        raise RuntimeError(f"Modellen {plan['model_id']} stöder inte text-till-tal.")
    language_ids = {language["language_id"] for language in selected.get("languages", [])}
    if plan["language_code"] not in language_ids:
        raise RuntimeError(
            f"Modellen {plan['model_id']} listar inte {plan['language_code']} som språk."
        )

    checked_voices: dict[str, dict] = {}
    for role, voice in plan["voices"].items():
        voice_status, payload = request_json(f"/v1/voices/{voice['voice_id']}", key)
        checked_voices[role] = {
            "status": voice_status,
            "requested_name": voice["name"],
            "api_name": payload.get("name"),
            "voice_id": voice["voice_id"],
            "language": (payload.get("labels") or {}).get("language"),
            "category": payload.get("category"),
        }
    return {
        "models_endpoint_status": status,
        "model_id": selected["model_id"],
        "model_name": selected.get("name"),
        "can_do_text_to_speech": selected.get("can_do_text_to_speech"),
        "language_supported": plan["language_code"] in language_ids,
        "voices": checked_voices,
    }


def dialogue_inputs(plan: dict) -> list[dict[str, str]]:
    return [
        {
            "text": render_text(item),
            "voice_id": plan["voices"][item["speaker"]]["voice_id"],
        }
        for item in plan["items"]
    ]


def render_pcm(plan: dict, key: str) -> tuple[bytes, dict]:
    payload = {
        "inputs": dialogue_inputs(plan),
        "model_id": plan["model_id"],
        "language_code": plan["language_code"],
        "seed": plan["seed"],
        "apply_text_normalization": "auto",
    }
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    query = urllib.parse.urlencode({"output_format": OUTPUT_FORMAT})
    request = urllib.request.Request(
        f"{API_ROOT}/v1/text-to-dialogue?{query}",
        data=body,
        method="POST",
        headers={
            "xi-api-key": key,
            "Content-Type": "application/json",
            "Accept": "audio/pcm",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            pcm = response.read()
            metadata = {
                "status": response.status,
                "content_type": response.headers.get("Content-Type"),
                "request_id": response.headers.get("request-id")
                or response.headers.get("x-request-id"),
                "history_item_id": response.headers.get("history-item-id"),
            }
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ElevenLabs svarade {error.code}: {detail}") from error
    if not pcm:
        raise RuntimeError("ElevenLabs returnerade en tom ljudfil.")
    if len(pcm) % (CHANNELS * SAMPLE_WIDTH):
        raise RuntimeError("PCM-svaret har ofullständiga ljudramar.")
    return pcm, metadata


def write_wav(path: Path, pcm: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(CHANNELS)
        output.setsampwidth(SAMPLE_WIDTH)
        output.setframerate(SAMPLE_RATE)
        output.writeframes(pcm)


def audio_metrics(pcm: bytes) -> dict:
    samples = array.array("h")
    samples.frombytes(pcm)
    if sys.byteorder != "little":
        samples.byteswap()
    peak = max(abs(value) for value in samples)
    square_sum = sum(value * value for value in samples)
    rms = math.sqrt(square_sum / len(samples))
    duration = len(samples) / SAMPLE_RATE
    return {
        "sample_rate_hz": SAMPLE_RATE,
        "channels": CHANNELS,
        "sample_width_bits": SAMPLE_WIDTH * 8,
        "frames": len(samples),
        "duration_seconds": round(duration, 3),
        "peak_amplitude": peak,
        "peak_dbfs": round(20 * math.log10(peak / 32768), 2) if peak else None,
        "rms_amplitude": round(rms, 2),
        "rms_dbfs": round(20 * math.log10(rms / 32768), 2) if rms else None,
        "non_silent": peak > 0 and rms > 0,
    }


def write_readable_script(plan: dict, path: Path, validation: dict) -> None:
    lines = [
        "# Gästrummet – ljudprov: hamnen",
        "",
        (
            "Ett tillfälligt ljudmanus för ElevenLabs v3 Text to Dialogue. "
            "Replikerna är ordagrant hämtade ur översättningen; kursiverad text "
            "är bearbetad berättarröst och hakparenteser är icke talade "
            "spelanvisningar eller reaktioner."
        ),
        "",
        "## Roller",
        "",
    ]
    for role, voice in plan["voices"].items():
        lines.append(f"- **{role.title()}:** {voice['name']} (`{voice['voice_id']}`)")
    lines.extend(["", "## Scen", ""])
    for item in plan["items"]:
        speaker = item["speaker"].title()
        direction = item.get("direction")
        if item["kind"] == "narration":
            if direction:
                lines.append(f"*{direction}*  ")
            lines.append(f"*{item['text']}*")
        elif item["kind"] == "reaction":
            if direction:
                lines.append(f"*{direction}*  ")
            lines.append(f"**{speaker}:** {item['text']}")
        else:
            if direction:
                lines.append(f"*{direction}*  ")
            lines.append(f"**{speaker}:** {item['text']}")
        lines.append("")
    lines.extend(
        [
            "## Maskinell manus kontroll",
            "",
            f"- Repliker: {validation['dialogue_lines']} av {validation['source_dialogue_lines']}.",
            f"- Ordagrann och i samma ordning: {'ja' if validation['dialogue_exact_match'] else 'nej'}.",
            f"- Avslutande scenanvisning kontrollerad: {'ja' if validation['final_stage_exact_match'] else 'nej'}.",
            f"- Renderposter: {validation['render_items']}.",
            f"- Tecken till API: {validation['render_characters']} av {validation['max_request_characters']}.",
            "",
        ]
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def command_check(args: argparse.Namespace) -> int:
    plan = load_plan(args.script)
    validation = validate(plan)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    script_path = args.out_dir / "prov-hamnen-ljudmanus.md"
    write_readable_script(plan, script_path, validation)
    result: dict = {"validation": validation, "readable_script": str(script_path)}
    if args.verify_api:
        result["api"] = verify_api(plan, api_key())
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


def command_render(args: argparse.Namespace) -> int:
    plan = load_plan(args.script)
    validation = validate(plan)
    key = api_key()
    api_validation = verify_api(plan, key)
    pcm, api_response = render_pcm(plan, key)

    args.out_dir.mkdir(parents=True, exist_ok=True)
    wav_path = args.out_dir / "prov-hamnen.wav"
    pcm_path = args.out_dir / "prov-hamnen.pcm"
    script_path = args.out_dir / "prov-hamnen-ljudmanus.md"
    manifest_path = args.out_dir / "render-manifest.json"
    pcm_path.write_bytes(pcm)
    write_wav(wav_path, pcm)
    write_readable_script(plan, script_path, validation)

    metrics = audio_metrics(pcm)
    if not metrics["non_silent"] or metrics["duration_seconds"] <= 0:
        raise RuntimeError("Den renderade ljudfilen klarade inte grundkontrollen.")
    manifest = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source_script": str(args.script),
        "wav": str(wav_path),
        "pcm": str(pcm_path),
        "wav_sha256": hashlib.sha256(wav_path.read_bytes()).hexdigest(),
        "pcm_sha256": hashlib.sha256(pcm).hexdigest(),
        "validation": validation,
        "api_validation": api_validation,
        "api_response": api_response,
        "audio": metrics,
    }
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--script", type=Path, default=DEFAULT_SCRIPT)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    subparsers = parser.add_subparsers(dest="command", required=True)
    check = subparsers.add_parser("check", help="Validera och skriv läsbart manus")
    check.add_argument("--verify-api", action="store_true")
    check.set_defaults(func=command_check)
    render = subparsers.add_parser("render", help="Validera och rendera WAV")
    render.set_defaults(func=command_render)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        return args.func(args)
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        print(f"FEL: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
