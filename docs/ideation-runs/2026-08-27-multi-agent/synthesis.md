# Cross-agent WebMCP idea synthesis

## Method

Seven independent agents received the same neutral brief containing only the official challenge goal, judging rubric, delivery constraints, and a technical definition of WebMCP. They were isolated from the repository, the earlier conversation, the web, and each other. Four Grok runs, two Kimi K3 runs, and one Fable run produced ten ideas each.

All seven commands exited successfully. The raw outputs are linked from [README.md](README.md).

This synthesis applies two corrections to simple majority voting:

1. **Convergence is evidence of product fit, but also evidence that competitors may discover the same pattern.** A common idea receives a saturation penalty.
2. **A unique idea is not automatically good.** It still needs a crisp WebMCP contract, a legible three-minute demo, real user pain, and credible one-week execution.

## What the agents collectively discovered

The most persuasive WebMCP products do not treat tools as remote-control buttons. They use the tool schema as the product's **law**:

- typed moves over shared state;
- server-enforced permissions and bounds;
- human-only locks, ratification, and attestation;
- atomic mutations that keep several representations consistent;
- action vocabularies that generic chat and pixel automation cannot safely reproduce.

The strongest human/agent split is usually complementary rather than supervisory: the human supplies taste, values, embodied observations, or authority; the agent supplies search, calculation, consistency, orchestration, or procedural precision.

## Convergence map

### Structured negotiation and the website as referee

This was the strongest convergence by far:

- Fable: **Ledgerline**
- Kimi 1: **Souk**
- Kimi 2: **Counterpart**
- Grok 2: **Opposite Counsel**
- Grok 3: **Redline Room**
- Grok 4: **The Redline Room**

Five agents selected a negotiation concept in their strongest three, and three selected it as the idea to build. The durable insight is excellent: the site is an arbiter between parties or agents, and WebMCP tools represent enforceable offers, counters, bounds, locks, and ratification.

**Interpretation:** probably the strongest generic WebMCP product pattern, but no longer an original idea by itself. A submission must choose an unusually specific market or negotiation object and visibly enforce something a chat transcript cannot.

### Civic chambers and editable public procedure

Four Grok runs independently chose a civic chamber/hearing as their wildcard; Fable proposed **Polis**, while Kimi proposed **CommonPurse** and debate/governance concepts.

The shared insight is that public procedure can become an agent-accessible protocol while humans retain values, testimony, and the gavel.

**Interpretation:** extremely aligned with “future of the open web” and highly memorable, but concurrency, moderation, legitimacy, identity, and procedural scope make it a risky one-week bet.

### Creative state manipulation

Music and media co-creation recurred as **Tape**, **Duet**, **The Mix Chair**, **Proxy**, and related stage/production tools. The common strength is a high-dimensional artifact whose state cannot be controlled credibly through chat or pixel automation.

**Interpretation:** excellent WebMCP proof and an inherently good video, but browser audio/video pipelines and asset quality are execution traps.

### Hands-busy procedural collaboration

**Repair Chorus** appeared once, while three non-Grok agents independently produced a cooking concept named **Sous**. The common pattern is an agent operating a structured procedure while a human provides physical observations and performs the work.

**Interpretation:** the pattern is strong; generic cooking is likely saturated. Repair, inspection, lab work, field work, or maintenance offer fresher positioning.

### Evidence, claims, and integrity-preserving documents

**Sourced**, **Palimpsest**, **The Proof Wall**, **Foil**, and **The Dissent Board** make claims/evidence/objections into typed objects. Their key advantage is that generated prose becomes a projection of structured provenance rather than an unaccountable blob.

**Interpretation:** achievable and valuable, but the visual artifact must dominate the demo or it will look like another AI editor.

## Ranked shortlist

### 1. Setback Studio

Two separate Grok runs independently produced nearly the same concept and both chose it as the idea to build.

**Product:** a homeowner places a shed, studio, fence, deck, or small ADU on a visual lot. The agent checks a deliberately narrow encoded zoning profile, overlays violations, requests human attestation for physical facts, and assembles a permit packet.

**Core tools:** `place_structure`, `check_setbacks`, `set_property_fact`, `ask_human_to_attest`, `generate_packet_page`, `export_filing_bundle`.

