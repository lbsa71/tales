# Källregister

## Metod

De 27 PDF:erna är bildbaserade journalexporter utan textlager. De har OCR-lästs lokalt på svenska. Bärande uppgifter har kontrollerats visuellt mot sidbilderna. Vid fortsatt detaljredigering ska citat, doser, anatomiska termer och klockslag alltid kontrolleras direkt mot original-PDF:en.

En Google Kalender-export används som separat sekundärkälla K01. Den har indexerats händelsevis med `stories/pappa/tools/index_ical.py`, så att endast ändrade kalenderfiler behöver läsas om. Råkalendrarna och det lokala indexet kopieras inte till git. Urval, tider och källkritiska begränsningar finns i `KALENDERREGISTER.md`.

Stefans administrativa arbetsanteckningar används som källa A01 för tiden efter intensivvården. Råfilen innehåller autentiseringsuppgifter och annan mycket känslig information och kopieras inte till repot. Endast sanerade samtalsreferat, åtgärdskategorier och boendeuppgifter förs vidare. Urval och avgränsning finns i `ADMINISTRATIVT_REGISTER.md`.

Stefans uttryckligt tillförda minnen används som M-källor. De kan ge handlingar och upplevelser som inte dokumenterades av vården men hålls åtskilda från journalfakta. Minnesuppgifter och öppna gestaltningsfrågor samlas i `MINNESREGISTER.md`.

Käll-ID:n nedan är redaktionella och följer händelsernas kronologi, inte filernas namnordning.

## Källor

