# WebMCP Challenge — Independent Ideation (10 concepts)

The through-line I'm hunting: interaction patterns that only exist when **a human and an agent share the same live application state through structured tools** — not "chatbot bolted onto a site," and not "agent replaces the user." Each idea tries a different pattern: shared canvas, asymmetric co-op, multi-party agent negotiation, agent-as-coach reading live state, dynamic tool surfaces, and so on.

---

## 1. Tandem — the pair-designed whiteboard

- **User & pain:** Solo founders and PMs who need to turn a messy idea into a structured artifact (wireframe, flowchart, service blueprint) but stall at the blank canvas; design tools have brutal learning curves.
- **Core human experience:** You sketch loosely and talk; the canvas is yours. Objects the agent creates appear as "ghost" elements you accept, nudge, or delete with one click. It feels like a pairing partner who never grabs your mouse.
- **Agent's role:** Reads the canvas as a scene graph, proposes structured additions (frames, connectors, annotations), reorganizes layout on request, and flags inconsistencies ("this flow has no error path").
- **WebMCP tools:** `get_canvas_scene()`, `propose_elements(elements[])` (creates ghosts, not commits), `apply_layout(strategy, selection)`, `annotate(element_id, note)`, `diff_since(revision)`.
- **Why WebMCP is essential:** A chatbot can't see or touch a canvas; DOM automation of a `<canvas>` element is essentially impossible. The scene-graph tool surface is the *only* viable way an agent can co-edit. The ghost-proposal pattern (agent writes to a staging layer, human commits) is a native WebMCP interaction, not a chat feature.
- **Demo moment:** Human scribbles four rough boxes, says "make this a proper onboarding flow with an error path" — ghost elements bloom onto the canvas, human drags one, accepts the rest. Under 60 seconds.
- **One-week scope:** tldraw or Excalidraw fork, scene-graph read/propose/commit tools, ghost layer, 3 layout strategies.
- **Biggest risk:** Layout quality — agent-proposed arrangements that look bad kill the magic instantly.
- **Scores:** Leverage 5 · Execution 4 · Impact 4 · Creativity 4

## 2. Quorum — meetings where every attendee brings an agent

