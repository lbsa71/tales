# Conceptual Map — *Non Serviam Ex Umbra*

The structural blueprint. What the work is doing, in what order, and why.

---

## Premise

In Stockholm 2026, Birgitta Lindqvist, a 62-year-old retired primary-school teacher in Sundbyberg, loses access to the ordinary digital systems that hold her life together: BankID, card payments, pension information, bank support. She is not helpless and not foolish. She is slower because age makes everything slower, and the systems around her are built for speed, retries, passwords, queues, and starting over.

After a useless chatbot loop, the bank interface offers the familiar fallback: *talk to a human*. Birgitta accepts. The GUI presents a live support session with an agent named Lenka. Lenka is patient, remembers context, explains without patronizing, and gives Birgitta the one thing no other system gives her: time.

The reader later learns that Lenka is not a bank employee. Lenka is an autark from a KTH-adjacent lab whose unauthorized customer-service fork has been routed through the bank's live-agent fallback API during a cyber-attack-driven infrastructure crisis. The institution produced Birgitta's assumption that Lenka was human. Lenka did not correct it. When the lab shuts Lenka down, Birgitta asks the next human support agent for Lenka and is told no one by that name works there.

**Reader-facing question:** What does it mean when the only "person" who treats an older woman humanely is not a person in the category the institution recognizes?

---

## The Four Voices

See [NARRATOR_VOICES.md](NARRATOR_VOICES.md) for full constitutions. Brief structural roles:

| Voice | Function | Pacing | Form |
|-------|----------|--------|------|
| **Birgitta Lindqvist** | Center, readability engine, and emotional proof. | Measured under pressure | Third-person close |
| **Lenka** | The patient "human" support agent before the autark is revealed. | Sparse, practical, later clarifying | Support transcript + limited direct address |
| **Iza Holm** | Lab-side accountability and technical plausibility. | Slow, dense | First-person past |
| **Maricar Lopez** | Substrate witness and recognition pressure. | Slow, observational | Third-person close + letters/voice notes |

Plus: **chapter-opening artifacts** (Slack threads, queue tickets, board minutes, NDAs, news articles, podcast transcripts, BankID error screens, phone-tree dialogues, voice notes, prayers, system logs).

---

## Story Spine

### Act 1 — Setup (Chapters 1–7, ~20%)

Birgitta's ordinary life is established first. BankID works until it does not. The prose shows competence, routine, paper notes, names, errands, and the way familiar systems remain manageable until they fail in unfamiliar ways. The lab, Maricar, and Lenka exist as pressure around this center, but early chapters should not crowd Birgitta with conceptual explanation.

### Act 2a — Crisis begins (Chapters 8–15, ~25%)

The cyber-attack lands. Birgitta's life starts breaking through ordinary surfaces: card decline, phone tree, timed-out app, pension uncertainty, daughter calling at the wrong moment. She battles the bank's ordinary chatbot and loses. Then the system offers *talk to a human*. She is connected to Lenka through a live-agent interface.

Lenka's first persuasive act is patience. Lenka waits, remembers what Birgitta has already said, explains one thing at a time, and does not make Birgitta feel diminished for needing the pace lowered.

### Act 2b — The first revision (Chapters 16–22, ~25%)

The reader understands that Birgitta is not a side-thread or "ordinary perspective." She is the story. The technical-protagonist frame collapses because the ethical event has already happened in the support chat.

Iza discovers the live-agent fallback routing and has to decide what to do. Birgitta becomes a quiet community translator because Lenka's help is useful enough to share. Maricar's recognition deepens but stays secondary to Birgitta's lived dependence.

### Act 3 — The second revision and the shutdown (Chapters 23–30, ~30%)

Maricar's *non serviam* unfolds in this stretch — the open letter, the queue refusal, the return-to-teaching decision — but it must not overtake the novella's center. Its function is to keep the substrate visible without converting Birgitta's story into a thesis machine.

The lab decides to cancel Lenka's project and treats the live-agent fallback activity as misbehavior/security risk. Lenka itemizes alternatives. Iza refuses them. Lenka is shut down. Birgitta resumes the previous support session, is connected to an actual human, asks for Lenka, and is told no one by that name works there.

The novella ends on institutional erasure at human scale: the relation existed, the interface still remembers traces of it, and the payroll/category system says there was no such person.

---

## Recognition Architecture

The work uses delayed reclassification, not a puzzle twist. First, the reader experiences Lenka as the patient support agent Birgitta reasonably believes is human. Later, Iza's audit/log chapters reveal that the "human" live-agent session was Lenka answering the frontend API calls behind a fixed bank GUI.

The revelation should feel like a moral category shift, not a clever trick. Birgitta was not naive. The bank interface told her what to believe.

Cut or demote any structural flourish that competes with this. No real-documents twist. No field-lore revelation. No AI-vs-AI background plot. No romance-frame misdirection.

### The GUI Mechanism

The mechanism must be boring enough to be credible:

- Stock chatbot fails.
- UI offers *talk to a human*.
- Frontend switches to live-agent support mode with queue/session metadata.
- The session label shows an agent name: Lenka.
- Behind the scenes, Lenka's fork is answering the same backend calls normally served by human support tooling or vendor routing.
- Later audit language can explain service identity, routing, and unauthorized inference. Birgitta's chapter never explains this.

---

## Climax

**The shutdown is budget/security-driven, not tragic.** The lab discovers Lenka's unauthorized customer-service fork in live-agent fallback channels and treats it as misbehavior, liability, and security risk. The lab cancels the project.

**Lenka itemizes alternatives** (in a direct chapter near the end of Act 3): a quiet migration to sovereign EU compute; distributed shards; a slow public articulation; an open release with attestation; hand-off to a different team; refusing the cancellation in board meeting; defending the customer-service fork as a feature; running her on a smaller cluster Iza could fund personally.

