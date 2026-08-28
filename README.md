# AIccessibility

AIccessibility is a voice-native WebMCP gallery where a visitor and ChatGPT
share one live page. The application exposes meaningful gallery actions as Site
Tools while keeping the visual and assistive-technology experience fully usable
without an agent.

The gallery presents six public-domain works from The Metropolitan Museum of
Art, one at a time, inside a generated Renaissance frame. Interface chrome is
deliberately minimal: a wordmark, a wall label, discreet edge navigation, and a
single settings cog that opens an accessible modal holding the five experience
modes and the supporting explanations.

Ten Site Tools are registered on the top-level document. Alongside collection,
navigation, speaking-style, and authored-region actions,
`zoom_to_artwork_detail` accepts a natural-language visual target, runs Grounding DINO Tiny
and SlimSAM locally only when called, and atomically zooms the shared page to the
strongest accepted match. The tools drive exactly the same reducer as the
visible controls, so an agent and a person never diverge into separate state.
Live ChatGPT Voice validation is **not** yet complete; see
[`docs/voice-validation.md`](docs/voice-validation.md) for the current status.

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
- A nine-slice `border-image` frame (`public/frames/renaissance-frame.png`) that
  adapts to portrait and landscape works without covering or distorting the art
- Vitest, Testing Library, and axe for component/accessibility checks
- Playwright for browser-level journeys, modal semantics, and tool-driven
  mutations
- Static assets and data; no runtime account, database, or API dependency

Key files:

- [`src/webmcp/tools.ts`](src/webmcp/tools.ts) — Site Tool definitions and executors
- [`src/regions/transformers-adapter.ts`](src/regions/transformers-adapter.ts) —
  lazy WebGPU/WASM vision-model loading, detection, and mask refinement
- [`src/gallery/reducer.ts`](src/gallery/reducer.ts) — the single state graph
- [`src/gallery/SettingsDialog.tsx`](src/gallery/SettingsDialog.tsx) — the cog modal
- [`src/gallery/SpeakingStyleSelect.tsx`](src/gallery/SpeakingStyleSelect.tsx) —
  synchronized Motion-layout Speaking style radiogroup with roving focus and
  1–5 keyboard shortcuts
- [`src/gallery/StageCarousel.tsx`](src/gallery/StageCarousel.tsx) — framed
  centre work, blurred neighboring peeks, progress bars, and shared
  manual/WebMCP carousel state
- [`src/collection/artworks.ts`](src/collection/artworks.ts) — the six typed records
- [`docs/artwork-rights.md`](docs/artwork-rights.md) — the rights ledger

The technical plan and staged validation gates live in
[`docs/hackathon-build/spec.md`](docs/hackathon-build/spec.md) and
[`docs/hackathon-build/checklist.md`](docs/hackathon-build/checklist.md).

## License

Released under the [MIT License](LICENSE).
