#!/usr/bin/env python3
"""
reader.py — Swedish chapter reader for "A Rabbit's Life".

Generates narrated audio for each chapter via the ElevenLabs
text-to-speech API (default model: eleven_multilingual_v2; default voice:
Anna — Clear and Melodic, a Swedish professional voice).

Base format is raw signed 16-bit little-endian PCM at 24 kHz, mono —
ElevenLabs' `pcm_24000` output. Concatenation of raw .pcm files is just
a byte append (`cat a.pcm b.pcm > both.pcm`), which is why we keep .pcm
as the canonical per-chunk artifact.

Subcommands:
  chunks   Show how a chapter would be split into chunks (no API calls).
  synth    Generate per-chunk audio for one or more chapters.
  concat   Concatenate per-chunk .pcm files into a single chapter .pcm/.wav.

Run `python reader.py -h` or any subcommand with -h for full flag list.
"""

from __future__ import annotations

import argparse
import dataclasses
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import wave
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# ElevenLabs pcm_24000 output is 24 kHz mono s16le. Don't change these
# unless you also change the output_format query parameter in the API URL.
PCM_SAMPLE_RATE = 24000
PCM_CHANNELS = 1
PCM_SAMPLE_WIDTH = 2  # bytes (16-bit)
PCM_OUTPUT_FORMAT = "pcm_24000"

ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

# Models that do NOT support request stitching (previous_text / next_text).
# As of 2026-04-11 the alpha `eleven_v3` rejects these params with HTTP 400:
# "Providing previous_text or next_text is not yet supported with the
# 'eleven_v3' model." We detect this client-side so we can fall back to
# non-stitched synthesis automatically instead of failing every chunk.
MODELS_WITHOUT_STITCHING: frozenset[str] = frozenset({"eleven_v3"})

# ----- Language profiles ---------------------------------------------------
#
# Each profile bundles the model, a tuned default voice, and the four
# voice_settings knobs ElevenLabs exposes:
#
#   stability        — higher = flatter/more consistent, lower = more emotional
#   similarity_boost — how hard to match the original voice's timbre
#   style            — v2 stylistic exaggeration; low = neutral
#   use_speaker_boost— mild clarity/presence boost
#
# Individual CLI flags (--voice, --model, --stability, ...) override the
# profile's value for that field. The profile is only consulted for fields
# the user did not override on the command line.
#
# To add a language: drop another entry in this dict. No code changes.
# To change the default voice for an existing language: edit the voice_id
# here (and the voice_name, which is purely for logging/help text).
#
# Swedish tuning is validated — Anna on this passage was A/B-picked against
# Louise / Evelina / Eva on 2026-04-11. English tuning is TENTATIVE — the
# voice was chosen from shared-library labels ("calm grounded" + narrative
# use case) but not yet listened to on a real passage. Re-probe when ready.

LANGUAGE_PROFILES: dict[str, dict] = {
    "sv": {
        "language_name": "Swedish",
        # 2026-04-11 migration: v2 → v3. The v3 alpha model was chosen
        # after a direct A/B on chapter 1: v3's native pace is ~24%
        # slower than v2 (which matches the "behagligt, almost lulling"
        # target), the `speed` parameter is actually honored (v2 near-
        # ignored it), and v3 independently disambiguated Swedish vowel
        # length better (e.g. "drar underifrån" resolved correctly on
        # v3 after all v2 workarounds — pronunciation dict IPA,
        # respelling, CAPS — failed or silently dropped the word).
        #
        # Tradeoffs taken:
        #  - v3 is alpha → more call-to-call variance, less consistent
        #  - v3 does NOT support previous_text/next_text stitching
        #    (MODELS_WITHOUT_STITCHING handles this client-side)
        #  - v3 bills at a slight premium vs v2
        "model": "eleven_v3",
        "voice_id": "1Iztu4UHnTb9SUjJcpS1",
        "voice_name": "Anna — Clear and Melodic",
        # stability/similarity/style carried over from v2 — Anna
        # responds similarly to these knobs across models. DO NOT bump
        # similarity_boost above 0.75 for Anna; her source recordings
        # have a punchier delivery than the "Melodic" label suggests.
        "stability": 0.55,
        "similarity_boost": 0.75,
        "style": 0.15,
        "use_speaker_boost": True,
        # speed: v3 honors this parameter. 0.90 = 10% slower than v3's
        # already-meditative native pace, landing ~33% slower than v2
        # was. Stefan's validated preference for long-form narration.
        "speed": 0.90,
        "max_chars": 1500,
        "validated": True,
    },
    "en": {
        "language_name": "English",
        # 2026-04-15: Mira validated. A/B'd against Dr Alice, Madeline,
        # and Alex on the opening paragraph of stories/continue
        # chapter 1 (the landlord/key passage). Samples committed at
        # tools/voice-renderer/voice_samples/english/. Mira chosen as
        # the en default; same voice_settings as sv (calibrated for
        # long-form narration: stability 0.55, similarity 0.75,
        # style 0.15, speed 0.90).
        "model": "eleven_v3",
        "voice_id": "DVxf8tkOIac2UAoDXYVS",
        "voice_name": "Mira — Calm Grounded British Voice",
        "stability": 0.55,
        "similarity_boost": 0.75,
        "style": 0.15,
        "use_speaker_boost": True,
        "speed": 0.90,
        "max_chars": 1500,
        "validated": True,
    },
}

