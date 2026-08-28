# Product Requirements Document

## Product Summary

AIccessibility is a voice-native WebMCP gallery that lets a visitor choose how to experience art. The visitor speaks naturally with ChatGPT Voice while both person and agent share the same live page. ChatGPT can discover artworks, navigate freely by intent, inspect verified context, focus meaningful image regions, switch interpretive modes, and reshape the page’s presentation.

The proof of concept demonstrates a broader product principle: websites should expose meaningful semantic capabilities, while a person’s chosen agent carries conversational context and adapts those capabilities to the individual.

## Product Principles

1. **One page, many valid experiences.** Literal description, spatial explanation, poetry, story, and curatorial interpretation are peers selected through conversation.
2. **Beautiful for everyone.** Accessibility is part of the main product, not a separate simplified view.
3. **Voice is primary.** The visitor should be able to complete the central journey without typing or manipulating visual controls.
4. **The agent carries the person.** The site does not persist user preferences or identity; the agent’s conversation carries intent and continuity.
5. **Truth and imagination remain distinct.** Observation, verified facts, interpretation, and creative invention are never silently blended.
6. **The artwork remains central.** Adaptive typography, motion, focus, and context support the encounter rather than overwhelming it.
7. **Failure must be honest.** If the agent cannot perceive, verify, navigate, or continue, it should say so rather than fabricate a successful experience.

## Target Users

### Primary: voice-first cultural explorer

A visitor who wants a responsive, conversational experience rather than a fixed wall label or audio guide. They may be blind, low-vision, sighted, hands-busy, curious, or simply more engaged by voice.

### Primary: blind or low-vision visitor

A visitor who needs concrete, spatially organized descriptions and the freedom to interrogate details at their own pace. They must not be forced into poetic interpretation when they ask for literal information.

### Secondary: sighted visitor seeking reinterpretation

A visitor who can see the work but wants a poem, story, new perspective, comparison, or mood-led journey that changes how they attend to it.

### Evaluation user: WebMCP judge or developer

A visitor who needs to understand quickly that ChatGPT Voice is using real, typed site tools to share and mutate gallery state—not merely discussing a screenshot in a detached chat.

## Core User Journey

1. The visitor begins a ChatGPT Voice task and opens the AIccessibility live URL in the built-in browser.
2. The landing view presents one artwork immediately, with an unobtrusive invitation to ask for a description, interpretation, detail, or another work.
3. The visitor gives an open-ended spoken request.
4. ChatGPT identifies and invokes the appropriate site tools.
5. The page transitions or focuses visibly before ChatGPT continues its spoken response.
6. ChatGPT uses the image and the page’s verified context to respond in the requested mode.
7. The page communicates the active artwork, mode, focus region, and provenance of the material being spoken.
8. The visitor interrupts, changes direction, asks a follow-up, or requests another work.
9. The agent continues using the live page state without requiring the visitor to repeat the session history.

## Epics And User Stories

### Epic 1: Enter the gallery without setup

#### Story 1.1 — Immediate encounter

- As a visitor, I want an artwork to be present immediately so that I can begin experiencing the gallery without onboarding forms.

Acceptance criteria:

- The initial page shows a complete artwork view, title, artist, and a concise voice-oriented invitation.
- No account, consent banner, profile, preference form, or tutorial blocks the artwork.
- A keyboard or screen-reader user can identify the page, current artwork, available navigation, and voice-oriented usage guidance.
- The first meaningful request can be made without selecting a mode manually.

#### Story 1.2 — Compatible-client guidance

- As a visitor, I want to know whether I am in the intended ChatGPT environment so that I understand how to begin the voice experience.

Acceptance criteria:

- The page explains concisely that the primary experience uses ChatGPT Voice and Site Tools in the desktop built-in browser.
- Guidance does not masquerade as a working voice interaction when the compatible agent/tool surface is unavailable.
- Normal visual browsing and accessibility controls remain usable even when Site Tools are unavailable, but the page does not substitute an embedded voice assistant.

### Epic 2: Discover and navigate art conversationally

#### Story 2.1 — Navigate by open-ended intent

- As a visitor, I want to ask for art by feeling, theme, visual quality, or curiosity so that the gallery feels alive rather than menu-driven.

Acceptance criteria:

