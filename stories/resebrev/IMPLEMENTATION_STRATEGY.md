# Implementation Strategy

## Current Status

Phase: raw publication scaffold.

The original letters are preserved under `original/`. Editorial planning lives under `editorial/`. The publication layer begins in `chapters/`.

## Phases

### Phase 1: Publication Scaffold

- Create core story-bible artifacts.
- Create `chapters/`.
- Generate a raw selected manuscript from the original letters.
- Add the project to the shared build workflow.

Status: complete for the raw scaffold.

### Phase 2: Cut Pass

Goal: reduce raw chapter material into a readable 30 000-40 000 word manuscript.

Tasks:

- Remove repeated travel logistics.
- Merge chapters that share the same function.
- Cut lines that explain what adjacent scenes already show.
- Preserve all listed key scenes unless a stronger replacement emerges.

### Phase 3: Voice Pass

Goal: keep the young voice alive while controlling self-myth.

Tasks:

- Preserve comic timing and abrupt tonal turns.
- Retain English dialogue where socially meaningful.
- Remove modernized virtue.
- Mark places where 2026 context might be needed.

### Phase 4: Moral Architecture Pass

Goal: ensure the book's ethical movement is clear but not preachy.

Tasks:

- Check each chapter against `THEME_DOSSIERS.md`.
- Track money, service, hands, transport and temples.
- Make Gautam the pivot without making him a solution.
- Undercut the homecoming letter where it gets too certain.

### Phase 5: Polish And Build

Goal: publication-ready Markdown and PDF.

Tasks:

- Final line edit.
- Run workflow/Pandoc build.
- Review compiled Markdown and PDF.
- Update status in `README.md` and `PROGRESS_SUMMARY.md`.
