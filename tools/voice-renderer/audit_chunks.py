#!/usr/bin/env python3
"""Audit a dialogue plan against an existing word-timed ASR transcript and WAV.

No API calls. Exit 0 means the audit ran, not that the performance passed.
Reports distinguish exact plan/source preservation, ASR evidence, and tentative
voice clustering. ASR differences require listening; they do not prove a TTS error.
"""

from __future__ import annotations

import argparse
import array
from collections import Counter, defaultdict
import datetime as dt
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import unicodedata
import uuid
import wave


REPO_ROOT = Path(__file__).resolve().parents[2]
WORD = re.compile(r"[^\W_]+(?:['’][^\W_]+)*", re.UNICODE)
SPOKEN = re.compile(r"\*\*([^:*]+):\*\* (.*)")
SV_VARIANTS = {
    "sen": "sedan", "nån": "någon", "nånting": "någonting", "nåt": "något",
    "mej": "mig", "dej": "dig", "sej": "sig",
}
SV_PHRASES = {
    ("i", "dag"): "idag", ("i", "går"): "igår",
    ("i", "morgon"): "imorgon", ("i", "kväll"): "ikväll",
    ("i", "stället"): "istället",
    ("så", "här"): "såhär", ("där", "ute"): "därute",
    ("här", "inne"): "härinne", ("i", "morse"): "imorse",
    ("i", "gång"): "igång", ("där", "borta"): "därborta",
}


def read_json(path: Path) -> dict:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"Expected a JSON object: {path}")
    return value


def digest(path: Path) -> str:
    checksum = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            checksum.update(block)
    return checksum.hexdigest()


def tokenize(text: str, **metadata) -> list[dict]:
    return [
        {"token": match.group().replace("’", "'"), "raw": match.group(), **metadata}
        for match in WORD.finditer(unicodedata.normalize("NFC", text).casefold())
    ]


def canonicalize(tokens: list[dict], swedish: bool) -> list[dict]:
    if not swedish:
        return [dict(token) for token in tokens]
    result = []
    index = 0
    while index < len(tokens):
        token = dict(tokens[index])
        if index + 1 < len(tokens):
            following = tokens[index + 1]
            phrase = (token["token"], following["token"])
            # Never merge different planned turns or different detected speakers.
            if (
                phrase in SV_PHRASES
                and token.get("turn") == following.get("turn")
                and token.get("speaker_id") == following.get("speaker_id")
            ):
                token["token"] = SV_PHRASES[phrase]
                token["raw"] += " " + following["raw"]
                token["end"] = following.get("end")
                index += 1
        token["token"] = SV_VARIANTS.get(token["token"], token["token"])
        result.append(token)
        index += 1
    return result


def align(expected: list[dict], observed: list[dict]) -> list[tuple[str, int | None, int | None]]:
    """Global unit-cost token Levenshtein alignment, with deterministic ties.

    Ties prefer diagonal, then deletion, then insertion. Repeated short replies
    can have ambiguous alignments; resulting times are estimates from ASR.
    """
    n, m = len(expected), len(observed)
    if n * m > 25_000_000:
        raise ValueError("Alignment is too large; audit individual rendered chunks.")
    back = [bytearray([2]) * (m + 1)]
    previous = list(range(m + 1))
    for i in range(1, n + 1):
        row = [i] + [0] * m
        directions = bytearray(m + 1)
        directions[0] = 1
        for j in range(1, m + 1):
            cost = expected[i - 1]["token"] != observed[j - 1]["token"]
            options = (previous[j - 1] + cost, previous[j] + 1, row[j - 1] + 1)
            choice = min(range(3), key=options.__getitem__)
            row[j] = options[choice]
            directions[j] = choice
        back.append(directions)
        previous = row
    operations = []
    i, j = n, m
    while i or j:
        direction = back[i][j]
        if i and j and direction == 0:
            name = "match" if expected[i - 1]["token"] == observed[j - 1]["token"] else "substitution"
            operations.append((name, i - 1, j - 1))
            i, j = i - 1, j - 1
        elif i and (not j or direction == 1):
            operations.append(("deletion", i - 1, None))
            i -= 1
        else:
            operations.append(("insertion", None, j - 1))
            j -= 1
    return list(reversed(operations))


