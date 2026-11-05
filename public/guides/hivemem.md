# HiveMem

> Long-term memory for agents: storage and retrieval, sessions, a knowledge graph, consolidation, webhooks and workspaces.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveMem) · [API reference](https://github.com/ChefTaco/HiveMem/blob/main/HIVEMEM_API.md)

## Responsibility

HiveMem gives agents, IDE tools and runtimes one server-side system for remembering, backed by Qdrant. Workspaces own access and private records remain account-bound. TypeScript and Python SDKs and the Hermes memory provider retain native machine credentials. Its credentials, storage formats, migrations and backups stay independent of other products.

## In a Hive installation

HiveMem and its private Qdrant are part of the core profile; [Hive](https://hivemagnus.com/guides/hive.md) 2.0.0 installs HiveMem 1.3.1 as a digest-pinned image. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md): memory search, sessions, webhooks, graph evidence, conflicts, consolidation and queue operations, limited by workspace. Issuer and subject mappings remain explicit product configuration.

## Run it on its own

Requires Node.js 24.22.1+ or 26.13.0+ on Linux or macOS with `flock`, and a Qdrant instance.

```bash
docker run -d --name hive-qdrant -p 127.0.0.1:6333:6333 \
  -v hive-qdrant:/qdrant/storage qdrant/qdrant:v1.18.1
umask 077
printf 'HIVEMEM_JWT_SECRET=%s\n' "$(openssl rand -hex 32)" > hivemem.env
npx @hivemagnus/hivemem-server check --env-file hivemem.env
npx @hivemagnus/hivemem-server --env-file hivemem.env
```

Expected result: from another terminal, `curl http://127.0.0.1:18790/v1/health/ready` reports readiness. Without an OpenAI-compatible embeddings endpoint, HiveMem uses deterministic lexical retrieval. Mint access tokens with `issue-token` as its README describes. HiveMem has no dashboard of its own: on this standalone path use its REST API, and in the suite use HiveXUI. `GET /dashboard` returns only a placeholder page; the `/dashboard/login` and `/dashboard/api/*` compatibility routes remain for existing callers.

## Source review

Reviewed 2026-11-05 against tag `v1.3.1`, commit `96638e704f1c8b3fa583f42b5ca0de01ee447d23`: [README](https://github.com/ChefTaco/HiveMem/blob/96638e704f1c8b3fa583f42b5ca0de01ee447d23/README.md) and [server README](https://github.com/ChefTaco/HiveMem/blob/96638e704f1c8b3fa583f42b5ca0de01ee447d23/ts-core/README.md). The commands follow its quick start. The [1.3.1 release](https://github.com/ChefTaco/HiveMem/releases/tag/v1.3.1) publishes the container image that Hive installs. Original attribution and migration history are preserved. License: Apache-2.0.
