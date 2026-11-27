# Emberfold: agent guide

> Portable, inspectable context continuity: prepare the conversation, decisions, corrections, protected passages, and source references an agent carries into its next model request.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/emberfold) · [Current instructions](https://github.com/ChefTaco/emberfold#cli-and-http)

## Choose an interface

- TypeScript library: `@hivemagnus/emberfold` for storage-independent integration in your application.
- CLI: `@hivemagnus/emberfold-cli` for JSON input/output.
- Optional authenticated HTTP wrapper: `@hivemagnus/emberfold-server`.
- Hermes context-engine plugin: runs locally and reuses Hermes's configured compression model.

Ardent already imports the library at its own pin: Ardent 3.5.1 pins `@hivemagnus/emberfold` 0.4.0 (Hive {{hm.suite}} stages Ardent {{hm.version:ardent}}), the Hermes plugin 0.1.1 pins 0.1.0, and the examples below use 0.5.0. Installing an additional service is unnecessary for that integration; see the [Ardent guide](https://hivemagnus.com/guides/ardent.md). In a [Hive](https://hivemagnus.com/guides/hive.md) installation, the `full` profile also runs the optional Emberfold HTTP service; Hive {{hm.suite}} pins it at {{hm.version:emberfold}} (since {{hm.since:emberfold}}).

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
npx --package @hivemagnus/emberfold-cli@0.5.0 emberfold prepare --input conversation.json --dry-run
```

Expected result: JSON on stdout with `fits: true`, `compacted: false`, and zero protected spans verified for this input. Dry runs make no model calls and do not write output files. Diagnostics go to stderr. Exit codes are 0 success, 2 invalid input, 3 budget exhaustion, and 4 provider/tokenizer unavailable or deadline exceeded.

For real compression, supply a summarizer/provider configuration explicitly. There is no implicit cloud fallback. The library caller retains authoritative source history and controls publication; historical summaries remain unverified data.

## Use the TypeScript library

In an existing TypeScript project:

```bash
npm install @hivemagnus/emberfold@0.5.0
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

Supply a summarizer adapter when older exchanges need compression. Optional adapters are exported from `@hivemagnus/emberfold/adapters`. Consult the contracts and operations guide before adding provider configuration or the HTTP wrapper. HTTP offers `POST /v1/prepare`, `/v1/checkpoints/validate`, `/v1/checkpoints/rebuild` and `/v1/recall`, authenticated Prometheus `GET /metrics`, and metadata-only `/health/live`, `/health/ready`, `/healthz` and `/readyz` on your own configured server.

From 0.5.0, an `http` provider with `api_key_env` must use an `https:` URL unless its host is loopback; otherwise the service and CLI fail at startup with `Invalid provider URL: a provider credential requires HTTPS unless the host is loopback`. The Codex child process receives only an allowlisted environment (`HOME`, `PATH`, user, locale, time zone, temporary and XDG directories, CA and proxy settings, `CODEX_*`, and `OPENAI_API_KEY`/`OPENAI_BASE_URL` only with `auth_mode: "apiKey"`); move anything else a Codex setup needs into Codex's own configuration or a `CODEX_*` name. The HTTP service writes HiveCommon JSON request logs with the matched route instead of the raw URL, and accepts Oathweave client-credentials tokens alongside its static bearer only when an `oathweave` configuration block is set. 0.5.0 has no migration, because Emberfold is stateless; a downgrade to 0.4.0 needs any `oathweave` block removed first. In a Hive installation the suite configures no credentialed HTTP provider.

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

Release update, 2026-11-27: [Hive 3.15.1](https://github.com/ChefTaco/hive/releases/tag/v3.15.1), tag `v3.15.1`, commit `ac79185031440e1b76f5c62d4c8d0f83f19b98b7`, pins Emberfold 0.5.0, as Hive 3.15.0 first did (Hive 3.8.0 to 3.14.3 pinned 0.4.0), so the examples now use core and CLI `0.5.0` from tag [`v0.5.0`](https://github.com/ChefTaco/emberfold/releases/tag/v0.5.0), commit `f42918a845b3a3a67cb393cb9b810c5c4c365da9`; npm publishes core, CLI and server `0.5.0` as `latest`, with the same Node.js engines. Its [README](https://github.com/ChefTaco/emberfold/blob/v0.5.0/README.md) adds `/v1/recall`, `GET /metrics` and the `/health/live` and `/health/ready` paths to the HTTP list and keeps the dry-run arguments, exit codes and Hermes plugin `0.1.1` pin. The 0.5.0 paragraph above follows the [changelog](https://github.com/ChefTaco/emberfold/blob/v0.5.0/CHANGELOG.md) and Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round); the Ardent pin is the `@hivemagnus/emberfold` dependency in Ardent's `package.json` at tag `v3.5.1`. Run with the published `0.5.0` CLI on Node.js 24.22.3 in a temporary directory, with no model credentials, the synthetic example above exits 0 with `fits: true`, `compacted: false`, zero protected spans verified, `tokens.method: "estimate"` and nothing on stderr but npm's own notices. Apart from that dry run, no installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [emberfold release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/emberfold.md); what each Emberfold release changed is in its [changelog](https://github.com/ChefTaco/emberfold/blob/main/CHANGELOG.md).
