# Voice and Site Tools Validation

This file records receiver-side evidence for AIccessibility’s critical ChatGPT integration. Synthetic unit/E2E results are useful but do not replace a real compatible browser and voice task.

## Production deployment

- Public alias: <https://aiccessibility.vercel.app>
- Immutable deployment: <https://aiccessibility-fwliracd1-the-human-works.vercel.app>
- Vercel deployment id: `dpl_2oxHtpsLPZQBfFVjjmCVZUUFmVEK`
- Vercel project: `the-human-works/aiccessibility`
- Target: production
- Status: `READY`
- First deployed: 2026-08-28
- Current visual redesign deployed: 2026-08-28
- Authentication required: no
- Runtime secrets required by application: no

## Public deployment checks

| Check | Result | Evidence |
| --- | --- | --- |
| HTTPS response | Pass | `HTTP/2 200`, Vercel response, HSTS present |
| Production status | Pass | `vercel inspect` returned `Ready` |
| Alias | Pass | `https://aiccessibility.vercel.app` |
| Visual render | Pass | Playwright Chromium screenshot showed artwork, controls, headings, and no error overlay |
| Local full suite | Pass | 57 unit/component/contract tests and 19 Chromium journeys, including custom Motion radiogroup, neighboring peeks, progress, no-autoplay, and WebMCP carousel parity |
| Tool registration harness | Pass | The current expanded tool surface remains registered at the top level and uses the visible six-work gallery’s shared controller |
| Live text-driven Site Tools discovery | Pass | On 2026-08-29 at approximately 17:39 UTC, the production page exposed live tools in the Codex in-app browser; mode and artwork mutations were invoked and verified against visible page state |

## Core text-baseline tool surface

1. `get_gallery_state` — read-only
2. `list_artworks` — read-only
3. `navigate_to_artwork` — page mutation
4. `set_experience_mode` — page mutation

These four tools define the original text-driven baseline. The live gallery may expose additional tools as the product expands; all tools remain registered from the top-level page with closed schemas and AbortController cleanup.

## Earlier environment limitation

On 2026-08-28, the Codex Browser runtime initialized but returned no connected browser backends (`[]`). Opening the production URL in the Codex browser panel was queued, but it did not create a controllable session while the participant was away. This was an execution-environment limitation, not evidence that the deployed Site Tools failed. The text-driven gate was subsequently completed on 2026-08-29 in a connected Codex in-app browser.

No unrelated browser backend, page-owned TTS, or injected harness is being presented as live ChatGPT proof.

## Text/Site Tools baseline

Original four-tool reproduction script, retained for regression checks in a compatible text client:

1. Open <https://aiccessibility.vercel.app> in the built-in browser.
2. Open **Site tools → Available site tools** in the address bar.
3. Confirm the four expected tools are listed.
4. Send: “List the artworks in this gallery and show me the warmer, more intimate one.”
5. Expected: `list_artworks`, then `navigate_to_artwork` with `degas-dance-class`; the live page changes to *The Dance Class*.
6. Send: “Set the gallery to story mode.”
7. Expected: `set_experience_mode` with `story`; the page’s active mode changes without leaving the artwork.
8. Send: “What is the current gallery state?”
9. Expected: `get_gallery_state` reports Degas, story mode, no focused region, and a revision consistent with the visible mutations.
10. Reopen **Available site tools** and confirm all four remain registered after navigation.

For a new regression run, record screenshots or screen capture plus the exact model/client and timestamp.

### Text baseline result

- Date/time: 2026-08-29, approximately 17:39 UTC
- Client: Codex desktop in-app browser
- Model: Not separately recorded; this was a text-driven page-tool validation, not a Voice run
- Available tools observed: Live production Site Tools were discovered. `set_experience_mode` and `navigate_to_artwork` were then exercised directly.
- Mode result: `set_experience_mode({ mode: "curatorial" })` returned `ok` at revision 23, and the visible speaking style changed to Curatorial.
- Navigation result: `navigate_to_artwork({ artworkId: "hokusai-great-wave" })` returned `ok` at revision 24. The URL, visible status, and tool readback agreed on Hokusai’s *Under the Wave off Kanagawa (The Great Wave)*. A second navigation at revision 27 was allowed to settle for 700 ms; the DOM then contained exactly one figure titled *Under the Wave off Kanagawa (The Great Wave)*.
- State verification: Tool results, URL state, visible mode/status, and settled DOM agreed after the mutations.
- Tools retained after navigation: Pass; the later tool-driven navigation succeeded after the first navigation and mode mutation.
- Cleanup: The tab was restored to `gifford-kauterskill-clove` in Poetic mode.
- Evidence link: <https://aiccessibility.vercel.app>
- Verdict: **Pass — text-driven Site Tools gate complete.** This is not Voice evidence.

## ChatGPT Voice go/no-go gate — required after text baseline

Start a **new voice task** rather than converting a text-started task:

1. Open the production URL in the built-in browser.
2. Say: “List the artworks and take me to the warmer, more intimate one.”
3. Confirm a Site Tool executes and the page navigates.
4. Let ChatGPT continue speaking and ask: “Now make the gallery poetic.”
5. Confirm another tool executes without losing the page or conversation.
6. Ask: “What are we looking at now, and which mode are we in?”
7. Confirm spoken response, tool/page state, and visible state agree.
8. Repeat in three clean new voice tasks.

### Voice run table

| Run | Date/time | Client/model | Spoken navigation | Continued voice | Follow-up tool | State agreement | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  |  |  |  | Pending |
| 2 |  |  |  |  |  |  |  | Pending |
| 3 |  |  |  |  |  |  |  |  | Pending |

## Gate rule

ChatGPT Voice remains a separate, unfinished validation gate. The participant explicitly authorized continued product work after reviewing the text-driven evidence, saying: “I don't want a proof of concept - you are codex, build the optimal product you aspire to showcase.”

This instruction permits checklist items 8–11 to continue without treating the Voice gate as passed. Checklist item 6 must remain incomplete until three genuinely voice-started runs satisfy the table above or the participant later approves an explicit architecture change after reviewing a demonstrated client limitation.

## Local showcase surface awaiting publication

The post-baseline showcase build now registers seventeen focused tools: trusted
artwork context, atomic presentation, provenance-bound publish/clear, bounded
activity/Undo, navigation, speaking style, and region discovery/focus/description.
The five granular WebMCP personalization setters were removed in favour of the
atomic tool; manual controls remain.

Local evidence on 2026-08-29:

- 115 Vitest tests passed;
- production Vite build passed;
- 31 Chromium journeys passed;
- in-app browser hands-on desktop and 390 × 844 mobile checks passed with no
  console errors;
- a local source-bound four-segment companion response visibly rendered
  Observed, Known, Interpreted, and Imagined content plus the fixed Met source;
- the compact companion opened as a native modal and restored focus on close.

This source has **not yet been committed, pushed, or deployed**. The production
section above remains the published baseline until a later publication request
and independent Vercel/Git readback. None of this local evidence completes the
Voice run table.
