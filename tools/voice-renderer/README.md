# Reader — Swedish chapter narration via ElevenLabs

A small Python CLI that reads the Swedish chapters of *A Rabbit's Life*
(`translations/svenska/kapitel/`) out loud using the ElevenLabs TTS API.
Per-chunk output is raw 16-bit PCM so you can rework and re-concatenate
individual passages without re-rendering everything else.

No dependencies — stdlib only (`urllib`, `wave`, `argparse`).
Python 3.10+.

## Why `.pcm` as the base format

The default output is raw signed 16-bit little-endian mono at **24 kHz**
(`s16le`, 24 kHz, mono — this is what ElevenLabs returns when you ask
for `output_format=pcm_24000`). Raw PCM is the most reworkable option:

- Concatenation is a byte append: `cat a.pcm b.pcm > both.pcm`.
- Splicing is `dd` with byte offsets; 1 s = 48 000 bytes.
- Any tool (`ffmpeg`, `sox`, Audacity) can import it — you just tell it
  the sample rate, channels, and format once.

`--also-wav` writes an auditable `.wav` next to each `.pcm` for quick
preview in Finder/VLC, but the canonical artifact is the `.pcm`.

## Setup

```bash
# one-time: copy tools/reader/.env.example to tools/reader/.env and paste your key
cp tools/reader/.env.example tools/reader/.env
$EDITOR tools/reader/.env

# or: set it in your shell instead (env vars win over the .env file)
export ELEVENLABS_API_KEY=sk_...

cd tools/reader
python reader.py synth --chapter 1 --also-wav          # Swedish (default language)
python reader.py synth --language en --input ../../chapters/chapter_01_birth.md
```

Outputs land in `tools/reader/out/kapitel_01_fodelsen/`:

```
out/kapitel_01_fodelsen/
  chunks.json          # manifest: model, voice, settings, per-chunk text + status
  chunk_000.pcm        # first chunk (heading)
  chunk_000.wav        # optional preview, same audio wrapped with a WAV header
  chunk_001.pcm
  ...
```

Already-rendered output is skipped on re-run — **to regenerate
something, delete it**. See "Resume semantics" below for the details.

### Resume semantics — "delete what you want redone"

There are two levels of skip, in order:

1. **File-level fast path.** Before touching the API or even reading the
   API key, the tool computes the expected chunk count for the chapter
   and checks whether every `chunk_NNN.pcm` already exists in the output
   directory. If yes, the whole chapter is skipped with a single line:

   ```
   === kapitel_01_fodelsen: complete (12/12 chunks), skipping ===
   ```

   Zero API calls, zero characters billed.

2. **Chunk-level resume.** If some chunks exist and some don't (e.g. a
   previous run failed partway through, or you deleted a specific
   chunk), the tool enters the chapter and synthesises **only the
   missing** `.pcm` files. Existing chunks are logged as
   `skip (exists, ...)` and left alone.

To force regeneration:

| You want to redo... | Do this |
|---|---|
| One chunk | `rm out/<chapter>/chunk_NNN.pcm`, then re-run `synth` |
| One full chapter | `rm -rf out/<chapter>/`, then re-run `synth` |
| Everything for this run | add `--force` — ignores both skip layers |
| Only the final `*_full.pcm` | re-run `concat`; it always rewrites |

The manifest (`chunks.json`) is rewritten on every `synth` pass that
actually enters the chapter, so its `provider` / `model` / `voice_id` /
`voice_settings` fields always reflect the *most recent* run's settings —
but the individual `.pcm` files they reference may have been produced
by an earlier run if they were skipped. If you changed `--stability`
and want to verify it took effect, `--force` (or delete + re-run) the
specific chunks you care about.

## Subcommands

### `chunks` — preview segmentation, no API calls, no characters spent

```bash
python reader.py chunks --chapter 1
python reader.py chunks --all --max-chars 1200
```

Prints the chunk table (index, section, part, length, first 80 chars) so
you can tune `--max-chars` before spending any ElevenLabs character quota.

### `synth` — generate audio

