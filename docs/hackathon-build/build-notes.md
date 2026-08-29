# Build Notes

## 2026-08-28 — Guided build onboarding

- Entered the optional guided path after official registration and rules acknowledgment.
- Onboarding evidence was gathered across the preceding conversation rather than repeated while the participant was away.
- Round 1: project concept and agent-orchestration experience established.
- Round 2: concept sharpened through explicit decisions about audience, interpretation modes, state ownership, navigation, and voice.
- Round 3: visual/tone questions were offered; participant delegated continued decisions while away. Treat aesthetic assumptions as provisional until visual review.
- Active shaping moments:
  - Rejected framing the product only for visually impaired users; broadened it to adaptive interpretation for everyone.
  - Chose dynamic modes: literal description, poem, story, and other interpretations.
  - Put persistent personalization state in the agent rather than the site.
  - Required free conversational navigation so the experience feels alive.
  - Rejected a page-owned TTS fallback as the target: “Full blown ChatGPT voice. We’re here to make something amazing, not half of it.”
- Key validation risk: official documentation establishes ChatGPT Voice and site tools separately but does not explicitly guarantee their combined use in one voice-driven built-in-browser session. Validate this before committing to the full gallery build.
- Project working name recorded as **AIccessibility**.

## 2026-08-28 — Scope

- Wrote `docs/hackathon-build/scope.md` from the participant’s prior brain dump and explicit decisions; no questions were repeated while they were away.
- Mandatory beats covered: idea, target audience, inspiration, calendar budget, core ambiguities, and explicit scope cuts.
- Time assumption: approximately six days and twenty hours of calendar remain; exact working hours are unknown. Planned an AI-assisted solo sprint with a protected final day for hardening and demo work.
- Deepening rounds: 0 interactive rounds this turn because the participant delegated reasonable assumptions. The scope itself includes a deeper risk pass and named cuts.
- Highest-risk assumption: ChatGPT Voice and built-in-browser site tools work together in a single continuous voice task. Made this the first half-day go/no-go spike.
- Protected participant decisions: full ChatGPT Voice, stateless site preferences, agent-owned conversation state, free navigation, both factual and creative interpretation, broad audience, and high visual quality.
- Aesthetic assumptions remain provisional pending participant visual review.

## 2026-08-28 — PRD

- Wrote `docs/hackathon-build/prd.md`, expanding scope into precise user-visible behavior, acceptance criteria, cross-feature rules, edge cases, non-goals, and submission proof.
- Mandatory beats covered without repeating questions: first-run behavior, user stories, testable acceptance criteria, error and boundary states, time-budget protection, and a defined wow moment.
- Deepening rounds: 0 interactive rounds because the participant delegated while away; performed an internal deepening pass covering persistence, provenance, cancellation, unsupported-client behavior, image-perception uncertainty, and mode/navigation interactions.
- Product requirements deliberately avoid code/framework choices; those are deferred to the spec.
- Protected the no-half-measures decision: page-owned TTS is not accepted as a silent substitute if ChatGPT Voice cannot invoke Site Tools.
- Added a repeatability requirement: three consecutive clean executions of the headline voice journey.

## 2026-08-28 — Technical spec

- Wrote `docs/hackathon-build/spec.md` with stack, architecture, exact Site Tool contracts, file structure, data flows, PRD epic mapping, dependencies, AI boundary, security/privacy, accessibility, testing, deployment, and demo proof.
- Tech preference assumption: Vite + React + TypeScript, reducer/context state, plain CSS, static data, and Vercel hosting. Chosen for reliability and portability; participant had not specified a preferred stack.
- Deployment requirement: public static URL, unauthenticated, stable through judging.
- Current official constraints encoded: top-level imperative WebMCP tools; no reliance on declarative or iframe tool discovery in ChatGPT’s built-in browser.
- Deepening rounds: 0 interactive rounds while participant was away; performed an architecture self-review with five findings.
- Simplification finding: begin the Voice probe with four tools; do not implement the full nine-tool surface before the core loop is proven.
- No runtime OpenAI API or site-owned voice agent is planned; ChatGPT Voice is the product AI.

