# WebMCP Challenge — Independent Product Ideation

Assumptions: a small team, one week, a live URL that works in ChatGPT’s in-app browser or WebMCP Chrome, a visible open-source WebMCP implementation, and a sub-three-minute demo that must land even if a judge never clicks the product. WebMCP’s distinctive property is a **shared application surface**: the human stays in a visual product; the agent gets first-class, schema-checked tools that mutate the same state. Ideas below are built around that loop, not around a chatbot with a website nearby.

---

## 1. Opposite Counsel

**User / problem.** Founders, freelancers, and job-switchers lose money and power in offers, SOWs, and vendor contracts because they negotiate from a blank page against a more practiced counterparty.

**Human experience.** A live term sheet on a single table: money, dates, IP, exclusivity, termination, liability. The human plays themselves. Every change is visible, reversible, and stamped with who did it.

**Agent’s role.** The site’s agent *is* the other side — or the user’s second chair — and can only move the deal through tools. It cannot “just chat a better clause.” It must bid, concede, or annotate a real term.

**WebMCP tools.**
- `propose_term_change` (clause id, new value, rationale, concession asked)
- `accept_term` / `reject_term` (with a required human-visible reason)
- `package_trade` (bundle 2–4 terms as one offer)
- `run_walkaway_check` (score vs. the human’s pre-set floors)
- `pin_scenario` (snapshot the sheet as “if we take this tonight”)

**Why WebMCP is essential.** A chatbot invents clauses in prose. Browser automation clicks the wrong cell. Here the term sheet *is* the product: typed tools, validation, and a visual audit trail. The human’s job is judgment under pressure, not typing.

**Demo moment.** A $140k offer appears. The agent, as company counsel, tightens IP and a non-compete. The human’s agent packages a trade (give IP, kill the non-compete, add a 90-day exit). The sheet animates. Walkaway check goes red on the non-compete. Human slams reject. Two seconds of silence, then a cleaner counter.

**One-week POC.** One vertical (job offer *or* freelance SOW), ~12 clauses, two agent personas, floors, history. No real e-sign.

**Largest risk.** Feels like a game unless the clauses and tactics are sharp enough to be recognizable.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 5 |
| Potential Impact | 3 |
| Creativity & Ambition | 5 |

---

## 2. Setback Studio

**User / problem.** Homeowners who want a shed, fence, ADU, or deck get destroyed by permit packets: setbacks, coverage, height, neighbor notice, which drawing goes in which box.

**Human experience.** A backyard site plan they can walk in their head — tree, AC, gate, slope. They drag the structure, then watch a permit packet assemble beside it.

**Agent’s role.** Reads a one-city, one-permit rule table and does the bureaucratic spatial work: place, check, label, fill, flag what only the human knows (the oak they will not cut).

**WebMCP tools.**
- `place_structure` (type, footprint, origin)
- `check_setbacks` (returns violations as map overlays)
- `set_property_fact` (tree, easement, occupancy — human-attested)
- `generate_packet_page` (site plan / notice / checklist)
- `ask_human_to_attest` (blocks submit until the human confirms a fact)
- `export_filing_bundle` (PDF + structured checklist)

**Why WebMCP is essential.** Chat cannot move a rectangle on a survey. Generic automation cannot encode “this tool is illegal unless setbacks pass and the human attested the tree.” The map and the packet are one object.

**Demo moment.** “10×12 studio, three feet off the north fence.” The shed drops, a setback goes red, the agent slides it, asks about the oak, the human attests, the neighbor-notice page fills, the submit button unlocks.

**One-week POC.** One fictional (or one real) zoning profile, one permit type, a stylized lot, three violation types, a generated 4-page packet.

**Largest risk.** Zoning is a swamp; over-scoping to “real city hall” kills the week.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 5 |
| Creativity & Ambition | 4 |

---

## 3. Places, Please

**User / problem.** Stage managers and small-theater directors call shows from a paper rundown and a group chat. One late cue, and lights, sound, and actors diverge.

**Human experience.** A linear cue stack with a “now” line: lights, sound, deck, actor entrance. The human *calls* the show. The board is the truth.

**Agent’s role.** Assistant stage manager: retimes, holds, jumps, and announces consequences without grabbing the call.

