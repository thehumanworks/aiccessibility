# WebMCP Challenge — Independent Ideation

Ten product concepts. Each assumes a human stays on the visual site while an agent acts through first-class, schema-checked tools the site itself exposes. The point is not “chat beside a webpage.” The point is a shared application state that two different kinds of intelligence can both operate—safely, reversibly, and in public view of each other.

---

## 1. Seatpeace

**User and problem.** Hosts, wedding couples, conference organizers, and classroom teachers who must seat or group people under a tangle of alliances, access needs, hierarchy, and “please do not put them at the same table.” Spreadsheets cannot hold the social knowledge. Generic chat invents illegal seating. The host burns evenings on a problem that is half etiquette, half combinatorics.

**Human experience.** A visual room: tables, badges, access icons, locked seats. The host drops people, pins VIPs, and writes messy human rules (“keep the two aunts in eye-line but not elbow-to-elbow”). They *see* the room change and they *own* the final map.

**Agent role.** Ingest soft and hard constraints, search legal layouts, explain every conflict in host language, and apply only the swaps the host has not locked.

**WebMCP tools.**
- `add_constraint` (who, strength, reason, expires)
- `propose_layout` (objective: minimize violations / maximize mixing)
- `swap_or_move` (guest, destination, respect locks)
- `lock_seat` / `unlock_seat`
- `explain_conflict` (guest or table → human-readable violation tree)
- `commit_floorplan` (snapshot + shareable link)

**Why WebMCP is essential.** A chatbot has no live floorplan, no lock semantics, and no right to mutate seating. DOM automation will drag the wrong avatar and violate “wheelchair + interpreter + do-not-seat.” The site is the constraint kernel; the tools are the only legal hands.

**Demo moment.** A hostile 48-person rehearsal dinner: two divorced parents, a guest in a wheelchair, a donor who must be visible from the toast, three people who cannot share a table. The host speaks three ugly constraints. Tables recolor. The agent proposes a layout, the host locks the parents, the agent repairs the cascade, and `explain_conflict` narrates the one remaining compromise.

**One-week POC.** One room shape, drag-and-drop guests, constraint chips, lock pins, a greedy/local search solver, conflict toasts. Seed 40 guests. No accounts beyond a share link.

**Largest risk.** Reads as a wedding toy unless the demo leads with *irreconcilable social physics*, not décor.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 5 |
| Potential Impact | 3 |
| Creativity & Ambition | 4 |

---

## 2. The Redline Room

**User and problem.** Founders, ops leads, and vendors who must close an MSA/SOW under time pressure. Lawyers are scarce. DocuSign is a tomb. Google Docs comments plus a chatbot produce unenforceable mush because nobody shares one clause graph with rights, locks, and risk.

**Human experience.** A split contract: clause cards, yours / theirs / contested, a visible lock ledger. Each human reads and decides. Nothing silent happens.

**Agent role.** Each party’s agent proposes language, scores risk against that party’s playbook, and generates counters—*only* on unlocked clauses, in that party’s voice.

**WebMCP tools.**
- `propose_clause` (clause_id, text, rationale, party)
- `redline` (span, replacement, severity)
- `lock_term` (clause_id, party confirmation)
- `score_risk` (playbook tags → traffic-light + why)
- `compare_positions` (divergence map)
- `issue_counter` (bundle of unlocked clauses)

**Why WebMCP is essential.** Bilateral, authenticated, append-only mutation is the product. A single chatbot is a ghostwriter, not a counterparty. Browser automation cannot enforce “you may not silently edit a locked indemnity.” WebMCP is the treaty protocol.

**Demo moment.** A two-minute vendor fight over indemnity and payment. The founder’s agent weakens unlimited indemnity; the vendor agent (site-scripted or second session) rejects it; humans lock payment terms; agents isolate the one remaining fight; the room shows a clean “unsigned delta.”

**One-week POC.** One MSA template, eight clauses, two roles, a built-in counterpart agent, lock + audit log, no real e-sign.

**Largest risk.** Looks like a thin contract toy, or cannot be demoed credibly by one person. Mitigate with a visible counterpart agent and a ruthless eight-clause template.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 4 |

---

## 3. Sourced

