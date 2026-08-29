# Build Checklist

## Build Preferences

- **Plan ownership:** Handed off to Codex using the participant’s confirmed product decisions.
- **Build mode:** Autonomous.
- **Comprehension checks:** N/A while participant is away.
- **Git:** Initialize a local repository with the implementation; commit after the validated probe and after the completed MVP. Do not publish a remote repository without an explicit in-scope publication decision or established project remote.
- **Verification:** Run continuously without look-at-it pauses, except the irreducible live ChatGPT Voice checkpoint that requires an actual voice task.
- **Check-in cadence:** Speed-run, with durable notes after every checklist item.
- **Scope lock:** Preserve the product thesis and explicit Voice boundary. Following the participant’s 2026-08-29 instruction to build the optimal showcase product rather than stop at a proof of concept, continue items 8–11 while keeping unverified Voice claims out of the product and submission evidence.
- **Wow moment:** The visitor says “Now make it a poem about distance,” the page transforms as ChatGPT speaks, then “Take me somewhere warmer” drives a real WebMCP navigation to another artwork.

## Checklist

- [x] **1. Bootstrap the static application and verification harness**
  Spec ref: `spec.md > Technical Decisions > Application stack`
  What to build: Initialize Vite + React + TypeScript, strict compiler settings, plain CSS layers/tokens, Vitest/Testing Library/axe, Playwright configuration, local Git repository, open-source license, and baseline README scripts.
  Acceptance: The app displays an accessible empty shell; typecheck, unit tests, production build, and a smoke browser test succeed; repository includes a visible license.
  Verify: `npm run typecheck && npm test -- --run && npm run build && npm run test:e2e`

- [x] **2. Build the two-artwork probe collection and rights ledger**
  Spec ref: `spec.md > Architecture > 3. Collection repository`
  What to build: Add two authoritative public-domain artwork assets, typed records, observed/factual/context fields, curated regions, fixed source records, data-integrity validation, and `docs/artwork-rights.md`.
  Acceptance: Records have unique ids, complete rights/source evidence, valid image dimensions, bounded region coordinates, and no runtime network dependency.
  Verify: `npm test -- --run tests/collection.test.ts && npm run build`; manually inspect every source/right entry.

- [x] **3. Implement the gallery controller and accessible manual probe UI**
  Spec ref: `spec.md > Architecture > 2. Gallery controller`; `spec.md > Architecture > 5. Artwork stage`
  What to build: Reducer/controller, provider, artwork stage, manual next/previous controls, mode controls, History API synchronization, accessible status, keyboard path, image error state, and reduced-motion behavior for two works.
  Acceptance: Manual actions and query state follow PRD invariants; artwork/mode/focus state is perceivable visually and semantically; 200% zoom and keyboard-only use remain functional.
  Verify: `npm test -- --run tests/reducer.test.ts tests/accessibility.test.tsx && npm run test:e2e`

- [x] **4. Register the four-tool WebMCP probe**
  Spec ref: `spec.md > Site Tool Contracts`; `spec.md > Architecture > 4. WebMCP tool registry`
  What to build: Support detection, ambient API types, registration/cleanup, closed JSON schemas, result/error builders, and only the initial tools: `get_gallery_state`, `list_artworks`, `navigate_to_artwork`, `set_experience_mode`.
  Acceptance: Tools register at the top-level document, manual and tool actions share one controller, read-only calls do not mutate revision, invalid calls are recoverable, and navigation does not remove tools.
  Verify: `npm test -- --run tests/tool-contracts.test.ts && npm run build`; inspect tools and invocation history in Chrome DevTools WebMCP panel.

