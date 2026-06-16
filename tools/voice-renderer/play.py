#!/usr/bin/env python3
"""
play.py — multi-voice renderer for the SEEM radio play.

Where reader.py renders one chapter in one voice, play.py renders a
three-stream audio-drama script (compiled/seem.md or a single
chapters/episode_*.md) into many voices and stitches them back in
document order.

The page format (see stories/seem/README.md "HOW TO READ THE PAGE"):
  - **Bold paragraphs**      = sound design / stage direction. NOT spoken.
  - `SPEAKER: text`          = an utterance (NARRATOR, DANIEL, CHORD, ...).
  - `SPEAKER *(STREAM — cue):* text`
                             = utterance with an explicit stream
                               (SURFACE / CHORD / HIM) and an opening
                               delivery cue.
  - inline `*(beat)*`        = a pause (there are ~500 of them).
  - inline `*(very quiet)*`  = a delivery cue → mapped to an eleven_v3
                               audio tag, or dropped if it's prose.
  - `---`                    = scene break (a longer silence).

Casting lives in stories/seem/cast.json: it maps a voice key
(`NARRATOR`, `DANIEL@SURFACE`, `DANIEL@HIM`, `CHORD`, ...) to a voice_id
plus per-voice settings, and carries the cueMap / beat style.

Subcommands:
  parse   Show the parsed elements (utterances, sfx, scene breaks) and the
          cleaned TTS text — no API calls. Run this first.
  cast    Resolve every utterance to a cast voice; flag any unmapped
          speaker/stream so casting gaps are visible. No API calls.
  synth   Render each utterance to a per-utterance .pcm (content-hash
          cached, exactly like reader.py synth).
  mix     Stitch the rendered utterances into one sequential mixdown,
          with gaps for beats, scene breaks and sound-design blocks.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

# Reuse reader.py's TTS + audio primitives (same directory).
sys.path.insert(0, str(Path(__file__).resolve().parent))
import reader  # noqa: E402

REPO_ROOT = reader.REPO_ROOT

# Streams that can appear in a `SPEAKER *(STREAM — ...):*` prefix. A stream
# refines how a speaker is voiced (DANIEL out loud vs DANIEL's interior).
STREAMS = {"SURFACE", "CHORD", "HIM", "HER", "NARRATOR"}

# A speaker line: caps name, then either `*(paren):*` or a bare `:`.
SPEAKER_RE = re.compile(
    r"^(?P<speaker>[A-ZÅÄÖ][A-ZÅÄÖ ]{0,20}?)"
    r"(?:\s*\*\((?P<paren>[^)]*)\):\*|:)"
    r"\s*(?P<text>.*)$",
    re.S,
)

# Inline `*(...)*` cue (NOT a speaker prefix — those end in `):*`).
CUE_RE = re.compile(r"\*\((?P<cue>[^)]*?)\)\*")


@dataclass
class Element:
    kind: str               # "utterance" | "sfx" | "scene_break" | "episode"
    index: int
    # utterance:
    speaker: str | None = None
    stream: str | None = None
    voice_key: str | None = None
    raw_text: str = ""      # text as written (after the speaker label)
    tts_text: str = ""      # cleaned text actually sent to TTS
    cues: list[str] = field(default_factory=list)   # cues seen (mapped or dropped)
    dropped_cues: list[str] = field(default_factory=list)
    tape: int = 0           # STAY: which tape (1..7) this element belongs to
    # sfx / episode:
    note: str = ""          # bold sound-design text, or episode title


def _strip_md(s: str) -> str:
    """Drop bold/italic emphasis markers but keep the words. Cue parens and
    beats are handled before this runs."""
    s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)   # **bold** -> bold
    s = re.sub(r"\*(.+?)\*", r"\1", s)        # *emph* -> emph
    s = re.sub(r"`([^`]*)`", r"\1", s)        # `code` -> code
    return re.sub(r"[ \t]+", " ", s).strip()


def clean_tts_text(raw: str, cue_map: dict, beat_repr: str) -> tuple[str, list[str], list[str]]:
    """Turn an utterance's raw text into what TTS should speak.

    - `*(beat)*` and friends -> a pause (beat_repr, e.g. an ellipsis).
    - mapped delivery cues   -> their eleven_v3 audio tag, inlined.
    - unmapped cues          -> dropped (recorded for the report).
    Returns (tts_text, used_cues, dropped_cues).
    """
    used: list[str] = []
    dropped: list[str] = []

    def repl(m: re.Match) -> str:
        cue = m.group("cue").strip().lower()
        # beats / breaths -> a pause
        if cue in BEAT_CUES:
            return beat_repr
        # mapped emotional cue -> audio tag
        if cue in cue_map:
            used.append(cue)
            return f" {cue_map[cue]} "
        dropped.append(cue)
        return " "

    text = CUE_RE.sub(repl, raw)
    text = _strip_md(text)
    # collapse the artefacts of removed cues
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"[ \t]+", " ", text).strip()
    return text, used, dropped


# Beat-like cues collapse to a pause rather than a tag.
BEAT_CUES = {
    "beat", "a beat", "a long beat", "another beat", "a small beat",
    "a small dry beat", "a breath", "a breath, then", "a long breath",
    "long pause", "pause", "a pause",
}


def default_voice_key(speaker: str, stream: str | None) -> str:
    """Cast key for an utterance. A stream that meaningfully re-voices a
    speaker (CHORD, HIM) is appended; the default room stream (SURFACE) and
    NARRATOR's own stream are not."""
    speaker = speaker.strip().upper()
    if stream and stream in ("HIM", "CHORD", "HER") and stream != speaker:
        return f"{speaker}@{stream}"
    return speaker