- Requests such as “something warmer,” “a lonely scene,” or “show me movement” can return suitable candidates from the curated collection.
- The agent can receive enough structured information to explain why a candidate fits.
- The agent can navigate the live page to the selected artwork.
- The new artwork’s title and artist become available to assistive technology.
- Navigation never leaves the AIccessibility application or loses its Site Tools.

#### Story 2.2 — Recover from no exact match

- As a visitor, I want useful alternatives when the collection lacks an exact match so that the conversation does not dead-end.

Acceptance criteria:

- No-result requests return a clear statement that the six-work collection has no exact match.
- The agent receives two or three nearest alternatives with reasons.
- No artwork outside the local licensed collection is invented or implied to exist on the page.

#### Story 2.3 — Move explicitly

- As a visitor, I want to say “next,” “back,” or name a work so that simple navigation remains effortless.

Acceptance criteria:

- Explicit next/previous requests update the artwork deterministically.
- Naming a valid work navigates directly to it.
- Naming an unavailable work produces a clear collection-bound response and alternatives.

### Epic 3: Experience an artwork in different modes

#### Story 3.1 — Literal mode

- As a visitor, I want a concrete description without interpretation so that I can construct my own understanding of the work.

Acceptance criteria:

- Literal mode prioritizes subjects, composition, spatial relationships, colour, light, texture, and visible action.
- The output does not present inferred symbolism, emotion, narrative, or artist intention as visible fact.
- The page labels the active mode as **Literal** and emphasizes Observed and Known provenance.

#### Story 3.2 — Spatial mode

- As a blind or low-vision visitor, I want the composition described relative to the frame so that I can understand where elements are located.

Acceptance criteria:

- Spatial descriptions use consistent frame-relative language such as upper-left, foreground, center, background, and relative scale.
- Referenced curated regions may be focused visibly without changing the underlying artwork.
- Region focus is announced through assistive technology.

#### Story 3.3 — Poetic mode

- As a visitor, I want the artwork transformed into a poem so that I can encounter its atmosphere through language.

Acceptance criteria:

- The visitor can request a poetic interpretation with an optional theme or constraint.
- The page labels the result **Imagined** unless it incorporates separately labelled Known context.
- Poetic presentation is visually distinct but preserves readability, keyboard access, and reduced-motion preferences.
- The agent does not attribute generated lines to the artist or museum.

#### Story 3.4 — Story mode

- As a visitor, I want a story inspired by the current work so that the painting becomes an imaginative point of departure.

Acceptance criteria:

- The story may adopt a requested viewpoint, tone, or character.
- Creative additions are identified as invention rather than historical fact.
- A visitor can interrupt the story and request literal clarification without navigating away.

#### Story 3.5 — Curatorial mode

- As a visitor, I want verified context and a careful interpretation so that I can understand the work’s historical and artistic setting.

Acceptance criteria:

- Facts come only from the bundled artwork record and are labelled Known.
- Interpretation is labelled Interpreted and distinguishable from facts.
- Missing context is acknowledged; the agent does not fabricate dates, provenance, quotations, or artist intent.

#### Story 3.6 — Switch modes fluidly

- As a visitor, I want to change modes through ordinary speech so that I remain in the encounter rather than configuring settings.

Acceptance criteria:

- “Be literal,” “make it a poem,” “tell me a story,” and “give me the context” change the active experience mode.
- Switching modes retains the current artwork and region unless the visitor requests navigation.
- The page reflects the new mode before or as the spoken interpretation continues.
- The visitor never needs to know the mode enumeration or tool name.

### Epic 4: Explore details conversationally

#### Story 4.1 — Ask about a visible area

- As a visitor, I want to ask about a location or element so that I can direct attention as I would with a human companion.

Acceptance criteria:

- Requests such as “what is in the upper-left?” or “tell me about the figure” can map to a curated region or the full image.
- The live page focuses or marks the selected region.
- The agent receives the region’s coordinates, label, curated notes, and relationship to the whole work.
- If a requested element cannot be located reliably, the response says so rather than pretending to focus it.

#### Story 4.2 — Clear or change focus

- As a visitor, I want to return to the whole composition or move to another detail so that region exploration does not trap me.

Acceptance criteria:

