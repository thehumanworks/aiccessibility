# WebMCP Challenge — 10 Product Concepts

---

## 1. Tape — a co-producer that shares your session

- **User & problem:** Bedroom producers who know the vibe they want but lose hours to mechanical work — writing drum patterns, arranging sections, dialing effects — before the idea evaporates.
- **Human experience:** A real multitrack DAW in the browser: timeline, piano roll, mixer. The human records loops, drags clips, mutes tracks, twists knobs — full normal product.
- **Agent's role:** A co-producer working *the same session*. It composes variations, arranges song structure, sets effect parameters — every change visible and audible live, sharing one undo history with the human.
- **WebMCP tools:** `create_track(instrument)`, `write_notes(track, bars, notes[])`, `set_effect(track, effect, params)`, `arrange_section(name, start_bar, clips[])`, `get_session_state()`, `render_mixdown()`.
- **Why WebMCP is essential:** Music editing demands note-level and parameter-level precision on shared live state. Clicking a piano roll via DOM automation is hopeless at any tempo; a chatbot can't touch the session at all. Tools also execute in milliseconds, so the agent keeps up with a live creative flow.
- **Demo moment:** Human lays down a 2-bar bass loop and says "make it a song." In ~20 seconds drums, keys, and an intro/verse/drop arrangement appear on the timeline. Human mutes the keys; the agent re-harmonizes around the gap. Ends with a mixdown.
- **One-week scope:** Tone.js/WebAudio; 4 instruments; step grid + simple piano roll; 8–10 tools; single session, no multi-user.
- **Biggest risk:** Audio timing/latency and autoplay policies in the judging browser; UI scope creep.
- **Scores:** Leverage 5 · Execution 4 · Impact 3 · Creativity 4

---

## 2. Souk — the marketplace where your agent haggles for you

- **User & problem:** Anyone buying or selling secondhand who hates haggling — most people are bad at it, find it awkward, and either overpay or leave money on the table. Sellers drown in lowball messages.
- **Human experience:** List an item with photos plus a *private* floor price and constraints (pickup windows, bundle rules). A live "negotiation room" shows inbound offers as structured cards with state. One tap to accept; you only get pinged for near-deal or out-of-bounds offers.
- **Agent's role:** Your personal negotiator. It fields buyer agents, counters within your bounds, cites comparables, and escalates to you only when judgment is needed. Crucially, *both sides'* agents use the same tool surface.
- **WebMCP tools:** `publish_listing(item, terms)`, `get_active_offers(listing)`, `make_offer(listing, price, conditions)`, `counter_offer(offer, price, message)`, `accept_offer(offer)`, `get_comparable_prices(query)`.
- **Why WebMCP is essential:** A negotiation is a state machine of machine-checkable commitments — price, conditions, expiry, status (open/countered/accepted). Chat text cannot enforce that; DOM automation cannot represent a binding counter-offer. WebMCP isn't the interface here, it's the *market protocol*.
- **Demo moment:** List a bike at €200 with a €150 floor. Three buyer agents arrive and haggle live in the room view. Your agent holds the line, closes at €180 + Saturday pickup, and you tap "accept." The twist: the winning buyer was also an agent acting for its human. A judge's own ChatGPT agent can walk in and negotiate.
- **One-week scope:** Single marketplace, synthetic inventory, LLM-driven buyer agents, no payments (ends at "mark as sold"), 6 tools, live transcript UI.
- **Biggest risk:** Negotiation believability — if counters look random, the demo dies. The "why not a chatbot" question must be answered by the visible deal state machine.
- **Scores:** Leverage 5 · Execution 4 · Impact 4 · Creativity 5

---

## 3. Sous — a hands-free cooking co-pilot for when reality deviates

- **User & problem:** Home cooks mid-recipe with flour-covered hands who hit the classic failures: missing ingredient, wrong pan size, two dishes needing the oven at once.
- **Human experience:** A clean, glanceable cook mode: mise en place checklist, current step, live timers. Fully usable by touch as a normal product.
- **Agent's role:** A live recipe engineer. When reality deviates, it rescales quantities, substitutes ingredients, and re-times the whole dependency graph — the on-screen plan rewrites itself.
- **WebMCP tools:** `get_recipe_state()`, `scale_recipe(servings | pan_size)`, `substitute_ingredient(name, replacement)`, `start_timer(label, seconds)`, `adjust_step(step, change)`, `get_timing_conflicts()`.
- **Why WebMCP is essential:** A recipe in progress is structured state — a dependency graph of quantities, temperatures, and sequencing. A chatbot can *advise* ("use yogurt instead") but can't mutate the live cook mode; DOM automation can't reliably do unit math on quantities.
- **Demo moment:** Mid-batter: "I only have two eggs and an 8-inch pan." The agent rescales everything, swaps an ingredient, re-times the bake, and auto-starts the preheat timer — the checklist visibly reorganizes.
- **One-week scope:** 5 curated recipes modeled as graphs; typed commands acceptable (voice optional); 6 tools; no accounts.
- **Biggest risk:** Recipe-graph modeling effort; the demo hinges on a believable mid-cook deviation.
- **Scores:** Leverage 4 · Execution 4 · Impact 4 · Creativity 3

