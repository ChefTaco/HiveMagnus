# HiveMem

> Long-term memory for agents: storage and retrieval, sessions, a knowledge graph, consolidation, webhooks and workspaces.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveMem) · [API reference](https://github.com/ChefTaco/HiveMem/blob/main/HIVEMEM_API.md)

## Responsibility

HiveMem gives agents, IDE tools and runtimes one server-side system for remembering, backed by Qdrant. Workspaces own access and private records remain account-bound. TypeScript and Python SDKs and the Hermes memory provider retain native machine credentials. Its credentials, storage formats, migrations and backups stay independent of other products.

## In a Hive installation

HiveMem and its private Qdrant are part of the core profile; [Hive](https://hivemagnus.com/guides/hive.md) {{hm.suite}} installs HiveMem {{hm.version:hivemem}} (pinned since {{hm.since:hivemem}}) as a digest-pinned image. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md): memory search, sessions, webhooks, graph evidence, conflicts, consolidation and queue operations, limited by workspace. Issuer and subject mappings remain explicit product configuration.

From 1.8.0, a loopback-only administrator provisioning endpoint lets the installer create a separate HiveMem principal for an administrator, with a durable receipt; `hive.sh admin-access setup` from Hive 3.11.0 uses it. It is off unless the installation owner configures its own purpose-scoped secret, never adopts or resets an existing principal and issues no memory credential.

From 1.9.0, `hivemem-server rename-agent --from OLD --to NEW` moves everything an agent ID owns to another ID: memories (private ones into the new owner's collections, with their vectors), endorsements, sessions, episodes, conclusions, queue jobs, webhooks, workspace ownership and membership, operation receipts and the agent record with its credential state. The old ID keeps a disabled record, so its remaining tokens are refused, and an `agent.rename` audit record is exported. `--dry-run` and `--verify` are read-only and work while HiveMem runs; the rename itself needs HiveMem stopped, is journaled and idempotent, and refuses a target that already owns data unless `--allow-existing-target` is given. Hive 3.12.0 uses it in a signed initialization that moves data owned by `hive-router`, Emberpath's former memory principal, to `emberpath` on installations migrated from the native Hive Router, and from Hive 3.12.1 the re-link that follows also re-issues HiveMem's own `HIVEMEM_ADMIN_TOKEN` when it was issued for `hive-router` (same role, scope and remaining lifetime); see [Renaming an agent](https://github.com/ChefTaco/HiveMem/blob/v1.9.0/ts-core/README.md#renaming-an-agent) and the [Hive guide](https://hivemagnus.com/guides/hive.md#upgrade).

## API behaviour from 1.10.0

HiveMem 1.10.0 to 1.12.0 keep the storage format (`managed-format-1`), so a suite upgrade needs no `--allow-migrations` for HiveMem. What callers and operators see changes:

- `GET /v1/health` reports `release` as the package version (for example `1.12.0`), no longer the frozen `1.2.2`; update monitoring that compared it.
- Side-effecting `POST` routes accept an `Idempotency-Key` header (alias `X-Idempotency-Key`). A repeated key from the same principal replays the first 2xx answer with `Idempotent-Replayed: true`; a different request under the same key is `422`, a concurrent one `409`. Records live in the server process for 24 hours and a restart forgets them. The TypeScript SDK 1.3.0 and later and the repository's Python SDK send a key on every POST and retry only with one; against a server older than 1.10.0 turn keys off (`idempotencyKeys: false`, `idempotency_keys=False`), because it ignores them and a retry can write twice.
- From 1.11.0, error bodies carry the suite envelope `error: { code, message, requestId }` beside the unchanged `detail`, and search, context, chat and conflict-scan requests are limited to 600 per principal per minute (`429` with `Retry-After`; `HIVEMEM_SEARCH_RATE_LIMIT_PER_MINUTE`, `0` turns it off). Workspace import, `POST /v1/admin/workspaces/{id}/import`, loads a workspace export, as a dry run by default.
- From 1.11.0, the write-recovery journal `pending-write.json` can be written in a second format (`{"version":2,...}`). Releases before 1.11.0 refuse to start on it, so before a downgrade start the newer release once to finish any interrupted checkpoint; in the suite, the pre-upgrade backup is the way back.
- From 1.12.0, Oathweave tokens get 5 seconds of clock tolerance (`HIVEMEM_OATHWEAVE_CLOCK_TOLERANCE_SEC`, 0-60) and a userinfo answer is reused for 3 seconds (`HIVEMEM_OATHWEAVE_SESSION_CACHE_MS`, 0-5000), so a browser sign-out can take up to 3 seconds to reach HiveMem. Set either to `0` for the earlier exact checks. A revoked browser token is refused on every request.

## Workspace access

From 1.7.0, editing or moving a memory (`PUT /v1/memories/{id}`) needs write access to the workspace it is in and, when it moves, to the destination; a member demoted to viewer can no longer edit content. Only an administrator can create the `default` workspace record: without a record the default workspace stays open to every agent for reading and writing, and an existing record is unaffected. From 1.11.0, administering the implicit `default` workspace (purge, prune, workspace import, actor-credential enrollment and `all_members` webhooks) needs the admin role; to delegate it, create the `default` workspace record and add the delegate as a workspace admin. `*` is refused as a workspace ID. Another agent's profile summarises only the memories the caller can read; the agent itself and administrators still see the full profile. Collection names do not change, except that private memories of an agent ID Qdrant cannot use in a collection name (one containing `:`, for example) get an encoded name.

## Run it on its own

HiveMem ships only as the container image `ghcr.io/cheftaco/hivemem`. It is not on npm: npm resolves `@hivemagnus/hivemem-server` to `1.2.2`, the legacy line from the Hive repository. Requires Docker and OpenSSL. This keeps Qdrant on a private Docker network and publishes HiveMem on loopback only:

```bash
umask 077
cat > hivemem.env <<EOF
HIVEMEM_JWT_SECRET=$(openssl rand -hex 32)
HIVEMEM_QDRANT_URL=http://hivemem-qdrant:6333
HIVE_AUTO_MIGRATE=true
HIVE_HEALTH_URL=http://localhost:18790/v1/health/ready
EOF
docker network create hivemem
docker run -d --name hivemem-qdrant --network hivemem -v hivemem-qdrant:/qdrant/storage \
  ghcr.io/cheftaco/hive-qdrant:1.18.3-3
docker run --rm --network hivemem --env-file hivemem.env ghcr.io/cheftaco/hivemem:1.12.0 check
docker run -d --name hivemem --network hivemem -p 127.0.0.1:18790:18790 \
  -v hivemem-data:/data --env-file hivemem.env ghcr.io/cheftaco/hivemem:1.12.0
```

Expected result: `check` reports `Result: ready to start`, and once the container is healthy, `curl http://127.0.0.1:18790/v1/health/ready` reports readiness. Without an OpenAI-compatible embeddings endpoint, HiveMem uses deterministic lexical retrieval. Mint an access token with `docker run --rm --env-file hivemem.env ghcr.io/cheftaco/hivemem:1.12.0 issue-token --subject operator --role admin`. The image listens on every interface inside the container, so keep the port published on loopback as shown. This listener is plain HTTP; serve HTTPS as the README describes before exposing it. HiveMem has no dashboard of its own: on this standalone path use its REST API, and in the suite use HiveXUI. `GET /dashboard` returns only a placeholder page; the `/dashboard/login` and `/dashboard/api/*` compatibility routes remain for existing callers.

## Source review

Reviewed 2026-11-06 against `main` commit `7f382cc05192f07ab1761d0e93754f404449d0c0`, documentation added after tag `v1.3.1`: [README](https://github.com/ChefTaco/HiveMem/blob/7f382cc05192f07ab1761d0e93754f404449d0c0/README.md), [server README](https://github.com/ChefTaco/HiveMem/blob/7f382cc05192f07ab1761d0e93754f404449d0c0/ts-core/README.md) and [architecture](https://github.com/ChefTaco/HiveMem/blob/7f382cc05192f07ab1761d0e93754f404449d0c0/APP_ARCHITECTURE.md). The commands follow the README's container example and were run with throwaway containers against the image the [1.3.1 release](https://github.com/ChefTaco/HiveMem/releases/tag/v1.3.1) publishes, which Hive 2.0.0 and 2.0.1 installed. Original attribution and migration history are preserved. License: Apache-2.0.

Release update, 2026-11-27: [Hive 3.15.1](https://github.com/ChefTaco/hive/releases/tag/v3.15.1), tag `v3.15.1`, commit `ac79185031440e1b76f5c62d4c8d0f83f19b98b7`, pins HiveMem 1.12.0, tag [`v1.12.0`](https://github.com/ChefTaco/HiveMem/releases/tag/v1.12.0), commit `46ae764f07fbe6b8d813c0be09d0547e84431205`, as Hive 3.15.0 first did (Hive 3.12.3 to 3.14.3 pinned 1.9.1). The container example now uses the `1.12.0` image, as the [README](https://github.com/ChefTaco/HiveMem/blob/v1.12.0/README.md) at that tag does, with the same `hive-qdrant:1.18.3-3` image and `issue-token` example; the image tags were confirmed in the registry, and the example was not re-run with the new image. The new API behaviour section and the `default` workspace sentence follow the [changelog](https://github.com/ChefTaco/HiveMem/blob/v1.12.0/CHANGELOG.md) entries for 1.10.0, 1.11.0 and 1.12.0 and the [API reference](https://github.com/ChefTaco/HiveMem/blob/v1.12.0/HIVEMEM_API.md) at that tag. None of the three releases changes the storage format; per Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round), an upgrade from Hive 3.14.x still needs `--allow-migrations` for other products' migrations, and because 1.11.0 writes a version 2 pending-write journal that 1.10.x and older refuse, its way back is the pre-upgrade backup. No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [hivemem release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/hivemem.md); what each HiveMem release changed is in its [changelog](https://github.com/ChefTaco/HiveMem/blob/main/CHANGELOG.md).