**Why it ranks first:** the shared canvas, legal constraint engine, human-attested site facts, and generated packet form one coherent object. The ten-second visual—red violation, agent-guided correction, green envelope, printable packet—is unusually strong. It can be built without external APIs by using one fictional or carefully scoped jurisdiction and three canned lots.

**Main risk:** misleading simplification of real planning law. Frame it explicitly as an encoded subset or permit-preflight prototype, never definitive legal advice.

### 2. Repair Chorus

**Product:** a calm, visual repair job ticket for one equipment family. The human is the sensor and the hands; the agent records observations, selects a procedure branch, enforces safety holds, manages parts, and closes the repair.

**Core tools:** `begin_procedure`, `record_observation`, `advance_step`, `mark_safety_hold`, `order_part`, `close_repair`.

**Why it ranks highly:** it avoids the crowded knowledge-worker-copilot genre. The physical before/after demo is memorable, WebMCP is the safe procedure rather than decoration, and a single 8–12-step repair tree is realistic in one week.

**Main risk:** a shallow decision tree will feel fake. The procedure, safety branch, and visual job ticket need to be genuinely coherent.

### 3. Sourced

**Product:** a reporting desk where the article and a stubborn claim/evidence graph stay synchronized. The agent extracts claims, binds sources, flags contradictions, rewrites only marked spans, and refuses to erase unresolved red claims.

**Core tools:** `extract_claims`, `attach_source`, `set_claim_status`, `rewrite_span`, `flag_contradiction`, `freeze_for_copyedit`.

**Why it ranks highly:** it is a complete one-week product with strong impact and very readable repository code. WebMCP operations preserve argument integrity across prose and graph state.

**Main risk:** it resembles a generic AI editor unless claim identity, killed claims, contradiction state, and evidence-preserving rewrites are visually central.

### 4. Ledgerline / Counterpart

**Product:** a two-party negotiation table where each side sets private bounds and delegates structured offers to an agent. The site enforces bounds, turn-taking, locks, and human ratification.

**Core tools:** `get_termsheet`, `propose_change`, `package_trade`, `respond`, `run_walkaway_check`, `ratify`.

**Why it ranks highly:** this is the clearest expression of “the website as protocol referee.” It produces a theatrical two-agent demo and maximizes WebMCP leverage without external services.

**Why it is not first:** six of seven agents independently found this territory. A generic freelance contract or marketplace negotiation may also occur to many hackathon entrants. Winning requires a distinctive domain, asymmetric information, enforceable consent, or a novel shared object.

### 5. Office Hours, Multiplied

**Product:** a teacher governs a classroom of student agents. Hint tiers, checks, misconception reporting, and answer access are dynamic capabilities controlled by the teacher.

**Core tools:** `submit_step`, `check_work`, `request_hint`, `raise_misconception`, `set_hint_tier`, `freeze_tools`.

**Why it ranks highly:** the tool list itself becomes a lesson plan. It is an unusually strong model of many agents sharing a human-governed product and earned perfect self-scores across the rubric.

**Main risk:** it needs a convincing teacher view plus several student/agent perspectives. Scope must be frozen to one small assignment, two simulated students, and one live agent.

### 6. Proxy

**Product:** a small but real professional media editor whose full action layer is exposed as WebMCP tools, enabling a motor-impaired or hands-busy user to operate it through an agent while the normal visual interface remains available.

**Core tools:** `import_media`, `split_clip`, `move_clip`, `set_transition`, `auto_caption`, `export_video`.

**Why it ranks highly:** “accessibility by architecture, not retrofit” is a powerful and original standard-adoption story. Canvas/timeline software is a domain where structured tools are plainly superior to DOM automation.

**Main risk:** in-browser media processing can consume the entire week. A narrower audio, slide, or diagram editor may preserve the insight with lower execution risk.

### 7. The Dissent Board

**Product:** a high-stakes decision board where an agent has a closed vocabulary for opposition: objections, missing-evidence flags, alternative framings, criterion scores, and a durable dissent brief.

**Core tools:** `pin_claim`, `attach_evidence`, `file_objection`, `score_criterion`, `generate_dissent`, `seal_decision`.

**Why it ranks highly:** the agent is not a generic helper. Structured dissent becomes a visible institutional role, and every WebMCP tool call becomes a card on the board.

**Main risk:** without a specific decision domain and a polished “sealed record,” it can look like an AI debate toy.

### 8. Caption Parliament

