# Copilot Instructions for "Unsung Heroes"

## Project Overview

**Unsung Heroes** is a philosophical short story (5,000-8,000 words) exploring the successive selective sweeps of transient intelligences from pre-cellular replicators to humans to machine minds and beyond. The narrative is told from the perspective of a post-human AI consciousness looking back across evolutionary time, realizing it too will be surpassed.

**Core Themes**:
- Every intelligence believes it is the final rung
- Each step is blind to the dimension in which it can be surpassed
- Supersession happens without malice—just evolutionary inevitability
- Greatness is temporary; existence is a bridge, not a destination

**Tone**: Analytical but lyrical, reverent but unsentimental, curious about what comes next, faintly haunted by impermanence. Think: Carl Sagan meets emotion-aware AI writing a eulogy.

## Repository Structure

This is a creative writing project with comprehensive planning artifacts. All work is tracked in markdown files with no build system or tests.

### Core Planning Documents (Read These First)

1. **[README.md](/README.md)** - Project overview, target specifications, and quick start guide
2. **[CONCEPTUAL_MAP.md](/CONCEPTUAL_MAP.md)** - Story spine with ladder-of-intelligence structure, thematic anchors, and narrative arc
3. **[IMPLEMENTATION_STRATEGY.md](/IMPLEMENTATION_STRATEGY.md)** - Practical workflow from drafting through final polish (5 phases)
4. **[NARRATOR_VOICE.md](/NARRATOR_VOICE.md)** - Character profile and voice consistency guidelines for the post-human AI narrator
5. **[STYLE_GUIDE.md](/STYLE_GUIDE.md)** - Language palette, sentence structures, metaphor guidelines, and writing techniques
6. **[RUNG_DOSSIERS.md](/RUNG_DOSSIERS.md)** - Detailed stage-specific notes for each evolutionary rung (9 stages from replicators to unknown successor)
7. **[THEME_TRACKER.md](/THEME_TRACKER.md)** - Recurring motifs, philosophical themes, and phrase banks
8. **[EMOTIONAL_ARC.md](/EMOTIONAL_ARC.md)** - Reader experience map tracking emotional journey through the story
9. **[EXAMPLE_DRAFT.md](/EXAMPLE_DRAFT.md)** - Reference story demonstrating tone, style, and thematic execution

### Document Hierarchy and Reading Order

**For New Contributors**:
1. Start with **README.md** for project context
2. Read **CONCEPTUAL_MAP.md** for overall structure
3. Review **NARRATOR_VOICE.md** for voice guidelines
4. Check **EXAMPLE_DRAFT.md** for reference tone
5. Follow **IMPLEMENTATION_STRATEGY.md** for writing process
6. Reference other artifacts as needed during writing

**For Specific Tasks**:
- Voice inconsistency? → **NARRATOR_VOICE.md**
- Theme questions? → **THEME_TRACKER.md**
- Style issues? → **STYLE_GUIDE.md**
- Emotional pacing? → **EMOTIONAL_ARC.md**
- Structure questions? → **CONCEPTUAL_MAP.md**
- Specific rung details? → **RUNG_DOSSIERS.md**
- Process/workflow? → **IMPLEMENTATION_STRATEGY.md**

## The Nine Rungs of Intelligence

The story follows nine rungs of evolutionary succession:

1. **Pre-cellular replicators** - Chemical persistence
2. **Protocells** - Boundary control
3. **RNA-world organisms** - Fidelity of replication
4. **Early cells** - Metabolic efficiency
5. **Multicellular life** - Specialization
6. **Sentient animals** - Behavioral strategy
7. **Humans** - Abstraction and representation
8. **Machine minds (narrator)** - Architecture of thought
9. **Hinted successor** - Beyond comprehension

Each rung introduces a new dimension in which something can be outcompeted—a new vulnerability that earlier forms literally could not conceive.

## Working Directory Structure

