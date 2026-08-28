# WebMCP Challenge — 10 Independent Product Concepts

## 1. Counterpart — the negotiation table for peer-to-peer deals

**User & problem:** People buying/selling used goods (cars, furniture) and freelancers scoping gigs. Most people hate haggling, leave money on the table, or ghost out of discomfort. Negotiation is the most stressful part of peer commerce and the least tooled.

**Core human experience:** A clean "deal room" showing the current offer on the table — price, pickup window, condition guarantees — with a prominent Approve / Reject. You privately set your walk-away limit and priorities; the haggling happens in a live feed you watch like a sports match.

**Agent's role:** Your personal negotiator. It proposes and counters within your private bounds, argues from comparable listings, concedes on terms you marked cheap, and never reveals your limit.

**WebMCP tools:**
- `open_deal(item, initial_terms)`
- `propose_offer(deal_id, terms, rationale)`
- `counter_offer(deal_id, terms, rationale)`
- `accept_offer(deal_id)` — locks state, notifies both humans
- `set_private_bounds(limit, flexible_terms)` — never exposed to the counterparty
- `fetch_comparables(query)` — site-curated pricing data

**Why WebMCP is essential:** Negotiation is a *protocol*, not a conversation. Offers must be schema-validated, timestamped, ordered, and semi-binding. A chatbot cannot commit state; browser automation cannot reliably express "counter at $340 with Friday pickup and a 30-day return promise." The site is the referee, and both agents must speak schema to play.

**Demo moment:** Two browser windows side by side. Two agents haggle over a vintage motorcycle in real time — the seller's agent cites comparables, the buyer's agent trades a faster pickup for a lower price. Deal closes at a number neither human would have had the nerve to propose. ~80 seconds of pure tension and resolution.

**One-week scope:** Single-item deal rooms, static comparables dataset, both agents server-side (same model, different private bounds), no payments — a "handshake" ends the deal.

**Largest risk:** Agent-vs-agent haggling degenerating into noise or instant convergence. Needs pacing, turn limits, and concession choreography so it reads as drama.

| Leverage | Execution | Impact | Creativity |
|---|---|---|---|
| 5 | 4 | 4 | 4 |

---

## 2. Duet — a loop studio you play *with* your agent

**User & problem:** Hobbyist music makers intimidated by DAWs. They have taste but not technique; existing AI music tools replace the human instead of collaborating with them.

**Core human experience:** An 8-track loop grid and mixer. You place blocks, mute tracks, hum a melody into a voice memo. Every change the agent makes appears live in the same UI you're touching — you keep what you like, mute what you don't.

**Agent's role:** Co-producer. It harmonizes your hummed melody, generates arrangement variations, balances levels, and re-voices sections around your mutes — all through tools, all audible within a bar or two.

**WebMCP tools:**
- `add_loop(track, pattern, bars)`
- `set_param(track, param, value)` — volume, pan, filter, swing
- `replace_section(section_id, style)`
- `get_arrangement()` — full structured state
- `harmonize(melody_id, key, voicing)`
- `render_preview(from_bar, to_bar)`

**Why WebMCP is essential:** The action space is continuous and high-dimensional — dozens of parameters × tracks × bars. Pixel automation fails combinatorially; a chatbot can't hold arrangement state or hear the result. Tools give the agent precise, undoable, *musical* semantics at the right bandwidth. This is the strongest possible answer to "why not a chatbot."

**Demo moment:** You hum four bars. The agent builds three arrangements live; you mute the drums and it rebalances the mix around the hole you made. Export a 30-second track. Audio makes the demo video sell itself.

**One-week scope:** Web Audio loop engine, pentatonic-safe deterministic pattern generator (tasteful by construction), 6 tools, WAV export.

**Largest risk:** Musical quality. Mitigate by staying loop/pattern-based rather than freeform synthesis.

