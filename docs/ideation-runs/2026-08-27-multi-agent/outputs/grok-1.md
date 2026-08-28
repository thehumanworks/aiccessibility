# WebMCP Challenge — Independent Ideation

Assumptions: a small team, one week, a live URL that works in ChatGPT’s in-app browser or WebMCP-enabled Chrome, and judges who may never click the product. Every idea therefore needs a visible shared object, a human who is not optional, and tools that mutate that object in ways a sidebar chatbot cannot.

---

## 1. The Dissent Board

**User and problem.** Hiring managers, grant panels, and startup partners make high-stakes calls in a shared doc, then discover later that nobody recorded the counter-case. Groupthink is cheap; a durable dissenting record is not.

**Human experience.** A visual board of claims, evidence chips, and a “decision seal.” People pin what they actually believe, drag evidence onto criteria, and argue in the open.

**Agent’s role.** Appointed opposition. It cannot type freely into the memo. It can only file structured moves the board already understands: objections, missing-evidence flags, alternative framings, and a formal dissent brief.

**WebMCP tools.** `pin_claim`, `attach_evidence`, `file_objection`, `score_criterion`, `generate_dissent`, `seal_decision`

**Why WebMCP is essential.** A chatbot produces prose beside the decision. Browser automation clicks the wrong card. These tools *are* the parliamentary vocabulary of the product: every move is typed, attributed, and reversible on the same board the human is looking at.

**Demo moment.** A human pins “Hire candidate A.” The agent files three objections, one of which the human accepts as an amendment. The board reseals with a one-page rationale that includes the dissent. Cut to the sealed record.

**One-week PoC.** One board, four criteria, mock evidence library, working tool calls, seal/export. No accounts beyond a share link.

**Largest risk.** Reads as “AI debate toy” if the board does not feel like a real decision artifact.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 3 |

---

## 2. Continuity Desk

**User and problem.** Indie directors and YouTube essayists break continuity across takes: wardrobe, props, eyeline, leftover coffee cups. The pain is visual and temporal, and it shows up only when you compare shots.

**Human experience.** A two-up viewer of dailies plus a living continuity bible (characters, wardrobe, props, geography). The human scrubs film and marks what *feels* wrong.

**Agent’s role.** Cross-take accountant. It does not “edit the movie.” It writes and queries the bible, flags mismatches against the current frame, and proposes shot-list reorderings that restore continuity.

**WebMCP tools.** `register_character`, `note_wardrobe_state`, `flag_mismatch`, `query_bible`, `reorder_shot`, `lock_setup`

**Why WebMCP is essential.** The meaning lives in shot IDs, setup locks, and bible rows—not in DOM buttons. A generic agent guessing from pixels will invent continuity errors; a chatbot cannot mutate the bible and the timeline as one transaction.

**Demo moment.** Two takes of the same scene. Human notices a bracelet. Agent `flag_mismatch`s it, updates the bible, and `reorder_shot`s so the clean master plays first. The timeline visibly reflows.

**One-week PoC.** Two short clips, one character, wardrobe + prop tracks, shot list with drag + tool-driven reorder.

**Largest risk.** Media pipeline and sync in a week; judges may bounce if playback is janky.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 3 |
| Potential Impact | 3 |
| Creativity & Ambition | 4 |

---

## 3. Veto Atlas

**User and problem.** Friend groups and families plan trips in a group chat that cannot hold constraints. One person has a budget, one cannot do stairs, one refuses red-eye flights. The loudest voice wins.

**Human experience.** A shared map and itinerary canvas. Humans browse places, photos, and vibes. Each person has a visible “constraint crest” (budget, mobility, dates, hard nos).

**Agent’s role.** Diplomat for one participant. It does not pick the restaurant because it has taste. It casts vetos, proposes swaps that keep everyone’s crests green, and explains who pays the constraint cost.

**WebMCP tools.** `cast_veto`, `set_constraint`, `propose_swap`, `price_itinerary`, `hold_reservation_slot`, `explain_conflict`

**Why WebMCP is essential.** The product is a multi-party state machine. Chatbots collapse to one narrator. Browser automation cannot cast a *typed veto bound to a person and a place* that other agents must treat as law.

