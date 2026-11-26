# HiveSkills

> The skills registry for agents: a digest-verified archive API with immutable releases, channels, assignments and audited distribution.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveSkills) · [README](https://github.com/ChefTaco/HiveSkills#readme)

## Responsibility

The registry distributes authenticated manifests and immutable archives. It is unrelated to the [Hive Registry](https://hivemagnus.com/guides/hive.md#hive-registry), which catalogs one installation's products. Approved host deployment runs through Magnus jobs and agents with a dedicated endpoint-scoped grant that cannot run arbitrary commands or administer the fleet.

## In a Hive installation

HiveSkills is part of the core profile; [Hive](https://hivemagnus.com/guides/hive.md) 3.14.3 installs HiveSkills 1.9.1 (pinned since 3.14.1) as a digest-pinned image. Its catalogue, archive and assignment screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md), which is its only UI: HiveSkills retired its own web UI in 1.6.0. Native host mappings are prepared separately and are never activated by installation alone.

## Pinned releases

Releases are immutable, so a definition can pin a skill to an exact version and digest. From 1.9.0 (`skills.pinned-release.v1`), `GET /v1/skills/:slug/releases/:version` returns one release by exact version, promoted or not: its `sha256`, archive `size`, `notes`, Hermes `compatibility`, the `channels` it is promoted on, `archiveUrl` and `createdAt`, and `GET /v1/skills/:slug/releases/:version/archive` also serves releases that are not promoted, with `X-Content-SHA256`. Both need an enrolled target (`?target=` with its bearer token, only for skills the target is assigned) or a registry administrator; anonymous callers get `401` from the metadata route, and the archive route still serves anonymously only the release promoted on the requested channel. Releases of a disabled skill are not served. The archive route now checks the stored bytes against the release digest before serving any archive and answers `500` without the bytes when they differ. Magnus 3.3.0 uses these routes for pinned skill installs. No storage change. From 1.9.1, `GET /health/live`, `GET /health/ready` and `GET /healthz` also list `capabilities: ["skills.pinned-release.v1"]`, so a Magnus without the Hive Registry can tell from the liveness probe that pinned releases are served; every other field, status code and header is unchanged.

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
  --env-file skills.env ghcr.io/cheftaco/hiveskills:1.9.1 check
docker run -d --name hiveskills -p 127.0.0.1:4030:4030 -v hiveskills-data:/data \
  -v "$PWD/tls:/config/tls:ro" --env-file skills.env ghcr.io/cheftaco/hiveskills:1.9.1
```

Expected result: `check` validates TLS, configuration and storage without creating state and reports `Result: ready to start`. Once the container is healthy, `curl --cacert tls/server.crt https://localhost:4030/healthz` reports readiness, and a fresh install starts with an empty catalog; `docker exec hiveskills node dist/cli.js seed` adds the bundled HiveMem skill. The image does not include PAM, so the OS-authenticated operator sign-in is not available in a container; the catalog, manifest and archive APIs work without it, and the suite signs administrators in through Oathweave. There is no web UI: `GET /` serves a static page pointing to HiveXUI, or redirects there when `HIVEXUI_URL` is set.

## Source review

Reviewed 2026-11-06 against `main` commit `aa4fa782509912a95584738d12b3e4b343b19dc9`, documentation added after tag `v1.3.1`: [README](https://github.com/ChefTaco/HiveSkills/blob/aa4fa782509912a95584738d12b3e4b343b19dc9/README.md). The commands follow its container example and were run with throwaway containers against the image the [1.3.1 release](https://github.com/ChefTaco/HiveSkills/releases/tag/v1.3.1) publishes, which is the image Hive installs. Original attribution and migration history are preserved. License: Apache-2.0.

Release update, 2026-11-24: [Hive 3.14.1](https://github.com/ChefTaco/hive/releases/tag/v3.14.1), tag `v3.14.1`, commit `0914f3892f1fba7fbbea8e53825b62d28961dec1`, pins HiveSkills 1.9.1, tag [`v1.9.1`](https://github.com/ChefTaco/HiveSkills/releases/tag/v1.9.1), commit `4dd456bc798eb794b2761f747e5ca0cfc87cb876` (Hive 3.14.0 pinned 1.9.0). The container example now uses the `1.9.1` image, as the [README](https://github.com/ChefTaco/HiveSkills/blob/v1.9.1/README.md) at that tag does; its environment file and commands are otherwise unchanged, and it was not re-run with the new image. The health capability sentence in the pinned releases section follows the [changelog](https://github.com/ChefTaco/HiveSkills/blob/v1.9.1/CHANGELOG.md) and the README's route list at that tag. It adds no migration. No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [hiveskills release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/hiveskills.md); what each HiveSkills release changed is in its [changelog](https://github.com/ChefTaco/HiveSkills/blob/main/CHANGELOG.md).
