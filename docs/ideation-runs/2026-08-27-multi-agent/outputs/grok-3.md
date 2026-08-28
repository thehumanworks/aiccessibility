# WebMCP Challenge — Independent Product Ideation

Ten concepts. Ten different collaboration patterns. Each one assumes a human stays in a real visual product while an agent acts through that product’s own structured tools—not through a sidecar chat and not through DOM guesswork.

---

## 1. Showcaller

**User and problem.** Solo course teachers, community hosts, and indie livestreamers who have to present *and* run the show. They lose the room every time they hunt for the next slide, poll, or overlay.

**Human experience.** Talent mode: a confidence monitor, a glowing now/next rundown, a single hold button. The person talks to people, not to software.

**Agent role.** Stage manager. It keeps time, fires armed cues, inserts holds when the speaker overruns, and marks chapters without stepping on the performance.

**WebMCP tools.**
- `get_show_state` — clock, armed cue, audience mode, hold status
- `fire_cue` — execute a named, already-staged cue
- `insert_hold` — freeze the rundown for N seconds with a reason
- `launch_interactive` — poll, Q&A, or reaction prompt
- `mark_chapter` — drop a titled chapter marker on the recording
- `reroute_next` — skip, swap, or jump the upcoming cue

**Why WebMCP is essential.** A live show is a permissioned state machine (what is armed, what the audience can see, what is already spent). A chatbot cannot execute inside the same session viewers are watching. Generic browser automation will click the wrong control a second late. The tools *are* the show-control protocol.

**Demo moment.** The presenter pitches the product live. Their agent fires a title card, launches a one-question poll, inserts a 10-second hold when they overrun, and stamps a chapter—while the audience pane updates in real time.

**One-week POC.** One presenter view, one rundown editor, five cue types, a fake audience panel, and a visible tool-call log. No real streaming vendor required.

**Largest risk.** Without a WebMCP-capable client in the demo path, it can look like a slide deck with extra buttons.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 5 |
| Potential Impact | 4 |
| Creativity & Ambition | 4 |

---

## 2. Redline Room

**User and problem.** Freelancers and small-business owners trapped in MSA/SOW ping-pong. The painful part is not drafting prose—it is structured bargaining over a living document the other side can mutate.

**Human experience.** A clause-native contract: each section has status, lock, and a plain-language issue. The human accepts, rejects, or records intent. They never lose the plot in a 14-comment Google Doc.

**Agent role.** Counsel for one party. It proposes amendments from a playbook, detects clause-to-clause conflicts, and applies redlines as operations—not as a new pasted draft.

**WebMCP tools.**
- `list_clauses` — id, status, lock, open issues
- `propose_amendment` — clause id, replacement text, rationale
- `apply_playbook` — run a named bargaining package
- `flag_conflict` — mark two clauses as incompatible
- `lock_clause` — freeze a negotiated point
- `export_version` — snapshot the current signed-intent tree

**Why WebMCP is essential.** Negotiation is a sequence of typed speech acts on shared clause identity. A chatbot emits a new document and destroys that identity. Browser automation cannot see locks, playbook preconditions, or the audit trail the human is staring at.

**Demo moment.** The agent proposes an indemnity cap. The human rejects it in the UI. The agent offers a mutual-cap alternative, locks the payment schedule, and the version tree updates on one screen.

**One-week POC.** An 8-clause professional-services SOW, two opposing playbooks, live redlines, and an agent-vs-human session. No real e-sign.

**Largest risk.** Judges treat it as “AI legal advice” instead of a negotiation surface; trust and disclaimers have to be visually loud.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 5 |
| Creativity & Ambition | 4 |

---

## 3. Extra Chair

**User and problem.** Tabletop groups who are one player short, or a player who wants a teammate that will not cheat, stall, or invent rules.

**Human experience.** A handsome web board, table talk, and a seat labeled for their agent. The human plays for fun and strategy; they can see every legal move the agent is allowed to consider.

**Agent role.** A bound player. It may only act through legal-move tools. Hidden information stays hidden unless the rules grant it.

**WebMCP tools.**
- `get_public_state` — board, scores, whose turn, clocks
- `get_legal_moves` — only the calling seat’s legal actions
- `play_move` — submit one legal action
- `offer_trade` — structured offer, if the game allows
- `whisper` — private teammate message, if the game allows
- `end_turn` / `resign`