## 2026-08-28 — Build checklist

- Wrote `docs/hackathon-build/checklist.md` with 12 sequenced, atomic, verifiable items.
- Participant handed planning off and requested autonomous work while away; selected autonomous speed-run mode with no visual pauses except the irreducible live Voice gate.
- Git plan: initialize locally, commit at probe and MVP milestones; do not invent a remote or call local-only work published.
- Wow moment inherited from the participant-approved demo: spoken poem transformation followed by mood-driven navigation.
- Highest-risk work is early: a four-tool two-artwork deployment and real ChatGPT Voice validation precede collection expansion.
- Checklist hard gate: item 7 cannot begin without receiver-side Voice proof or a participant-approved architecture change.
- Deepening: handoff path intentionally skipped an additional interview; performed dependency and verification audit while drafting.

## 2026-08-28 — Build item 1 complete

- Bootstrapped Vite + React + strict TypeScript with layered accessible CSS.
- Added Vitest, Testing Library, axe, Playwright Chromium smoke coverage, MIT license, README, and local Git repository on `main`.
- No remote, commit, or external publication was created.
- Independent primary validation passed: `npm run check` (typecheck, 2 unit/accessibility assertions, production build, 1 Playwright test) and `npm audit --audit-level=high` with 0 vulnerabilities.
- Working tree is intentionally all-new/untracked because no baseline commit existed.

## 2026-08-28 — Build item 2 complete

- Added two contrasting Met Open Access works: Pissarro’s cool outdoor boulevard and Degas’s warmer interior dance class.
- Downloaded original public-domain images and optimized them locally to 2400px maximum dimension for reliable static delivery.
- Visually inspected both local assets before writing observed statements and region descriptions.
- Added typed artwork, source, rights, repository, and region records plus `docs/artwork-rights.md`.
- Verification passed: 3 collection-integrity tests and production build.
- Rights evidence uses canonical Met object pages, machine-readable API records, and the Met Open Access policy. No ambiguous copyrighted media entered the build.

## 2026-08-28 — Build item 3 complete

- Implemented reducer/controller/provider, History API deep links, artwork stage, manual navigation, five mode controls, concise live status, image failure fallback, keyboard interactions, responsive layout, and reduced motion.
- Shared-state invariants are implemented before WebMCP registration: navigation clears focus/interpretation and preserves mode; every successful mutation increments revision.
- Independent validation passed: 16 unit/accessibility tests, production build, and 3 Chromium journeys.
- Visual Playwright screenshot inspection passed: artwork and seven controls rendered, no framework overlay, and the two-column gallery is coherent at 1280×720.
- The preferred agent-browser verification helper was unavailable on the host; pinned Playwright Chromium provided the fallback visual proof.

## 2026-08-28 — Build item 4 complete

- Added exactly four top-level imperative Site Tools: `get_gallery_state`, `list_artworks`, `navigate_to_artwork`, and `set_experience_mode`.
- All tools use closed schemas, explicit read/write annotations, shared controller state, revision-bearing verification results, recoverable errors, cancellation checks, and AbortController registration cleanup.
- Unsupported WebMCP leaves the manual gallery intact.
- Independent validation passed: 23 unit/component/contract tests, 4 Chromium journeys, strict typecheck, and production build.
- E2E injection proves tool calls mutate the visible gallery and stay registered across SPA navigation. Real Chrome/ChatGPT Site Tool discovery remains checklist item 5.

## 2026-08-28 — Build item 5 partial; live browser gate