def split_episode(text: str, episode: int | None) -> str:
    """If a multi-episode compiled file is passed, slice out one episode."""
    if episode is None:
        return text
    lines = text.splitlines()
    starts = [i for i, ln in enumerate(lines) if re.match(r"^#\s+Episode\s+\d+", ln)]
    if not starts:
        return text
    idx = {int(re.match(r"^#\s+Episode\s+(\d+)", lines[i]).group(1)): i for i in starts}
    if episode not in idx:
        raise SystemExit(f"episode {episode} not found (have {sorted(idx)})")
    start = idx[episode]
    later = [i for i in starts if i > start]
    end = later[0] if later else len(lines)
    return "\n".join(lines[start:end])


def parse_script(text: str, cue_map: dict, beat_repr: str) -> list[Element]:
    """Parse a three-stream script into ordered Elements."""
    blocks = re.split(r"\n[ \t]*\n", text)
    elements: list[Element] = []
    seen_speaker = False
    i = 0
    for block in blocks:
        b = block.strip()
        if not b:
            continue
        # episode header
        m = re.match(r"^#\s+Episode\s+\d+:?\s*(.*)$", b)
        if m:
            elements.append(Element("episode", i, note=m.group(1).strip()))
            i += 1
            continue
        # scene break
        if re.fullmatch(r"-{3,}", b):
            elements.append(Element("scene_break", i))
            i += 1
            continue
        # speaker line?
        sm = SPEAKER_RE.match(b)
        if sm and sm.group("speaker").strip() in _KNOWN_SPEAKERS:
            seen_speaker = True
            speaker = sm.group("speaker").strip()
            paren = (sm.group("paren") or "").strip()
            stream = None
            opening_cue = ""
            if paren:
                # "SURFACE — flat, patient" -> stream + opening cue
                head = re.split(r"\s*[—–-]\s*", paren, maxsplit=1)
                if head[0].strip().upper() in STREAMS:
                    stream = head[0].strip().upper()
                    opening_cue = head[1].strip() if len(head) > 1 else ""
                else:
                    opening_cue = paren
            raw_text = sm.group("text").strip()
            # fold the opening cue (from the prefix) into the text stream so
            # clean_tts_text maps/drops it uniformly
            if opening_cue:
                raw_text = f"*({opening_cue})* {raw_text}"
            if speaker == "CHORD":
                stream = "CHORD"
            tts, used, dropped = clean_tts_text(raw_text, cue_map, beat_repr)
            el = Element(
                "utterance", i, speaker=speaker, stream=stream,
                voice_key=default_voice_key(speaker, stream),
                raw_text=sm.group("text").strip(), tts_text=tts,
                cues=used, dropped_cues=dropped,
            )
            elements.append(el)
            i += 1
            continue
        # bold-led paragraph -> sound design
        if b.startswith("**") or (not seen_speaker and b.startswith("*")):
            # the legend/preamble (italic, before any speaker) is also dropped
            elements.append(Element("sfx", i, note=_strip_md(b)))
            i += 1
            continue
        # anything else before the first speaker = front matter; after = sfx
        elements.append(Element("sfx", i, note=_strip_md(b)))
        i += 1
    return elements


