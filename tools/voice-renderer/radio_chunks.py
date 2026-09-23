#!/usr/bin/env python3
"""Immutable, resumable Swedish radio-drama dialogue chunks.

Preparation freezes individual plans; rendering never replaces a completed take.
New takes use --take take-02, then a separately selected local mix can be rebuilt.
API credentials are read only by radio_theatre.api_key and never serialized.
"""

from __future__ import annotations

import argparse
import base64
import copy
import concurrent.futures
import datetime as dt
import hashlib
import json
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

import radio_theatre as radio

ROOT = radio.REPO_ROOT
PERFORMANCE = ROOT / "stories/the-spare-room/adaptations/audio/render-plans/sv-performance.json"
PLANS = ROOT / "stories/the-spare-room/adaptations/audio/render-plans/sv-chunks"
OUTPUT = ROOT / "dist/stories/the-spare-room/adaptations/audio/sv/chunked-v1"
APPROVED = ROOT / "dist/stories/the-spare-room/adaptations/audio/sv/a1-opening-test"
APPROVED_PLAN = ROOT / "stories/the-spare-room/adaptations/audio/render-plans/a1-opening-sv-sanna-eva.json"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encoded(value: dict) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def save_new(path: Path, value: dict) -> None:
    data = encoded(value)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if path.read_bytes() != data:
            raise ValueError(f"Refusing to change frozen file: {path}")
        return
    with path.open("xb") as handle:
        handle.write(data)


def source_records(path: Path) -> list[dict]:
    records = []
    section = ""
    index = 0
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if line.startswith("## A"):
            section = line[3:5]
        match = re.fullmatch(r"\*\*([^:*]+):\*\* (.*)", line)
        if match:
            index += 1
            role, text = match.groups()
            records.append({"kind": "narration" if role == "BERÄTTARE" else "dialogue",
                            "source_spoken": True, "source_index": index,
                            "source_line": line_number, "section": section,
                            "speaker": role, "text": text})
        elif line.startswith("["):
            records.append({"kind": "comment", "comment": line,
                            "after_source_index": index, "source_line": line_number,
                            "section": section})
    return records


def prepare() -> None:
    performance = json.loads(PERFORMANCE.read_text())
    source_path = ROOT / performance["source"]["path"]
    if digest(source_path.read_bytes()) != performance["source"]["sha256"]:
        raise ValueError("Source changed after performance planning; review the plan first.")
    records = source_records(source_path)
    speech = [r for r in records if r.get("source_spoken")]
    approved = json.loads(APPROVED_PLAN.read_text())
    entries = performance["entries"]
    defaults = performance.get("defaults", {})
    index = []
    seen = []
    counts = {}
    for number, spec in enumerate(performance["chunks"], 1):
        start, end = spec["start"], spec["end"]
        section = speech[start - 1]["section"]
        if any(s["section"] != section for s in speech[start - 1:end]):
            raise ValueError("A chunk crosses an act boundary.")
        counts[section] = counts.get(section, 0) + 1
        chunk_id = f"{number:03d}-{section.lower()}-{counts[section]:02d}"
        items = []
        if start == 1 and end == 17:
            items = copy.deepcopy(approved["items"])
            cursor = 0
            for item in items:
                if item.get("source_spoken"):
                    cursor += 1
                    item["source_index"] = cursor
        else:
            for record in records:
                if record["kind"] == "comment":
                    if start - 1 <= record["after_source_index"] < end:
                        items.append(copy.deepcopy(record))
                    continue
                n = record["source_index"]
                if not start <= n <= end:
                    continue
                direction = entries.get(str(n), {})
                for reaction in direction.get("reactions_before", []):
                    items.append({"kind": "reaction", "source_spoken": False,
                                  "relative_to_source_index": n, **reaction})
                item = copy.deepcopy(record)
                tags = direction.get("tags", "")
                if not tags and item["speaker"] == "BERÄTTARE":
                    tags = defaults.get("narrator_tags", "[calm, conversational]")
                if tags:
                    item["tags"] = tags
                items.append(item)
                for reaction in direction.get("reactions_after", []):
                    items.append({"kind": "reaction", "source_spoken": False,
                                  "relative_to_source_index": n, **reaction})
            if end == len(speech):
                items.extend(copy.deepcopy(r) for r in records if r["kind"] == "comment" and r["after_source_index"] == end)
        plan = {
            "title": f"Gästrummet — {chunk_id}, {spec.get('title', section)}",
            "chunk_id": chunk_id, "section": section,
            "model_id": "eleven_v3", "language_code": "sv", "seed": 71023,
            "source": {"path": str(source_path.relative_to(ROOT)),
                       "start_spoken_index": start, "end_spoken_index": end,
                       "expected_spoken_lines": end - start + 1},
            "source_sha256_at_preparation": digest(source_path.read_bytes()),
            "voices": approved["voices"], "items": items,
            "continuity": {
                "previous_text": speech[start - 2]["text"][-100:] if start > 1 else "",
                "future_text": speech[end]["text"][:100] if end < len(speech) else "",
            },
        }
        if start == 1:
            plan["reuse_approved"] = True
        validation = radio.validate(plan)
        plan_path = PLANS / f"{chunk_id}.json"
        save_new(plan_path, plan)
        seen.extend(range(start, end + 1))
        index.append({"id": chunk_id, "section": section, "start": start, "end": end,
                      "plan": str(plan_path.relative_to(ROOT)),
                      "characters": validation["render_characters"],
                      "reused": plan.get("reuse_approved", False)})
    if seen != list(range(1, len(speech) + 1)):
        raise ValueError("Chunks must cover every source turn once, in order.")
    bundle = {"source": str(source_path.relative_to(ROOT)),
              "source_sha256": digest(source_path.read_bytes()),
              "spoken_turns": len(speech), "chunks": index,
              "new_api_characters": sum(c["characters"] for c in index if not c["reused"])}
    save_new(PLANS / "index.json", bundle)
    print(json.dumps(bundle, ensure_ascii=False, indent=2))


