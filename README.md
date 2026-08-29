# AIccessibility

**One trustworthy gallery, many ways of seeing.**

AIccessibility is an agent-native WebMCP gallery where a visitor and ChatGPT
share one live page. The site does more than expose remote controls: it owns
verified artwork context, source-bound provenance, accessible visual state, and
the rules that keep observation, museum fact, interpretation, and invention
distinct. ChatGPT carries the conversation; the page remains the auditable
shared artifact.

Try the live gallery at **[aiccessibility.vercel.app](https://aiccessibility.vercel.app)**
inside ChatGPT’s in-app browser or a WebMCP-enabled Chrome build.

The gallery presents six public-domain works from The Metropolitan Museum of
Art, one at a time, inside a generated Renaissance frame. Interface chrome is
deliberately minimal: a wordmark, a wall label, discreet edge navigation, and a
single settings cog that opens an accessible modal holding the five experience
modes, five personalization controls, and their supporting explanations.

Seventeen focused Site Tools are registered on the top-level document. Human
controls and tools use exactly the same reducer-backed state graph. The agent can
read trusted context, navigate by intent, configure several presentation settings
atomically, publish a provenance-labelled response into the gallery, inspect a
redacted session activity log, and undo one reversible change. Those audit and
undo capabilities stay available to Site Tools without adding transient action
banners to the gallery itself.

`publish_gallery_response` is deliberately constrained. Observed and Known
segments must reference statement IDs returned by `get_artwork_context`; the
page resolves their canonical text and sources itself. Only Interpreted and
Imagined segments accept bounded agent-authored plain text. This prevents a
generated claim from silently presenting itself as museum fact.

`focus_artwork_area` lets a multimodal caller submit normalized visual bounds
and atomically propose a zoomed detail without a browser-local model. Agent and
local-model regions remain visibly unverified until a person confirms them or
dismisses them.
`zoom_to_artwork_detail` remains an optional Grounding DINO Tiny and SlimSAM
fallback when neither authored nor caller-grounded bounds are available. The
models load only on demand in a worker; authored regions remain usable without
the download.

The gallery is complete and manually usable without an agent: artwork carousel,
five speaking styles, four bundled typefaces, bounded text sizes and contrast,
light/dark themes, three interface languages, semantic region exploration,
keyboard operation, reduced motion, and screen-reader state are first-class.

Live ChatGPT Voice validation is **not** yet complete; see
[`docs/voice-validation.md`](docs/voice-validation.md) for the current status.

## What people and agents do together

Try requests such as:

- “Make the text larger and high contrast, then describe this spatially.”
- “What is known about this work, and what are you imagining?”
- “Find the writing in the corner and let me confirm the detail.”
- “Publish that explanation into the gallery with its sources.”
- “Take me somewhere calmer.”

The page visibly reflects each action, records only a controlled action summary
(never the prompt or generated response text), and offers one-step Undo.

## WebMCP surface

| Tool | Role |
| --- | --- |
| `get_gallery_state` | Read current artwork, style, presentation, focus, response status, and revision |
| `list_artworks` | Return bounded collection candidates and discovery cues |
| `get_artwork_context` | Return authored statements, fixed sources, rights, and semantic regions |
| `navigate_to_artwork` | Navigate the shared page to one exact collection work |
| `set_experience_mode` | Change one speaking style |
| `configure_presentation` | Atomically change any non-empty subset of style, font, size, contrast, theme, and language |
| `publish_gallery_response` | Publish source-bound and agent-authored provenance segments |
| `clear_gallery_response` | Remove the shared response without disturbing the encounter |
| `get_session_activity` | Read a bounded receipt with no prompts or response text |
| `undo_last_change` | Restore one reversible shared-state change |
| `list_regions` | Read authored and proposed explorable details |
| `focus_artwork_area` | Add an agent-grounded visual proposal |
| `analyze_artwork_regions` | Opt into broad browser-local discovery |
| `zoom_to_artwork_detail` | Resolve an authored detail or run a narrow local-model fallback |
| `focus_region` | Focus one exact visible region |
| `describe_region` | Return mode-aware, provenance-labelled detail description |
| `clear_region_focus` | Restore the complete artwork |

Every schema is closed, read/write annotations are accurate, errors include
bounded recovery information, and new coordinated mutations support
`expectedRevision` to reject stale assumptions.

## Requirements

- Node.js 22.12 or newer
- npm 11 or newer
- Chromium for the Playwright browser tests

## Development

```sh
npm install
npm run dev
```

The local development server prints its URL in the terminal.

## Verification

```sh
npm run typecheck
npm test -- --run
npm run build
npm run test:e2e
```

Run the complete local verification sequence with:

```sh
npm run check
```

If Playwright has not installed Chromium on the machine yet, run:

```sh
npx playwright install chromium
```

## Architecture

- Vite, React, and strict TypeScript
- Motion for the full-viewport settings transition, Speaking style feedback,
  atmosphere crossfades, and the shared manual/WebMCP artwork carousel
- Transformers.js 3.8.1 for pinned, worker-isolated Grounding DINO Tiny
  detection on WebGPU and SlimSAM refinement on WASM, with a local WASM
  fallback for detection when WebGPU is unavailable
- Plain CSS using cascade layers, custom-property design tokens, and a container
  query on the stage so the artwork sizes itself to the space that is actually
  left over
- Four self-hosted font families, bounded text-size and contrast presets,
  light/dark themes, and English/Spanish/French presentation overlays
- A nine-slice `border-image` frame (`public/frames/renaissance-frame.png`) that
  adapts to portrait and landscape works without covering or distorting the art
- Vitest, Testing Library, and axe for component/accessibility checks
- Playwright for browser-level journeys, modal semantics, and tool-driven
  mutations
- A 49-case machine-readable WebMCP intent/journey corpus covering English,
  Spanish, French, ambiguity, abstention, multi-step ordering, and recovery
- Static assets and data; no runtime account, database, or API dependency

Key files:

- [`src/webmcp/tools.ts`](src/webmcp/tools.ts) — Site Tool definitions and executors
- [`src/regions/transformers-adapter.ts`](src/regions/transformers-adapter.ts) —
  lazy WebGPU/WASM vision-model loading, detection, and mask refinement
- [`src/gallery/reducer.ts`](src/gallery/reducer.ts) — the single state graph
- [`src/gallery/SettingsDialog.tsx`](src/gallery/SettingsDialog.tsx) — the cog modal
- [`src/gallery/PersonalizationControls.tsx`](src/gallery/PersonalizationControls.tsx) —
  the shared manual controls for the five adaptive presentation dimensions
- [`src/gallery/i18n.ts`](src/gallery/i18n.ts) — session-only localized presentation
  copy layered over canonical museum records
- [`src/gallery/SpeakingStyleSelect.tsx`](src/gallery/SpeakingStyleSelect.tsx) —
  synchronized Motion-layout Speaking style radiogroup with roving focus and
  1–5 keyboard shortcuts
- [`src/gallery/StageCarousel.tsx`](src/gallery/StageCarousel.tsx) — framed
  centre work, blurred neighboring peeks, progress bars, and shared
  manual/WebMCP carousel state
- [`src/collection/artworks.ts`](src/collection/artworks.ts) — the six typed records
- [`src/gallery/CompanionPanel.tsx`](src/gallery/CompanionPanel.tsx) — shared
  provenance canvas and source links
- [`evals/webmcp-intent-corpus.json`](evals/webmcp-intent-corpus.json) —
  deterministic expected/disallowed tool and journey cases
- [`docs/artwork-rights.md`](docs/artwork-rights.md) — the rights ledger
- [`docs/security-review.md`](docs/security-review.md) — trust boundaries,
  production headers, and the explicit no-fix Sharp/libvips audit caveat
- [`docs/demo-script.md`](docs/demo-script.md) — the repeatable judge journey

The technical plan and staged validation gates live in
[`docs/hackathon-build/spec.md`](docs/hackathon-build/spec.md) and
[`docs/hackathon-build/checklist.md`](docs/hackathon-build/checklist.md).

## License

Released under the [MIT License](LICENSE).