# Speakers we recognise (others would be missed; parse --speakers lists any
# caps-led blocks that look like speakers but aren't in this set).
_KNOWN_SPEAKERS = {"NARRATOR", "WREN", "DANIEL", "CHORD", "VALA", "LISS", "MAN", "EDDA"}


# --------------------------------------------------------------------------
# STAY format — one voice (Wren) into a dictaphone, plus a sparse frame
# (the assembler, in **[bracketed italics]**). No SPEAKER: labels.
# --------------------------------------------------------------------------

TAPE_RE = re.compile(r"^#\s+Tape\s+(\d+)\s*:?\s*(.*)$", re.I | re.S)
# A frame interjection: **[...]** or ***[...]*** (bold/bold-italic brackets).
ASSEMBLER_RE = re.compile(r"^\*{2,3}\[(?P<text>.*)\]\*{2,3}$", re.S)
# A whole paragraph that is a single *(...)* cue = room tone / the tape running.
WHOLE_CUE_RE = re.compile(r"^\*\((?P<cue>[^)]*)\)\*$", re.S)


# An assembler interjection: **[...]** or ***[...]***, NON-greedy, may cross
# blank lines. The literal "[Bracketed italics]" is the legend's format key,
# not an interjection — left in place so its paragraph drops as legend.
_ASM_SPAN = re.compile(r"\*{2,3}\[(?P<inner>.+?)\]\*{2,3}", re.S)


def parse_stay(text: str, cue_map: dict, beat_repr: str) -> list[Element]:
    """Parse the dictaphone format. Plain text -> WREN; a **[...]** / ***[...]***
    frame (which may span several paragraphs) -> ASSEMBLER; a standalone
    *(beat)* -> a pause; a standalone *(room tone)*, the opening legend, and the
    per-tape "[Bracketed italics]…" format reminders -> dropped sound-design."""
    # 1. Lift real assembler spans out to placeholders so block-splitting can't
    #    tear a multi-paragraph interjection apart.
    spans: dict[str, str] = {}

    def _lift(m: re.Match) -> str:
        inner = re.sub(r"\*{2,3}", " ", m.group("inner"))   # inter-paragraph emphasis runs
        inner = re.sub(r"\s+", " ", inner).strip()
        if inner.lower().startswith("bracketed italics"):
            return m.group(0)                                # legend key — leave in place
        key = f"\x00ASM{len(spans)}\x00"
        spans[key] = inner
        return f"\n\n{key}\n\n"

    marked = _ASM_SPAN.sub(_lift, text)

    elements: list[Element] = []
    i = 0
    tape = 0
    seen_body = False
    for b in (x.strip() for x in re.split(r"\n[ \t]*\n", marked) if x.strip()):
        if b in spans:
            tts, used, dropped = clean_tts_text(spans[b], cue_map, beat_repr)
            elements.append(Element("utterance", i, speaker="ASSEMBLER", voice_key="ASSEMBLER",
                                    raw_text=spans[b], tts_text=tts, cues=used,
                                    dropped_cues=dropped, tape=tape))
            i += 1; seen_body = True
            continue
        m = TAPE_RE.match(b)
        if m:
            tape = int(m.group(1))
            elements.append(Element("episode", i, tape=tape, note=f"Tape {tape}: {m.group(2).strip()}"))
            i += 1; seen_body = False
            continue
        if re.fullmatch(r"-{3,}", b):
            elements.append(Element("scene_break", i, tape=tape))
            i += 1
            continue
        cm = WHOLE_CUE_RE.match(b)
        if cm:
            cue = cm.group("cue").strip().lower()
            kind = "beat" if cue in BEAT_CUES else "sfx"
            elements.append(Element(kind, i, tape=tape, note=_strip_md(b)))
            i += 1
            continue
        # legend key reminder, or the opening legend (italic before any spoken
        # body) -> dropped sound-design.
        if b.startswith("**[") or b.startswith("***[") or (not seen_body and b.startswith("*")):
            elements.append(Element("sfx", i, tape=tape, note=_strip_md(b)))
            i += 1
            continue
        # otherwise: Wren, spoken into the machine
        tts, used, dropped = clean_tts_text(b, cue_map, beat_repr)
        if not tts:
            elements.append(Element("sfx", i, tape=tape, note=_strip_md(b)))
        else:
            elements.append(Element("utterance", i, speaker="WREN", voice_key="WREN",
                                    raw_text=b, tts_text=tts, cues=used,
                                    dropped_cues=dropped, tape=tape))
            seen_body = True
        i += 1
    return elements