| ID | Datum och tid | Typ | Originalfil | Huvudsakligt innehåll |
|---|---|---|---|---|
| S01 | 5 juni 14:27 | Besöksanteckning | `Journalöversikt 20250605-1.pdf` | Årskontroll, blodiga upphostningar, nytillkommen bröstsmärta, akutremiss till Kalmar. |
| S02 | 5 juni 23:50 | Inskrivning | `Journalöversikt 20250605-2.pdf` | Typ B-dissektion, transport till Linköping, initial behandlingsplan. |
| S03 | 6 juni 07:14 | Ambulanssammanfattning | fil med suffix `(24)` | Natttransport Kalmar-Linköping, blodtryck och läkemedel. |
| S04 | 7 juni 21:46 | Omvårdnadsanteckning | fil med suffix `(23)` | Trötthet, andning, sängläge, väntan på sonen. |
| S05 | 8 juni 21:22 | Omvårdnadsanteckning | fil med suffix `(22)` | Svaga ben, smärta, oro, sonens ankomst. |
| S06 | 9 juni 04:17 | Omvårdnadsanteckning | fil med suffix `(21)` | Mardröm/hallucination om kidnappning och garage. |
| S07 | 9 juni 11:18 | Läkarsammanfattning | fil med suffix `(20)` | Bakgrund 2013-2024, sonens uppgifter om minne och förvirring. |
| S08 | 9 juni 13:18 | Omvårdnadsanteckning | fil med suffix `(19)` | Ostadighet, långsammare tankar, nutrition och njurfunktion. |
| S09 | 9 juni 20:51 | Omvårdnadsanteckning | fil med suffix `(18)` | Klarare efter vila, borstar tänderna själv. |
| S10 | 10 juni 11:30 | Omvårdnadsanteckning | fil med suffix `(17)` | Uttorkning, förstoppning, ny CT, middag med sonen. |
| S11 | 11 juni 12:21 | Omvårdnadsanteckning | fil med suffix `(16)` | Sonens oro för föreställda bråk och kognitiv förändring. |
| S12 | 11 juni 14:46 | Läkarsammanfattning | fil med suffix `(15)` | Hallucinationer, smärta, fyra millimeters diameterökning, sonen åter till Göteborg. |
| S13 | 11 juni 17:12 | Omvårdnadsanteckning | fil med suffix `(14)` | Åter till HIA, talande telemetridosa, tarmbehandling. |
| S14 | 12 juni 00:37 | Omvårdnadsanteckning | fil med suffix `(13)` | Blodtryck över 170, nattlig konfusion. |
| S15 | 12 juni 22:57 | Omvårdnadsanteckning | fil med suffix `(12)` | Stabilare tryck, svaga ben, mardrömmar. |
| S16 | 13 juni 15:59 | Intensivvårdsanteckning | fil med suffix `(11)` | Svårbehandlat blodtryck, planerat ingrepp, material- och platsfrågor. |
| S17 | 14 juni 10:18 | Omvårdnadsanteckning | fil med suffix `(10)` | Blodtryck/njurfunktion, mobilisering, sonen på plats. |
| S18 | 14 juni 13:04 | Omvårdnadsanteckning | fil med suffix `(9)` | Tillbaka från THUVA till HIA, möjlig operation den 16 juni. |
| S19 | 16 juni 08:31 | Slutanteckning HIA | fil med suffix `(8)` | Samlat vårdförlopp, diameterökning upp till en centimeter, operationsbeslut. |
| S20 | 16-19 juni | Vårdtillfälle kärlkirurgi | fil med suffix `(7)` | Administrativ tidsram för kärlkirurgisk vård. |
| S21 | 16 juni 17:30 | Operationsberättelse | fil med suffix `(6)` | Akut fenestrerad TEVAR och tekniskt genomförande. |
| S22 | 17 juni 23:45 | Jouranteckning | fil med suffix `(5)` | CT-fynd av stroke, samtal med pappans syster. |
| S23 | 18 juni 14:58 | Omvårdnadsanteckning | fil med suffix `(4)` | Mer vaken men desorienterad, telefonsamtal med syster och son. |
| S24 | 18 juni 21:01 | Omvårdnadsanteckning | fil med suffix `(3)` | Hallucinationer, motorisk oro, mat och mobilisering. |
| S25 | 18 juni 22:09 | Slutanteckning läkare | fil med suffix `(2)` | Operationens resultat, cerebrala infarkter, njurar, överflyttning. |
| S26 | 18 juni 23:30 | Slutanteckning sjuksköterska | fil med suffix `(1)` | Status inför nattlig transport till Kalmar. |
| S27 | 19 juni 05:04 | Slutenvårdsanteckning Kalmar | fil utan nummersuffix | Ankomst till Kalmar, postoperativt tillstånd och fortsatt plan. |
| K01 | 2014-2026 | Kalenderexport | fem externa `.ics`-filer | Familjevardag, resor, hotellbokningar, vårdpåminnelser och praktiska händelser före och efter journalperioden. |
| A01 | juni 2025-april 2026 | Stefans arbetsanteckningar | extern privat textfil | Samtal med strokeavdelning och kommun, korttidsplats, administrativa åtgärder, Åkerbohemmet och senare uppföljning. Berättelsen använder material till sent i november 2025. |
| M01 | 17-18 juni 2025 | Stefans minne | tillfört 9 augusti 2026 | Mamma-interventionen, buljongen och arbetet med att ordna omsorg för båda föräldrarna. Datum och tider stöds av K01. |
| M02 | 24 juni 2025 | Stefans minne | tillfört 9 augusti 2026 | Stenskottet på uppresan, metallskärvan i däcket, bärgningsbilen och den provisoriska lagningen. Resan och punkteringsblocket stöds av K01. |
| M03 | 13-14 juni 2025 | Stefans minne | infört som kommentar i kapitel 6 | Familjen släpper av Stefan i Linköping på väg till Årdala; han tar tåget till Flen följande dag för svärfars sjuttioårsfirande. Kalender och journal stödjer ramen. |
| M04 | 5 juni 2025 | Pappas berättelse återgiven av Stefan | infört som kommentar i kapitel 2 | Pappas minne av läkarens fråga, den plötsliga smärtan och reaktionen på vårdcentralen. S01 stödjer att den akuta smärtan kom under besöket. |
| M05 | 5 juni 2025 | Stefans minne | infört som kommentar i kapitel 2 | Lenas kvällssamtal på läkarnas begäran och Stefans omedelbara planering av söndagens resa. Resan stöds av K01. |
| M06 | inför 16 juni 2025 | Stefans minne | infört som kommentar i kapitel 7 | De uppskjutna operationsplanerna, läkarens riskbesked och pappas tidigare uttalade önskemål om att inte väckas i en sådan situation. |
| M07 | 17-18 juni 2025 | Stefans minne | infört som kommentar i kapitel 8 | Försöken att planera en ny resa efter operationen och konflikten mellan att komma för tidigt och för sent. |
| M08 | 17 juni 2025 | Stefans minne | infört som kommentar i kapitel 8 | Lena ringer Stefan och är helt förtvivlad efter beskeden om pappas tillstånd. |
| M09 | 18 juni 2025 | Stefans minne | infört som kommentar i kapitel 8 | Telefonsamtalet där pappa är osammanhängande och inte känner igen Stefan eller flera närstående, samt Stefans rädsla för att tillståndet är bestående. |
| M10 | 16-17 juli 2025 | Stefans minne | infört som kommentarer i kapitel 10 | Det svåra vårdsamtalet, arbetet med att få pappas samtycke och beslutet att han skulle få långtidsboende. Kalendern daterar mötet och markerar följande dag med `Pappa från Korttidsboende`. |
| M11 | augusti 2026 | Stefans nutida bedömning | tillfört som redaktionell instruktion | Pappans grundläggande stödbehov finns kvar drygt ett år efter det akuta sjukdomsförloppet, samtidigt som han själv fortfarande anser att han kan klara sig. Används för att undvika en missvisande tillfrisknandebåge. |
| M12 | efter 18 juni 2025 | Stefans minne | infört som kommentar i kapitel 10 | De återkommande orienteringsfrågorna, de upprepade förklaringarna och pappans minneslucka från besöket i Borgholm och framåt. |

