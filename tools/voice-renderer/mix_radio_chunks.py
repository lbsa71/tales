#!/usr/bin/env python3
"""Mix frozen radio-drama takes locally, preserving an approved opening exactly.

Requires Python's standard library and ffmpeg, but never calls a paid API.
All source PCM survives in order: pauses insert samples, never trim speech.
The cue track uses a global clock, so water loops/fades cross chunk boundaries.
Use a new --revision when takes, cue settings, assets, or this program change.
"""

from __future__ import annotations

import argparse
import array
import bisect
from collections import defaultdict
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import wave


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = ROOT / "dist/stories/the-spare-room/adaptations/audio/sv/chunked-v1"
DEFAULT_INDEX = ROOT / "stories/the-spare-room/adaptations/audio/render-plans/sv-chunks/index.json"
DEFAULT_CUES = ROOT / "stories/the-spare-room/adaptations/audio/render-plans/sv-sound-cues.json"
DEFAULT_APPROVED_AUDIT = ROOT / "dist/stories/the-spare-room/adaptations/audio/sv/a1-opening-test/qa-audit.json"
RATE = 24_000
HANDLE = 6_000
FRAME_BYTES = 2
ALGORITHM = "radio-chunks-global-cue-clock-v1"


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def encoded(value: dict) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")


def sha(path: Path) -> str:
    checksum = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            checksum.update(block)
    return checksum.hexdigest()


def frames(seconds: float) -> int:
    return round(float(seconds) * RATE)


def seconds(frame: int) -> float:
    return round(frame / RATE, 6)


def run(command: list[str]) -> bytes:
    result = subprocess.run(command, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.decode("utf-8", "replace")[-6000:])
    return result.stdout