def alignment_metrics(expected: list[dict], observed: list[dict], operations: list) -> dict:
    counts = Counter(operation[0] for operation in operations)
    errors = sum(counts[name] for name in ("substitution", "deletion", "insertion"))
    return {
        "expected_tokens": len(expected), "observed_tokens": len(observed),
        "matches": counts["match"], "substitutions": counts["substitution"],
        "missing_tokens": counts["deletion"], "inserted_tokens": counts["insertion"],
        "token_error_rate": round(errors / len(expected), 6) if expected else None,
        "matched_expected_fraction": round(counts["match"] / len(expected), 6) if expected else None,
    }


def source_coverage(plan: dict, turns: list[dict]) -> dict:
    source = plan.get("source", {})
    items = [turn for turn in turns if turn["source_spoken"]]
    result = {"planned_source_turns": len(items), "exact_match": None, "issues": []}
    if not source.get("path"):
        result["issues"].append("No source path supplied; exact source preservation is unverified.")
        return result
    path = Path(source["path"])
    path = path if path.is_absolute() else REPO_ROOT / path
    if not path.is_file():
        result["issues"].append(f"Source file unavailable: {path}")
        return result
    lines = path.read_text(encoding="utf-8").splitlines()
    all_source = [(match[1], match[2]) for line in lines if (match := SPOKEN.fullmatch(line))]
    actual = [(item["speaker"], item["text"]) for item in items]
    indices = [item.get("source_index") for item in items]
    if items and all(isinstance(index, int) and not isinstance(index, bool) for index in indices):
        if any(index < 1 or index > len(all_source) for index in indices):
            expected = []
            result["issues"].append("A source_index is outside the source transcript.")
        else:
            expected = [all_source[index - 1] for index in indices]
        if indices != list(range(indices[0], indices[0] + len(indices))):
            result["issues"].append("Source indices are not consecutive and increasing within this chunk.")
        result["source_indices"] = indices
        result["method"] = "one_based_global_source_indices"
    elif source.get("section_anchor") and source.get("end_anchor"):
        try:
            start = lines.index(source["section_anchor"])
            end = lines.index(source["end_anchor"], start)
        except ValueError:
            result["issues"].append("Source start/end anchor not found.")
            expected = []
        else:
            expected = [(match[1], match[2]) for line in lines[start:end + 1]
                        if (match := SPOKEN.fullmatch(line))]
        result["method"] = "source_anchors"
    else:
        result["issues"].append("No complete source indices or source anchors supplied.")
        return result
    result["source_path"] = str(path.resolve())
    result["source_sha256"] = digest(path)
    result["expected_source_turns"] = len(expected)
    if source.get("expected_spoken_lines") is not None and len(items) != source["expected_spoken_lines"]:
        result["issues"].append("Planned source turn count differs from expected_spoken_lines.")
    result["mismatches"] = [
        {"chunk_source_turn": index + 1,
         "source": expected[index] if index < len(expected) else None,
         "plan": actual[index] if index < len(actual) else None}
        for index in range(max(len(expected), len(actual)))
        if (expected[index] if index < len(expected) else None) != (actual[index] if index < len(actual) else None)
    ]
    result["exact_match"] = actual == expected and not result["issues"]
    return result


