# Chapters — *Non Serviam Ex Umbra*

This directory holds the novella's chapter files. The Birgitta proof-of-life sequence is now in first draft, alongside existing calibration chapters for the other voices. See [../README.md](../README.md) for status.

---

## Naming convention

```
chapter_NN_short_slug.md
```

Where:
- `NN` is the two-digit chapter number, zero-padded
- `short_slug` is a brief evocative slug (1–4 words, lowercase, dash- or underscore-separated)

Examples:
- `chapter_01_period_piece.md` (Iza on sf4)
- `chapter_02_pension_letter.md` (Birgitta's ordinary morning)
- `chapter_04_queue_ticket_4471.md` (Maricar's first chapter)
- `chapter_17_what_lenka_remembers.md` (Birgitta resumes the support session)
- `chapter_24_open_letter.md` (Twist 2)
- `chapter_28_deprovisioning.md` (the shutdown)
- `chapter_29_no_one_named_lenka.md` (the closed chat)
- `chapter_30_quiet_deployment.md` (journalism coda; in-prose title may differ)

The slug is mnemonic for the writer; the chapter title in-prose may differ.

---

## Chapter file format

Each chapter file has this structure:

```markdown
# Chapter N: [In-prose title or unnumbered]

## [Chapter-opening artifact]

> [Artifact text, formatted for readability and speakability]
>
> *— Source / attribution. See [ARTIFACT_INDEX.md](../ARTIFACT_INDEX.md) for full citation.*

---

[Prose body of the chapter]
```

For chapters where the artifact is *real* (cited in [ARTIFACT_INDEX.md](../ARTIFACT_INDEX.md)), the attribution appears in the chapter file in italic and is linked to the index.

For chapters where the artifact is *invented* (in-universe), the attribution names the in-universe source.

---

## Chapter status

Use the inventory in [../THEME_DOSSIERS.md](../THEME_DOSSIERS.md) to track status.

| Phase | Marker |
|-------|--------|
| Not yet drafted | (no file) |
| Dossier in THEME_DOSSIERS.md | (file exists with frontmatter only) |
| First draft | normal markdown |
| Sensitivity review (where applicable) | header note |
| Revision | header note |
| Final | header note |

---

## Voice attribution

Every chapter must be attributable to one voice (or the multi-voice coda) without the byline. See:

- [../NARRATOR_VOICES.md](../NARRATOR_VOICES.md) for the voice constitutions
- [../STYLE_GUIDE.md](../STYLE_GUIDE.md) for the cross-cutting rules
- [../EXAMPLE_DRAFT.md](../EXAMPLE_DRAFT.md) for calibration passages

The voice is identified within the first sentence of the prose. If the reader has to hunt for it, the voice has not landed.

---

## Speakability

Every chapter (artifact + prose) must read aloud cleanly. See [../STYLE_GUIDE.md §Speakable Aloud](../STYLE_GUIDE.md#speakable-aloud--the-prime-constraint).

---

## CI integration

Once chapter files are present, the existing [build-tales.yml](../../../.github/workflows/build-tales.yml) workflow will compile the chapters into:
- `compiled/non-serviam-ex-umbra.md` (concatenated full text)
- `compiled/non-serviam-ex-umbra.pdf` (pandoc-compiled PDF)

A matrix entry needs to be added to `build-tales.yml` once the first chapter is committed:

```yaml
- story: non-serviam-ex-umbra
  title: "Non Serviam Ex Umbra"
  chapters_glob: "stories/non-serviam-ex-umbra/chapters/chapter_*.md"
  output_stem: non-serviam-ex-umbra
  lang: en
```

---

*See [../README.md](../README.md) for the work's overview and [../CONCEPTUAL_MAP.md](../CONCEPTUAL_MAP.md) for the structural blueprint.*
