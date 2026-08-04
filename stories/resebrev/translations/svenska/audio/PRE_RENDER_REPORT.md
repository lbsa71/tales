# Förhandsrapport — svensk ljudbok

Körd med:

```bash
stories/resebrev/tools/render-svenska-audio.sh chunks
```

## Sammanfattning

| Mått | Värde |
|---|---:|
| Källfiler | 27 |
| TTS-chunks | 202 |
| Tecken att rendera | 247 545 |
| Längsta chunk | 1 580 tecken |
| Output | `dist/stories/resebrev/audio/sv/` |

## Status

Renderaren hittar alla 27 svenska kapitel-, för- och eftertextfiler och kan chunka dem utan API-anrop.

Del 3 omfattar 10 källfiler, 82 TTS-chunks och 100 938 tecken. Den delen är helsvensk och har klarat editorial-, manifest- och chunkkontroll. Preview, full rendering och lyssnings-QA återstår.

Detta är fortfarande en infrastrukturkontroll, inte en produktionsklar kontroll av hela ljudboken. Full rendering av komplett bok bör vänta tills kvarvarande arbetskapitel i de tidigare delarna är färdiga.

## Tekniska Noteringar

- Kapitelrubrikerna läses ihop med inledningen i del 3; försättsbladet bildar en egen chunk.
- `voice.json` sätter ett mjukt tak på 1 450 tecken. En äldre chunk i kapitel 12 är 1 580 tecken eftersom renderaren inte delar mitt i långa stycken. Del 3 håller sig inom taket.
- `preview` renderar endast första chunk i varje kapitel och är därför bäst för röst- och tempobeslut innan full kostnad tas.

## Rekommenderad Nästa Körning

```bash
stories/resebrev/tools/render-svenska-audio.sh preview
```

Kör först när `ELEVENLABS_API_KEY` finns i miljön eller i `tools/voice-renderer/.env`.