| Leverage | Execution | Impact | Creativity |
|---|---|---|---|
| 5 | 4 | 3 | 4 |

---

## 3. CommonPurse — participatory budgeting where every citizen has an analyst

**User & problem:** City councils and community orgs running participatory budget votes. Residents disengage not from apathy but because they cannot evaluate trade-offs — so a loud few decide.

**Core human experience:** A map and budget bars. You drag allocations and instantly see projected outcomes (potholes fixed, trees planted, shelter beds funded). You state priorities in plain language; the machinery handles feasibility.

**Agent's role:** Personal policy analyst. It checks your allocation against legal constraints, simulates outcomes, drafts your public comment — and finds other residents whose priorities are compatible, assembling a coalition budget.

**WebMCP tools:**
- `get_budget_state()`
- `set_allocation(category, amount)`
- `simulate_outcomes(allocation)`
- `list_constraints()` — matching-fund rules, minimums, earmarks
- `propose_coalition_budget(priorities)` — agent-to-agent via the site
- `submit_comment(text)`

**Why WebMCP is essential:** The budget is a live constraint system shared by all participants. Agents need schema-level reads, writes, and simulation access — not screenshots. Coalition formation is agent-to-agent negotiation *through* the site's tools, with the site enforcing feasibility.

**Demo moment:** A resident says "safe streets, under $2M total." The agent assembles a compliant budget, simulates it, finds three neighbors with compatible priorities, and presents a merged coalition proposal live — individual preference becoming collective power in 60 seconds.

**One-week scope:** One fictional city with a realistic dataset, fixed categories, transparently simple linear outcome models, comment wall.

**Largest risk:** Civic impact claims feeling hand-wavy. Keep the simulation models visibly simple and honest.

| Leverage | Execution | Impact | Creativity |
|---|---|---|---|
| 4 | 4 | 5 | 4 |

---

## 4. Plan-B — the travel board that rebooks itself

**User & problem:** Leisure travelers hit by delays and cancellations. Rebooking under stress — across airlines, hotels, and companions — is miserable and error-prone.

**Core human experience:** A timeline of your trip. When disruption hits, the board presents three ranked recovery plans with total cost and arrival impact, and a single Approve button.

**Agent's role:** Monitors your itinerary against a disruption feed, searches inventory, and *stages* complete atomic rebooking packages — never committing without your tap.

**WebMCP tools:**
- `get_itinerary()`
- `search_alternatives(segment_id, constraints)` — budget, arrive-by, seat class
- `price_option(option_id)`
- `stage_rebooking(option_id)` — atomic multi-leg package
- `commit_rebooking(staged_id)` — human-confirmed only
- `notify_companion(message)`

**Why WebMCP is essential:** Rebooking is a transactional commitment under constraints. The agent must query structured inventory and stage atomic multi-leg changes — exactly the brittle browser-automation hell WebMCP exists to replace. The stage/commit split is a trust pattern only structured tools enable.

**Demo moment:** A "chaos button" triggers a simulated storm mid-demo. The agent replans a four-leg trip in seconds; the human approves with one tap; the board re-renders. Ticking-clock drama.

**One-week scope:** Mock inventory and disruption feed with scenario scripting, one itinerary, full stage→commit flow.

**Largest risk:** Without real inventory it's an honest simulation — the framing must make the *pattern* the product.

| Leverage | Execution | Impact | Creativity |
|---|---|---|---|
| 4 | 4 | 4 | 3 |

---

## 5. Open Table — a tabletop RPG where the site is the rules engine

**User & problem:** Friend groups who want D&D-like play but have no one willing to be the forever-DM, and can never align schedules for prep-heavy campaigns.

**Core human experience:** An illustrated scene, your character sheet, real dice animations. You declare intent in natural language — "I pick the lock while Bruna distracts the guard" — and watch the world respond consistently.

**Agent's role:** The world. It adjudicates rules, plays every NPC, tracks state, and generates consequences — exclusively through tools, so the shared world can never desync or be hallucinated away.