- [x] **5. Deploy and validate text-driven Site Tools end to end**
  Spec ref: `spec.md > Deployment`; `spec.md > Risks And Verification > Risk 3`
  What to build: Create a public static deployment, add security/metadata configuration, and validate tool discovery/mutation from ChatGPT’s built-in browser or WebMCP-enabled Chrome before involving Voice.
  Acceptance: Clean/incognito URL loads; all four tools are discoverable; a text request navigates and changes mode; page and returned state agree; deployment requires no credentials.
  Verify: Record URL, timestamp, client/model, tool call inputs/outputs, and receiver-side screenshots/logs in `docs/voice-validation.md` under “text/site-tools baseline.”
  Completion note: On 2026-08-29 at approximately 17:39 UTC, live tools were discovered on production in the Codex in-app browser. `set_experience_mode({ mode: "curatorial" })` returned `ok` at revision 23 with a matching visible mode; `navigate_to_artwork({ artworkId: "hokusai-great-wave" })` returned `ok` at revision 24 with matching URL/status/readback. A later revision-27 navigation settled for 700 ms to exactly one Great Wave figure. The tab was restored to Gifford in Poetic mode. Full evidence is in `docs/voice-validation.md`.

- [ ] **6. Pass the ChatGPT Voice go/no-go gate**
  Spec ref: `spec.md > Risks And Verification > Risk 1`; `scope.md > Critical Validation Spike`
  What to build: In one new ChatGPT Voice task, open the deployed probe and test spoken discovery, invocation, visible mutation, continued spoken awareness, and a follow-up tool call.
  Acceptance: The six-step critical loop succeeds in three consecutive clean sessions or the exact client limitation is recorded. No page-owned TTS is substituted while claiming success.
  Verify: Receiver-side screen recording plus a completed result table in `docs/voice-validation.md`. **This item remains incomplete: no genuinely voice-started run has occurred. The participant explicitly authorized continuing items 8–11 without treating text-driven evidence as Voice evidence.**

- [x] **7. Expand the curated collection and discovery behavior**
  Spec ref: `spec.md > Architecture > 3. Collection repository`; `prd.md > Epic 2`
  What to build: Expand from two to four-to-six excellent public-domain records, complete rights/context/regions, and tune candidate summaries for free agent-led navigation by mood/theme.
  Acceptance: Every included work passes integrity checks; no exact-match behavior returns bounded alternatives; agent never invents unavailable collection items.
  Verify: `npm test -- --run tests/collection.test.ts tests/tool-contracts.test.ts` and three discovery prompt checks.
  Completion note: Implemented out of sequence by explicit participant request during the Opus visual redesign. Live agent prompt checks remain part of items 5–6; collection integrity and six-item tool responses are verified locally.

- [x] **8. Build the provenance-bound companion canvas and adaptive presentation**
  Spec ref: `spec.md > Architecture > 6. Interpretation layer`; `prd.md > Epic 3`; `prd.md > Epic 5`
  What to build: A persistent companion canvas for provenance-bound Observed, Known, Interpreted, and Imagined segments; source binding for Known content; safe plain-text publish/clear tools; one atomic adaptive-presentation action for mode/readability preferences; and a concise activity receipt with Undo for human and agent changes.
  Acceptance: The agent’s contribution remains visible and revisitable; Known claims resolve to site-owned sources; arbitrary markup is rejected; atomic changes return a before/after diff; Undo is bounded and reversible; mode switches preserve artwork/focus; visual transformations remain readable and reduced-motion safe.
  Verify: Unit/contract/component tests for every provenance category, atomic change, receipt, and Undo path; axe scan per mode; live prompt “What are you inventing, and what do we actually know?”
  Completion note: Implemented a responsive source-bound companion canvas, optional-mode publishing, atomic multi-setting presentation, localized bounded activity receipt, dismiss/Undo, response context binding to artwork/focus/language/style, stale-revision rejection, safe literal text, fixed source links, compact native companion dialog, and desktop side-by-side composition. Full unit/E2E and hands-on desktop/mobile checks pass.

