# Seem — voice auditions (Swedish female narrator)

Auditions for the `seem` Swedish reading
(`stories/seem/translations/svenska.uppläsning/`). The brief: an
**older, experienced, slightly weary** female voice — a mother at a
kitchen table at night, telling her child her life.

**Finding**: the ElevenLabs shared library has **no native-Swedish
female voice tagged `old`** — the oldest age tag for the 12 native
Swedish female voices is `middle_aged`. (The only `old` female voices
support Swedish only as a secondary language and carry a foreign
accent.) So these four are the best `middle_aged` matches, leaning on
deep / calm / serious character plus a slowed pace for the weariness.

## Decision

**Sanna Hartfield — Calm and Soothing** (`aSLKtNoVBZlxQEMsnGL2`) chosen
for the seem reading. Wired into [`stories/seem/voice.json`](../../../../../stories/seem/voice.json).

## Samples

Rendered against the **opening chunk of `compiled/seem-upplasning-sv.md`**
(chunk 0, 1454 chars — the "Nej men sitt…" kitchen-table opening), so
all four are a direct A/B on the real material.

Settings: `sv` profile, `eleven_v3`, stability 0.55, similarity_boost
0.75, style 0.15, speaker_boost on, **speed 0.90** (profile default;
production `voice.json` nudges to 0.92).

| File | Voice | ElevenLabs ID | Age | Notes |
|---|---|---|---|---|
| `sanna_hartfield_calm.*` | Sanna Hartfield — Calm and Soothing | `aSLKtNoVBZlxQEMsnGL2` | middle_aged | **chosen**; calm, narrative, Stockholm |
| `annie.*` | Annie — Deep and Serious | `a2RZfOPKpyNO38vDv3DD` | middle_aged | deepest / most serious; weary gravitas |
| `louise_narration.*` | Louise — Calm & Clear Narration | `kpTdKfohzvarfFPnwuHW` | middle_aged | calm narration |
| `evelina.*` | Evelina — Calm, Clear and Engaging | `kPdGSxhZAqy4bmPAf9iJ` | middle_aged | warm |

## How to listen

```bash
open tools/voice-renderer/voice_samples/swedish/seem_auditions/sanna_hartfield_calm.wav
# raw PCM (24 kHz mono s16le):
play -t raw -r 24000 -b 16 -c 1 -e signed-integer \
  tools/voice-renderer/voice_samples/swedish/seem_auditions/sanna_hartfield_calm.pcm
```