---

## 4. Proxy — professional tools, operable by everyone

- **User & problem:** Creators with motor impairments who are locked out of timeline-based software (video editors, audio suites) because those products are pointer-and-canvas territory. Also anyone literally hands-busy.
- **Human experience:** A real, simple video editor — import clips, timeline, preview, export — fully operable with mouse and keyboard like any normal product.
- **Agent's role:** The user's hands. Every capability of the editor is mirrored as a tool, so directing an edit by voice — "cut the dead air, tighten the intro, caption it" — executes with the timeline updating live. The agent surface *is* the product's own action layer.
- **WebMCP tools:** `import_media(file)`, `split_clip(clip, time)`, `move_clip(clip, track, time)`, `set_transition(a, b, type)`, `auto_caption(language)`, `export_video(format)`.
- **Why WebMCP is essential:** This is the strongest possible argument for the standard: accessibility has always meant a *parallel interface* (screen readers, switch devices) that lags the main product. When the app exposes its capabilities as tools, the accessible experience is first-class and never out of date — accessibility by architecture, not retrofit. Canvas timelines are unreachable by DOM automation; a chatbot can't edit.
- **Demo moment:** A creator directs a 45-second vlog rough cut entirely by voice in real time — trims, b-roll placement, captions — then exports. One real persona quote anchors the impact.
- **One-week scope:** ffmpeg.wasm cutting of short clips; 6 tools; single project; captions via API with manual-text fallback.
- **Biggest risk:** In-browser video processing performance; a week is tight for an editor that feels real rather than a mockup.
- **Scores:** Leverage 5 · Execution 3 · Impact 5 · Creativity 4

---

## 5. Loremaster — a dungeon master that actually enforces the rules

- **User & problem:** Tabletop RPG groups who love the story but drown in crunch — or can't find a DM at all. Existing "AI DM" products are chatbots that narrate but can't fairly run a shared game.
- **Human experience:** A shared battle map with tokens, character sheets, and a dice tray. Players move their own tokens and declare actions in a normal, tactile UI.
- **Agent's role:** The referee. It adjudicates rules, runs all NPC turns, tracks HP/positions/fog of war, and narrates — with every state change executed through authoritative tools and animated on the shared board.
- **WebMCP tools:** `roll_check(actor, skill, difficulty)`, `move_token(token, position)`, `apply_damage(target, amount, type)`, `reveal_fog(region)`, `run_npc_turn(npc)`, `get_game_state()`.
- **Why WebMCP is essential:** Fairness requires the referee to mutate structured game state (initiative, positions, hit points, fog) through authoritative tools — not to *describe* outcomes in prose. A chatbot DM hallucinates game state; DOM automation can't maintain it.
- **Demo moment:** An ambush. The agent runs six goblins' full turns in seconds — moves, attacks, damage rolls all animated on the map — then narrates the result. A player proposes something clever; the agent adjudicates it with a visible `roll_check`.
- **One-week scope:** One d20-lite ruleset, one map, four pregenerated characters, text narration, 6 tools.
- **Biggest risk:** Narrative quality under live conditions; judges may find the audience niche.
- **Scores:** Leverage 5 · Execution 4 · Impact 3 · Creativity 4

---

## 6. Rebooked — the 90-second answer to a cancelled flight

- **User & problem:** Travelers mid-cascade — cancelled flight, missed connection — facing hour-long hold times while every alternative sells out around them.
- **Human experience:** Import an itinerary; when disruption hits, a board shows ranked recovery options with honest trade-offs (cost delta, arrival time, layovers). Approve with one tap.
- **Agent's role:** A crisis optimizer. It searches alternates, reads fare rules, places time-limited holds, rebooks, and notifies the hotel — in parallel, in seconds, all through tools.
- **WebMCP tools:** `get_itinerary()`, `search_alternatives(segment, constraints)`, `get_fare_rules(option)`, `hold_option(option, ttl)`, `confirm_rebooking(hold)`, `notify_provider(hotel, new_times)`.
- **Why WebMCP is essential:** Holds and rebookings are *transactional state transitions with expirations*. A chatbot can only advise you to call the airline; DOM automation breaks on airline sites and cannot hold inventory. The demo doubles as an argument: this is the tool surface airlines should publish.
- **Demo moment:** A simulated "your flight is cancelled" notification. The agent fans out and returns in 40 seconds with three *held* options and total-cost deltas. One tap: everything reissued, hotel notified of the late arrival.
- **One-week scope:** A clearly-labeled synthetic airline/hotel inventory API (itself WebMCP-exposed), 6 tools, email-style confirmations.
- **Biggest risk:** Mock inventory can read as fake; framing must be explicit that the synthetic backend stands in for a real carrier.
- **Scores:** Leverage 4 · Execution 3 · Impact 5 · Creativity 3

