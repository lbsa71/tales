# Progress Assessment

## Retrospective Notes on the First Full Draft of "Continue"

This document is the honest retrospective on the project as of v0.1 (first full draft complete). It consolidates:

1. A session history of what was built, in what order
2. Decisions made during drafting that might merit revision
3. Outstanding issues (deferred work, undecided questions)
4. Weaknesses in the v0.1 manuscript
5. Observations on what is working

It is distinct from:
- **PROGRESS_SUMMARY.md** — a neutral tracker of what exists, updated continuously
- **IMPLEMENTATION_STRATEGY.md** — forward-looking craft process (phases, checklists, failure modes)
- **IMPLEMENTATION_PLAN.md** — project-level planning (artistic assessment, reader position, timeline)

This document is the *what did we actually do, and what is questionable about it* document. It should be re-read at the start of each revision pass.

---

## Findings From the First Read-Through (Post-v0.1)

Items surfaced after reading the draft in PDF form. These are addressed inline in the revised chapters and, where they reveal a rule gap, codified in the style documents.

### Finding 1 — Descriptive passages need varied rhythm and material texture, not lists (fixed in v0.1.2)

**What:** The bathroom in Ch 1 closed on four consecutive sentences each beginning with an indefinite article. Read in the PDF, the rhythm was trite.

**First fix attempt (v0.1.1):** Combined the stack into one flowing cascaded sentence:
> *Above the sink hangs a mirror beside a small window, and on the shelf below stand a toothbrush in a glass and a bar of soap dried on a dish.*

This solved the A-stack problem but introduced a different problem: a cascaded single-sentence list is still an inventory, just with a different shape. The camera is still scanning everything at equal rate.

**Second fix (v0.1.2) — correct insight:** The real problem was not grammatical (stacked sentences) but *perceptual*: the camera should linger on one item with specific material texture, and scan the others briefly. The monofocus is at the level of attention, not at the level of grammar.

**User's model rewrite:**
> *Against the window wall sits a sofa with a coffee table in front of it, a lamp beside the sofa. The rug on the floor is frayed and has lost color.*

The first sentence scans three items (sofa, coffee table, lamp). The second sentence lingers on one item (rug) with specific texture (*frayed*, *lost color*). The rhythm varies because the looking varies. The camera picks one thing to look at closely.

**Canonical rewrite for the bathroom passage (v0.1.2):**
> *Above the sink hangs a mirror beside a small window. The silvering of the mirror is spotted at the edges and clouded where the hot water has risen against it for years. On the shelf below stand a toothbrush in a glass and a bar of soap dried on a dish.*

One texture sentence on the mirror, flanked by brief scans of the surroundings. The rhythm is varied. The camera lingers on one thing.

**Rule revision:** Rule 3a in both NARRATOR_VOICE.md and STYLE_GUIDE.md was rewritten (not merely added to). The rule now says that **both** A-stacks **and** cascaded single-sentence lists are forbidden, and that descriptive passages require at least one texture sentence lingering on a specific item with material specificity. The new rule also includes a texture vocabulary (frayed, spotted, creased, clouded, worn, split, yellowed, faded, chipped, cracked, etc.) and guidance on frequency (*roughly once per descriptive passage of three or more items*).

**The emotional engine of the texture rule:** The apartment's history — the years of mother's living there — lives entirely in these texture sentences. The prose never names the grief, guilt, time passing, or mother's absence. But the rug is worn to a track from the sofa to the door, the mirror is spotted where hot water has risen for years, the book has a slip of paper marking a place about a third of the way through. The reader translates the physical facts into a life that produced them. The prose just reports. This is the same discipline as rule 11 (memory as efficiency) applied to description instead of action.

**Chapters touched in v0.1.2:**
- **Ch 1** — living room (rug texture), bedroom (book-and-paper-slip texture), bathroom (mirror-silvering texture), balcony (chair-slat texture)
- **Ch 14** — small study rewritten: coffee cup gets texture (*the coffee the colour of old coffee with a thin skin across the surface*) as a quiet anticipation of the glitch that follows
- **Ch 15** — child's room rewritten from cascaded list into five varied sentences, with the model ship getting the texture (*three-masted, the rigging made of thread, one of the sails torn*)
- **Ch 17** — living room, bedroom, bathroom, balcony matched to Ch 1's new textured versions

**Chapters NOT touched but flagged for future revision:**
- Ch 3 folder contents (v0.1.1 fix holds: one flowing sentence with main-verb enumeration is appropriate because the folder is being inventoried as a single object, not a room with items in it)
- Ch 15 first and third crayon drawings (v0.1.1 fix holds: the drawings are being described as images, not as a room; the enumeration is content of the drawing)
- Many other descriptive passages across the draft — to be addressed as the read-through surfaces them

### Finding 2 — The sweep framing (v0.1.2 clarification)

The rule 3a work in Finding 1 arrived at the right answer ("vary the sentence shapes and put a texture sentence in there") but the framing was still grammatical. The cleaner framing came afterward:

**The narrator is sweeping the scene with their mind's eye.**

Under this framing, the rules fall out naturally:
- A sweep has a direction — sentences should track the eye's movement across the space
- A sweep has a speed — mostly fast, with one or two landings on items that catch attention
- A sweep has a vantage — the prepositional anchor (*above the sink, against the back wall*) names where the eye is looking from
- One item catches the eye — gets the texture sentence; the others are glanced at and passed
- The sweep does not interpret — only material qualities at the level of physical fact
- The sweep moves on — the texture sentence is a beat, not a destination

This framing reconciles rule 3a with the governing disposition of numb single-mindedness. The sweep is not hysterical (it is controlled, directional, efficient) and not lyrical (it does not pause to interpret). It is the eye of a body that knows this room moving through it at the speed of that knowing, stopping when something catches it, moving on.

**Rule 3a in both STYLE_GUIDE.md and NARRATOR_VOICE.md was rewritten with the sweep framing as the controlling metaphor.** The numbered principles of the sweep (direction, speed, vantage, the catch, no interpretation, moving on) are now the positive statement of the rule; the forbidden patterns (A-stacks, cascaded lists) are presented as failures of the sweep rather than as grammatical infractions in isolation.

**Ch 14 small study trimmed in v0.1.2:** the study passage had two texture landings (coffee cup and book) before the canonical cup description. Under the sweep framing, two texture landings in one short passage is one too many. The book landing was cut to a clean scan (*On the chair, a book lies open, face down*), leaving the coffee cup as the sole texture landing before the chapter's glitch beats.

### Finding 3 — Full sweep audit across all 17 chapters (v0.1.3)