**User and problem.** Independent reporters, newsletter writers, and local-news desks who must ship reported pieces. AI drafts are fast and untrustworthy. The painful object is not “words.” It is *claims without owners*.

**Human experience.** A story desk: draft on the left, claim cards on the right (assertion, speaker, evidence, status: unsupported / attributed / contradicted). The writer highlights, rejects, and publishes. Voice stays human.

**Agent role.** Extract checkable claims from the live draft, bind sources, rewrite only the spans the writer marks, and refuse to “smooth over” a red claim.

**WebMCP tools.**
- `extract_claims` (selection or whole draft)
- `attach_source` (claim_id, url/quote, retrieved_at)
- `set_claim_status` (supported / attributed / disputed / killed)
- `rewrite_span` (claim_id, instruction, must not orphan evidence)
- `flag_contradiction` (claim_a, claim_b)
- `freeze_for_copyedit` (no new claims without a card)

**Why WebMCP is essential.** The claim graph *is* the article’s spine. A chatbot will invent citations off-page. Generic automation cannot keep claim IDs, statuses, and draft offsets coherent as the writer edits. The site is the epistemology.

**Demo moment.** Paste a messy 400-word local-budget draft. Eight claim cards appear; two are naked. The agent attaches a city PDF to one. The writer kills a sensational sentence. The agent rewrites the span; the killed claim stays dead. The desk goes from red to publishable.

**One-week POC.** One editor, claim sidebar, URL/quote attach (fetch title + quote, not a full research crawler), status workflow, contradiction on explicit numbers/dates. Two seed stories.

**Largest risk.** Collapses into “yet another AI editor” if claims are not first-class, clickable, and stubborn.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 5 |
| Potential Impact | 4 |
| Creativity & Ambition | 4 |

---

## 4. Ticket Ballet

**User and problem.** Expo chefs and shift leads in small restaurants. Tickets pile, a steak and a soufflé share a fire window, an item 86s, and a VIP walk-in lands. The board is visual; the sequencing math is not. A chatbot in the office does not fire the salmon.

**Human experience.** A live expo rail: tickets, courses, station colors, 86 banners. The chef touches, holds, and re-prioritizes with a finger. The room still feels like a kitchen, not a dashboard.

**Agent role.** Watch ticket age, station load, and 86s; propose fire order; bump or hold only through legal ticket tools; narrate the next ninety seconds of the pass.

**WebMCP tools.**
- `fire_course` / `hold_course`
- `resequence_ticket` (constraints: allergy, VIP, well-done time)
- `eighty_six` (item → cascade onto open tickets)
- `mark_allergic` (ticket, allergen, station note)
- `expo_plan` (next N minutes, spoken + visual)
- `bump_ticket`

**Why WebMCP is essential.** Timing invariants live in the POS/expo object model. Chat cannot bump a ticket. A pixel agent will hit the wrong chit at 8:12 p.m. Tools are how an agent is allowed on the line at all.

**Demo moment.** A six-ticket rush, mid-service 86 on the garnish that three plates need, plus a nut-allergy walk-in. The rail ripples; the agent proposes a new fire order; the chef rejects one bump; the pass recovers on screen in twenty seconds.

**One-week POC.** Simulated ticket feed (not a real POS), stations, timers, 86 cascade, allergy flags, one “chef vs agent” override log. Seed a dinner rush script the presenter can trigger.

**Largest risk.** Feels like a game unless the 86/allergy cascade is obviously operationally correct.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 4 |

---

## 5. Benefitwright

**User and problem.** People applying for Medicaid, SNAP, housing, unemployment, or small-business licenses—and the navigators who help them. The pain is not “I need advice.” It is a packet: repeating fields, missing proofs, eligibility cliffs, and a portal that punishes hesitation.

**Human experience.** A war-room packet: sections, evidence slots, eligibility preview, plain-language gaps. The applicant (or navigator) talks, uploads a lease photo, and *sees* the packet fill. They never lose the right to correct a field the agent guessed.

**Agent role.** Map a messy story onto schema-valid sections, compute a conservative eligibility preview, request only the next missing artifact, and never submit without an explicit human commit.

