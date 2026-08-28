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
| Tool registration harness | Pass | Exactly four tools remain registered and mutate the visible six-work gallery through one controller |
| Real ChatGPT Site Tools discovery | **Pending** | No browser connection was available to this Codex task |

## Tool surface expected in the browser

1. `get_gallery_state` — read-only
2. `list_artworks` — read-only
3. `navigate_to_artwork` — page mutation
4. `set_experience_mode` — page mutation

All tools are registered from the top-level page with closed schemas and AbortController cleanup.

## Environment limitation observed

On 2026-08-28, the Codex Browser runtime initialized but returned no connected browser backends (`[]`). Opening the production URL in the Codex browser panel was queued, but it did not create a controllable session while the participant was away. This is an execution-environment limitation, not evidence that the deployed Site Tools failed.

No unrelated browser backend, page-owned TTS, or injected harness is being presented as live ChatGPT proof.

## Text/Site Tools baseline — required on return

Use the latest ChatGPT desktop app with GPT-5.6 Sol or Terra in a new task:

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

Record screenshots or screen capture plus the exact model/client and timestamp below.

### Text baseline result

- Date/time:
- ChatGPT desktop version:
- Model:
- Available tools observed:
- Navigation result:
- Mode result:
- State verification:
- Tools retained after navigation:
- Evidence paths/links:
- Verdict: Pending

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

Checklist item 7 and later gallery expansion remain blocked until:

- the three Voice runs pass, or
- the participant explicitly approves a changed architecture after reviewing a demonstrated client limitation.
