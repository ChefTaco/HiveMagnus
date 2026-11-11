# Emberfold: agent guide

> Portable, inspectable context continuity: prepare the conversation, decisions, corrections, protected passages, and source references an agent carries into its next model request.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/emberfold) · [Current instructions](https://github.com/ChefTaco/emberfold#cli-and-http)

## Choose an interface

- TypeScript library: `@hivemagnus/emberfold` for storage-independent integration in your application.
- CLI: `@hivemagnus/emberfold-cli` for JSON input/output.
- Optional authenticated HTTP wrapper: `@hivemagnus/emberfold-server`.
- Hermes context-engine plugin: runs locally and reuses Hermes's configured compression model.

Ardent already imports the pinned library. Installing an additional service is unnecessary for that integration; see the [Magnus and Ardent guide](https://hivemagnus.com/guides/magnus.md#ardent-with-bundled-emberfold).

## Prerequisites

Node.js 24.22.3+ in the 24 series or 26.13.1+ in the 26 series, and npm. The synthetic dry run below requires no model credentials or running services.

## Try a synthetic CLI dry run

In a new working directory, create this synthetic input:

```bash
cat > conversation.json <<'EOF'
{
  "schema_version": 1,
  "namespace": "demo:conversation",
  "instructions": "Help with a sample task.",
  "history": [],
  "exchanges": [],
  "current": [{ "id": "message-1", "role": "user", "content": "Continue the task." }],
  "budget": { "context_tokens": 16000, "output_reserve_tokens": 4000 }
}
EOF
npx --package @hivemagnus/emberfold-cli@0.2.1 emberfold prepare --input conversation.json --dry-run
```

Expected result: JSON on stdout with `fits: true`, `compacted: false`, and zero protected spans verified for this input. Dry runs make no model calls and do not write output files. Diagnostics go to stderr. Exit codes are 0 success, 2 invalid input, 3 budget exhaustion, and 4 provider/tokenizer unavailable.

For real compression, supply a summarizer/provider configuration explicitly. There is no implicit cloud fallback. The library caller retains authoritative source history and controls publication; historical summaries remain unverified data.

## Use the TypeScript library

In an existing TypeScript project:

```bash
npm install @hivemagnus/emberfold@0.2.1
```

The repository's minimal API example:

```typescript
import { prepareContext } from '@hivemagnus/emberfold';

const result = await prepareContext({
  schema_version: 1,
  namespace: 'example:conversation',
  instructions: 'Current application instructions',
  history: [], exchanges: [],
  current: [{ id: 'message-1', role: 'user', content: 'Continue the task.' }],
  budget: { context_tokens: 16000, output_reserve_tokens: 4000 }
});
```

Supply a summarizer adapter when older exchanges need compression. Optional adapters are exported from `@hivemagnus/emberfold/adapters`. Consult the contracts and operations guide before adding provider configuration or the HTTP wrapper. HTTP offers `/v1/prepare`, `/v1/checkpoints/validate`, `/v1/checkpoints/rebuild`, and metadata-only `/healthz` and `/readyz` on your own configured server.

## Optional Hermes plugin

The repository README pins Hermes plugin `0.1.1` to a reviewed source revision; the plugin is versioned separately and still pins core `0.1.0`. With Hermes already installed, follow its full onboarding guide:

```bash
hermes plugins install ChefTaco/emberfold/integrations/emberfold-hermes --ref 416b6fb66149ac17fbca54cb46ec79f39214d647 --enable
hermes emberfold setup
hermes emberfold status --json
```

Setup has separate dependency and configuration/model-check consent steps. Installation alone is not activation; restart the existing gateway and verify a real session as documented. No Emberfold account, remote service, or Hermes fork is required.

## Full instructions

- [API contracts](https://github.com/ChefTaco/emberfold/blob/main/contracts/openapi.json)
- [Operations and provider setup](https://github.com/ChefTaco/emberfold/blob/main/docs/OPERATIONS.md)
- [Hermes onboarding and rollback](https://github.com/ChefTaco/emberfold/blob/main/integrations/emberfold-hermes/README.md)
- [Preservation and security](https://github.com/ChefTaco/emberfold/blob/main/SECURITY.md)
- [Repository instructions](https://github.com/ChefTaco/emberfold/blob/main/AGENTS.md)

## Source review

Reviewed 2026-11-05 against tag `v0.2.1`, commit `f97b7eec1083cbbab79361f6360b8b8412f50bc9`: [README](https://github.com/ChefTaco/emberfold/blob/f97b7eec1083cbbab79361f6360b8b8412f50bc9/README.md), [CLI package manifest](https://github.com/ChefTaco/emberfold/blob/f97b7eec1083cbbab79361f6360b8b8412f50bc9/packages/cli/package.json), and [Node requirements](https://github.com/ChefTaco/emberfold/blob/f97b7eec1083cbbab79361f6360b8b8412f50bc9/package.json). Core, CLI and server `0.2.1` are on npm as `latest`, and core and CLI are pinned intentionally. The CLI invocation uses the published package's `emberfold` executable with the documented `prepare --input ... --dry-run` arguments; run with `0.2.1`, the synthetic example above exits 0 with the expected result and output identical to `0.1.0`. Follow current docs for later versions. License: Apache-2.0.