```bash
# a single file
python reader.py synth --input translations/svenska/kapitel/kapitel_01_fodelsen.md

# a whole directory (non-recursive, meta files like README.md are skipped)
python reader.py synth --input translations/svenska/kapitel/

# or, as a shortcut for the Swedish kapitel dir:
python reader.py synth --chapter 1
python reader.py synth --chapters 1,3,5-7
python reader.py synth --all
```

### `concat` — assemble a full-chapter file

```bash
# produces out/kapitel_01_fodelsen/kapitel_01_fodelsen_full.pcm
python reader.py concat --chapter 1

# also emit a playable .wav, with 500 ms of silence between chunks
python reader.py concat --chapter 1 --wav --gap-ms 500
```

Or, if you prefer the shell:

```bash
cd out/kapitel_01_fodelsen
cat chunk_*.pcm > kapitel_01_fodelsen_full.pcm
```

## Playing `.pcm` files

Raw PCM has no header, so the player needs the format parameters:

```bash
# ffplay (from ffmpeg)
ffplay -f s16le -ar 24000 -ac 1 chunk_000.pcm

# sox
play -t raw -r 24000 -b 16 -c 1 -e signed-integer chunk_000.pcm

# wrap into a WAV on the fly for any player
ffmpeg -f s16le -ar 24000 -ac 1 -i chunk_000.pcm chunk_000.wav
```

Or just pass `--also-wav` at synth time.

---

## Language profiles

The tool bundles voice + tuned voice_settings into a **language profile**,
selected with `--language`. Each language has a voice, a model, and
default `voice_settings` values. Individual flags (`--voice`,
`--stability`, `--style`, etc.) override **just that field** of the
profile; everything else comes from the profile.

| Language | Voice (profile default) | Voice ID | Validated? |
|---|---|---|---|
| `sv` (Swedish, default) | Anna — Clear and Melodic | `1Iztu4UHnTb9SUjJcpS1` | ✅ A/B'd against Louise, Evelina, Eva on real chapter-1 content |
| `en` (English) | Mira — Calm Grounded British Voice | `DVxf8tkOIac2UAoDXYVS` | ⚠️ tentative — label-picked, **not yet A/B'd**. See `tools/reader/out/chapter_01_birth/chapter_01_birth_full.wav` for a real-content rendering and decide. |

Every profile ships these tuned defaults (same values across languages
right now — calibrated on the Swedish content, inherited as starting
points for English):

- `model`: `eleven_multilingual_v2`
- `stability`: 0.55
- `similarity_boost`: 0.80
- `style`: 0.15
- `use_speaker_boost`: on
- `max_chars`: 1500 (chunking soft cap)

On every `synth` run the resolved profile is printed to stdout, e.g.:

```
language=sv (Swedish), model=eleven_multilingual_v2,
voice=1Iztu4UHnTb9SUjJcpS1 (Anna — Clear and Melodic),
stability=0.55, style=0.15
```

When the profile's voice is overridden with `--voice`, the voice label
is shown as `(custom)` to make it visually obvious you're not running
the profile's validated voice.

### Adding a language

Edit the `LANGUAGE_PROFILES` dict at the top of `reader.py`. No other
code changes needed — `--language` is a dynamic `choices=` list
generated from the dict keys.

```python
LANGUAGE_PROFILES = {
    "sv": { ... },
    "en": { ... },
    "de": {
        "language_name": "German",
        "model": "eleven_multilingual_v2",
        "voice_id": "<some German professional voice>",
        "voice_name": "Helga — Calm",
        "stability": 0.60,
        "similarity_boost": 0.80,
        "style": 0.12,
        "use_speaker_boost": True,
        "max_chars": 1500,
        "validated": False,
    },
}
```

Set `validated: False` until you've actually listened to a real-content
render — the tool will print a `NOTE: the 'xx' profile is tentative`
warning on every `synth` run so you don't forget.

### A/B'ing a new voice without committing the profile

You don't need to edit the profile to audition a voice. Just override
with `--voice`:

```bash
# render chapter 1 with Dr Alice instead of Mira, everything else from the en profile
python reader.py synth --language en \
  --input chapters/chapter_01_birth.md \
  --voice l2qjqoUskg4poHSh4wMx \
  --out /tmp/abtest/dr_alice
```