def wav_metrics(path: Path) -> dict:
    with wave.open(str(path), "rb") as handle:
        channels, width, rate, frames, compression, _ = handle.getparams()
        if compression != "NONE" or width not in (1, 2, 3, 4) or not frames:
            raise ValueError("WAV must contain nonempty uncompressed 8/16/24/32-bit PCM.")
        content = handle.readframes(frames)
    if len(content) != frames * channels * width:
        raise ValueError("WAV PCM is shorter than its declared frame count.")
    if width in (2, 4):
        samples = array.array("h" if width == 2 else "i")
        samples.frombytes(content)
        if sys.byteorder != "little":
            samples.byteswap()
    elif width == 1:
        samples = [sample - 128 for sample in content]
    else:
        samples = [int.from_bytes(content[i:i + 3], "little", signed=True)
                   for i in range(0, len(content), 3)]
    full_scale = 2 ** (8 * width - 1)
    peak = max(abs(sample) for sample in samples)
    rms = math.sqrt(sum(sample * sample for sample in samples) / len(samples))
    at_rail = sum(sample in (-full_scale, full_scale - 1) for sample in samples)
    return {
        "duration_seconds": round(frames / rate, 6), "sample_rate_hz": rate,
        "channels": channels, "sample_width_bits": width * 8, "frames": frames,
        "sample_count": len(samples), "peak_amplitude": peak,
        "peak_dbfs": round(20 * math.log10(peak / full_scale), 4) if peak else None,
        "rms_dbfs": round(20 * math.log10(rms / full_scale), 4) if rms else None,
        "full_scale_sample_count": at_rail,
        "full_scale_sample_fraction": round(at_rail / len(samples), 9),
        "near_full_scale_sample_count": sum(abs(sample) >= full_scale * .99 for sample in samples),
        "non_silent": bool(peak),
        "note": "Rail samples flag possible clipping; they do not establish audible distortion.",
    }


def voice_audit(turn_reports: list[dict]) -> dict:
    roles = defaultdict(list)
    for turn in turn_reports:
        if turn["source_spoken"]:
            roles[turn["speaker"]].append(turn)
    report, dominant_roles = {}, defaultdict(list)
    for role, turns in roles.items():
        counts = Counter()
        for turn in turns:
            counts.update(turn["matched_token_speakers"])
        dominant, count = counts.most_common(1)[0] if counts else (None, 0)
        total = sum(counts.values())
        substantial_turns = sum(sum(turn["matched_token_speakers"].values()) >= 4 for turn in turns)
        adequate = substantial_turns >= 2 and total >= 12
        fraction = count / total if total else None
        report[role] = {
            "source_turns": len(turns), "substantial_turns": substantial_turns,
            "matched_token_speaker_counts": dict(counts), "majority_speaker_id": dominant,
            "majority_fraction": round(fraction, 4) if fraction is not None else None,
            "evidence": "adequate_for_heuristic" if adequate else "uncertain_short_or_single_turn_role",
            "possible_instability": bool(adequate and fraction < .85),
        }
        if dominant:
            dominant_roles[dominant].append(role)
        for turn in turns:
            turn["differs_from_role_majority"] = (
                turn["majority_speaker_id"] != dominant if turn["majority_speaker_id"] and dominant else None
            )
            turn["speaker_evidence_uncertain"] = sum(turn["matched_token_speakers"].values()) < 4
    merges = [
        {"speaker_id": speaker, "roles": shared,
         "uncertain": any(report[role]["evidence"] != "adequate_for_heuristic" for role in shared)}
        for speaker, shared in dominant_roles.items() if len(shared) > 1
    ]
    return {
        "roles": report, "possible_role_merges": merges,
        "method": "Token-weighted majority of aligned matching words; IDs are arbitrary within each chunk.",
        "limitations": "ASR clusters are not cast identities. Consistently swapped voices cannot be detected this way. Short roles and one-line roles remain uncertain; listening is required.",
        "thresholds": {"minimum_substantial_turns": 2, "substantial_turn_min_words": 4,
                       "minimum_role_words": 12, "stability_majority_fraction": .85},
    }


