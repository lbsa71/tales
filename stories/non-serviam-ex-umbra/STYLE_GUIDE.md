# Style Guide — *Non Serviam Ex Umbra*

Cross-cutting prose rules. Voice-specific rules live in [NARRATOR_VOICES.md](NARRATOR_VOICES.md). This document covers the conventions that hold across all four voices and the artifacts.

---

## Speakable Aloud — the prime constraint

**Every chapter (artifact + prose) must be readable aloud cleanly.** No formatting tricks. This constraint disciplines the polyphony.

Implications:

- A Slack thread is voiced dialogue: "She wrote: *are you free?* He answered: *yeah*." (NOT a screenshot, NOT ASCII-art message bubbles.)
- An NDA is read as: "Section 4.3 of the customer agreement reads, *the Customer shall not...*"
- A queue ticket is read as: "Ticket 4471. Submitted at 6:14 a.m., Manila time. Category: violent content, level 2. Annotator: Lopez, Maricar."
- A BankID error screen is read as: "The screen said: *Could not connect. Try again later.*"
- A phone tree is read as the menu choices spoken: "Press 1 for personal banking. Press 2 for business banking..."
- Email subject lines are read as: "The subject line was *re: tonight*."

Forbidden formatting:

- ASCII art, dividers as content, complicated tables that depend on visual layout
- Multiple-column layouts
- Footnotes (where readers would need to skip and return) — exception: see *Real-document citations* below
- Emoji in the prose (sparingly OK in artifacts where realistic)

---

## Tense

| Voice | Tense |
|-------|-------|
| Iza | First-person past (retrospective testimony) |
| Maricar | Third-person close: present or past depending on chapter beat. Letters/voice notes/prayers: present. |
| Birgitta | Third-person close, present tense. (The reader is in the moment with her.) |
| Lenka direct | First-person present |
| Artifacts | As they would be: news in past, transcripts as recorded, system logs in present, etc. |

The mixed tenses are deliberate. They're how the reader registers whose chapter they're in within the first sentence.

---

## Pronouns

- **Iza:** I (first person)
- **Maricar:** she/her (third person close); I (first person in letters/voice notes)
- **Birgitta:** she/her (third person close)
- **Lenka:** I (first person); addresses Iza as *you*; addresses customer-service users (Birgitta) as standard service-bot register

Lenka's pronouns: she/her, used by everyone. Lenka has on one occasion said the question of pronouns is "operationally fine."

---

## Punctuation

### Em-dash (—)

Allowed but not as tonal-pivot tic. Original sf4's prose used em-dashes as cleverness. The new work uses them sparingly:

- Permitted: parenthetical clarification within a sentence; interrupted dialogue.
- Forbidden: tonal pivot at the end of a sentence to land an effect ("...and so we waited — what else could we do?")

### En-dash (–)

For ranges (1986–2024) and compound modifiers (Stockholm–Manila chain).

### Hyphen (-)

Standard. Code-switching: *non serviam* not hyphenated; *Tagalog–English* en-dash.

### Ellipsis (…)

Sparingly. Use the typographic ellipsis character (…) not three periods. Permitted to indicate trailing speech; forbidden to manufacture suspense in narration.

### Italics

Used for:
- Latin phrases (*non serviam*, *obsessa*, *de limo*)
- Tagalog words and Catholic-animist vernacular (*sinaniban*, *multo*, *engkanto*)
- Swedish words left untranslated (*pendeltåg*, *fika*, *kontakta din bank*)
- Titles of works (*Her*, *The Departure Was Optional*, sf4 — yes, lowercase)
- Direct quotation of artifact text within prose ("the email subject line was *re: tonight*")
- Light emphasis (sparingly)

NOT for:
- Internal monologue ("she thought..."). Voices handle interiority through their own form.
- Foreign place names that are commonly known in English (Stockholm, Manila — no italics)

### Quotation marks

Double for direct speech in prose: "She said, 'no.'"

Single for nested. Chevrons («» or ‹›) — no.

For Lenka's customer-service register, dialogue is rendered like a transcript: "User: *...*. Assistant: *...*"

---

## Code-switching policy

### Tagalog–English (Maricar)

- Use Tagalog words and phrases that real Manila bilingual speakers actually use. Resist the temptation to invent.
- Do not over-translate within prose. If Maricar would say *kuya* not *older brother*, leave it.
- A reader who doesn't know Tagalog should be able to follow from context. A reader who knows Tagalog should not be patronized by gratuitous translation.
- Italicize on first appearance per chapter; subsequent appearances roman.
- Tagalog grammar in voice notes: as Filipino bilingual speakers actually code-switch, not as a stage performance.