**WebMCP tools.**
- `fill_section` (section, fields, confidence, source_utterance)
- `attach_evidence` (slot, file/url, what it proves)
- `preview_eligibility` (ruleset, incomplete-safe)
- `list_blockers` (ordered next actions)
- `correct_field` (human or agent; always logged)
- `submit_packet` (blocked unless blockers = 0 and human confirms)

**Why WebMCP is essential.** Eligibility engines and document slots are site law. A chatbot will hallucinate a qualifying hour count. Browser automation will file the wrong month’s pay stub. WebMCP makes the agent a clerk inside the institution’s own rules, with the human as signer.

**Demo moment.** A laid-off cook with two kids, rent in arrears, a blurry pay stub. The packet assembles; `preview_eligibility` shows a cliff if weekly hours are entered as monthly. The human fixes it. Blockers drop from seven to one: a utility bill. Submit stays disabled. That disabled button is the product.

**One-week POC.** One fictional benefits program with a real rule table (income, household, residency), three evidence slots, upload, conservative preview, submit lock. No live government API.

**Largest risk.** Legal/trust blowback if it looks like it files real claims—or dullness if the rule table is shallow. Frame hard as a navigator sandbox with a published toy statute.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 5 |
| Creativity & Ambition | 3 |

---

## 6. The Mix Chair

**User and problem.** Bedroom producers and podcasters who can hear what they want and cannot operate a DAW fast enough. Text-to-music tools give a new file, not control of *this* mix.

**Human experience.** A browser session: stems, faders, a loop region, A/B. The human listens, soloes, and says “the vocal is eating the guitar only in the chorus.” Hands stay on taste.

**Agent role.** Address named regions and stems through mixer tools, propose two bounded alternatives, never flatten the project into a mystery render unless asked.

**WebMCP tools.**
- `select_region` (bar range or marker)
- `set_fader` / `set_eq_band` (stem, bounded ranges)
- `apply_treatment` (compress, de-ess, sidechain—preset list)
- `render_ab` (variant_a, variant_b, bars)
- `lock_stem`
- `export_mixdown`

**Why WebMCP is essential.** Mix state is numeric, named, and destructive if unbounded. Chat gives adjectives. Pixel-clicking a Web Audio mixer is hopeless. The tools *are* the DAW API, with locks so the agent cannot “helpfully” nuke a vocal the human loves.

**Demo moment.** A lopsided two-stem song. The producer locks the vocal. The agent ducks the guitar in the chorus only, renders A/B. The human picks B, then rejects a suggested compressor. Export. Hearable in thirty seconds.

**One-week POC.** Web Audio, 3–4 stems, markers, EQ + gain + one compressor, A/B buffers, locks. One licensed or original demo song.

**Largest risk.** Audio-on-the-web demo failure (autoplay, judge watches on mute). The video must be heard; the live app must show meters and A/B that work without a lecture.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 3 |
| Potential Impact | 3 |
| Creativity & Ambition | 4 |

---

## 7. Office Hours, Multiplied

**User and problem.** One teacher, twenty students, twenty ChatGPTs. Today those agents either do the homework in a side tab or give hints that break the lesson. The teacher cannot see, pace, or govern any of it.

**Human experience.** A classroom board: live attempts, misconception tags, who is stuck, which hint tier is unlocked. The teacher teaches. Students still write on the page. The teacher can freeze a tool for the room.

**Agent role.** Each student’s agent may only use *this assignment’s* tools: submit a step, request the next legal hint, run a check, or raise a misconception. It cannot fetch the answer key unless the teacher unlocks that tier.

**WebMCP tools.**
- `submit_step` (item_id, work, not final-only)
- `check_work` (returns rubric-aligned signals, not the key)
- `request_hint` (tier 0–n; fails if locked)
- `raise_misconception` (tag, excerpt)
- `ask_for_board_share` (teacher must accept)
- Teacher-side: `set_hint_tier`, `freeze_tools`

**Why WebMCP is essential.** The site is a pedagogical protocol: capability is a first-class, time-varying permission. A generic tutor ignores the teacher. Browser automation cheats. WebMCP is how a class of agents becomes governable.

**Demo moment.** Three students (two scripted, one live ChatGPT) on a linear-equations item. Misconception “subtract from both sides incorrectly” clusters. The teacher unlocks hint tier 1 for the cluster, not the key. The live agent requests tier 2 and is refused. A correct step lands on the board.

