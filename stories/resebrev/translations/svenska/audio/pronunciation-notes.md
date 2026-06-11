# Uttalsnoter — Resebrev svenska

Detta är en arbetslista för ord som bör provlyssnas tidigt. Alla kräver inte specialhantering, men de är värda att kontrollera innan full render.

## Platser

| Ord | Kommentar |
|---|---|
| Mumbai/Bombay | Behåll textens historiska `Bombay` där den står. |
| Rajasthan | Kontrollera att betoning inte blir för engelsk. |
| Srinagar | Viktigt återkommande ord i kapitel 3. |
| Ladakh | Kontrollera slutljud. |
| Leh | Risk för konstigt engelskt läsning. |
| Varanasi | Kontrollera betoning. |
| Kathmandu | Svensk text använder `Kathmandu`. |
| Bhaktapur | Kontrollera b/k-konsonanter. |
| Goa | Bör vara svenskt naturligt, inte engelskt utdraget. |
| Phnom Penh | Riskord för TTS; provlyssna kapitel 19 och 20. |
| Siem Reap | Riskord för TTS. |
| Khao San Road | Förekommer i Bangkokkapitlet. |

## Personer

| Ord | Kommentar |
|---|---|
| Faroukh | Kapitel 3. |
| Gautam | Återkommande; kontrollera att det inte blir för hårt svenskt. |
| Cheyenne | Risk att rösten läser det överdrivet engelskt. |
| Aili | Kontrollera tydlighet. |
| Udo | Kort namn, kan behöva provlyssnas. |

## Termer

| Ord | Kommentar |
|---|---|
| rickshaw | Vanligt låneord i texten; behåll om texten gör det. |
| tuk-tuk | Bör läsas rytmiskt och enkelt. |
| chai | Bör inte bli `kaj`. |
| thali | Kontrollera. |
| acid/syra | Svensk version bör i regel använda `syra`. |
| shanti | Kan accepteras som mantra/uttryck. |
| bom-bom | Bör läsas som replikerad slang, inte översättas bort. |

## Strategi

Om TTS misslyckas med ett återkommande ord:

1. prova lätt svensk omskrivning i texten,
2. prova bindestreck eller enklare fonetisk form bara om det inte stör läsningen,
3. rendera om enskild chunk genom att radera dess `.pcm` och köra `synth` igen.