**WebMCP tools.**
- `standby_cue` / `go_cue`
- `hold` (and who is waiting)
- `retime_cue` (delta seconds, ripple or not)
- `jump_to_cue` (requires human confirm)
- `reassign_operator` (light / sound / deck)
- `post_show_report` (missed cues, holds, notes)

**Why WebMCP is essential.** Timing is shared mutable state with authority. A chatbot in another tab cannot be the book. DOM scraping a running clock is how you ruin opening night.

**Demo moment.** Cue 28 GO. An actor is late. Agent HOLDs, ripples 12 seconds, standbys the next light cue, asks the human before jumping the scene change. The now-line breathes. The human says GO.

**One-week POC.** One 8-minute one-act, ~25 cues, a clock, hold/ripple, a show report. Recorded “cast” as audio stems or simple animations.

**Largest risk.** Without a feel of liveness, it is a todo list with a timer.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 3 |
| Potential Impact | 3 |
| Creativity & Ambition | 5 |

---

## 4. The Proof Wall

**User / problem.** Renters and small-claims filers lose deposits and insurance arguments because evidence is 80 camera-roll photos and a polite email.

**Human experience.** A wall: timeline, rooms, claims (“mold in bath,” “withheld $1,400”). Photos snap to pins. A demand letter grows from the wall, not from a prompt.

**Agent’s role.** Intake paralegal that may only file, tag, redact, and draft through the wall.

**WebMCP tools.**
- `pin_evidence` (photo/url, date, room, claim id)
- `link_to_lease_clause`
- `mark_gap` (missing date, missing witness)
- `draft_demand` (tone, ask, deadline)
- `redact_region` (faces, unit numbers — human-approved)
- `export_packet`

**Why WebMCP is essential.** The product *is* the evidentiary graph. Chat produces a confident letter with no pins. Automation cannot legally or reliably decide what is a claim versus a selfie.

**Demo moment.** Eight messy photos drop. The agent pins five, marks two date gaps, links “ordinary wear” vs. “damage,” drafts a $1,400 demand. The human rejects a harsh sentence and redacts a child’s face. Export.

**One-week POC.** Deposit dispute only; upload; three claim types; clause library; letter + PDF packet.

**Largest risk.** Looks like “AI legal help,” which judges may distrust unless the wall stays the hero.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 5 |
| Potential Impact | 5 |
| Creativity & Ambition | 4 |

---

## 5. The Bid Room

**User / problem.** Independent painters, tilers, and handypeople underbid from hallway photos or bleed a weekend writing estimates.

**Human experience.** A room strip: photos, surfaces, a live bid. The human — who has been in the house — marks “popcorn ceiling,” “don’t touch the fireplace,” “owner supplies paint.”

**Agent’s role.** Estimator: takeoff, waste, labor hours, exclusions. It cannot invent a wall the human did not confirm.

**WebMCP tools.**
- `measure_surface` (room, kind, approx area, confidence)
- `apply_assembly` (e.g. “two coats + prime on drywall”)
- `set_exclusion` / `set_owner_supply`
- `price_bid` (rates, waste, rush)
- `ask_site_question` (blocks a line item)
- `issue_bid_version`

**Why WebMCP is essential.** The bid is a constrained object: no price without a takeoff, no takeoff without a human-confirmed surface. Chat quotes fiction. Click-automation does not understand assemblies.

**Demo moment.** Three kitchen photos. Agent proposes 420 sq ft of wall. Human says “not the brick.” Price drops. Agent adds a site question about lead paint. Human answers. Version B issues with exclusions in plain language.

**One-week POC.** One trade (interior paint), three rooms, a rate card, two assemblies, versioned PDF.

**Largest risk.** Bad measurements destroy trust; the UI must show confidence and demand human confirmation.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 5 |
| Creativity & Ambition | 3 |

---

## 6. Continuity Bible

**User / problem.** Micro-budget filmmakers break continuity: a glass refills, a jacket moves, an eyeline flips. There is no script supervisor.

**Human experience.** A scene bible: shots on a timeline, props, wardrobe, hands, eyelines. The human watches. The bible is the argument later in the edit.

**Agent’s role.** Script supervisor. It may only log and flag through tools — it does not “remember the movie” in chat.

**WebMCP tools.**
- `log_shot` (setup, take, lens, action)
- `bind_prop_state` (object, in/out, who holds it)
- `flag_continuity` (shot A vs B, severity)
- `set_eyeline` (character, screen direction)
- `pin_still` (frame to a bible entry)
- `build_reset_list` (what must be reset for a pickup)

