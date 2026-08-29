# Security review

Last reviewed: 2026-08-29.

## Product boundary

- Static client-only application; no server functions, accounts, cookies,
  analytics, database, or application secrets.
- No user upload, arbitrary URL, selector, HTML, JavaScript, file path, or
  network destination enters a Site Tool.
- Agent-authored companion content is bounded plain text rendered by React.
  Observed and Known content is resolved from checked-in statement IDs and
  fixed source records.
- The activity receipt stores only controlled action summaries and revision
  transitions, never prompts or published response text.
- Production headers deny page-level camera, microphone, and geolocation,
  prevent MIME sniffing, restrict referrers, and apply a CSP for self-hosted
  assets, bundled workers/WASM, and revision-pinned Hugging Face model files.

## Dependency audit boundary

`npm audit --audit-level=high` currently reports two high-severity findings
covering four 2026 libvips CVEs through this chain:

```text
@huggingface/transformers@3.8.1 -> sharp@0.34.5
```

The audit reports **no fix available** in the Sharp release line. This is not
being presented as a clean audit.

The deployed Vite application resolves the package's browser export
(`dist/transformers.web.js`) and performs model work through WebGPU,
ONNX Runtime Web, and WASM inside a browser worker. It does not execute Sharp's
Node/native image-processing path. The production `dist/` contains no `.node`
addon or libvips binary; its worker bundle contains only Transformers.js's
ignored-module stub/reference for Sharp.

Risk is further bounded because the application has no server runtime and does
not process uploaded or attacker-supplied images. The package remains pinned so
an upstream fixed release can be evaluated deliberately rather than silently
changing model behavior. Recheck the advisory and browser bundle before the
submission freeze and whenever Transformers.js or Sharp publishes an update.

## Remaining live checks

- Verify the production CSP does not block the optional model download on both
  WebGPU and WASM fallback paths after deployment.
- Complete three clean, genuinely voice-started ChatGPT host journeys.
- Keep the submitted deployment and repository ref frozen during judging.
