# Implementationsplan — Svensk översättning revidering

**Datum**: 2026-04-11
**Baserad på**: [AUDIT_FINDINGS.md](AUDIT_FINDINGS.md)
**Källtext**: `chapters/chapter_*.md` (engelska originalet v2.1)
**Styrdokument**: [TRANSLATION_PLAN.md](TRANSLATION_PLAN.md), [STYLE_GUIDE.md](../../STYLE_GUIDE.md)

---

## Grundprinciper för arbetet

1. **Engelska originalet är betydelseriktmärket, inte syntaxmallen.** Översätt från engelskans betydelse, inte från dess ordföljd.
2. **Planen är kompassen.** När en mening tvekar, tillbaka till TRANSLATION_PLAN.md §Stilessensen.
3. **Kapitel 1 är tonreferensen.** Det är det enda kapitlet som systematiskt följer stilprinciperna. När i tvivel, läs en passage ur kap 1 innan en fixning bestäms.
4. **Inga nya regler.** Alla fixningar måste härledas från de regler som redan finns i plan och stilguide.
5. **Varje ändring ska ha en härledning.** Kategori A-H i AUDIT_FINDINGS.md är den enda giltiga motiveringen.

---

## Våg 1 — Mekanisk lintning

**Syfte**: Eliminera alla sökbara fel innan den editoriella revisionen börjar. Det är nödvändigt eftersom dessa fel annars stör arbetet i våg 2.

**Metod**: Grep-baserad sökning över alla tio kapitel. För varje träff: öppna filen, läs meningen i sitt sammanhang, rätta, dokumentera.

### Lintningslistor

#### 1.1 Felvänner och stavfel (kategori A+B)

Sök (case-sensitive där relevant):
- `glatt\b` (felvän för *smooth*)
- `misslyckas\b` (felvän för *fails/wanes* och trasig konstruktion)
- `monterar\b` (felvän för *mounts*)
- `häcknings` (felvän för *nesting* — kanin, inte fågel)
- `raschl` (tyskism)
- `rippar\b` (icke-svenskt verb)
- `hukrar\b` (stavfel)
- `gnavd` (stavfel för *gnagd*)
- `spänn\b` (misstänkt trasigt ord)
- `\bNosan\b` (stavfel för *Nosen*)
- `fasett` (felvän)
- `innesluten rymd` (felvän)
- `fuktig väder` (genusfel)
- `tunga arbetar` (bestämd form)
- `Rovdjuret närvaro` (saknad genitiv)
- `Annan hand` (saknad obestämd artikel)

#### 1.2 Latinism och registerbrott (kategori C)

- `synkroniser`
- `kontinuitet`
- `etabler`
- `aggression`
- `radering`
- `avgränsning`
- `angelägenhet`
- `utvidgats`
- `imperativ`
- `konstans`
- `kungörelse`
- `dränera` (i abstrakt mening)

#### 1.3 Regelbrott — abstraktion och meta (kategori E)

- `ensamhet`
- `inbillad`
- `\bsyfte\b`
- `forma tanken`
- `utan att frukta`
- `utan att förutse`
- `obekymrad`
- `kategori\b`
- `utan oro`
- `Det som var.*\bsluter\b` (catch ch 10 metafysik)
- `inte som minne, inte som tanke`

#### 1.4 Terminologisk drift (kategori G)

- `slagandet` / `Slår\b` (ska vara dunkandet/Dunkar)
- `ljuder\b` / `ljuder` (litterärt; sök efter överanvändning)
- `pellets\b` (ska vara *kulor*)
- `avgränsningen\b`
- `häckningstid`

#### 1.5 Tankstreck

- `—` (em-dash, explicit förbjudet)
- `–` i bisatsfunktion

### Leveranser från våg 1

- Alla träffar från listorna ovan är hanterade: antingen rättade direkt, eller markerade för våg 2 om rättningen kräver editoriell bedömning.
- En kort körningsrapport per lintningsregel (antal träffar, antal rättade, antal uppskjutna).

### Kriterier för färdig våg 1

- Alla greps i 1.1 returnerar 0 träffar (förutom eventuella medvetna undantag, dokumenterade).
- Alla greps i 1.2 returnerar 0 träffar eller dokumenterat godkända undantag.
- Alla greps i 1.3 returnerar 0 träffar. Inga kvarvarande meta-reflektioner.
- Alla greps i 1.4 visar terminologisk enhetlighet.
- Alla greps i 1.5 returnerar 0 träffar.