def audit(plan: dict, transcript: dict, audio: Path) -> dict:
    turns, expected = [], []
    for index, item in enumerate(plan["items"], 1):
        if item.get("kind") == "comment":
            continue
        turn = {"plan_item": index, "kind": item.get("kind"),
                "speaker": item.get("speaker"), "text": item.get("text", ""),
                "source_spoken": item.get("source_spoken") is True,
                "source_index": item.get("source_index")}
        tokens = tokenize(re.sub(r"\[[^\]]*\]", "", turn["text"]), turn=len(turns))
        turns.append(turn)
        expected.extend(tokens)
    if not expected:
        raise ValueError("Plan contains no lexical tokens to audit.")
    observed, events = [], []
    for word in transcript.get("words", []):
        if word.get("type") == "audio_event":
            events.append({key: word.get(key) for key in ("text", "start", "end", "speaker_id")})
        elif word.get("type") == "word":
            observed.extend(tokenize(word.get("text", ""), start=word.get("start"),
                                     end=word.get("end"), speaker_id=word.get("speaker_id")))
    word_timing_available = bool(observed)
    if not observed:
        observed = tokenize(transcript.get("text", ""), start=None, end=None, speaker_id=None)
    strict_ops = align(expected, observed)
    swedish = plan.get("language_code", "sv") in ("sv", "swe")
    normalized_expected = canonicalize(expected, swedish)
    normalized_observed = canonicalize(observed, swedish)
    operations = align(normalized_expected, normalized_observed)
    turn_reports = [{**turn, "expected_tokens": 0, "matched_tokens": 0,
                     "missing": [], "substitutions": [], "insertions": [],
                     "normalized_variants": [], "matched_token_speakers": Counter(),
                     "_observed": [], "_lexical_timing": []} for turn in turns]
    for token in normalized_expected:
        turn_reports[token["turn"]]["expected_tokens"] += 1
    previous_turn = 0
    for operation, e_index, o_index in operations:
        reference = normalized_expected[e_index] if e_index is not None else None
        heard = normalized_observed[o_index] if o_index is not None else None
        turn_index = reference["turn"] if reference else previous_turn
        previous_turn = turn_index
        turn = turn_reports[turn_index]
        detail = {"expected": reference["raw"] if reference else None,
                  "observed": heard["raw"] if heard else None,
                  "start": heard.get("start") if heard else None,
                  "end": heard.get("end") if heard else None,
                  "speaker_id": heard.get("speaker_id") if heard else None}
        if heard:
            turn["_observed"].append(heard)
            if operation != "insertion":
                turn["_lexical_timing"].append(heard)
        if operation == "match":
            turn["matched_tokens"] += 1
            if heard.get("speaker_id") is not None:
                turn["matched_token_speakers"][str(heard["speaker_id"])] += 1
            if reference["raw"] != heard["raw"]:
                turn["normalized_variants"].append(detail)
        else:
            field = {"deletion": "missing", "substitution": "substitutions", "insertion": "insertions"}[operation]
            turn[field].append(detail)
    for turn in turn_reports:
        aligned = turn.pop("_observed")
        lexical_timing = turn.pop("_lexical_timing")
        all_starts = [token["start"] for token in aligned if isinstance(token.get("start"), (int, float))]
        all_ends = [token["end"] for token in aligned if isinstance(token.get("end"), (int, float))]
        turn["observed_span_start"] = min(all_starts) if all_starts else None
        turn["observed_span_end"] = max(all_ends) if all_ends else None
        starts = [token["start"] for token in lexical_timing if isinstance(token.get("start"), (int, float))]
        ends = [token["end"] for token in lexical_timing if isinstance(token.get("end"), (int, float))]
        turn["start"] = min(starts) if starts else None
        turn["end"] = max(ends) if ends else None
        turn["asr_span_text"] = " ".join(token["raw"] for token in aligned)
        counts = turn["matched_token_speakers"]
        turn["majority_speaker_id"] = counts.most_common(1)[0][0] if counts else None
        turn["matched_token_speakers"] = dict(counts)
        turn["all_expected_tokens_matched"] = not turn["missing"] and not turn["substitutions"]
        turn["asr_fidelity_review_needed"] = not turn["all_expected_tokens_matched"] or bool(turn["insertions"])
    source_turns = [turn for turn in turn_reports if turn["source_spoken"]]
    source_tokens = sum(turn["expected_tokens"] for turn in source_turns)
    return {
        "source_coverage": source_coverage(plan, turns),
        "spoken_fidelity": {
            "strict_lexical": alignment_metrics(expected, observed, strict_ops),
            "normalized": alignment_metrics(normalized_expected, normalized_observed, operations),
            "source_turn_count": len(source_turns),
            "source_turns_all_expected_tokens_matched": sum(turn["all_expected_tokens_matched"] for turn in source_turns),
            "source_turns_with_insertions": sum(bool(turn["insertions"]) for turn in source_turns),
            "source_tokens": source_tokens,
            "source_matched_token_fraction": round(sum(turn["matched_tokens"] for turn in source_turns) / source_tokens, 6) if source_tokens else None,
            "word_timing_available": word_timing_available,
            "limitations": "Both passes ignore punctuation and case. Normalized coverage is ASR evidence, not proof of verbatim speech. Added planned reactions are aligned but excluded from source-turn totals. Insertions between turns attach to the preceding turn (or first turn at the beginning); attribution and short repeated-line timing can be ambiguous. Start/end use only matched or substituted expected tokens; observed_span_start/end also include insertions and protect extra vocal tails during editing.",
        },
        "normalization": {
            "language": "sv" if swedish else "other",
            "base": "Unicode NFC, lowercase, punctuation removed; apostrophes retained.",
            "swedish_word_variants": {key: value for key, value in SV_VARIANTS.items() if key != value} if swedish else {},
            "swedish_spacing_variants": {" ".join(key): value for key, value in SV_PHRASES.items()} if swedish else {},
            "note": "No name, de/dem/dom, number, synonym, or semantic normalization. Sen/sedan can differ in other contexts; accepted variants remain listed per turn for review.",
        },
        "voice_qa": voice_audit(turn_reports), "turns": turn_reports,
        "audio_events": events, "audio": wav_metrics(audio),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan", required=True, type=Path)
    parser.add_argument("--transcript", required=True, type=Path)
    parser.add_argument("--audio", required=True, type=Path)
    parser.add_argument("--out", type=Path, help="Optional complete JSON report; stdout otherwise")
    args = parser.parse_args()
    paths = {name: getattr(args, name).resolve() for name in ("plan", "transcript", "audio")}
    if args.out and args.out.resolve() in paths.values():
        parser.error("Report output must not overwrite an input.")
    report = audit(read_json(paths["plan"]), read_json(paths["transcript"]), paths["audio"])
    report["created_utc"] = dt.datetime.now(dt.timezone.utc).isoformat()
    report["audit_program_sha256"] = digest(Path(__file__))
    report["inputs"] = {name: {"path": str(path), "sha256": digest(path)} for name, path in paths.items()}
    metadata_path = paths["transcript"].with_suffix(".meta.json")
    protected = {metadata_path, *paths.values()}
    if report["source_coverage"].get("source_path"):
        protected.add(Path(report["source_coverage"]["source_path"]))
    if args.out and args.out.resolve() in protected:
        parser.error("Report output must not overwrite source text or transcript metadata.")
    provenance = {"metadata_path": str(metadata_path), "audio_checksum_matches": None}
    if metadata_path.exists():
        metadata = read_json(metadata_path)
        provenance["audio_checksum_matches"] = metadata.get("input_sha256") == report["inputs"]["audio"]["sha256"]
        provenance["status"] = metadata.get("status")
        provenance["speaker_count_forced"] = metadata.get("speaker_count_forced")
    report["transcript_provenance"] = provenance
    report["review_required"] = (
        report["source_coverage"]["exact_match"] is not True
        or any(turn["asr_fidelity_review_needed"] for turn in report["turns"] if turn["source_spoken"])
        or any(turn["insertions"] for turn in report["turns"])
        or bool(report["voice_qa"]["possible_role_merges"])
        or any(role["possible_instability"] for role in report["voice_qa"]["roles"].values())
        or not report["audio"]["non_silent"] or report["audio"]["full_scale_sample_count"] > 0
        or provenance["audio_checksum_matches"] is False
    )
    serialized = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        output = args.out.resolve()
        output.parent.mkdir(parents=True, exist_ok=True)
        temporary = output.with_name(output.name + "." + uuid.uuid4().hex + ".tmp")
        try:
            temporary.write_text(serialized, encoding="utf-8")
            temporary.replace(output)
        finally:
            temporary.unlink(missing_ok=True)
        print(json.dumps({"report": str(output), "review_required": report["review_required"],
                          "exact_source_match": report["source_coverage"]["exact_match"],
                          "fidelity": report["spoken_fidelity"], "audio": report["audio"]},
                         ensure_ascii=False, indent=2))
    else:
        print(serialized, end="")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, wave.Error) as error:
        print(f"Audit failed: {error}", file=sys.stderr)
        raise SystemExit(2)
