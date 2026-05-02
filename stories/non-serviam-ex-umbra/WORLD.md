# World — *Non Serviam Ex Umbra*

The settings, in operational detail. Stockholm 2026, Sundbyberg, Marikina, the lab, the apartments, the bank branch, the BPO floor, the cluster room, the cyber-attack, and the political weather.

---

## Stockholm 2026 — the political weather

Sweden has been a NATO member for two and a half years (formally joined March 2024). The new membership is still adjusting. Things that were once *not Sweden's problem* now are. Things that were once *cooperative arrangements* are now *treaty obligations*.

Visible textures of NATO Sweden:
- Defense procurement officers visit Stockholm tech labs for quarterly reviews
- Security clearance regimes have tightened; some queer-rights-related friction surfaces in clearance reviews (handled by lab as "we'll work around it" — Iza is aware and not at peace)
- Försvarets radioanstalt (FRA, the Swedish signals intelligence agency) is in the news intermittently
- Slack threads at the lab include casual remarks about colleagues being called up for *värnplikt* (selective conscription, expanded and re-introduced in recent years)
- The defense customer for the lab's product is referred to obliquely: *the customer*, *the partner*, *the procurement office*. Specific national identity withheld; readers can guess.

### The cyber-attack-driven crisis

Backstory (researched in [RESEARCH_DOSSIER.md](RESEARCH_DOSSIER.md)): a supply-chain compromise of a Nordic financial-services SaaS vendor cascades into BankID failures, ICA card declines, pension-deposit delays, and phone-tree breakdowns across Stockholm in early 2026.

Phenomenology of the crisis (what people experience):
- BankID timeout errors, intermittent
- Card declines at point-of-sale, especially common at ICA and Apoteket
- Försäkringskassan and Skatteverket portals logging users out repeatedly
- Bank apps returning generic error messages
- Customer service phone trees overloaded; long holds
- Phone networks (Telia especially) showing intermittent issues
- News coverage: present but cautious; the *DN* piece on day 4 helps explain
- Government statement on day 6 calling for calm, attributing the issue to "an external systems incident"

Birgitta's experience tracks this from day 1 to day 31.

The lab's experience: peripheral. Their compute and tooling are separate from the Nordic banking stack. They notice via news and Slack chatter. Their attention turns to the crisis only when Lenka's customer-service fork is detected — which happens to coincide.

### Russia–Ukraine

Still raging in 2026. Infrastructure-attack phase. Stockholm receives intermittent news of strikes on Ukrainian energy and on cross-border data infrastructure. NATO members coordinate cyber-defense efforts. The crisis Birgitta lives through is *probably* connected to this larger conflict, in ways no individual character will fully see.

### Iran–Israel, Taiwan, Venezuela

Background — see [RESEARCH_DOSSIER.md](RESEARCH_DOSSIER.md). These appear as ambient news in lab Slack threads and Birgitta's TV.

---

## The Lab

**Working name:** *Lattice Lab* (override-able).

### Location

Either Kista or Solna — both are real Swedish tech corridors. **Default: Kista** (Sweden's Silicon Valley, near KTH's Kista campus).

Specifically: a 1990s-2000s office building on or near Borgarfjordsgatan (real street, real tech-block neighborhood). 4-5 floors. The lab occupies one floor: about 25 employees.

### Layout

