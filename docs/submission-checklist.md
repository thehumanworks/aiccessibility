# Submission checklist

The deadline is **September 3, 2026 at 1:00 PM Pacific / 8:00 PM UTC / 9:00 PM BST**. A saved draft is not a submitted entry. Verify the final status on Devpost before the deadline.

## Build and runtime

- [ ] The app is WebMCP-powered, working, and non-trivial.
- [ ] The deployed behavior matches the text description and demo video.
- [ ] The live app works in ChatGPT's in-app browser or Chrome 149+ with the WebMCP testing flag enabled.
- [ ] Every exposed WebMCP tool has an accurate name, description, input schema, and implementation.
- [ ] Judges can use the app free of charge through the end of judging.
- [ ] If authentication is required, private judge credentials and exact test instructions are ready for the Devpost field.
- [ ] Third-party code, APIs, datasets, trademarks, music, images, and other assets are authorised and correctly licensed.
- [ ] If this is an existing app, the new WebMCP work is clearly separated from earlier work with dated commit evidence.

## Devpost project artifacts

- [ ] Project name and one-line tagline.
- [ ] Working live URL.
- [ ] Text description explaining all four required points:
  - why the use case strongly fits WebMCP;
  - how it creates a better user experience;
  - what people and agents can now do together that was difficult or impossible before;
  - how WebMCP was implemented.
- [ ] Public GitHub, GitLab, or Bitbucket repository.
- [ ] Repository includes all source code, assets, setup instructions, and runtime instructions needed for the project to function.
- [ ] Repository includes a complete open-source licence file, detectable and visible at the top of the repository page/About section.
- [ ] Repository visibly demonstrates tool registration using `document.modelContext.registerTool(...)` with tool name, description, input schema, and execution behavior.
- [ ] Public YouTube demo video, **strictly under three minutes**, with audio explaining what was built and how WebMCP is used.
- [ ] Video shows the working product and contains no third-party trademarks, copyrighted music, or other material without permission.
- [ ] All submission materials are in English or have complete English translations.

## Live custom form fields

These fields were returned by `get_submission_requirements` on 2026-08-27. Field IDs are included for agent/API use.

| ID | Field | Required | Accepted values / notes |
| --- | --- | --- | --- |
| `28249` | Submitter Type | Yes | `Individual`, `Team of Individuals`, or `Organization` |
| `28250` | Country of residence of yourself and team members if applicable | Yes | Multi-country selector; the presence of a country in the UI is not proof of eligibility—check the rules |
| `28251` | Organization name | No | Complete when submitting for an organization |
| `28252` | App Status | Yes | `New` or `Existing` |
| `28253` | What was updated during the submission period? | Conditional/practically required for existing apps | Explain here and in the project description |
| `28254` | Live URL accessible in ChatGPT browser or WebMCP-enabled Chrome | Yes | Although global metadata says website not required, this required field and the rules control |
| `28255` | Testing instructions / credentials | No | Visible only to Devpost and judges; required in practice for authenticated or non-obvious flows |
| `28256` | Public code repository URL | Yes | Must be public and visibly licensed |
| `28257` | Which agents or clients tested the WebMCP tools? | Yes | Name the actual tested clients; do not invent coverage |
| `28258` | Which AI tools were used while building? | Yes | Name the tools actually used |
| `28259` | Learning derived from the project | Yes | `None`, `Moderate`, or `Significant` |
| `28260` | AI value applicable to your career | Yes | `Yes` or `No` |

Devpost's global deliverables metadata also says:

- submission object: `submission`;
- video required: `true`;
- website required: `false` (superseded in practice by required field `28254` and the formal rules);
- ZIP file required: `false`.

## Final verification before submission

- [ ] Registration is complete for the correct Devpost account and entrant type.
- [ ] Team/organization has one authorised representative.
- [ ] Every required custom field is answered truthfully.
- [ ] Live URL loads from a fresh judge-like session and the critical WebMCP flow completes end to end.
- [ ] Public repository URL works without authentication; licence and setup instructions are obvious.
- [ ] YouTube URL is public, playable without sign-in, includes audio, and is under three minutes.
- [ ] Text, video, repository, and deployed app describe the same capabilities; no aspirational feature is presented as working.
- [ ] Existing-project evidence proves which work was added after the submission period opened.
- [ ] Submission shows a final submitted state, not merely a saved draft.
- [ ] Record the final public URLs and immutable commit/deployment identifiers locally.

## Freeze after the deadline

Safest practice is to freeze the Devpost entry, the submitted repository/ref, and the deployed judging target until winners are announced. If development must continue, fork or branch away from the submitted version without changing judge-visible artifacts.