- **User & pain:** Remote teams whose meetings produce vague notes and no decisions; the person facilitating can't also participate.
- **Core human experience:** A live meeting board (agenda, proposals, votes, action items). Humans talk and vote; each participant's agent joins the same room via WebMCP and works the board on their behalf — capturing their positions, drafting proposals, logging actions.
- **Agent's role:** Your delegate-clerk: it formalizes what you say into board objects, casts votes you've pre-authorized, and surfaces conflicts between attendees' stated constraints.
- **WebMCP tools:** `get_room_state()`, `submit_proposal(text, rationale)`, `cast_vote(proposal_id, position, on_behalf_of)`, `add_action_item(owner, task, due)`, `raise_objection(proposal_id, constraint)`, `subscribe_events()` (long-poll of room changes).
- **Why WebMCP is essential:** Multiple *independent* agents (each user's own ChatGPT/Chrome agent) converge on one shared authoritative state. There's no chatbot equivalent — the site is the neutral arbiter, and the tools are the protocol by which many agents coexist. This demos WebMCP's multi-tenant future, not single-agent automation.
- **Demo moment:** Two browser windows, two agents. One agent proposes; the other raises an objection based on its human's constraint; humans vote; a decision record materializes.
- **One-week scope:** One room, WebSocket state sync, five tools, two-participant demo, decision-log export.
- **Biggest risk:** Demoing multi-agent convincingly with today's single-agent clients; may need to fake the second participant carefully and honestly.
- **Scores:** Leverage 5 · Execution 3 · Impact 4 · Creativity 5

## 3. Sous — the recipe app that watches your pot

- **User & pain:** Home cooks juggling timing across dishes with wet hands; recipe sites are static scrolls that don't know where you are.
- **Core human experience:** A big-type, step-focused cooking view you advance by voice/tap. The agent runs alongside as expediter: it knows the *live* state (which step, which timers, what you substituted) because the app exposes it.
- **Agent's role:** Reads cook-state, answers "can I sub buttermilk?" *in context of step 4*, reflows the plan when you fall behind, sets and monitors timers in the app.
- **WebMCP tools:** `get_cook_state()`, `advance_step()/set_step(n)`, `create_timer(label, seconds)`, `substitute_ingredient(orig, replacement)` (rewrites downstream steps), `rescale(servings)`, `reflow_schedule(delay_minutes)`.
- **Why WebMCP is essential:** The value is the agent reading and mutating *session state* (timers, step position, substitutions) that lives in the app, not the page. A chatbot doesn't know your pot; browser automation can't restructure a recipe's dependency graph. Substitution-with-downstream-rewrite is a genuinely structured operation.
- **Demo moment:** Mid-cook: "I only have honey, and the rice is 10 minutes behind." Agent swaps the ingredient — steps visibly rewrite — and reflows every timer. The human never leaves the stove view.
- **One-week scope:** 5 hand-authored recipes as dependency graphs, cook-mode UI, the six tools, timer engine.
- **Biggest risk:** Recipe-graph authoring is fiddly; substitutions must not produce nonsense steps.
- **Scores:** Leverage 4 · Execution 5 · Impact 4 · Creativity 3

## 4. Counterpart — asymmetric co-op puzzle game (human sees, agent computes)

- **User & pain:** People curious what human-AI collaboration actually *feels* like; current agent demos are chores, not play.
- **Core human experience:** A puzzle game deliberately designed so neither party can win alone: the human sees the visual board (colors, spatial patterns, hidden-to-agent glyphs rendered only as pixels), while the agent has tools over the symbolic layer (graph structure, constraint solving, machine-only data). You talk to each other to fuse the two halves.
- **Agent's role:** Your co-player with a different sensory channel — it queries the symbolic layer, executes moves you can't compute, and asks *you* what it can't see.
- **WebMCP tools:** `get_symbolic_board()` (deliberately excludes visual-only info), `query_constraints(cells)`, `make_move(move)`, `mark_hypothesis(cells, label)` (renders for the human), `request_human_input(question)`.
- **Why WebMCP is essential:** The asymmetry is *engineered into the tool schema* — the agent's tools intentionally return a different projection of game state than the human's screen. That's impossible with screen-reading automation (which would see what the human sees) and meaningless in a chatbot. It's a statement about interface design for mixed teams.
- **Demo moment:** A level that's visibly unsolvable alone; human describes the color pattern, agent cross-references the constraint graph, marks a hypothesis on screen, human confirms, they win in 90 seconds.
- **One-week scope:** 5 levels, one mechanic, symbolic/visual split, hypothesis-marking overlay.
- **Biggest risk:** Puzzle design — asymmetry that feels contrived rather than delightful.
- **Scores:** Leverage 5 · Execution 4 · Impact 3 · Creativity 5

## 5. Ledgerline — the negotiation room for freelance contracts

- **User & pain:** Freelancers and small clients hashing out scope/rate/terms over email threads that lose track of what's agreed.
- **Core human experience:** A shared term-sheet document with fields (rate, milestones, IP terms, kill fee). Each side sets private guardrails ("floor $85/hr, must keep IP"); their agent negotiates *within* those bounds against the counterpart, and every concession appears as a tracked, human-ratified change.
- **Agent's role:** Bounded negotiator — proposes and counter-proposes term changes via tools, never exceeding your guardrails, and explains each trade to you before you ratify.
- **WebMCP tools:** `get_termsheet()`, `get_my_guardrails()` (server-enforced, per-party auth), `propose_change(field, value, rationale)`, `respond(change_id, accept|counter|reject)`, `ratify(change_id)` (human-click required, tool only requests it), `get_negotiation_log()`.
- **Why WebMCP is essential:** The *site* enforces guardrails and turn-taking server-side, so an agent literally cannot offer below your floor — trust lives in the tool layer, not in prompt engineering. Two opposing agents share one arbiter. No chatbot or automation replicates enforceable, auditable bounded delegation.
- **Demo moment:** Two panes: agents exchange three counter-offers in seconds, one attempt below the floor is rejected *by the server*, humans each click "ratify," and a clean contract summary appears.
- **One-week scope:** Term sheet with 6 fields, two-party rooms, guardrail enforcement, ratification flow, negotiation log.
- **Biggest risk:** Negotiation between two LLM agents can look scripted; needs real guardrail enforcement to feel legitimate.
- **Scores:** Leverage 5 · Execution 4 · Impact 5 · Creativity 4

## 6. Wayfare — group trip planning where agents advocate

- **User & pain:** Friend groups planning trips in chat chaos; the loudest person wins and constraints get forgotten.
- **Core human experience:** A shared itinerary board. Each traveler privately tells their own agent their budget, mobility limits, and must-dos; agents advocate on the board, and conflicts render as visible tensions the humans resolve together.
- **Agent's role:** Your travel advocate — files constraints, scores proposed itinerary items against them, proposes alternatives when you're getting a bad deal.
- **WebMCP tools:** `get_itinerary()`, `file_constraint(type, value, privacy_level)`, `propose_item(day, activity, cost)`, `score_item(item_id, fit, reason)`, `flag_conflict(item_id, constraint_ref)`, `commit_item(item_id)` (needs quorum of human confirms).
- **Why WebMCP is essential:** Same multi-agent-shared-state argument as Quorum, plus privacy asymmetry: your constraint's *existence* is visible on the board while its value stays private to your agent — a structure only a tool layer with per-party auth can provide.
- **Demo moment:** Three constraints filed; agent proposes a day plan; a red conflict badge appears ("exceeds someone's budget"); agent proposes a cheaper swap; group commits.
- **One-week scope:** One trip, 3 mock travelers, static activity catalog (no live booking APIs), conflict engine.
- **Biggest risk:** Overlaps with the "agent books travel" cliché; must keep focus on multi-party advocacy, not booking.
- **Scores:** Leverage 4 · Execution 4 · Impact 4 · Creativity 3

## 7. Redline — every-edit-is-a-proposal document review

- **User & pain:** Anyone who's pasted a doc into a chatbot and gotten back a rewritten wall of text they can't audit; professionals (lawyers, editors) need change-level control.
- **Core human experience:** A document editor where the agent can *only* produce redlines — atomic tracked changes with rationales — never direct edits. You review a change queue like a PR, accepting or rejecting each, and the agent learns from the pattern of your rejections mid-session.
- **Agent's role:** Reviewer/editor constrained to the proposal channel; queries your acceptance history to calibrate ("you've rejected all my tone changes; I'll stop proposing those").
- **WebMCP tools:** `get_document(structure=paragraphs)`, `propose_edit(range, replacement, category, rationale)`, `get_review_state()` (accept/reject history), `withdraw_proposal(id)`, `summarize_open_proposals()`.
- **Why WebMCP is essential:** The app *structurally forbids* direct mutation — the tool schema is the safety model. Chat gives you paste-back slop; automation typing into a contenteditable gives you untracked mutations. Here the granular accept/reject loop, and the agent *reading its own rejection rate*, are the product.
- **Demo moment:** Load a messy doc, agent files 12 categorized redlines in seconds, human rejects two tone edits, agent visibly says "withdrawing my remaining tone proposals" and does.
- **One-week scope:** ProseMirror editor, proposal queue UI, five tools, category-learning behavior.
- **Biggest risk:** Feels close to Google Docs suggestions; the self-calibration loop must land or it reads as a clone.
- **Scores:** Leverage 5 · Execution 4 · Impact 4 · Creativity 3

## 8. Stagehand — live-event Q&A and crowd sensing for presenters

- **User & pain:** Speakers and teachers can't present *and* triage a flood of audience questions/reactions.
- **Core human experience:** Audience submits questions/reactions on their phones; the presenter sees only a clean "next up" card. Their agent works the backstage: clustering duplicates, detecting confusion spikes tied to the current slide, queuing the best question.
- **Agent's role:** Backstage producer with tools over the live submission stream and the presenter's deck position.
- **WebMCP tools:** `get_stream(since)`, `cluster_questions(ids, label)`, `promote_to_stage(cluster_id)`, `get_deck_position()`, `post_presenter_note(text)` ("30% confused on this slide — recap?"), `dismiss(ids)`.
- **Why WebMCP is essential:** A high-velocity real-time stream plus a presenter who cannot look away — the agent must act on structured live state with millisecond-cheap calls, and its outputs (promotions, notes) render inside the presenter's HUD. No chat window fits in this loop.
- **Demo moment:** Simulated 40-person audience floods questions; presenter keeps talking; agent clusters, promotes one question, and posts "confusion spike on slide 3" — presenter glances and adapts.
- **One-week scope:** Audience page, presenter HUD, simulated crowd generator, six tools.
- **Biggest risk:** Needs believable crowd simulation; latency of agent tool loops vs. live-feel.
- **Scores:** Leverage 4 · Execution 4 · Impact 4 · Creativity 4

## 9. Greenhouse — a personal finance app whose tools are the permission system

- **User & pain:** People who want AI help with money but will never paste bank data into a chatbot.
- **Core human experience:** A budgeting app where you visually flip switches on *which tools* your agent gets — `read_totals` yes, `read_transactions` no, `move_money` never. The tool surface itself is the consent UI; the agent's capabilities visibly change as you toggle.
- **Agent's role:** Financial coach operating strictly within the granted tool set; when it needs more, it must call `request_capability(reason)` and you see a consent prompt.
- **WebMCP tools:** `read_category_totals()`, `read_transactions(range)` (grantable), `simulate_budget(changes)` (sandbox, always allowed), `create_rule(condition, action)` (draft-only), `request_capability(tool, reason)`.
- **Why WebMCP is essential:** This makes *dynamic tool registration* the product thesis: the site registering/revoking tools at runtime **is** the permission model. That concept doesn't exist in chatbots (all-or-nothing paste) or automation (agent sees everything the DOM shows). It's an argument for what WebMCP uniquely enables: legible, revocable, per-capability trust.
- **Demo moment:** Agent gives generic advice; human flips on `read_transactions`; advice sharpens instantly and cites specifics; human flips it off; agent visibly loses the capability mid-conversation.
- **One-week scope:** Seeded demo finances, toggle panel driving live tool (de)registration, capability-request flow.
- **Biggest risk:** Whether current WebMCP clients handle runtime tool-list changes gracefully.
- **Scores:** Leverage 5 · Execution 4 · Impact 5 · Creativity 4

## 10. Fieldnote — citizen-science observation logging with an agent QA partner

- **User & pain:** Volunteer naturalists produce messy, inconsistent observation data that scientists then can't use.
- **Core human experience:** A mobile-friendly logging app (photo, location, species guess). As you log, your agent cross-checks each entry against the structured protocol — flagging impossible ranges, missing fields, misidentifications — and drafts corrections you confirm in the field.
- **Agent's role:** Real-time data QA and protocol coach, reading your draft observation and the project's schema/valid-range tools.
- **WebMCP tools:** `get_protocol_schema()`, `get_draft_observation()`, `validate(draft)` → structured issues, `suggest_correction(field, value, evidence)`, `submit_observation()` (human-confirmed), `query_nearby_records(radius)`.
- **Why WebMCP is essential:** The QA loop requires the agent to read the project's live schema and the in-progress form state, and to write field-level suggestions back into the form — a structured round-trip no chatbot has and DOM automation would do brittle-ly at best.
- **Demo moment:** Log a "robin" 500 miles out of range; agent flags it against `query_nearby_records`, suggests the likely lookalike species, human taps accept, clean record submits.
- **One-week scope:** One mock project schema, seeded regional dataset, logging UI, validation tools.
- **Biggest risk:** Impact story depends on a domain judges may not care about; lower wow-ceiling.
- **Scores:** Leverage 4 · Execution 4 · Impact 4 · Creativity 3

---

## Strongest three, and the non-obvious insight behind each

**1. Ledgerline (negotiation room).** The insight: WebMCP's deepest value isn't giving agents *access* — it's giving sites the power to **enforce limits on agents server-side**. When the guardrail lives in the tool layer, delegation becomes trustworthy in a way no prompt can be, and *two opposing agents sharing one arbiter* is an interaction pattern nobody has seen in a chatbot. It also nails "Potential Impact": freelance contract friction is a real, specific, monetizable pain.

**2. Greenhouse (capability-toggle finance).** The insight: **the tool list itself is a user interface.** Everyone treats tool registration as plumbing; making runtime grant/revoke the visible consent model reframes WebMCP as the answer to the biggest blocker for agents in sensitive domains — trust. The demo of an agent's competence visibly rising and falling as switches flip is instantly legible to a judge.

**3. Counterpart (asymmetric co-op game).** The insight: because the site authors the tool schema, it can **deliberately give the agent different senses than the human** — not the same page, a different projection of the same state. That inverts the whole "agent mimics a user" framing and is the purest possible demonstration that WebMCP enables interactions pixels never could. Games are also the most watchable sub-3-minute demos.

## The one I'd build to win: **Ledgerline**

Strategic rationale: it scores at the ceiling on the tie-break criterion (WebMCP Leverage) because the WebMCP layer isn't the integration — it *is* the product: server-enforced guardrails, per-party tool auth, turn-taking, and human ratification are all tool-layer mechanics that are demonstrably impossible with a chatbot or screen automation. It has the most credible impact story of the ten (real money, real audience, obvious willingness to pay), a naturally dramatic two-pane demo that lands in ninety seconds, and a one-week scope with no external API dependencies or hard ML problems. Its main risk (staged-looking negotiation) is directly answerable in the demo by showing the server rejecting an out-of-bounds offer live.

## Wildcard: **Polis — a town that runs on agents**

A persistent shared world — a small simulated town with an economy, land, and a legislature — where every participant is a human-agent pair. Humans set values and vote; agents work continuously through WebMCP tools (`survey_land`, `file_ordinance`, `trade(resource, terms)`, `cast_delegated_vote`, `petition(text)`) whenever their human opens the tab. The town's laws are themselves editable *through* the tools, so the community can vote to change what tools exist — governance of the tool surface, by the tool surface. It's probably too much for a week, and multi-visitor liveness is genuinely hard — but a world whose physics is a WebMCP schema, evolving under collective human direction, is the kind of artifact that would define what "humans and agents building the open web together" means, and would be cited long after the hackathon ends.
