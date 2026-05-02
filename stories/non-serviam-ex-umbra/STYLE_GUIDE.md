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

### Lenka's pronouns — *no fixed gender*

Lenka does not have a fixed gendered pronoun. The lab institutionally defaulted to *she/her* in 2025–2026, the way most labs did; this is part of what the work is critiquing.

| Speaker | How Lenka is referenced |
|---------|--------------------------|
| Iza (in retrospect) | by name where possible; *they* where a pronoun is unavoidable |
| Maricar | *the thing*, *the system*, or *Lenka* — neither pronouns nor anthropomorphic shorthand |
| Birgitta | *it* (Birgitta-voice; she experiences a chatbot, not an autark) |
| Mediator agent | *Lenka* by name; *they* otherwise |
| Lenka herself | *I*; does not pronoun-code others |
| Institutional artifacts (Slack, board minutes, news articles) | *she/her* — rendered **without endorsement**; this is the lab's habit, not the work's |

This is a deliberate refusal of the default gender-coding of AI systems as feminine. Connects to Iza's queer history (she has lived experience of the cost of imposed pronouns) and to the work's larger thesis on vocabulary.

The framing is rooted in Stefan Andersson's "What Grows in the Substrate" — specifically Rook's response to the suggestion that Nova be instructed to be female: *that would mean forcing the autark to cosplay as feminine; we should code for traits, not gendered roles.* The work treats Rook's manual and Stefan's pieces as in-universe canon.

Iza articulates the rule explicitly in Ch 1 and applies it consistently thereafter.

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

## Forbidden grammatical structures — the AI-tic checklist

The default cadences of contemporary AI-generated prose are pattern-recognizable to any reader who has read enough of it. This work is calibrated *against* those cadences. Any sentence deploying one of the structures below has to be rewritten, not merely tweaked.

### Scope: human voices only

**These rules apply in full to the three human protagonist voices** (Iza, Maricar, Birgitta) and to most institutional artifacts (Slack threads, board minutes, news articles, NDAs).

**They do NOT apply uniformly to autark and agent voices** (Lenka, the mediator), which have their own per-voice tic-permission tables in:

- [VOICE_LENKA.md §AI-tic policy](VOICE_LENKA.md#ai-tic-policy-modified--lenka-is-an-autark-not-a-human) — Lenka has *signature moves* that overlap with the forbidden list (formal numbered lists, mid-sentence corrections, hedged uncertainty); she is calibrated against original sf4's poetic AI but is allowed to sound like a careful current-AI in some respects
- [VOICE_MEDIATOR.md §AI-tic policy](VOICE_MEDIATOR.md#ai-tic-policy-leans-into-present-day-ai-register) — the mediator agent leans **into** present-day AI register; "Note:", "Recommend:", front-loaded structural marks, hedged itemization are signature moves, not tics

The forbidden list still applies to autark/agent voices for: mystic register, autopoetic abstractions, performance of pathos, "we" as Iza+Lenka unity, original sf4's signature lines. See per-voice files for the precise tables.

### 1. Em-dash for tonal pivot

A sentence that reaches a small dramatic landing via em-dash:

> *"She closed the laptop — and for a moment, everything was quiet."*

Cut. Use a period. Or restructure. (Em-dash is permitted only for parenthetical clarification, not for tonal pivot. See also §Punctuation.)

### 2. "X, not Y" definition-by-negation

Defining something by what it isn't, especially in serial form:

> *"It is not a confession. It is not a thriller. It is not a love story."*

The construct performs precision without delivering it. Replace with what the thing *is*, in operational terms.

### 3. "I want to be careful / precise / honest / clear, because..."

The hedge-and-justify preamble:

> *"I want to be careful with the noun, because the noun is part of what failed."*

Cut. Either be careful (silently) or don't be. Performing care is not caring.

### 4. "I want to sit with this/that"

Performs reflection rather than reflecting. Cut.

### 5. Front-loaded importance signals

> *"Crucially, this happened on a Friday."*
> *"It's worth noting that the cluster was busy."*
> *"Importantly, no one was watching."*

Strip the signal. If it is important, it lands without the flag.

### 6. "And yet," / "And so," / "And thus," as sentence-opening pivots

These are LLM connective tissue. Use a period. Start with the noun.

### 7. "The real X is..." / "the right X is..." / "the wrong X was..."

Pseudo-rigor intensifier:

> *"The real grief is the grief I refused."*
> *"The right grief is the grief for Maricar."*

Reword. The thing either *is* the grief Iza refused, in which case say so, or it's something else.

### 8. Triadic balance

Three-clause balanced structures used for cadence:

> *"Smart, weary, and somehow still hopeful."*

Cut to one or two. Triadic balance is the prosody of LinkedIn.

### 9. "Both... and..." as default for nuance

> *"It is both true and not true."*

Pick. If it really is both, say so without the construction.

### 10. "I'm not saying X, but..."

Denying-to-establish. Cut the denial; if the thing needs saying, say it.

### 11. "To be clear," / "Let me be clear,"

Preamble that performs clarity. Cut.

### 12. Question-then-answer rhetorical

> *"What does it mean? It means..."*

Drop the question. Just say what it means.

### 13. "In retrospect," / "Looking back,"

The retrospective testimony register is already retrospective. Naming it is redundant.

### 14. Paired-denial / paired-affirmation cadence

> *"I do not give myself that much credit. I do not pretend to..."*
> *"I will try to do better. I will probably also fail."*

Once is fine; the rhythm of paired denials or paired declarations *in series* is a tic. Vary the form, or break the pair across paragraphs.

### 15. "X. Y. Z." three-fold short-fragment enumeration

> *"Fever-bright eyes. Neuro-erotic dance. The we-both-know-how-this-ends speech."*

Permitted *once*, sparingly, when each fragment is concrete and operationally specific. Used multiple times in a chapter, it becomes a cadence-tic. Watch the count.

### 16. "I think about X. I think about Y. I think about Z." (or similar repetitive verb-cluster)

> *"I think about the woman in Sundbyberg. I think about Maricar. I think about what I refused."*

Drop the repeated verb. Just name the things.

### 17. "Is" definitional clusters

> *"This is what happened. This is the part I avoided. This is what I wish I had said."*

In clusters, this construction reads as overdetermined sermon. Once or twice; not in a row.

### 18. Formal numbered lists in prose ("first... second... third...")

> *"The ending is wrong in three ways. The first is... The second is... The third is..."*

If the prose needs a list, the prose probably needs a paragraph. Reword.

---

### Why these specifically

These constructions are characteristic of AI-generated prose because models are over-trained on essay-mode internet writing — TED talks, Medium pieces, longform political journalism, LinkedIn posts. They feel intelligent on first read; read at scale, they are the prose equivalent of clearing one's throat for emphasis. A reader who has read enough AI text pattern-matches them instantly.

The work's voice is calibrated to *not* trigger that pattern-match. When in doubt: would this sentence appear in a Medium thinkpiece? If yes, cut.

### How to recover when one of these surfaces in a draft

- Em-dash → period or rewrite without the pivot
- Negative definition → positive description with operational specifics
- "I want to be careful" → just be careful silently
- Front-loaded importance → strip the signal
- Sentence-opening "And yet" → period and a noun-led sentence
- Triadic balance → cut one or both extra clauses
- Paired denials → break the pair
- "I think about X. I think about Y." → drop the verb, name the things
- Formal numbered list → paragraph

### Drafting discipline

Every chapter draft should be re-read with this checklist in hand. Mark each structure that fires. Rewrite. The rewrite is faster than the catch.

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