**Why WebMCP is essential.** The tool schema *is* the rules. A chatbot hallucinates illegal moves. DOM automation can click another player’s cards. WebMCP enforces fog-of-war, turnality, and trade grammar the pixels refuse to make explicit.

**Demo moment.** A 90-second cooperative heist. The human asks the agent to “just take the gem.” The agent’s `get_legal_moves` does not include that action; it takes a legal support move instead, and the illegal ask is visible as a rejected tool path.

**One-week POC.** One original, tiny, complete game (not a licensed clone), two seats, move animations, and a strict rules engine behind the tools.

**Largest risk.** It reads as “we shipped a game,” and impact scores suffer if the collaboration pattern is not narrated loudly.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 3 |
| Creativity & Ambition | 5 |

---

## 4. Setback

**User and problem.** Homeowners who want a backyard studio, ADU, or shop. They discover setbacks, lot coverage, and height limits only after paying for drawings that do not fit the lot.

**Human experience.** They paint a footprint on *their* parcel, drag doors and windows, and walk a simple 3D massing. The legal envelope is drawn as a ghost around their sketch.

**Agent role.** Code consultant that shares the same model. It measures, nudges, and packages a neighbor-notice—not a generic “check your local zoning” paragraph.

**WebMCP tools.**
- `load_parcel` — demo parcels or a simplified address load
- `check_constraints` — setbacks, coverage, height, parking flag
- `place_massing` — x, y, width, depth, height
- `set_opening` — wall, position, door/window
- `generate_neighbor_notice` — one-pager from the current massing
- `estimate_bom` — rough lumber/openings/foundation ballpark

**Why WebMCP is essential.** Pixels show a rectangle. They do not show FAR, side-yard law, or which wall is the street. A chatbot gives nationwide folklore. A browser agent cannot compute coverage from a canvas. The constraint tools and the drawing are one object.

**Demo moment.** The human drops an 800 ft² box that violates the side setback. The agent slides it, drops the plate height, and a neighbor-notice PDF appears beside the lot.

**One-week POC.** One simplified jurisdiction, three canned lots, 2D plan plus a cheap 3D preview, and PDF export. No real GIS stack.

**Largest risk.** Oversimplified zoning looks fake to anyone who has pulled a permit; the POC must say “encoded subset” without killing credibility.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 5 |
| Creativity & Ambition | 5 |

---

## 5. KinSplit

**User and problem.** Adult siblings dividing a parent’s house contents after a death or a downsizing. Spreadsheets start fights. The piano is not a line item.

**Human experience.** A table of photographed objects. People tag meaning, tell a one-line story, veto a sacred object, and see packages—not a raw dollar race.

**Agent role.** Fair-division clerk. It equalizes appraised value *subject to* sentiment and vetoes, then proposes swaps the family can see land on the table.

**WebMCP tools.**
- `tag_item` — value, sentiment, heirloom flag
- `claim` — person, item, strength
- `record_veto` — remove an item from the tradable pool
- `compute_allocation` — named algorithm on current claims
- `propose_swap` — two-item or package rebalance
- `lock_package` — freeze one person’s accepted set

**Why WebMCP is essential.** The inventory is a contended object with claims, vetoes, and locks. A chatbot writes a shopping list in a thread nobody shares. Automation cannot run an allocation against live family state the humans are looking at together.

**Demo moment.** Twelve items, three siblings. The agent proposes packages. A human vetoes a wedding ring out of the pool. The agent rebalances in place; the ring stays visually out of trade.

**One-week POC.** Photo grid, three personas, two algorithms (picking sequence + value-equal packages), no court filing.

**Largest risk.** Emotional subject matter plus “algorithmic fairness” can feel cold or toy-like if the stories on items are thin.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 5 |

---

## 6. BenefitBench

**User and problem.** People applying for food, health, or utility help—and the volunteer navigators beside them—lose weeks to fragmented forms that reject silent inconsistencies.

**Human experience.** A calm case file: household story, evidence checklist, plain-language gaps. A navigator can sit with the applicant and *see* every fact the agent writes.

**Agent role.** Advocate that may only mutate the official case through the site’s tools. It maps a story into fields, attaches proof types, and submits only when the case is complete.

