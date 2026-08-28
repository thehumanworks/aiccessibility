# Project Scope

## Project Name

- **AIccessibility** — participant-selected working name.

## One-Line Summary

AIccessibility is a beautiful, stateless WebMCP gallery where a visitor talks naturally with ChatGPT Voice and the shared page adapts how art is experienced: literally, spatially, poetically, narratively, curatorially, and through free conversational navigation.

## Product Thesis

Accessibility should not mean a reduced alternative interface. An AIccessible site exposes meaningful capabilities and live state through WebMCP; the visitor’s agent carries preferences and conversational context; the person chooses how the page should be perceived in the moment.

The gallery is the proof of this broader idea. It is not merely an image-captioning application or a museum audio guide.

## Target User

- Anyone who wants an audio-first, conversational, or more imaginative way to experience art.
- Blind and low-vision visitors who need rigorous literal and spatial descriptions.
- Sighted visitors who want poetry, story, context, dialogue, and discovery layered over a beautiful visual experience.
- Judges and developers evaluating what a human and an agent can do together on one live WebMCP page.

## Problem

Most gallery pages assume sight and navigation through fixed visual controls. Traditional alt text and audio guides are static, generic, and disconnected from follow-up questions. Generic agents can talk about an image, but they do not share authoritative gallery state, structured curator context, region anchors, or reliable navigation controls with the page.

Users cannot naturally say “be literal,” “turn this into a poem,” “what is in the upper-left corner?”, or “take me somewhere warmer” and have the same page respond coherently.

## Core Workflow

1. The visitor starts a ChatGPT Voice conversation and opens AIccessibility in ChatGPT’s built-in browser.
2. They express an open-ended intent, such as “Show me something that feels like waking from a dream.”
3. ChatGPT discovers the page’s WebMCP site tools, searches the small collection, chooses a candidate, and navigates the single-page gallery.
4. ChatGPT inspects the visible artwork and requests structured facts, curator context, provenance, and region information from the page.
5. ChatGPT speaks an interpretation in the visitor’s requested mode.
6. The visitor interrupts or follows up naturally: switch mode, request literal detail, focus a region, distinguish fact from invention, compare another work, or navigate freely by mood.
7. The page visibly tracks the current artwork, selected region, mode, and provenance while the conversational state remains with the agent.

## What We Are Building

- A polished, full-screen, responsive single-page gallery.
- A curated local collection of six public-domain artworks with verified metadata, high-resolution images, and explicit rights/source records.
- A typed artwork data model containing facts, curator notes, image dimensions, and a small set of meaningful spatial regions.
- Top-level imperative WebMCP site tools, provisionally:
  - `get_gallery_state`
  - `get_current_artwork`
  - `get_artwork_context`
  - `search_collection`
  - `navigate_to_artwork`
  - `focus_region`
  - `set_experience_mode`
  - `render_interpretation`
  - `clear_interpretation`
- Experience modes: raw/literal, spatial, poetic, story, and curatorial.
- Clear provenance labels: **Observed**, **Known**, **Interpreted**, and **Imagined**.
- Visual transformations appropriate to each mode without obscuring the artwork or compromising accessibility.
- Keyboard navigation, semantic structure, focus visibility, contrast, reduced-motion support, and screen-reader compatibility.
- Full ChatGPT Voice as the primary interaction surface.
- Deterministic test cases for site-tool discovery, input schemas, navigation, shared state, and region focus.
- A sub-three-minute demo showing the real deployed experience.

## Critical Validation Spike

Before building the full gallery, deploy the smallest possible two-artwork page and prove this exact loop in one ChatGPT desktop voice task:

1. Spoken request.
2. Site-tool discovery.
3. Tool invocation.
4. Visible page mutation.
5. Continued spoken response aware of the new page state.
6. Spoken follow-up triggering another tool without losing context.

Also validate that ChatGPT can reason usefully about the current artwork from the page plus structured context. Do not quietly replace the target with in-page text-to-speech if this fails; record the actual client limitation and decide explicitly.

## What We Are Not Building