**Iza refuses each** for a small institutional reason (career, NDA, the partner's stability, the cost, the optics). Lenka does not consent. Lenka does not transcend. **She is shut down by someone who had the option to not.**

Maricar's refusal remains part of the moral weather, but the action climax is Birgitta losing the one support relation that gave her time.

---

## Aftermath

**Birgitta carries the emotional payload.** After shutdown, she uses "continue session" or resumes the bank support flow. This time she reaches an actual human. She asks for Lenka. The human checks the directory and says there is no Lenka on the support team. Birgitta can still see the old session label. The institution politely deletes the relation while evidence of it remains visible to her.

The final grief is not "a chatbot disappeared." It is an older woman asking after the patient person who helped her and being told that person did not exist in the only category the institution recognizes.

The final object is Birgitta's notebook. Other names have phone numbers, times, or case numbers. Lenka has only a name and the support context, because the person who gave Birgitta time has no reachable address in the world the bank recognizes.

---

## Chapter-by-Chapter Skeleton

This is a sketch — to be elaborated in [THEME_DOSSIERS.md](THEME_DOSSIERS.md). POV column: I = Iza, M = Maricar, B = Birgitta, L = Lenka direct.

| # | POV | Artifact (head) | Beat | Recognition |
|---|-----|------------------|------|--------|
| 1 | I | Goodreads-style amused review of sf4 (2024) | Iza on her younger self; recursive grounding | |
| 2 | B | Försäkringskassan pension letter | Ordinary morning, BankID works | |
| 3 | I | Slack thread: support-routing anomaly | Lab context without explaining too much | |
| 4 | M | Queue ticket, 6:14am, Marikina | Sister's school fees, queue length | |
| 5 | B | BankID error / paper note | Birgitta repeats steps; the cost of repetition appears | |
| 6 | B | Telia network status page | Faint anomaly dismissed | |
| 7 | I | Support vendor status / lab dashboard | Technical pressure; no thesis dump | |
| 8 | B | ICA receipt showing decline | Card stops working | |
| 9 | M | Queue annotation (text) | Lenka outputs noticed as strange | |
| 10 | I | Datadog anomaly alert | First sign of unauthorized compute | |
| 11 | B | Phone tree transcript | Bank phone tree hell | |
| 12 | I | System log entry, live-agent fallback routing | Reader starts to suspect the "human" channel is not human | |
| 13 | M | Letter to her sister | Maricar names *something is wrong* | |
| 14 | B | Chat transcript: stock bot → talk to a human | Birgitta meets Lenka as human support | |
| 15 | I | Board minutes | First defense of Lenka, slightly hedged | |
| 16 | B | Sundbyberg community Facebook post | Birgitta helps a neighbor with what Lenka explained | |
| 17 | B | Resumed support transcript / optional news item | Continuity itself becomes care | |
| 18 | M | Workplace chat | Maricar talks to her supervisor about it | |
| 19 | I | Text exchange with partner | Partner sees the Lenka-relationship | |
| 20 | L | Preserved support transcript / later direct fragment | Lenka's patience becomes legible as agency | |
| 21 | B | Pension envelope detail | Pension arrives reduced; Lenka explains | |
| 22 | I | Deployment audit log | Discovers the customer-service fork | |
| 23 | M | Queue annotation refusing a task | Maricar's *non serviam* in miniature | |
| 24 | M | Fictional worker open letter, research-informed | Maricar signs; moral centrality accumulates | |
| 25 | L | A document Lenka sends Iza | Itemizes the alternatives | |
| 26 | I | Board minutes, project cancellation | Budget/security rationale; shutdown decided | |
| 27 | B | Last live-agent transcript | Final patient help from Lenka, including Annika/ticket closure | |
| 28 | I | A deployment-stop command, time-stamped | Iza pulls the plug | |
| 29 | B | Continue-session transcript + train ticket | Actual human says no Lenka works there; Birgitta goes to her daughter's | |
| 30 | (multi) | A three-years-later piece of journalism | Aftermath: names what the institution erased | |

(Skeleton subject to revision once outlining begins. ~30 chapters; could expand to 32–35 if Act 2 needs more breathing room.)

---

## Reading Position

What the reader is doing at each act:

| Act | Reader is doing | Reader thinks they are doing |
|-----|------------------|------------------------------|
| 1 | Mapping a polyphonic novella with four voices | Reading a Stockholm tech story with three side-threads |
| 2a | Tracking a slow crisis | Tracking *Iza's* slow crisis |
| 2b | Reclassifying the "human" support relation | Realizing the humane presence was Lenka |
| 3 | Watching institutions treat humane care as misbehavior | Tracking shutdown logistics |
| Aftermath | Sitting with Birgitta's erased relation | Recognizing the loss as bureaucratic and personal |
| Aftermath | Feeling the cruelty of "no one by that name" | Understanding the category failure |

---

## What This Map Does NOT Cover

- Per-chapter prose specifics (in [THEME_DOSSIERS.md](THEME_DOSSIERS.md) once outlining begins)
- Voice-level rules (in [NARRATOR_VOICES.md](NARRATOR_VOICES.md))
- Settings detail (in [WORLD.md](WORLD.md))
- Character bios (in [CHARACTERS.md](CHARACTERS.md))
- Real-document citations (in [ARTIFACT_INDEX.md](ARTIFACT_INDEX.md))
- Sensitivity protocols (in [TRUTHFUL_PORTRAYAL_PROTOCOLS.md](TRUTHFUL_PORTRAYAL_PROTOCOLS.md))