- Created Vercel project `the-human-works/aiccessibility` and linked the local folder.
- First deployment completed as production and is publicly aliased at `https://aiccessibility.vercel.app`.
- Deployment id: `dpl_J2SsftWjEzdB519sTS4V2fiooC7F`; Vercel inspection returned `READY`.
- Verified `HTTP/2 200` and inspected the public page with Playwright Chromium; artwork and controls rendered without error overlay.
- Vercel local state and `.env.local` are ignored by Git; no secret values were inspected or displayed.
- Attempted the required ChatGPT built-in browser verification through the bundled Browser runtime. The runtime returned no connected browser backends; queuing the URL in the Codex panel did not create a controllable session while the participant was away.
- Wrote `docs/voice-validation.md` with production evidence and exact text/Voice validation scripts.
- Checklist item 5 remains unchecked because real Site Tool discovery and mutation have not been observed in ChatGPT or WebMCP-enabled Chrome.
- Stopped before item 6/7 rather than substituting injected tests or page-owned TTS for receiver-side proof.

## 2026-08-28 — Opus visual redesign and explicit collection override

- Participant explicitly requested a visual redesign with Claude Code Opus, supplied two visual references, required a cog-owned settings modal, and requested more paintings. This request superseded the earlier sequencing gate for collection expansion only; live Site Tool and Voice validation remain unpassed.
- Built-in ImageGen created the project’s reusable Renaissance frame asset. Invalid fake-transparency landscape generations were rejected and removed; the retained `public/frames/renaissance-frame.png` is verified RGBA and used as a responsive nine-slice frame.
- Claude Code Opus (`--model opus --effort high`) redesigned the gallery around one dominant framed painting, quiet museum wall, minimal edge arrows, understated wall label, and a fixed settings cog.
- Removed the persistent `GalleryChrome` component and all “manual probe”/incomplete-experience copy.
- Added native accessible settings dialog with five modes, provenance guidance, Site Tool status, privacy copy, Escape/backdrop/explicit close, focus trap, inert background, and focus return.
- Expanded the collection from two to six public-domain Met Open Access works: Pissarro, Vermeer, Gifford, Van Gogh, Hokusai, and Degas. All four new Met APIs independently returned `isPublicDomain: true`; rights/source/original-image evidence is recorded.
- Preserved exactly four WebMCP tools and their shared-controller semantics. No Voice validation status, page-owned TTS, account, tracking, or backend was added.
- Opus performed three screenshot iterations and fixed clipped wall labels, undersized mobile paintings, and modal overflow.
- Primary-agent verification passed: 39 unit/accessibility/contract tests, 7 Chromium journeys, strict typecheck, production build, and `npm audit --audit-level=high` with 0 vulnerabilities.
- Visual inspection passed for desktop Pissarro, desktop Van Gogh, mobile Vermeer, and the open settings modal.
- Remaining design tradeoffs: the modal scrolls on short viewports; landscape paintings are necessarily smaller on portrait phones; frame bead motifs tile on extreme ratios; some original Met images retain a thin photographed canvas edge.

## 2026-08-28 — Browser-comment Motion refinement via tny ACP

- Participant requested the exact detached harness form `tny --provider acp --agent claude-agent-acp ask -B ...` and explicitly instructed that no model or effort flags be passed.
- Two initial detached attempts with extra flags produced phantom ids and no persistent session/process; they made no workspace changes. The exact requested command succeeded as session `2402f4d8ea9a0b62`.
- Persisted live/final session JSON at `docs/tny-opus-motion-progress.json` and `docs/tny-opus-motion-result.json`.
- Added exact dependency `motion@13.1.1` and used `motion/react` rather than substituting CSS-only animation.
- Added reusable native `SpeakingStyleSelect` in the wall-label annotation and full-viewport settings; options are indexed 1–5, normal select keyboard behavior remains native, and focused number keys jump directly to the chosen style.
- Rebuilt settings as a full-viewport Motion-animated native dialog. The dialog remains open through its exit animation, supports Escape/backdrop/explicit close, traps focus, inerts the gallery, and returns focus to the cog; a 700 ms fallback prevents a stuck top layer if Motion never completes.
- Added Motion carousel transitions for previous/next and WebMCP-driven navigation, moving frame, painting, and wall label as one encounter.
- Added Motion atmosphere/style feedback and `MotionConfig reducedMotion="user"`; real Chromium tests prove reduced-motion behavior.
- Preserved exactly four Site Tools and left live ChatGPT/Voice validation pending.
- Independent primary verification passed outside the restricted sandbox: 48 Vitest assertions, production build, 14 Playwright tests, and `npm audit --audit-level=high` with 0 vulnerabilities.
- Visual review passed for desktop, poetic mode, full-screen desktop/mobile settings, mobile gallery, reduced-motion, and carousel end state.
- Remaining implementation risks: Motion raises JS to 353 kB raw / 112 kB gzip; the visible select narrows 1280×720 artwork headroom; carousel transitions briefly contain outgoing and incoming figures; dialog focus fallback may take 700 ms only if Motion completion fails.
- Published the verified refinement to Vercel production: deployment `dpl_D1q93jinbP2U7doEvjXQ62Wa12KH`, immutable URL `https://aiccessibility-qk0qg9dx9-the-human-works.vercel.app`, alias `https://aiccessibility.vercel.app`, status `READY`, live HTTP 200.