def _parse_tape_selection(spec: str | None) -> set[int] | None:
    """'1,7' -> {1,7}; '1-3' -> {1,2,3}; None/'' -> None (all)."""
    if not spec:
        return None
    out: set[int] = set()
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-", 1)
            out.update(range(int(a), int(b) + 1))
        elif part:
            out.add(int(part))
    return out or None


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def effective_voice(cast: dict, voice_key: str, tape: int, num_tapes: int) -> dict | None:
    """Resolve a voice, applying the STAY degradation ramp: a voice listed in
    cast['ramp'] interpolates its numeric settings from itself (tape 1) toward
    its 'to' key (last tape) across the book. Same voice_id, settings drift —
    so you hear Wren flatten into the we."""
    base = resolve_voice(cast, voice_key)
    if base is None:
        return None
    spec = cast.get("ramp", {}).get(voice_key)
    if spec and num_tapes > 1 and tape >= 1:
        target = resolve_voice(cast, spec["to"])
        if target:
            t = max(0.0, min(1.0, (tape - 1) / (num_tapes - 1)))
            base = dict(base)
            for f in ("stability", "similarity_boost", "style", "speed"):
                if f in base and f in target:
                    base[f] = round(_lerp(base[f], target[f], t), 4)
            base["_ramp_t"] = round(t, 3)
    return base


# --------------------------------------------------------------------------
# cast.json
# --------------------------------------------------------------------------