---

## Våg 2 — Editorial revision per kapitel

**Syfte**: Mening-för-mening-granskning av kvarvarande calque, rytm­tapp och stilprincip­drift. Detta är arbetet som inte går att greppa — kräver läsning av meningen i sammanhang och bedömning mot 8-punktslistan.

**Metod**: Per kapitel, läs svenskan och engelskan parallellt. För varje mening, gå igenom planens 8-punktslista (TRANSLATION_PLAN.md §Kvalitetskontroll):

1. Är detta sensoriskt, inte konceptuellt?
2. Är detta fysiskt, inte emotionellt?
3. Är detta omedelbart, inte reflekterande?
4. Undviker det alla förbjudna mönster?
5. Matchar det kapitlets rytm och fas?
6. Kunde en kanin uppleva detta?
7. Använder det korrekt terminologi?
8. Undviker det tankstreck för bisatser?

Vid tveksam träff: jämför med TRANSLATION_PLAN.md §Stilessensen (8 tekniska principer) och §Svenska prosaillustrationer.

### Prioritetsordning

1. **Kapitel 6** (mest skadat av de redan lintade)
2. **Kapitel 7**
3. **Kapitel 9**
4. **Kapitel 4**
5. **Kapitel 5**
6. **Kapitel 8**
7. **Kapitel 2**
8. **Kapitel 3**
9. **Kapitel 1** (finputsning)

### Vad att leta efter

Utöver vad som flaggats i AUDIT_FINDINGS.md:

- **Meningar som börjar med fyllnadsord** ("Det är", "Där finns", "Det var") — TRANSLATION_PLAN.md princip 5.
- **Kopulakedjor** ("var X och Y") där nominalkedja utan kopula är starkare — princip 4.
- **Orsakssatser** ("för att", "så att", "därför att") utanför de få fall där de är naturliga — princip 7.
- **Saknade refränger** där originalet upprepar en fras rytmiskt — princip 8.
- **Saknad bindestrecksrytm** på ställen som efterfrågar den — princip 2.

### Leveranser från våg 2

- Per kapitel, en lista av ändringar med motivering (kategori A-H).
- Texten i varje kapitel har passerat 8-punktslistan utan kvarvarande brott.
- Rytmen testas genom högläsning mentalt — om en mening "haltar" på svenska, skrivs den om.

---

## Våg 3 — Omskrivning av trasiga sektioner

**Syfte**: För delar av texten räcker inte redigering — de måste skrivas om från engelskans betydelse.

**Metod**: Läs engelska stycket. Stäng svenska originalöversättningen. Skriv ny svensk version från planens principer. Jämför mot gamla svenskan bara för att säkerställa att ingen betydelse förlorats.

### Sektioner som ska skrivas om

1. **Ch 4 rad 43–44** — "Kroppen räknar inte årstider, har ingen ram för räkning..." (meta-reflektion).
2. **Ch 5 rad 53** — "Kroppen rymmer formen av denna visshet utan att forma tanken..." (meta-reflektion).
3. **Ch 5 rad 77** — "Ingenting kom. Kroppen formar inte dessa ord..." (meta-reflektion).
4. **Ch 5 rad 83–85** — "Kroppen rymmer detta mönster utan att förutse, utan att frukta..." (meta-reflektion).
5. **Ch 5 rad 87** — "tjänat sitt syfte och misslyckats sitt syfte" (grammatik + abstraktion).
6. **Ch 8 rad 63** — "Håller detta utan att forma tanken, utan att frukta förlusten..." (meta-reflektion).
7. **Ch 9 rad 52–53** — "Aggressionen som reste sig så lätt... veckorna av ensamhet" (Latinism + förbjudet abstrakt).
8. **Ch 10 hela kapitlet** — strukturella problem, metafysisk drift. Ska översättas om från noll med kap 1 och planens exempel som stilmässig ankare.

### Kriterier för godkänt