Once you like a voice, change `voice_id` in the profile and flip
`validated` to `True`.

---

## All configuration options

Every setting you can tweak, in one place.

### Input selection (all subcommands)

| Flag | Meaning |
|---|---|
| `--input PATH` | A single `.md` file **or** a directory of `.md` files (non-recursive). This is the general-purpose flag — use it for anything. |
| `--chapter N` | Just Swedish chapter N (e.g. `--chapter 1`) — shortcut scoped to `translations/svenska/kapitel/` |
| `--chapters 1,3,5-7` | Swedish chapters by number, comma list and ranges |
| `--all` | All Swedish chapters in `translations/svenska/kapitel/` |

When `--input` is pointed at a **directory**, the tool enumerates `*.md`
files in that directory (not recursively) and skips:

- hidden files (leading dot)
- subdirectories
- non-`.md` files
- **meta files with ALL-UPPERCASE stems**: `README.md`, `LICENSE.md`,
  `STYLE_GUIDE.md`, `TRANSLATION_PLAN.md`, `CLAUDE.md`, etc. The
  heuristic is "stem matches `^[A-Z][A-Z0-9_]*$`", which catches the
  repo-doc naming convention used throughout this project.

So `--input translations/svenska/kapitel/` processes all ten chapters
and ignores the README. `--input chapters/` would process the English
chapters the same way. Pointing at a directory that also contains
lowercase-stem reference files (e.g. `felis_catus.md`,
`oryctolagus_cuniculus.md`) will include those — if you don't want
them, point at a narrower directory or use `--input <specific-file>`.

### Chunking

| Flag | Default | Meaning |
|---|---|---|
| `--max-chars N` | `1500` | Soft cap per chunk. `---` section boundaries are always hard; within a long section we pack whole paragraphs greedily until we'd exceed `N`. A single paragraph longer than `N` is kept whole rather than sliced mid-sentence. |

Smaller chunks = more API calls but faster retries and finer rework
granularity. For ElevenLabs you also get a natural prosody reset at each
chunk boundary, which can be good (cleaner pacing) or bad (loses long-arc
momentum). `1500` is a good middle ground for this text.

### Language (`--language`, `--lang`)

Selects which **profile** to use. Default: `sv`. See the Language
profiles section above for what a profile contains and how to add one.

```bash
python reader.py synth --language sv --chapter 1
python reader.py synth --language en --input chapters/chapter_01_birth.md
```

All the field-level flags below (`--voice`, `--model`, `--stability`,
etc.) are **overrides** against the selected profile — they're optional
and layered on top.

### Model (`--model`)

Profile default: **`eleven_multilingual_v2`** — stable, production-grade,
excellent prosody across languages, predictable voice settings.

Alternatives worth trying:

| Model | Notes |
|---|---|
| `eleven_multilingual_v2` | Default. Best speed/quality/consistency balance. |
| `eleven_multilingual_v1` | Older. Slightly worse prosody, cheaper character cost on some tiers. |
| `eleven_turbo_v2_5` | Faster, cheaper (~50% character cost), multilingual. Quality drop is audible on long-form narration. |
| `eleven_v3` | Alpha model with richer emotional expression and `<break time="1.5s"/>` / emotion tag support. Not stable, voice_settings behave differently. |

```bash
python reader.py synth --chapter 1 --model eleven_turbo_v2_5
python reader.py synth --chapter 1 --model eleven_v3
```

### Voice (`--voice`)

Each language profile ships a validated or tentative voice ID. You can
override it with any ElevenLabs `voice_id` — shared-library voice IDs
work directly for TTS without being pre-added to your personal library.

```bash
# use Louise instead of Anna for Swedish
python reader.py synth --language sv --chapter 1 --voice kpTdKfohzvarfFPnwuHW

# try Dr Alice for English
python reader.py synth --language en --input chapters/chapter_01_birth.md \
  --voice l2qjqoUskg4poHSh4wMx
```

**Swedish alternatives** (all female professional voices labeled
`language=sv`, `narrative_story` or similarly calm):