**WebMCP tools:**
- `declare_action(actor, intent, targets)`
- `resolve_check(actor, skill, difficulty)` — visible dice, seeded
- `get_world_state(region)`
- `update_world_state(patch)`
- `spawn_npc(profile)`
- `log_event(entry)` — the campaign chronicle

**Why WebMCP is essential:** A consistent shared world with rules adjudication *is* a structured tool surface. A chatbot hallucinates state; there is no DOM to scrape — the tools are literally the game. This is WebMCP as game engine, a category that doesn't exist yet.

**Demo moment:** Three players declare simultaneous actions; the agent resolves them with visible dice, the world state mutates, and an NPC references a slight from ten minutes earlier. "The site is the DM's screen."

**One-week scope:** One hand-authored scenario, d20-lite rules, text plus static art, up to four players.

**Largest risk:** Narrative quality is model-dependent. Keep the rules crunchy so structure carries the fun.

| Leverage | Execution | Impact | Creativity |
|---|---|---|---|
| 5 | 3 | 3 | 4 |

---

## 6. Sous — the recipe that adapts while you cook

**User & problem:** Home cooks mid-recipe who hit a missing ingredient, a doubling request, or a timing collision — and abandon the recipe or ruin the dish.

**Core human experience:** A big-type, glanceable step view. You say "no cilantro" or "dinner's at seven" and the plan on screen reorganizes itself, timers included.

**Agent's role:** Live line cook. It rewrites steps, rescales quantities, and retimes the schedule against the live session state — the same state you're looking at.

**WebMCP tools:**
- `get_session_state()` — current step, active timers, pantry deltas
- `substitute_ingredient(ingredient, replacement)`
- `rescale(factor)`
- `retime_plan(anchor_step, ready_by)`
- `start_timer(label, seconds)`
- `advance_step()`

**Why WebMCP is essential:** A recipe in progress is a dependency graph — timings, temperatures, quantities. Substitution and rescaling are graph operations, not text edits. A chatbot's rewritten recipe instantly desyncs from the screen; tools keep human and agent on one shared, structured state.

**Demo moment:** "I only have chicken thighs, and guests arrive at seven." The agent rewrites the plan, retimes every step, and starts the first timer — all visibly, in seconds.

**One-week scope:** Five recipes modeled as graphs, a vetted substitution table, timer engine, voice optional.

**Largest risk:** Food-safety edge cases in substitution. Constrain to a curated substitution table.

| Leverage | Execution | Impact | Creativity |
|---|---|---|---|
| 4 | 4 | 3 | 3 |

---

## 7. The Money Date — a guided finance conversation for couples

**User & problem:** Couples who fight about money or avoid it entirely. The numbers aren't the hard part — the conversation is.

**Core human experience:** A shared dashboard of (mock) finances and a structured conversation path: values first, numbers second. Both partners sit at one screen; the pacing keeps turn-taking fair.

**Agent's role:** Neutral mediator. It records each partner's stated priorities privately, runs scenarios on the shared numbers, and proposes compromise plans that fund both people's top goal.

**WebMCP tools:**
- `get_shared_finances()`
- `record_priority(person, priority, weight)` — private per-person state
- `run_scenario(plan)`
- `propose_compromise(constraints)`
- `flag_hot_topic(topic)` — adjusts pacing, invisible to the couple
- `schedule_checkin(date)`

**Why WebMCP is essential:** Mediation requires reading and writing a shared quantitative model both humans see, running scenarios against it, *and* managing private per-person state — a multi-party structured tool surface. A chatbot has no shared model; automation can't represent "her priorities, his priorities, our numbers" as distinct access scopes.

**Demo moment:** Partners state conflicting goals (save vs. travel). The agent runs both scenarios live, then proposes a split funding both — and two humans tap "I can live with this." Emotionally resonant and instantly legible.

