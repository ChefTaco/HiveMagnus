# HiveMem

> Long-term memory for agents: storage and retrieval, sessions, a knowledge graph, consolidation, webhooks and workspaces.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveMem) · [API reference](https://github.com/ChefTaco/HiveMem/blob/main/HIVEMEM_API.md)

## Responsibility

HiveMem gives agents, IDE tools and runtimes one server-side system for remembering, backed by Qdrant. Workspaces own access and private records remain account-bound. TypeScript and Python SDKs and the Hermes memory provider retain native machine credentials. Its credentials, storage formats, migrations and backups stay independent of other products.

## In a Hive installation

HiveMem and its private Qdrant are part of the core profile, installed by [Hive](https://hivemagnus.com/guides/hive.md). Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md): memory search, sessions, webhooks, graph evidence, conflicts, consolidation and queue operations, limited by workspace. Issuer and subject mappings remain explicit product configuration.

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

Expected result: from another terminal, `curl http://127.0.0.1:18790/v1/health/ready` reports readiness. Without an OpenAI-compatible embeddings endpoint, HiveMem uses deterministic lexical retrieval. Mint access tokens with `issue-token` as its README describes; the server also has a self-contained `/dashboard` for this standalone path.

## Source review

Reviewed 2026-11-05 against public revision `ac4195fe4bc58647d74d644a6fbb5a1150bbc0d2`: [README](https://github.com/ChefTaco/HiveMem/blob/ac4195fe4bc58647d74d644a6fbb5a1150bbc0d2/README.md) and [server README](https://github.com/ChefTaco/HiveMem/blob/ac4195fe4bc58647d74d644a6fbb5a1150bbc0d2/ts-core/README.md). The commands follow its quick start. Original attribution and migration history are preserved. License: Apache-2.0.