def payload_for(plan: dict) -> dict:
    payload = {"inputs": radio.dialogue_inputs(plan), "model_id": plan["model_id"],
               "language_code": plan["language_code"], "seed": plan["seed"],
               "apply_text_normalization": "auto"}
    # Keep neighbouring text in the editable plan for direction, not the request:
    # Eleven v3 explicitly rejects previous_text/future_text (verified 2026-09-23).
    return payload


def render_one(plan_path: Path, take: str, key: str, api_validation: dict, seed_override: int | None = None) -> dict:
    plan = json.loads(plan_path.read_text())
    validation = radio.validate(plan)
    folder = OUTPUT / "chunks" / plan["chunk_id"] / take
    manifest_path = folder / "render-manifest.json"
    plan_hash = digest(plan_path.read_bytes())
    requested_seed = plan["seed"] if seed_override is None else seed_override
    if manifest_path.exists():
        old = json.loads(manifest_path.read_text())
        if (old["plan_sha256"] != plan_hash
                or (seed_override is not None and old.get("requested_seed", plan["seed"]) != requested_seed)
                or digest((folder / "dialogue.wav").read_bytes()) != old["wav_sha256"]):
            raise ValueError(f"Existing take does not match its frozen plan/audio: {folder}")
        print(f"REUSED {plan['chunk_id']} {take}", flush=True)
        return old
    if folder.exists() and any(folder.iterdir()):
        raise ValueError(f"Partial/failed take already exists; inspect before choosing a new take: {folder}")
    folder.mkdir(parents=True, exist_ok=True)
    save_new(folder / "plan.json", plan)
    if plan.get("reuse_approved"):
        origin = APPROVED / "sanna-eva"
        old = json.loads((origin / "render-manifest.json").read_text())
        original_plan = json.loads(APPROVED_PLAN.read_text())
        if (digest(APPROVED_PLAN.read_bytes()) != old["plan_sha256"]
                or radio.dialogue_inputs(plan) != radio.dialogue_inputs(original_plan)):
            raise ValueError("Approved reuse requires identical speech, tags and voices; remove reuse_approved for a new take.")
        source_wav = origin / "a1-opening-test.wav"
        if digest(source_wav.read_bytes()) != old["wav_sha256"]:
            raise ValueError("Approved source take changed.")
        shutil.copy2(source_wav, folder / "dialogue.wav")
        shutil.copy2(APPROVED / "a1-opening-test-mixed.wav", folder / "mix.wav")
        shutil.copy2(origin / "qa-transcript.json", folder / "transcript.json")
        shutil.copy2(origin / "qa-transcript.meta.json", folder / "transcript.meta.json")
        save_new(folder / "approved-origin.json", {"wav": str(source_wav),
                 "wav_sha256": old["wav_sha256"], "original_manifest": old,
                 "mix": str(APPROVED / "a1-opening-test-mixed.wav"),
                 "mix_sha256": digest((folder / "mix.wav").read_bytes())})
        response_meta = {"status": "reused_approved", "request_id": old["api_response"].get("request_id")}
        metrics = old["audio"]
    else:
        payload = payload_for(plan)
        payload["seed"] = requested_seed
        save_new(folder / "request.json", payload)
        request = urllib.request.Request(
            radio.API_ROOT + "/v1/text-to-dialogue/with-timestamps?output_format=pcm_24000",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"), method="POST",
            headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "application/json"})
        print(f"RENDER {plan['chunk_id']} {validation['render_characters']} characters", flush=True)
        try:
            with urllib.request.urlopen(request, timeout=300) as response:
                result = json.load(response)
                response_meta = {"status": response.status,
                    "request_id": response.headers.get("request-id") or response.headers.get("x-request-id"),
                    "history_item_id": response.headers.get("history-item-id"),
                    "character_cost": response.headers.get("character-cost")}
            pcm = base64.b64decode(result.pop("audio_base64"), validate=True)
            if not pcm or len(pcm) % 2:
                raise ValueError("Empty or malformed PCM.")
            radio.write_wav(folder / "dialogue.wav", pcm)
            save_new(folder / "alignment.json", result)
            metrics = radio.audio_metrics(pcm)
        except Exception as error:
            detail = error.read().decode("utf-8", "replace") if isinstance(error, urllib.error.HTTPError) else str(error)
            save_new(folder / "error.json", {"type": type(error).__name__, "detail": detail.replace(key, "[REDACTED]")})
            raise RuntimeError(f"Render failed in {folder}: {detail.replace(key, '[REDACTED]')}") from None
    radio.write_readable_script(plan, folder / "render-script.md", validation)
    manifest = {"generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
                "chunk_id": plan["chunk_id"], "take": take,
                "requested_seed": requested_seed,
                "plan_sha256": plan_hash, "validation": validation,
                "api_validation": api_validation, "api_response": response_meta,
                "wav_sha256": digest((folder / "dialogue.wav").read_bytes()),
                "audio": metrics}
    save_new(manifest_path, manifest)
    print(f"DONE {plan['chunk_id']} {metrics['duration_seconds']} seconds", flush=True)
    return manifest


