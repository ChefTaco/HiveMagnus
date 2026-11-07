# HiveMem

> Long-term memory for agents: storage and retrieval, sessions, a knowledge graph, consolidation, webhooks and workspaces.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveMem) · [API reference](https://github.com/ChefTaco/HiveMem/blob/main/HIVEMEM_API.md)

## Responsibility

HiveMem gives agents, IDE tools and runtimes one server-side system for remembering, backed by Qdrant. Workspaces own access and private records remain account-bound. TypeScript and Python SDKs and the Hermes memory provider retain native machine credentials. Its credentials, storage formats, migrations and backups stay independent of other products.

## In a Hive installation

HiveMem and its private Qdrant are part of the core profile; [Hive](https://hivemagnus.com/guides/hive.md) 2.0.5 installs HiveMem 1.3.2 as a digest-pinned image. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md): memory search, sessions, webhooks, graph evidence, conflicts, consolidation and queue operations, limited by workspace. Issuer and subject mappings remain explicit product configuration.

## Run it on its own

HiveMem 1.3 ships only as the container image `ghcr.io/cheftaco/hivemem`. It is not on npm: npm resolves `@hivemagnus/hivemem-server` to `1.2.2`, the legacy line from the Hive repository. Requires Docker and OpenSSL. This keeps Qdrant on a private Docker network and publishes HiveMem on loopback only:

```bash
umask 077
cat > hivemem.env <<EOF
HIVEMEM_JWT_SECRET=$(openssl rand -hex 32)
HIVEMEM_QDRANT_URL=http://hivemem-qdrant:6333
HIVEMEM_TS_CORE_HOST=0.0.0.0
HIVE_AUTO_MIGRATE=true
HIVE_HEALTH_URL=http://localhost:18790/v1/health/ready
EOF
docker network create hivemem
docker run -d --name hivemem-qdrant --network hivemem -v hivemem-qdrant:/qdrant/storage \
  qdrant/qdrant:v1.18.1
docker run --rm --network hivemem --env-file hivemem.env ghcr.io/cheftaco/hivemem:1.3.1 check
docker run -d --name hivemem --network hivemem -p 127.0.0.1:18790:18790 \
  -v hivemem-data:/data --env-file hivemem.env ghcr.io/cheftaco/hivemem:1.3.1
```

Expected result: `check` reports `Result: ready to start`, and once the container is healthy, `curl http://127.0.0.1:18790/v1/health/ready` reports readiness. Without an OpenAI-compatible embeddings endpoint, HiveMem uses deterministic lexical retrieval. Mint an access token with `docker run --rm --env-file hivemem.env ghcr.io/cheftaco/hivemem:1.3.1 issue-token --subject operator --role admin`. This listener is plain HTTP; serve HTTPS as the README describes before exposing it. HiveMem has no dashboard of its own: on this standalone path use its REST API, and in the suite use HiveXUI. `GET /dashboard` returns only a placeholder page; the `/dashboard/login` and `/dashboard/api/*` compatibility routes remain for existing callers.

## Source review

Reviewed 2026-11-06 against `main` commit `7f382cc05192f07ab1761d0e93754f404449d0c0`, documentation added after tag `v1.3.1`: [README](https://github.com/ChefTaco/HiveMem/blob/7f382cc05192f07ab1761d0e93754f404449d0c0/README.md), [server README](https://github.com/ChefTaco/HiveMem/blob/7f382cc05192f07ab1761d0e93754f404449d0c0/ts-core/README.md) and [architecture](https://github.com/ChefTaco/HiveMem/blob/7f382cc05192f07ab1761d0e93754f404449d0c0/APP_ARCHITECTURE.md). The commands follow the README's container example and were run with throwaway containers against the image the [1.3.1 release](https://github.com/ChefTaco/HiveMem/releases/tag/v1.3.1) publishes, which Hive 2.0.0 and 2.0.1 installed. Original attribution and migration history are preserved. License: Apache-2.0.