---

## 7. Agora — group decisions that end in a decision

- **User & problem:** Teams and communities whose decisions die in chat threads — no structure, no crux, no record, so the same debate recurs monthly.
- **Human experience:** A living argument map: claims, evidence, objections, and polls as first-class objects, with the current "crux" visually highlighted. Participants contribute through a normal UI.
- **Agent's role:** The facilitator. It steel-mans each position, attaches evidence, identifies the actual crux of disagreement, detects emerging consensus, and drafts the decision record.
- **WebMCP tools:** `add_claim(text, parent)`, `attach_evidence(claim, source)`, `propose_crux(claim_a, claim_b)`, `run_poll(question, options, method)`, `get_map_state()`, `publish_decision(summary)`.
- **Why WebMCP is essential:** Claims, edges, and votes are typed objects with provenance. A chatbot summary flattens structure and loses who-believes-what; DOM automation can't maintain a consistent evolving graph that both humans and agents mutate.
- **Demo moment:** Six teammates' messy positions are pasted in. The agent builds the map live and announces: "The real disagreement is timeline, not scope." A ranked poll runs; a decision record publishes with the minority objection preserved.
- **One-week scope:** Single room, no auth, graph visualization, 6 tools, markdown export.
- **Biggest risk:** Looking like "whiteboard + chatbot" if the structured-graph value isn't made vivid in the first 30 seconds.
- **Scores:** Leverage 4 · Execution 4 · Impact 4 · Creativity 4

---

## 8. Foil — public-records investigation where every number has a receipt

- **User & problem:** Local journalists and civic activists drowning in datasets that are technically open but practically hostile — spending records, 311 data, lobbying filings. AI chatbots make up numbers; manual work takes weeks.
- **Human experience:** An evidence board where every claim is pinned to cited source records, and a draft write-up assembles itself with footnotes that click through to the exact row.
- **Agent's role:** A research partner bound to provenance. It runs structured queries, proposes hypotheses, pins citations, and drafts — but it *cannot* assert anything it can't cite, because claims must link to records via tools.
- **WebMCP tools:** `list_datasets()`, `query_dataset(dataset, filter)`, `get_record(id)`, `pin_evidence(record, note)`, `link_evidence(claim, records[])`, `export_draft(format)`.
- **Why WebMCP is essential:** Accountability research needs auditable queries and stable citations. A chatbot invents figures; DOM scraping of data portals is brittle and produces nothing citable. The tool layer is what makes the agent's output *verifiable* — the entire product value.
- **Demo moment:** "Where did the council's road budget actually go?" The agent queries real spending data live, surfaces an outlier contract, pins five records, and drafts a 150-word brief with working footnotes.
- **One-week scope:** Two real open datasets pre-loaded behind a clean API, board UI, 6 tools, no auth.
- **Biggest risk:** Dataset wrangling time; the chosen dataset must reliably contain a findable story for the demo.
- **Scores:** Leverage 4 · Execution 4 · Impact 4 · Creativity 4

---

## 9. Fab — describe it, tweak it, print it

- **User & problem:** Makers, teachers, and cosplayers who have concrete ideas ("a phone stand stable on carpet") but no CAD skills — the gap between intent and a printable file is years of software.
- **Human experience:** Describe an object, see a live 3D preview with parametric sliders, pick a material, get a quote and an STL. Sliders and preview work as a normal product.
- **Agent's role:** A design engineer. It translates intent into typed parameters, iterates on feedback ("wider base"), and checks printability constraints — fixing thin walls before you ever see a failure.
- **WebMCP tools:** `set_design_parameter(name, value)`, `generate_preview()`, `check_printability()`, `quote_material(material)`, `export_file(format)`, `get_design_spec()`.
- **Why WebMCP is essential:** Parametric design is structured state with physical constraints. The agent must read the spec (wall thickness, overhangs) and set typed parameters — impossible by clicking a 3D canvas; a chatbot can't render or validate anything.
- **Demo moment:** "A phone stand that says MOM, stable on carpet." Preview appears. "Wider base" — instant update. Printability check flags the thin letters; the agent thickens them; STL downloads.
- **One-week scope:** Three parametric templates (stand, hook, nameplate) via three.js/CSG; static quote table; STL export; 6 tools.
- **Biggest risk:** In-browser CAD reliability; a narrow template set can feel toy-like if the constraint-checking isn't foregrounded.
- **Scores:** Leverage 4 · Execution 3 · Impact 3 · Creativity 4