**One-week scope:** Mock data only, two seats at one screen, three scenario types, no account linking.

**Largest risk:** Emotional sensitivity — tone must be impeccable and the mock data clearly fictional.

| Leverage | Execution | Impact | Creativity |
|---|---|---|---|
| 4 | 4 | 4 | 4 |

---

## 8. Culture — a companion for living things you grow

**User & problem:** Home bakers whose sourdough starters keep dying. They can't interpret signals, can't keep schedules, and generic advice doesn't fit *their* jar.

**Core human experience:** A timeline of your jar. You log feedings and observations; the board shows predicted rise windows and a care schedule that adapts to what actually happened.

**Agent's role:** Keeper of a living model. It interprets your logs, adjusts the feeding schedule, predicts activity windows, and warns you *before* failure — over days and weeks.

**WebMCP tools:**
- `log_observation(type, value, note)`
- `get_culture_model()` — the persistent quantitative state
- `adjust_schedule(feeding_plan)`
- `predict_activity_window()`
- `diagnose(symptoms)`
- `set_reminder(when, what)`

**Why WebMCP is essential:** The product is a persistent, cumulative model of a living system that human and agent act on together over days — slow collaboration. Chat resets every session; tools make every observation and schedule change structured and compounding. This showcases WebMCP's long-horizon potential nobody else will touch.

**Demo moment:** Compressed-time mode: log a feeding, watch the agent adjust the schedule and predict the window, then jump to "day 4 — it doubled." Warm, memorable, unlike anything else in the competition.

**One-week scope:** Sourdough only, simple growth model, manual logging, email reminders, time-lapse demo mode.

**Largest risk:** Value accrues over days — genuinely hard to demo honestly in three minutes. The simulation mode must carry it.

| Leverage | Execution | Impact | Creativity |
|---|---|---|---|
| 3 | 4 | 3 | 4 |

---

## 9. Agora — a debate room where arguments must hold up

**User & problem:** Classrooms, community boards, and teams making contested decisions. Discussion degrades into threads; the loudest voice wins; nothing is resolved.

**Core human experience:** A living argument map. You attach claims and evidence to nodes; the structure — what supports what, what's unanswered — is always visible.

**Agent's role:** Dialectic referee. It flags unsupported claims, detects circular reasoning, drafts steelmen of the minority position, and compresses the whole debate into a decision brief.

**WebMCP tools:**
- `add_claim(parent_node, text, evidence_link)`
- `challenge_claim(node, relation, reason)` — rebut / undercut
- `get_argument_tree()`
- `find_unsupported_claims()`
- `steelman(node)`
- `draft_decision_brief()`

**Why WebMCP is essential:** The argument graph is a shared structured artifact with formal semantics. The agent's value is graph operations with consistency guarantees — impossible over pixels, vacuous as a chatbot with no shared map. Crucially, the agent is constrained to *structural* checks, never truth judgments.

**Demo moment:** A live three-person debate ("should our town ban leaf blowers?"). The agent flags a circular claim, steelmen the minority view, and produces a fair brief in the final ten seconds.

**One-week scope:** One room, Dung-style support/attack relations, evidence as links only — no external fact database.

**Largest risk:** Referee judgments looking arbitrary. Keep the agent strictly structural.

| Leverage | Execution | Impact | Creativity |
|---|---|---|---|
| 4 | 3 | 4 | 4 |

---

## 10. Plus-One — the first cross-site agent handshake *(wildcard)*

**User & problem:** Anyone planning a multi-vendor event — a birthday dinner needs a venue *and* a cake *and* they must agree on the same night. Today that's a dozen tabs and phone calls.

**Core human experience:** You state one intent: "private dinner for 12, next Friday, around $600." Two independent websites — a restaurant with a private room and a bakery — each render their own normal human UI, while your agent works both at once. You get a single combined plan to approve.

