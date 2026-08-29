# WebMCP intent and journey evals

`webmcp-intent-corpus.json` is a deterministic, machine-readable contract for evaluating AIccessibility's WebMCP tool selection. It covers direct requests, ambiguous requests, abstention, arguments, ordered journeys, same-stage unordered calls, tool-result fixtures, stale-state recovery, accessibility personalization, provenance, and English, Spanish, and French prompts.

Each expected call has a stable call id, tool name, arguments, and argument matching policy. `exact` requires structural equality. A future runner must interpret `subset` recursively through nested objects and arrays: object keys not listed by the fixture may vary, and listed array items are compared positionally as recursive subsets. This lets generated labels and interpretation text vary while stable provenance, ids, bounds, and revision guards remain testable. Subset fixtures still include every schema-required stable input; only generated prose/labels may be omitted, while ids originating in an earlier tool result remain explicit and traceable to `mockToolResults`. `order` is an array of stages: calls in the same stage may occur in any order, while stages must remain ordered. `mockToolResults` provides deterministic results that a future model runner can feed back after the corresponding call. `disallowedCalls` records unsafe or semantically incorrect calls.

The Vitest validator statically checks the corpus and the required stable fields in subset patterns. It does not execute argument matching, call a hosted model, need credentials, or claim that probabilistic model evaluations have run. A model-backed runner should load the JSON, expose exactly `toolCatalog`, replay mock results, perform recursive argument matching at each ordered stage, and report selection, argument, ordering, abstention, and journey-completion metrics separately.

## Independent routing review — 2026-08-29

Three independent model reviewers routed disjoint slices covering all 49 cases.
They chose calls before inspecting expectations, then reported contract overlap
and evaluator brittleness. The first pass surfaced seventeen hard or latent
ambiguities, including mode-only versus atomic presentation, whole-work state
versus trusted context, authored aliases versus local analysis, missing
provenance context lookups, optional revision guards, and exact matching of
generated labels/prose.

The tool descriptions, schemas, and corpus were revised, then every flagged
case was blind-routed again. The three follow-up slices aligned 5/5, 8/8, and
5/5 respectively. This is useful model-based design evidence, but it is not a
substitute for the future automated runner or the required three clean
ChatGPT Voice host journeys.
