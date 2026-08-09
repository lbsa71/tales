# Kalenderregister

## Syfte

Det här registret samlar kalenderhändelser som kan komplettera journalernas bild av pappa och sonen. Det är ett urval, inte en kopia av privata kalendrar. Orelaterade möten, adresser, telefonnummer, bokningsnummer och uppgifter om andra familjemedlemmar har utelämnats.

Kalendern används framför allt till tre saker:

1. att datera resor och besök som journalen bara nämner i förbifarten,
2. att visa pappas plats i familjens vardag före sjukdomsförloppet,
3. att föra kronologin förbi journalmaterialets slut den 19 juni 2025.

## Källa och metod

- **K01:** Google Kalender-export gjord 9 augusti 2026. Exporten består av fem `.ics`-filer med sammanlagt 9 405 `VEVENT`-poster.
- De två innehållsrika filerna har 7 421 respektive 1 970 poster. Övriga tre har 13, 1 och 0 poster.
- Relevanta kontrollsummor, tolv första tecknen av SHA-256: familjekalender `6081cb586411`, personlig kalender `473e0429db25`.
- `stories/pappa/tools/index_ical.py` läser en händelse i taget och skapar separata lokala JSONL-index. Oförändrade källfiler återanvänds vid nästa körning; kalenderinnehållet kopieras inte till git.
- Dubbletter har jämförts med `UID`, starttid och rubrik. Händelserna nedan är därefter manuellt källkritiska urval.

Tider med suffixet `Z` i exporten har räknats om till svensk lokal tid. För heldagshändelser är `DTEND` exklusivt: en post 8-12 juni betyder normalt incheckning eller start den 8 och slut den 11.

## Hur säkert är ett kalenderfynd?

En kalenderpost visar säkert att någon skrev in eller importerade en plan, påminnelse eller bokning. Den visar inte ensam att allt faktiskt genomfördes. Där kalender och journal överlappar får journalen styra medicinska klockslag och händelseförlopp. Kalendern får styra sonens bokningar och resrutor, men inte hans känslor, samtal eller exakta närvaro utan ytterligare minne.

## Pappa i familjens vardag

| Tid | Kalenderns spår | Vad det kan bära i berättelsen |
|---|---|---|
| 17-26 augusti 2015 | `Pappa på sjukhus`, `Pappa hämta`, därefter `Pappa opereras`. | Belägger en äldre sjukhusperiod och operation, men inte vilken operation det var. Får inte utan mer underlag likställas med ryggoperationen. |
| 2016 | Besök med barnen hos pappa, fika och hjälp att installera en dator. | Pappa framträder som farfar och som en del av vardagen, inte bara som patient. |
| 2017-2019 | Ett stort antal poster om fika, barnpassning och besök: pappa passar barnen, kommer på fika eller hjälper familjen. | Ger ett återkommande vardagsmönster. Enskilda poster kan senare bli scener om sonen minns dem. |
| 2020-2023 | Semester, Göteborgsbesök, lunch, skjuts till Landvetter och flera fikaträffar. | Visar fortsatt regelbunden kontakt. Kalendern kan inte ensam avgöra när flytten till Öland skedde. |
| 5-8 maj och 19-22 oktober 2023 | Pappa kommer till Göteborg. | Daterbara besök under året då journalen också beskriver lungutredning och ungefärlig flytt. |
| 2-6 november 2023 | Sonen till Åland. | Gäller Åland, inte Öland, och ska inte användas som belägg för besök hos pappa. |
| 27-30 december 2023 | `Pappa och Christina kommer till Gbg`. | Belägger ett gemensamt Göteborgsbesök; relationen till Christina ska inte definieras utan mer underlag. |

## Operationen 2024

