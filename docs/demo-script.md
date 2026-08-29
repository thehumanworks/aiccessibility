# AIccessibility demo script

Target: a truthful public demo under three minutes. The first real WebMCP
mutation should happen within fifteen seconds.

## Before recording

1. Use a fresh ChatGPT task with Voice and the in-app browser.
2. Open `https://aiccessibility.vercel.app`.
3. Confirm Site Tools are detected and the gallery starts on the whole artwork.
4. Do not preload the local vision models; they are an optional fallback, not
   part of the critical path.
5. Record one continuous run. Repeat the complete run three times before using
   it as validation evidence.

## Narrated journey

### 0:00–0:15 — The page adapts to a person

Say:

> Make the text larger and high contrast. Show me the Great Wave and describe
> its composition spatially.

Expected WebMCP path:

1. `configure_presentation` with `fontSize`, `contrast`, and `mode`.
2. `list_artworks` if the exact artwork ID is not already known.
3. `navigate_to_artwork` for `hokusai-great-wave`.
4. `get_gallery_state` before the spoken description.

Show the atomic presentation change, artwork transition, shared activity
receipt, and synchronized returned/page state.

### 0:15–0:55 — The agent and person ground a detail together

Say:

> What is the writing in the upper-left corner? Focus it, but let me decide
> whether you found the right thing.

Expected path:

- `focus_artwork_area` when the agent can inspect and ground exact source-image
  bounds; otherwise an authored region from `list_regions` / `focus_region`.

Show the focused cartouche, its provenance label, and the human-only Confirm / 
Not this controls. Confirm the correct proposal manually.

### 0:55–1:40 — Truth and imagination remain distinct

Say:

> Tell this as a short story, but put the answer into the gallery and show me
> exactly what is observed, what the museum tells us, and what you invented.

Expected path:

1. `get_artwork_context` to obtain current statement and source IDs.
2. `publish_gallery_response` with at least one source-bound Observed segment,
   one source-bound Known segment, and clearly labelled Interpreted or Imagined
   plain text.

Show the companion canvas opening beside the artwork. Point out the fixed source
link and that generated text cannot claim Known provenance.

### 1:40–2:10 — Shared state is accountable and reversible

Open the activity receipt. Explain that it stores only controlled action names,
origins, and revision transitions—not the visitor’s prompt or response text.

Use **Undo last change** and show the visible state restoration. Mention stale
revision protection and newest-request-wins cancellation as the reliability
layer for simultaneous human/agent operation.

### 2:10–2:40 — The encounter remains open-ended

Say:

> Take me somewhere warmer.

Expected path:

1. `list_artworks` with discovery cues.
2. `navigate_to_artwork` to the bounded candidate chosen by the agent.

Let the painting, frame, label, mode, activity, and spoken continuation move as
one shared encounter.

### 2:40–2:55 — Close on the thesis

Narration:

> AIccessibility is not a chatbot placed on a gallery. The site owns trusted
> knowledge, provenance, accessibility, and live state. The visitor’s chosen
> agent carries the conversation. Both operate the same human-designed page.

## Pass criteria

- Voice started the interaction and remained spoken throughout.
- Site Tools were genuinely discovered and invoked by the host.
- Returned state, URL, visible UI, and spoken response agreed after every step.
- The Known segment resolved to a visible fixed source.
- Agent/model visual grounding never appeared as museum-authored fact.
- Human region confirmation and Undo worked.
- No unsupported capability was claimed.
- The run completed cleanly three consecutive times.