**Demo moment.** Human drops three restaurants on the map. Their agent vetoes the walk-up bistro (mobility crest), proposes a swap two blocks away, and the other (scripted) agent accepts. Crests all go green.

**One-week PoC.** One city neighborhood, three scripted personas, map pins, itinerary math, no real bookings (holds only).

**Largest risk.** Multi-agent demo is hard to stage; may look like a travel chatbot with pins.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 3 |
| Potential Impact | 4 |
| Creativity & Ambition | 4 |

---

## 4. Repair Chorus

**User and problem.** People with a dead appliance, lamp, bike, or laptop want to fix it, not replace it. Guides are walls of text; videos skip the one observation that matters. Hands are busy. Eyes are on the object, not a chat.

**Human experience.** A large, calm procedure stage: current step, photo well, parts tray, and a “what I see” strip. The human is the sensor and the hands.

**Agent’s role.** Foreperson. It advances the official procedure only through tools, asks for structured observations, and will not skip a safety lock. It never pretends to see the bench.

**WebMCP tools.** `begin_procedure`, `record_observation`, `advance_step`, `order_part`, `mark_safety_hold`, `close_repair`

**Why WebMCP is essential.** The site is the shared job ticket. A chatbot can hallucinate the next screw. Generic automation cannot bind “I smell burnt plastic” to a typed observation that changes the branch and the parts tray the human is staring at.

**Demo moment.** A lamp that does not light. Human photos the plug. Agent records `no_power_at_outlet=false`, advances to continuity check, hits a safety hold on a live-wire guess, then after a confirmed dead outlet-side cord, drops a $6 part into the tray and closes the job.

**One-week PoC.** One object family (lamps *or* bike brakes), 8–12 step tree, photo upload, parts list, printable closeout.

**Largest risk.** Looks like a decision-tree gimmick unless the visual job ticket is gorgeous and the tools are obviously the only way the tree moves.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 4 |
| Potential Impact | 5 |
| Creativity & Ambition | 4 |

---

## 5. Palimpsest

**User and problem.** Researchers and policy writers revise until the citations no longer support the claim in paragraph four. Track-changes shows words, not argument integrity.

**Human experience.** A manuscript on the left; a claim–warrant–evidence graph on the right. Humans write for voice. Broken edges glow.

**Agent’s role.** Conservator, not ghostwriter. It may only edit through operations that keep or explicitly break a claim edge—and must label the break.

**WebMCP tools.** `register_claim`, `bind_citation`, `propose_rewrite`, `sever_edge`, `audit_integrity`, `freeze_section`

**Why WebMCP is essential.** The valuable object is the graph-plus-prose, not the text buffer. A chatbot rewrite silently orphans citations. Browser automation cannot perform an atomic `propose_rewrite` that updates both sentence and edge.

**Demo moment.** Human pastes a three-claim abstract. Agent `audit_integrity`s: one citation supports the opposite claim. Human accepts a `propose_rewrite` that restores the edge. The glow dies. Section freezes.

**One-week PoC.** One paper stub, DOI or URL citations (even mocked metadata), graph renderer, three mutation tools, freeze/export.

**Largest risk.** Academic tooling looks dry on video; graph UX can get muddy fast.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 3 |
| Potential Impact | 4 |
| Creativity & Ambition | 4 |

---

## 6. Caption Parliament

**User and problem.** Deaf and hard-of-hearing viewers, and creators who care about them, inherit captions that are timed but wrong: speaker identity, tone, overlapping talk, in-jokes. Auto-caption is fast and slightly false.

**Human experience.** Video with a caption ribbon that treats meaning as editable law. A human editor—ideally a d/Deaf reviewer—owns sense, speaker, and tone.

**Agent’s role.** Clerk of the parliament. It splits cues, retimes, assigns speakers from a roster, and packages exports. It cannot unilaterally change a meaning the human has locked.

**WebMCP tools.** `split_cue`, `retime_cue`, `set_speaker`, `propose_wording`, `lock_meaning`, `export_captions`

