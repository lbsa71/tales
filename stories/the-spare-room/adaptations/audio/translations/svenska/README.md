# Gästrummet — svensk radioteater

[SCRIPT.md](SCRIPT.md) är den fullständiga svenska översättningen av [den engelska audioadaptionen](../../SCRIPT.md): A1–A7, inte en ny översättning av den tidigare scenpjäsen. Ruth, Helen och Kit heter Rut, Helena och Kim. Kim och Neri har pronomen hen/hens.

Hela manuset har fått ett extra språk- och betydelsepass. Genomförda rättelser, bevarade avbrott och A6:s anpassning av ordleken *table* dokumenteras i [SPRÅKGRANSKNING.md](SPRÅKGRANSKNING.md). Alla 529 talade turer och 111 anvisningar finns kvar i originalets ordning.

## Genomrendering A1–A7

Hela adaptionen finns nu som en första lyssningsversion på **38 minuter och 5 sekunder**, uppdelad i **19 separat utbytbara delar**. Det tidigare godkända öppningsprovet är återanvänt bitidentiskt. Samma rollbesättning används genom hela inspelningen.

- [Lyssningslista med alla delar och separata aktfiler](../../../../../../dist/stories/the-spare-room/adaptations/audio/sv/chunked-v1/README.md).
- [Sammanhängande version, MP3](../../../../../../dist/stories/the-spare-room/adaptations/audio/sv/chunked-v1/mixes/mix-v1/gastrummet-sv.mp3) och [WAV](../../../../../../dist/stories/the-spare-room/adaptations/audio/sv/chunked-v1/mixes/mix-v1/gastrummet-sv.wav).
- [Sammanhållet ljudmanus med spelanvisningar och kommentarer](../../../../../../dist/stories/the-spare-room/adaptations/audio/sv/chunked-v1/render-script.md).
- [Kvalitetsprotokoll med tidsangivna lyssningspunkter](../../../../../../dist/stories/the-spare-room/adaptations/audio/sv/chunked-v1/QA.md).

Alla 529 källturer och 111 scenanvisningar är kontrollerade mot översättningen. Automatisk återtranskribering hittar alla väntade ord i 519 turer efter dokumenterad stavningsnormalisering; totalt 11 turer har ordavvikelser eller tillägg att kontrollera med örat. Inga saknade källord har markerats. Detta är inte en garanti för ordagrant framförande. Bland lyssningspunkterna finns **007 + 0:56**, där transkriptionen skriver ”henne” i stället för ”hen”, och **019 + 0:08**, där ”De har” återges som ”när man”. Taligenkänningen slår även samman Rut och Kim i några delar, vilket behöver jämföras med de hörbara rösterna.

Råtagningar, alternativa tagningar, ljudfiler, mixunderlag och kontroller sparas var för sig. Återkoppling kan anges som exempelvis **003 + 0:30**; då kan just den delen tas om. Helmixen byggs därefter om lokalt utan ny generering av övriga repliker. Ändringar av ljudeffekter kräver inte heller nya rösttagningar. Ingen konstnärlig slutavlyssning av hela inspelningen har genomförts.

## Det ursprungliga A1-provet

Det ursprungliga provet motsvarar början av det engelska A1-provet: från ”Är den där till mina saker?” till ”Jag vill ha den om jag går.” Det är 17 manusinslag inklusive ett berättarinslag, plus två separat markerade reaktioner. Provet utgör nu del 001 i genomrenderingen ovan.

- [Spelbar slutmix, WAV, 57,18 sekunder](../../../../../../dist/stories/the-spare-room/adaptations/audio/sv/a1-opening-test/a1-opening-test-mixed.wav).
- [Läsbart ljudmanus med framförandetaggar och scenanvisningar som kommentarer](../../../../../../dist/stories/the-spare-room/adaptations/audio/sv/a1-opening-test/render-script.md).
- [Torra röster utan tillagda ljudeffekter](../../../../../../dist/stories/the-spare-room/adaptations/audio/sv/a1-opening-test/sanna-eva/a1-opening-test.wav).
- [Ljudprovets kvalitetskontroll](../../../../../../dist/stories/the-spare-room/adaptations/audio/sv/a1-opening-test/QA.md).

## Rollbesättning

| Roll | Röst | Avsedd kontrast |
| --- | --- | --- |
| Rut | Annie Svensk | Mörk, mogen och återhållen |
| Helena | Sanna Hartfield — Sassy and Natural | Rak, energisk medelåldersröst |
| Kim | Eva | Ung vuxen, lätt luftig röst |
| Berättare | Adam Composer Stockholm | Djup manlig röst |

Samtliga är märkta med svenska som språk i röstbiblioteket och verifierades tillgängliga vid renderingen. Annie är märkt **medelålders**, inte gammal; hennes lämplighet som den äldre Rut behöver bedömas med örat. Åldersintrycket är inte verifierat av bibliotekets etiketter eller transkriptionen.

Tre rollbesättningar provrenderades. Två försök med Evelina som Helena och Olivia respektive Saga som Kim gav bara tre automatiskt urskilda talare. Kombinationen ovan gav fyra stabila identiteter i öppningsprovets torra tagning och slutmix, utan att antal talare angavs för transkriberingen. Det är ett stöd för valet, inte en ersättning för konstnärlig avlyssning; det gäller inte automatiskt alla senare delar.

## Produktion

Rösterna är genererade tillsammans med ElevenLabs v3 Text to Dialogue, med ett röst-ID per tur. Scenanvisningarna skickas inte som repliker. Ingen musik används. Sex språkneutrala vardagsljud från det engelska provet har återanvänts och tidsanpassats till den svenska tagningen: väska/mugg, glasögonputsning, kappa/stol, en klunk te, teupphällning och halsduk/väska.

Genomrenderingen kompletterar dessa med fem återanvändbara ljud: steg, stolskrap, packning/stängning av väska, nedsättning av mugg och vatten mot sten. Samma vattenljud används vid alla fyra hamntillfällena. Ljudet hör till Helenas pågående upplevelse och får inte fungera som en signal om tillträde eller förflyttning till en ny fysisk plats. Röst- och ljudunderlag för hela pjäsen finns i [sv-chunks](../../render-plans/sv-chunks/index.json), [sv-performance.json](../../render-plans/sv-performance.json) och [sv-sound-cues.json](../../render-plans/sv-sound-cues.json).

[Röstunderlag](../../render-plans/a1-opening-sv-sanna-eva.json) och [mixunderlag](../../render-plans/a1-opening-sv-mix.json) hålls skilda från översättningen. En senare språkputs av andra delar ändrade hela manusfilens kontrollsumma, men ljudprovets 17 inslag är fortfarande ordagrant identiska med den slutgranskade A1-texten.

Kontrollerat 2026-09-23. Originalmanus, tidigare engelska prov och befintliga ändringar i huvudrepot har bevarats. Ingen incheckning har gjorts.