**One-week POC.** One assignment, four items, three hint tiers, a teacher console, two simulated student agents plus one real WebMCP session. No LMS import.

**Largest risk.** Week-one scope explodes into “build a classroom.” Also: judges may only open one browser and miss the many-agent point. The video must show teacher glass and student-agent glass at once.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 5 |
| Creativity & Ambition | 5 |

---

## 8. The Remembering Table

**User and problem.** Adult children sitting with a parent and a shoebox of unlabeled photos. Oral history dies in chat transcripts. Genealogy apps want clean facts the parent does not have. Contradictions (“1962” vs “the year of the flood”) disappear into politeness.

**Human experience.** A table: photos, people chips, a timeline, a contradiction drawer. The parent talks. The adult child places a photo. The family stays in the emotional work; the system keeps the graph honest.

**Agent role.** Propose who/when/where, attach utterances to objects, surface contradictions without declaring a winner, and draft captions the parent can reject.

**WebMCP tools.**
- `identify_photo` (person[], place?, date_range?, confidence)
- `add_person` / `link_relationship`
- `attach_memory` (photo or person, quote, speaker)
- `flag_contradiction` (fact_a, fact_b, both remain until resolved)
- `propose_followup` (one question, not an interrogation)
- `build_timeline` (visible gaps, not fake certainty)

**Why WebMCP is essential.** The family graph has identity, contradiction, and consent rules a chatbot will flatten. Automation cannot “politely” keep two dates alive. The table is a memory institution; tools are its accession protocol.

**Demo moment.** Four unlabeled photos. The agent names a recurring face. A caption claims 1962; the parent says “the flood year.” A contradiction card opens, both dates stay, the timeline forks, the next question is one sentence: “Was that before or after Uncle left the mill?”

**One-week POC.** Photo grid, people, timeline, contradiction cards, seed family of eight, local uploads. No facial-recognition vendor—human or agent-proposed IDs only.

**Largest risk.** Sentiment without technical spine, or creepy identification. Keep IDs explicit and reversible; lead the demo on contradiction, not “AI recognized grandma.”

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 4 |

---

## 9. Call Board

**User and problem.** Directors and stage managers of schools, storefront theaters, and indie sets. Blocking lives in the director’s head and a marked-up script. Actors need marks. A chatbot that “suggests blocking” does not know the actual 8-meter stage or the light that is already hung.

**Human experience.** A to-scale stage, furniture, lights, a script column with cue numbers. The director drags a body, scrubs to a line, and says “she must be in the practical’s beam on that confession.”

**Agent role.** Bind lines to marks, check sightlines and light coverage, propose legal crosses, and generate a call sheet from committed blocking—not from vibes.

**WebMCP tools.**
- `place_actor` (actor, x/y, beat)
- `bind_cue` (line_id, positions[], light_state)
- `check_sightline` (actor, house_section)
- `propose_cross` (from_beat, to_beat, avoid collisions)
- `set_light` (instrument, on/off or area)
- `export_runsheet`

**Why WebMCP is essential.** Space + time + text are one document. Chat invents geography. Clicking around a canvas cannot maintain cue integrity when line 40 moves. The board is the system of record for the room.

**Demo moment.** A confession scene. An actor is out of the practical. `check_sightline` fails for house left. The agent proposes a three-step cross that keeps a kiss on the mark. The director locks the kiss, rejects the cross, and the runsheet updates for that page only.

**One-week POC.** One box set, three actors, a two-page script, one practical, collision + sightline checks, runsheet export. Top-down, not 3D.

**Largest risk.** Looks like a toy blocking game; geometry bugs destroy trust. Keep the stage rectangular and the rules few but correct.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 3 |
| Potential Impact | 3 |
| Creativity & Ambition | 4 |

---

## 10. The Commons Chamber *(wildcard)*

**User and problem.** Residents who “participate” in local government by watching a stream and emailing a comment that dies in a PDF. Motions, amendments, and budget lines are structured—but the public is given theater, not tools. Staff cannot ingest a thousand unstructured emails into the docket.