**Why WebMCP is essential.** Continuity is a graph of states over time. A chatbot’s memory is not a production document. The set needs a structured, shared book.

**Demo moment.** Two takes of a dinner scene. Agent binds the wine level, flags a refill, flips an eyeline, and prints a reset list: “glass to 1/3, napkin left of plate, jacket on chair.” The human, who “was there,” confirms the napkin was always right.

**One-week POC.** One scene, six shots, a handful of props, stills as uploads, a continuity report.

**Largest risk.** Without real video scrubbing, it can feel like a spreadsheet. Stills plus a simple playhead have to be enough.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 3 |
| Potential Impact | 3 |
| Creativity & Ambition | 5 |

---

## 7. Night Book

**User / problem.** Family caregivers for an aging parent juggle meds, rides, meals, and night coverage across siblings who do not share a brain.

**Human experience.** A 7-day care book: who is on, what was actually given, what the parent will refuse. The human is the person who knows “she will not take the pink pill if it’s after 9.”

**Agent’s role.** Relief coordinator. It schedules and detects coverage holes, but cannot mark a med as given and cannot invent preferences.

**WebMCP tools.**
- `assign_shift` (person, window, task)
- `record_administered` (human-only or human-confirmed)
- `set_preference` (hard/soft constraint from the family)
- `find_coverage_gap`
- `propose_swap`
- `escalate` (missed med, no night coverage — notify, don’t treat)

**Why WebMCP is essential.** Care is dual-control: the agent has scale, the human has the relationship and legal/ethical authority. A chatbot in iMessage cannot be the book. Browser bots should not “mark meds given.”

**Demo moment.** Thursday night is empty. Agent proposes two swaps, respects “no pink pill after 9,” and refuses to mark a dose given. A sibling (the human) accepts a swap. The gap closes in the book.

**One-week POC.** One patient profile, three caregivers, med + ride + meal, gaps, swaps, a daily sheet. No real PHI backend; local demo data.

**Largest risk.** Medical/safety gravity — must stay a coordinator, never a clinician, or the product is irresponsible.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 5 |
| Creativity & Ambition | 3 |

---

## 8. Scope & Sequence

**User / problem.** K–12 teachers burn weekends aligning a unit to standards, differentiation, and the actual minutes they have.

**Human experience.** A week-on-a-page: days, minutes, activities, standards chips, a “this will not fit” warning. The teacher owns the room.

**Agent’s role.** Instructional coach that can only mutate the unit through the planner — not dump a lesson-plan essay.

**WebMCP tools.**
- `place_activity` (day, minutes, grouping)
- `align_standard` (activity ↔ standard)
- `differentiate` (supports for a named student profile)
- `fit_to_clock` (trim or split to the period length)
- `move_assessment` (formative/summative)
- `export_plans` (Monday packet + slides outline)

**Why WebMCP is essential.** The constraint is the clock and the kids in *this* room. Chat writes beautiful lessons that do not fit 48 minutes. The planner is the product.

**Demo moment.** “Industrial Revolution, five days, 48-minute periods, two English learners, no homework Wednesday (concert).” The agent places, overfills Wednesday, splits a lecture, attaches a speaking scaffold, and parks the quiz on Friday. The teacher rips a activity they hate. The week still balances.

**One-week POC.** One subject, one unit, one period length, a small standards slice, two learner profiles.

**Largest risk.** Teachers have seen a thousand AI lesson generators; the clock-and-room loop has to be obviously different.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 3 |

---

## 9. Door Swing

**User / problem.** Couples and roommates fight moves and furniture plans because a sofa “fits” until a door cannot open.

**Human experience.** A floor plan they argue about in person: doors, radiators, the one window they will not block. The plan is the shared object.

**Agent’s role.** Spatial clerk. It places catalog furniture, checks clearances, and writes a move sequence. It cannot override a human veto (“that wall is for art”).

**WebMCP tools.**
- `place_item` (SKU or custom box, rotation)
- `check_clearance` (door swing, egress, drawer pull)
- `set_human_constraint` (no-block zone)
- `swap_item`
- `sequence_move` (what enters first)
- `export_cut_list` (IKEA-style steps + tape-measure notes)

**Why WebMCP is essential.** Collision and swing are application physics. Chat says “it should fit.” A generic agent clicking a canvas will miss constraints the site already knows.