| Voice ID | Name | Tone |
|---|---|---|
| `1Iztu4UHnTb9SUjJcpS1` | Anna — Clear and Melodic | poetic, young female (**sv profile default**) |
| `kpTdKfohzvarfFPnwuHW` | Louise — Calm & Clear Narration | calm, middle-aged female |
| `kPdGSxhZAqy4bmPAf9iJ` | Evelina — Calm, Clear and Engaging | warm, middle-aged female |
| `HqmZnnvy6tCQd8EGWKRT` | Eva — Calm and Resonant | resonant, young female |
| `ouhIFI5XkmBelRRcJe51` | Ola Paulakoski — Natural, Soft and Warm | soft, middle-aged male |
| `TIMFVcMCO4bdy7J79GWF` | Andreas — Swedish, Deep, Calm | deep, middle-aged male |

**English alternatives** (female, narrative_story, for the same "calm
poetic narrator" brief as Swedish):

| Voice ID | Name | Tone |
|---|---|---|
| `DVxf8tkOIac2UAoDXYVS` | Mira — Calm Grounded British Voice | calm, young British (**en profile default, tentative**) |
| `l2qjqoUskg4poHSh4wMx` | Dr Alice — Clear, Resonant, Articulate | resonant, middle-aged Canadian |
| `vFGMZkgYSmUshOKNyTXb` | Madeline — Professional Narrator | professional, middle-aged American |
| `zhoqoRb56kaT8dDbwmNV` | Alex — Neutral British Female Narrator | neutral, young British |

Browse the full library at https://elevenlabs.io/app/voice-library. You
can also clone your own voice (Instant Voice Cloning takes a minute) and
use the resulting ID.

To list all the Swedish voices via the API:

```bash
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" \
  "https://api.elevenlabs.io/v1/shared-voices?language=sv&category=professional&page_size=30" \
  | python3 -c "import json,sys; [print(v['voice_id'], v['name']) for v in json.load(sys.stdin)['voices']]"
```

### Voice settings (`--stability`, `--similarity-boost`, `--style`, `--no-speaker-boost`)

These are ElevenLabs' four `voice_settings` knobs, passed straight through.

| Flag | Range | Default | What it does |
|---|---|---|---|
| `--stability` | 0.0–1.0 | **0.55** | Higher = flatter, more consistent, more monotone. Lower = more emotional range but riskier (ElevenLabs may insert sighs, breaths, ad-libs). For literary narration, `0.5–0.7` is the sweet spot. Below `0.3` and the model starts improvising. |
| `--similarity-boost` | 0.0–1.0 | **0.80** | How hard to pin the output to the source voice's timbre. Higher = more faithful to the voice, lower = the model is freer to diverge. `0.75–0.85` is typical. |
| `--style` | 0.0–1.0 | **0.15** | v2-only stylistic exaggeration. `0.0` = flat neutral; `0.3+` starts to feel performative. For this meditative text, keep it low (`0.10–0.20`). Higher values also cost more latency. |
| `--no-speaker-boost` | flag | off | Disables `use_speaker_boost`, which is ElevenLabs' clarity/presence enhancement. Leave it on unless you notice artifacts. |

Example — slightly more expressive take:

```bash
python reader.py synth --chapter 8 \
  --stability 0.45 --similarity-boost 0.85 --style 0.22
```

Example — maximally flat, clinical read for chapter 9:

```bash
python reader.py synth --chapter 9 \
  --stability 0.75 --style 0.05
```

### Language

ElevenLabs multilingual models **auto-detect language from the input
text** — there's no language flag, no system prompt. Feed Swedish text,
get Swedish narration. The model also handles code-switching (an English
proper noun inside a Swedish sentence is pronounced correctly).

If you want the same tool to read an English chapter, point it at the
English markdown:

```bash
python reader.py synth --input chapters/chapter_01_birth.md
```

Voice quality in the non-native language depends on the voice. Anna is a
Swedish-native professional voice, so she'll sound native in Swedish and
accented in English. Pick an English-native voice for English chapters.

### Speed / pacing

ElevenLabs' `eleven_multilingual_v2` doesn't expose a direct speed
parameter. Three levers, in order of usefulness:

1. **Inline pauses** — embed `<break time="1.5s" />` tags directly in
   the source text. ElevenLabs parses these and inserts exact silence.
   Max 3 seconds per break, max ~10 breaks per request. Useful for the
   slow, weighted passages in chapters 8–9.

   ```text
   Moderdoft bleknar med varje ljus-passage. <break time="1.2s" />

   Där moderpäls tryckte från alla håll, öppnas tomrum nu.
   ```

   You can edit the chapter markdown directly, or maintain a separate
   "narrated" copy if you don't want these in the published text.

2. **Post-process the PCM with ffmpeg** — exact, quality-preserving time
   stretching that won't touch pitch:

   ```bash
   # 0.92x = 8% slower
   ffmpeg -f s16le -ar 24000 -ac 1 -i chunk_005.pcm \
     -af atempo=0.92 -f s16le chunk_005_slow.pcm

   # 1.1x = 10% faster
   ffmpeg -f s16le -ar 24000 -ac 1 -i chunk_005.pcm \
     -af atempo=1.1 -f s16le chunk_005_fast.pcm
   ```

   `atempo` accepts 0.5–2.0 per filter; chain them for larger changes.

3. **Use `eleven_v3`** — the alpha v3 model does accept a `speed`
   parameter in voice_settings (range 0.7–1.2) and also supports richer
   emotion tags like `[soft]`, `[whisper]`, `[sigh]` inline. Less stable
   than v2, but worth experimenting with for specific chapters.

### Chunk silence gap (`concat --gap-ms`)

Default: `350` ms of silence between chunks when concatenating. Good for
paragraph breaks. For heavier section breaks (between `---` markers in
the original), you can bump this up or manually re-concat subsets with a
bigger gap.

### API key (`--api-key` / `ELEVENLABS_API_KEY`)

Prefer the env var. The CLI flag exists mostly for automation.

```bash
export ELEVENLABS_API_KEY=sk_...
# or
python reader.py synth --chapter 1 --api-key sk_...
```

---

## Cost-efficient iterative workflow

ElevenLabs bills **per character of input text** (the `text` field you
send), regardless of model or output format. On the Creator tier that's
131,000 characters/month. The full Swedish story is roughly 46,000
characters total — so **one full render of all ten chapters costs
~35% of your monthly quota**. You have meaningful budget to iterate,
but not infinite. Here's how to spend it smartly.

### 1. Always `chunks` before `synth`

The `chunks` subcommand is free (no API call). Run it whenever you
change `--max-chars`, edit a chapter, or aren't sure what will be sent:

```bash
python reader.py chunks --chapter 1 --max-chars 1500
```

Every character you see in the table is a character you'll be billed
for. If a chunk looks absurdly long, fix the source or lower
`--max-chars` before spending anything.

### 2. Calibrate voice settings on one short chapter first

Don't dial in `--stability`, `--style`, etc. by rendering all ten
chapters. Pick the shortest chapter with representative tone —
`kapitel_03_forsta_jorden.md` is ~600 words, `kapitel_01_fodelsen.md`
is ~1000 — and iterate there:

```bash
# first pass with defaults
python reader.py synth --chapter 3 --also-wav

# didn't love it? try different settings, force re-render ONE chapter
python reader.py synth --chapter 3 --stability 0.65 --style 0.10 --force

# still not right? nudge again
python reader.py synth --chapter 3 --stability 0.60 --style 0.18 --force
```

One full chapter 3 render ≈ 3,500 chars. You can A/B four or five
configurations for the cost of rendering a single chapter twice.

### 3. Calibrate on ONE chunk, not a whole chapter

Even better: when A/B-ing voices or settings, re-render only a single
chunk. Delete the `.pcm` you want to regenerate, leave the rest:

```bash
rm out/kapitel_03_forsta_jorden/chunk_004.pcm
python reader.py synth --chapter 3 --stability 0.65   # only 004 re-renders
```

A single chunk is 200–1500 chars. This is how you tune without burning
quota.

### 4. Stage chapters 1 → 10 in order, review between

Don't bulk-render everything in one go. Render chapter 1, listen end to
end (`concat --chapter 1 --wav`), decide if the voice direction works,
THEN proceed. Chapters 1–3 set the reader's baseline; chapters 8–10
shift tonally (illness, death, aftermath) and may want different
settings. Render them in groups and let each group inform the next:

```bash
# baseline
python reader.py synth --chapters 1-3 --also-wav
python reader.py concat --chapters 1-3 --wav
# listen...

# middle years — same settings likely fine
python reader.py synth --chapters 4-7 --also-wav
python reader.py concat --chapters 4-7 --wav

# illness + death — likely want higher stability, lower style, maybe more breaks
python reader.py synth --chapters 8-9 \
  --stability 0.70 --style 0.10 --also-wav

# aftermath — gradually simplifying, potentially different voice_settings
python reader.py synth --chapter 10 \
  --stability 0.72 --style 0.08 --also-wav
```

Every chunk that's already rendered is skipped automatically on re-run,
so you can freely experiment with `--stability` on chapter 8 without
touching chapters 1–7.

### 5. Never `--force --all`

That's the one command that can blow through your monthly quota in a
single invocation. If you need to re-render everything with new
settings, do it chapter by chapter with explicit `--force`:

```bash
python reader.py synth --chapter 1 --force --stability 0.60
# listen, verify
python reader.py synth --chapter 2 --force --stability 0.60
# etc.
```

### 6. Monitor character usage

```bash
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/user/subscription \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"{d['character_count']}/{d['character_limit']} used this period\")"
```

Run this before and after a batch. The manifest's `chars` field per
chunk also lets you compute exactly what you spent locally:

```bash
python3 -c "
import json, sys
m = json.load(open('tools/reader/out/kapitel_01_fodelsen/chunks.json'))
total = sum(c['chars'] for c in m['chunks'] if c['status'] == 'ok')
print(f'chapter 1: {total} chars')
"
```

### 7. Approximate character budget per chapter

Use the `wc` output as a sanity check — ElevenLabs is billed on the
text actually sent (after markdown stripping, so headings and `---`
separators aren't billed, but paragraph whitespace is):

| Chapter | ~chars |
|---|---|
| 01 Födelsen | ~6,200 |
| 02 Första världen | ~3,800 |
| 03 Första jorden | ~3,900 |
| 04 Årstiderna | ~4,000 |
| 05 Bobyggandet | ~5,900 |
| 06 Mellanåren | ~4,000 |
| 07 Förändringen | ~4,400 |
| 08 Frånvaron | ~5,100 |
| 09 En kropp | ~4,700 |
| 10 Återkomsten | ~4,900 |
| **Total** | **~46,900** |

Run `python reader.py chunks --all` for the exact figures on your
current source.

---

## Reworking a single chunk

1. Edit the chapter markdown.
2. Preview the new chunking: `python reader.py chunks --chapter 3`.
3. Delete the chunks that changed: `rm out/kapitel_03_forsta_jorden/chunk_004.pcm`.
4. Re-run `synth` for that chapter — existing chunks are skipped,
   missing ones are re-rendered. Or pass `--force` to redo everything.
5. Re-run `concat` to assemble the full chapter.

The manifest `chunks.json` records the exact source text, model, voice,
and voice_settings used for each chunk, so you can always tell what
produced a given `.pcm`.

## Security note

Never commit your API key. `ELEVENLABS_API_KEY` lives in your shell
environment, not in the repo. The `out/` directory and all `*.pcm` /
`*.wav` files under `tools/reader/` are git-ignored.

## Limitations

- **No streaming.** ElevenLabs supports streaming but we use the
  buffered endpoint — simpler to retry and easier to resume. For a
  ~1500 char chunk the buffered response takes only a couple of
  seconds, so there's no latency argument for streaming here.
- **One voice per run.** If you want different voices per chapter,
  run `synth` multiple times with different `--voice`. The manifest
  tracks which voice produced which chunk.
- **Character billing on retries.** ElevenLabs bills per request, so a
  failed-then-retried chunk costs twice. The `--stop-on-error` flag
  halts on the first failure if you want to diagnose before spending
  more.