def save_new(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if path.read_bytes() != content:
            raise ValueError(f"Refusing to replace a differing frozen file: {path}; use a new revision.")
        return
    with path.open("xb") as handle:
        handle.write(content)


def publish_file(temporary: Path, output: Path) -> None:
    """Publish completed bytes without ever replacing a different existing file."""
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        if sha(output) != sha(temporary):
            raise ValueError(f"Refusing to replace existing audio: {output}; use a new revision.")
        return
    # link is atomic and does not replace an existing destination.
    try:
        os.link(temporary, output)
    except FileExistsError:
        if sha(output) != sha(temporary):
            raise ValueError(f"Concurrent differing output: {output}") from None


def read_pcm(path: Path) -> tuple[bytes, int]:
    with wave.open(str(path), "rb") as handle:
        if (handle.getframerate(), handle.getnchannels(), handle.getsampwidth(), handle.getcomptype()) != (RATE, 1, 2, "NONE"):
            raise ValueError(f"Expected 24 kHz, mono, PCM16 WAV: {path}")
        count = handle.getnframes()
        pcm = handle.readframes(count)
    if len(pcm) != count * FRAME_BYTES or not count:
        raise ValueError(f"Empty or truncated WAV: {path}")
    return pcm, count


def write_pcm(path: Path, parts) -> None:
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        for part in parts:
            handle.writeframesraw(part)


def load_chunks(index: dict, output: Path, take: str, selection: dict,
                approved_audit: Path, final_tail: float) -> list[dict]:
    chunks, source_indices = [], []
    for spec in index["chunks"]:
        chunk_id = spec["id"]
        chosen_take = selection.get(chunk_id, take)
        if not re.fullmatch(r"take-[0-9]{2}", chosen_take):
            raise ValueError(f"Invalid take selection for {chunk_id}: {chosen_take}")
        folder = output / "chunks" / chunk_id / chosen_take
        plan_path = folder / "plan.json"
        plan = load(plan_path)
        render_items = [item for item in plan["items"] if item.get("kind") != "comment"]
        source_items = [item for item in render_items if item.get("source_spoken")]
        manifest = load(folder / "render-manifest.json")
        dialogue_path = folder / "dialogue.wav"
        if manifest.get("wav_sha256") != sha(dialogue_path):
            raise ValueError(f"Frozen dialogue checksum differs: {dialogue_path}")
        if manifest.get("plan_sha256") and manifest["plan_sha256"] != sha(plan_path):
            raise ValueError(f"Frozen plan checksum differs: {plan_path}")
        approved = bool(plan.get("reuse_approved") or spec.get("reused"))
        base_path = folder / ("mix.wav" if approved else "dialogue.wav")
        pcm, count = read_pcm(base_path)
        source_times = {}
        if approved:
            audit = load(approved_audit)
            if audit.get("wav_sha256") and audit["wav_sha256"] != sha(base_path):
                raise ValueError("Approved mix differs from the audited mix.")
            lines = audit["checks"]["dry"]["lines"]
            if len(lines) != len(source_items):
                raise ValueError("Approved source timing count differs from its plan.")
            for item, line in zip(source_items, lines):
                if (item["speaker"], item["text"]) != (line["role"], line["text"]):
                    raise ValueError("Approved source text differs from timing audit.")
                source_times[item["source_index"]] = {
                    "start": frames(line["start"] + 2.2), "end": frames(line["end"] + 2.2),
                    "speaker": item["speaker"], "text": item["text"],
                }
            alignment_hash = sha(approved_audit)
            timing_hash = alignment_hash
        else:
            alignment_path = folder / "alignment.json"
            # v3 API timestamps have shown cumulative drift in actual takes.
            # They are provenance only: every physical placement uses fresh ASR.
            audit_path = folder / "audit.json"
            audit = load(audit_path)
            if audit.get("source_coverage", {}).get("exact_match") is not True:
                raise ValueError(f"Source preservation audit failed: {audit_path}")
            audited_inputs = audit.get("inputs", {})
            if (audited_inputs.get("audio", {}).get("sha256") != sha(dialogue_path)
                    or audited_inputs.get("plan", {}).get("sha256") != sha(plan_path)):
                raise ValueError(f"ASR audit does not match selected audio/plan: {audit_path}")
            rows = audit["turns"]
            if len(rows) != len(render_items):
                raise ValueError(f"ASR turn count differs from the plan: {chunk_id}")
            for item, row in zip(render_items, rows):
                if (item["speaker"], item.get("text", "")) != (row["speaker"], row["text"]):
                    raise ValueError(f"ASR audit turn order differs: {chunk_id}")

            def measured(row):
                if not all(isinstance(row.get(edge), (int, float)) for edge in ("start", "end")):
                    return None
                first, last = frames(row["start"]), frames(row["end"])
                if not 0 <= first <= last <= count:
                    raise ValueError(f"ASR timestamp outside selected WAV: {chunk_id}")
                observed_first = frames(row.get("observed_span_start") if row.get("observed_span_start") is not None else row["start"])
                observed_last = frames(row.get("observed_span_end") if row.get("observed_span_end") is not None else row["end"])
                if not 0 <= observed_first <= observed_last <= count:
                    raise ValueError(f"Observed ASR span outside selected WAV: {chunk_id}")
                return {"start": first, "end": last,
                        "observed_span_start": min(first, observed_first),
                        "observed_span_end": max(last, observed_last)}

            for position, item in enumerate(render_items):
                if not item.get("source_spoken"):
                    continue
                row = rows[position]
                timing = measured(row)
                if timing is None:
                    raise ValueError(f"Missing ASR source timing: {chunk_id}, source {item['source_index']}")
                # Lexical edges anchor cues and measure the complete pause.
                # Observed spans also include inserted Ha/Hm/laughter tokens;
                # they protect the whole performed tail when choosing a seam.
                after_end = max(timing["end"], timing["observed_span_end"])
                next_start = count
                following_source_start = count
                uncertain_reaction = False
                for following in range(position + 1, len(render_items)):
                    if render_items[following].get("source_spoken"):
                        next_timing = measured(rows[following])
                        if next_timing is None:
                            raise ValueError("Following source turn has no measured ASR time.")
                        following_source_start = next_timing["start"]
                        break
                for following in range(position + 1, len(render_items)):
                    next_item = render_items[following]
                    if next_item.get("source_spoken") or next_item.get("relative_to_source_index") != item["source_index"]:
                        next_timing = measured(rows[following])
                        next_start = min(next_timing["start"], next_timing["observed_span_start"]) if next_timing else following_source_start
                        break
                    next_timing = measured(rows[following])
                    if next_timing:
                        after_end = max(after_end, next_timing["end"], next_timing["observed_span_end"])
                    if next_timing is None or rows[following].get("missing"):
                        uncertain_reaction = True
                # Reactions may be transcribed as audio events instead of Ha/Hm.
                events = [event for event in audit.get("audio_events", [])
                          if isinstance(event.get("start"), (int, float))
                          and isinstance(event.get("end"), (int, float))
                          and frames(event["start"]) >= timing["end"] - frames(.03)
                          and frames(event["end"]) <= next_start]
                if events:
                    after_end = max(after_end, max(frames(event["end"]) for event in events))
                    if any(re.search(r"laugh|chuckl|gasp|sigh|breath|sniff|sob|cough|throat|skratt|andas|suck|flämt|harkl",
                                     event.get("text", ""), re.I) for event in events):
                        uncertain_reaction = False
                source_times[item["source_index"]] = {
                    **timing, "safe_gap_start": after_end, "safe_gap_end": next_start,
                    "source_timing_confident": not row.get("missing"),
                    "reaction_timing_uncertain": uncertain_reaction,
                    "asr_differences": {name: row.get(name, []) for name in ("missing", "substitutions", "insertions")},
                    "reaction_events_used": events,
                    "speaker": item["speaker"], "text": item["text"],
                }
            alignment_hash = sha(alignment_path)
            timing_hash = sha(audit_path)
        if source_indices and min(source_times) != source_indices[-1] + 1:
            raise ValueError("Selected chunks do not preserve source sequence.")
        source_indices.extend(source_times)
        chunks.append({"id": chunk_id, "section": spec["section"], "take": chosen_take,
                       "folder": folder, "plan": plan, "source_times": source_times,
                       "pcm": pcm, "raw_frames": count, "base_path": base_path,
                       "approved": approved, "lead": 0 if approved else HANDLE,
                       "tail": 0 if approved else HANDLE, "insertions": [],
                       "input_hashes": {"plan": sha(plan_path), "dialogue": sha(dialogue_path),
                                        "base": sha(base_path), "alignment_provenance_only": alignment_hash,
                                        "asr_timing": timing_hash}})
    if source_indices != list(range(1, index["spoken_turns"] + 1)):
        raise ValueError("Selected chunks must cover every source turn exactly once.")
    last = chunks[-1]
    if not last["approved"]:
        last_end = max(timing["end"] for timing in last["source_times"].values())
        last["tail"] = max(HANDLE, frames(final_tail) - (last["raw_frames"] - last_end))
    return chunks


def raw_to_local(chunk: dict, raw: int, edge: str) -> int:
    return chunk["lead"] + raw + sum(
        insertion["frames"] for insertion in chunk["insertions"]
        if insertion["at_raw_frame"] < raw or (edge == "start" and insertion["at_raw_frame"] == raw)
    )


def update_clock(chunks: list[dict]) -> dict[int, dict]:
    clock, cursor = {}, 0
    for chunk in chunks:
        chunk["global_start"] = cursor
        chunk["frames"] = chunk["lead"] + chunk["raw_frames"] + chunk["tail"] + sum(i["frames"] for i in chunk["insertions"])
        for number, timing in chunk["source_times"].items():
            clock[number] = {**timing, "chunk": chunk,
                             "start": cursor + raw_to_local(chunk, timing["start"], "start"),
                             "end": cursor + raw_to_local(chunk, timing["end"], "end")}
        cursor += chunk["frames"]
    return clock


def quiet_cut(chunk: dict, start: int, end: int) -> tuple[int, str]:
    """Require a quiet ASR gap with 60 ms safety margins, or the complete file end."""
    if end == chunk["raw_frames"]:
        return end, "after complete PCM file, including every reaction and final phoneme"
    start, end = start + frames(.06), end - frames(.06)
    if end < start:
        raise ValueError(f"ASR gap leaves no safe pause margin in {chunk['id']}.")
    if end - start < frames(.025):
        raise ValueError(f"ASR gap is too short for a measured quiet seam in {chunk['id']}.")
    pcm = chunk["pcm"]
    samples = array.array("h")
    samples.frombytes(pcm[start * 2:end * 2])
    if sys.byteorder != "little":
        samples.byteswap()
    width = frames(.02)
    best = min(range(0, len(samples) - width + 1, max(1, width // 2)),
               key=lambda pos: sum(value * value for value in samples[pos:pos + width]))
    rms = math.sqrt(sum(value * value for value in samples[best:best + width]) / width)
    if rms > 32768 * 10 ** (-48 / 20):
        raise ValueError(f"No quiet seam below -48 dBFS inside the safe ASR gap in {chunk['id']}.")
    cut = start + best + width // 2
    return cut, "lowest-energy 20 ms window below -48 dBFS inside ASR gap, with 60 ms speech margins"


def apply_pauses(chunks: list[dict], cues: dict) -> tuple[dict, list[dict]]:
    clock = update_clock(chunks)
    reports, seen = [], set()
    for pause in sorted(cues.get("pauses", []), key=lambda item: item["after_turn"]):
        number = pause["after_turn"]
        if number in seen or number not in clock or number + 1 not in clock:
            raise ValueError(f"Invalid or duplicate pause anchor: {number}")
        seen.add(number)
        current, following = clock[number], clock[number + 1]
        minimum = frames(pause.get("minimum_gap_seconds", pause.get("seconds_to_insert", 0)))
        if minimum < 0:
            raise ValueError("Pause minimum must be nonnegative.")
        before = following["start"] - current["end"]
        additional = max(0, minimum - before)
        report = {"after_turn": number, "minimum_gap_seconds": seconds(minimum),
                  "existing_gap_seconds": seconds(before), "inserted_seconds": seconds(additional),
                  "reason": pause.get("reason"), "includes_performed_reactions": True}
        if additional:
            owner = current["chunk"]
            if not current.get("source_timing_confident", True) or not following.get("source_timing_confident", True):
                raise ValueError(f"Pause after {number} touches an ASR turn with missing words; review required.")
            if current.get("reaction_timing_uncertain"):
                raise ValueError(f"Pause after {number} has an unmeasured reaction tail; review required.")
            if owner["approved"]:
                owner = following["chunk"]
                if owner["approved"]:
                    raise ValueError("A requested pause would modify approved audio.")
                cut, method = 0, "before next chunk; approved audio unchanged"
            else:
                raw = owner["source_times"][number]
                cut, method = quiet_cut(owner, raw["safe_gap_start"], raw["safe_gap_end"])
            insertion = {"after_turn": number, "at_raw_frame": cut, "frames": additional,
                         "method": method}
            owner["insertions"].append(insertion)
            owner["insertions"].sort(key=lambda item: item["at_raw_frame"])
            report.update({"chunk": owner["id"], "at_raw_frame": cut, "method": method})
            clock = update_clock(chunks)
        report["resulting_gap_seconds"] = seconds(clock[number + 1]["start"] - clock[number]["end"])
        reports.append(report)
    return clock, reports


def prepare_asset(path: Path, spec: dict, ffmpeg: str) -> tuple[array.array, dict]:
    pcm = run([ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(path),
               "-f", "f32le", "-ac", "1", "-ar", str(RATE), "pipe:1"])
    samples = array.array("f")
    samples.frombytes(pcm)
    if sys.byteorder != "little":
        samples.byteswap()
    if not samples or any(not math.isfinite(value) for value in samples):
        raise ValueError(f"Invalid decoded sound asset: {path}")
    note = {"path": str(path), "sha256": sha(path), "decoded_frames": len(samples),
            "processing": "decode/resample only; original relative gain retained"}
    if "generation" in spec:
        dc = sum(samples) / len(samples)
        samples = array.array("f", (value - dc for value in samples))
        peak = max(abs(value) for value in samples)
        if peak <= 1e-7:
            raise ValueError(f"Silent generated asset: {path}")
        threshold = max(1e-6, peak * .001)
        first = next(index for index, value in enumerate(samples) if abs(value) > threshold)
        last = len(samples) - next(index for index, value in enumerate(reversed(samples)) if abs(value) > threshold)
        first, last = max(0, first - frames(.01)), min(len(samples), last + frames(.01))
        samples = array.array("f", (value * (10 ** (-1 / 20)) / peak for value in samples[first:last]))
        note.update({"processing": "DC removed, edge silence trimmed with 10 ms handles, peak normalized to -1 dBFS",
                     "dc_removed": dc, "trim_start_frames": first, "trim_end_frames": note["decoded_frames"] - last})
    note["processed_frames"] = len(samples)
    note["processed_float32_sha256"] = hashlib.sha256(samples.tobytes()).hexdigest()
    return samples, note


def loop_cycle(samples: array.array, crossfade_frames: int) -> array.array:
    overlap = min(max(0, crossfade_frames), len(samples) // 4)
    if not overlap:
        return samples
    tail = len(samples) - overlap
    blend = array.array("f", (
        samples[tail + index] * (1 - index / overlap) + samples[index] * (index / overlap)
        for index in range(overlap)))
    blend.extend(samples[overlap:tail])
    return blend


def resolve_cues(cues: dict, clock: dict, assets: dict, total_frames: int) -> list[dict]:
    def anchor(value: dict) -> int:
        return clock[value["turn"]][value["edge"]]

    for index, check in cues.get("anchor_checks", {}).items():
        observed = clock[int(index)]
        if (check["speaker"], check["text"]) != (observed["speaker"], observed["text"]):
            raise ValueError(f"Sound cue source anchor changed: {index}")
    result, seen = [], set()
    for cue in cues["cues"]:
        if cue["id"] in seen:
            raise ValueError(f"Duplicate cue id: {cue['id']}")
        seen.add(cue["id"])
        asset = assets[cue["asset_id"]]
        if cue["placement"] == "point":
            start = anchor(cue["anchor"]) + frames(cue.get("offset_seconds", 0))
            end = start + len(asset["samples"])
        elif cue["placement"] == "interval":
            start = anchor(cue["start"]) + frames(cue.get("start_offset_seconds", 0))
            end = anchor(cue["end"]) + frames(cue.get("end_offset_seconds", 0))
        else:
            raise ValueError(f"Unknown cue placement: {cue['placement']}")
        if start < 0 or end <= start or end > total_frames:
            raise ValueError(f"Cue outside global timeline: {cue['id']} ({seconds(start)}, {seconds(end)})")
        fade_in = min(frames(cue.get("fade_in_seconds", 0)), end - start)
        fade_out = min(frames(cue.get("fade_out_seconds", 0)), end - start)
        if cue.get("fade_out_start_not_before"):
            fade_out = min(fade_out, max(0, end - anchor(cue["fade_out_start_not_before"])))
        envelope = cue.get("gain_envelope") or [{"position": 0, "db": 0}, {"position": 1, "db": 0}]
        if (envelope[0]["position"] != 0 or envelope[-1]["position"] != 1
                or any(a["position"] >= b["position"] for a, b in zip(envelope, envelope[1:]))):
            raise ValueError(f"Invalid gain envelope: {cue['id']}")
        result.append({**cue, "global_start_frame": start, "global_end_frame": end,
                       "fade_in_frames": fade_in, "fade_out_frames": fade_out,
                       "envelope": envelope})
    return result


def render_cue_intersection(track: array.array, chunk_start: int, cue: dict, asset: dict) -> dict | None:
    start = max(chunk_start, cue["global_start_frame"])
    end = min(chunk_start + len(track), cue["global_end_frame"])
    if end <= start:
        return None
    source = asset["cycle"] if cue["placement"] == "interval" else asset["samples"]
    duration = cue["global_end_frame"] - cue["global_start_frame"]
    fade_in, fade_out = cue["fade_in_frames"], cue["fade_out_frames"]
    envelope = cue["envelope"]
    positions = [point["position"] for point in envelope]
    static_gain = 10 ** (cue["gain_db"] / 20)
    variable = any(point["db"] != 0 for point in envelope)
    for global_frame in range(start, end):
        relative = global_frame - cue["global_start_frame"]
        gain = static_gain
        if fade_in and relative < fade_in:
            gain *= relative / fade_in
        remaining = duration - 1 - relative
        if fade_out and remaining < fade_out:
            gain *= max(0, remaining / fade_out)
        if variable:
            position = relative / max(1, duration - 1)
            segment = min(len(envelope) - 2, max(0, bisect.bisect_right(positions, position) - 1))
            left, right = envelope[segment:segment + 2]
            factor = (position - left["position"]) / (right["position"] - left["position"])
            gain *= 10 ** ((left["db"] + factor * (right["db"] - left["db"])) / 20)
        track[global_frame - chunk_start] += source[relative % len(source)] * gain
    return {"id": cue["id"], "asset_id": cue["asset_id"],
            "global_start_seconds": seconds(start), "global_end_seconds": seconds(end),
            "local_start_seconds": seconds(start - chunk_start), "local_end_seconds": seconds(end - chunk_start),
            "asset_phase_frame": (start - cue["global_start_frame"]) % len(source),
            "cue_elapsed_frames": start - cue["global_start_frame"],
            "global_cue_start_seconds": seconds(cue["global_start_frame"]),
            "global_cue_end_seconds": seconds(cue["global_end_frame"]),
            "global_fade_in_seconds": seconds(cue["fade_in_frames"]),
            "global_fade_out_seconds": seconds(cue["fade_out_frames"])}


def padded_parts(chunk: dict):
    yield b"\0" * (chunk["lead"] * 2)
    cursor = 0
    for insertion in chunk["insertions"]:
        point = insertion["at_raw_frame"] * 2
        yield chunk["pcm"][cursor:point]
        yield b"\0" * (insertion["frames"] * 2)
        cursor = point
    yield chunk["pcm"][cursor:]
    yield b"\0" * (chunk["tail"] * 2)


def manifest_timeline(chunk: dict) -> list[dict]:
    return [{"source_index": index, "speaker": timing["speaker"], "text": timing["text"],
             "raw_start_seconds": seconds(timing["start"]), "raw_end_seconds": seconds(timing["end"]),
             "raw_observed_span_start_seconds": seconds(timing.get("observed_span_start", timing["start"])),
             "raw_observed_span_end_seconds": seconds(timing.get("observed_span_end", timing["end"])),
             "local_start_seconds": seconds(raw_to_local(chunk, timing["start"], "start")),
             "local_end_seconds": seconds(raw_to_local(chunk, timing["end"], "end")),
             "global_start_seconds": seconds(chunk["global_start"] + raw_to_local(chunk, timing["start"], "start")),
             "global_end_seconds": seconds(chunk["global_start"] + raw_to_local(chunk, timing["end"], "end"))}
            for index, timing in chunk["source_times"].items()]


def mix_chunk(chunk: dict, resolved: list[dict], assets: dict, revision: str,
              recipe_sha: str, scratch: Path, ffmpeg: str) -> dict:
    output = chunk["folder"] / f"{revision}.wav"
    manifest_path = chunk["folder"] / f"{revision}-manifest.json"
    if manifest_path.exists():
        old = load(manifest_path)
        if old["recipe_sha256"] != recipe_sha or not output.exists() or old["wav_sha256"] != sha(output):
            raise ValueError(f"Existing mix revision differs: {manifest_path}; use a new revision.")
        print(f"REUSED {chunk['id']} {revision}", flush=True)
        return old
    intersections = []
    temporary = scratch / f"{chunk['id']}.wav"
    if chunk["approved"]:
        shutil.copyfile(chunk["base_path"], temporary)
    else:
        base = scratch / f"{chunk['id']}-padded.wav"
        write_pcm(base, padded_parts(chunk))
        # Verify every original sample survives, in order, before the gain/mix.
        padded, _ = read_pcm(base)
        offset = chunk["lead"] * 2
        cursor = 0
        restored = hashlib.sha256()
        for insertion in chunk["insertions"]:
            size = (insertion["at_raw_frame"] - cursor) * 2
            restored.update(padded[offset:offset + size])
            offset += size + insertion["frames"] * 2
            cursor = insertion["at_raw_frame"]
        restored.update(padded[offset:offset + (chunk["raw_frames"] - cursor) * 2])
        if restored.hexdigest() != hashlib.sha256(chunk["pcm"]).hexdigest():
            raise ValueError("PCM preservation check failed.")
        track = array.array("f", [0]) * chunk["frames"]
        for cue in resolved:
            part = render_cue_intersection(track, chunk["global_start"], cue, assets[cue["asset_id"]])
            if part:
                intersections.append(part)
        track_path = scratch / f"{chunk['id']}-effects.f32"
        if sys.byteorder != "little":
            track.byteswap()
        with track_path.open("wb") as handle:
            track.tofile(handle)
        run([ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-i", str(base),
             "-f", "f32le", "-ar", str(RATE), "-ac", "1", "-i", str(track_path),
             "-filter_complex", "[0:a]volume=-1.5dB[base];[base][1:a]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.891:attack=5:release=50:level=false:latency=true[out]",
             "-map", "[out]", "-ar", str(RATE), "-ac", "1", "-c:a", "pcm_s16le", str(temporary)])
    _, actual_frames = read_pcm(temporary)
    if actual_frames != chunk["frames"]:
        raise ValueError(f"Mix changed duration: {chunk['id']}: {actual_frames} != {chunk['frames']}")
    publish_file(temporary, output)
    manifest = {"recipe_sha256": recipe_sha, "chunk_id": chunk["id"], "section": chunk["section"],
                "take": chunk["take"], "revision": revision, "path": str(output), "wav_sha256": sha(output),
                "frames": actual_frames, "duration_seconds": seconds(actual_frames),
                "global_start_seconds": seconds(chunk["global_start"]),
                "approved_mix_reused_bit_identically": chunk["approved"],
                "all_source_pcm_preserved_before_gain": True, "input_hashes": chunk["input_hashes"],
                "timing_source": "approved original ASR + 2.2 s" if chunk["approved"] else "word-aligned ASR audit; API timestamps not used for placement",
                "lead_handle_seconds": seconds(chunk["lead"]), "tail_handle_seconds": seconds(chunk["tail"]),
                "silence_insertions": chunk["insertions"], "source_timeline": manifest_timeline(chunk),
                "cue_intersections": intersections,
                "gain_and_limiter": "approved original" if chunk["approved"] else "dialogue -1.5 dB; cue gains from manifest; alimiter limit=0.891 level=false latency=true"}
    save_new(manifest_path, encoded(manifest))
    print(f"MIXED {chunk['id']} {seconds(actual_frames):.2f}s", flush=True)
    return manifest


def concat_wav(paths: list[Path], output: Path) -> int:
    count = 0
    with wave.open(str(output), "wb") as target:
        target.setnchannels(1)
        target.setsampwidth(2)
        target.setframerate(RATE)
        for path in paths:
            with wave.open(str(path), "rb") as source:
                count += source.getnframes()
                while block := source.readframes(48_000):
                    target.writeframesraw(block)
    return count


def assemble(manifests: list[dict], target: Path, scratch: Path, recipe_sha: str,
             pauses: list[dict], cues: list[dict], asset_notes: dict, ffmpeg: str) -> dict:
    target.mkdir(parents=True, exist_ok=True)
    manifest_path = target / "manifest.json"
    if manifest_path.exists():
        old = load(manifest_path)
        if old["recipe_sha256"] != recipe_sha:
            raise ValueError("Full mix revision has a different recipe; choose a new revision.")
        if any(not Path(item["path"]).exists() or sha(Path(item["path"])) != item["sha256"] for item in old["files"]):
            raise ValueError("A completed full mix output changed.")
        return old
    chunk_paths = [Path(item["path"]) for item in manifests]
    full_temp = scratch / "full.wav"
    total = concat_wav(chunk_paths, full_temp)
    full_output = target / "gastrummet-sv.wav"
    publish_file(full_temp, full_output)
    mp3_temp = scratch / "full.mp3"
    run([ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-i", str(full_temp),
         "-c:a", "libmp3lame", "-b:a", "128k", str(mp3_temp)])
    mp3_output = target / "gastrummet-sv.mp3"
    publish_file(mp3_temp, mp3_output)
    files = [full_output, mp3_output]
    sections = defaultdict(list)
    for item in manifests:
        sections[item["section"]].append(Path(item["path"]))
    for section, paths in sections.items():
        wav = scratch / f"{section}.wav"
        mp3 = scratch / f"{section}.mp3"
        concat_wav(paths, wav)
        run([ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-i", str(wav),
             "-c:a", "libmp3lame", "-b:a", "128k", str(mp3)])
        destination = target / f"{section.lower()}-sv.mp3"
        publish_file(mp3, destination)
        files.append(destination)
    playlist = ["#EXTM3U"]
    for item in manifests:
        playlist.extend([f"#EXTINF:{item['duration_seconds']:.3f},{item['chunk_id']}",
                         os.path.relpath(item["path"], target)])
    playlist_path = target / "chunks.m3u"
    save_new(playlist_path, ("\n".join(playlist) + "\n").encode("utf-8"))
    files.append(playlist_path)
    manifest = {"recipe_sha256": recipe_sha, "frames": total, "duration_seconds": seconds(total),
                "chunks": manifests, "pauses": pauses, "resolved_cues": cues,
                "assets": asset_notes, "files": [{"path": str(path), "sha256": sha(path)} for path in files],
                "mix_notes": ["No source PCM trimmed or time-stretched.",
                              "Approved first chunk copied exactly; its original effects are not remixed.",
                              "Other chunks retain full original audio plus 0.25 s handles and any missing minimum pause time.",
                              "Final tail meets the cue manifest minimum after the last source turn.",
                              "Water phase and envelopes use global positions, with no chunk-edge fade.",
                              "Inserted silent samples are digital silence; no new room-tone asset was invented."]}
    save_new(manifest_path, encoded(manifest))
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--index", type=Path, default=DEFAULT_INDEX)
    parser.add_argument("--cues", type=Path, default=DEFAULT_CUES)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--approved-audit", type=Path, default=DEFAULT_APPROVED_AUDIT)
    parser.add_argument("--selection", type=Path, help="JSON mapping chunk IDs to take names; defaults to OUTPUT/selection.json if present")
    parser.add_argument("--take", default="take-01")
    parser.add_argument("--revision", default="mix-v1")
    args = parser.parse_args()
    if not re.fullmatch(r"mix-[a-z0-9][a-z0-9-]*", args.revision):
        parser.error("Use a revision such as mix-v1 or mix-v2.")
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg is required.")
    output = args.output.resolve()
    selection_path = args.selection or output / "selection.json"
    selection = load(selection_path) if selection_path.exists() else {}
    index, cue_plan = load(args.index), load(args.cues)
    unknown = set(selection) - {chunk["id"] for chunk in index["chunks"]}
    if unknown:
        raise ValueError(f"Unknown selected chunk IDs: {sorted(unknown)}")
    chunks = load_chunks(index, output, args.take, selection, args.approved_audit,
                         cue_plan.get("mix", {}).get("tail_seconds", 3.5))
    clock, pauses = apply_pauses(chunks, cue_plan)
    assets, asset_notes = {}, {}
    for asset_id, spec in cue_plan["assets"].items():
        path = output / "assets" / f"{asset_id}.mp3"
        if not path.exists():
            raise ValueError(f"Missing pre-generated asset: {path}")
        samples, note = prepare_asset(path, spec, ffmpeg)
        cycle = loop_cycle(samples, frames(spec.get("loop_crossfade_seconds", 0)))
        assets[asset_id] = {"samples": samples, "cycle": cycle}
        note["loop_cycle_frames"] = len(cycle)
        asset_notes[asset_id] = note
    total_frames = sum(chunk["frames"] for chunk in chunks)
    resolved = resolve_cues(cue_plan, clock, assets, total_frames)
    recipe = {"algorithm": ALGORITHM, "program_sha256": sha(Path(__file__)),
              "index_sha256": sha(args.index), "cues_sha256": sha(args.cues),
              "selected_takes": {chunk["id"]: chunk["take"] for chunk in chunks},
              "chunks": {chunk["id"]: chunk["input_hashes"] for chunk in chunks},
              "asset_processing": asset_notes, "pauses": pauses,
              "resolved_cues": resolved, "sample_rate_hz": RATE, "dialogue_gain_db": -1.5}
    recipe_sha = hashlib.sha256(encoded(recipe)).hexdigest()
    revision_dir = output / "mixes" / args.revision
    save_new(revision_dir / "recipe.json", encoded(recipe))
    # Keep scratch on the same filesystem as the immutable destinations for atomic links.
    with tempfile.TemporaryDirectory(prefix=f".{args.revision}-", dir=output) as temp:
        scratch = Path(temp)
        manifests = [mix_chunk(chunk, resolved, assets, args.revision, recipe_sha, scratch, ffmpeg) for chunk in chunks]
        result = assemble(manifests, revision_dir, scratch, recipe_sha, pauses, resolved, asset_notes, ffmpeg)
    print(json.dumps({"manifest": str(revision_dir / "manifest.json"),
                      "duration_seconds": result["duration_seconds"],
                      "chunks": len(result["chunks"]), "outputs": result["files"]}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, RuntimeError, wave.Error) as error:
        print(f"Mix failed: {error}", file=sys.stderr)
        raise SystemExit(1)
