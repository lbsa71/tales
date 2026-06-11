# Ljudbok QA — Resebrev svenska

## Före Rendering

- [ ] Alla engelska prosastycken är översatta till svenska.
- [ ] Engelska repliker är översatta eller ersatta med svensk återgivning.
- [ ] Kapitelrubrikerna matchar `audiobook.json`.
- [ ] `stories/resebrev/tools/render-svenska-audio.sh chunks` har körts utan orimliga chunkar.
- [ ] Första chunk i varje kapitel har provlyssnats.
- [ ] Röst och tempo i `voice.json` är godkända.

## Kapitelkontroll

Del 1 är sammanfogad som `dist/stories/resebrev/audio/sv/resebrev-del-1_full.wav`.

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
| 7b. Serge | ☑ | ☐ | ☑ | ☐ | Chunk 000 omrenderad efter tyskläcka; rubrik ändrad till "Mellanspel: Serge" |
| Eftertext till del 1 | ☑ | ☐ | ☑ | ☐ | Renderat för Del 1 |
| 8. Ganges | ☑ | ☐ | ☑ | ☐ | Chunk 003-005 omrenderade efter Gangesflytt |
| 9. Uma | ☑ | ☐ | ☐ | ☐ | Gangesmaterial flyttat till kapitel 8; rendera |
| 10. Aili | ☐ | ☐ | ☐ | ☐ | |
| 11. Bhaktapur | ☐ | ☐ | ☐ | ☐ | |
| 12. Gautam | ☐ | ☐ | ☐ | ☐ | Innehåller nu Shidde Laxmi/Gautam-efterklang från tidigare kapitel 13 |
| 14. Vilse i Goa | ☐ | ☐ | ☐ | ☐ | Innehåller kort Raxaul/Kolkata-brygga från tidigare kapitel 13 |
| 15. Flockdjur | ☐ | ☐ | ☐ | ☐ | |
| 16. Att lämna Indien | ☐ | ☐ | ☐ | ☐ | |
| 17. Bangkokshowen | ☐ | ☐ | ☐ | ☐ | |
| 18. Cheyenne | ☐ | ☐ | ☐ | ☐ | |
| 19. Vardaglig fasa | ☐ | ☐ | ☐ | ☐ | |
| 20. Partyfolket | ☐ | ☐ | ☐ | ☐ | |
| 21. Hem | ☐ | ☐ | ☐ | ☐ | |
| 22. Coda | ☐ | ☐ | ☐ | ☐ | |

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
