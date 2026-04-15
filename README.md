# tales

Monorepo for long-form story projects. Stories live in `stories/`, and shared tooling (PDF build, voice rendering) lives in `tools/`.

## Layout

```
tales/
├── stories/
│   ├── unsung-heroes/   # story + React/Vite reader
│   ├── zelda/           # story + Swedish translation
│   └── continue/        # story chapters
├── tools/
│   └── voice-renderer/  # ElevenLabs TTS CLI (Python, stdlib only)
├── .github/workflows/
│   └── build-pdfs.yml   # matrix Pandoc PDF build for all stories
├── pnpm-workspace.yaml
└── .gitignore
```

## Stories

Each story is a self-contained project under `stories/<name>/`, typically containing:

- `chapters/` (or `final/` for unsung-heroes) — numbered Markdown chapters
- Planning docs (`CONCEPTUAL_MAP.md`, `NARRATOR_VOICE.md`, `STYLE_GUIDE.md`, `THEME_TRACKER.md`, ...)
- Optional `translations/<lang>/` for localized editions

## Shared tools

### `tools/voice-renderer/`

Python CLI (`reader.py`) that reads Markdown and synthesizes narration via the ElevenLabs API. Multilingual (currently English + Swedish voice profiles). No third-party dependencies — uses only Python stdlib.

Requires `ELEVENLABS_API_KEY` in the environment.

### PDF build (`.github/workflows/build-pdfs.yml`)

A single workflow with a matrix entry per story. Triggers on pushes to `main` that touch any `stories/**/chapters/**` or `stories/**/translations/**` path. Each build produces a Pandoc/LaTeX-rendered PDF as a workflow artifact.

## Apps (TS workspace)

`pnpm-workspace.yaml` picks up any `stories/*/reader` package (currently just `unsung-heroes/reader`). Run `pnpm install` at the root to hydrate.

Generalizing the reader into a story-agnostic `apps/reader/` that can load any story is a planned follow-up.
