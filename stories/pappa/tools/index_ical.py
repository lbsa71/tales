#!/usr/bin/env python3
"""Incrementally index VEVENT records from one or more iCalendar files.

The script uses only the Python standard library. Each source calendar gets a
separate JSONL shard. Unchanged files are detected by path, size, and mtime so
subsequent runs only rebuild shards whose source has changed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Iterator, TextIO


INDEXED_FIELDS = {
    "UID",
    "DTSTART",
    "DTEND",
    "SUMMARY",
    "DESCRIPTION",
    "LOCATION",
    "STATUS",
    "RRULE",
    "RECURRENCE-ID",
}
INDEX_VERSION = 1


def unfold_lines(stream: TextIO) -> Iterator[str]:
    """Yield RFC 5545 content lines with folded continuations joined."""
    pending: str | None = None
    for raw_line in stream:
        line = raw_line.rstrip("\r\n")
        if line.startswith((" ", "\t")) and pending is not None:
            pending += line[1:]
            continue
        if pending is not None:
            yield pending
        pending = line
    if pending is not None:
        yield pending


def unescape(value: str) -> str:
    return (
        value.replace("\\N", "\n")
        .replace("\\n", "\n")
        .replace("\\,", ",")
        .replace("\\;", ";")
        .replace("\\\\", "\\")
    )


def iter_events(path: Path) -> Iterator[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as stream:
        event: dict[str, str] | None = None
        nested_depth = 0
        for line in unfold_lines(stream):
            if line == "BEGIN:VEVENT":
                event = {}
                nested_depth = 0
                continue
            if line == "END:VEVENT":
                if event is not None:
                    yield event
                event = None
                nested_depth = 0
                continue
            if event is not None and line.startswith("BEGIN:"):
                nested_depth += 1
                continue
            if event is not None and line.startswith("END:"):
                nested_depth = max(0, nested_depth - 1)
                continue
            if event is None or nested_depth or ":" not in line:
                continue

            raw_name, value = line.split(":", 1)
            name = raw_name.split(";", 1)[0].upper()
            if name not in INDEXED_FIELDS:
                continue

            decoded = unescape(value).strip()
            if name in event and decoded:
                event[name] += "\n" + decoded
            else:
                event[name] = decoded


def signature(path: Path) -> dict[str, int | str]:
    stat = path.stat()
    return {
        "path": str(path.resolve()),
        "size": stat.st_size,
        "mtime_ns": stat.st_mtime_ns,
    }


def shard_name(path: Path) -> str:
    digest = hashlib.sha1(str(path.resolve()).encode("utf-8")).hexdigest()[:12]
    safe_stem = "".join(ch if ch.isalnum() or ch in "-_" else "_" for ch in path.stem)
    return f"{safe_stem[:80]}_{digest}.jsonl"


def write_shard(source: Path, destination: Path) -> int:
    count = 0
    with destination.open("w", encoding="utf-8", newline="\n") as output:
        for event in iter_events(source):
            event["SOURCE"] = source.name
            output.write(json.dumps(event, ensure_ascii=False, separators=(",", ":")) + "\n")
            count += 1
    return count


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="An .ics file or directory containing .ics files")
    parser.add_argument("output", type=Path, help="Directory for local JSONL index shards")
    parser.add_argument("--force", action="store_true", help="Rebuild every shard")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    sources = [args.source] if args.source.is_file() else sorted(args.source.glob("*.ics"))
    args.output.mkdir(parents=True, exist_ok=True)
    state_path = args.output / "state.json"
    if state_path.exists():
        state = json.loads(state_path.read_text(encoding="utf-8"))
    else:
        state = {}

    next_state: dict[str, dict[str, object]] = {}
    for source in sources:
        key = str(source.resolve())
        current = signature(source)
        shard = args.output / shard_name(source)
        previous = state.get(key, {})
        unchanged = (
            not args.force
            and shard.exists()
            and previous.get("index_version") == INDEX_VERSION
            and previous.get("signature") == current
            and previous.get("shard") == shard.name
        )
        if unchanged:
            count = int(previous.get("events", 0))
            print(f"reuse\t{count}\t{source.name}")
        else:
            count = write_shard(source, shard)
            print(f"scan\t{count}\t{source.name}")
        next_state[key] = {
            "index_version": INDEX_VERSION,
            "signature": current,
            "shard": shard.name,
            "events": count,
        }

    state_path.write_text(
        json.dumps(next_state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
