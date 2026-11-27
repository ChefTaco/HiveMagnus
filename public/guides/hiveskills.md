# HiveSkills

> The skills registry for agents: a digest-verified archive API with immutable releases, channels, assignments and audited distribution.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveSkills) · [README](https://github.com/ChefTaco/HiveSkills#readme)

## Responsibility

The registry distributes authenticated manifests and immutable archives. It is unrelated to the [Hive Registry](https://hivemagnus.com/guides/hive.md#hive-registry), which catalogs one installation's products. Approved host deployment runs through Magnus jobs and agents with a dedicated endpoint-scoped grant that cannot run arbitrary commands or administer the fleet.

## In a Hive installation

HiveSkills is part of the core profile; [Hive](https://hivemagnus.com/guides/hive.md) {{hm.suite}} installs HiveSkills {{hm.version:hiveskills}} (pinned since {{hm.since:hiveskills}}) as a digest-pinned image. Its catalogue, archive and assignment screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md), which is its only UI: HiveSkills retired its own web UI in 1.6.0. Native host mappings are prepared separately and are never activated by installation alone.

## Pinned releases

Releases are immutable, so a definition can pin a skill to an exact version and digest. From 1.9.0 (`skills.pinned-release.v1`), `GET /v1/skills/:slug/releases/:version` returns one release by exact version, promoted or not: its `sha256`, archive `size`, `notes`, Hermes `compatibility`, the `channels` it is promoted on, `archiveUrl` and `createdAt`, and `GET /v1/skills/:slug/releases/:version/archive` also serves releases that are not promoted, with `X-Content-SHA256`. Both need an enrolled target (`?target=` with its bearer token, only for skills the target is assigned) or a registry administrator; anonymous callers get `401` from the metadata route, and the archive route still serves anonymously only the release promoted on the requested channel. Releases of a disabled skill are not served. The archive route now checks the stored bytes against the release digest before serving any archive and answers `500` without the bytes when they differ. Magnus 3.3.0 uses these routes for pinned skill installs. No storage change. From 1.10.0, the pinned-release metadata also reports `signature` and `advisory`, and an archive download of an advised release carries `X-Release-Advisory: deprecated|yanked`. From 1.9.1, `GET /health/live`, `GET /health/ready` and `GET /healthz` also list `capabilities: ["skills.pinned-release.v1"]`, so a Magnus without the Hive Registry can tell from the liveness probe that pinned releases are served; every other field, status code and header is unchanged.

## Signed releases and request limits

HiveSkills 1.10.0 adds two additive migrations, `managed-format-4` (release advisories) and `managed-format-5` (release signatures), so a suite upgrade from an earlier release needs `--allow-migrations`; 1.11.0 and 1.11.1 keep `managed-format-5`. Hive 3.15.0 declares `hiveskills-managed-format-5`. Older binaries still read the data.

- Publisher-signed releases: a release can carry an Ed25519 publisher signature (`scripts/sign-release.mjs` generates keys and signs), given at upload or attached later with `PUT /admin/skills/:slug/releases/:version/signature`. The registry checks it against `HIVE_SKILLS_PUBLISHER_KEYS`, and with `HIVE_SKILLS_REQUIRE_SIGNED_RELEASES=true` refuses unsigned uploads.
- Pinning the same `HIVE_SKILLS_PUBLISHER_KEYS` in a Hermes bridge's environment (`~/.config/hive-skills/bridge.env`) makes that host refuse the whole sync, before downloading or activating anything, unless every release it is about to install is signed by a pinned key. That includes releases published earlier and the bundled HiveMem seed, which is unsigned: sign them before pinning keys. From 1.11.0 the bridge also checks skills installed before the keys were pinned and reports an unsigned one, or with `HIVE_SKILLS_UNSIGNED_INSTALLED=quarantine` moves it out of the gateway and fails the sync. Redeploy the bridge to agent hosts (`scripts/deploy-hermes-agent.sh`) after upgrading to get these checks; without pinned keys nothing changes.
- Request bodies are limited per route: a release upload may be 70 MiB as JSON or 50 MiB as a raw `application/gzip` archive, an agent receipt 256 KiB, and every other body, `POST /auth/login` included, 64 KiB (`413` above it).
- Errors use the suite envelope `{"error":{"code","message","requestId"}}`, so a client that read `error` as a string reads `error.message`. `GET /health/live` and `GET /healthz` report `release` as the package version instead of `1.2.2`.
- One client address may fail sign-in 10 times in 5 minutes across every account, then gets `429` with `Retry-After`; behind a reverse proxy set `HIVE_SKILLS_TRUSTED_PROXIES` (exact addresses, CIDR ranges or the `loopback`, `private` and `linklocal` presets), which the Hive controller sets. Oathweave bearer sign-in is not throttled.
- Releases can carry a `deprecated` or `yanked` notice (`PUT /admin/skills/:slug/releases/:version/advisory`); they stay immutable and downloadable, and a yanked release cannot be promoted. Opt-in canary automation (`HIVE_SKILLS_CANARY_PROMOTE_AFTER`, `HIVE_SKILLS_CANARY_AUTO_ROLLBACK`) is off by default.

## Run it on its own

HiveSkills ships only as the container image `ghcr.io/cheftaco/hiveskills`. It is not on npm: npm resolves `@hivemagnus/hive-skills` to `1.2.2`, the legacy line from the Hive repository. Requires Docker and OpenSSL. The registry always serves HTTPS: put a certificate and key covering its public URL in `tls/` as `server.crt` and `server.key`, readable by the container's `node` user (uid 1000).

```bash
umask 077
cat > skills.env <<EOF
NODE_ENV=production
HIVE_AUTO_MIGRATE=true
HIVE_SKILLS_PUBLIC_URL=https://localhost:4030
HIVE_SKILLS_DATA_DIR=/data/skills
HIVE_SKILLS_SESSION_SECRET=$(openssl rand -hex 32)
HIVE_SKILLS_ADMIN_USERS=admin
HIVE_SKILLS_TLS_CERT_FILE=/config/tls/server.crt
HIVE_SKILLS_TLS_KEY_FILE=/config/tls/server.key
NODE_EXTRA_CA_CERTS=/config/tls/server.crt
EOF
docker run --rm -v hiveskills-data:/data -v "$PWD/tls:/config/tls:ro" \
  --env-file skills.env ghcr.io/cheftaco/hiveskills:1.11.1 check
docker run -d --name hiveskills -p 127.0.0.1:4030:4030 -v hiveskills-data:/data \
  -v "$PWD/tls:/config/tls:ro" --env-file skills.env ghcr.io/cheftaco/hiveskills:1.11.1
```

Expected result: `check` validates TLS, configuration and storage without creating state and reports `Result: ready to start`. Once the container is healthy, `curl --cacert tls/server.crt https://localhost:4030/healthz` reports readiness, and a fresh install starts with an empty catalog; `docker exec hiveskills node dist/cli.js seed` adds the bundled HiveMem skill, which is unsigned. The image does not include PAM, so the OS-authenticated operator sign-in is not available in a container; the catalog, manifest and archive APIs work without it, and the suite signs administrators in through Oathweave. There is no web UI: `GET /` serves a static page pointing to HiveXUI, or redirects there when `HIVEXUI_URL` is set.

## Source review

Reviewed 2026-11-06 against `main` commit `aa4fa782509912a95584738d12b3e4b343b19dc9`, documentation added after tag `v1.3.1`: [README](https://github.com/ChefTaco/HiveSkills/blob/aa4fa782509912a95584738d12b3e4b343b19dc9/README.md). The commands follow its container example and were run with throwaway containers against the image the [1.3.1 release](https://github.com/ChefTaco/HiveSkills/releases/tag/v1.3.1) publishes, which is the image Hive installs. Original attribution and migration history are preserved. License: Apache-2.0.

Release update, 2026-11-27: [Hive 3.15.1](https://github.com/ChefTaco/hive/releases/tag/v3.15.1), tag `v3.15.1`, commit `ac79185031440e1b76f5c62d4c8d0f83f19b98b7`, pins HiveSkills 1.11.1, tag [`v1.11.1`](https://github.com/ChefTaco/HiveSkills/releases/tag/v1.11.1), commit `4015f2115dbb57010df1d90b788c75cfe55bc775`, as Hive 3.15.0 first did (Hive 3.14.1 to 3.14.3 pinned 1.9.1). The container example now uses the `1.11.1` image, as the [README](https://github.com/ChefTaco/HiveSkills/blob/v1.11.1/README.md) at that tag does; its environment file and commands are otherwise unchanged, the image tag was confirmed in the registry, and it was not re-run with the new image. The signed releases and request limits section and the pinned releases additions follow the [changelog](https://github.com/ChefTaco/HiveSkills/blob/v1.11.1/CHANGELOG.md) entries for 1.10.0, 1.11.0 and 1.11.1 and the README's pinned releases, canary and publisher-signed releases sections at that tag; 1.11.1 itself changes only repository tooling. Per Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round), an upgrade from Hive 3.14.x needs `--allow-migrations` and the Hermes bridge should be redeployed afterwards. No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [hiveskills release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/hiveskills.md); what each HiveSkills release changed is in its [changelog](https://github.com/ChefTaco/HiveSkills/blob/main/CHANGELOG.md).