def run_render(args: argparse.Namespace) -> None:
    index = json.loads((PLANS / "index.json").read_text())
    selected = set(args.ids.split(",")) if args.ids else None
    chunks = [c for c in index["chunks"] if selected is None or c["id"] in selected]
    if selected and selected != {c["id"] for c in chunks}:
        raise ValueError("Unknown chunk id.")
    if args.take and not re.fullmatch(r"take-[0-9]{2}", args.take):
        raise ValueError("Use a take name such as take-01 or take-02.")
    if args.seed is not None and not 0 <= args.seed <= 4294967295:
        raise ValueError("Seed must be an unsigned 32-bit integer.")
    selections = json.loads((OUTPUT / "selection.json").read_text()) if (OUTPUT / "selection.json").exists() else {}
    key = radio.api_key()
    api_validation = radio.verify_api(json.loads((ROOT / chunks[0]["plan"]).read_text()), key)
    for chunk in chunks:
        take = args.take or selections.get(chunk["id"], "take-01")
        render_one(ROOT / chunk["plan"], take, key, api_validation, args.seed)


def audit_one(chunk: dict, take: str) -> dict:
    folder = OUTPUT / "chunks" / chunk["id"] / take
    if not (folder / "render-manifest.json").exists():
        return {"chunk": chunk["id"], "status": "not_rendered"}
    if not chunk.get("reused"):
        command = [sys.executable, str(Path(__file__).with_name("transcribe_test.py")),
                   "--audio", str(folder / "dialogue.wav"),
                   "--out", str(folder / "transcript.json"), "--language", "sv"]
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError(f"Transcription {chunk['id']}: {result.stderr}")
    audit_program = Path(__file__).with_name("audit_chunks.py")
    if (folder / "audit.json").exists():
        previous = json.loads((folder / "audit.json").read_text())
        inputs = {"plan": folder / "plan.json", "audio": folder / "dialogue.wav", "transcript": folder / "transcript.json"}
        if (previous.get("audit_program_sha256") == digest(audit_program.read_bytes())
                and all(previous.get("inputs", {}).get(name, {}).get("sha256") == digest(path.read_bytes()) for name, path in inputs.items())):
            return {"chunk": chunk["id"], "status": "audit_cached", "exit_code": 0}
    command = [sys.executable, str(Path(__file__).with_name("audit_chunks.py")),
               "--plan", str(folder / "plan.json"), "--audio", str(folder / "dialogue.wav"),
               "--transcript", str(folder / "transcript.json"), "--out", str(folder / "audit.json")]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(f"Audit {chunk['id']} failed: {result.stderr}")
    if not (folder / "audit.json").exists():
        raise RuntimeError(f"Audit {chunk['id']}: {result.stderr}")
    return {"chunk": chunk["id"], "status": "audited", "exit_code": result.returncode}


def run_audit(args: argparse.Namespace) -> None:
    index = json.loads((PLANS / "index.json").read_text())
    selected = set(args.ids.split(",")) if args.ids else None
    chunks = [c for c in index["chunks"] if selected is None or c["id"] in selected]
    if selected and selected != {c["id"] for c in chunks}:
        raise ValueError("Unknown chunk id.")
    selections = json.loads((OUTPUT / "selection.json").read_text()) if (OUTPUT / "selection.json").exists() else {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        tasks = [pool.submit(audit_one, chunk, args.take or selections.get(chunk["id"], "take-01")) for chunk in chunks]
        for future in concurrent.futures.as_completed(tasks):
            print(json.dumps(future.result(), ensure_ascii=False), flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("prepare")
    render = commands.add_parser("render")
    render.add_argument("--ids", help="Comma-separated chunk IDs; default all. Completed takes are reused.")
    render.add_argument("--take", help="Override selected take; default selection.json or take-01.")
    render.add_argument("--seed", type=int, help="Optional variation for a new take; does not alter frozen plans.")
    audit = commands.add_parser("audit")
    audit.add_argument("--ids")
    audit.add_argument("--take", help="Override selected take; default selection.json or take-01.")
    args = parser.parse_args()
    if args.command == "prepare":
        prepare()
    elif args.command == "render":
        run_render(args)
    else:
        run_audit(args)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, RuntimeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
