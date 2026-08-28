# Build Checklist

## Build Preferences

- **Plan ownership:** Handed off to Codex using the participant’s confirmed product decisions.
- **Build mode:** Autonomous.
- **Comprehension checks:** N/A while participant is away.
- **Git:** Initialize a local repository with the implementation; commit after the validated probe and after the completed MVP. Do not publish a remote repository without an explicit in-scope publication decision or established project remote.
- **Verification:** Run continuously without look-at-it pauses, except the irreducible live ChatGPT Voice checkpoint that requires an actual voice task.
- **Check-in cadence:** Speed-run, with durable notes after every checklist item.
- **Scope lock:** Do not expand beyond `scope.md`; stop feature expansion if the Voice gate lacks proof after the planned half-day.
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

- [ ] **5. Deploy and validate text-driven Site Tools end to end**
  Spec ref: `spec.md > Deployment`; `spec.md > Risks And Verification > Risk 3`
  What to build: Create a public static deployment, add security/metadata configuration, and validate tool discovery/mutation from ChatGPT’s built-in browser or WebMCP-enabled Chrome before involving Voice.
  Acceptance: Clean/incognito URL loads; all four tools are discoverable; a text request navigates and changes mode; page and returned state agree; deployment requires no credentials.
  Verify: Record URL, timestamp, client/model, tool call inputs/outputs, and receiver-side screenshots/logs in `docs/voice-validation.md` under “text/site-tools baseline.”
  Current status: **Partially complete.** Production deployment and clean-browser rendering are verified. Real ChatGPT/Chrome Site Tool discovery remains unchecked because this Codex task currently has no connected browser session.

- [ ] **6. Pass the ChatGPT Voice go/no-go gate**
  Spec ref: `spec.md > Risks And Verification > Risk 1`; `scope.md > Critical Validation Spike`
  What to build: In one new ChatGPT Voice task, open the deployed probe and test spoken discovery, invocation, visible mutation, continued spoken awareness, and a follow-up tool call.
  Acceptance: The six-step critical loop succeeds in three consecutive clean sessions or the exact client limitation is recorded. No page-owned TTS is substituted while claiming success.
  Verify: Receiver-side screen recording plus a completed result table in `docs/voice-validation.md`. **Hard gate: do not start item 7 without passing evidence or a participant-approved architecture change.**

- [x] **7. Expand the curated collection and discovery behavior**
  Spec ref: `spec.md > Architecture > 3. Collection repository`; `prd.md > Epic 2`
  What to build: Expand from two to four-to-six excellent public-domain records, complete rights/context/regions, and tune candidate summaries for free agent-led navigation by mood/theme.
  Acceptance: Every included work passes integrity checks; no exact-match behavior returns bounded alternatives; agent never invents unavailable collection items.
  Verify: `npm test -- --run tests/collection.test.ts tests/tool-contracts.test.ts` and three discovery prompt checks.
  Completion note: Implemented out of sequence by explicit participant request during the Opus visual redesign. Live agent prompt checks remain part of items 5–6; collection integrity and six-item tool responses are verified locally.

- [ ] **8. Implement experience modes and provenance rendering**
  Spec ref: `spec.md > Architecture > 6. Interpretation layer`; `prd.md > Epic 3`; `prd.md > Epic 5`
  What to build: Literal, spatial, poetic, story, and curatorial mode themes; provenance legend; plain-text `render_interpretation`/`clear_interpretation` tools if Voice observations support them; source binding for Known segments.
  Acceptance: Mode switches preserve artwork/focus; facts and invention cannot be silently mislabeled; visual transformations remain readable and reduced-motion safe.
  Verify: Unit/contract/component tests for every mode and provenance category; axe scan per mode; live prompt “What are you inventing, and what do we actually know?”

- [ ] **9. Implement region-focused exploration**
  Spec ref: `spec.md > Site Tool Contracts > focus_region`; `prd.md > Epic 4`
  What to build: Semantic region list, normalized overlay/focus behavior, `focus_region`, `clear_region_focus`, grounded result context, and accessible announcements.
  Acceptance: Valid focus changes the page and returned state; invalid/ambiguous requests do not fake success; whole-artwork restoration is immediate; keyboard users retain access.
  Verify: Region bound tests, invalid-id tests, reduced-motion check, screen-reader/keyboard pass, and live region prompts.

- [ ] **10. Harden the complete tool surface and failure behavior**
  Spec ref: `spec.md > Testing Strategy`; `prd.md > Edge Cases`
  What to build: Cancellation, stale-action protection, concise errors, image-load failure, no-result recovery, unsupported-client guidance, tool-description evals, and full current-state verification.
  Acceptance: All PRD edge cases behave deliberately; tool selection is stable; canceled calls do not apply late; errors expose valid recovery options without internal details.
  Verify: Full `npm run check`; Chrome WebMCP DevTools inspection; deterministic and probabilistic prompt cases; three clean headline runs.

- [ ] **11. Polish, document, and freeze the MVP deployment**
  Spec ref: `spec.md > Accessibility Implementation`; `spec.md > Demo And Submission Flow`
  What to build: Final artwork-first visual polish, responsive and accessibility passes, performance/image optimization, README architecture/tool/testing sections, demo script, screenshots, stable production deployment, and final rights audit.
  Acceptance: Live build is polished and repeatable; first interaction lands within 15 seconds; README links directly to WebMCP code and evidence; all assets are licensed; no unsupported claim remains.
  Verify: `npm run check`; Lighthouse/accessibility review; clean-browser deployment check; execute `docs/demo-script.md` three times.

- [ ] **12. Prepare Devpost handoff**
  Spec ref: `spec.md > Demo And Submission Flow`; `prd.md > Submission Proof Points`
  What to build: Gather project story, live URL, public repository plan/link, screenshots, learning/build docs, exact tested-client evidence, testing instructions, and an under-three-minute narrated demo plan.
  Acceptance: The participant has enough truthful material to run `$prepare-submission`; unresolved Voice or deployment gaps are explicit rather than hidden.
  Verify: Review the handoff bundle against `docs/submission-checklist.md` and confirm the next command is `$prepare-submission`.