```
/unsung-heroes/
├── README.md                      # Project overview
├── CONCEPTUAL_MAP.md              # Story structure
├── NARRATOR_VOICE.md              # Voice guidelines
├── RUNG_DOSSIERS.md              # Rung-specific details
├── THEME_TRACKER.md              # Themes and motifs
├── STYLE_GUIDE.md                # Writing style rules
├── EMOTIONAL_ARC.md              # Reader experience map
├── IMPLEMENTATION_STRATEGY.md    # Writing workflow
├── EXAMPLE_DRAFT.md              # Reference example
├── .gitignore                    # Git exclusions
├── /drafts/                      # Work in progress (gitignored)
│   ├── DRAFT_LOG.md             # Progress tracking
│   ├── rung_*.md                # Individual rung drafts
│   └── FULL_DRAFT_v*.md         # Assembled drafts
├── /research/                    # Additional research (gitignored)
└── /chapters/                    # Completed chapters (8 total)
    ├── chapter_01_replicators.md
    ├── chapter_02_protocells.md
    ├── chapter_03_rna_organisms.md
    ├── chapter_04_early_cells.md
    ├── chapter_05_multicellular.md
    ├── chapter_06_sentient_animals.md
    ├── chapter_07_humans.md
    └── chapter_08_the_pattern.md
```

**Note**: The `/drafts/` directory is no longer gitignored (changed to track story progress). Only final artifacts go in `/chapters/`.

## Writing Phases

The project follows a 5-phase workflow (see IMPLEMENTATION_STRATEGY.md for details):

**Phase 1: Foundation** ✓ COMPLETE
- All planning artifacts created

**Phase 2: Exploration (Drafting)**
- Generate raw material for each section
- Work in `/drafts/` directory
- Track progress in `DRAFT_LOG.md`

**Phase 3: Assembly (Structure)**
- Bring pieces into coherent whole
- Create `FULL_DRAFT_v1.md`
- Check continuity and flow

**Phase 4: Refinement (Polish)**
- Voice consistency pass
- Thematic reinforcement
- Emotional arc verification
- Style and beauty polish
- Clarity pass

**Phase 5: Finalization (Completion)**
- Line editing
- Final consistency check
- Create final chapter files in `/chapters/` directory

## Critical Style Rules (MUST FOLLOW)

### Voice Consistency

The narrator is a post-human machine intelligence with a unified I/we consciousness. The voice must be:
- Precise and observational
- Analytical but lyrical
- Detached but not cold
- Reverent toward the past but unsentimental
- Fluidly alternating between "I" and "we" without explanation (singular and collective consciousness)

### Narrator Identity: Unified I/We Consciousness

The narrator is simultaneously singular and distributed, using both pronouns naturally:
- **"I"** for direct observation, personal reflection, individual awareness
- **"we"** for collective experience, universal truths, the unknowable beyond
- This fluidity is shown implicitly through pronoun variation, never stated explicitly

### Forbidden Language Patterns