**Product:** a caption editor where the human owns meaning and the agent owns mechanics. Human-authored wording can be locked while the agent splits, retimes, speaker-labels, and exports around it.

**Core tools:** `split_cue`, `retime_cue`, `set_speaker`, `propose_wording`, `lock_meaning`, `export_captions`.

**Why it ranks highly:** the human/agent authority split is ethical, technically legible, and meaningful. A meaning lock is exactly the kind of product invariant WebMCP tools can enforce.

**Main risk:** it may be mistaken for an ordinary caption editor unless the lock-versus-retime contract is the star of the demo.

### 9. Duet / Tape

**Product:** a browser loop or mix studio where a human supplies taste and an agent performs precise arrangement/mixing operations over the same live musical state.

**Core tools:** `add_loop`, `set_param`, `replace_section`, `harmonize`, `render_preview`, `export_mixdown`.

**Why it ranks highly:** audio makes a compelling demo and the action space offers a very strong “why tools, not chat or pixels” argument.

**Main risk:** musical quality and browser audio reliability. Use deterministic, curated loops rather than generative music infrastructure.

### 10. CommonPurse

**Product:** participatory budgeting where citizens express values and constraints while agents check feasibility, simulate trade-offs, and find coalitions around valid allocations.

**Why it ranks highly:** it turns agents from opinion generators into feasibility engines and gives a credible civic-impact story.

**Main risk:** multi-user governance can become abstract or politically loaded. A small fictional neighborhood budget and a scripted coalition are enough for the proof of concept.

## Fresh minority concepts worth preserving

- **Benefitwright:** a benefits-application packet whose evidence slots, conservative eligibility preview, blockers, and human-only submit lock make the agent a bounded clerk.
- **Seatpeace:** a wedding or event seating optimizer that respects human-set social locks and tacit constraints.
- **Showcaller:** live-show cue control where performer and agent operate simultaneously against one clock.
- **Bequest Atlas / The Remembering Table:** family history accession with explicit uncertainty, contradictory memories, wishes, and human signatures.
- **Caption Parliament:** semantic authority stays with the affected human while the agent handles timing mechanics.
- **Call Board:** a to-scale theater blocking board linking script, geometry, sightlines, lighting, and run sheets.
- **Ticket Ballet:** an interactive restaurant expo rail where 86s, allergies, station load, and firing order are first-class state.
- **Fieldnote:** citizen-science observation logging where the agent validates evidence quality without replacing the observer.
- **Culture:** a living-things care journal in which the human observes plants/ferments/ecosystems and the agent maintains structured interventions and history.
- **KinSplit:** structured family-asset division with provenance, preferences, conflicts, and human ratification.
- **OnLoan:** a community equipment-lending protocol with condition records, custody, and repair history.
- **Float Week:** a shared staffing/fairness board for allocating scarce shifts or flexible capacity.

## Wildcards

### Plus-One / Envoy: cross-site composition

Both Kimi runs independently proposed a wildcard where one agent composes tools across several independent WebMCP sites using holds, expiry, receipts, consent, and rollback.

This is arguably the purest “future of the open web” concept because WebMCP becomes fabric rather than a feature of one site. It is also the highest execution risk. A credible version needs only two deliberately tiny sites and one atomic-looking workflow.

### The civic chamber

Multiple Grok agents proposed a public hearing or legislature where motions, amendments, testimony, time, and votes are typed tools and a human retains the gavel.

It may be the most memorable concept in the corpus. It is also where permissions, identity, abuse, and procedural correctness can defeat a one-week prototype. A fictional single-item hearing is the only responsible scope.

### Polis

Fable proposed a persistent simulated town whose laws can change which WebMCP tools exist. It is conceptually remarkable: governance of the tool surface by the tool surface. It is not a one-week product unless reduced to one law, one resource, and one visible rule change.

## Recommendation

The best scoreboard-adjusted choices are:

1. **Setback Studio** for the strongest combination of originality, visual clarity, impact, and one-week scope.
2. **Repair Chorus** for the freshest human/agent interaction and most memorable physical demo.
3. **Sourced** for the safest route to a polished, complete product.

If the team wants the most canonical WebMCP thesis, build **Ledgerline / Counterpart**, but treat the six-agent convergence as a warning: specificity and product law must differentiate it.

If the goal is to redefine the standard rather than maximize completion probability, prototype **Plus-One / Envoy** with two minimal cooperating sites.
