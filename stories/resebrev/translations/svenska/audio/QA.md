# Ljudbok QA — Resebrev svenska

## Före Rendering

- [ ] Alla engelska prosastycken är översatta till svenska.
- [ ] Engelska repliker är översatta eller ersatta med svensk återgivning.
- [ ] Kapitelrubrikerna matchar `audiobook.json`.
- [x] `stories/resebrev/tools/render-svenska-audio.sh chunks` har körts utan orimliga chunkar.
- [ ] Första chunk i varje kapitel har provlyssnats.
- [ ] Röst och tempo i `voice.json` är godkända.

## Kapitelkontroll

Del 1 är sammanfogad som `dist/stories/resebrev/audio/sv/resebrev-del-1_full.wav`.

Del 2 är sammanfogad som `dist/stories/resebrev/audio/sv/resebrev-del-2_full.wav`.

Del 3 har genomgått editorial-, översättnings- och fullrenderingspass. Lyssnings-QA återstår.

Hela del 3 är sammanfogad som `dist/stories/resebrev/audio/sv/resebrev-del-3_full.wav`.

Hela ljudboken är sammanfogad från de tre delmastrarna som `dist/stories/resebrev/audio/sv/resebrev-svenska_full.wav` (5 timmar, 14 minuter och 17 sekunder).

| Kapitel | Text klar | Preview | Full render | Lyssnat | Omtagningar |
|---|---:|---:|---:|---:|---|
| Försättsblad | ☑ | ☐ | ☑ | ☐ | Renderat för Del 1 |
| 1. Bombay | ☑ | ☑ | ☑ | ☐ | Rubrikfix: "Första kapitlet" |
| 2. Att lära sig säga nej | ☑ | ☑ | ☑ | ☐ | Omrenderat efter dialogrensning |
| 3. Ingen lyssnar på fattiga människor | ☑ | ☑ | ☑ | ☐ | Omrenderat efter dialogrensning |
| 4. Sista bussen ut | ☑ | ☐ | ☑ | ☐ | Omrenderat efter brygga |
| 5. Tio rupier | ☑ | ☐ | ☑ | ☐ | Omrenderat efter cloth/clothes-förtydligande |
| 6. Manu | ☑ | ☐ | ☑ | ☐ | Omrenderat efter replikfix |
| 7. Taj, eftersmaken | ☑ | ☐ | ☑ | ☐ | Första fullrender |
| 7b. Serge | ☑ | ☐ | ☑ | ☐ | Chunk 000 omrenderad efter tyskläcka; TTS-rubrik förenklad till "Mellanspel" |
| Eftertext till del 1 | ☑ | ☐ | ☑ | ☐ | Renderat för Del 1 |
| Försättsblad till del 2 | ☑ | ☐ | ☑ | ☐ | Renderat för Del 2-start |
| 8. Ganges | ☑ | ☐ | ☑ | ☐ | Omrenderat för Del 2-start efter markdown- och språkfix |
| 9. Uma | ☑ | ☐ | ☑ | ☐ | Chunk 000 omrenderad efter rubrik-/datumglidning; helfil uppdaterad |
| 10. Aili | ☐ | ☐ | ☐ | ☐ | |
| 11. Bhaktapur | ☐ | ☐ | ☐ | ☐ | |
| 12. Gautam | ☐ | ☐ | ☐ | ☐ | Innehåller nu Shidde Laxmi/Gautam-efterklang från tidigare kapitel 13 |
| Eftertext till del 2 | ☑ | ☐ | ☐ | ☐ | Skriven men inte renderad |
| Försättsblad till del 3 | ☑ | ☐ | ☑ | ☐ | En chunk; ny ram: "Eftersmak" |
| 14. Vilse i Goa | ☑ | ☐ | ☑ | ☐ | 17 chunkar; innehåller kort Raxaul/Kolkata-brygga från tidigare kapitel 13 |
| 15. Flockdjur | ☑ | ☐ | ☑ | ☐ | 10 chunkar |
| 16. Att lämna Indien | ☑ | ☐ | ☑ | ☐ | 5 chunkar; helt översatt till svenska |
| 17. Bangkokshowen | ☑ | ☐ | ☑ | ☐ | 14 chunkar; scenkatalog stramad |
| 18. Cheyenne | ☑ | ☐ | ☑ | ☐ | 10 chunkar; faktauppgifter om Angkor korrigerade |
| 19. Vardaglig fasa | ☑ | ☐ | ☑ | ☐ | 7 chunkar; faktauppgift om S-21 korrigerad |
| 20. Partyfolket | ☑ | ☐ | ☑ | ☐ | 9 chunkar; övergången mot hemresan stramad |
| 21. Hem | ☑ | ☐ | ☑ | ☐ | 7 chunkar; slutbrev översatt och redigerat |
| 22. Coda | ☑ | ☐ | ☑ | ☐ | 2 chunkar; ny coda från 2026 |

## Lyssningskriterier

- Berättaren låter som en vuxen uppläsare av en yngre mans resebrev, inte som en föreläsare.
- Ironi och skam landar torrt, utan överspel.
- Dialog blir begriplig men inte dramatiserad som radioteater.
- Pauser mellan chunks känns naturliga.
- Kapitelpauser är tydligt längre än vanliga styckespauser.
- Platsnamn, personnamn och indiska/thailändska termer uttalas acceptabelt.

## Omtagningar

Anteckna chunkar som ska renderas om här.

| Kapitel | Chunk | Problem | Åtgärd |
|---|---:|---|---|
| | | | |