DEFAULT_LANGUAGE = "sv"

REPO_ROOT = Path(__file__).resolve().parents[2]
# `--chapter N` / `--all` shortcut for the Swedish kapitel files that
# live under stories/zelda/. For any other story, use --input instead.
CHAPTERS_DIR = REPO_ROOT / "stories" / "zelda" / "translations" / "svenska" / "kapitel"
SCRIPT_DIR = Path(__file__).resolve().parent
# Fallback when we can't derive a per-story output dir from the input
# path (e.g. the user pointed at a markdown file outside stories/).
FALLBACK_OUT_DIR = SCRIPT_DIR / "out"
DOTENV_PATH = SCRIPT_DIR / ".env"


def derive_out_dir(paths: list[Path], language: str) -> Path:
    """Map an input path to dist/stories/<story>/audio/<language>/.

    Inputs under <repo>/stories/<name>/... write to
    <repo>/dist/stories/<name>/audio/<language>/. The language segment
    keeps multi-language stories (e.g. zelda's sv original + en
    translation) from colliding in the same chapter-stem directories.
    If the first input falls outside the stories tree, fall back to the
    legacy tools/voice-renderer/out/ location so ad-hoc renders still
    work.
    """
    if not paths:
        return FALLBACK_OUT_DIR
    first = paths[0].resolve()
    stories_root = REPO_ROOT / "stories"
    try:
        rel = first.relative_to(stories_root)
    except ValueError:
        return FALLBACK_OUT_DIR
    story_name = rel.parts[0]
    return REPO_ROOT / "dist" / "stories" / story_name / "audio" / language


def _load_dotenv(path: Path) -> None:
    """Minimal .env loader. Reads KEY=VALUE lines, skips comments and blanks.

    Values already present in os.environ win — the environment takes
    precedence over the file, so CI / shell overrides still work.
    """
    if not path.exists():
        return
    try:
        for raw in path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            k, _, v = line.partition("=")
            k = k.strip()
            v = v.strip()
            # Strip matching surrounding quotes if present.
            if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
                v = v[1:-1]
            if k and k not in os.environ:
                os.environ[k] = v
    except OSError:
        # .env is a convenience; do not fail startup on I/O errors.
        pass


_load_dotenv(DOTENV_PATH)


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

SECTION_SEP_RE = re.compile(r"(?m)^\s*---\s*$")


@dataclasses.dataclass
class Chunk:
    index: int
    text: str
    section: int  # 0-based index into the chapter's --- separated sections
    part: int  # 0-based index inside the section (when a section had to be split)


def _strip_markdown(text: str) -> str:
    """Very small markdown flattener suitable for TTS input.

    The Swedish chapters use only:
      - H1 headings (# Kapitel N: Title)
      - plain paragraphs
      - '---' section separators
    We keep headings as spoken introductions.
    """
    out_lines: list[str] = []
    for line in text.splitlines():
        stripped = line.rstrip()
        if stripped.startswith("#"):
            # "# Kapitel 1: Födelsen" -> "Kapitel 1: Födelsen"
            stripped = stripped.lstrip("#").strip()
        out_lines.append(stripped)
    return "\n".join(out_lines)


