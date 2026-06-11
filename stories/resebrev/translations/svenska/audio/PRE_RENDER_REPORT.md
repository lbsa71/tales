# Förhandsrapport — svensk ljudbok

Körd med:

```bash
stories/resebrev/tools/render-svenska-audio.sh chunks
```

## Sammanfattning

| Mått | Värde |
|---|---:|
| Kapitel | 22 |
| TTS-chunks | 223 |
| Tecken att rendera | 252 642 |
| Max per chunk | 1 450 tecken |
| Output | `dist/stories/resebrev/audio/sv/` |

## Status

Renderaren hittar alla 22 svenska kapitel och kan chunk:a dem utan API-anrop.

Detta är en infrastrukturkontroll, inte en produktionsklar ljudbokskontroll. Den rena svenska texten är fortfarande under översättning. Full rendering bör vänta tills kvarvarande engelska partier i kapitel 3, 6, 7, 9, 10, 12, 15, 16, 18, 20 och 21 är hanterade.

## Tekniska Noteringar

- Kapitelrubriker blir ofta en egen kort chunk. Det är acceptabelt för preview, men vid slutproduktion kan vi överväga att lägga `---` efter rubriken eller justera text-preppen om rubrikpauserna känns onaturliga.
- Kapitel 14 har en chunk över soft cap eftersom renderaren inte delar mitt i långa stycken. Det är väntat beteende.
- `preview` renderar endast första chunk i varje kapitel och är därför bäst för röst- och tempobeslut innan full kostnad tas.

## Rekommenderad Nästa Körning

```bash
stories/resebrev/tools/render-svenska-audio.sh preview
```

Kör först när `ELEVENLABS_API_KEY` finns i miljön eller i `tools/voice-renderer/.env`.
