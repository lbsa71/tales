# Svensk ljudbok — Resebrev

Denna katalog innehåller infrastrukturen för den rena svenska ljudboksversionen av `Resebrev`.

Själva ljudfilerna ska inte ligga här. Renderaren skriver arbetsfiler till:

`dist/stories/resebrev/audio/sv/`

`dist/` är git-ignorerad. Källorna som ska läsas in ligger i:

`stories/resebrev/translations/svenska/kapitel/`

## Status

Ljudboksinfrastrukturen är på plats, men den svenska texten är ännu inte helt färdig för full produktion. Kapitel 14 och 17 har fått första ren-svenska översättningspasset; flera andra kapitel har fortfarande engelska repliker eller stycken som måste översättas innan slutrendering.

## Röstbeslut

Projektets röstkonfiguration ligger i [../../../voice.json](../../../voice.json).

För svensk ljudbok används tills vidare:

- **Röst**: Ola Paulakoski — Natural, Soft and Warm
- **Voice ID**: `ouhIFI5XkmBelRRcJe51`
- **Modell**: ärvd från `tools/voice-renderer` svenskprofil
- **Tempo**: `0.92`
- **Stabilitet**: `0.56`

Motivering: `Resebrev` är en manlig förstapersonsröst med muntlig energi, pinsam själviakttagelse och längre resonerande partier. Rösten bör vara varm och bärande men inte för teatral, inte för gammal, och inte radiomässigt polerad.

## Snabbkommandon

Från repo-roten:

```bash
# Se hur kapitel delas upp i TTS-chunks. Inga API-anrop.
stories/resebrev/tools/render-svenska-audio.sh chunks

# Provlyssna första chunk i varje kapitel. Kräver ELEVENLABS_API_KEY.
stories/resebrev/tools/render-svenska-audio.sh preview

# Rendera alla svenska kapitel till PCM + WAV-preview.
stories/resebrev/tools/render-svenska-audio.sh synth

# Sätt ihop varje kapitel till fullängdsfiler.
stories/resebrev/tools/render-svenska-audio.sh concat

# Sätt ihop hela boken till en fil.
stories/resebrev/tools/render-svenska-audio.sh book
```

## Direktkommandon

Renderaren kan också köras direkt:

```bash
python3 tools/voice-renderer/reader.py chunks \
  --language sv \
  --input stories/resebrev/translations/svenska/kapitel/

python3 tools/voice-renderer/reader.py synth \
  --language sv \
  --input stories/resebrev/translations/svenska/kapitel/ \
  --also-wav

python3 tools/voice-renderer/reader.py concat \
  --language sv \
  --input stories/resebrev/translations/svenska/kapitel/ \
  --wav \
  --gap-ms 450

python3 tools/voice-renderer/reader.py book \
  --out dist/stories/resebrev/audio/sv \
  --wav \
  --chapter-gap-ms 1800 \
  --output-name resebrev-svenska
```

## Produktionsordning

1. Gör svensk text helsvensk.
2. Kör `chunks` och kontrollera att inga kapitel får konstiga chunkgränser.
3. Kör `preview` och lyssna på första chunk i varje kapitel.
4. Justera `voice.json` om tempot eller rösten känns fel.
5. Kör `synth`.
6. Kör `concat`.
7. Lyssna kapitelvis och markera omtagningar i [QA.md](QA.md).
8. Kör `book` först när kapitelrenderingarna är godkända.

## Format

Renderaren producerar:

- `.pcm`: kanoniskt arbetsformat, 24 kHz mono s16le.
- `.wav`: lyssningsbar wrapper för kontroll.

MP3/M4B-master bör göras i ett separat masteringsteg när hela boken är godkänd.