**WebMCP tools.**
- `get_case_gaps` — missing facts and proof types
- `set_household_fact` — key, value, evidence handle
- `attach_evidence` — document type + file reference
- `run_eligibility` — deterministic rules for listed programs
- `submit_program` — file a complete packet
- `schedule_followup` — next human review window

**Why WebMCP is essential.** This is the anti-scraping argument in product form. Benefits sites should not be driven by pixel agents inventing fields. Official tools are the lawful surface; the human watches every write; the schema is the program’s ontology.

**Demo moment.** A four-beat life story. The agent fills the case, stops on a missing paystub, the human uploads it, `run_eligibility` goes green, submit unlocks.

**One-week POC.** A fictional “City of Harbor” benefits desk, two programs, a small rules engine, and canned evidence. No real government APIs.

**Largest risk.** Judges discount a simulated agency as a mock, or the topic feels too heavy for a hackathon toy if the copy is careless.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 5 |
| Creativity & Ambition | 4 |

---

## 7. OnLoan

**User and problem.** Small-museum and pop-up curators who can hang a beautiful show and still blow a loan agreement: lux limits, dates, wall loads, missing wall text, unpacked crates.

**Human experience.** A floor plan they walk like a gallery. Works snap to walls. Labels and light are visible. Unsafe hangs glow before opening night.

**Agent role.** Registrar. It shares the hang, refuses unsafe placements, writes labels from object records, and builds a crate list from what is actually on the wall.

**WebMCP tools.**
- `hang_work` — work id, wall, position, height
- `check_loan_window` — dates, insurance, courier flags
- `set_lux_budget` — per-work light cap vs room plot
- `generate_wall_label` — object record → label copy
- `flag_condition` — noted damage or install constraint
- `build_crate_list` — incoming/outgoing from current hang

**Why WebMCP is essential.** A floor-plan PNG does not contain lux law, loan windows, or crate identity. A chatbot writes wall text in a vacuum. The registrar tools and the curator’s eye have to mutate one exhibition model.

**Demo moment.** The curator hangs a loaned work in a sun stripe. The agent refuses, rehangs it on a safe wall, and a label plus crate line appear together.

**One-week POC.** One room, twelve works (half loans), a light plot, labels, and a crate export. No real collection-management vendor.

**Largest risk.** Niche audience; if the gallery isn’t gorgeous, it reads as a logistics spreadsheet.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 3 |
| Creativity & Ambition | 5 |

---

## 8. StemSide

**User and problem.** Bedroom producers and podcast pairs who can hear what they want and still cannot operate the session: takes, mutes, arrangement, and a cue sheet that matches what actually played.

**Human experience.** A timeline they listen to. They tap a region and say what they mean. Faders and takes stay visual and physical.

**Agent role.** Session op. It never “mixes in chat.” It mutes, swaps takes, duplicates a chorus, and exports a cue sheet from the same engine the human is hearing.

**WebMCP tools.**
- `get_arrangement` — sections, stems, selected region
- `set_take` — stem, take index
- `mute_stem` / `set_gain`
- `duplicate_section` — map a chorus/break by bar range
- `quantize_region` — grid and strength
- `export_cue_sheet` — chapters/markers from the arrangement

**Why WebMCP is essential.** Audio engine state is not in the DOM. A chatbot produces timestamps that do not match the playhead. Browser automation cannot grab a Web Audio graph. The tools are the only honest remote hands on the session.

**Demo moment.** The human plays a verse. The agent swaps in take 3, duplicates the chorus, drops a midroll marker, and the cue sheet matches the playhead.

**One-week POC.** Four stems, canned takes, a bar-based arranger, Web Audio playback, and cue-sheet export. No full DAW.

**Largest risk.** Audio products feel unfinished unless playback is tight; a janky playhead kills the “this is real” test.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 3 |
| Potential Impact | 3 |
| Creativity & Ambition | 4 |

---

## 9. Float Week

**User and problem.** Freelancers who have rent or a contractor on Friday and a pile of unpaid invoices, zombie subscriptions, and unmade tax set-asides. The books and the courage live in different apps.

**Human experience.** A seven-day runway board: what lands, what leaves, what they are willing to cut or chase. Every agent action shows up as a reversible chip on that week.

**Agent role.** Controller with a leash. It sends dunning, pauses tools, proposes payment plans, and parks tax money inside this ledger—only within limits the human set.