def load_cast(path: Path) -> dict:
    if not path.exists():
        raise SystemExit(f"cast file not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _load_prev_utterances(manifest_path: Path) -> dict[int, dict]:
    """{index: utterance_entry} from an existing utterances.json (note: the
    play manifest keys its list "utterances", not reader's "chunks"). The
    recorded text_sha256 + voice_id is what each .pcm was rendered from."""
    if not manifest_path.exists():
        return {}
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return {e["index"]: e for e in data.get("utterances", [])
            if isinstance(e, dict) and "index" in e}


def resolve_voice(cast: dict, voice_key: str) -> dict | None:
    """Return the merged voice config for a key, applying fallback
    (DANIEL@HIM -> DANIEL) and defaults. None if no voice is assigned."""
    voices = cast.get("voices", {})
    entry = voices.get(voice_key)
    if entry is None:
        fb = cast.get("fallback", {}).get(voice_key)
        if fb:
            entry = voices.get(fb)
    if entry is None or not entry.get("voice_id"):
        return None
    merged = dict(cast.get("defaults", {}))
    merged.update({k: v for k, v in entry.items() if not k.startswith("_")})
    merged.setdefault("model", cast.get("model", "eleven_v3"))
    return merged


# --------------------------------------------------------------------------
# commands
# --------------------------------------------------------------------------

def _cast_path(args) -> Path:
    if args.cast:
        return Path(args.cast)
    story = "stay" if getattr(args, "format", "seem") == "stay" else "seem"
    return REPO_ROOT / "stories" / story / "cast.json"


def _cast_or_empty(args) -> dict:
    p = _cast_path(args)
    return load_cast(p) if p.exists() else {"voices": {}, "cueMap": {}, "defaults": {}}


def _parse_with_cast(args) -> tuple[list[Element], dict, str, int]:
    """Returns (elements, cast, stem, num_tapes). num_tapes is the TOTAL tapes
    in the file (the ramp denominator), even when --tapes selects a subset."""
    cast = _cast_or_empty(args)
    cue_map = {k.lower(): v for k, v in cast.get("cueMap", {}).items()}
    beat_repr = cast.get("timing", {}).get("beatRepr", "…")
    p = Path(args.input)
    if not p.exists():
        raise SystemExit(f"input not found: {p}")
    raw = p.read_text(encoding="utf-8")

    if getattr(args, "format", "seem") == "stay":
        els_all = parse_stay(raw, cue_map, beat_repr)
        num_tapes = max((e.tape for e in els_all), default=1)
        sel = _parse_tape_selection(getattr(args, "tapes", None))
        # One output dir for the whole book ("stay"); utterance indices are
        # global, so rendering tapes one at a time accumulates in place and a
        # later mix across any selection finds them. --tapes only filters which
        # utterances this invocation touches.
        els = [e for e in els_all if e.tape in sel] if sel else els_all
        return els, cast, "stay", num_tapes

    text = split_episode(raw, getattr(args, "episode", None))
    els = parse_script(text, cue_map, beat_repr)
    stem = f"episode_{args.episode:02d}" if getattr(args, "episode", None) else p.stem
    return els, cast, stem, 1


def cmd_parse(args) -> int:
    els, cast, stem, num_tapes = _parse_with_cast(args)
    utts = [e for e in els if e.kind == "utterance"]
    print(f"=== {stem}: {len(utts)} utterances, "
          f"{sum(1 for e in els if e.kind == 'sfx')} sound-design blocks, "
          f"{sum(1 for e in els if e.kind in ('scene_break', 'beat'))} breaks/beats ===\n")
    for e in els:
        if e.kind == "utterance":
            tag = e.voice_key
            head = e.tts_text.replace("\n", " ")
            head = (head[:74] + "…") if len(head) > 75 else head
            extra = ""
            if e.cues:
                extra += f"  tags={e.cues}"
            if e.dropped_cues:
                extra += f"  dropped={e.dropped_cues}"
            print(f"  [{e.index:03d}] {tag:16} {head!r}{extra}")
        elif e.kind == "scene_break":
            print(f"  [{e.index:03d}] {'—— scene break ——':16}")
        elif e.kind == "beat":
            print(f"  [{e.index:03d}] {'(beat)':16} {e.note!r}")
        elif e.kind == "episode":
            print(f"  [{e.index:03d}] {'## ' + e.note:16}")
        elif e.kind == "sfx":
            note = (e.note[:60] + "…") if len(e.note) > 61 else e.note
            print(f"  [{e.index:03d}] {'(sfx)':16} {note!r}")

    # casting gaps + cue vocabulary, so we know what to fill in
    by_key: dict[str, int] = {}
    chars = 0
    for e in utts:
        by_key[e.voice_key] = by_key.get(e.voice_key, 0) + 1
        chars += len(e.tts_text)
    print("\n--- voice keys (utterances / billable chars) ---")
    for k in sorted(by_key):
        kchars = sum(len(e.tts_text) for e in utts if e.voice_key == k)
        voiced = "  ✓ cast" if resolve_voice(cast, k) else "  ✗ NO VOICE"
        print(f"  {k:16} {by_key[k]:4} utt  {kchars:6} chars{voiced}")
    print(f"\n  total: {len(utts)} utterances, {chars} billable chars")

    dropped = sorted({c for e in utts for c in e.dropped_cues})
    if dropped:
        print(f"\n--- {len(dropped)} distinct cue(s) currently DROPPED "
              f"(add to cueMap to keep) ---")
        for c in dropped:
            print(f"  *({c})*")
    return 0


def cmd_cast(args) -> int:
    els, cast, stem, num_tapes = _parse_with_cast(args)
    utts = [e for e in els if e.kind == "utterance"]
    missing = sorted({e.voice_key for e in utts if not resolve_voice(cast, e.voice_key)})
    print(f"=== {stem}: cast resolution ===")
    keys = sorted({e.voice_key for e in utts})
    for k in keys:
        v = resolve_voice(cast, k)
        if v:
            print(f"  {k:16} -> {v['voice_id']}  model={v.get('model')} "
                  f"style={v.get('style')} stability={v.get('stability')}")
        else:
            print(f"  {k:16} -> (unassigned)")
    if missing:
        print(f"\nUNCAST voice keys: {missing}\n"
              f"Add them to {_cast_path(args)} before synth.")
        return 1
    print("\nAll voice keys cast.")
    return 0


def _out_dir(args, stem: str) -> Path:
    if args.out:
        return Path(args.out).resolve()
    story = "stay" if getattr(args, "format", "seem") == "stay" else "seem"
    return REPO_ROOT / "dist" / "stories" / story / "audio" / "play-en" / stem


def cmd_synth(args) -> int:
    els, cast, stem, num_tapes = _parse_with_cast(args)
    utts = [e for e in els if e.kind == "utterance"]
    out = _out_dir(args, stem)
    out.mkdir(parents=True, exist_ok=True)
    manifest_path = out / "utterances.json"
    prev = _load_prev_utterances(manifest_path)

    api_key = args.api_key or os.environ.get("ELEVENLABS_API_KEY")
    if not api_key and not args.dry_run:
        raise SystemExit("missing ELEVENLABS_API_KEY (set env, .env, or --api-key)")

    # fail fast on casting gaps
    missing = sorted({e.voice_key for e in utts if not resolve_voice(cast, e.voice_key)})
    if missing:
        raise SystemExit(f"uncast voice keys: {missing} — run `play.py cast` and fill cast.json")

    manifest = {"episode": stem, "source": str(args.input), "provider": "elevenlabs",
                "source_git": reader._git_provenance(Path(args.input)), "utterances": []}
    # Carry prior entries forward so rendering tapes one at a time accumulates
    # into one manifest instead of each run clobbering the others' records.
    records: dict[int, dict] = dict(prev)

    def _save():
        manifest["utterances"] = [records[k] for k in sorted(records)]
        reader._save_manifest(manifest_path, manifest)

    new = stale = skipped = 0
    total_bytes = 0
    for e in utts:
        if args.limit and new >= args.limit:
            break
        voice = effective_voice(cast, e.voice_key, e.tape, num_tapes)
        vs = {"stability": voice.get("stability", 0.5),
              "similarity_boost": voice.get("similarity_boost", 0.75),
              "style": voice.get("style", 0.3),
              "use_speaker_boost": voice.get("use_speaker_boost", True),
              "speed": voice.get("speed", 1.0)}
        settings_sha = reader._text_sha256(json.dumps(vs, sort_keys=True))
        pcm_path = out / f"utt_{e.index:04d}.pcm"
        sha = reader._text_sha256(e.tts_text)
        rec = prev.get(e.index)
        # Cache key = text + voice_id + settings: a re-cast OR a shifted ramp
        # position both correctly invalidate just the affected utterances.
        current = (pcm_path.exists() and rec
                   and rec.get("status") in reader._VALID_CHUNK_STATUSES
                   and reader._chunk_rendered_sha(rec) == sha
                   and rec.get("voice_id") == voice["voice_id"]
                   and rec.get("settings_sha256") == settings_sha)
        entry = {"index": e.index, "voice_key": e.voice_key, "voice_id": voice["voice_id"],
                 "speaker": e.speaker, "stream": e.stream, "tape": e.tape,
                 "ramp_t": voice.get("_ramp_t"), "chars": len(e.tts_text),
                 "text": e.tts_text, "text_sha256": sha,
                 "settings_sha256": settings_sha, "pcm": pcm_path.name}
        if current and not args.force:
            size = pcm_path.stat().st_size
            entry.update(bytes=size, duration_sec=round(reader.pcm_duration_seconds(size), 3),
                         status="skipped-existing")
            records[e.index] = entry
            skipped += 1
            continue
        if args.dry_run:
            stale += 1
            rt = f" ramp_t={voice.get('_ramp_t')}" if voice.get("_ramp_t") is not None else ""
            print(f"  [{e.index:04d}] {e.voice_key:16} would render ({len(e.tts_text)} chars){rt}")
            continue
        print(f"  [{e.index:04d}] {e.voice_key:16} synth {len(e.tts_text):4} chars  "
              f"{e.tts_text[:48]!r}")
        try:
            raw = reader.synthesize_pcm(e.tts_text, api_key=api_key, model=voice["model"],
                                        voice_id=voice["voice_id"], voice_settings=vs)
        except reader.SynthError as ex:
            entry["status"] = f"error: {ex}"
            records[e.index] = entry
            print(f"    FAILED: {ex}", file=sys.stderr)
            if args.stop_on_error:
                _save()
                return 2
            continue
        reader.write_pcm(pcm_path, raw)
        if args.also_wav:
            reader.write_wav(pcm_path.with_suffix(".wav"), raw)
        entry.update(bytes=len(raw), duration_sec=round(reader.pcm_duration_seconds(len(raw)), 3),
                     status="ok")
        records[e.index] = entry
        new += 1
        total_bytes += len(raw)
    if not args.dry_run:
        _save()
    print(f"\ndone: {new} rendered, {skipped} cached, {stale} would-render; "
          f"{reader.pcm_duration_seconds(total_bytes):.1f}s new audio -> {out}")
    return 0


def cmd_mix(args) -> int:
    els, cast, stem, num_tapes = _parse_with_cast(args)
    out = _out_dir(args, stem)
    timing = cast.get("timing", {})
    utt_gap = reader._silence_bytes(timing.get("utteranceGapMs", 250))
    scene_gap = reader._silence_bytes(timing.get("sceneGapMs", 1400))
    sfx_gap = reader._silence_bytes(timing.get("sfxGapMs", 900))
    beat_gap = reader._silence_bytes(timing.get("beatGapMs", 600))
    tape_gap = reader._silence_bytes(timing.get("tapeGapMs", 2500))

    combined = bytearray()
    used = missing = 0
    for e in els:
        if e.kind == "utterance":
            pcm = out / f"utt_{e.index:04d}.pcm"
            if pcm.exists():
                combined += pcm.read_bytes()
                combined += utt_gap
                used += 1
            else:
                missing += 1
        elif e.kind == "scene_break":
            combined += scene_gap
        elif e.kind == "beat":
            combined += beat_gap
        elif e.kind == "episode":
            combined += tape_gap
        elif e.kind == "sfx":
            combined += sfx_gap
    if missing:
        print(f"WARNING: {missing} utterance(s) not yet rendered — mix is incomplete",
              file=sys.stderr)
    sel = _parse_tape_selection(getattr(args, "tapes", None))
    suffix = ("_tapes_" + "-".join(str(s) for s in sorted(sel))) if sel else ""
    mix_pcm = out / f"{stem}{suffix}_mix.pcm"
    mix_pcm.write_bytes(bytes(combined))
    if not args.no_wav:
        reader.write_wav(out / f"{stem}{suffix}_mix.wav", bytes(combined))
    print(f"mix: {used} utterances, {len(combined)} B, "
          f"{reader.pcm_duration_seconds(len(combined)):.1f}s -> {mix_pcm}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Multi-voice renderer for the SEEM radio play.")
    sub = p.add_subparsers(dest="cmd", required=True)

    def common(sp):
        sp.add_argument("--input", required=True,
                        help="script file: compiled/seem.md, compiled/stay.md, or a chapter md")
        sp.add_argument("--format", choices=("seem", "stay"), default="seem",
                        help="page format: 'seem' = 3-stream SPEAKER: radio play; "
                             "'stay' = one-voice dictaphone + **[assembler]** frame")
        sp.add_argument("--episode", type=int, default=None,
                        help="SEEM: if --input is multi-episode, render just this episode")
        sp.add_argument("--tapes", default=None,
                        help="STAY: tape selection, e.g. '1,7' or '1-3' (default: all)")
        sp.add_argument("--cast", default=None,
                        help="cast.json (default: stories/<seem|stay>/cast.json by --format)")

    sp = sub.add_parser("parse", help="show parsed elements + cleaned TTS text (no API)")
    common(sp); sp.set_defaults(func=cmd_parse)

    sp = sub.add_parser("cast", help="resolve every utterance to a voice; flag gaps (no API)")
    common(sp); sp.set_defaults(func=cmd_cast)

    sp = sub.add_parser("synth", help="render each utterance (content-hash cached)")
    common(sp)
    sp.add_argument("--out", default=None, help="output dir (default: dist/.../play-en/<stem>)")
    sp.add_argument("--also-wav", action="store_true")
    sp.add_argument("--force", action="store_true", help="re-render even if cached & unchanged")
    sp.add_argument("--dry-run", action="store_true", help="report what would render, no API")
    sp.add_argument("--limit", type=int, default=None, help="render at most N new utterances")
    sp.add_argument("--stop-on-error", action="store_true")
    sp.add_argument("--api-key", default=None)
    sp.set_defaults(func=cmd_synth)

    sp = sub.add_parser("mix", help="stitch rendered utterances into one sequential mixdown")
    common(sp)
    sp.add_argument("--out", default=None)
    sp.add_argument("--no-wav", action="store_true")
    sp.set_defaults(func=cmd_mix)
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
