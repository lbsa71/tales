#!/usr/bin/env python3
"""Transcribe a rendered sample with unforced ElevenLabs speaker detection.

Keeps the complete Scribe response and a sibling ``.meta.json`` recording the
input checksum and request settings. An unchanged successful result is reused.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import mimetypes
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path

import radio_theatre


ENDPOINT = "https://api.elevenlabs.io/v1/speech-to-text"
MODEL = "scribe_v2"


def multipart(audio: Path, content: bytes, settings: dict) -> tuple[bytes, str]:
    boundary = "elevenlabs-" + uuid.uuid4().hex
    parts: list[bytes] = []
    for name, value in settings.items():
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n'
            f"\r\n{str(value).lower() if isinstance(value, bool) else value}\r\n".encode(
                "utf-8"
            )
        )
    # Do not put a user-controlled filename into a multipart header.
    suffix = audio.suffix.lower()
    safe_suffix = suffix if suffix[1:].isalnum() else ".bin"
    mime = mimetypes.guess_type(audio.name)[0] or "application/octet-stream"
    parts.append(
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; '
        f'filename="sample{safe_suffix}"\r\nContent-Type: {mime}\r\n\r\n'.encode(
            "ascii"
        )
    )
    parts.extend((content, f"\r\n--{boundary}--\r\n".encode("ascii")))
    return b"".join(parts), f"multipart/form-data; boundary={boundary}"


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + "." + uuid.uuid4().hex + ".tmp")
    try:
        temporary.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def print_summary(payload: dict, cached: bool) -> None:
    words = payload.get("words") or []
    speakers = sorted(
        {word["speaker_id"] for word in words if word.get("speaker_id") is not None}
    )
    events = [
        {
            name: word[name]
            for name in ("text", "start", "end", "speaker_id")
            if name in word
        }
        for word in words
        if word.get("type") == "audio_event"
    ]
    print(
        json.dumps(
            {
                "cached": cached,
                "text": payload.get("text", ""),
                "detected_speaker_ids": speakers,
                "detected_speaker_count": len(speakers),
                "audio_events": events,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audio", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path, help="Full transcription JSON")
    parser.add_argument("--language", required=True, choices=("sv", "en"))
    parser.add_argument(
        "--force", action="store_true", help="Replace an existing result with a new API call"
    )
    args = parser.parse_args()
    audio = args.audio.resolve()
    output = args.out.resolve()
    metadata_path = output.with_suffix(".meta.json")
    if audio in (output, metadata_path) or output == metadata_path:
        parser.error("Audio, transcript, and metadata must have different paths.")
    content = audio.read_bytes()
    if not content:
        parser.error("Audio file is empty.")
    settings = {
        "model_id": MODEL,
        "language_code": args.language,
        "diarize": True,
        "tag_audio_events": True,
        "timestamps_granularity": "word",
    }
    # Intentionally omit num_speakers: the result must not be forced to match
    # the cast count whose perceptual separation we are trying to assess.
    checksum = hashlib.sha256(content).hexdigest()
    if not args.force and (output.exists() or metadata_path.exists()):
        try:
            previous = json.loads(metadata_path.read_text(encoding="utf-8"))
            if (
                previous.get("input_sha256") == checksum
                and previous.get("settings") == settings
                and previous.get("status") == "success"
            ):
                payload = json.loads(output.read_text(encoding="utf-8"))
                print_summary(payload, cached=True)
                return 0
        except (OSError, ValueError, TypeError, AttributeError):
            pass
        parser.error("Existing output does not match a successful cached request; use --force.")

    body, content_type = multipart(audio, content, settings)
    key = radio_theatre.api_key()
    request = urllib.request.Request(
        ENDPOINT,
        data=body,
        method="POST",
        headers={
            "xi-api-key": key,
            "Content-Type": content_type,
            "Accept": "application/json",
        },
    )
    metadata = {
        "input_path": str(audio),
        "input_sha256": checksum,
        "input_bytes": len(content),
        "output_path": str(output),
        "endpoint": ENDPOINT,
        "settings": settings,
        "date_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "speaker_count_forced": False,
    }
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            metadata["http_status"] = response.status
            metadata["request_id"] = response.headers.get("request-id") or response.headers.get(
                "x-request-id"
            )
            payload = json.load(response)
        if not isinstance(payload, dict) or "text" not in payload:
            raise ValueError("API returned no single-channel transcription text.")
    except (urllib.error.URLError, ValueError, TimeoutError) as error:
        metadata["status"] = "failed"
        if isinstance(error, urllib.error.HTTPError):
            metadata["http_status"] = error.code
            detail = error.read().decode("utf-8", errors="replace")
        else:
            detail = str(error)
        # Never echo credential material, even if an upstream error reflects it.
        metadata["error"] = detail.replace(key, "[REDACTED]")
        write_json(metadata_path, metadata)
        raise RuntimeError(metadata["error"]) from None
    metadata["status"] = "success"
    write_json(output, payload)
    write_json(metadata_path, metadata)
    print_summary(payload, cached=False)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, ValueError) as error:
        print(f"Transcription failed: {error}", file=sys.stderr)
        raise SystemExit(1)