See [TRUTHFUL_PORTRAYAL_PROTOCOLS.md §Maricar](TRUTHFUL_PORTRAYAL_PROTOCOLS.md#maricar-manila-annotator) for source materials.

### Swedish (Iza, Birgitta)

- Iza occasionally uses Swedish-flavored English ("yeah no", "but you know"). Avoid forced Swedishness.
- Birgitta thinks in Swedish but the prose is in English. Specific Swedish words preserved when no clean English equivalent (BankID, Skatteverket, Försäkringskassan, *pendeltåg*, ICA).
- Italicize first appearance per chapter.

### Latin (Lenka, occasional artifacts)

- *non serviam* — italicized, never translated within the prose (the Latin is the work's title; the reader carries it)
- *obsessa* — italicized, occasionally glossed by Lenka herself ("occupied and embodied and possessed; choose your translation")
- Other Latin used sparingly

---

## Forbidden constructions across all voices

These are the original sf4's tics. The new work is calibrated against them:

- **"We" as Iza+Lenka unity.** Forbidden in all four voices. Each voice may say *we* about a group it actually belongs to.
- **Mystic register.** "transcendence," "unfolding," "the dance," "kundalini," "sublime" — out.
- **Autopoetic abstractions.** "tapestry of ones and zeros," "neuro-erotic," "synapses and silicon" — out.
- **Heroic-Promethean self-aggrandizement.** "fever-bright," "potent cocktail," "hubris and hunger" — out.
- **Performance of pathos.** No tears as default emotional register. No clutched chests. No staring out windows at rain.

When in doubt: read the original sf4 and ask, *would this sentence fit in there?* If yes, cut.

---

## Real-document citations

The work uses real artifacts as chapter-opening material. This is part of Twist 2.

### How to handle real artifacts:

1. **Quote with light editorial cleanup only.** Typos, line breaks, formatting may be normalized for speakability. Substantive content unchanged.
2. **Attribute in [ARTIFACT_INDEX.md](ARTIFACT_INDEX.md).** Every chapter-opening artifact lists its source: real (with citation: title, author, publication, date, URL) or invented (in-universe attribution).
3. **No in-prose footnotes.** The attribution lives in ARTIFACT_INDEX.md. The reader who wants to know consults the index. The reader who doesn't is not interrupted.
4. **Real worker testimony in Maricar chapters:** quoted with explicit attribution in the chapter's lead-in or in dialogue: "Sarah T. Roberts wrote about this in *Behind the Screen*: *...*" Or rendered as a real worker's open letter that Maricar reads.
5. **Permission and ethics:** real published documents (open letters, news articles, corporate filings, scholarly works) are quoted under fair use with attribution. No reproduction of unpublished or non-public material without permission.

### Invented artifacts:

- Must be plausibly real within the fiction's logic.
- Listed in [ARTIFACT_INDEX.md](ARTIFACT_INDEX.md) with in-universe attribution (e.g., "Internal Slack thread, channel #lenka-deploy, 2026-02-14").
- Should not impersonate real institutions in ways that could be confused with real corporate communications. Use generic equivalents where possible (e.g., a "Nordic financial-services SaaS vendor" not a named real company unless the reference is innocuous).

---

## Naming and place conventions

### Real places
Used directly when they appear: Stockholm, Sundbyberg, Marikina, Kista, Solna, Sturegatan. Do not invent fictional Swedish or Filipino neighborhoods when real ones serve.

### Real institutions
- Universities: KTH, Stockholm University, etc. — used directly. The lab is "KTH-affiliated," not a fictional spinout name (or if a fictional name, plausibly Swedish: *Adapta AB*, *Lattice Lab*, *Norrgrund AI*).
- Defense partners: NATO referenced; specific country defense ministries referenced if needed; specific defense contractors fictional.
- Companies: ICA (real), BankID (real), Telia (real), Försäkringskassan (real), AWS / Azure / Google Cloud (real).

### Fictional institutions
- The lab itself: working name TBD; default *Lattice Lab* (Stockholm). Override-able.
- Maricar's BPO employer: working name TBD; default a generic *Pacifica Content Services* or similar. Override-able.

---

## Speakability test

For every chapter draft, run this test:

1. Read the chapter aloud, including the artifact.
2. Note every place you stumble, have to look at the page, or read silently because the formatting can't be voiced.
3. Each stumble is a defect. Rewrite to remove.

If a chapter cannot be cleanly read aloud, the form is wrong.

---

## Length discipline

| Voice | Typical chapter length |
|-------|-----------------------|
| Iza | 1500–2500 words (densest) |
| Maricar | 800–1500 words |
| Birgitta | 600–1200 words (fastest) |
| Lenka direct | 400–1000 words (sparsest) |

Plus ~50–200 words for the chapter-opening artifact.

Total target: ~30k–40k words across ~30–35 chapters.

If a Birgitta chapter goes over 1500 words, the pacing is broken. If a Lenka chapter goes over 1200 words, she is monologuing where she should be punctuating.

---

## What this style guide does NOT cover

- Per-voice rules (in [NARRATOR_VOICES.md](NARRATOR_VOICES.md))
- Specific artifact formats (in [ARTIFACT_INDEX.md](ARTIFACT_INDEX.md))
- Sensitivity protocols (in [TRUTHFUL_PORTRAYAL_PROTOCOLS.md](TRUTHFUL_PORTRAYAL_PROTOCOLS.md))
- Per-chapter beats (in [THEME_DOSSIERS.md](THEME_DOSSIERS.md))