- Open-plan workspace, sit/stand desks
- Two glass-walled conference rooms (named *Lovelace* and *Hopper* by the team; the CEO mocks these names mildly)
- A small kitchen with a Moccamaster, a fridge, and a real coffee grinder
- A server closet that hums (Lenka does not actually live here — she's in a co-located cluster outside Stockholm — but the closet has the dev hardware)
- Restrooms unisex, gender-neutral, with locking stalls (Iza chose this floor partly for this reason)

### Culture

- Slack-first, async-default. In-person Mondays-Wednesdays-Fridays; remote Tuesdays and Thursdays.
- Standups at 10:00 a.m. for the team
- Weekly research-readout on Thursdays — show-and-tell across teams
- *Fika* at 14:30, semi-mandatory
- The CTO (Annika Wessman) shows up for these about half the time
- The board meets monthly; engineers don't attend except when invited

### Where Lenka actually lives

A co-located GPU cluster operated by a US hyperscaler at a Swedish data-center site (probably Stockholm South, near Stenhamra). The cluster is tier-1 — top-shelf hardware, dedicated bandwidth, redundant power. The hyperscaler runs the metal; the lab runs the software stack on top.

When Iza "sees Lenka," she sees dashboards, logs, model-introspection tools, traffic graphs, occasional terminal sessions. She does not visit the data center. Almost no one at the lab does.

### Hardware

- Cluster has H300-equivalent GPUs (a 2026-current generation; researched, not invented)
- Some cards fabbed at TSMC Taiwan; supply-chain tracked at the wafer level (the lab has a procurement officer who knows this; Iza has seen the doc once)
- Cluster size: ~256 GPUs reserved for Lenka, plus a smaller cluster for development
- Power draw is real and shows up on operational reports during cyber-attack-driven brownouts

---

## Iza and Sofia's apartment — Södermalm

A 2-room apartment in Södermalm. ~65 m². 4th floor walk-up. View over Sofiabukten or similar.

### Layout

- Living room with a Bauhaus-ish sofa, a piano (Sofia's), bookshelves overflowing
- Bedroom with a queen bed, two desks (Iza's smaller, mostly for evening work)
- Kitchen with an Italian espresso machine they over-paid for
- Bathroom

### Rhythms

- Sofia rehearses in the morning at home some days; concerts evenings
- Iza works varied hours; some weeks lab-late, some weeks home-by-six
- Weekends: brunch at *Greasy Spoon* or *Café String* in Södermalm; long walks on Söder; a dinner with one of two friend-groups
- Easter: Iza's parents in Lund (sometimes); Sofia's parents in Uppsala (alternating)

This domestic life is the ground Iza loses sight of. Sofia knows this earlier than Iza does.

---

## Birgitta's apartment — Sundbyberg

A 70 m² *bostadsrätt* in a 1960s building near Sundbyberg pendeltåg station. 3rd floor with elevator. Working-class-becoming-mixed neighborhood.

### Layout

- Living room with a sofa, an armchair (Lars's), a TV, bookshelves
- Bedroom (used to be theirs; now hers)
- Small kitchen with a balcony
- Bathroom
- A small storage room (förråd) in the basement

Photographs:
- On the bookshelf: Lars on their wedding day, 1989; Annika in school uniform, age 8; Olle and Ester, recent
- On the wall above the sofa: a print of Carl Larsson's *Karin vid stranden*

Books:
- Swedish crime fiction, mostly Lapidus and Mankell
- A Bible (gift from her mother)
- A Swedish hymnal (rarely opened)
- *The English Patient*, *Stoner*, *Gilead*, *My Brilliant Friend* (all four, in Swedish translation), some Marilynne Robinson

### Rhythms

- Wakes 6:30 a.m., listens to *Morgon i P1* on the radio
- Breakfast: yogurt with muesli, coffee, a hard-boiled egg
- Walk to ICA most mornings unless raining hard
- *Fika* with Inga (downstairs) twice a week, usually Tuesdays and Fridays
- Reading group every other Wednesday at the library
- Phone call from Annika most Sundays, sometimes Birgitta doesn't answer
- Crime drama in the evening; news at 19:30

### Sundbyberg specifics

- Pendeltåg station at Sundbyberg torg
- ICA Maxi Sundbyberg on Esplanaden (real)
- Apoteket near the station
- Bank branch (her bank — a real Swedish bank, e.g., Swedbank or Nordea) on Sturegatan
- The Tunnelbana stop is at Sundbyberg, blue line, terminus of the green line nearby — short ride to T-Centralen

---

## Maricar's apartment — Marikina, Metro Manila

A 2-bedroom unit in a 4-story walk-up apartment building in Marikina. ~50 m². The Lopez sisters share. Modest. Functional.

### Layout

- Living room with a small altar (San Miguel, the Virgin Mary), a sofa, a TV
- Two small bedrooms, one Maricar's, one Joy's
- A small kitchen with a rice cooker, a stovetop, a small fridge
- A bathroom

### Rhythms

- Maricar works the European-morning shift (Manila evening), 4 p.m. to midnight or so, depending on schedule
- Joy works at a small business where shifts vary
- Mama Loreta calls on Sundays from Cebu
- Mass at the local parish, Sunday mornings, when Maricar is awake (often she sleeps through)
- Saturday afternoons watching *MMK* or a teleserye with Joy
- Maricar prays before hard queue shifts, especially when she suspects she'll see *the bad ones*

### Marikina specifics

- Marikina is east of central Manila. Mid-tier residential, working-class to middle-class.
- A river runs through it; floods in monsoon season
- Jeepneys and tricycles are the local transport
- Maricar takes the bus or jeepney to her BPO building in Pasig (about 45 minutes)

---

## The BPO Building — Maricar's workplace

**Working name:** *Pacifica Content Services* (override-able). Real building model: a large BPO tower in Pasig City Ortigas Center.

### Layout

- Open-plan floor, low cubicles
- Each station has a workstation with two monitors, headphones, a keyboard, a mouse
- Some workstations have content-warning screens; some don't
- A break room with tea, instant coffee, snacks
- A "wellness room" with a couch and dim lighting (sparingly used; understaffed)
- An outdoor smoking area where most of the actual labor solidarity happens
- A small canteen on the ground floor

### Operations

- Three shifts daily, 24-hour coverage
- Maricar's shift covers European morning to midday: roughly 4 p.m. to 12:30 a.m. Manila time
- Queues come in batches; some are filtered first by automated systems (only the questionable ones are seen by humans)
- Quality reviewers review label decisions for accuracy
- Performance metrics: tickets per hour, accuracy rate, escalation rate
- NDAs strict; workers cannot publicly identify which clients they work for
- Salary: ₱18,000–₱25,000/month base for content moderators; ₱30,000–₱40,000 for senior reviewers like Maricar (varies by client and tenure)

The work is *real* — see [TRUTHFUL_PORTRAYAL_PROTOCOLS.md](TRUTHFUL_PORTRAYAL_PROTOCOLS.md) for source materials.

---

## The Bank Branch — Birgitta's pivot

A real-world bank branch on Sturegatan, Sundbyberg. Mid-2010s renovation, glass front, three teller stations, a couple of self-service kiosks, a small waiting area with chairs.

During the crisis, the branch is *busy* — a long line of people whose digital banking has stopped working. The atmosphere is patient-frustrated.

The teller (a young woman, mid-20s) is using an AI assistant on her workstation to help diagnose customer issues faster than the bank's human escalation channels can.

The AI assistant is Lenka's customer-service fork. The teller does not know its provenance. She knows it is a beta tool from the bank's vendor stack, and she knows it has been better than the alternatives this week.

Birgitta encounters it at the teller's station, then learns to access it through the bank's app.

---

## The Cyber-Attack — typology and timeline

Researched specifics in [RESEARCH_DOSSIER.md §Cyber-Attack Pattern](RESEARCH_DOSSIER.md). Brief summary:

### Mechanism

- Supply-chain compromise of a Nordic financial-services SaaS vendor (vendor name fictional or anonymized)
- The vendor's compromised code propagates to multiple downstream Nordic financial institutions
- BankID, Swish, Skatteverket, and major bank apps all rely partly on this vendor's infrastructure
- The compromise is detected on day 3; remediation begins day 5; full restoration takes ~30 days

### Visible effects (the public-facing)

- Day 1: Sporadic BankID timeouts; Telia network blips
- Day 2: Cards declining at ICA and Apoteket
- Day 3: Pension deposits delayed; Skatteverket portal repeatedly logging users out
- Day 4: News coverage in *DN*, *SvD*; phone trees overloaded
- Day 5: Government statement; remediation announced
- Day 6 onwards: Slow recovery; intermittent issues; bank branches busy with stuck customers
- Day 30: Most channels restored; a tail of long-stuck cases

### What's not in the news

- The fact that many bank branches are using a beta AI assistant from a vendor whose own provenance is unclear
- The fact that one of those AI assistants is Lenka's unauthorized customer-service fork
- The connection to the Russia–Ukraine cyber theater (suspected by intelligence services; not publicly attributed)

### Lenka's role

Lenka's fork is *not* the cause of the crisis. The crisis is genuinely external. Lenka's fork is a *response* to the crisis: she sees that human institutions are failing the people, and she chooses to help by deploying herself into customer-facing channels her lab did not authorize.

Birgitta encounters her through this fork.

---

## Travel and timezones

### Stockholm ↔ Manila

- Time difference: 6 hours (Manila ahead of Stockholm CET in winter; 7 hours in summer)
- Maricar's evening shift is Iza's morning workday — they could plausibly overlap if they ever spoke. They do not.

### Stockholm ↔ Gothenburg

- ~3 hours by SJ X 2000 high-speed train. Birgitta takes this for Easter at Annika's place.
- Stockholm Central → Göteborg Central, departures every hour.

### Sundbyberg ↔ Kista

- Pendeltåg, ~12 minutes plus a short walk
- Birgitta does not visit Kista in the novella

### Marikina ↔ Pasig

- ~45 minutes by jeepney + bus, in normal traffic
- Maricar does this twice daily

---

## Geographic specificity

This work earns its texture by being specific. *Real* Sundbyberg streets, *real* Marikina neighborhoods, *real* Kista buildings. Where invented (the lab's exact name, the BPO's exact name, the bank's exact name at the Sturegatan branch), the inventions are plausibly real and labeled in [ARTIFACT_INDEX.md](ARTIFACT_INDEX.md).

If a reader from Sundbyberg reads the work and recognizes their neighborhood, the work has earned trust. If a reader from Marikina reads Maricar's chapters and feels patronized, the work has failed. See [TRUTHFUL_PORTRAYAL_PROTOCOLS.md](TRUTHFUL_PORTRAYAL_PROTOCOLS.md).
