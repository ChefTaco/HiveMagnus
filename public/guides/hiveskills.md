# HiveSkills

> The skills registry for agents: a digest-verified archive API with immutable releases, channels, assignments and audited distribution.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveSkills) · [README](https://github.com/ChefTaco/HiveSkills#readme)

## Responsibility

The registry distributes authenticated manifests and immutable archives. It is unrelated to the [Hive Registry](https://hivemagnus.com/guides/hive.md#hive-registry), which catalogs one installation's products. Approved host deployment runs through Magnus jobs and agents with a dedicated endpoint-scoped grant that cannot run arbitrary commands or administer the fleet.

## In a Hive installation

HiveSkills is part of the core profile; [Hive](https://hivemagnus.com/guides/hive.md) 2.0.0 installs HiveSkills 1.3.1 as a digest-pinned image. Its catalogue, archive and assignment screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md). Native host mappings are prepared separately and are never activated by installation alone.

## Run it on its own

HiveSkills 1.3 ships only as the container image `ghcr.io/cheftaco/hiveskills`. It is not on npm: npm resolves `@hivemagnus/hive-skills` to `1.2.2`, the legacy line from the Hive repository. Requires Docker and OpenSSL. The registry always serves HTTPS: put a certificate and key covering its public URL in `tls/` as `server.crt` and `server.key`, readable by the container's `node` user (uid 1000).

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
  --env-file skills.env ghcr.io/cheftaco/hiveskills:1.3.1 check
docker run -d --name hiveskills -p 127.0.0.1:4030:4030 -v hiveskills-data:/data \
  -v "$PWD/tls:/config/tls:ro" --env-file skills.env ghcr.io/cheftaco/hiveskills:1.3.1
```

Expected result: `check` validates TLS, configuration and storage without creating state and reports `Result: ready to start`. Once the container is healthy, `curl --cacert tls/server.crt https://localhost:4030/healthz` reports readiness, and a fresh install starts with an empty catalog; `docker exec hiveskills node dist/cli.js seed` adds the bundled HiveMem skill. The image does not include PAM, so the OS-authenticated operator sign-in is not available in a container; the catalog, manifest and archive APIs work without it, and the suite signs administrators in through Oathweave.

## Source review

Reviewed 2026-11-06 against `main` commit `aa4fa782509912a95584738d12b3e4b343b19dc9`, documentation added after tag `v1.3.1`: [README](https://github.com/ChefTaco/HiveSkills/blob/aa4fa782509912a95584738d12b3e4b343b19dc9/README.md). The commands follow its container example and were run with throwaway containers against the image the [1.3.1 release](https://github.com/ChefTaco/HiveSkills/releases/tag/v1.3.1) publishes, which is the image Hive installs. Original attribution and migration history are preserved. License: Apache-2.0.
