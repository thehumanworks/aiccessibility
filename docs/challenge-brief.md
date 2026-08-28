# Challenge brief

## Goal

Build a WebMCP-powered web app that imagines and explores the future of the open web, where humans and agents can interact, collaborate, and create together.

WebMCP is an emerging open standard that lets a website expose structured tools directly to agents. Rather than forcing an agent to infer intent from pixels and UI state, the site declares what the agent can do, the input schema, and the execution behavior. The hackathon is looking for an app that becomes **meaningfully better** when people and agents use it together.

The event is sponsored by **OpenAI OpCo, LLC** and administered on Devpost by **Devpost, Inc.** It is online, has no in-person venue, and explicitly supports building with Codex while allowing other coding agents as well. The Devpost Hackathons plugin inside Codex is optional; it is a convenience layer, not an eligibility or judging requirement.

The organizer's stated goals are to:

- explore experiences that become possible when web apps are built for both people and their agents;
- help shape the emerging WebMCP standard and the agent-native web;
- reward working, non-trivial products rather than prompt wrappers or isolated technical proofs of concept.

There are no separate judging tracks.

## Key dates

The controlling formal rule text uses Pacific Time.

| Milestone | Pacific Time | UTC | UK time (BST) |
| --- | --- | --- | --- |
| Registration opens | August 25, 2026, 11:00 AM | 6:00 PM* | 7:00 PM* |
| Submission period opens | August 25, 2026, 11:00 AM | 6:00 PM* | 7:00 PM* |
| Registration and submissions close | September 3, 2026, 1:00 PM | 8:00 PM | 9:00 PM |
| Judging starts | September 4, 2026, 10:00 AM | 5:00 PM | 6:00 PM |
| Judging ends | September 21, 2026, 5:00 PM | September 22, 12:00 AM | September 22, 1:00 AM |
| Winners announced | On or around September 23, 2026, 2:00 PM | 9:00 PM | 10:00 PM |

\* The formal rules say 11:00 AM Pacific. Devpost's structured date API returned `2026-08-25T19:00:00Z`, equivalent to 12:00 PM Pacific. The discrepancy only concerns a start time that has already passed; retain the formal rule text as controlling.

There is no public-voting period.

## Eligibility

The following is an operational summary. Use [Section 3 of the captured rules](rules.md#3-eligibility) for the full legal language and exclusions.

- Individuals must be at least the age of majority where they reside.
- Individuals must reside in a country or territory that supports OpenAI API access and must not fall under an excluded jurisdiction.
- Teams of eligible individuals may enter.
- Organizations may enter if organized or incorporated in a supported country or territory and legally existing at the time of entry.
- A person may participate in more than one team or organization and may also submit individually.
- A team or organization must appoint an authorized representative who meets the eligibility requirements and submits on its behalf.
- The event FAQ says there is no team-size cap. Some per-person prize components cover at most three team members.
- Sponsor/administrator personnel, judges, promotion entities, certain affiliates and family/household members, and anyone with a real or apparent conflict of interest are excluded.
- The rules specifically list additional jurisdictional exclusions and sanctions-related restrictions. Eligibility must be checked against the live rules and the current OpenAI API supported-countries list before submission.

The event is free to enter: no purchase or payment is necessary, and payment does not improve the chance of winning.

## What qualifies as a project

- It must be a WebMCP-powered web app.
- It must install/run consistently on its intended platform and behave as shown in the video and description.
- It may be newly created during the submission period.
- A pre-existing project is allowed only if it was **meaningfully extended using WebMCP after the submission period began**. Only the new work is evaluated. Document the old/new boundary with dated commit history or equivalent timestamped evidence.
- Third-party SDKs, APIs, data, assets, and other materials may be used only when the entrant has the necessary authorization and complies with their terms and licences.
- Multiple submissions are allowed, but each must be unique and substantially different.
- The project must be the entrant's original work, solely owned by the entrant/team/organization, and must not infringe intellectual-property, privacy, contract, or other rights.
- Open-source dependencies are allowed when their licences are followed and the submission adds to their functionality.
- A third party may provide technical assistance, but the entrant must own the resulting submission components, ideas, and creative work.
- A project developed with financial or preferential support from the Sponsor or Administrator before the submission period ends may be disqualified as a conflict of interest.

## Required runtime and testing posture

- Provide a working live URL.
- Judges must be able to use it in ChatGPT's in-app browser or Google Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` enabled.
- Authentication is allowed, but judge credentials and instructions must be supplied privately in the Devpost testing-instructions field.
- Keep the project available free of charge and without restriction through the end of judging.
- Judges may test the app but are not required to; they may judge only from the text, images, repository, and video. Make every artifact independently persuasive and reproducible.
- If the project needs uncommon proprietary hardware, the Sponsor/Administrator may require physical access.
- Submission materials must be in English, or include English translations of the video, description, testing instructions, and all other submitted material.

## Intellectual property and publicity

- Entrants retain intellectual property ownership.
- Submission grants the Sponsor a non-exclusive licence to use the entry for judging.
- The Sponsor and Devpost may promote the submission and use contributors' names, likenesses, voices, and images in hackathon publicity for the hackathon period and three years afterward.
- Submission content must not contain malicious code, nor material the entrant lacks rights to use.
- Participation also carries the releases, publicity consent, liability limitations, arbitration terms, tax obligations, and other conditions in the full Official Rules. Do not treat this summary as a replacement for [Sections 8–16](rules.md#8-intellectual-property-rights).

## Changes after the deadline

The formal rules allow drafts before the deadline and prohibit changes or alterations to the **Submission** after the submission period ends, except when the Sponsor/Devpost expressly permits a narrow corrective change. They say an entrant may continue updating the Devpost portfolio project.

The event FAQ gives stricter practical guidance: do not touch the Devpost submission, repository, or live site during judging; fork the repository if continued development is necessary. Follow the stricter freeze to avoid changing what judges see.

## Optional tools and offers

- The Devpost Hackathons plugin can assist with discovery, registration, planning, and submission, but is optional and is not the source of truth.
- Registered entrants may request 3,000 Netlify credits while supplies last, subject to approval, using the organizer's form by **September 1, 2026 at 12:00 PM Pacific**. Credits must be redeemed by October 3, 2026 and are not cash.
- Additional supporter offers are listed in [Resources](resources.md#supporter-offers). Treat quantity-limited offers as time-sensitive.

## Known source conflicts

### Start timestamp

The formal rules say registration/submissions opened August 25 at 11:00 AM Pacific. The structured Devpost date API returned 12:00 PM Pacific. The formal rules prevail.

### Video requirement

One FAQ answer says judges can judge from the “description and repo alone” and then says “Since there's no video”. That sentence conflicts with the formal rules, the event's “What to Submit” copy, the submission form metadata (`video_required: true`), and a separate FAQ answer. A public YouTube demo under three minutes with audio **is required**.

### Website metadata

The structured global deliverables report `website_required: false`, but a required custom field asks for the live URL and the formal rules require one. A working live URL **is required**.

### Plugin hostname typo

Section 5 of the captured rules refers to `openai.devpost.com` in places. The canonical event URL returned by Devpost and used throughout the event is `https://webmcp.devpost.com`.