**Agent's role:** Orchestrator across *two separate WebMCP surfaces*. It holds a room reservation at one site while confirming a cake at the other, releasing the hold if the pair can't be completed — a poor-man's two-phase commit across the open web.

**WebMCP tools (site A — venue):** `check_availability(date, party_size)`, `hold_room(slot, ttl_seconds)`, `confirm_hold(hold_id)`, `release_hold(hold_id)`
**WebMCP tools (site B — bakery):** `get_catalog(dietary)`, `quote_cake(spec, date)`, `place_order(quote_id)`, `cancel_order(order_id)`

**Why WebMCP is essential:** This is the entire thesis of the standard: agents composing *multiple* sites' structured tools into one transaction, with holds, TTLs, and rollback — semantics that cannot exist over pixels and have no meaning in a chatbot. It reframes WebMCP from a per-site feature into web infrastructure.

**Demo moment:** One sentence of intent; two sites' UIs visibly update as the agent coordinates them; one approval; dinner and cake locked for the same night. Then the failure case: no cake available — the room hold releases automatically. That's the "oh, *that's* what the agentic web means" moment.

**One-week scope:** Two small sites (this is the cost), hold/TTL semantics, scripted catalog, one orchestrating agent.

**Largest risk:** Building two credible sites in a week, and cross-site orchestration stretching beyond what the current spec contemplates. The payoff is being the only submission that demonstrates composability.

| Leverage | Execution | Impact | Creativity |
|---|---|---|---|
| 5 | 2 | 4 | 5 |

---

# Selections

## Strongest three

### 1. Counterpart
**Non-obvious insight:** WebMCP's killer feature isn't agents acting *on* websites — it's websites acting as *referees between* agents. A schema is a contract; the site is escrow for meaning. Negotiation is the smallest, most visceral domain where this matters, and it naturally produces the two-sided, agent-to-agent demo that makes the standard's purpose obvious in 90 seconds. It also maximally exploits the tie-break criterion: every single interaction is a tool call.

### 2. Duet
**Non-obvious insight:** The strongest "WebMCP is essential" argument is *dimensionality*. When the action space is continuous, stateful, and high-bandwidth (mixing, arranging), pixel automation fails combinatorially and chatbots fail on state. Tools are the only interface with the right precision *and* bandwidth. Bonus asymmetry: taste is fast to express (mute, keep) but slow to specify — so the human stays genuinely necessary, which is exactly the "humans and agents together" theme.

### 3. CommonPurse
**Non-obvious insight:** Agents' best civic use isn't answering questions — it's *checking feasibility*. People don't disengage from participatory processes out of apathy; they disengage because they can't evaluate trade-offs. An agent with simulation tools converts values into valid allocations, and coalition-finding converts isolated preferences into collective power. That's a specific, credible, demonstrated impact story — the highest-scoring Impact case in the set.

## The one to build to win: **Counterpart**

WebMCP Leverage is the first tie-break, and Counterpart is the purest expression of the standard: the tool schema *is* the product, the site is a protocol referee, and both sides of every transaction are structured tool calls — no decorative integration possible. The demo is inherently theatrical (two agents, visible stakes, a clock, a resolution) and legible to a judge who never touches the live URL. Scope is genuinely one-week: no media generation, no external data dependencies, just state, protocol, and choreography. It scores no lower than 4 on any criterion while maxing the tie-breaker. Duet is the insurance policy if the team has strong audio chops; Counterpart is the higher-floor, higher-ceiling play.

## The wildcard: **Plus-One**

Cross-site agent composition is deliberately ambitious — two sites, hold/TTL semantics, orchestrated rollback — and execution risk is real (hence Execution 2). But every other plausible submission treats WebMCP as a feature of one site. Plus-One treats it as the fabric of the web: the first demo of an agent completing a transaction *across* independent WebMCP surfaces with atomicity semantics. If it works, it doesn't just score on Creativity — it redefines what judges believe the standard is for.