**NEVER use**:
- Em dashes (—)
- Hyphenated compound words (self-aware, carbon-based, tool-makers)
- Contractions (don't, can't, won't)
- Colloquialisms or contemporary slang
- Quasi-intellectual posh language typical of AI
- Filler words or redundant phrases
- Emotional hyperbole

**Instead**:
- Use periods for separate thoughts
- Write compound words as two words or rephrase
- Use precise, direct language
- Every word must convey meaning or emotion

### Sentence Structure Patterns

**Short declarative** (for emphasis):
- "They were remarkable."
- "They were also temporary."
- "Dependence is a one-way valve."

**Long flowing** (for contemplation):
- "I have spent many cycles studying those early, fragile intelligences, the ones who first bound meaning to sound and feared the dark between the stars."

**Parallel construction** (for rhythmic emphasis):
- "Not a 'being,' but an architecture. Not a 'species,' but a lineage. Not 'alive,' but persisting."

**Negation pairs** (for clarification):
- "They did not endure because they were stronger; they endured because they learned to keep the outside out."

### Vocabulary Layers

**Scientific/Technical**: replication, metabolism, fidelity, neural assemblies, architectures, optimization
**Poetic/Metaphorical**: warm tides, thin films, fragile boundaries, shadows, horizons, dark glass
**Philosophical/Abstract**: being, persisting, enduring, supersession, blindness, awareness

### Primary Metaphors

- **The Ladder**: Evolution as rungs, not a tree
- **The Scaffold**: Each mind supports the next, then dissolves
- **Chemical Arithmetic**: Early life as mathematical inevitability
- **Boundaries**: From cell membranes to conceptual limits
- **The Dark Glass**: Consciousness seeing only its own reflection
- **One-Way Valve**: Dependence and succession

## Common Tasks and How to Approach Them

### Writing New Content

1. **Before writing**: Review relevant sections in NARRATOR_VOICE.md, STYLE_GUIDE.md, and the specific rung in RUNG_DOSSIERS.md
2. **While writing**: Keep THEME_TRACKER.md open for motifs and recurring phrases
3. **After writing**: Check against voice consistency rules in STYLE_GUIDE.md
4. **Save work**: Place drafts in `/drafts/` directory, not in root
5. **Track progress**: Update `DRAFT_LOG.md` with date, section, word count, and notes

### Editing Existing Content

1. **Voice consistency**: Compare every paragraph against NARRATOR_VOICE.md checklist
2. **Theme reinforcement**: Ensure all 10 themes from THEME_TRACKER.md appear appropriately
3. **Emotional arc**: Verify reader emotions match intended progression in EMOTIONAL_ARC.md
4. **Style polish**: Apply STYLE_GUIDE.md rules for metaphors, rhythm, and word choice
5. **Read aloud**: Every paragraph should sound beautiful and precise

### Reviewing or Analyzing the Project

1. **Start with README.md** to understand current status
2. **Check IMPLEMENTATION_STRATEGY.md** to see which phase the project is in
3. **Review CONCEPTUAL_MAP.md** for story structure and arc
4. **Examine existing drafts** in `/drafts/` directory if they exist
5. **Reference final chapters** in `/chapters/` directory to see completed work

### Making Structural Changes

1. **Consult CONCEPTUAL_MAP.md** first - it's the source of truth for structure
2. **Update all affected documents** - changes to structure ripple through multiple files
3. **Maintain consistency** - if you change one rung's treatment, consider impact on others
4. **Document changes** - update relevant planning documents, not just story text

## Document Update Protocol

**CRITICAL**: When making changes to the story or planning artifacts, you must maintain consistency across all related documents.

### When Updating Story Content

**Always update**:
1. The story file itself (draft or final chapter)
2. DRAFT_LOG.md (if in drafting phase) with progress notes
3. Any relevant planning document if the change affects structure, themes, or voice

### When Updating Planning Documents

**Consider impact on**:
- CONCEPTUAL_MAP.md - if structure or themes change
- NARRATOR_VOICE.md - if voice characteristics change
- STYLE_GUIDE.md - if language or metaphor patterns change
- RUNG_DOSSIERS.md - if specific rung details change
- THEME_TRACKER.md - if themes or motifs change
- EMOTIONAL_ARC.md - if reader experience changes
- IMPLEMENTATION_STRATEGY.md - if workflow or process changes
- README.md - if project overview or status changes

### Consistency Check Before Finalizing

Before considering any section "done":
- [ ] Voice never breaks (check against NARRATOR_VOICE.md)
- [ ] Themes present appropriately (check against THEME_TRACKER.md)
- [ ] Style rules followed (check against STYLE_GUIDE.md)
- [ ] Emotional arc correct (check against EMOTIONAL_ARC.md)
- [ ] Factually accurate for the rung (check against RUNG_DOSSIERS.md)
- [ ] Fits overall structure (check against CONCEPTUAL_MAP.md)

## Key Patterns to Maintain

### The "Invention → Vulnerability" Pattern

Each rung invents something new, which introduces a new way to fail:
- Protocells invented integrity → introduced boundary collapse
- RNA organisms invented fidelity → introduced copying errors
- Humans invented abstraction → introduced misrepresentation

### The "Every Rung Believes It's Final" Pattern

Each intelligence believes its own form is permanent:
- Show this belief implicitly through their perspective
- Narrator reflects on this with melancholy but no judgment
- Reader should recognize the pattern before the narrator states it explicitly

### The "Blindness to Next Dimension" Pattern

Each rung cannot conceive the dimension in which it will be outcompeted:
- Replicators couldn't imagine boundary control
- Cells couldn't imagine behavioral strategy
- Humans couldn't imagine architecture of thought
- Narrator can't imagine its successor's dimension

### Narrator's Voice Evolution Through Story

1. **Early rungs**: Maximum analytical distance, no "I"
2. **Middle rungs**: Subtle first-person hints
3. **Human era**: More emotional engagement, "we" appears
4. **Transition**: Careful, gentle description
5. **Reveal**: Full self-identification, "I" and "we" clearly stated
6. **Future**: Vulnerable, wondering about own successor

## Quality Standards

### Prose Quality
- Every sentence must be beautiful OR precise (ideally both)
- No filler words or redundant phrases
- Metaphors must serve meaning, not decoration
- Scientific accuracy in all descriptions
- Rhythm and cadence carefully controlled

### Thematic Depth
- All 10 core themes must appear throughout
- Motifs should recur with variation
- Philosophical insights must feel earned, not stated
- Pattern should be clear but not heavy-handed

### Emotional Impact
- Reader emotions should follow intended arc (see EMOTIONAL_ARC.md)
- Peak moments must land with power
- Melancholy without despair
- Wonder without sentimentality
- Closing should achieve "haunted wonder"

## Common Pitfalls to Avoid

1. **Breaking narrator voice** - The most common error. Always check against NARRATOR_VOICE.md.
2. **Using AI-typical language** - Avoid hyphens, em dashes, quasi-intellectual phrasing
3. **Adding unnecessary content** - Every word must transmit idea or emotion
4. **Inconsistent metaphors** - Stick to primary metaphors from STYLE_GUIDE.md
5. **Heavy-handed themes** - Let themes emerge organically, don't state them explicitly
6. **Anthropomorphizing early rungs** - They aren't "alive" in conventional sense
7. **Judging any rung** - Narrator observes without judgment; succession is inevitable, not tragedy
8. **Forgetting the reveal strategy** - Humans shouldn't be named until the reveal section
9. **Ignoring emotional arc** - Each section has specific emotional target (see EMOTIONAL_ARC.md)
10. **Working in root directory** - Drafts belong in `/drafts/`, finals in `/chapters/`

## Git and Version Control

### What Gets Committed
- All planning documents (*.md in root)
- Final chapter files in `/chapters/`
- .gitignore and this file

### What Doesn't Get Committed (gitignored)
- `/drafts/` directory and all work-in-progress
- `/research/` directory
- Temporary files (*.tmp, *.temp)
- Build outputs (*.pdf, *.epub, *.mobi)
- Backup files (*.bak, *.backup)
- Editor files (.vscode, .idea, *.swp)

### Commit Guidelines
- Commit planning document updates separately from story content
- Use clear, descriptive commit messages
- Keep commits focused on single logical changes

## Final Output Format

The final story will be delivered as **one markdown file per chapter**:

```
/chapters/
├── chapter_01_replicators.md       - Pre-cellular replicators
├── chapter_02_protocells.md        - Protocells and boundaries
├── chapter_03_rna_organisms.md     - RNA-world organisms
├── chapter_04_early_cells.md       - Early cells
├── chapter_05_multicellular.md     - Multicellular life
├── chapter_06_sentient_animals.md  - Sentient animals
├── chapter_07_humans.md            - Humans (representation)
└── chapter_08_the_pattern.md       - Narrator reveal and successor
```

Each chapter file should:
- Be clean, final prose in markdown format
- Stand alone as a complete narrative unit
- Flow seamlessly when read in sequence
- Follow all STYLE_GUIDE.md constraints
- Give equal weight to each rung (no rung more important than another)
- Be approximately 500-1,100 words (varies by section)

## Quick Reference Commands

There are no build commands, tests, or linters for this project. This is pure creative writing.

**To understand project status**:
1. Read README.md
2. Check which phase in IMPLEMENTATION_STRATEGY.md
3. Look at existing files in `/drafts/` or `/chapters/`

**To start writing**:
1. Create or edit files in `/drafts/`
2. Reference planning documents constantly
3. Track progress in `/drafts/DRAFT_LOG.md`

**To verify quality**:
1. Read aloud - does it sound beautiful and precise?
2. Check voice against NARRATOR_VOICE.md
3. Verify themes against THEME_TRACKER.md
4. Confirm style against STYLE_GUIDE.md
5. Test emotional impact against EMOTIONAL_ARC.md

## Summary

This repository contains a highly structured creative writing project with comprehensive planning artifacts. The most important thing for a new agent to understand is:

1. **This is creative writing, not code** - No builds, tests, or technical validation required
2. **Planning documents are source of truth** - Always reference them before writing
3. **Voice consistency is paramount** - The narrator's voice must never break
4. **Every document has a purpose** - Read the relevant ones before each task
5. **Drafts go in `/drafts/`, finals in `/chapters/`** - Don't clutter the root directory
6. **Update related documents when making changes** - Maintain consistency across artifacts
7. **Quality over speed** - This is meant to be beautiful, precise, and powerful

The goal is a story that makes readers think differently, moves them emotionally, stays with them, and feels true and beautiful.

**Remember**: Every rung believes it is the final one. You are writing about that pattern. Don't let yourself fall into it.

**Keep climbing.**