**WebMCP tools.**
- `get_runway` — daily cash, incoming, committed outflows
- `send_dunning` — invoice id, tone, due ask
- `pause_subscription` — named recurring spend
- `propose_plan` — split a payable across dates
- `set_tax_aside` — amount, lock until a date
- `mark_priority` — human override the agent must honor

**Why WebMCP is essential.** Cash actions are permissioned mutations of a ledger the human must witness. A chatbot drafting emails does not pause the subscription in the same system. A generic agent with bank access is a horror movie; this is a cockpit with a visible leash.

**Demo moment.** Runway is three days short. The agent pauses two SaaS tools, sends one firm invoice, and the Friday column turns solvent—then the human unpauses one tool and the board re-solves.

**One-week POC.** Simulated bank and invoice book, eight vendors, a week grid, and an undo log. No real money movement.

**Largest risk.** Simulated money feels like a spreadsheet; without the leash/undo theater it looks like every fintech chatbot.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 3 |

---

## 10. SwapBlock

**User and problem.** Neighborhood tool libraries and Buy Nothing hosts drown in chat threads. Holds collide, returns slip, and “you can have the saw, but not Sunday” never becomes state.

**Human experience.** A block map and a shed. The host sees who holds what, trust notes, and local exceptions. Lending stays social and in person; the software keeps the queue honest.

**Agent role.** A household’s borrower. It searches, holds, proposes a swap, and reports condition—against the library’s rules, not against a generic shopping API.

**WebMCP tools.**
- `search_inventory` — tool, dates, skill/deposit flags
- `hold_item` — item, window, household
- `propose_swap` — item A vs item B plus time
- `extend_loan` — request more days
- `report_condition` — return state
- `release_hold` — drop or transfer a reservation

**Why WebMCP is essential.** Inventory, trust, and time windows are the product. A WhatsApp bot loses the hold. A shopping agent does not know Sunday-is-sacred. The borrower’s agent should speak the library’s language on the library’s site while the host watches the shed update.

**Demo moment.** Two household agents request the same ladder. The host’s exception (“members over 3 loans wait”) fires. One hold lands, the other gets a Saturday swap offer, and the map updates.

**One-week POC.** One block, twenty items, three households, hold/swap rules, and a host console. No real payments.

**Largest risk.** Looks like “Airbnb for drills” unless the host-exception and dual-agent collision are the hero of the demo.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 4 |

---

## Strongest three

### 1. Setback
**Non-obvious insight.** The valuable split is not “AI that knows zoning.” It is that the human and the agent need different vocabularies on one massing: the human speaks in rooms and desire; the agent speaks in envelopes and notices. WebMCP is how those vocabularies share a model instead of the agent narrating a drawing it cannot touch.

### 2. Showcaller
**Non-obvious insight.** Most “human + agent” products take turns. A live show cannot. The rare pattern WebMCP unlocks is *simultaneous* roles on one clock: one body stays in performance, the other operates a first-class control protocol. That is hard to fake with a chatbot, and it is instantly legible on video.

### 3. Redline Room
**Non-obvious insight.** Contract pain is not writing. It is speech acts—propose, waive, lock, conflict-flag—over stable clause identity. If those acts are tools, a counterparty’s agent can sit at the same table without emailing a new PDF that resets the negotiation. The site becomes a chamber, not a text area.

---

## The one to build to win

**Setback.**

It maxes the tie-break (WebMCP Leverage) with tools that encode facts pixels will never show. It is a complete, visual product a judge can understand in ten seconds: a lot, a box, a ghost envelope, a notice. The audience is real and specific—homeowners about to waste money on an illegal footprint. The collaboration is not “agent fills a form”; the human is still the designer. One week is credible if you freeze a single simplified code and three parcels. The video writes itself: violation, nudge, notice. A chatbot cannot do that. A DOM agent cannot do that. A WebMCP site can.

---

## Wildcard

**Assembly (The People’s Docket).**

A public hearing chamber for the open web. Humans take the floor with a gavel, a timer, and a live bill. Anyone’s agent may `file_motion`, `amend_clause`, `ask_the_chair`, `yield_time`, or `record_vote` through the chamber’s tools. Testimony stays human. Procedure becomes a protocol.

This is hard: identity, moderation, scale, and the politics of letting agents speak at all. It is also the idea that stops treating WebMCP as a feature you add to an app and starts treating it as how civic software admits non-human participants without throwing away the room. If it works even for one bill and one hearing, it redefines the brief.