## 2026-08-28 — Custom selector and edge-peek carousel via tny ACP

- Participant supplied a current-page screenshot plus Motion layout/carousel frame sequences as visual evidence and requested another exact detached `tny --provider acp --agent claude-agent-acp ask -B ...` run without model/effort flags.
- Session `ec3fe8d491ec3a33` completed successfully. Persisted `docs/tny-opus-ui-tweaks-progress.json` and `docs/tny-opus-ui-tweaks-result.json`.
- Replaced the native `<select>` and operating-system popup with a reusable accessible ARIA radiogroup. The selected style uses a Motion `layoutId` pill; visible 1–5 indices, roving focus, both arrow axes, Home/End, number keys, Space/Enter, per-option descriptions, and synchronized settings/main copies are implemented.
- Added `StageCarousel` with real previous/next artwork peeks, blur/dimming/gradient masking, `aria-hidden`/empty-alt isolation, six-bar progress, no autoplay, and shared manual/WebMCP navigation.
- Central generated Renaissance frame remains the dominant crisp work. Incoming/outgoing frame, painting, and wall label travel together and resolve from blur; reduced motion collapses travel and layout animation.
- Preserved full-viewport Motion settings, exactly four Site Tools, History API, six-work collection, privacy/stateless architecture, and pending Voice validation.
- Independent primary verification passed: 57 Vitest assertions, production build, 19 Playwright journeys, and `npm audit --audit-level=high` with 0 vulnerabilities.
- Visual review passed for desktop rest, selector focus/selection, carousel rest/mid-transition, mobile rest, and full-viewport mobile settings.
- Remaining tradeoffs: JS bundle 356 kB raw / 113 kB gzip; peeks load two additional full-size images; `mask-composite` fallback may show harder edges on unsupported engines; vertical headroom remains tight at 1280×720; two figures coexist for roughly 520 ms mid-transition.
- Published the verified custom selector/carousel refinement to Vercel production: deployment `dpl_2oxHtpsLPZQBfFVjjmCVZUUFmVEK`, immutable URL `https://aiccessibility-fwliracd1-the-human-works.vercel.app`, alias `https://aiccessibility.vercel.app`, status `READY`, live HTTP 200.

## 2026-08-29 — Build item 5 complete; live text-driven WebMCP gate

- Validated production at `https://aiccessibility.vercel.app` in the Codex in-app browser at approximately 17:39 UTC; live page tools were discovered.
- `set_experience_mode({ mode: "curatorial" })` returned `ok` at revision 23, and the visible speaking style changed to Curatorial.
- `navigate_to_artwork({ artworkId: "hokusai-great-wave" })` returned `ok` at revision 24; URL state, visible status, and tool readback agreed on Hokusai’s *Under the Wave off Kanagawa (The Great Wave)*.
- A second navigation at revision 27 was allowed to settle for 700 ms. The DOM then contained exactly one figure titled *Under the Wave off Kanagawa (The Great Wave)*, ruling out a transient carousel duplicate in the settled state.
- Restored the tab to `gifford-kauterskill-clove` in Poetic mode after validation.
- Marked checklist item 5 complete. This is receiver-side text-driven WebMCP evidence, not a genuinely voice-started run; checklist item 6 remains incomplete.