- “Show the whole work” clears focus and restores the full composition.
- Selecting a different region replaces the earlier focus rather than stacking confusing overlays.
- Page zoom/focus never makes core controls unreachable.

### Epic 5: Understand provenance and uncertainty

#### Story 5.1 — Distinguish information types

- As a visitor, I want to know what was seen, known, interpreted, or imagined so that I can enjoy creativity without confusing it for fact.

Acceptance criteria:

- The page supports four visible provenance categories: Observed, Known, Interpreted, Imagined.
- A single response may use more than one category, but the distinctions remain perceivable visually and through assistive technology.
- The visitor can ask, “What are you inventing, and what do we actually know?” and receive a meaningful separation.
- Museum facts never appear under Imagined; generated narrative never appears under Known.

#### Story 5.2 — Express uncertainty honestly

- As a visitor, I want ambiguity acknowledged so that a confident voice does not turn guesses into truth.

Acceptance criteria:

- Unclear image details are described with uncertainty language.
- Missing curator data is reported as unavailable.
- The system does not generate fake citations, quotations, provenance, or artist statements.

### Epic 6: Share one live state with the agent

#### Story 6.1 — Visible tool-driven changes

- As a visitor, I want the page to visibly respond when the agent acts so that I can trust that the conversation and gallery are connected.

Acceptance criteria:

- Artwork navigation, mode changes, region focus, and cleared interpretation produce immediate visible state changes.
- The current artwork and mode exposed to the agent match what the visitor sees.
- Repeated read operations do not unexpectedly mutate the page.
- Invalid actions leave the page unchanged and return an understandable error to the agent.

#### Story 6.2 — Agent-owned continuity

- As a visitor, I want my voice conversation to carry the journey so that the website does not need an account or personal profile.

Acceptance criteria:

- The site does not request or store identity, accessibility status, voice history, or long-term preferences.
- Reloading the site resets its ephemeral gallery state to a defined default.
- Within one agent conversation, the visitor can refer to earlier requests and choices without the site persisting them.
- The product makes no claim that agent context will persist across unrelated ChatGPT tasks.

### Epic 7: Remain accessible and visually excellent

#### Story 7.1 — Non-visual operation

- As a blind visitor, I want the page’s state and controls exposed semantically so that the experience is usable without seeing the artwork or custom visual effects.

Acceptance criteria:

- Every interactive control has an accessible name and predictable keyboard behavior.
- Current artwork, mode, focus region, and provenance changes are announced appropriately without excessive repetition.
- The page has a logical heading and landmark structure.
- Decorative motion and typography do not replace semantic text.

#### Story 7.2 — Low-vision readability

- As a low-vision visitor, I want readable controls and adaptable presentation so that the visual experience remains enjoyable.

Acceptance criteria:

- Text and controls meet the chosen WCAG 2.2 AA contrast target.
- Layout remains usable at 200% browser zoom.
- Focus indicators are visible against every experience mode.
- Artwork may remain visually rich without placing essential controls over unpredictable image regions.

#### Story 7.3 — Motion preference

- As a visitor sensitive to motion, I want transformations to respect reduced-motion settings so that mode changes remain comfortable.

Acceptance criteria:

- With reduced motion enabled, all transitions become instantaneous or use restrained fades.
- No essential information depends on motion.
- Region focus does not use disorienting automated panning when reduced motion is set.

### Epic 8: Deliver a repeatable judge experience

#### Story 8.1 — Demonstrable WebMCP

- As a judge, I want to inspect available Site Tools and observe their effects so that I can verify non-trivial WebMCP leverage.

Acceptance criteria:

- The deployed page exposes clearly named top-level imperative tools.
- Read and write behaviors are distinguishable through names, descriptions, and annotations.
- Tool results return enough state for the agent to verify the action.
- The public repository contains the tool schemas and execution logic in an obvious location.

#### Story 8.2 — Repeatable scripted journey

- As a judge, I want the headline journey to work repeatedly so that the submission is credible rather than a lucky recording.

Acceptance criteria:

- The documented demo prompts complete the same logical path in at least three consecutive clean sessions.
- A failed match, invalid region, or unsupported client produces a deliberate recovery rather than a broken page.
- The first meaningful agent/page interaction can be shown within 15 seconds.

## Cross-Feature Behavior

