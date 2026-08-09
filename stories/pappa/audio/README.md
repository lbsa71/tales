# Svensk ljudbok — Pappa

Den här katalogen innehåller infrastrukturen för den svenska ljudboksversionen av `Pappa`.

Själva ljudfilerna ligger inte i Git. Renderaren skriver arbetsfiler till:

`dist/stories/pappa/audio/sv/`

Källtexten som läses in ligger i:

`stories/pappa/chapters/`

## Status

Ljudboksinfrastrukturen är på plats. Manuset är fortfarande ett kronologiskt råmanus, så gör en provlyssning innan hela boken renderas.

## Röstbeslut

Röstkonfigurationen ligger i [`../voice.json`](../voice.json) och speglar den svenska profilen för `Resebrev`.

- **Röst**: Torsten
- **Voice ID**: `iCEMyUhOwgAy0egMANye`
- **Modell**: `eleven_v3`
- **Tempo**: `0.92`
- **Stabilitet**: `0.56`
- **Similarity boost**: `0.75`
- **Style**: `0.12`
- **Maximal chunkstorlek**: `1450` tecken

## Snabbkommandon

Från repo-roten på macOS/Linux eller i Git Bash:

```bash
# Kontrollera chunkindelningen utan API-anrop eller kostnad.
bash stories/pappa/tools/render-svenska-audio.sh chunks

# Rendera första chunken i varje kapitel för provlyssning.
bash stories/pappa/tools/render-svenska-audio.sh preview

# Rendera alla kapitel till PCM och WAV.
bash stories/pappa/tools/render-svenska-audio.sh synth

# Sätt ihop chunks till en fullängdsfil per kapitel.
bash stories/pappa/tools/render-svenska-audio.sh concat

# Sätt ihop kapitlen till pappa-svenska_full.wav.
bash stories/pappa/tools/render-svenska-audio.sh book
```

På Windows PowerShell används motsvarande kommandon:

```powershell
./stories/pappa/tools/render-svenska-audio.ps1 chunks
./stories/pappa/tools/render-svenska-audio.ps1 preview
./stories/pappa/tools/render-svenska-audio.ps1 synth
./stories/pappa/tools/render-svenska-audio.ps1 concat
./stories/pappa/tools/render-svenska-audio.ps1 book
```

Extra argument skickas vidare till renderaren. Exempelvis visar detta vilka chunks som skulle renderas om, utan API-anrop:

```powershell
./stories/pappa/tools/render-svenska-audio.ps1 synth --check
```

Renderaren återanvänder oförändrade chunks med hjälp av innehållshashar. Kör `book` först efter att `concat` har skapat samtliga kapitelfiler.

## Format

- `.pcm`: kanoniskt arbetsformat, 24 kHz mono s16le.
- `.wav`: lyssningsbar fil för kvalitetskontroll.