- Inga benämningar av kognitiva kategorier kaninen saknar ("minne", "tanke", "förutse", "frukta", "ensamhet").
- Inga filosofiska sammanfattningar ("Det som var åtskilt fogas till det som aldrig var åtskilt").
- Upplösning (ch 10) visas genom sensoriskt avtagande, inte genom metafysisk syntes.
- Kapitlets fas (se TRANSLATION_PLAN.md §4 Rytm och stil) respekteras.

---

## Våg 4 — Konsekvens- och röstpass

**Syfte**: Slutkontroll. Texten ska vara intern enhetlig, fri från regelbrott, och läsbar som svensk prosa.

### Kontroller

1. **Terminologisk konsekvens** — samma Grep-körning som våg 1 §1.4 på den reviderade texten.
2. **Slutlig regelgrep** — hela våg 1:s grep-listor körs igen. Inga nya träffar bör dyka upp (inga regressions).
3. **Högläsningstest** — mental läsning av varje kapitel. Flagga ställen där ett svenskt öra hakar upp sig.
4. **Diff mot engelska originalet** — säkerställ att ingen passage tappats i revideringen och att ingen ny passage introducerats (outside the ch 10 rewrite, where semantic fidelity is what matters, not syntactic).
5. **Biologisk faktakontroll** — punktkontroll mot [oryctolagus_cuniculus.md](../../oryctolagus_cuniculus.md) för specifika kaninbeteenden och utvecklingsstadier. Troligen redan ok.

### Leveranser från våg 4

- En uppdaterad TRANSLATION_PLAN.md med arbetsordning-listans sista två punkter markerade som gjorda.
- Inga kvarvarande grep-träffar.
- Alla kapitel läses färdigt högt utan voice-break.

---

## Körplan — ordning och beroenden

```
Våg 1 (lintning)
   │
   ├─► 1.1  Felvänner/stavfel      ─┐
   ├─► 1.2  Latinism                ├─ parallellt, enkel-mening-rättningar
   ├─► 1.3  Regelbrott              │
   ├─► 1.4  Terminologi             │
   └─► 1.5  Tankstreck             ─┘
         │
Våg 2 (editorial revision)
         │
         ├─► Ch 6 ─► Ch 7 ─► Ch 9  (mest skadade, först)
         └─► Ch 4 ─► Ch 5 ─► Ch 8 ─► Ch 2 ─► Ch 3 ─► Ch 1
               │
Våg 3 (omskrivning) — kan starta parallellt med våg 2 för de identifierade styckena
         │
         ├─► Ch 4 styckerewrite
         ├─► Ch 5 styckerewrites (fyra stycken)
         ├─► Ch 8 styckerewrite
         ├─► Ch 9 styckerewrite
         └─► Ch 10 full omskrivning
               │
Våg 4 (slutkontroll)
         │
         ├─► Terminologi-grep
         ├─► Regelgrep (alla listor)
         ├─► Högläsning
         ├─► Diff mot engelska
         └─► Uppdatera TRANSLATION_PLAN.md status
```

---

## Appendix: Kärnfraser att ha till hands under arbetet

### Från planens Svenska prosaillustrationer

**Födelse/Ungdom (ch 1-2)**:
> Mörker först. Sedan värme.

**Mellanåren (ch 3-7)**:
> Grinden låter och steg följer. Skålen ställs på sin vanliga plats, matdoft stiger. Samma följd varje dag medan ljuset ändrar vinkel genom årstiderna.

**Sjukdom/Död (ch 8-9)**:
> Doften förändrades först. Järn blandat med sötma, något som vände under pälsen, under skinnet.

**Upplösning (ch 10)**:
> Vinden rör sig genom hagtornet. Den bär ett ljud som kunde vara hennes andning bredvid.
> Eller bara vind. Bara vind nu.

### Transformationsregler (från planen)

- Känsla → kroppsstate: "Hjärtat slår hårt. Musklerna stelnar."
- Förståelse → fysisk respons: "Kroppen vänder sig mot ljudet. Musklerna lossar."
- Metafor → direkt sinnesupplevelse: "Kyla trängde in. Luften bar en doft av järn."
- Spekulation → yttre observation: "Den andra kroppen rörde sig långsammare. Doften förändrades."
- Reflektion → kroppsminne: "Kroppen bär vad minnet inte kan."

### Grundprincipen

När i tvivel: **gör det mer sensoriskt, mer fysiskt, mer återhållet.**