- [x] **9. Finish human-readable, human-ratified region exploration**
  Spec ref: `spec.md > Site Tool Contracts > focus_region`; `prd.md > Epic 4`
  What to build: An always-available semantic detail navigator; normalized overlay/focus behavior; authored, agent-grounded, model-suggested, and human-confirmed provenance; accept/reject/show-whole controls for proposed regions; grounded result context; and accessible announcements.
  Acceptance: Every region can be understood and operated without coordinates or vision; valid focus changes the page and returned state; suggested regions never masquerade as museum-authored fact; invalid/ambiguous requests do not fake success; whole-artwork restoration is immediate; keyboard users retain access.
  Verify: Region-bound and provenance tests, invalid-id and proposal-decision tests, reduced-motion check, screen-reader/keyboard pass, and live detail-navigation prompts.
  Completion note: Authored details are manually discoverable before agent action. Agent/model proposals remain explicitly unverified, expose human-only Confirm/Not this controls with focus recovery, and may be dismissed without stale focus. Narrow layouts use a bounded horizontally scrollable detail rail; forced colours retain a visible region boundary.

- [x] **10. Harden the complete tool surface and failure behavior**
  Spec ref: `spec.md > Testing Strategy`; `prd.md > Edge Cases`
  What to build: Cancellation, `expectedRevision` stale-state rejection, newest-request-wins region analysis, concise errors, image-load failure, no-result recovery, unsupported-client guidance, slim tool descriptions, tool-selection/argument/ordering intent evals, and full current-state verification.
  Acceptance: All PRD edge cases behave deliberately; tool selection and ordering are stable; stale or canceled calls cannot apply late; races resolve deterministically; errors expose valid recovery options without internal details.
  Verify: Full `npm run check`; Chrome WebMCP DevTools inspection; deterministic prompt corpus plus probabilistic cases; explicit stale-revision/race tests; three clean headline runs.
  Completion note: Consolidated to 17 distinct tools, removed five overlapping personalization setters, applied optional revision guards across mutations, made region analysis newest-request-wins and non-corrupting to Undo, enforced 500/150-character description budgets, and added a 49-case EN/ES/FR corpus. Three independent blind routing reviews challenged all cases; after fixes, every flagged case rerouted cleanly. Three genuinely voice-started headline runs remain item 6, not evidence for this completion.

- [ ] **11. Polish, document, and freeze the showcase deployment**
  Spec ref: `spec.md > Accessibility Implementation`; `spec.md > Demo And Submission Flow`
  What to build: Final artwork-first visual polish; first-run judge guidance with useful example prompts and honest Site Tools availability; responsive/accessibility passes; performance/image optimization; README architecture/tool/testing sections; demo script; screenshots; stable production deployment; and final rights audit.
  Acceptance: A first-time visitor understands the shared human-agent interaction within 15 seconds; the live build is polished and repeatable; README links directly to WebMCP code and evidence; all assets are licensed; no unsupported Voice claim remains.
  Verify: `npm run check`; Lighthouse/accessibility review; keyboard/screen-reader and clean-browser deployment checks; verify first-run guidance with Site Tools available and unavailable; execute `docs/demo-script.md` three times.
  Current status: Local showcase polish, README, metadata, security headers, security/audit review, first-run guide, demo script, React review, visual desktop/mobile inspection, keyboard/axe/reduced-motion paths, 115 tests, production build, and 31 Chromium journeys pass. This item remains open until the new source is committed/published, production headers and optional model downloads are read back live, and the demo script is completed three times in genuinely voice-started sessions.

- [ ] **12. Prepare Devpost handoff**
  Spec ref: `spec.md > Demo And Submission Flow`; `prd.md > Submission Proof Points`
  What to build: Gather project story, live URL, public repository plan/link, screenshots, learning/build docs, exact tested-client evidence, testing instructions, and an under-three-minute narrated demo plan.
  Acceptance: The participant has enough truthful material to run `$prepare-submission`; unresolved Voice or deployment gaps are explicit rather than hidden.
  Verify: Review the handoff bundle against `docs/submission-checklist.md` and confirm the next command is `$prepare-submission`.