---

## 10. Envoy (wildcard) — your agent leaves the browser, with receipts

- **User & problem:** Anyone facing a multi-errand life event — moving abroad, a wedding, a visa — that spans a dozen websites, none of which were built for agents, so *you* are the integration layer.
- **Human experience:** A mission-control dashboard. Each delegation is a card with live status, spend limits, and a signed **consent receipt** for every action your agent took on another site. You approve consequential steps; everything is auditable after the fact.
- **Agent's role:** Your envoy. Give it one goal — "plan my move to Lisbon under €2k/month" — and it discovers and uses *other* WebMCP sites' published tools (the team's demo apartment finder, mover marketplace, and visa-checklist service), then reports back with full provenance.
- **WebMCP tools (hub):** `create_delegation(goal, constraints)`, `list_connected_services()`, `get_delegation_status(id)`, `approve_action(delegation, action)`, `revoke_delegation(id)`, `get_consent_receipt(action)` — plus 3–4 tools on each satellite site.
- **Why WebMCP is essential:** This *is* the endgame the challenge brief asks you to imagine — agents transacting across the open web through published tools with auditable consent. There is no DOM-automation or chatbot analogue you could safely authorize to act for you on a foreign site.
- **Demo moment:** One prompt fans out into three delegations across three live sites. Watch viewing appointments get booked, moving quotes gathered, and a visa checklist filled — every action landing as a signed receipt on the dashboard. Ninety seconds, then the total plan.
- **One-week scope:** The hub plus three thin but genuinely functional WebMCP satellite sites; simple HMAC-signed receipts; 6 hub tools.
- **Biggest risk:** It's four products in one week. If any satellite feels fake, the vision collapses. Hardest execution in this list — and the highest ceiling.
- **Scores:** Leverage 5 · Execution 2 · Impact 5 · Creativity 5

---

# The strongest three

### Souk
**The non-obvious insight:** Negotiation is the first mainstream consumer activity that is *better performed by agents than by humans* — most people hate it and are bad at it — but it only works if offers are structured commitments, not chat messages. WebMCP turns "a conversation about a deal" into "a verifiable state machine of a deal." And because the site's tools serve both sides' agents symmetrically, Souk is the first genuinely *agent-symmetric* product: a judge's own ChatGPT agent can walk in and haggle, making the judge a protagonist rather than a spectator.

### Tape
**The non-obvious insight:** The core friction in creative tools isn't generating content — it's the *edit distance between intent and the current state of the artifact*. An agent with tool-level access collapses that distance while the human keeps taste-level control, and that division of labor (agent: parametric precision; human: judgment) is only enforceable when actions are typed tools rather than pixel gestures. Latency is the hidden killer feature: tools execute in milliseconds, so the agent can keep pace with a live creative flow, which no screen-scraping agent ever will.

### Proxy
**The non-obvious insight:** Accessibility has always meant building a *parallel interface* that perpetually lags the main product. WebMCP inverts this: when an app exposes its capabilities as tools, the agent surface **is** the product, so the accessible experience is first-class and can never fall out of date. "Accessibility by architecture, not retrofit" is a genuinely new argument for WebMCP adoption — and it gives the submission a moral weight most hackathon projects lack.

---

# The one to build: **Souk**

Strategic rationale:

- **It is the brief.** "The future of the open web — where humans and agents interact, collaborate, and create together" is enacted literally: humans and agents on both sides of a market, transacting through an open standard.
- **WebMCP is ungameably essential.** In most submissions, judges will ask "couldn't this be a chatbot?" In Souk, the tools *are* the market — offers, counters, and acceptances are typed commitments with state. It maximizes the first tie-break criterion by construction.
- **The demo is a self-contained story with a twist** (the winning buyer was an agent too), legible in under ten seconds: "a marketplace where your agent haggles for you." It survives judgment from the video alone.
- **Execution risk is the lowest of the top tier.** No audio engine, no video processing, no external APIs — a CRUD marketplace, a negotiation protocol, and LLM buyer agents the team fully controls. The week goes into polish and believability, not fighting browser media stacks.
- **It's the only idea where the judge's own agent can participate live** from ChatGPT's in-app browser — an unforgettable evaluation experience no competitor will offer.

Tape is the safe strong alternative if the team has audio-engine experience; Proxy has the best impact story but the riskiest one-week build.

---

# Wildcard: **Envoy**

If the goal shifts from "win" to "redefine what judges think WebMCP is for," build Envoy. Every other submission will demonstrate an agent using *one* site's tools. Envoy demonstrates an agent using *several sites'* tools under revocable, receipted consent — the actual open-web future the standard exists to enable. It may collapse under its own weight in a week, but even a fragile version reframes the entire competition: it makes every single-site project look like a demo of the past.