**Why WebMCP is essential.** Timing tools and meaning locks are first-class product law. A chatbot pastes a new transcript and wrecks timing. Pixel automation cannot `lock_meaning` so a later agent retimes without rewriting the joke.

**Demo moment.** A 45-second clip with two speakers talking over each other. Agent splits and speaker-IDs. Human rejects a flattened joke, `lock_meaning`s their wording. Agent retimes around the lock. Sidecar file downloads.

**One-week PoC.** One clip, two speakers, VTT in/out, lock semantics, no ASR training—seed captions can be imperfect on purpose.

**Largest risk.** Looks like “yet another caption editor” if the lock/retime contract is not the star of the demo.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 5 |
| Creativity & Ambition | 3 |

---

## 7. Bequest Atlas

**User and problem.** Adult children and executors inherit boxes of photos, letters, and objects with no names. The emotional work is human. The cataloging work kills the project.

**Human experience.** A table of scans and objects. Humans tell the story aloud or in short notes: “that’s dad’s river knife, do not sell.”

**Agent’s role.** Registrar. It files people, places, dates, and wishes as nodes; it may only ask structured questions the atlas can store; it drafts a bequest card the human must sign.

**WebMCP tools.** `accession_item`, `identify_person`, `link_story`, `set_bequest_wish`, `ask_next_question`, `sign_card`

**Why WebMCP is essential.** Consent and wish are product operations, not chat sentiment. A chatbot will invent a cousin. An automating agent cannot create an accession record that is also a legal-feeling, human-signed card on the same page.

**Demo moment.** Three unlabeled photos. Human says who is in the first. Agent accessions the rest as “same river, 1987?”, human corrects the year, sets “knife → nephew,” signs the card. A family map draws itself.

**One-week PoC.** Upload three images, people graph, wish field, signed card PDF, no real estate/legal filing.

**Largest risk.** Sentimentality without a sharp tool contract; privacy concerns if sample data feels too real.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 3 |

---

## 8. Unconference Floor

**User and problem.** Facilitators of unconferences, barcamps, and internal “demo days” run a paper grid that dies on contact with reality. Rooms collide. The interesting session never gets a wall.

**Human experience.** A live floor plan. Humans walk the rooms (or the page) and pitch topics on physical-feeling cards.

**Agent’s role.** Floor manager for an attendee or for the host. It bids on rooms, yields slots, merges duplicate topics, and posts a conflict with a reason the grid must display.

**WebMCP tools.** `pitch_session`, `bid_on_room`, `yield_slot`, `merge_topics`, `post_conflict`, `publish_grid`

**Why WebMCP is essential.** The floor is a scarce spatial market. Chat cannot occupy a room. Click-scripts race and double-book. Tools make occupancy, yield, and merge atomic events other agents can see.

**Demo moment.** Four rooms, six pitches. Host’s agent merges two “eval” talks. An attendee agent bids the sunlit room. Human host drags a card anyway; `post_conflict` lights the room red; human yields; grid publishes.

**One-week PoC.** Static floor SVG, time boxes, 2–3 scripted agents, publish to a read-only grid URL.

**Largest risk.** Without real concurrency it feels like a scheduling spreadsheet with extra steps.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 3 |
| Potential Impact | 3 |
| Creativity & Ambition | 4 |

---

## 9. Brigade Card

**User and problem.** Pop-up chefs and bakery owners iterate a dish in their heads. The costing, allergen matrix, and scale-to-40-covers math is where the week’s margin dies—and it happens while their hands are wet.

**Human experience.** A single recipe card that looks like a station ticket: yield, plate photo, tasting notes, cost bar, allergen flags. The chef tastes and writes sensory truth (“too much smoke, salt is right”).

**Agent’s role.** Expeditor. It scales, reprices, swaps a supplier SKU, and will not let a walnut-adjacent oil silently enter a nut-free ticket.

**WebMCP tools.** `log_tasting_note`, `scale_yield`, `swap_sku`, `reprice_plate`, `set_allergen_lock`, `print_station_ticket`

**Why WebMCP is essential.** Allergen lock and yield are safety and money, not suggestions. A chatbot that “helps with the recipe” can add tahini. The card must refuse that swap unless the lock is explicitly lifted by the human.