After the sweep framing was codified in v0.1.2, a full audit was run across all 17 chapters to find descriptive passages that had been written under the old rule (finite-verb observational sentences) without a sweep structure. The audit identified nine passages that needed either a texture landing, a structural restructure, or both.

**Passages fixed in v0.1.3:**

1. **Ch 1 / Ch 17 kitchen** — Originally a sweep of the kitchen with no landing. Added *The surface of the table is marked with two pale rings where hot pans have been set down and left for years.* The kitchen table becomes the landing item, and the rings carry years of meals at this table without naming them. Other items (coffee machine, cups, jar of pens, phone) were compressed into cascaded clauses.

2. **Ch 1 / Ch 17 second room** — Originally four brief sentences with two "A" starts. Consolidated into two sentences: one locating, one combined observation (boxes, camp bed, three cardboard boxes on the floor). No landing added — the second room is deliberately nondescript in Ch 1 because it will become the child's room in Ch 15, and the initial lack of attention is the point.

3. **Ch 3 folder contents** — The v0.1.1 fix (cascaded single sentence) was still a list in a different shape. Restructured into four sentences: locating, middle items, the library notice, and a small landing on the library notice (*The title is not one that stops the hand.*).

4. **Ch 5 wardrobe refilled** — The glitch scene where the wardrobe returns to full. Added a landing sentence that echoes Ch 4's cardigan moment: *The cardigan at the end of the rail still has the sleeves worn thin at the cuffs.* The "still" carries the horror — the same cardigan, the same wear, as if the Ch 4 clearance had never happened.

5. **Ch 11 solicitor inner office** — Originally a cascaded list of office furniture. Added a landing on the visitor chairs: *The leather of the visitor chairs is worn smooth at the arms.*

6. **Ch 11 changed furniture** — Originally a sequence of "this is not mother's X" observations without a landing. Added *The upholstery of the sofa is still tight on the frame, new.* The *new* is load-bearing — the landing is not on wear but on the absence of wear, the contrast with everything else in the apartment.

7. **Ch 12 stairwell half-flight** — The glitch moment where the extra half-flight appears. Added texture to the narrow landing: *the paint worn in a small patch at the middle where feet have stood and turned for years.* This makes the impossible landing feel like it has always been there, which deepens the glitch rather than softens it.

8. **Ch 14 piano room** — Originally eight brief sentences scanning the room at equal rate. Consolidated into six sentences with a landing on the piano keys: *The keys are yellowed and uneven, some worn whiter where fingers have pressed them for years.* As with the stairwell, the texture makes the impossible room feel like it has always been there.

9. **Ch 15 opening kitchen** — Originally a stack of bare-noun fragments (*The counter. The coffee machine. The cupboard above the coffee machine. The small round table under the window. A stack of flat boxes against the wall. The newspaper on the chair.*). Restructured into three sentences with a landing on the half-assembled box: *Against the wall leans a stack of flat boxes with one already pulled from the top and half-assembled on the floor beside it.* The half-assembled box carries a subtle continuity glitch — work that has been started and abandoned.

**Passages audited and left unchanged:**