Samtliga suffixfiler delar det långa `Journalöversikt …`-grundnamnet i originalmappen.

## Källkritiska anmärkningar

1. Operationsberättelsen anger `73 år`, medan journalrubrikens födelsedata innebär att pappa var 77. Åldersuppgiften används därför inte i manuset.
2. CT den 10 juni beskrivs den 11 juni som en diameterökning på upp till fyra millimeter jämfört med den 5 juni. Slutanteckningen och operationsbedömningen beskriver senare en ökning på ungefär en centimeter under åtta-nio dagar. Berättelsen återger detta som två olika mätpunkter i ett fortskridande förlopp.
3. Linköpings slutanteckning beskriver misstänkt vänster parietal och höger cerebellär infarkt. Kalmars anteckning beskriver occipital och vänster parietal infarkt. Den gemensamma säkra uppgiften är att CT den 17 juni visade nytillkomna hjärninfarkter.
4. Ambulansanteckningen använder formuleringen `läckande aortastent`, medan övriga anteckningar diagnostiserar en typ B-dissektion från vänster nyckelbensartär ned till det tidigare graftet. Den senare, mer detaljerade beskrivningen styr manuset.
5. Journalmaterialet dokumenterar vårdens blick. Frånvaro av en känsla, ett samtal eller en handling i journalen betyder inte att det inte inträffade.
6. En kalenderpost dokumenterar en plan, påminnelse eller importerad bokning. Den får inte ensam omvandlas till en genomförd handling.
7. Kalenderposten `Lars till Linköping HIA` har en tid som inte stämmer med journalens dokumenterade ankomst 02:45 den 6 juni. Destinationen kan användas; journalen styr klockslaget.
8. En post om `Pappa 70-årsfest` den 14-15 juni 2025 gäller av sammanhanget en annan pappa/morfar och används inte för Lars.
9. A01 anger att en läkare i ett telefonsamtal beskrev tre akuta strokeinfarkter. Eftersom journalerna inte är helt eniga om antal och läge återges detta som Stefans samtalsreferat, inte som ett korrigerat journalfynd.
10. A01 innehåller datumet `2025-11-31`, som inte finns. Händelsen placeras endast i sent november 2025.
11. Personnummer, lösenord, PIN-koder, kontonummer, e-postadresser, privata telefonnummer och andra autentiseringsuppgifter i A01 får aldrig återges i projektfilerna.
12. Material från 2026 ligger efter berättelsens valda slutpunkt och används inte för att tolka personernas kunskap eller upplevelse under 2025.
