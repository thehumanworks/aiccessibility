# Official resources and support

These links were published on the live event overview/Resources page and fetched through the Devpost plugin on 2026-08-27. They are provided locally so agents can route directly to primary technical material without general web search.

## Core WebMCP references

- [WebMCP specification](https://webmachinelearning.github.io/webmcp/) — rendered specification.
- [Specification source and issues](https://github.com/webmachinelearning/webmcp) — explainer, source, and open issues.
- [Chrome WebMCP developer documentation](https://developer.chrome.com/docs/ai/webmcp) — browser implementation and usage.
- [WebMCP origin trial](https://developer.chrome.com/blog/ai-webmcp-origin-trial) — enablement guidance.
- [WebMCP tool security guide](https://developer.chrome.com/docs/ai/webmcp/secure-tools) — prompt-injection risks and trust boundaries.
- [WebMCP evals](https://developer.chrome.com/docs/ai/webmcp/evals) — test tool behavior before shipping.
- [Chrome DevTools WebMCP debugging](https://developer.chrome.com/docs/devtools/application/webmcp) — inspect registered tools.
- [OpenAI WebMCP guide](https://learn.chatgpt.com/docs/webmcp) — OpenAI's product-oriented guide.
- [OpenAI WebMCP Showcase](https://developers.openai.com/showcase?view=webmcp-apps) — examples of agent-native apps.

## Implementation examples and templates

- [Google Chrome WebMCP demos](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/demos).
- [`use-webmcp-tool` React hook](https://www.npmjs.com/package/use-webmcp-tool).
- [Angular WebMCP guidance](https://angular.dev/ai/webmcp).
- [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance) — includes guidance for coding agents.
- [Cloudflare WebMCP overview](https://blog.cloudflare.com/webmcp/).
- [Cloudflare Browser Run WebMCP](https://developers.cloudflare.com/browser-run/features/webmcp/).
- [Cloudflare coffee-store demo](https://webmcp-coffee.jilles.fyi/).
- [Cloudflare Workers WebMCP React template](https://github.com/cloudflare/agents/tree/main/examples/webmcp-react).
- [Vercel storefront source](https://github.com/vercel/shop) and its [WebMCP implementation PR](https://github.com/vercel/shop/pull/498).
- [Vercel live storefront demo](https://template.vercel.shop/).
- [Shopify WebMCP tools](https://shopify.dev/docs/api/web-mcp) and [Shopify agentic tools](https://shopify.dev/docs/agents).
- [Netlify WebMCP starter](https://webmcp-starter.netlify.app/).

## Hosting references

Any hosting provider is allowed. The organizers explicitly mention ChatGPT Sites, Cloudflare, Vercel, Render, Netlify, and Shopify.

- [ChatGPT Sites](https://learn.chatgpt.com/docs/sites?surface=app).
- [Cloudflare Pages and Workers](https://developers.cloudflare.com/pages/).
- [Vercel pricing](https://vercel.com/pricing).
- [Render templates](https://render.com/templates) and [Workflows docs](https://render.com/docs/workflows).
- [Netlify getting started](https://docs.netlify.com/start/choose-your-path/).

The event FAQ notes that ChatGPT Sites requires a paid ChatGPT plan and, at the time of the snapshot, is unavailable in the UK, EEA, and Switzerland. That availability is product-state information and may change; verify it with OpenAI's official product documentation if Sites is selected.

## Supporter offers

These are limited and time-sensitive. Confirm availability before designing a plan around them.

- Vercel: [$30 in build credits](https://credits.vercel.sh/redeem) for the first 1,000 builders. Event code: `OAIWEBMH-9E2F-MUT4`.
- Render: [$50 in participant credits](https://credits-portal-mmdm.onrender.com/claim/openai-hackathon), initially available for up to 500 claims, valid for one year after application.
- Netlify: [3,000-credit request form](https://forms.gle/xw75XGUQzCXEiALc7) for the first 1,000 eligible registered builders, subject to approval and availability. The formal rules give a request deadline of September 1, 2026 at 12:00 PM Pacific and a redemption deadline of October 3, 2026.

## Community and support

- [OpenAI Discord](https://discord.gg/openai).
- [Devpost discussion board](https://webmcp.devpost.com/forum_topics).
- [Participants list](https://webmcp.devpost.com/participants) for finding teammates.
- [Event updates](https://webmcp.devpost.com/updates).
- Devpost support: `support@devpost.com`.

No official event announcements were returned by Devpost as of 2026-08-27 18:37:38 UTC.

## Browser setup

Preferred testing target: ChatGPT's in-app browser, which the event says supports WebMCP by default.

Alternative: Google Chrome 149 or later. Enable `chrome://flags/#enable-webmcp-testing` and restart Chrome. Test the deployed site in the same browser configuration a judge may use.