- Navigating to a new artwork clears region focus and prior rendered interpretation, while retaining the current requested mode in ephemeral page state unless the agent chooses another mode.
- Switching mode does not navigate or clear region focus.
- Focusing a region does not change provenance or mode.
- Clearing an interpretation leaves the artwork and focus unchanged.
- Literal follow-up during a story temporarily changes the active mode only when the agent explicitly calls the mode tool; the site does not infer intent from raw speech.
- Only the agent carries conversation history. The page exposes current state, not a transcript of the voice conversation.

## Edge Cases

### Unsupported browser or absent Site Tools

- Show concise compatibility guidance.
- Keep the visual gallery and manual controls usable.
- Do not claim that the primary AIccessibility experience is active.

### Voice task cannot invoke Site Tools

- Treat as a failed critical validation, not a normal product fallback.
- Preserve diagnostic evidence for project planning.
- Do not silently substitute page TTS and continue claiming full ChatGPT Voice integration.

### Agent cannot inspect the image

- Allow the agent to use verified artwork context and curated spatial regions.
- Clearly state when a response derives from supplied context rather than direct visual inspection.
- Do not imply image perception that did not occur.

### Tool called with invalid artwork, mode, or region

- Return an explicit error and the valid options needed to recover.
- Leave current page state unchanged.

### Rapid or conflicting voice requests

- The latest completed tool action defines the page state.
- Canceled or superseded actions must not apply late.
- The visitor can ask for current state and receive an accurate answer.

### Image fails to load

- Present title, artist, verified context, and an accessible error state.
- Do not navigate automatically to a different work without the visitor’s request.

### Artwork metadata is incomplete

- Omit missing facts or label them unavailable.
- Creative modes remain possible but may not convert missing facts into invention presented as Known.

### Visitor requests harmful, hateful, or inappropriate transformation

- The agent/client’s normal safety behavior applies.
- The page performs only bounded mode, navigation, focus, and rendering operations; it does not contain a separate unrestricted generation endpoint.

## What We Are Building

- Six-artwork public-domain gallery.
- Full ChatGPT Voice journey in the built-in browser.
- Conversational navigation, five experience modes, region focus, shared page state, and provenance display.
- Accessible, responsive, visually polished interface.
- Repeatable demo and test prompts.

## What We Would Add With More Time

- Larger collections and museum API integrations.
- User-contributed artworks with rights verification.
- Agent-carried portable preference schemas across multiple AIccessible sites.
- Multi-artwork comparison and conversational tour summaries.
- Multiple languages and culturally localized audio description conventions.
- Collaborative tours, educator modes, and visitor-created paths.
- Curator authoring tools for region maps and verified context.
- More expressive visual choreography and generated soundscapes with explicit rights/provenance.
- Standardized AIccessibility tool conventions reusable by non-museum websites.

## Non-Goals

- Site-owned accounts or preference profiles, because agent-owned personalization is central to the thesis.
- General-purpose image description, because the project is a curated shared-page experience.
- Embedded replacement voice AI, because the target is ChatGPT Voice using WebMCP.
- Claims of medical, legal, or standards certification.
- Automatic museum-grade scholarship or definitive artwork interpretation.
- Comprehensive support for every browser, agent, or artwork type during the hackathon.

## Submission Proof Points

- Receiver-side recording of ChatGPT Voice discovering and invoking the page’s actual Site Tools.
- Visible page navigation, mode changes, and region focus synchronized with spoken conversation.
- A provenance moment separating observation, facts, interpretation, and invention.
- Public repository with explicit WebMCP schemas, validation, annotations, and tests.
- Accessibility audit evidence: keyboard path, screen-reader semantics, contrast, zoom, and reduced-motion behavior.
- Rights ledger for every artwork and media asset.
- Three consecutive successful clean runs of the headline demo path.
- Under-three-minute video with the real interaction in its first 15 seconds.

## Product Success Criteria

- A visitor can complete the full headline journey through voice without typing.
- The user can request at least three different interpretations of one artwork in the same session.
- The agent can navigate to another artwork through an open-ended intent.
- The visitor can ask about a curated region and return to the whole composition.
- The page and agent agree on current artwork, mode, and focus after every tested action.
- A blind keyboard/screen-reader user can determine the same current state available visually.
- The experience remains beautiful and understandable to a sighted visitor.
