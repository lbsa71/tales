#!/usr/bin/env python3
"""Generate ElevenLabs foley from a radio plan and mix it beneath a WAV."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import wave
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
DOTENV_PATH = SCRIPT_DIR / ".env"
API_URL = "https://api.elevenlabs.io/v1/sound-generation"


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


def generate_effect(effect: dict, output: Path, key: str) -> dict:
    payload = {
        "text": effect["prompt"],
        "duration_seconds": effect["duration_seconds"],
        "prompt_influence": effect.get("prompt_influence", 0.6),
        "model_id": "eleven_text_to_sound_v2",
        "loop": effect.get("loop", False),
    }
    query = urllib.parse.urlencode({"output_format": "mp3_44100_128"})
    request = urllib.request.Request(
        f"{API_URL}?{query}",
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "xi-api-key": key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            audio = response.read()
            metadata = {
                "status": response.status,
                "content_type": response.headers.get("Content-Type"),
                "request_id": response.headers.get("request-id")
                or response.headers.get("x-request-id"),
                "character_cost": response.headers.get("character-cost"),
            }
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"Sound effect {effect['id']} failed with {error.code}: {detail}"
        ) from error
    if not audio:
        raise RuntimeError(f"Sound effect {effect['id']} was empty.")
    output.write_bytes(audio)
    metadata.update(
        {
            "path": str(output),
            "sha256": hashlib.sha256(audio).hexdigest(),
            "bytes": len(audio),
        }
    )
    return metadata


def mix(base_wav: Path, effects: list[dict], effect_paths: list[Path], output: Path) -> None:
    command = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(base_wav)]
    for path in effect_paths:
        command.extend(["-i", str(path)])

    filters = ["[0:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono,volume=-1.5dB[base]"]
    labels = ["[base]"]
    for index, effect in enumerate(effects, start=1):
        duration = effect["duration_seconds"]
        fade_duration = min(0.18, duration / 4)
        fade_start = max(0, duration - fade_duration)
        delay_ms = round(effect["start_seconds"] * 1000)
        label = f"sfx{index}"
        filters.append(
            f"[{index}:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono,"
            f"atrim=0:{duration},afade=t=out:st={fade_start}:d={fade_duration},"
            f"volume={effect['gain_db']}dB,adelay={delay_ms}:all=1[{label}]"
        )
        labels.append(f"[{label}]")
    filters.append(
        "".join(labels)
        + f"amix=inputs={len(labels)}:duration=first:dropout_transition=0:normalize=0,"
        "alimiter=limit=0.891:attack=5:release=50:level=false:latency=true[out]"
    )
    command.extend(
        [
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[out]",
            "-ar",
            "24000",
            "-ac",
            "1",
            "-c:a",
            "pcm_s16le",
            str(output),
        ]
    )
    subprocess.run(command, check=True)


def wav_metadata(path: Path) -> dict:
    with wave.open(str(path), "rb") as handle:
        return {
            "channels": handle.getnchannels(),
            "sample_rate_hz": handle.getframerate(),
            "sample_width_bits": handle.getsampwidth() * 8,
            "frames": handle.getnframes(),
            "duration_seconds": round(handle.getnframes() / handle.getframerate(), 3),
        }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan", type=Path, required=True)
    parser.add_argument("--base-wav", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()
    try:
        plan = json.loads(args.plan.read_text(encoding="utf-8"))
        effects = plan.get("effects") or []
        if not effects:
            raise ValueError("Plan contains no effects array.")
        if not args.base_wav.exists():
            raise ValueError(f"Base WAV does not exist: {args.base_wav}")
        args.out_dir.mkdir(parents=True, exist_ok=True)
        effects_dir = args.out_dir / "effects"
        effects_dir.mkdir(parents=True, exist_ok=True)
        key = None
        effect_paths: list[Path] = []
        generations: dict[str, dict] = {}
        for effect in effects:
            path = effects_dir / f"{effect['id']}.mp3"
            effect_paths.append(path)
            if effect.get("existing_audio"):
                source = Path(effect["existing_audio"])
                if not source.is_file():
                    raise ValueError(f"Existing effect does not exist: {source}")
                shutil.copy2(source, path)
                generations[effect["id"]] = {
                    "status": "reused",
                    "source": str(source),
                    "path": str(path),
                    "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                }
            else:
                if key is None:
                    key = api_key()
                generations[effect["id"]] = generate_effect(effect, path, key)

        mixed = args.out_dir / "a1-opening-test-mixed.wav"
        mix(args.base_wav, effects, effect_paths, mixed)
        manifest = {
            "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
            "base_wav": str(args.base_wav),
            "base_wav_sha256": hashlib.sha256(args.base_wav.read_bytes()).hexdigest(),
            "mixed_wav": str(mixed),
            "mixed_wav_sha256": hashlib.sha256(mixed.read_bytes()).hexdigest(),
            "effects": effects,
            "generations": generations,
            "audio": wav_metadata(mixed),
        }
        manifest_path = args.out_dir / "sound-design-manifest.json"
        manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(json.dumps(manifest, ensure_ascii=False, indent=2))
        return 0
    except (OSError, ValueError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