| Datum och lokal tid | Kalenderpost | Källkritisk användning |
|---|---|---|
| 23-26 februari | Sonen till Öland. | Ett besök före operationen. |
| 1-3 mars | Pappa kommer till Göteborg. | Ett besök ungefär en månad före ingreppet. |
| 3 april 10.00-13.00 | `Pappa skrivas in i Linköping`. | Daterar inskrivningen som kalenderplan. |
| 3 april 12.55-13.50 | Tågpost från Katrinelund C till Linköping. | Visar sonens planerade resa till Linköping. |
| 3 april eftermiddag-kväll | `Besökstid`, följt av hotellincheckning. | Kalendern visar en planerad vistelse i Linköping, men säger inget om samtalen. |
| 4 april 10.00-13.00 | `Pappa opereras`. | Ger datum åt FEVAR-operationen som journalen endast anger till 2024. Själva operationen beläggs också av journalen. |
| 4 april 14.00-19.00 | `Besökstid`; 15.45-18.45 `Pappa på Uppvak`. | Visar planerade besökstider och ett block för uppvakningsavdelningen. |
| 4 april 21.00-01.00 | Respost mot Kållered. | Talar för hemresa samma kväll/natt. |
| 19-22 april | Sonen till Öland. | Möjligt återbesök efter vårdtiden; syftet behöver bekräftas av sonen. |
| 10-12 maj | Pappa kommer till Göteborg. | Visar att ett Göteborgsbesök fanns i kalendern drygt en månad efter operationen. |
| 24-27 maj | Sonen på Öland. | Daterbart besök. |
| 27 maj | Påminnelser om att ringa pappa och om BankID samt läkarintyg till domstol och Transportstyrelsen. | Visar administrativa följder eller frågor efter vården, men inte vad som beslutades eller om samtalen genomfördes. |

## Det akuta förloppet i juni 2025

| Datum och lokal tid | Kalenderpost | Vad den tillför |
|---|---|---|
| 5 juni 19.00-20.00 | `Lars till intensiven Kalmar`. | Bekräftar att sonens kalender fångade akutöverföringen samma kväll. Rubriken är en påminnelse, inte ett medicinskt exakt klockslag. |
| 6 juni 23.00-00.00 | `Lars till Linköping HIA`. | Bekräftar destinationen. Tiden motsäger journalens ankomst 02.45 och får därför inte användas som transporttid. |
| 7-9 juni | En tidigare familjebokning på Strömma Farmlodge. | Visar vilken vardagsplan som låg i kalendern när sjukdomen bröt in. Om resan avbröts eller genomfördes behöver sonen berätta. |
| 8-11 juni | Hotellbokning på Quality Hotel Ekoxen samt heldagsposten `Stefan -> Linköping`. | Namnger hotellet och ramar in den första vistelsen. |
| 8 juni 14.10-17.50 | `Stefan -> Linköping`. | Daterar resan och stödjer journalens uppgift att sonen kom på kvällen. |
| 10 juni 19.00-20.00 | `Lars till avd 317 rum 35 Linköping`. | Daterar en avdelningsförflyttning som också ligger i journalförloppet. |
| 11 juni 15.30-16.20 | `Lars tillbaka på HIA`. | Sammanfaller med försämrad blodtryckskontroll och ny plan. |
| 11 juni 16.25-20.10 | `Stefan -> Göteborg`. | Fyller i den exakta hemresan efter den första vistelsen. |
| 13-15 juni | Hotellbokning i Linköping och familjeresa till Årdala. | M03 klargör rutten: familjen släppte av Stefan i Linköping på väg till svärfars sjuttioårsfirande. Följande dag tog han tåget till Flen. Journalen placerar honom på avdelningen den 14 juni; den exakta ordningen den dagen är inte fastställd. |
| 16 juni 11.00-18.00 | `Pappa opereras`. | Daterar familjens kalenderblock för operationen. Det är inte en operationsjournal och tiderna bör behandlas som ungefärliga. |
| 17 juni 11.45-13.45 | `Mamma intervention`. | M01 bekräftar att Stefan hittade sin mamma svårt medtagen i hemmet efter att familjen inte fått kontakt med henne. |
| 18 juni 08.00-08.50 | `Ringa Äldrevård`. | M01 klargör att posten gällde att ordna hjälp åt mamma. Stefan behövde nu organisera omsorg för båda föräldrarna. |

## Efter journalens sista sida

