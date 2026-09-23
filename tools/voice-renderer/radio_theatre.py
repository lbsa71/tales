#!/usr/bin/env python3
"""Validate and render an ElevenLabs v3 radio-theatre plan.

The plan keeps authoritative source speech in ``text``, performance tags in
``tags``, and unspoken stage directions in ``comment`` items. This makes the
render prompt flexible without silently rewriting the source dialogue.
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
API_ROOT = "https://api.elevenlabs.io"
OUTPUT_FORMAT = "pcm_24000"
SAMPLE_RATE = 24_000
CHANNELS = 1
SAMPLE_WIDTH = 2
MAX_REQUEST_CHARS = 2_000


def load_dotenv(path: Path) -> None:
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
        raise RuntimeError(f"No ElevenLabs API key found in {DOTENV_PATH}")
    return value


def load_plan(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def source_spoken_lines(plan: dict) -> list[tuple[str, str]]:
    source = plan["source"]
    lines = (REPO_ROOT / source["path"]).read_text(encoding="utf-8").splitlines()
    if "start_spoken_index" in source:
        all_spoken = []
        for line in lines:
            match = re.fullmatch(r"\*\*([^:*]+):\*\* (.*)", line)
            if match:
                all_spoken.append((match.group(1), match.group(2)))
        start_index = source["start_spoken_index"]
        end_index = source["end_spoken_index"]
        if not 1 <= start_index <= end_index <= len(all_spoken):
            raise ValueError("Invalid global spoken-index range.")
        return all_spoken[start_index - 1 : end_index]
    start = lines.index(source["section_anchor"])
    end = lines.index(source["end_anchor"], start)
    # Parse every source role, so an accidentally uncast role cannot disappear
    # from the completeness check. Works for both Swedish and English labels.
    pattern = re.compile(r"\*\*([^:*]+):\*\* (.*)")
    spoken: list[tuple[str, str]] = []
    for line in lines[start : end + 1]:
        match = pattern.fullmatch(line)
        if match:
            spoken.append((match.group(1), match.group(2)))
    return spoken


def render_text(item: dict) -> str:
    tags = item.get("tags", "").strip()
    text = item.get("text", "").strip()
    return " ".join(part for part in (tags, text) if part)


def validate(plan: dict) -> dict:
    expected = source_spoken_lines(plan)
    actual = [
        (item["speaker"], item["text"])
        for item in plan["items"]
        if item.get("source_spoken") is True
    ]
    errors: list[str] = []
    if actual != expected:
        for index in range(max(len(expected), len(actual))):
            wanted = expected[index] if index < len(expected) else None
            got = actual[index] if index < len(actual) else None
            if wanted != got:
                errors.append(
                    f"Source-spoken line {index + 1}: source={wanted!r}, plan={got!r}"
                )
    if len(actual) != plan["source"]["expected_spoken_lines"]:
        errors.append(
            f"Plan has {len(actual)} source-spoken lines; expected "
            f"{plan['source']['expected_spoken_lines']}."
        )

    voices = plan["voices"]
    render_items = [item for item in plan["items"] if item["kind"] != "comment"]
    for index, item in enumerate(render_items, start=1):
        if item.get("speaker") not in voices:
            errors.append(f"Render item {index} has unknown speaker {item.get('speaker')!r}.")
        if not item.get("text", "").strip():
            errors.append(
                f"Render item {index} has no non-tag text; the API rejects tag-only turns."
            )
    source_text = (REPO_ROOT / plan["source"]["path"]).read_text(encoding="utf-8")
    for item in plan["items"]:
        if item["kind"] == "comment" and item["comment"] not in source_text:
            errors.append(f"Stage-direction comment not found in source: {item['comment']!r}")

    char_count = sum(len(render_text(item)) for item in render_items)
    if char_count > MAX_REQUEST_CHARS:
        errors.append(
            f"Render text is {char_count} characters; API guidance is at most "
            f"{MAX_REQUEST_CHARS}."
        )
    if errors:
        raise ValueError("\n".join(errors))
    return {
        "source_spoken_lines": len(expected),
        "planned_source_spoken_lines": len(actual),
        "source_speech_exact_match": actual == expected,
        "render_items": len(render_items),
        "comment_items": sum(item["kind"] == "comment" for item in plan["items"]),
        "render_characters": char_count,
        "max_request_characters": MAX_REQUEST_CHARS,
    }


def request_json(path: str, key: str) -> tuple[int, dict]:
    request = urllib.request.Request(API_ROOT + path, headers={"xi-api-key": key})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status, json.load(response)


def verify_api(plan: dict, key: str) -> dict:
    model_status, models = request_json("/v1/models", key)
    model = next(
        (candidate for candidate in models if candidate.get("model_id") == plan["model_id"]),
        None,
    )
    if model is None or not model.get("can_do_text_to_speech"):
        raise RuntimeError(f"Model {plan['model_id']} is unavailable for text to speech.")
    languages = {entry["language_id"] for entry in model.get("languages", [])}
    if plan["language_code"] not in languages:
        raise RuntimeError(
            f"Model {plan['model_id']} does not list {plan['language_code']} as supported."
        )

    voices: dict[str, dict] = {}
    for role, requested in plan["voices"].items():
        status, payload = request_json(f"/v1/voices/{requested['voice_id']}", key)
        labels = payload.get("labels") or {}
        voices[role] = {
            "status": status,
            "voice_id": requested["voice_id"],
            "requested_name": requested["name"],
            "api_name": payload.get("name"),
            "category": payload.get("category"),
            "language": labels.get("language"),
            "accent": labels.get("accent"),
            "gender": labels.get("gender"),
            "age": labels.get("age"),
        }
    return {
        "models_endpoint_status": model_status,
        "model_id": model.get("model_id"),
        "model_name": model.get("name"),
        "can_do_text_to_speech": model.get("can_do_text_to_speech"),
        "language_supported": plan["language_code"] in languages,
        "voices": voices,
    }


def dialogue_inputs(plan: dict) -> list[dict[str, str]]:
    return [
        {
            "text": render_text(item),
            "voice_id": plan["voices"][item["speaker"]]["voice_id"],
        }
        for item in plan["items"]
        if item["kind"] != "comment"
    ]


def render_pcm(plan: dict, key: str) -> tuple[bytes, dict]:
    payload = {
        "inputs": dialogue_inputs(plan),
        "model_id": plan["model_id"],
        "language_code": plan["language_code"],
        "seed": plan["seed"],
        "apply_text_normalization": "auto",
    }
    query = urllib.parse.urlencode({"output_format": OUTPUT_FORMAT})
    request = urllib.request.Request(
        f"{API_ROOT}/v1/text-to-dialogue?{query}",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
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
        raise RuntimeError(f"ElevenLabs returned {error.code}: {detail}") from error
    if not pcm or len(pcm) % (CHANNELS * SAMPLE_WIDTH):
        raise RuntimeError("ElevenLabs returned empty or incomplete PCM audio.")
    return pcm, metadata


def write_wav(path: Path, pcm: bytes) -> None:
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
    rms = math.sqrt(sum(value * value for value in samples) / len(samples))
    return {
        "sample_rate_hz": SAMPLE_RATE,
        "channels": CHANNELS,
        "sample_width_bits": SAMPLE_WIDTH * 8,
        "frames": len(samples),
        "duration_seconds": round(len(samples) / SAMPLE_RATE, 3),
        "peak_amplitude": peak,
        "peak_dbfs": round(20 * math.log10(peak / 32768), 2) if peak else None,
        "rms_amplitude": round(rms, 2),
        "rms_dbfs": round(20 * math.log10(rms / 32768), 2) if rms else None,
        "non_silent": peak > 0 and rms > 0,
    }


def write_readable_script(plan: dict, path: Path, validation: dict) -> None:
    swedish = plan["language_code"] == "sv"
    lines = [
        f"# {plan['title']}",
        "",
        (
            "Repliker och berättarröst följer den svenska översättningen ordagrant. "
            "HTML-kommentarer är scenanvisningar som inte läses upp. Hakparenteser "
            "styr framförandet i Eleven v3. Eventuella extra reaktioner markeras separat."
            if swedish else
            "Source dialogue and narration are verbatim. HTML comments are unspoken "
            "source stage directions. Bracketed text is sent to Eleven v3 as "
            "performance direction or a non-speech audio event. Short ‘Hm’ and ‘Ha’ "
            "turns are added reactions, not source dialogue."
        ),
        "",
        "## Röster" if swedish else "## Cast",
        "",
    ]
    for role, voice in plan["voices"].items():
        labels = ", ".join(voice["casting"])
        lines.append(
            f"- **{role.title()}:** {voice['name']} — {labels} "
            f"(`{voice['voice_id']}`)"
        )
    lines.extend(["", "## Ljudmanus" if swedish else "## Render script", ""])
    for item in plan["items"]:
        if item["kind"] == "comment":
            lines.extend([f"<!-- {item['comment']} -->", ""])
            continue
        speaker = item["speaker"].title()
        tags = item.get("tags")
        if tags:
            lines.append(f"*{tags}*  ")
        suffix = " (reaktion)" if swedish and item["kind"] == "reaction" else ""
        lines.extend([f"**{speaker}{suffix}:** {item['text']}", ""])
    if swedish:
        lines.extend([
            "## Kontroll", "",
            f"- Repliker och berättarinslag: {validation['planned_source_spoken_lines']} av {validation['source_spoken_lines']}.",
            f"- Ordagrant och i manusets ordning: {'ja' if validation['source_speech_exact_match'] else 'nej'}.",
            f"- Scenanvisningar som inte läses upp: {validation['comment_items']}.",
            f"- Talade turer inklusive extra reaktioner: {validation['render_items']}.",
            f"- Text till API: {validation['render_characters']} av rekommenderade {validation['max_request_characters']} tecken.",
            "",
        ])
        path.write_text("\n".join(lines), encoding="utf-8")
        return
    lines.extend(
        [
            "## Validation",
            "",
            (
                f"- Source-spoken lines: {validation['planned_source_spoken_lines']} "
                f"of {validation['source_spoken_lines']}."
            ),
            (
                "- Verbatim and in source order: "
                f"{'yes' if validation['source_speech_exact_match'] else 'no'}."
            ),
            f"- Unspoken stage-direction comments: {validation['comment_items']}.",
            f"- API render turns: {validation['render_items']}.",
            (
                f"- API text: {validation['render_characters']} of "
                f"{validation['max_request_characters']} recommended characters."
            ),
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def command_check(args: argparse.Namespace) -> int:
    plan = load_plan(args.plan)
    validation = validate(plan)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    script_path = args.out_dir / "render-script.md"
    write_readable_script(plan, script_path, validation)
    result: dict = {"validation": validation, "render_script": str(script_path)}
    if args.verify_api:
        result["api"] = verify_api(plan, api_key())
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


def command_render(args: argparse.Namespace) -> int:
    plan = load_plan(args.plan)
    validation = validate(plan)
    if (args.out_dir / "a1-opening-test.wav").exists():
        raise ValueError("Output already exists. Choose a new output directory for a new take.")
    key = api_key()
    api_validation = verify_api(plan, key)
    pcm, api_response = render_pcm(plan, key)
    metrics = audio_metrics(pcm)
    if not metrics["non_silent"] or metrics["duration_seconds"] <= 0:
        raise RuntimeError("Rendered audio failed the non-silence check.")

    args.out_dir.mkdir(parents=True, exist_ok=True)
    pcm_path = args.out_dir / "a1-opening-test.pcm"
    wav_path = args.out_dir / "a1-opening-test.wav"
    script_path = args.out_dir / "render-script.md"
    manifest_path = args.out_dir / "render-manifest.json"
    pcm_path.write_bytes(pcm)
    write_wav(wav_path, pcm)
    write_readable_script(plan, script_path, validation)
    manifest = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source_plan": str(args.plan),
        "plan_sha256": hashlib.sha256(args.plan.read_bytes()).hexdigest(),
        "source_script_sha256": hashlib.sha256(
            (REPO_ROOT / plan["source"]["path"]).read_bytes()
        ).hexdigest(),
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
    parser.add_argument("--plan", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    subparsers = parser.add_subparsers(dest="command", required=True)
    check = subparsers.add_parser("check")
    check.add_argument("--verify-api", action="store_true")
    check.set_defaults(func=command_check)
    render = subparsers.add_parser("render")
    render.set_defaults(func=command_render)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        return args.func(args)
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
