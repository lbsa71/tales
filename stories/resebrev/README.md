# Resebrev

Svensk berättelse baserad på resebrev och anteckningar från Indienresan 2003-2004.

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