**Demo moment.** A 2-bed plan. Agent places a 90" sofa. Door swing goes red. It rotates, still red. Human paints a “gallery wall” constraint. Agent sequences the sofa before the bookcases. A move list appears.

**One-week POC.** One apartment, a 20-item catalog, door swings, two clearance types, a move sequence.

**Largest risk.** If the plan feels like a toy, impact collapses; dimensions must look adult.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 4 |

---

## 10. The Rundown

**User / problem.** Two-to-eight-person local newsrooms build a daily show or newsletter from Slack chaos: who has the fire story, who has a conflict, what still has no art.

**Human experience.** An assignment board and a timed rundown. The editor’s job is judgment: what is a story, what is cruel, what is late.

**Agent’s role.** Assignment desk. It files, flags conflicts, slots, and nags for assets. It does not publish.

**WebMCP tools.**
- `file_story` (slug, beat, status)
- `assign_reporter` (checks beat + off-day)
- `flag_conflict` (subject vs. staff connection)
- `slot_in_rundown` (position, seconds)
- `request_asset` (photo, quote, document)
- `lock_rundown` (human-only)

**Why WebMCP is essential.** News is a constrained rundown with ethics gates. Chat cannot be the desk. Scraping a kanban will assign the reporter who is off, or who dated the subject.

**Demo moment.** A warehouse fire, a school-board leak, a fluffy zoo story. Agent slots fire at the top, flags that the education reporter’s spouse is on the board, asks for a still, and tries to lock. The editor refuses lock until the conflict is reassigned. The rundown stays honest.

**One-week POC.** One daily, six stories, three staff, conflict table, a 12-item rundown, lock.

**Largest risk.** Looks like Jira with an LLM unless conflicts and lock authority are the point of the demo.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 4 |

---

# Selection

## Strongest three

**Opposite Counsel, Setback Studio, The Proof Wall.**

### Opposite Counsel — non-obvious insight
WebMCP’s unused pattern is **adversarial shared state**. Most “human + agent” products assume a helper. The more interesting product is a site whose tools *are the legal moves of the other player*. The human stays because taste, risk, and walkaway are not computable from the schema. Judges feel the standard in their hands: if the agent could not call `package_trade`, there would be no product.

### Setback Studio — non-obvious insight
The open web’s boring superpower is **encoding local rules as tools**. Setbacks are a spatial API the city already wishes it had. The human is not “in the loop” as a reviewer of chatbot text; they are the surveyor of facts the ordinance cannot see (the tree, the slope, the neighbor they already asked). WebMCP is the joint between embodied knowledge and bureaucratic procedure.

### The Proof Wall — non-obvious insight
Impact here is not “AI writes a stern letter.” It is **forcing generation to be a projection of a graph**. Every sentence in the demand must be able to point at a pin. That is a product rule you can only enforce if the site, not the model, owns the tools. People with a $1,400 problem will understand the demo without a lecture on MCP.

## The idea I would build to win

**Setback Studio.**

It is the only concept that is simultaneously (1) visually obvious in ten seconds, (2) impossible to fake with a sidebar chatbot, (3) attached to a huge, ordinary audience, and (4) naturally rich in WebMCP leverage — place, check, attest, generate, export — without needing live theater, medical caution, or a fake newsroom. Scope the week ruthlessly: one lot, one structure type, one ordinance table, one packet. The video is a shed that turns red, then legal, then printable. Tie-break on WebMCP Leverage is a gift: every tool mutates a shared plan the human is still steering.

## Wildcard (deliberately hard)

**The Hearing Gallery.**

A live public-comment chamber for a real-looking city agenda. Humans sit as chair, clerk, and a few residents. Each resident may bring an agent. Agents do not “speak in chat”; they file through tools: `submit_comment` (time-boxed), `pin_exhibit`, `yield_time`, `raise_point_of_order`, `withdraw`. The chair’s tools are `recognize`, `extend_time`, `rule_out_of_order`, `close_item`. The docket, the clock, and the speaker list are the product.

This is difficult: concurrency, permissions, abuse, and a parliamentary state machine in a week. If it works even as a 12-minute fake hearing with three agents and one human chair, it redefines WebMCP from “my copilot on my SaaS” into **the civic protocol of the open web** — many agents, one room, humans still holding the gavel.