def _split_section_to_parts(section: str, max_chars: int) -> list[str]:
    """Greedy paragraph packer. Never splits mid-paragraph."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", section) if p.strip()]
    parts: list[str] = []
    buf: list[str] = []
    buf_len = 0
    for p in paragraphs:
        extra = len(p) + (2 if buf else 0)
        if buf and buf_len + extra > max_chars:
            parts.append("\n\n".join(buf))
            buf, buf_len = [p], len(p)
        else:
            buf.append(p)
            buf_len += extra
    if buf:
        parts.append("\n\n".join(buf))
    # Edge case: a single paragraph longer than max_chars. We keep it whole
    # rather than splitting mid-sentence; max_chars is a soft target.
    return parts


def _looks_like_heading_section(section: str) -> bool:
    """Heuristic: a section that looks like a standalone chapter heading.

    Chapter sources in this repo follow the convention:

        # Kapitel 1: Födelsen

        ---

        <content>...

    After markdown-stripping the `#`, the heading ends up alone in
    section 0, separated from the first content section by the `---`
    marker. We detect it by: single line, short, and not ending in a
    sentence terminator (paragraph text always does).
    """
    s = section.strip()
    if "\n" in s:
        return False
    if len(s) > 80:
        return False
    if s and s[-1] in ".!?":
        return False
    return bool(s)


def chunk_chapter(text: str, max_chars: int = 1500) -> list[Chunk]:
    flat = _strip_markdown(text)
    sections = [s.strip() for s in SECTION_SEP_RE.split(flat) if s.strip()]

    # Heading-merge: a standalone chapter title ("Kapitel 1: Födelsen")
    # used to become its own 19-character chunk, which suffered from
    # boundary artifacts (trailing "micro-wail", no natural pause) and
    # forced the model to render a prosodically-contextless fragment.
    # Merge it into the opening of the first content section instead.
    # Appending a period gives the model an explicit terminator so it
    # paces the heading like a sentence, and then flows into the
    # paragraph via the "\n\n" break.
    if len(sections) >= 2 and _looks_like_heading_section(sections[0]):
        heading = sections[0].rstrip()
        if heading[-1] not in ".!?:":
            heading += "."
        sections = [f"{heading}\n\n{sections[1]}"] + sections[2:]

    chunks: list[Chunk] = []
    idx = 0
    for sec_i, section in enumerate(sections):
        parts = _split_section_to_parts(section, max_chars)
        for part_i, part in enumerate(parts):
            chunks.append(Chunk(index=idx, text=part, section=sec_i, part=part_i))
            idx += 1
    return chunks


# ---------------------------------------------------------------------------
# API call
# ---------------------------------------------------------------------------


class SynthError(RuntimeError):
    pass


def synthesize_pcm(
    text: str,
    *,
    api_key: str,
    model: str,
    voice_id: str,
    voice_settings: dict,
    previous_text: str | None = None,
    next_text: str | None = None,
    timeout: int = 180,
    max_retries: int = 3,
) -> bytes:
    """Call the ElevenLabs TTS endpoint, return raw PCM bytes.

    Raw PCM is signed 16-bit little-endian mono at 24 kHz (ElevenLabs'
    `pcm_24000` output format). ElevenLabs returns the audio bytes
    directly in the response body — no streaming, no base64, no SSE.

    `previous_text` / `next_text` are passed for prosody-only context
    ("request stitching") and are NOT billed against your character
    quota. ElevenLabs uses them to calibrate pacing, intonation and
    pronunciation so that the generated audio feels continuous with
    what comes before/after — critical for chunk boundaries that would
    otherwise reset prosody at every call. Combined cap on the server
    side is ~10,000 characters total for previous+next.
    """
    url = ELEVENLABS_TTS_URL.format(voice_id=urllib.parse.quote(voice_id, safe=""))
    url += "?" + urllib.parse.urlencode({"output_format": PCM_OUTPUT_FORMAT})

    payload: dict = {
        "text": text,
        "model_id": model,
        "voice_settings": voice_settings,
    }
    if previous_text:
        payload["previous_text"] = previous_text
    if next_text:
        payload["next_text"] = next_text

    body = json.dumps(payload).encode("utf-8")

    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/pcm",
    }

    last_err: Exception | None = None
    for attempt in range(1, max_retries + 1):
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                raw = r.read()
            if not raw:
                raise SynthError("empty audio response")
            return raw
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", "replace")
            last_err = SynthError(f"HTTP {e.code}: {_summarize_error(err_body)}")
            # Retry only on 5xx / 429. 4xx are terminal.
            if e.code not in (429, 500, 502, 503, 504):
                raise last_err
        except (urllib.error.URLError, TimeoutError) as e:
            last_err = SynthError(f"network error: {e}")
        if attempt < max_retries:
            backoff = 2 ** (attempt - 1)
            print(f"    retry {attempt}/{max_retries - 1} after {backoff}s: {last_err}", file=sys.stderr)
            time.sleep(backoff)
    raise last_err or SynthError("unknown synth failure")


def _summarize_error(body: str) -> str:
    """Pull a human-readable message out of an ElevenLabs error body."""
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return body[:400]
    detail = data.get("detail")
    if isinstance(detail, dict):
        return detail.get("message") or json.dumps(detail)[:400]
    if isinstance(detail, str):
        return detail
    return json.dumps(data)[:400]


# ---------------------------------------------------------------------------
# File helpers
# ---------------------------------------------------------------------------


def write_pcm(path: Path, raw: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)


def write_wav(path: Path, raw: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(PCM_CHANNELS)
        w.setsampwidth(PCM_SAMPLE_WIDTH)
        w.setframerate(PCM_SAMPLE_RATE)
        w.writeframes(raw)


def pcm_duration_seconds(raw_bytes: int) -> float:
    return raw_bytes / (PCM_SAMPLE_RATE * PCM_CHANNELS * PCM_SAMPLE_WIDTH)


# ---------------------------------------------------------------------------
# Chapter discovery
# ---------------------------------------------------------------------------


CHAPTER_NAME_RE = re.compile(r"^kapitel_(\d+)_.*\.md$")

# "Meta" files are repo docs like README.md, LICENSE.md, STYLE_GUIDE.md,
# TRANSLATION_PLAN.md, AUDIT_FINDINGS.md, CLAUDE.md, etc. Convention in
# this repo: all-uppercase stems (with underscores/digits) are docs,
# lowercase stems (chapter_01_birth, kapitel_01_fodelsen) are content.
META_STEM_RE = re.compile(r"^[A-Z][A-Z0-9_]*$")


def _is_meta_file(path: Path) -> bool:
    return bool(META_STEM_RE.match(path.stem))


def list_markdown_files(directory: Path) -> list[Path]:
    """Return content .md files in `directory`, non-recursive.

    Skips:
      - directories
      - hidden files (leading dot)
      - meta files (README.md, STYLE_GUIDE.md, etc. — all-uppercase stems)
      - non-.md files
    """
    out: list[Path] = []
    for p in sorted(directory.iterdir()):
        if not p.is_file():
            continue
        if p.name.startswith("."):
            continue
        if p.suffix.lower() != ".md":
            continue
        if _is_meta_file(p):
            continue
        out.append(p)
    return out


def discover_chapters() -> list[Path]:
    """Legacy discovery for the Swedish kapitel_*.md files — used by --all."""
    if not CHAPTERS_DIR.exists():
        return []
    out = []
    for p in sorted(CHAPTERS_DIR.iterdir()):
        if p.is_file() and CHAPTER_NAME_RE.match(p.name):
            out.append(p)
    return out


def resolve_chapter_paths(args) -> list[Path]:
    if args.input:
        p = Path(args.input).resolve()
        if p.is_dir():
            paths = list_markdown_files(p)
            if not paths:
                raise SystemExit(
                    f"no content .md files found in {p} "
                    f"(hidden files and ALL-UPPERCASE meta files are ignored)"
                )
            return paths
        if p.is_file():
            return [p]
        raise SystemExit(f"--input path does not exist: {p}")
    chapters = discover_chapters()
    if args.all:
        return chapters
    if args.chapters:
        wanted = set()
        for tok in args.chapters.split(","):
            tok = tok.strip()
            if not tok:
                continue
            if "-" in tok:
                a, b = tok.split("-", 1)
                wanted.update(range(int(a), int(b) + 1))
            else:
                wanted.add(int(tok))
        out = []
        for p in chapters:
            m = CHAPTER_NAME_RE.match(p.name)
            if m and int(m.group(1)) in wanted:
                out.append(p)
        return out
    if args.chapter is not None:
        for p in chapters:
            m = CHAPTER_NAME_RE.match(p.name)
            if m and int(m.group(1)) == args.chapter:
                return [p]
        raise SystemExit(f"chapter {args.chapter} not found in {CHAPTERS_DIR}")
    raise SystemExit(
        "specify one of: --chapter N, --chapters 1,2,3, --all, "
        "or --input PATH (file or directory)"
    )


def chapter_stem(path: Path) -> str:
    return path.stem  # e.g. "kapitel_01_fodelsen"


# ---------------------------------------------------------------------------
# Subcommands
# ---------------------------------------------------------------------------


def cmd_chunks(args) -> int:
    profile = LANGUAGE_PROFILES.get(args.language)
    if profile is None:
        raise SystemExit(
            f"unknown --language {args.language!r}. "
            f"Known: {', '.join(sorted(LANGUAGE_PROFILES))}"
        )
    max_chars = args.max_chars if args.max_chars is not None else profile["max_chars"]
    paths = resolve_chapter_paths(args)
    for p in paths:
        text = p.read_text(encoding="utf-8")
        chunks = chunk_chapter(text, max_chars=max_chars)
        print(f"\n=== {p.name} — {len(chunks)} chunks (max_chars={max_chars}) ===")
        total = 0
        for c in chunks:
            head = c.text.replace("\n", " ")[:80]
            print(f"  [{c.index:03d}] sec={c.section} part={c.part} len={len(c.text):4d}  {head}")
            total += len(c.text)
        print(f"  -> total billable chars: {total}")
    return 0


def cmd_synth(args) -> int:
    # Key is resolved lazily — we don't want to fail if every file is
    # already complete and no synthesis is actually needed.
    api_key_cache: list[str] = []

    def get_api_key() -> str:
        if api_key_cache:
            return api_key_cache[0]
        k = args.api_key or os.environ.get("ELEVENLABS_API_KEY")
        if not k:
            raise SystemExit(
                "missing API key: pass --api-key, set ELEVENLABS_API_KEY in the "
                "environment, or put it in tools/reader/.env"
            )
        api_key_cache.append(k)
        return k

    # Resolve language profile → effective settings. Any explicit CLI
    # override takes precedence over the profile's value for that field.
    profile = LANGUAGE_PROFILES.get(args.language)
    if profile is None:
        raise SystemExit(
            f"unknown --language {args.language!r}. "
            f"Known: {', '.join(sorted(LANGUAGE_PROFILES))}"
        )

    effective_model = args.model if args.model is not None else profile["model"]
    effective_voice = args.voice if args.voice is not None else profile["voice_id"]
    effective_max_chars = args.max_chars if args.max_chars is not None else profile["max_chars"]
    voice_settings = {
        "stability": args.stability if args.stability is not None else profile["stability"],
        "similarity_boost": (args.similarity_boost if args.similarity_boost is not None
                             else profile["similarity_boost"]),
        "style": args.style if args.style is not None else profile["style"],
        "use_speaker_boost": False if args.no_speaker_boost else profile["use_speaker_boost"],
        "speed": args.speed if args.speed is not None else profile.get("speed", 1.0),
    }

    stitching_enabled = effective_model not in MODELS_WITHOUT_STITCHING

    print(
        f"language={args.language} ({profile['language_name']}), "
        f"model={effective_model}, voice={effective_voice} "
        f"({profile['voice_name'] if effective_voice == profile['voice_id'] else 'custom'}), "
        f"stability={voice_settings['stability']}, "
        f"style={voice_settings['style']}, "
        f"speed={voice_settings['speed']}, "
        f"stitching={'on' if stitching_enabled else 'off (model-incompatible)'}"
    )
    if not profile.get("validated", False):
        print(
            f"  NOTE: the {args.language!r} profile is tentative — "
            f"voice chosen from labels, not yet A/B'd on real content."
        )
    if not stitching_enabled:
        print(
            f"  NOTE: {effective_model} does not accept previous_text/next_text. "
            f"Each chunk will be rendered without neighbor context — expect more "
            f"prosody reset at chunk boundaries."
        )

    paths = resolve_chapter_paths(args)
    if not paths:
        raise SystemExit("no chapters matched")

    out_root = Path(args.out).resolve() if args.out else derive_out_dir(paths, args.language)
    out_root.mkdir(parents=True, exist_ok=True)
    print(f"out={out_root}")

    total_chunks = 0
    total_bytes = 0
    total_chars = 0
    for p in paths:
        text = p.read_text(encoding="utf-8")
        chunks = chunk_chapter(text, max_chars=effective_max_chars)
        stem = chapter_stem(p)
        chapter_out = out_root / stem

        # File-level fast path: if every expected chunk already exists on
        # disk and --force was not passed, skip the whole file without
        # touching its manifest. Delete any chunk_*.pcm to force a
        # single-chunk re-render, or pass --force to redo everything.
        if not args.force and chunks:
            expected = [chapter_out / f"chunk_{c.index:03d}.pcm" for c in chunks]
            if all(pcm.exists() for pcm in expected):
                print(f"=== {stem}: complete ({len(chunks)}/{len(chunks)} chunks), skipping ===")
                continue

        chapter_out.mkdir(parents=True, exist_ok=True)

        manifest_path = chapter_out / "chunks.json"
        manifest = {
            "chapter": stem,
            "source": str(p.relative_to(REPO_ROOT)) if p.is_relative_to(REPO_ROOT) else str(p),
            "provider": "elevenlabs",
            "language": args.language,
            "model": effective_model,
            "voice_id": effective_voice,
            "voice_settings": voice_settings,
            "max_chars": effective_max_chars,
            "pcm": {
                "sample_rate": PCM_SAMPLE_RATE,
                "channels": PCM_CHANNELS,
                "sample_width_bytes": PCM_SAMPLE_WIDTH,
                "format": "s16le",
                "output_format_param": PCM_OUTPUT_FORMAT,
            },
            "chunks": [],
        }

        if args.limit_chunks is not None:
            chunks_to_process = chunks[: args.limit_chunks]
            print(f"\n=== {stem}: {len(chunks)} chunks total, "
                  f"limit={args.limit_chunks} -> {chapter_out} ===")
        else:
            chunks_to_process = chunks
            print(f"\n=== {stem}: {len(chunks)} chunks -> {chapter_out} ===")
        for c in chunks_to_process:
            pcm_name = f"chunk_{c.index:03d}.pcm"
            wav_name = f"chunk_{c.index:03d}.wav"
            pcm_path = chapter_out / pcm_name
            wav_path = chapter_out / wav_name

            entry = {
                "index": c.index,
                "section": c.section,
                "part": c.part,
                "chars": len(c.text),
                "text": c.text,
                "pcm": pcm_name,
            }
            if args.also_wav:
                entry["wav"] = wav_name

            if pcm_path.exists() and not args.force:
                size = pcm_path.stat().st_size
                entry["bytes"] = size
                entry["duration_sec"] = round(pcm_duration_seconds(size), 3)
                entry["status"] = "skipped-existing"
                manifest["chunks"].append(entry)
                print(f"  [{c.index:03d}] skip (exists, {size} B, {entry['duration_sec']}s)")
                continue

            # Request-stitching context. previous_text/next_text are
            # passed for prosody calibration only and are not billed.
            # We take a cheap window around the current chunk: the single
            # preceding chunk and the single following chunk. That's
            # enough to kill boundary resets without approaching the
            # ~10k combined char server cap.
            #
            # Models in MODELS_WITHOUT_STITCHING (currently just
            # eleven_v3) reject these params server-side, so we zero
            # them out for those models.
            if stitching_enabled:
                prev_t = chunks[c.index - 1].text if c.index > 0 else None
                next_t = chunks[c.index + 1].text if c.index + 1 < len(chunks) else None
            else:
                prev_t = None
                next_t = None

            head = c.text.replace("\n", " ")[:60]
            ctx = f"ctx=prev:{len(prev_t) if prev_t else 0}/next:{len(next_t) if next_t else 0}"
            print(f"  [{c.index:03d}] synth  {len(c.text):4d} chars  {ctx}  {head!r}")
            try:
                raw = synthesize_pcm(
                    c.text,
                    api_key=get_api_key(),
                    model=effective_model,
                    voice_id=effective_voice,
                    voice_settings=voice_settings,
                    previous_text=prev_t,
                    next_text=next_t,
                )
            except SynthError as e:
                print(f"    FAILED: {e}", file=sys.stderr)
                entry["status"] = f"error: {e}"
                manifest["chunks"].append(entry)
                if args.stop_on_error:
                    _save_manifest(manifest_path, manifest)
                    return 2
                continue

            write_pcm(pcm_path, raw)
            if args.also_wav:
                write_wav(wav_path, raw)

            entry["bytes"] = len(raw)
            entry["duration_sec"] = round(pcm_duration_seconds(len(raw)), 3)
            entry["status"] = "ok"
            manifest["chunks"].append(entry)
            total_chunks += 1
            total_bytes += len(raw)
            total_chars += len(c.text)
            print(f"    ok  {len(raw)} B  {entry['duration_sec']}s")

        _save_manifest(manifest_path, manifest)

    print(
        f"\ndone: {total_chunks} new chunks, "
        f"{total_chars} chars billed, "
        f"{total_bytes} bytes audio, "
        f"{pcm_duration_seconds(total_bytes):.1f}s"
    )
    return 0


def _save_manifest(path: Path, manifest: dict) -> None:
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def cmd_concat(args) -> int:
    paths = resolve_chapter_paths(args)
    if not paths:
        raise SystemExit("no chapters matched")
    out_root = Path(args.out).resolve() if args.out else derive_out_dir(paths, args.language)
    for p in paths:
        stem = chapter_stem(p)
        chapter_dir = out_root / stem
        if not chapter_dir.exists():
            print(f"  skip {stem}: {chapter_dir} does not exist", file=sys.stderr)
            continue
        pcm_files = sorted(chapter_dir.glob("chunk_*.pcm"))
        if not pcm_files:
            print(f"  skip {stem}: no chunk_*.pcm files in {chapter_dir}", file=sys.stderr)
            continue

        combined = bytearray()
        gap_bytes = _silence_bytes(args.gap_ms)
        for i, f in enumerate(pcm_files):
            if i and gap_bytes:
                combined += gap_bytes
            combined += f.read_bytes()

        out_pcm = chapter_dir / f"{stem}_full.pcm"
        out_pcm.write_bytes(bytes(combined))
        print(f"  {stem}: {len(pcm_files)} chunks -> {out_pcm.name} "
              f"({len(combined)} B, {pcm_duration_seconds(len(combined)):.1f}s)")
        if args.wav:
            out_wav = chapter_dir / f"{stem}_full.wav"
            write_wav(out_wav, bytes(combined))
            print(f"    + {out_wav.name}")
    return 0


def _silence_bytes(gap_ms: int) -> bytes:
    if gap_ms <= 0:
        return b""
    n_samples = int(PCM_SAMPLE_RATE * gap_ms / 1000) * PCM_CHANNELS
    return b"\x00\x00" * n_samples


def cmd_book(args) -> int:
    """Assemble every chapter's *_full.pcm into a single book-length file.

    Expects that `concat` has already been run for each chapter — we
    stitch the per-chapter full files rather than the individual chunks
    so the intra-chapter 500ms chunk gaps are preserved and the only
    thing this subcommand adds is a larger silence between chapters.

    Output lands in the out dir root (default:
    `tools/reader/out/<output_name>_full.pcm`) alongside an optional
    wrapped .wav.
    """
    if not args.out:
        raise SystemExit(
            "book: --out is required (point at the per-story audio dir, "
            "e.g. dist/stories/zelda/audio)"
        )
    out_root = Path(args.out).resolve()
    if not out_root.exists():
        raise SystemExit(f"output directory does not exist: {out_root}")

    # Glob one level deep, matching every chapter's concatenated full
    # file. Sorted alphabetically — the zero-padded `kapitel_NN_*` and
    # `chapter_NN_*` naming in this repo happens to be lexicographically
    # correct (kapitel_01 < kapitel_02 < ... < kapitel_10). If you later
    # mix multiple languages in the same out dir, use --filter to scope.
    pattern = args.filter if args.filter else "*/*_full.pcm"
    chapter_pcms = sorted(out_root.glob(pattern))
    # Exclude any book_full.pcm from a previous run that happens to
    # match a too-broad pattern — never eat our own output.
    chapter_pcms = [p for p in chapter_pcms if p.parent != out_root]
    if not chapter_pcms:
        raise SystemExit(
            f"no *_full.pcm files found under {out_root} matching {pattern!r}. "
            f"Run `concat` for each chapter first."
        )

    print(f"assembling {len(chapter_pcms)} chapter(s) from {out_root}:")
    combined = bytearray()
    gap = _silence_bytes(args.chapter_gap_ms)
    for i, pcm_path in enumerate(chapter_pcms):
        data = pcm_path.read_bytes()
        if i and gap:
            combined += gap
        combined += data
        dur = pcm_duration_seconds(len(data))
        print(f"  [{i:02d}] {pcm_path.parent.name:40} {dur/60:6.2f} min  ({len(data)} B)")

    total_dur = pcm_duration_seconds(len(combined))
    stem = args.output_name

    book_pcm = out_root / f"{stem}_full.pcm"
    book_pcm.write_bytes(bytes(combined))
    print(
        f"\nbook: {len(combined)} B, "
        f"{total_dur/60:.2f} min ({total_dur:.1f}s, {total_dur/3600:.2f} hours)"
    )
    print(f"  -> {book_pcm}")

    if args.wav:
        book_wav = out_root / f"{stem}_full.wav"
        write_wav(book_wav, bytes(combined))
        print(f"  -> {book_wav}")
    return 0


# ---------------------------------------------------------------------------
# argparse
# ---------------------------------------------------------------------------


def _add_chapter_selection(sp: argparse.ArgumentParser) -> None:
    g = sp.add_mutually_exclusive_group()
    g.add_argument("--chapter", type=int, help="single chapter number, e.g. 1")
    g.add_argument("--chapters", type=str, help="comma list / ranges, e.g. '1,3,5-7'")
    g.add_argument("--all", action="store_true", help="all Swedish chapters")
    g.add_argument("--input", type=str,
                   help="path to a markdown file, OR a directory of .md files "
                        "(non-recursive; hidden files and ALL-UPPERCASE meta "
                        "files like README.md are skipped)")


def _add_language_flag(sp: argparse.ArgumentParser) -> None:
    sp.add_argument(
        "--language", "--lang", default=DEFAULT_LANGUAGE,
        choices=sorted(LANGUAGE_PROFILES),
        help=f"language profile that drives voice + tuned voice_settings "
             f"(default: {DEFAULT_LANGUAGE}). Each --voice/--model/--stability/... "
             f"flag overrides just that field of the profile.",
    )


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    # chunks
    sp = sub.add_parser("chunks", help="print how a chapter would be chunked (no API calls)")
    _add_chapter_selection(sp)
    _add_language_flag(sp)
    sp.add_argument("--max-chars", type=int, default=None,
                    help="override the language profile's max_chars (soft cap per chunk)")
    sp.set_defaults(func=cmd_chunks)

    # synth
    sp = sub.add_parser("synth", help="generate audio chunks for one or more chapters")
    _add_chapter_selection(sp)
    _add_language_flag(sp)
    sp.add_argument("--model", default=None,
                    help="override the profile's ElevenLabs model_id")
    sp.add_argument("--voice", default=None,
                    help="override the profile's ElevenLabs voice_id")
    sp.add_argument("--stability", type=float, default=None,
                    help="override profile stability; 0..1, higher = flatter/more consistent")
    sp.add_argument("--similarity-boost", type=float, default=None,
                    help="override profile similarity_boost; 0..1")
    sp.add_argument("--style", type=float, default=None,
                    help="override profile style; 0..1, v2 stylistic exaggeration")
    sp.add_argument("--speed", type=float, default=None,
                    help="override profile speed; 0.7..1.2 for v2 (1.0 = native; "
                         "<1.0 = slower / more lulling; >1.0 = faster)")
    sp.add_argument("--no-speaker-boost", action="store_true",
                    help="disable speaker_boost (otherwise use profile's value)")
    sp.add_argument("--max-chars", type=int, default=None,
                    help="override profile max_chars (soft per-chunk cap)")
    sp.add_argument("--out", type=str, default=None,
                    help="output dir; if omitted, derived from the input path "
                         "(stories/<name>/... -> dist/stories/<name>/audio/)")
    sp.add_argument("--also-wav", action="store_true",
                    help="also write a .wav next to each .pcm for easy preview")
    sp.add_argument("--force", action="store_true",
                    help="re-synth chunks even if the .pcm already exists")
    sp.add_argument("--limit-chunks", type=int, default=None,
                    help="render only the first N chunks of each input "
                         "(cost-conserving first-pass renders; rest can be "
                         "filled in later — caching makes this cheap)")
    sp.add_argument("--stop-on-error", action="store_true")
    sp.add_argument("--api-key", type=str, default=None,
                    help="ElevenLabs API key (else read from ELEVENLABS_API_KEY / .env)")
    sp.set_defaults(func=cmd_synth)

    # concat
    sp = sub.add_parser("concat", help="concatenate per-chunk .pcm files into a full-chapter file")
    _add_chapter_selection(sp)
    _add_language_flag(sp)
    sp.add_argument("--out", type=str, default=None,
                    help="output dir; if omitted, derived from the input path "
                         "(stories/<name>/... -> dist/stories/<name>/audio/)")
    sp.add_argument("--wav", action="store_true", help="also emit a wrapped .wav")
    sp.add_argument("--gap-ms", type=int, default=350,
                    help="silence between chunks in milliseconds (default: 350)")
    sp.set_defaults(func=cmd_concat)

    # book
    sp = sub.add_parser(
        "book",
        help="assemble every chapter's *_full.pcm into a single book-length file "
             "(run `concat` for each chapter first)",
    )
    sp.add_argument("--out", type=str, default=None,
                    help="directory holding per-chapter subdirs, "
                         "e.g. dist/stories/zelda/audio")
    sp.add_argument("--wav", action="store_true", help="also emit a wrapped .wav")
    sp.add_argument("--chapter-gap-ms", type=int, default=1500,
                    help="silence between chapters in ms (default: 1500 — noticeably "
                         "longer than the intra-chapter chunk gap of 350-500 ms)")
    sp.add_argument("--filter", type=str, default=None,
                    help="glob pattern for chapter full files, relative to --out "
                         "(default: '*/*_full.pcm'). Use to scope when multiple "
                         "languages share one out dir, e.g. --filter 'kapitel_*/*_full.pcm'")
    sp.add_argument("--output-name", type=str, default="book",
                    help="filename stem for the assembled book (default: 'book')")
    sp.set_defaults(func=cmd_book)

    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
