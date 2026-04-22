# Swedish voice samples

Short auditions for the Swedish (`sv`) profile. **Anna** is the validated
default for the female female-narrator brief (zelda). Male voices are
kept here as alternates for the `unsung-heroes` translation and any
future work that wants a male narrator.

All samples rendered on `eleven_v3` via the `sv` profile (stability 0.55,
similarity_boost 0.75, style 0.15, speed 0.90). Same demo passage
across all voices for direct A/B comparison.

**Demo passage**: opening four paragraphs of
`stories/unsung-heroes/translations/svenska/kapitel/kapitel_01_replikatorerna.md`.
Source text preserved in `demo_passage.md` in this directory. The
passage is deliberately demanding — it includes biblical-archaic
Swedish (`varde`), fragment negation (`Inte mening. Inte syfte.`),
particle verbs (`sattes samman`, `löstes upp`), scientific vocabulary
(`bindningskonfiguration`), and rhythmic variation from staccato to
flowing.

## How to listen

```bash
# WAV (any player)
open voice_samples/swedish/ola_paulakoski.wav

# raw PCM (sox / ffplay)
play -t raw -r 24000 -b 16 -c 1 -e signed-integer voice_samples/swedish/ola_paulakoski.pcm
```

## Female voices

| File | Voice | ElevenLabs ID | Notes |
|---|---|---|---|
| `anna.*` | Anna — Clear and Melodic | `1Iztu4UHnTb9SUjJcpS1` | **`sv` profile default**, A/B-validated against the others on zelda chapter 1 |
| `louise.*` | Louise — Calm & Clear Narration | `kpTdKfohzvarfFPnwuHW` | calm, middle-aged female |
| `evelina.*` | Evelina — Calm, Clear and Engaging | `kPdGSxhZAqy4bmPAf9iJ` | warm, middle-aged female |
| `eva.*` | Eva — Calm and Resonant | `HqmZnnvy6tCQd8EGWKRT` | resonant, young female |

Note: the female samples were rendered against earlier Swedish chapter-1
content (zelda); the exact demo text wasn't preserved. For a 1:1
comparison, re-render them against `demo_passage.md`.

## Male voices

Rendered 2026-04-22 against `demo_passage.md`. All are labeled
`narrative_story` in the ElevenLabs shared library.

| File | Voice | ElevenLabs ID | Notes |
|---|---|---|---|
| `ola_paulakoski.*` | Ola Paulakoski — Natural, Soft and Warm | `ouhIFI5XkmBelRRcJe51` | relaxed, middle-aged; audiobook-suited |
| `max_baumgartner.*` | Max F. Baumgartner — Warm, Deep and Calm | `JhAQDwsLijg4qbxGNQGH` | deep and low, young; warm narration |
| `bengt.*` | Bengt — Calm and Soft | `kkwvaJeTPw4KK0sBdyvD` | calm tone, middle-aged; specifically labelled "Audiobook Narrator" |
| `adam_composer.*` | Adam Composer — Resonant and Smooth | `x0u3EW21dbrORJzOq1m9` | deep, resonant; Stockholm accent |
| `andrew_mcbeard.*` | Andrew McBeard | `hMTrLL2ZiyJiyKrdg2z4` | middle-aged; books, news, podcasts |
| `atlas.*` | Atlas | `nQnObYhERMRKcoUcZUyA` | calm, confident, natural; warmth and quiet authority; young |

**Not rendered**: Andreas (`TIMFVcMCO4bdy7J79GWF`) — previously listed
in `tools/voice-renderer/README.md` but now returns 404 from the
ElevenLabs shared-voices endpoint (voice withdrawn or made private).
Atlas filled the "calm, confident" slot in its place.

## Reproducing

```bash
cd tools/voice-renderer
for pair in \
  "ola_paulakoski:ouhIFI5XkmBelRRcJe51" \
  "max_baumgartner:JhAQDwsLijg4qbxGNQGH" \
  "bengt:kkwvaJeTPw4KK0sBdyvD" \
  "adam_composer:x0u3EW21dbrORJzOq1m9" \
  "andrew_mcbeard:hMTrLL2ZiyJiyKrdg2z4" \
  "atlas:nQnObYhERMRKcoUcZUyA"; do
  name="${pair%%:*}"; id="${pair##*:}"
  python3 reader.py synth --language sv --voice "$id" \
    --input voice_samples/swedish/demo_passage.md \
    --out /tmp/voice_audition_sv/"$name" --also-wav --force
  cp /tmp/voice_audition_sv/"$name"/demo_passage/chunk_000.pcm \
     voice_samples/swedish/"$name".pcm
  cp /tmp/voice_audition_sv/"$name"/demo_passage/chunk_000.wav \
     voice_samples/swedish/"$name".wav
done
```

## Browsing for more Swedish male voices

```bash
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" \
  "https://api.elevenlabs.io/v1/shared-voices?language=sv&gender=male&page_size=30" \
  | python3 -c "import json,sys; [print(v['voice_id'], '|', v['name'], '|', v.get('use_case','?')) for v in json.load(sys.stdin)['voices']]"
```

Full library UI: https://elevenlabs.io/app/voice-library