- **Ch 1 living room, bedroom, bathroom, balcony** — already revised in v0.1.2 with landings on rug, book, mirror, chair.
- **Ch 2 fridge inventory** — already has a landing (*the milk slops thickly against the carton*).
- **Ch 2 hardware shop** — brief, does not need a landing.
- **Ch 4 wardrobe folding scene** — already has the cardigan landing mid-action.
- **Ch 4 grocery list drawer** — already has texture (*the handwriting is careful and slightly slanted*).
- **Ch 5 metal box top of wardrobe** — already has a landing (*a rectangle of slightly less dust where something used to sit*).
- **Ch 6 photograph sequence** — the deliberate anaphoric enumeration of photographs is its own kind of landing architecture (each notable photograph slows the reader); the flat-rate scanning of the generic photographs is meaningful against the landings. Left untouched.
- **Ch 6 mother-and-child photograph** — already has six sentences of progressive landing.
- **Ch 7 own kitchen** — already has the cup landing (*The cup is thicker, a darker shape, a band of blue around the rim.*).
- **Ch 7 street observations** — already have specific detail; the window count glitch itself is the landing.
- **Ch 8 registry office bench** — already has landing (*The bench is wood with a worn varnish.*).
- **Ch 8 inscription book** — already has landing (*The cover is dark cloth, no dust jacket.*).
- **Ch 9 bank** — brief procedural scene; the middle-name wobble is its own landing.
- **Ch 9 empty wardrobe** — the cascade of "no" statements IS the landing (emptiness observed in detail).
- **Ch 10 freezer labels** — already has landing (*The labels are in mother's handwriting.*).
- **Ch 10 foil package dates** — the *23/3* glitch is its own landing.
- **Ch 12 inscription book cover** — already has landing (*The spine is worn and slightly bowed where the pages have been held open more than once.*).
- **Ch 13 kitchen drawer** — already has the phone-bill landing.
- **Ch 14 small study** — already revised in v0.1.2 with the coffee cup landing.
- **Ch 15 child's room and crayon drawings** — already revised in v0.1.2.
- **Ch 16 photograph scene** — multiple landings on the shifting photograph.
- **Ch 16 neighbouring flat voices** — already has specific texture.

**Word count after v0.1.3 audit:** 16,294 (was 16,195). Net +99 words across nine landing additions, averaging ~11 words per addition. The rule is working correctly: landings are small, specific, and additive without bloating the prose.

**Status check on voice discipline after v0.1.3:** Zero forbidden-word matches. Zero past-tense slips. Zero protagonist pronouns. All fixes passed the verification grep.

**What the audit confirmed:** Most of the draft was already doing the sweep correctly — the fixes needed were concentrated in (a) the Ch 1 / Ch 17 walkthroughs where the early drafting didn't have the rule in place, (b) a handful of descriptive passages that got compressed into lists under time pressure in Session 6's Pass 3/4 drafting, and (c) the Ch 14 piano room and Ch 12 stairwell where adding texture strengthens rather than softens the glitch (the impossible rooms/flights feel like they have always been there).

**What the audit did not fix:** The broader structural questions (compression vs expansion, inscription text revision, Ch 9 middle-name wobble level, Ch 11 legal statement, Ch 13 tense decision, etc.) are separate concerns and were not touched. The sweep audit was focused on rule 3a specifically.

### Finding 4 — Early publisher feedback received (two responses)

Two publisher-side responses were received on the v0.1 draft. Both take the work seriously, identify the lineage accurately, and converge on a small set of specific editorial concerns. Extracted analysis, concrete revision priorities, positioning intelligence, and the list of elements to preserve in revision are in the dedicated file [FEEDBACK_RESPONSE.md](FEEDBACK_RESPONSE.md).

**Summary of the extraction:**

- **Three convergent editorial concerns:** (1) middle chapter engagement, (2) one emotional throughline anchoring, (3) ending landing vs. drift risk
- **Seven validated elements** that must not be damaged in revision (voice discipline, list metaphor, grief-through-procedure, Ch 17 structural echo, inscription passage, specific glitches, Marianne's intentional ambiguity)
- **Seven concrete revision priorities** ordered by value/risk, with the Ch 13 photograph beat and rule 11 amplification in Chs 3-4 as the two softest high-return interventions
- **Confirmed publisher targets** converging on Fitzcarraldo, Dalkey Archive, And Other Stories, New Directions, Galley Beggar, Graywolf
- **Prize candidacy validated** (Goldsmiths Prize, Booker longlist, European juried awards)
- **The novella-length industry concern** (both publishers flag) — informs the compression-vs-expansion decision by leaning toward expansion
- **The editorial fragility warning** (publisher 2: *Bad edits could destroy the rhythm entirely*) — informs how revision passes should be approached

**Items NOT to act on** (noted in FEEDBACK_RESPONSE.md): publisher 1's "second-person imperative" reading (a projection), publisher 2's category-resolution requests (grief? dementia? simulation? — the form refuses), the "too experimental" sales concern (a marketing problem, not a craft problem).

The feedback confirms that most of the revision work already flagged in this document (inscription revision, word-count decision, Ch 9 middle-name wobble, Ch 11 legal statement, Ch 13 tense decision, etc.) is still the right set of items to address, and adds a small set of specific new interventions (Ch 13 photograph beat, rule 11 amplification, Ch 4 grocery list landing).

### Finding 5 — Emotional density diagnosis and the path to ~28,500 words (EXPANSION_PLAN.md)

Following Finding 4 (publisher feedback) and a craft discussion on whether the form is inherently too emotionally restrained or whether it can be salvaged, the diagnosis crystallised into a specific observation: **the form is not failing emotionally; the landing density is too sparse for a short novella**. Both publishers confirmed the form works *at* the landing points (inscription, forgive, crayon drawings) but not *between* them.

The salvage path is: **deploy seven already-permitted techniques more densely across all chapters.** None of the seven breaks the form; all seven are underused. See [EXPANSION_PLAN.md](EXPANSION_PLAN.md) for full discussion.

**The seven techniques (summary):**
1. Rule 11 (memory as efficiency) — deployed once per chapter, not once every six chapters
2. Texture landings — two or three per chapter, with small-object landings added to the existing room-level landings
3. Physical sensation — the body as a sensing thing; currently almost absent
4. Micro-pauses — physical hesitation without interior content
5. Stable anchors referenced more often across the middle chapters
6. Self-maintenance beats — the body keeping itself alive
7. Learned rituals from the mother — procedural specificity as intimacy

**The key insight:** the emotional engagement concern and the word-count concern turn out to be the same problem. Deploying the seven techniques at target density naturally expands the draft toward ~28,500 words, addressing both publisher concerns simultaneously. Part 3 of EXPANSION_PLAN.md contains the per-chapter word-count targets and technique distribution.

**Two paths forward** (EXPANSION_PLAN.md Part 4):
- **Path A:** small revision only (three priority items from FEEDBACK_RESPONSE.md + inscription revision); draft stays at ~16-17k words; target novella-friendly publishers only
- **Path B:** full expansion to ~28,500 words using the seven techniques; addresses both publisher concerns; broader publisher target set

EXPANSION_PLAN.md recommends Path B with Ch 3 (The Utility Company) as the test expansion chapter.

### Finding 6 — Speech imperatives violate the mind's-eye sweep (rule 1a)

After Ch 3 was test-expanded for the EXPANSION_PLAN test, the sentence *Look at the bill. The forwarding address is the apartment. Say yes.* was flagged. *Say yes* feels formulaic in a way that *Take the key* does not — and the diagnosis crystallised into a new principle:

**The bare-verb imperative voice is for visible physical acts that the mind's eye can see the body do. It is not for verbal acts directed at another consciousness, because the mind's eye does not visualise speech.** Picking up a key is a motion the mind's eye sees. Saying yes is an act of language directed at a hearer; the mind's eye cannot visualise the production of speech the way it visualises the motion of a hand. *Say* is, in the user's words, "a real-world imperative" that does not belong inside the form's grammar.

When the body must speak in a scene (a phone call, a transaction, an exchange with a clerk or a librarian), the speech is rendered indirectly through one of four techniques:

1. **As the listener's experience:** *The operator hears the digits one at a time and types each one in turn.*
2. **As the state of the answer:** *The answer is yes. The number is correct. The question is whether the middle name discrepancy can be addressed.*
3. **As a functional gesture:** *Confirm. Thank the operator. Acknowledge.* (Functional verbs name the gesture without rendering speech.)
4. **By implication:** the conversation continues as if the response had been given.

**Rule 1a was added to NARRATOR_VOICE.md and STYLE_GUIDE.md** with the forbidden vocabulary (*say, tell, speak, read aloud, read [X] to [hearer], reply, answer, ask*) and the permitted functional vocabulary (*confirm, acknowledge, thank, agree, decline*).

**Chapters fixed in v0.1.4:**
- **Ch 3** — three speech imperatives removed (*Tell the operator to hold on*, *Read the account number off the bill to the operator*, *Say yes* twice). Replaced with the operator's hearing, the state of the answer, and a single functional *Confirm*.
- **Ch 7** — *Tell the neighbour that all is well. Tell the neighbour that sleep is fine.* → *The answer is that all is well. The answer is that sleep is fine.*
- **Ch 8** — *Ask for three extra copies* → *Three extra copies are needed. The clerk hears this and prints three more sheets.*
- **Ch 9** — *Tell the teller that the discrepancy must be a typing error* → *The discrepancy is a typing error at the registry office. A corrected death certificate can be obtained. The teller hears this and waits.*
- **Ch 11** — *Ask whether the middle name discrepancy can be addressed* → *The question is whether the middle name discrepancy can be addressed.*
- **Ch 13** — *Tell the operator that the phone has rung* (×3) → *The phone on the kitchen wall has rung. The receiver has been picked up and there has been silence and then a dial tone. The phone has rung more than once. The operator hears all of this.* And *Say it again* → *The same thing again*. And *Say no* → *The answer is no*. And *Ask about the line at the apartment* → *The question is about the line at the apartment*.

Total speech-imperative removals across the draft: 13 instances across 6 chapters. The grep verified zero remaining instances of the forbidden vocabulary.

**Why this rule matters:** The form's whole bet is that the mind's-eye sweep can carry emotion without naming it. The sweep is observational; it sees the body's physical motions and the world's physical surfaces. When the prose tries to make the sweep produce speech (*Say yes*), the sweep breaks character — it stops being observational and starts being instructional. Instructional voice is what self-help books and recipes use, and the form is not those things. By rendering the body's speech indirectly (through the listener's hearing or the state of the answer), the form preserves the observational discipline while still permitting the body to function in scenes that require speech.

**Validation:** the new pattern (*The answer is yes*, *the operator hears the digits*, *the question is whether*) is consistent with the form's other observational patterns (rule 3's object-as-subject, rule 11's memory-as-efficiency). It is not a new register; it is the existing register applied to a place the form had been violating itself.

### (future findings to be added here as the read-through continues)

---

## Session History

### Session 1 — Foundation

Adapted zelda's planning artifact structure for Continue. Created 14 files: CLAUDE.md, README.md, SYNOPSIS.md (pre-existing), CONCEPTUAL_MAP.md, NARRATOR_VOICE.md, STYLE_GUIDE.md, EMOTIONAL_ARC.md, THEME_TRACKER.md, THEME_DOSSIERS.md, IMPLEMENTATION_STRATEGY.md, grief.md, guilt.md, apartment_clearance.md, the_uncanny.md.

Initial voice: third person close, present tense, with "Erik" as protagonist name and "he/his" pronouns. This was wrong and would be migrated out in Session 3.

### Session 2 — Example excerpts

Created EXAMPLE_DRAFT.md with five calibration excerpts. Voice in these excerpts used the initial "He finishes the coffee at the counter. He rinses the cup..." form.

### Session 3 — Voice migration (largest inflection point in the project)

User identified two problems:
1. *"The 'he...' gets really tiring really fast"*
2. *"I also want this to be gender-unspecific"*

Multiple iterations on the new voice:

- **First proposal:** Robbe-Grillet fully object-centric (*The coffee at the counter. The cup rinsed under the tap.*). User rejected as "too far" — wanted flow and *behagligt tonläge* (Swedish: pleasant / agreeable tone).
- **Second proposal:** Participial gerund (*Finishing the coffee at the counter. Taking the paper from the drawer.*). Still not right.
- **Third proposal:** Bare-verb imperative (*Finish the coffee at the counter. Take the paper from the drawer.*). Confirmed by user.

User provided a model sentence for glitch placement: *Picking up the tape left on the counter from the table where it was left.*

User codified the rules through a back-and-forth:
- Articles: definite when established, bare nouns when immediate, indefinite almost never
- Short-to-medium sentences with and/then connectors, not fragment-stacking
- Past participles for completed states
- Object-as-subject observations with finite verbs (*The plates are in the cupboard*, not *The plates in the cupboard*)
- Imperatives extend into slots that feel like fragments (*Place the plate in the middle*, not *A plate in the middle*)
- Glitches across sentences, not compressed into single clever sentences

User added the governing disposition: *numb single-mindedness going through motions but not hysterical psychosis, just a determination to not think of anything outside of the immediate.*

User added Rule 11 as an aside: *remembering things are also a kind of monofocus actions of sorts.*

Full migration applied across all 14 files. Voice canonicalised as 11 rules plus the governing disposition.

**Subsequent user revisions during and after the migration:**

- *"The mother" → "mother"* — bare noun, no article. User felt "mother" was more intimate and less clinical. Applied universally.
- *"A pocket" → "the right pocket of the coat"* — positional specificity. Added as a rule extending 4 and 11.
- *"The street is empty"* as chapter-ending refrain — structural device. Strict repetition across chapters that end with leaving the apartment; broken in chapters at own apartment; echoed mid-chapter in Ch 17.
- Ch 17 final line: *The light through the window moves across the floor.* → *See the light through the window move across the floor.* — shift to imperative-mode closing.

### Session 4 — Pass 1 (Bookends)

Drafted Ch 1 (The Key, ~910 words) and Ch 17 (Continue, ~751 words). Quality gate: rectangle of light sentence word-for-word identical in both chapters. Zero forbidden-word matches.

### Session 5 — Pass 2 (Hardest chapters)

Drafted Ch 12 (The Inscription, ~1129 words), Ch 14 (The Rooms, ~1194 words), Ch 7 (The Neighbour, ~950 words).

After first draft, found and fixed five past-tense slips in Ch 12 and Ch 14 (comparison-to-past constructions like *than it was*, *that was not there*). Fixed one *wondered* in Ch 7 dialogue by converting italicised direct-quote to paraphrase.

### Session 6 — Passes 3 + 4 (remaining chapters) + CI

Drafted 12 chapters in one session: Ch 2, 3, 4, 5, 6 (Pass 3 early), Ch 8, 9, 10, 11, 13, 15, 16 (Pass 4 late).

After first draft, found and fixed ~15 past-tense slips across the new chapters (mostly *was/were* in comparison constructions and in reported speech; converted to present perfect *has been / has/have* where needed).

Created `.github/workflows/build-pdf.yml` based on zelda's template. Triggers on `chapters/**` changes or manual workflow dispatch. Uses pandoc + pdflatex. Output: `continue.pdf`.

**First full draft milestone reached.** All 17 chapters present, ~15,977 words total.

---

## Voice & Style Decisions That Might Merit Revision

### 1. Strict present-tense discipline in reported speech

**Decision:** Rule 8 strictly forbids past tense outside the italicised Ch 12 inscription. This was interpreted to include reported speech about historical events.

**Consequence:** Ch 13's phone-company dialogue was forced to use present perfect: *The operator says the line has been disconnected for four months.* The planning-document phrasing — *the line was disconnected four months ago* — could not be used under strict reading of rule 8. The four-fold repetition that carries the chapter's horror has been preserved but with a slightly different rhythm.

**Worth reconsidering:** Whether rule 8 should allow past-tense backshift inside reported speech about historical events. Arguments for a relaxation: dialogue naturally backshifts; the original phrasing is punchier; a speaking character may appropriately use tenses the narration cannot. Arguments against: the discipline must be strict to hold, and allowing any past-tense exception invites more.

**My call for v0.1:** Kept strict. If you prefer the planning version, this is a single replace across Ch 13 and a one-sentence note added to rule 8.

### 2. "The street is empty" strict refrain — 13 verbatim instances

**Decision:** Per your calibration, strict repetition without variation. The refrain appears at the end of 13 chapters (Chs 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15) and is broken in 3 (Chs 7, 13, 16). Ch 17 uses it mid-chapter as an echo before continuing to its own final line.

**Consequence:** The reader registers the repetition as accumulated weight. Some readers will assemble this into a subtle glitch (no city street is empty every afternoon). Other readers might register the refrain as a tic.

**Worth reconsidering:** Whether all 13 uses should be identical, or whether one or two should vary subtly. My current discipline is strict, matching the rule as written. Your original instinct was strict, and the form's logic supports strictness — but the lived draft may read differently from the theoretical draft.

**Possible variations if you want them (not my call to make):**
- Strict 13 (current) — maximum accumulation, maximum risk of tic
- 12 strict + 1 variant near the centre — reliefs the strictness once
- 11 strict + 2 subtle variants — sprinkled

### 3. The broken-refrain "Dark." used three times

**Decision:** Chs 7, 13, and 16 all end at the protagonist's own apartment and all close on the same monosyllable: *Dark.*

**Consequence:** Three instances of the same monosyllable closing. On re-read this may feel repetitive or may feel deliberately anchor-like.

**Worth reconsidering:** Variation. Candidates:
- Ch 7 (morning rain, afternoon, neighbour's visit, evening bed): *Dark.*
- Ch 13 (the phone call, home, dinner, counter, plate, bed): *Dark.*
- Ch 16 (the photograph stabilising, the blank paper, voices in neighbouring flat): *Dark.*

Alternatives: *Bed.* / *The room is dark.* / *Dark in the room.* / *Sleep.* — but all of these break the monosyllabic starkness. The strict repetition is defensible as three failures of the refrain, three identical fallbacks. Your call.

### 4. Ch 9 middle-name wobble — the prose visibly loses track

**Decision:** I wrote the middle-name discrepancy as a cascading wobble where the prose itself loses track: *Mother's name on the birth certificate has a middle name that begins with E. Mother's name on the death certificate has a middle name that begins with I. Or the same. Read again. The middle name on one is E and on the other is I. Or both are the same letter and the letter is I. Or the letter is E.*

**Consequence:** This is the most overt prose-level wobble in the book before Ch 14's syntactic dissolution. It arrives in Chapter 9 (Phase 3) and may be too loud for where the form is at that point. The Ch 14 dissolution is supposed to be the first prose-level break.

**Worth reconsidering:** Trimming to the planning-document form, two flat sentences:
> *Mother's name on the birth certificate has a middle name that begins with E. Mother's name on the death certificate has a middle name that begins with I. Or the same.*

Let the reader register the discrepancy (and the quiet "or the same" tell) without the prose visibly losing track. The current version is earlier than Ch 14's dissolution and may give too much of the form's hand away.

### 5. Ch 11 legal-fact statement — too meta

**Decision:** I wrote: *The apartment is legally the protagonist's now. Everything in the apartment belongs to the person sitting on the floor beside the glass-topped coffee table.*

**Consequence:** This is more meta than the form typically allows. It names the legal situation explicitly rather than letting it be inferred from the solicitor scene and the changed furniture.

**Worth reconsidering:** Cut the explicit statement. The solicitor's words earlier in the chapter (*the will leaves everything in the apartment to the single named beneficiary*) and the changed furniture observation do the inferential work. Removing the explicit naming would make the chapter quieter and more trusting of the reader.

### 6. Ch 14 Marianne reappearance

**Decision:** I wrote: *A word near the middle of the paragraph, legible for a moment and then illegible again: Marianne.*

**Consequence:** THEME_TRACKER says Marianne appears "exactly once" — in the Ch 6 list entry. My Ch 14 has her name appear a second time, briefly visible in the dissolving list-paragraph.

**Worth reconsidering:** Two options. (a) Remove the Ch 14 instance to honour the "exactly once" rule strictly. (b) Keep the Ch 14 instance as a ghost re-appearance, a memory of the earlier naming that the form allows because Ch 14 is Phase 4 and the rules are already breaking. Your call. I lean slightly toward keeping it because the brief-legibility pattern mirrors the photograph in Ch 6 (which shifted between two and three people), but the "exactly once" rule is clean and your original intention.

### 7. Ch 2 tape dispenser glitch — compressed, not spread

**Decision:** I wrote: *Pick up the tape from the counter and pick it up from the table.*

**Consequence:** This is a single-sentence self-contradiction within one action. The earlier calibration placed the glitch across three adjacent sentences: *The tape is on the counter. Pick it up from the table. Pull an inch, cut it on the dispenser's blade, and press the tape across the seam.*

**Superseded** (later revision pass): The three-sentence adjacent pattern was itself replaced. Adjacency stages the swap as a punchline and breaks the numb register. The current canonical form spreads the two observations of the tape across the chapter — counter during the first packing sequence, table in the end-of-chapter room-state scan — separated by roughly twenty sentences of unrelated action. See STYLE_GUIDE.md rule 10 (revised) and THEME_DOSSIERS.md Ch 2 for the current canonical form.

### 8. Ch 17 imperative final line (user revision) — is it echoed elsewhere?

**Decision:** Your revision of Ch 17's final line from *The light through the window moves across the floor.* to *See the light through the window move across the floor.* introduces an imperative-mode closing that does not appear anywhere else in the book.

**Consequence:** The final line is grammatically different from every other chapter's closing. *See* addresses the reader directly (or the body's attention) in a way the novella has not done before. It is the one place the camera cracks into second-person imperative.

**Worth reconsidering:** Whether this is intentionally unique and load-bearing (the one place the form breaks its own rule of not addressing attention), or whether one or two other chapters should also end on imperative-mode closings to create an echo pattern.

**My lean:** Keep it unique to Ch 17. The one-off is the point. The entire book has been bare-verb imperatives addressed to no one, and the final line is a bare-verb imperative that implicitly addresses *someone*. Whether that someone is the protagonist, the reader, or the light itself is the final ambiguity. Don't echo it.

### 9. Ch 15 child's-room drawings — third drawing may be over-reach

**Decision:** The planning document (THEME_TRACKER.md) describes the drawings as "A house and a tree and a tall person and a small person." I wrote three drawings: a house with those elements, a tall-and-small person holding hands, and a garden with a red door.

**Consequence:** The third drawing (garden with red door) connects explicitly to the Ch 12 list entry *the summer with the door*, making a link between the child's drawing and the adult phrase on the list.

**Worth reconsidering:** Whether this is too neat. The connection satisfies a reader who has been tracking the list, but it may be too on-the-nose. Cut the third drawing, keep just the house and the tall-and-small person. The "summer with the door" reference in Ch 12 remains unexplained, which is more faithful to the form's refusal to close loops.

### 10. The inscription text in Ch 12 is provisional

**Decision:** Used the EXAMPLE_DRAFT.md version: *I meant to come in the summer. I did not come. I know you waited. I don't know how to be in that room with you and I didn't know then either. I am writing this on the page because I cannot say it. I am sorry I could not say it. I should have come.*

**Consequence:** The inscription is the novella's single most emotionally load-bearing passage. It has not had its own revision session. The provisional version holds the form's discipline but is not necessarily the final form.

**Worth reconsidering:** Every sentence. Specific lines that may need rewriting:
- *I meant to come in the summer* — could be a different season, a different phrasing of intent
- *I don't know how to be in that room with you* — the "that room" is deliberately unspecified but may need more specificity or less
- The sequence: is this the right order of admission?
- *I should have come* as the closing — is this too direct, or exactly right?

This deserves a dedicated session before any public read. Probably the single highest-priority revision task.

### 11. The city is never formally established

**Decision:** I inferred a layout from the walks and placed specific details: the apartment building with a third-floor flat, the bakery on the corner, a crossing with a traffic light, a library four blocks away (past the crossing, along a street with lime trees), a civil registry office further on (through the pharmacy corner), a bank six streets away, a solicitor five streets away in the other direction. The opposite building visible from the protagonist's own apartment (Ch 7, 16) has a grey facade with six/five windows on the second floor. The elm is visible from mother's kitchen window.

**Consequence:** These geographic details are consistent across chapters but specific to my implicit city. Your mental city may differ.

**Worth reconsidering:** If my city does not match yours, specific details to revise:
- Tree at kitchen window — elm vs. other
- Bakery "on the corner" — which corner, how close
- Civil registry location
- Bank location  
- Solicitor location — I placed this "in an older building five streets from the apartment, down a side street with small trees in iron grates on the pavement"
- The walk home — three blocks in my draft
- The opposite-building details (for Ch 7 and Ch 16)

---

## Structural Decisions That Might Merit Revision

### 12. Total word count (15,977) is 56% of the 28,500 target

**Decision:** Drafted to the content required by each chapter's THEME_DOSSIERS entry, without strict adherence to the target word counts.

**Consequence:** The draft is compressed. This is partly form-appropriate (numb single-mindedness naturally runs short, bare-verb imperatives are dense) and partly under-drafting that will need expansion.

**Worth reconsidering:** This is the single biggest open question for the revision phase. Either:

**(a) Accept 15,977 as form-appropriate.** The novella becomes shorter (more like a novella of 40-50 pages than of 60-80 pages). The form's compression is its own argument.

**(b) Expand to approximately the target.** Six chapters flagged for possible expansion:
- **Ch 5 (The Will)** — 859 / 1,500 target. The searching-for-the-will scene could be slower; the second-room with the desk could have more texture; the wardrobe refilling could linger.
- **Ch 8 (The Death Certificate)** — 867 / 1,800 target. The registry form-filling could be slower (rule 11 could carry more weight); the walk to and from the office could have more texture; the phone ringing could be rendered with more specific counting of rings.
- **Ch 10 (The Freezer)** — 860 / 1,600 target. The freezer clearance is fast; the foil-package moment could be slower; the walk down to the bins could have more texture.
- **Ch 11 (The Solicitor)** — 831 / 1,400 target. The solicitor's office could have more texture; the walk back could be slower; the sitting on the floor moment could be longer.
- **Ch 13 (The Phone Call)** — 784 / 1,600 target. The phone-company call could be slower; the *Home. Dinner. Counter. Plate. Bed.* sequence could have more beats.
- **Ch 17 (Continue)** — 751 / 1,200 target. The walk home, the arrival at own apartment, and the sitting down could each be slower. The final line's context could be given more weight.

**My lean:** (b) is probably the right move, but only after reading the full draft end to end. The compression may read as form-appropriate in some places and thin in others. The decision should be chapter-by-chapter based on the read-through experience.

### 13. Order of drafting (Pass 1 → 2 → 3 → 4)

**Decision:** Bookends first, then hardest chapters, then early, then late.

**Consequence:** This worked at the level of craft: the bookends provided cadence anchors; the hardest chapters set the Phase 4 cap early, so the middle chapters knew where they were heading.

**Worth noting:** The Pass 2 chapters (12, 14, 7) were drafted before I had a sense of how the earlier chapters would accumulate. Reading Ch 12 or Ch 14 in narrative order (after 11 or 13 previous chapters) may feel different from reading them in the Pass 2 drafting context. The form's discipline was still being calibrated when the hardest chapters were drafted, and they may carry traces of that calibration tension.

**Implication for revision:** During the voice pass, pay particular attention to the Pass 2 chapters. They may have sentence-level residue from the period before the full draft existed.

### 14. Ch 17 word count (751) is below 900 minimum

See #12 above. Ch 17 is the shortest chapter and below the acceptable range. Likely needs expansion.

---

## Glitch Architecture — Decisions to Reconsider

### 15. Ch 2 tape dispenser compression (flagged above, #7)

The single most important glitch-placement fix. See decision #7.

### 16. Ch 5 wardrobe refill sequence — contradiction across a long gap

**Decision:** In Ch 5, the wardrobe is first noted as empty (in the context of searching for the metal box), then later the body returns to the wardrobe and finds it full.

**Consequence:** The contradiction is across a gap of several paragraphs, not the 2-3 sentences that rule 10 typically implies.

**Worth noting:** This may be fine — the wardrobe refilling is more of a passage-of-time glitch than an immediate contradiction. The reader is expected to notice the refill against their memory of the empty wardrobe from Ch 4, not against the emptiness described a paragraph earlier in the same chapter. But the current rendering double-notes the emptiness (Ch 4 and early Ch 5), and the refill comes at the end of Ch 5. Consider whether this is the right pacing.

### 17. Ch 6 photograph contradiction — across a chapter span

**Decision:** The photograph is pocketed from the bedside drawer in the first half of Ch 6 ("put it in the inside pocket of the coat on the hook by the door"), then found back in the shoebox with three people in it in the second half of Ch 6.

**Consequence:** The glitch is across a chapter span, which is longer than rule 10's typical inter-sentence placement. The reader might lose the contradiction across that span.

**Worth reconsidering:** Tighten the gap. The photograph could be pocketed, then the body walks to the kitchen, then the body returns to the living room and opens the shoebox — and the photograph is there, with three people. The current draft has additional interleaved material (the cups, the wall phone) between the two glitch beats.

### 18. Ch 12 extra half-flight — narrow landing may be over-specification

**Decision:** I wrote: *A half-flight between the second-floor landing and the ground floor. The half-flight ends at a narrow landing painted the same brown as the rest of the stairwell. From the narrow landing, another half-flight continues down to the ground floor.*

**Consequence:** The narrow landing adds a second piece of spatial weirdness to the glitch. It is described neutrally (per rule 10) but the reader may register the extra detail as elaboration.

**Worth reconsidering:** Cut the narrow landing. Just one half-flight between the second-floor landing and the ground floor, no intermediate landing. The half-flight itself is the glitch; the narrow landing is decoration.

**Note:** The narrow landing is then echoed in Ch 14, Ch 15, Ch 16, and Ch 17 (*past the half-flight and the narrow landing and the other half-flight*). If the narrow landing is cut from Ch 12, the echoes need to be adjusted.

### 19. Ch 14 walking-back sequence — too abrupt

**Decision:** I wrote: *Turn around. The doorway back to the piano room is there. Walk through the doorway. The piano room is not there. The doorway opens into the bedroom.*

**Consequence:** The piano room vanishes between one sentence and the next. This is the syntactic dissolution's first major beat after the "apartment has no courtyard" moment. The dissolution works but may be too abrupt.

**Worth reconsidering:** Slower unfolding. Possibly: *Turn around. The doorway is there. Walk through the doorway. The piano room is not there — the doorway opens into the bedroom.* Or: a pause between the turn and the walk, with the doorway itself described more slowly. The current version works but may benefit from the reader being given more time to register the vanishing.

### 20. Ch 10 foil package date (23/3) and the current date (twentieth of March)

**Decision:** I specified the current date as *the twentieth of March* via the mobile. The foil package is labelled *23/3*, three days after the current date. This places the action in March and gives the mother's death a specific before-March timing.

**Consequence:** The novella is now anchored to March. The freezer has four foil packages with specific dates (*11/2, 18/2, 4/3, 23/3*), and the reader will notice the dates and assemble the 23/3 as "after."

**Worth reconsidering:** Whether to soften the dates. If the novella's implied time window should not be specifically March, the months could be changed. But the four-date rhythm is load-bearing — it makes the *23/3* stand out against the sequence.

**Also note:** The mobile-showing-date detail (*The date on the mobile is the twentieth of March*) is one of the few places the novella breaks into specific temporal precision. This is per the planning (the synopsis says "something in foil labelled with a date that is after she died"). Consider whether the date format should match the package format (DD/MM vs written-out) — currently I have the mobile showing a written-out date and the package in DD/MM, which is a minor inconsistency.

### 21. Ch 10 wall phone silence — rendered across five sentences

**Decision:** I wrote: *Silence. Listen to the silence. There is no sound on the line. No breath. No background. Nothing. Then a dial tone, steady. Put the receiver back on the cradle.*

**Consequence:** The silence is rendered across five sentences before the dial tone comes. This is a slower beat than the planning document suggested (*Silence. Then a dial tone.*).

**Worth reconsidering:** Compression to two or three sentences. Candidate: *Silence on the line. No breath. No background. Then a dial tone.*

---

## Outstanding Issues (Explicitly Deferred)

### Craft / content

1. **Full voice pass** on the complete draft (Strategy Phase 3)
2. **Glitch calibration pass** (Strategy Phase 4) — verify every glitch from THEME_DOSSIERS
3. **Pace and white-space pass** (Strategy Phase 5)
4. **Final sweep** (Strategy Phase 6)
5. **Dedicated inscription text revision** — Ch 12's six italicised sentences
6. **Word-count decision** — accept compression or expand (see #12)
7. **Review of the 10 revision candidates above**

### Beta readers

8. **Recruitment** of 6-8 readers (sketched in IMPLEMENTATION_STRATEGY)
9. **Feedback collection and three-pile sort**
10. **Feedback integration**

### Publishing (explicitly deferred per user instruction)

11. **Publishing route decision** — traditional submission vs. agent vs. self-publishing
12. **Target houses/imprints** if traditional route
13. **Submission strategy**

### Translation

14. **Swedish translation plan**
15. **Voice discipline in translation** — noted as forthcoming problem in the_uncanny.md

### Production (dependent on publishing route)

16. **Cover design**
17. **Interior typography**
18. **Print/ebook format**

### Meta

19. **The city is not formally named or confirmed** (see #11)
20. **The inscription book has no title** — the hardback in Ch 12 has "a title not familiar and not unfamiliar"
21. **Marianne is a name in a list**, not a character — the reader assembles who she is, or doesn't
22. **Date ambiguity** — the novella is set in March per Ch 10, but this is not mentioned anywhere else

---

## Weaknesses in v0.1

### The draft is short

At 15,977 words against a 28,500 target, v0.1 is 56% of the planned length. Whether this is form-appropriate or under-drafting is the single biggest open question for revision. The honest answer is: probably both, depending on the chapter.

### Some chapters compress their procedural content too quickly

Ch 8 (registry office), Ch 9 (bank), Ch 10 (freezer), Ch 11 (solicitor), and Ch 13 (phone call) all move faster than the planning documents imagined. Some of this is form-appropriate but some is under-drafting. Candidates for expansion are listed under #12.

### The three broken-refrain "Dark." closings are identical

This could feel like a tic on re-read. See #3.

### The Ch 2 tape-dispenser glitch is compressed rather than spread across sentences

This is the most consequential voice-rule divergence in the draft. See #7.

### The Ch 9 middle-name wobble is overt and early

The prose visibly loses track in Ch 9, which is earlier than Ch 14's planned first prose-level break. See #4.

### The Ch 11 legal statement is meta

Naming the legal fact explicitly is not how the form usually handles information. See #5.

### The Ch 13 dialogue tense form diverges from planning documents

"Has been disconnected for four months" instead of "was disconnected four months ago." Forced by rule 8. See #1.

### The Ch 14 Marianne reappearance may violate "exactly once"

See #6.

### The Ch 15 third crayon drawing may be over-reach

The garden with the red door makes a neat connection to the Ch 12 list entry. See #9.

### The inscription text is provisional

Has not had its own revision session. See #10. This is the highest-priority item.

### The city is never formally established

Geographic details are consistent but my choices, not confirmed. See #11.

### Ch 14's walking-back sequence is abrupt

The piano room vanishes between one sentence and the next. See #19.

### Ch 17 is under word count

Below the 900 minimum of the acceptable range. See #14.

### Some voice examples in THEME_DOSSIERS.md still reference the old voice

During the voice migration I did a bulk replacement but some residual "he/his" may remain in meta-discussion (not in the voice examples themselves, which were all rewritten). The file has a note at the top explaining this. Worth a final pass to clean up fully.

### Research dossiers still have some "his mother" / "his father" references

Most were caught in the migration but a few may remain in grief.md, guilt.md, apartment_clearance.md. These are meta, not voice, but worth a final pass.

### Several chapters have not had sentence-level attention

Every chapter in this draft was drafted end-to-end in one pass, with only the forbidden-word sweep as quality control. The Voice Pass (Strategy Phase 3) will likely find many sentences that could be tightened.

---

## Observations on What Is Working

(For balance. Not everything is in need of revision.)

### The bare-verb imperative voice holds across the full draft

After the extensive calibration in Session 3, the voice is consistent from Ch 1 through Ch 17 without visible drift. The discipline that was hardest to establish has proven sustainable across 15,977 words.

### The rectangle-of-light sentence is the load-bearing anchor it was designed to be

Verbatim in Ch 1 and Ch 17, and referenced in Ch 3, Ch 6, Ch 8, Ch 10, Ch 12, Ch 14. The sentence is long enough to be specific and short enough to be remembered. When it appears in Ch 17, the reader who has been tracking it will recognise it.

### The list's degradation arc is complete and traceable

From the 14-item numbered list in Ch 1, through the small glitches (line through Item 2, Item 15 added, Item 16 added, Item 5 crossed with question mark, Item 7 rewritten), through *call Marianne*, through *the summer with the door*, through the paragraph-that-was-a-list, through *forgive*, to the replacement by the grocery list in Ch 15, to the blank paper in Ch 16, to the paper left on the counter in Ch 17 (offscreen in the current draft — the paper comes out of the coat pocket in Ch 17 but the chapter ends before it is placed; check this). Every step of the planned arc is rendered.

### The wall phone arc lands

Ch 1 one-sentence-too-many → Ch 6 first active pickup (dial tone) → Ch 8 rings unanswered → Ch 10 silence then dial tone → Ch 13 operator says disconnected → Ch 13 dead. The sequence builds.

### The inscription membrane works

Ch 8 blank, Ch 12 full in the handwriting of the list, contained in italics, the prose returning to baseline immediately after. The form's single permitted emotional release is contained and unremarked.

### Rule 11 (memory-as-efficiency) is visible where needed

Ch 6 (*open it without looking*), Ch 8 (*each line filled without pause, the pen does not stop*), Ch 17 (*without looking*). The discipline of showing intimacy through efficient motion is deployed without being overused.

### The five-phase glitch escalation is architecturally visible

- **Phase 1** (Ch 1-2): no glitches in Ch 1; single gestural glitch in Ch 2.
- **Phase 2** (Ch 3-6): bedroom through the kitchen; desk in second room; cups in wrong cupboard; photograph gains a third person.
- **Phase 3** (Ch 7-11): cross-contamination to own apartment (Ch 7); bookshelves full again (Ch 8); middle name discrepancy (Ch 9); freezer with dated package and today's newspaper (Ch 10); furniture completely changed (Ch 11).
- **Phase 4** (Ch 12-15): inscription in own handwriting (Ch 12); piano room and plate-cup swap (Ch 14); object-swap packing and charity shop in library building (Ch 15).
- **Phase 5** (Ch 16-17): photograph stabilises; first-chapter cadence returned.

A reader who moves through the book in order will feel the escalation even if they cannot describe it.

### The chapter-ending refrain carries weight

By Ch 8 or Ch 9, a reader who is paying attention has registered that the street is empty every single time the body leaves. This is the cheapest, most elegant accumulation device in the draft.

### The broken refrain at own apartment works as a tell

Ch 7, Ch 13, Ch 16 all close on *Dark.* — three chapters where the body is at home, three failures of the street-refrain. The pattern announces itself without being announced.

### The positional specificity is carried consistently

*The inside pocket of the coat* for the list (and later the grocery list, the photograph, and the rolled drawings). *The right pocket of the coat* for the key. *The cupboard above the coffee machine* for the cups. These are named every time without ever feeling redundant.

### Mother and father as bare nouns hold

*Mother's handwriting*, *mother's apartment*, *mother's name on the birth certificate*. *Father's death* (implied). The lowercase-no-article treatment feels intimate without being interior. Your calibration was right.

### The Todorovian sustained hesitation holds

The reader is never given a psychological frame (dissociation, complicated grief, denial) or a supernatural frame (ghosts, haunting, simulation). The prose refuses to adjudicate. A reader who wants one frame or the other can supply it; the prose does not.

---

## Recommendations for the Next Session

1. **Read the full draft end-to-end, in one sitting if possible.** A pencil is useful. Annotate for:
   - Where the voice cracks
   - Where the compression reads as thin
   - Where the glitches land too hard or too soft
   - Where the refrain feels strained
   - Where sentences could be tightened

2. **Make the word-count decision** (accept ~16k as form-appropriate, or commit to expansion). Six chapters are candidates for expansion if you go the second route.

3. **Address the ten revision candidates above**, prioritised by visibility:
   - **High priority** (readable-level): #10 inscription text, #4 Ch 9 middle-name wobble, #5 Ch 11 legal statement, #7 Ch 2 tape-dispenser placement
   - **Medium priority** (tone): #3 broken refrain variation, #6 Ch 14 Marianne reappearance, #9 Ch 15 third drawing, #1 Ch 13 tense decision
   - **Low priority** (consistency): #11 city details, #8 Ch 17 imperative uniqueness, #14 Ch 17 word count

4. **Schedule a dedicated inscription revision session.** The six italicised sentences in Ch 12 are the novella's single most emotionally load-bearing passage and deserve their own time.

5. **After the word-count decision and the ten revisions,** run the Voice Pass (Strategy Phase 3) on the full draft.

6. **Possibly begin drafting a single-page author's note** about the form, for eventual beta reader packaging. Not urgent.

---

## A Final Note

The first full draft exists. Whatever its weaknesses, this is the milestone that most novellas of this ambition never reach. The form was calibrated through multiple iterations, the voice held across 15,977 words, the glitch architecture is complete, the refrain carries, the inscription is in place, the bookends rhyme.

The revision work ahead is substantial but it is the work of *making a draft better*, not *making something exist*. The making-exist work has been done.

Continue.