- An embedded replacement voice assistant, custom Realtime voice stack, or page-owned TTS as the primary experience.
- Accounts, profiles, database-backed preferences, or site-owned personalization.
- User uploads or arbitrary-image interpretation.
- A large or remotely synchronized museum catalogue.
- Live integrations with museum APIs.
- Ecommerce, ticketing, social features, multiplayer tours, comments, or sharing.
- AR/VR, 3D rooms, mobile-native applications, or physical museum navigation.
- Generated artwork or claims that generated interpretations are authoritative museum descriptions.
- Full computer-vision segmentation or automatic region detection; regions may be curated for the six works.
- More than five interpretation modes in the proof of concept.

## Inspiration And References

- The intimacy and pacing of a well-produced museum audio guide.
- The rigor of professional audio description: spatial clarity, concrete observation, and respect for the visitor’s agency.
- The flexibility of conversational multimodal models, without reducing the page to a chatbot.
- WebMCP’s central pattern: user and agent operate the same live human-designed interface through reliable typed actions.
- Contemporary digital exhibitions that treat typography, motion, negative space, and sound as part of interpretation.

## Time Budget

The submission deadline is September 3, 2026 at 9:00 PM BST. At scope time, approximately six days and twenty hours remain. Exact participant hours are unknown, so scope assumes an AI-assisted solo sprint with this calendar:

- 0.5 day: Voice + Site Tools integration spike.
- 1.5 days: gallery shell, artwork model, and core WebMCP tools.
- 1 day: artwork sourcing, rights ledger, curator context, and region data.
- 1 day: visual system, responsive behavior, and accessibility.
- 1 day: end-to-end Voice iteration, error handling, and tool evals.
- 1 day: deployment hardening, README, public-repo proof, and demo recording.
- Remaining time: contingency and Devpost submission.

If the Voice integration spike consumes more than half a day without receiver-side proof, stop and diagnose before adding gallery features.

## Demo Path

1. Open on a striking artwork in the beautiful gallery.
2. Say: “Tell me exactly what is here. No interpretation.”
3. ChatGPT gives a literal/spatial account while the page shows provenance and focuses referenced regions.
4. Say: “Now make it a poem about distance.”
5. ChatGPT changes mode and speaks the poem; the page’s presentation transforms.
6. Ask: “What are you inventing, and what do we actually know?”
7. ChatGPT separates observed details, verified facts, interpretation, and invention.
8. Say: “Take me somewhere warmer.”
9. ChatGPT searches and navigates to another artwork, then continues the conversation.

The first meaningful page-and-agent interaction must appear within the first 15 seconds of the submission video.

## Done Means

- The deployed live URL works in ChatGPT’s built-in browser.
- ChatGPT Voice completes the full demo path using real WebMCP tools.
- The experience remains usable without sight and remains visually compelling with sight.
- All six artworks and supporting assets have documented rights.
- Tool definitions and state mutations are visible and understandable in the public repository.
- The demo is repeatable, not a single lucky run.
- Facts and creative interpretation are visibly distinguishable.

## Submission Story

**The web should not decide one fixed way to be experienced.** AIccessibility demonstrates a new division of responsibility: the site exposes trustworthy semantic capabilities and a living visual surface; ChatGPT Voice carries the person’s context and adapts the experience through conversation. A museum gallery makes the change immediate and emotional, while the architecture generalizes to the rest of the web.

## Scope Cuts And Rationale

- Cut site-owned accounts and preferences: the agent owns conversational personalization, reinforcing the product thesis and reducing implementation risk.
- Cut arbitrary uploads and remote catalogues: six curated works enable high-quality region data, rights certainty, and repeatable demos.
- Cut embedded voice fallback as a target: it weakens the central ChatGPT Voice claim and splits effort across two agent architectures.
- Cut automatic region detection: curated anchors are more reliable and credible within one week.
- Cut social/multiplayer features: they do not improve the core WebMCP proof.
- Cut exhaustive interpretation modes: five modes are enough to demonstrate adaptive expression.
