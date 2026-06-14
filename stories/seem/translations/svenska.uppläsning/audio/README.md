# Svensk uppläsning — Seem

Infrastrukturen för den svenska uppläsningsversionen av `Seem`.

Själva ljudfilerna ligger inte här. Renderaren skriver arbetsfiler till:

`dist/stories/seem/audio/sv/`

`dist/` är git-ignorerad. Källtexten som läses in ligger i:

`stories/seem/translations/svenska.uppläsning/kapitel/`

## Röstbeslut

Röstkonfigurationen ligger i [`../../../voice.json`](../../../voice.json).

- **Röst**: Sanna Hartfield — Calm and Soothing
- **Voice ID**: `aSLKtNoVBZlxQEMsnGL2`
- **Modell**: `eleven_v3`
- **Tempo**: `0.92` (sv-profilens default är 0.90; nudgad en aning snabbare)
- **Stabilitet / similarity / style**: ärvs från sv-profilen (0.55 / 0.75 / 0.15)

Motivering: monologen är en äldre kvinna vid ett köksbord på natten som
berättar sitt liv för sitt barn — innerlig, sliten, lågmäld. Briefen var
**äldre, erfaren, lite trött**. ElevenLabs delade bibliotek har ingen
infödd svensk kvinnoröst taggad `old`; Sanna (`middle_aged`, lugn,
Stockholm, narration) plus ett nedskruvat tempo är den valda
approximationen. Audition-jämförelsen finns sparad i
[`tools/voice-renderer/voice_samples/swedish/seem_auditions/`](../../../../../tools/voice-renderer/voice_samples/swedish/seem_auditions/).

## Status

Alla 7 kapitel är renderade i chunks, ihopsatta till `*_full`-filer och
assemblerade till `seem-svenska-upplasning_full.wav` (~79 min) i `dist/`.

## Rendera om efter textredigeringar

Renderaren cachar per chunk på **textens innehållshash** (`text_sha256` i
`chunks.json`), inte bara på om `.pcm` finns. Så efter att ha redigerat en
kapiteltext: kör `synth` igen och bara de chunks vars text faktiskt ändrats
renderas om — resten skippas. Föräldralösa chunks (om en redigering krymper
kapitlet) städas bort automatiskt.

Förhandsgranska vad som skulle renderas om, utan API-anrop eller kostnad:

```bash
python3 tools/voice-renderer/reader.py synth \
  --language sv \
  --input stories/seem/translations/svenska.uppläsning/kapitel/ \
  --check
```

## Kommandon

Från repo-roten. Rösten/tempot styrs av `stories/seem/voice.json`, så
inga `--voice`-flaggor behövs.

```bash
# Se chunk-uppdelning (inga API-anrop).
python3 tools/voice-renderer/reader.py chunks \
  --language sv \
  --input stories/seem/translations/svenska.uppläsning/kapitel/kapitel_01_fel-sorts-man.md

# Rendera ett kapitel till PCM + WAV-preview.
python3 tools/voice-renderer/reader.py synth \
  --language sv \
  --input stories/seem/translations/svenska.uppläsning/kapitel/kapitel_01_fel-sorts-man.md \
  --also-wav

# Sätt ihop kapitlets chunks till en fullängdsfil.
python3 tools/voice-renderer/reader.py concat \
  --language sv \
  --input stories/seem/translations/svenska.uppläsning/kapitel/kapitel_01_fel-sorts-man.md \
  --wav --gap-ms 450

# Hela uppläsningen (alla kapitel) i ett svep:
python3 tools/voice-renderer/reader.py synth \
  --language sv \
  --input stories/seem/translations/svenska.uppläsning/kapitel/ \
  --also-wav
```

Default-output (`dist/stories/seem/audio/sv/`) härleds automatiskt av
renderaren från input-sökvägen — inget `--out` behövs.

## Format

- `.pcm`: kanoniskt arbetsformat, 24 kHz mono s16le.
- `.wav`: lyssningsbar wrapper för QA.