## 2026-08-29 — Participant expands the finish line to the optimal showcase product

- Active shaping moment: the participant rejected stopping at the guided tool’s proof-of-concept milestone: “I don't want a proof of concept - you are codex, build the optimal product you aspire to showcase.”
- This explicitly overrides the earlier sequencing stop after the text gate and authorizes autonomous continuation through checklist items 8–11 while preserving the original product thesis and full ChatGPT Voice boundary.
- The build must not convert the text-driven result into Voice evidence. Three genuinely voice-started runs, or a later explicit architecture decision based on a demonstrated client limitation, are still required to complete item 6.
- Refined the remaining full-product priorities: provenance-bound companion canvas; atomic adaptive presentation with activity receipt and Undo; human-readable, human-ratified region navigation; stale-revision and race hardening; intent/tool-selection evals; and first-run judge guidance.

## 2026-08-29 — Showcase product build: companion, trust, control, and evals

- Completed checklist item 8 with a provenance-bound shared companion canvas. `get_artwork_context` exposes canonical statement/source IDs; `publish_gallery_response` permits Observed/Known only through those IDs while Interpreted/Imagined remain bounded plain text. The response is bound to artwork, focus, language, and speaking style so stale content clears rather than drifting out of context.
- Added `configure_presentation` for one-revision adaptive changes, a twenty-entry redacted activity receipt, dismissible localized UI, operational `expectedRevision` guards, and one-step non-recursive Undo. Raw prompts and published response text never enter the receipt.
- Completed checklist item 9 with always-available authored details, visible authored/agent/model/human-confirmed provenance, human-only confirmation/dismissal, preserved keyboard focus, whole-artwork recovery, forced-colour focus boundaries, and a narrow one-row scrollable detail rail.
- Completed checklist item 10 with newest-request-wins analysis, cancellation on navigation/Undo, transient progress outside revision/Undo history, non-undoable analysis completion, concise error recovery, and a consolidated 17-tool surface. Five granular personalization tools were removed from WebMCP while manual controls/controller methods remain.
- Added `evals/webmcp-intent-corpus.json`: 49 EN/ES/FR cases across direct, ambiguous, negative, stale-state, provenance, and ten journey scenarios. The static validator passes 5/5. Three independent model reviewers blind-routed all cases, surfaced seventeen hard/latent ambiguities, then rerouted every flagged case cleanly after contract/corpus refinement (5/5, 8/8, 5/5 follow-up slices). This is design evidence, not a hosted-agent success claim.
- Added a compact first-run ChatGPT guide, responsive desktop/native-modal companion, source links, skip target, mobile focus return, copyable companion text, localized activity actions, canonical-English disclosure, dismissible receipt, and honest Site Tools readiness state. Hands-on in-app browser inspection passed desktop and 390 × 844 mobile layouts with zero console errors.
- Added `docs/demo-script.md`, current metadata, README tool/story architecture, `vercel.json` security headers, and `docs/security-review.md`.
- Final local verification: `npm run check` passed 115 Vitest tests, production build (455 modules; main JS 440.09 kB / 137.33 kB gzip; CSS 28.61 kB / 6.57 kB gzip), and 31 Chromium journeys. React best-practices and independent accessibility audits were applied; discovered modal, context-binding, race, focus, localisation, overlay, and forced-colour defects were fixed before the final gate.
- `npm audit --audit-level=high` reports two high-severity findings covering four libvips CVEs through `@huggingface/transformers@3.8.1 -> sharp@0.34.5`, with no fix available. The static browser build uses Transformers’ web export and includes no Sharp native addon/libvips binary; the exact boundary and required recheck are documented rather than called clean.
- No commit, push, or deployment was performed in this build turn. Checklist item 11 remains open for publication/readback and checklist item 6 remains open for three genuinely voice-started host runs.
