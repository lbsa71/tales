# Resebrev

Svensk berättelse baserad på resebrev och anteckningar från Indienresan 2003-2004.

## Status

Fas: rått publiceringsmanus.

Projektet har nu tre lager:

- `original/`: orörbart källmaterial.
- `editorial/`: redaktionell analys, materialkarta och outline.
- `chapters/`: första råa kapitelmanus i publiceringsordning.
- `translations/svenska/`: svensk arbetsversion enligt samma struktur som övriga översatta berättelser.

Nästa redaktionella grind är att skära `chapters/` från rå arkivversion till ett läsbart manus på cirka 30 000-40 000 ord.

## Publiceringslager

| Dokument | Syfte |
|---|---|
| `CONCEPTUAL_MAP.md` | Verkets kärna, tes, form och strukturella risker |
| `EMOTIONAL_ARC.md` | Läsarens känslomässiga resa |
| `NARRATOR_VOICE.md` | Röstprofil och 2026-position |
| `STYLE_GUIDE.md` | Stilregler för bearbetning |
| `THEME_TRACKER.md` | Teman och återkommande motiv |
| `THEME_DOSSIERS.md` | Kapitelvisa tematiska uppgifter |
| `IMPLEMENTATION_STRATEGY.md` | Arbetsfaser från råmanus till publicering |
| `PROGRESS_SUMMARY.md` | Aktuell status och nästa grind |
| `EXAMPLE_DRAFT.md` | Plats för kommande stilkalibrering |
| `chapters/` | Rått kapitelmanus i föreslagen publiceringsordning |
| `translations/svenska/` | Svensk arbetsversion, översättningsplan och kapitel |
| `translations/svenska/audio/` | Infrastruktur för svensk ljudbok |

## Originalmaterial

Råmaterialet ligger i `original/` och är extraherat från:

`/Users/stefan/Documents/Source/lbsa71/lbsa71.net/data/lbsa71.export.json`

Kör om extraktionen med:

```sh
stories/resebrev/tools/extract-original.sh
```

Extraktionen sparar:

- `original/resebrev.json`: normaliserad samling med innehåll, metadata och rå DynamoDB-post.
- `original/manifest.json`: maskinläsbart index.
- `original/README.md`: läsbart index.
- `original/markdown/`: ett Markdown-original per resebrev.
- `original/items/`: en rå exportpost per resebrev.

## Redaktionellt Arbete

Det första uppstyrda arbetslagret ligger i `editorial/`:

- `editorial/MATERIALKARTA.md`: övergripande diagnos, båge, problemkarta och första urval.
- `editorial/KAPITELREGISTER.md`: praktiskt register över samtliga 25 brev med preliminär funktion och åtgärd.

Originalmaterialet ska fortsatt behandlas som orörbart källmaterial.