**Demo moment.** Chef logs “sauce too thick.” Agent scales cream, reprices, tries a pistachio oil swap, and is blocked by the nut lock. Human lifts the lock *or* refuses. Ticket prints for a 24-cover service.

**One-week PoC.** One dish, 8 ingredients, two SKUs each, allergen lock, tasting log, printable ticket. Fake prices fine if consistent.

**Largest risk.** “Recipe app with AI” unless the lock/swap/ticket loop is the entire demo.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 4 |
| Execution | 4 |
| Potential Impact | 4 |
| Creativity & Ambition | 3 |

---

## 10. Witness Bench *(wildcard)*

**User and problem.** HOA boards, PTAs, and small unions produce minutes that do not match what was decided. Informal chat plus a secretary’s memory is how communities lose the vote.

**Human experience.** A live meeting chamber: motion stack, speaker’s list, roll-call lamps, and a minute book that writes itself only from recognized acts. A human chair still recognizes speakers and gavel-ends debate.

**Agent’s role.** Parliamentarian and recording clerk—possibly one agent per member. It may move, second, amend, call the roll, and request a point of order. It cannot “summarize the vibe” into a decision.

**WebMCP tools.** `recognize_speaker`, `move`, `second`, `amend`, `call_roll`, `sustain_point_of_order`, `enter_minutes`

**Why WebMCP is essential.** Robert’s Rules is a typed protocol. If it is not tools, it is fan fiction. A chatbot minutes-taker invents unanimity. Browser automation cannot second a motion in a way that unlocks `call_roll` and writes an archival line the human chair can gavel.

**Demo moment.** Human chairs a 90-second HOA clip: motion to paint the fence. Member-agent seconds, another amends the color, chair recognizes, roll-call lamps fire, minutes emit a signed-looking entry. Replay the book: no extra sentences.

**One-week PoC.** Five seats, one scripted member-agent, motion/second/amend/roll/minutes. No video conference—type and gavel is enough if the chamber is vivid.

**Largest risk.** Rules engines sprawl; a sloppy implementation becomes a toy legislature and loses impact.

| Criterion | Score |
|---|---|
| WebMCP Leverage | 5 |
| Execution | 2 |
| Potential Impact | 4 |
| Creativity & Ambition | 5 |

---

# Selection

## Strongest three

**Repair Chorus, The Dissent Board, Caption Parliament.**

### Repair Chorus — non-obvious insight
WebMCP is unusually strong when the human is *not* at the keyboard as a knowledge worker. The site becomes the only safe channel between a busy body and an agent: observations in, procedure out, parts and safety holds as shared objects. That is a different genre than “agent fills in the form I am already staring at.”

### The Dissent Board — non-obvious insight
The prize is not generation; it is a *closed vocabulary of opposition*. Once dissent is a tool, not a paragraph, the human and the agent are playing the same game on the same board. Judges can see WebMCP leverage without a lecture: every tool call is a card.

### Caption Parliament — non-obvious insight
The durable pattern is a **meaning lock**. Humans own sense; agents own mechanics. That split is the opposite of most “AI accessibility” demos, which let the model overwrite the very people it claims to serve. WebMCP is the lock.

---

## The one to build to win

**Repair Chorus.**

In one week it can be a complete object: one repair family, a beautiful job ticket, real tool calls, a closeout a judge can hold. The demo is physical and obvious on camera. The audience is specific (people who would otherwise throw the thing away). The agent is necessary and bounded. WebMCP is the procedure itself, which is the first tie-break. Caption Parliament is the safer social-impact story; Dissent Board is the cleaner knowledge-work story. Repair Chorus is the one that does not look like last year’s copilot.

---

## Wildcard

**Witness Bench.** A tiny legislature whose only legal acts are WebMCP tools, with a human chair who still has the gavel. If the chamber is real enough that a scripted member-agent and a human can pass one amendment on camera, it resets what “humans and agents collaborate on the open web” looks like: not help, but *office*. It is the hardest to finish cleanly in a week, and the one that would be remembered if it works.
