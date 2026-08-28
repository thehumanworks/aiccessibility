# Technical Spec

## Overview

AIccessibility will be a static, client-side React application whose UI state and WebMCP tool state are the same state. It will not run its own LLM, voice model, authentication system, database, or personalization service. ChatGPT Voice is the agent and voice surface; the page supplies a beautiful gallery, trusted collection data, bounded semantic actions, and visible state through top-level imperative WebMCP Site Tools.

The implementation begins with a deployed two-artwork probe. The full build proceeds only after receiver-side evidence shows that one ChatGPT Voice task can discover Site Tools in the built-in browser, invoke them, observe page changes, and continue the voice conversation.

Implements: `prd.md > Core User Journey`, `Epic 6: Share one live state with the agent`, `Epic 8: Deliver a repeatable judge experience`.

## Technical Decisions

### Application stack

- **Vite + React + TypeScript** for a small, fast static single-page application.
- **React `useReducer` + context** for all ephemeral gallery state; no external state-management dependency.
- **Plain CSS with custom properties and cascade layers** for the visual system, mode themes, responsive layout, focus styles, and reduced-motion behavior.
- **No React router dependency.** Use the History API for shareable `?artwork=<id>` state without full-document navigation.
- **Static checked-in artwork data and assets** for repeatability, rights certainty, and zero runtime API dependency.
- **Vercel static deployment** as the initial hosting target; the build remains portable to any static host.

Why: the application has a single bounded state graph, six local records, no backend requirements, and an unusually short deadline. Novel infrastructure would compete directly with product polish and Voice validation.

Documentation:

- [React](https://react.dev/)
- [Vite](https://vite.dev/guide/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vercel static/Vite deployment](https://vercel.com/docs/frameworks/frontend/vite)

### WebMCP integration

- Register tools with `document.modelContext.registerTool` from the top-level document.
- Do not use the declarative API or iframe-registered tools because ChatGPT’s built-in browser currently supports only a subset of WebMCP and does not discover those paths.
- Register tools once after the gallery controller exists; unregister them through a shared `AbortController` during hot reload or application teardown.
- Keep tool names action-oriented, descriptions explicit, schemas closed with `additionalProperties: false`, and enum/id errors recoverable.
- Mark read-only tools with `readOnlyHint: true`; mark page mutations accurately.
- Tool implementations call the same pure gallery actions used by manual UI controls.
- Tool outputs return complete verification state: action, current artwork id/title, active mode, focused region, and revision number.
- Honor the execution `AbortSignal` for any animation or asynchronous transition so canceled voice requests cannot apply late.

Documentation:

- [OpenAI Site Tools](https://learn.chatgpt.com/docs/webmcp)
- [Chrome WebMCP imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [WebMCP best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices)
- [WebMCP tool security](https://developer.chrome.com/docs/ai/webmcp/secure-tools)
- [Chrome DevTools WebMCP panel](https://developer.chrome.com/docs/devtools/application/webmcp)
- [WebMCP eval guidance](https://developer.chrome.com/docs/ai/webmcp/evals)

### Voice boundary

The site does not implement speech recognition or speech synthesis. ChatGPT Voice owns the microphone, conversational continuity, reasoning, multimodal interpretation, and spoken response.

The page owns:

- available artworks and verified context;
- Site Tool contracts;
- navigation, focus, mode, and rendered-interpretation state;
- visual/accessibility presentation;
- no long-term user state.

This boundary is an explicit product requirement. A custom Realtime agent may be explored only after the hackathon or after an explicit participant decision prompted by failed Voice validation.

Documentation:

- [ChatGPT Voice](https://learn.chatgpt.com/docs/features/voice)

## Architecture

### 1. App shell

`App` renders the gallery experience and owns a `GalleryProvider`. It detects Site Tool availability for guidance but does not condition the visual gallery on it.

Implements: `prd.md > Epic 1`, `Epic 7`.

### 2. Gallery controller

A reducer-backed controller owns the entire ephemeral state and exposes typed read/actions. Both visual controls and WebMCP executors call this controller.

State:

```ts
type ExperienceMode = 'literal' | 'spatial' | 'poetic' | 'story' | 'curatorial';
type ProvenanceKind = 'observed' | 'known' | 'interpreted' | 'imagined';

interface GalleryState {
  artworkId: ArtworkId;
  mode: ExperienceMode;
  focusedRegionId: RegionId | null;
  interpretation: RenderedInterpretation | null;
  revision: number;
}
```

Every successful mutation increments `revision`. Tool results include it so the agent can detect stale assumptions.

Implements: `prd.md > Epic 3`, `Epic 4`, `Epic 6`, `Cross-Feature Behavior`.

### 3. Collection repository

A pure module exposes six immutable `Artwork` records and bounded query helpers. It performs no runtime network access.

```ts
interface Artwork {
  id: ArtworkId;
  title: string;
  artist: string;
  yearLabel: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  rights: RightsRecord;
  discovery: {
    moods: string[];
    themes: string[];
    palette: string[];
    subjects: string[];
  };
  observed: GroundedStatement[];
  known: SourcedStatement[];
  interpreted: SourcedStatement[];
  regions: ArtworkRegion[];
}
```

`observed` is manually verified against the image. `known` includes a source URL/label. `interpreted` includes attribution and is never returned as fact.

Implements: `prd.md > Epic 2`, `Epic 5`, artwork metadata edge cases.

### 4. WebMCP tool registry

The registry receives a stable `GalleryController`, builds tool definitions, registers them, and returns cleanup.

Tools are separated into read and mutation groups.

Implements: `prd.md > Epic 6.1`, `Epic 8.1`.

### 5. Artwork stage

The stage renders the current artwork, responsive fitting, region overlay, focus transition, semantic caption, and image error state. Region focus uses normalized percentage coordinates and CSS transforms; it does not modify or crop the source asset.

Implements: `prd.md > Epic 4`, `Epic 7`, image-load edge case.

### 6. Interpretation layer

Renders optional agent-provided segments tagged with provenance. The content is plain text only; no HTML from the agent is accepted. It provides an accessible transcript alongside visual mode styling.

Implements: `prd.md > Epic 3`, `Epic 5`, `Epic 7`.

### 7. Gallery chrome

Provides title/artist, current mode, provenance legend, manual previous/next/mode/focus controls, compatibility guidance, and a compact Site Tools status. Manual controls are first-class, not a debug panel.

Implements: `prd.md > Epic 1`, `Epic 2.3`, `Epic 7`.

### 8. Accessibility announcer

Maintains a short `aria-live="polite"` status for artwork, mode, and focus changes. Interpretation text is exposed as normal document content rather than repeatedly forced through a live region.

Implements: `prd.md > Epic 7.1`, `Epic 7.2`, `Epic 7.3`.

## Site Tool Contracts

### `get_gallery_state`

Read-only. Returns current artwork summary, mode, focused region, whether interpretation is rendered, collection size, and revision.

Input: empty closed object.

### `list_artworks`

Read-only. Returns the six candidate summaries—id, title, artist, year, moods, themes, palette, and subjects—optionally excluding the current artwork. The agent performs open-ended semantic choice; the site does not pretend token matching is intelligent search.

Input:

```ts
{ excludeCurrent?: boolean }
```

### `get_artwork_context`

Read-only. Returns image URL/dimensions, observed statements, sourced facts, attributed interpretation, available region summaries, and rights/source metadata for the current or requested artwork.

Input:

```ts
{ artworkId?: ArtworkId }
```

### `navigate_to_artwork`

Mutation. Validates the id, updates gallery state and URL, clears focus and rendered interpretation, preserves active mode, and returns new state.

Input:

```ts
{ artworkId: ArtworkId }
```

### `set_experience_mode`

Mutation. Updates only the mode and returns new state.

Input:

```ts
{ mode: ExperienceMode }
```

### `focus_region`

Mutation. Validates a region against the current artwork, focuses it, and returns its grounded context plus new state. A nullable id or separate `clear_region_focus` tool clears focus; prefer separate tools if tool-selection evals show ambiguity.

Input:

```ts
{ regionId: RegionId }
```

### `zoom_to_artwork_detail`

Mutation. Accepts the visitor's natural-language visual target and first resolves
matching authored detail aliases. When no authored detail matches, it lazily runs the
browser-local Grounding DINO Tiny detector and SlimSAM refiner, selects the strongest accepted
match, and stores the result and focused region in one state update. WebGPU is
preferred for phrase grounding, while the small SlimSAM refiner uses WASM to
avoid browser-specific `GridSample` shader failures. The verified result reports
the backend actually used by each stage. The
returned region is explicitly marked as an unverified model suggestion rather
than museum-authored fact. If no candidate passes acceptance, the tool returns a
recoverable `DETAIL_NOT_FOUND` result and does not invent a region.

Input:

```ts
{ query: string }
```

### `clear_region_focus`

Mutation. Restores the whole artwork without changing mode or interpretation.

Input: empty closed object.

### `render_interpretation`

Mutation. Stores and displays agent-generated plain-text segments with explicit provenance. It does not generate content or speak.

Input:

```ts
{
  mode: ExperienceMode;
  title?: string;
  segments: Array<{
    provenance: ProvenanceKind;
    text: string;
  }>;
}
```

Constraints:

- Maximum 8 segments.
- Maximum 800 characters per segment.
- Plain text; angle brackets rendered literally.
- `known` segments require at least one source id already present in the current artwork record, or the executor rejects them. If this is too difficult for the first probe, restrict rendered segments to `observed`, `interpreted`, and `imagined` until source binding is complete.

### `clear_interpretation`

Mutation. Clears rendered text while preserving artwork, mode, and focus.

Input: empty closed object.

## File Structure

```text
.
├── index.html                         # Vite HTML entry, metadata, fonts/preconnect policy
├── package.json                       # Scripts and pinned dependencies
├── tsconfig.json                      # Strict TypeScript configuration
├── vite.config.ts                     # Vite/Vitest configuration
├── playwright.config.ts               # Browser test configuration
├── public/
│   └── artworks/
│       ├── <artwork-id>.jpg           # Optimized display assets
│       └── originals/                 # Optional source-resolution copies if size permits
├── src/
│   ├── main.tsx                       # React bootstrap
│   ├── App.tsx                        # App shell and compatibility guidance
│   ├── app.css                        # Global layers, tokens, mode themes, accessibility
│   ├── gallery/
│   │   ├── types.ts                   # Artwork, state, provenance, and branded id types
│   │   ├── reducer.ts                 # Pure GalleryState transitions and invariants
│   │   ├── controller.ts              # Stable read/action surface for UI and tools
│   │   ├── GalleryProvider.tsx        # React context and controller lifecycle
│   │   ├── ArtworkStage.tsx           # Image presentation, loading/error, region focus
│   │   ├── InterpretationLayer.tsx    # Provenance-tagged plain-text presentation
│   │   ├── GalleryChrome.tsx          # Manual navigation, mode, metadata, legend
│   │   ├── AccessibilityStatus.tsx    # Concise aria-live announcements
│   │   └── history.ts                 # Query-param state and popstate synchronization
│   ├── collection/
│   │   ├── artworks.ts                # Six immutable artwork records
│   │   ├── repository.ts              # Bounded reads/list/validation helpers
│   │   ├── rights.ts                  # Typed rights ledger linked to records
│   │   └── sources.ts                 # Source ids, labels, and URLs
│   ├── webmcp/
│   │   ├── model-context.d.ts         # Narrow current imperative API ambient types
│   │   ├── schemas.ts                 # JSON schemas and tool input validation
│   │   ├── tools.ts                   # Tool definitions and executors
│   │   ├── register.ts                # Registration/cleanup and support detection
│   │   └── results.ts                 # Consistent verification/error result builders
│   └── test/
│       ├── setup.ts                    # DOM/axe/test environment
│       └── fakeModelContext.ts         # Captures tool definitions and invokes executors
├── tests/
│   ├── reducer.test.ts                 # State invariants and revision behavior
│   ├── collection.test.ts              # Data integrity, rights, sources, regions
│   ├── tool-contracts.test.ts          # Schemas, read-only behavior, invalid inputs
│   ├── accessibility.test.tsx          # axe and semantic interaction tests
│   └── e2e/
│       ├── manual-gallery.spec.ts      # Manual UI headline journey
│       └── tool-gallery.spec.ts        # Tool executor to visible-page verification
├── docs/
│   ├── hackathon-build/                # Guided-build planning docs
│   ├── artwork-rights.md               # Human-readable asset/source ledger
│   ├── voice-validation.md              # Live Voice + Site Tools evidence/results
│   └── demo-script.md                  # Repeatable under-three-minute flow
└── README.md                           # Setup, architecture, WebMCP tools, testing, demo
```

## Data Flow

### Voice request to visible page change

1. Visitor speaks in ChatGPT Voice.
2. ChatGPT uses page/tool descriptions plus conversation context to choose a Site Tool.
3. ChatGPT’s built-in browser validates and invokes the top-level registered tool.
4. Executor validates input and calls a pure `GalleryController` action.
5. Reducer applies invariants and increments `revision`.
6. React re-renders the artwork/mode/focus/interpretation.
7. Tool returns structured verification state.
8. ChatGPT observes the tool result and page, then continues the spoken response.

### Artwork context lifecycle

1. Static artwork modules are bundled at build time.
2. The repository validates ids and returns immutable records.
3. `get_artwork_context` serializes only bounded context and source records.
4. ChatGPT combines visible image inspection, returned context, and conversation intent.
5. ChatGPT may call `render_interpretation` to publish a provenance-tagged transcript to the page while speaking.
6. The site never persists this interpretation beyond the current page lifetime.

### Manual UI lifecycle

1. Keyboard/pointer control calls the same controller action used by tools.
2. State and URL update.
3. Site Tool reads immediately reflect the new state.
4. Manual and agent interaction therefore cannot diverge into separate state stores.

## PRD Epic Mapping

| PRD area | Technical components |
| --- | --- |
| Epic 1: Enter the gallery | `App`, `GalleryChrome`, support detection, default artwork |
| Epic 2: Discover/navigate | `list_artworks`, `navigate_to_artwork`, repository, history |
| Epic 3: Experience modes | reducer, `set_experience_mode`, CSS mode themes, `InterpretationLayer` |
| Epic 4: Explore details | curated regions, `ArtworkStage`, `focus_region`, `clear_region_focus` |
| Epic 5: Provenance | artwork source model, `render_interpretation`, provenance legend |
| Epic 6: Shared live state | controller, reducer, tool result revisions, manual/tool unification |
| Epic 7: Accessibility | semantic components, focus system, CSS, status announcer, axe tests |
| Epic 8: Judge proof | tool registry, fake model context, DevTools/evals, live validation docs |

## External APIs And Dependencies

### Runtime dependencies

- `react`, `react-dom`: rendering and state composition.
- No runtime AI SDK, database client, auth SDK, router, CSS framework, or component library.

### Development dependencies

- `vite`, `typescript`, React Vite plugin.
- `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`.
- `axe-core` or `vitest-axe` for automated accessibility checks.
- `@playwright/test` for deployed/manual headline-path verification.
- Optional `webmcp-types` only if its current declarations exactly match the built-in browser subset; otherwise keep the local narrow declaration explicit and version-noted.

### External services

- Vercel static hosting.
- ChatGPT desktop app built-in browser and ChatGPT Voice.
- No application API keys or runtime secrets.

## AI Usage

### Product AI

ChatGPT Voice is the only runtime AI. It performs:

- voice turn-taking;
- intent interpretation;
- artwork selection from bounded candidates;
- multimodal observation when available;
- synthesis across observed image details and verified context;
- literal, poetic, narrative, and curatorial language;
- Site Tool selection and action verification.

The application provides no unrestricted generation endpoint and stores no conversation.

### Development AI

Codex coordinates planning, implementation, testing, and documentation. Cursor Agent, Grok, Kimi, and Claude Code/Fable were used for independent ideation. The final submission must describe actual usage accurately and distinguish idea generation from implemented product behavior.

## Security And Privacy

- No accounts, cookies, analytics, user data, voice recordings, or server persistence in the proof of concept.
- All tool mutations are bounded to local UI state.
- No arbitrary URLs, selectors, HTML, JavaScript, file paths, or network destinations are accepted from tool inputs.
- Agent-rendered text is inserted as text nodes only.
- Static artwork/source data is trusted repository content and reviewed before build.
- Tool errors do not expose stack traces or internal paths.
- Rights/source URLs are fixed data, not user input.
- Content Security Policy should allow only self-hosted application assets where practical; avoid third-party font/runtime dependencies.

## Accessibility Implementation

- Target WCAG 2.2 AA for the proof-of-concept interface; document that this is a target, not certification.
- Use native buttons/links and semantic landmarks/headings.
- Maintain a visible “skip to artwork / skip to interpretation” path.
- Use `aria-current`, accessible artwork figure/caption structure, and a concise polite status region.
- Test at 200% zoom, keyboard-only, reduced motion, high contrast, and at least one macOS screen reader path.
- Keep mode labels and provenance available as text, never colour alone.
- Region overlays are decorative mirrors of semantic region data; the semantic region list remains navigable.

## Testing Strategy

### Unit tests

- Reducer invariants for navigation/mode/focus/interpretation.
- Revision increments only on successful mutation.
- Invalid ids/modes/regions leave state unchanged.
- Navigation clears focus and interpretation but preserves mode.
- Static collection integrity: unique ids, valid region bounds, complete rights/source records.

### Contract tests

- Register all expected tools in a fake `document.modelContext`.
- Validate names, descriptions, annotations, closed schemas, and outputs.
- Invoke every executor with valid and invalid inputs.
- Prove read-only tools do not mutate revision.
- Prove canceled actions do not apply late.

### Component/accessibility tests

- Default state, navigation, mode changes, focus, clear, image error.
- Keyboard order and accessible names.
- Automated axe scan for each mode and focused-region state.

### Browser tests

- Manual UI journey in Chromium.
- Tool executor journey through the fake/inspector interface to visible DOM state.
- Static-host deep link/query handling.

### Live integration tests

- Chrome WebMCP DevTools/Inspector: discovery, schemas, inputs, outputs, invocation history.
- ChatGPT built-in browser: Site Tool discovery and page mutation.
- ChatGPT Voice: full six-step critical validation loop.
- Three consecutive clean headline-demo runs with timestamps/results recorded in `docs/voice-validation.md`.

## Risks And Verification

### Risk 1 — ChatGPT Voice cannot invoke Site Tools in the same task

Severity: existential.

Verification: deploy two-artwork probe first and record direct receiver-side evidence.

Response: stop feature development after the half-day limit and report the exact limitation. Do not silently claim page TTS is equivalent. A changed architecture requires the participant’s decision when they return.

### Risk 2 — Agent cannot directly perceive the artwork reliably

Severity: high.

Verification: ask literal questions whose answers are not present in curator facts, then compare against image ground truth.

Response: expose image URL/dimensions and grounded region context; disclose whether the response used page vision or supplied context. Do not claim direct visual inspection without proof.

### Risk 3 — Site Tools disappear across navigation or hot reload

Severity: high.

Verification: keep navigation inside one document, inspect available tools before/after multiple artwork changes, test cleanup during HMR.

Response: use SPA state + History API; register only at the top level.

### Risk 4 — Model chooses tools inconsistently

Severity: high for demo repeatability.

Verification: deterministic and probabilistic prompt/tool evals; three clean live runs.

Response: reduce overlapping tools, sharpen descriptions, add valid-option errors, and script robust demo prompts.

### Risk 5 — Creative output blurs fact and invention

Severity: high for trust and accessibility.

Verification: provenance acceptance tests and demo question separating categories.

Response: structured segments, source binding for Known content, and visible/semantic provenance labels.

### Risk 6 — Visual ambition harms accessibility or schedule

Severity: medium-high.

Verification: test every mode with keyboard, zoom, reduced motion, and axe as it lands.

Response: one strong layout, CSS variable mode transformations, no 3D scene or custom canvas controls.

### Risk 7 — Artwork rights or source metadata are incomplete

Severity: submission-blocking.

Verification: data-integrity test plus human-readable rights ledger before artwork enters the build.

Response: use only public-domain works from authoritative open-access sources and store source/rights proof.

## Deployment

1. Create a Vercel project from the repository.
2. Build with `npm run build`; serve `dist/`.
3. Configure SPA/query URL behavior without path rewrites where possible.
4. Set security headers, especially a restrictive CSP compatible with local artwork assets.
5. Verify from a clean incognito browser and ChatGPT built-in browser.
6. Keep the deployment public, unauthenticated, and stable through judging.

No production environment variables are expected.

## Demo And Submission Flow

### Technical proof sequence

1. Show ChatGPT Voice and AIccessibility side by side.
2. Ask for literal description; capture tool invocation and visible page mode.
3. Ask for poetry; capture `set_experience_mode` and optional `render_interpretation`.
4. Ask about fact versus invention; show provenance.
5. Ask for a region; show focus.
6. Ask for another mood; show `list_artworks` reasoning and `navigate_to_artwork`.

### Repository proof

- Link directly to `src/webmcp/tools.ts`, collection model, rights ledger, and test results in README.
- Include exact tested clients/models and dates.
- Do not describe unverified Voice or multimodal behavior as complete.

### Submission proof

- Live URL.
- Public repository and visible open-source license.
- Under-three-minute public YouTube video with audio.
- Testing instructions for starting a compatible ChatGPT Voice task and opening the site.
- Short technical explanation mapping WebMCP tools to the human/agent shared-state loop.

## Architecture Self-Review

1. **Nine tools may be too many for reliable selection.** Start the probe with four: `get_gallery_state`, `list_artworks`, `navigate_to_artwork`, `set_experience_mode`. Add context, region, and rendering tools only after the core loop is proven.
2. **`render_interpretation` may duplicate spoken output and inflate tool arguments.** Keep it optional until Voice behavior is observed. A transcript/provenance layer could instead render concise structured summaries.
3. **Direct image perception is not guaranteed by the Site Tool contract.** The validation must distinguish visual perception from context retrieval; the data model supports both without concealing the difference.
4. **Vercel is replaceable.** The architecture remains static-host portable; do not spend time on provider-specific infrastructure.
5. **The rights/content workload is real.** Six artworks is the upper bound, not a target that overrides quality; four excellent records beat six incomplete ones.