| Datum och lokal tid | Kalenderpost | Vad som faktiskt kan sägas |
|---|---|---|
| 24 juni 07.45-12.00 | Sonen reser mot Kalmar. | En ny resa sex dagar efter telefonsamtalet och fem dagar efter återtransporten. |
| 24 juni 12.00-15.30 | `HIA Kalmar`. | Sonens kalender avsätter tre och en halv timme på hjärtintensiven. M12 beskriver de återkommande orienteringsfrågorna och pappans minneslucka under perioden, men skiljer ännu inte säkert besökets exakta svar från övriga samtal. |
| 24 juni 15.30-17.00 | `Punka`. | M02 klargör att en fem centimeter lång metallskärva satt i däcket efter sjukhusbesöket. En bärgningsbil gjorde en provisorisk lagning. På uppresan hade bilen dessutom fått ett kraftigt stenskott i vindrutan. |
| 24 juni 17.00-23.00 | Respost mot Göteborg. | Ramar in den planerade hemresan; M02 beskriver att bilen fick halta hem på det provisoriskt lagade däcket. |
| 2 juli | `Pappa -> Åkerbohemmet`. | Visar en planerad eller genomförd övergång till Åkerbohemmet. Kalendern anger inte vårdformen i rubriken. |
| 5 juli 08.54-14.05 | Sonen mot Kalmar. | Ytterligare en resa i eftervårdsperioden; syftet är inte utskrivet. |
| 16 juli 10.00-11.00 | `Möte pappa åkerbohemmet`. | M10 identifierar detta som det svåra vårdsamtalet där pappa behövde förstå och acceptera inskrivningen; beslutet blev långtidsboende. |
| 17 juli | `Pappa från Korttidsboende`. | M10 klargör övergången till långtidsboende men inte om posten avser en fysisk flytt eller en ändrad vårdform på samma plats. |
| 8-11 augusti | Sonen, Hedvig och Lisa till Öland. | Planerat familjebesök efter korttidsperioden. |
| 12 augusti | `Äldrevård Mamma / Pappa`, med punkterna läkare/psykolog och äldrevård för pappa. | Visar pågående planering, inte utförda insatser. |
| 27 augusti | Pappas bil lämnas på verkstad. | Ett konkret praktiskt ansvar som sonen tog eller planerade. Registreringsnummer har utelämnats. |
| 5-8 september, 7 september | Sonen till Öland; `Frukost med pappa`. | Ett enkelt vardagsspår efter den akuta sommaren. |
| 15-18 oktober och 27-29 december | Pappa kommer till Göteborg. | Två planerade besök senare samma år. |
| 6 och 11 november | Betala pappas räkning, fråga mamma, ordna VVS samt lämna Lars bil på verkstad. | Visar sonens fortsatta praktiska omsorg. Exakt vad som genomfördes behöver bekräftas. |
| 14 december | `Åkerbohemmet -> Kalmar C`. | En förflyttning står i kalendern, men personen och sammanhanget framgår inte säkert av rubriken. |

## Senare kalenderpunkter utanför berättelsens ram

Kalendern innehåller även poster under 2026 om vård, resor och praktiska ärenden. De används inte i berättelsen, vars slutpunkt är senhösten 2025.

Exporten gjordes den 9 augusti 2026. Poster efter exportögonblicket är enbart framtidsplaner. Även äldre kalenderposter ska behandlas som planering tills sonen eller en annan källa bekräftar att de genomfördes.

## Poster som inte används

- `Pappa 70-årsfest` den 14-15 juni 2025 gäller av sammanhanget en annan pappa/morfar: en parallell post säger `fira morfar 70år`. Lars, född 1947, fyllde inte 70 år 2025.
- Generella resor till Åland ska inte blandas ihop med Öland.
- Vaga vårdposter utan pappas namn har inte tagits med bara för att de råkar ligga nära i tid.

## Nya minnesfrågor

- Vad hände under resan och inskrivningen den 3 april 2024?
- Var sonen med när pappa vaknade den 4 april, och när inträffade fallet och hjärnblödningen?
- Vad hände på resorna till Öland den 19 april och 24 maj?
- Avbröts vistelsen på Strömma Farmlodge när pappa blev akut sjuk?
- Vad minns sonen av tåget eller bilen till Linköping den 8 juni och rummet på Ekoxen?
- Hur gick det att resa från Linköping den 11 juni när pappa just hade flyttats tillbaka till HIA?
- Hur såg dagarna 13-16 juni ut mellan Årdala, Linköping och Göteborg?
- Vilka svar gav pappa på orienteringsfrågorna under besöket på HIA i Kalmar den 24 juni?
- Vilka exakta former fick långtidsboendet efter mötet den 16 juli, och innebar den 17 juli en fysisk flytt inom eller från Åkerbohemmet?