**Human experience.** A live (or replayed) chamber: agenda, current motion, budget line items, an amendment stack, a testimony queue. The human watches and decides values. They can stand a sentence in their own name.

**Agent role.** Not a civic chatbot. A legislative clerk for *this* docket: draft an amendment that points at a real clause, estimate a budget delta against published numbers, file testimony in the correct slot, and never speak as the city.

**WebMCP tools.**
- `get_docket` / `get_current_motion`
- `draft_amendment` (target_clause, text, sponsor)
- `score_budget_delta` (line_items[], signed amounts)
- `file_testimony` (120-second oral or 300-word written, motion_id)
- `request_record` (cited ordinance id)
- `withdraw` (amendment or testimony; human-only confirm)

**Why WebMCP is essential.** Civic procedure *is* an API that the public was never given. A chatbot writes a poem to city hall. Scraping a Granicus player does not file an amendment. WebMCP is how the open web grows a lawful public action surface next to the dais.

**Demo moment.** Replay of a three-minute zoning item. The resident says they support housing but not the parking waiver on this parcel. The agent drafts a one-clause amendment, shows a parking-revenue delta, files 90 words of testimony on the correct motion, and the stack updates as if the clerk had accepted it.

**One-week POC.** One fictional city, one ordinance, a scripted “live” agenda clock, three motions, a toy budget table, amendment stack, testimony list. No real city integration.

**Largest risk.** Procedure is deep; a shallow toy looks political and fake. Also: scope temptation (accounts, districts, real streams). Win only if the docket objects are real enough to touch.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 3 |
| Potential Impact | 5 |
| Creativity & Ambition | 5 |

---

# Selection

## Strongest three

**1. Office Hours, Multiplied**  
Non-obvious insight: WebMCP’s new primitive is not “an agent can click our site.” It is *capability as a lesson plan*. The teacher authors what agents may do, when, and in front of whom. That is a different genre from copilots: a many-agent room with a human sovereign. It is the clearest picture of humans and agents inhabiting one product together, which is the brief in a single frame.

**2. Sourced**  
Non-obvious insight: the unit of collaboration is not the document and not the chat turn. It is the *claim*. Once claims are objects with status, evidence, and rewrite rights, the agent becomes accountable and the human remains editor-in-chief. That pattern generalizes (policy, science, corporate comms) but the newsroom makes it legible in under a minute. It also maximizes WebMCP leverage without requiring two live parties or a classroom of bots.

**3. Seatpeace**  
Non-obvious insight: the hard part of grouping humans is not search. It is *partial, social, revisable law*—locks, shame, access, patronage—encoded so an optimizer may touch the room without laundering a taboo. Complementary intelligence is unusually pure here: the host has tacit knowledge the agent will never have; the agent has a search the host will not do at 12:40 a.m. The visual before/after is almost unfairly good for a three-minute tape.

## The one to build to win

**Sourced.**

Strategic rationale. In one week you can ship a *complete* desk, not a stage set: a real editor, stubborn claim cards, attach, rewrite, freeze, two seed stories. Judges who never open the live URL still understand the tape. WebMCP is not decorative—the tools are the only way to mutate the claim graph, and a chatbot alternative fails the first unsupported sentence. Impact is specific (local reporting, newsletters, student journalism) without medical or civic liability. Creativity is high enough if you refuse a generic writing UI and lead every pixel with claim state. Tie-break is WebMCP Leverage: five tools around one living object, visibly implemented, easy to read in the repo. Office Hours is the more important future, but it needs a two-browser cast and teacher-governance UX that will slip in seven days. Seatpeace is the safer visual win and a strong fallback if Sourced starts looking like an AI editor—in which case you double down on killed claims that stay dead. Sourced, built without flinching on epistemology, is the best scoreboard bet.

## Wildcard that could reset the category

**The Commons Chamber.**  

If it works, WebMCP stops meaning “our SaaS grew a tool schema” and starts meaning *the public procedure of a place is addressable*. Humans keep the vote and the values; agents keep the clause pointers, the budget deltas, and the filing hygiene. That is a different theory of the open web than another productivity copilot. It is hard because legitimacy, procedure, and demo politics all fail loudly—but a tight fictional docket with real objects would be the submission people remember.
