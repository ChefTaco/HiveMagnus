# Oathweave

> Identity and access management: OAuth 2.0 and OpenID Connect, role-based access, MFA and passkeys, service identities and an append-only audit trail.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Oathweave) · [Server README](https://github.com/ChefTaco/Oathweave/blob/main/apps/iam-core/README.md)

## Responsibility

Oathweave issues RS256-signed JWTs and keeps sessions, roles, clients, service accounts and audit. Browser sign-in uses Authorization Code with PKCE S256 and explicit resource audiences. Product APIs validate independently. Account links require an approved issuer and subject mapped to an existing product ID; matching email never merges accounts. MFA, passkeys, recovery and consent remain identity-owned.

## In a Hive installation

Oathweave and its private Redis are required in every profile; [Hive](https://hivemagnus.com/guides/hive.md) 3.8.0 installs Oathweave 2.3.0 as a digest-pinned image. Hive provisions the initial operator and registers a public client for each selected product. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md); browser access tokens stay in memory and the identity session stays in cookies only Oathweave receives.

## Sign-in clients and client addresses

From 2.3.0, exchanging an authorization code at `POST /oauth/token` is bound to the client. A confidential client must send its client secret (`client_secret` in the body, or HTTP Basic), and also its `code_verifier` if it used PKCE. A public client must have started sign-in with an S256 `code_challenge`. Wrong or missing client credentials answer `401 invalid_client`, and a refused exchange does not use up the code. The suite's HiveXUI clients are public PKCE clients and need no change. A confidential client that exchanged codes without its secret must now send it, for example Magnus's standalone UI with `HIVE_OAUTH_CLIENT_SECRET`, or be registered as a public client; a confidential client without a secret gets one with `POST /clients/{id}/rotate-secret`.

With `TRUSTED_PROXY_IPS` set, `X-Forwarded-For` is now read from the right, skipping trusted proxies, so a caller cannot choose its own address. One proxy that sends a single address, such as the suite ingress, needs no change; behind several proxy tiers, list every tier.

## Run it on its own

Oathweave 2.x ships only as the container image `ghcr.io/cheftaco/oathweave`. The npm package `@hivemagnus/hive-iam-server` is the legacy Hive IAM 1.x line: npm resolves it to `1.2.2`, not to this release, and `@hivemagnus/oathweave` is not on npm. Requires Docker and OpenSSL. This runs Oathweave and a password-protected Redis on a private Docker network and publishes Oathweave on loopback only:

```bash
umask 077
printf 'REDIS_PASSWORD=%s\n' "$(openssl rand -hex 32)" > redis.env
. ./redis.env
cat > iam.env <<EOF
HIVE_AUTO_MIGRATE=true
COOKIE_SECRET=$(openssl rand -hex 32)
IAM_AGENT_SECRET=$(openssl rand -hex 32)
SEED_ADMIN_PASSWORD=$(openssl rand -base64 24)
REDIS_URL=redis://:$REDIS_PASSWORD@oathweave-redis:6379
HIVE_HEALTH_URL=http://localhost:4200/api/v1/health/ready
EOF
docker network create oathweave
docker run -d --name oathweave-redis --network oathweave --env-file redis.env \
  -v oathweave-redis:/data redis:7.4.7-alpine \
  sh -c 'exec redis-server --requirepass "$REDIS_PASSWORD" --appendonly yes'
docker run --rm --network oathweave --env-file iam.env ghcr.io/cheftaco/oathweave:2.3.0 check
docker run -d --name oathweave --network oathweave -p 127.0.0.1:4200:4200 \
  -v oathweave-data:/data --env-file iam.env ghcr.io/cheftaco/oathweave:2.3.0
```

Expected result: `check` reports `Result: OK`, and once the container is healthy, `curl http://127.0.0.1:4200/api/v1/health/ready` reports readiness. The first start creates the database, signing keys and initial `SUPER_ADMIN` account in the `oathweave-data` volume; generated client secrets are in `/data/iam/initial-credentials.env` there. This listener is plain HTTP, so keep it on loopback or behind a TLS proxy, or configure TLS as the server README describes. Keep both env files private. Later starts refuse pending migrations unless explicitly allowed, and missing databases or signing keys must be restored rather than regenerated.

## Source review

Reviewed 2026-11-06 against `main` commit `056b33500181db6fbd3c124a40f5bfa7b90a9873`, documentation added after tag `v2.0.1`: [README](https://github.com/ChefTaco/Oathweave/blob/056b33500181db6fbd3c124a40f5bfa7b90a9873/README.md) and [server README](https://github.com/ChefTaco/Oathweave/blob/056b33500181db6fbd3c124a40f5bfa7b90a9873/apps/iam-core/README.md). The commands follow the server README's container example and were run with throwaway containers against the image the [2.0.1 release](https://github.com/ChefTaco/Oathweave/releases/tag/v2.0.1) publishes, which Hive 2.0.0 and 2.0.1 installed. Original attribution and migration history are preserved. License: Apache-2.0.

Release update, 2026-11-13: [Hive 3.7.0](https://github.com/ChefTaco/hive/releases/tag/v3.7.0) pins Oathweave 2.2.0, tag [`v2.2.0`](https://github.com/ChefTaco/Oathweave/releases/tag/v2.2.0), commit `3b6d7df399b72f16630b6af16ca3d49040eae2ac`. The container example now uses the `2.1.2` image, the version the [server README](https://github.com/ChefTaco/Oathweave/blob/v2.2.0/apps/iam-core/README.md) at that tag names; its environment files and commands are otherwise identical to the reviewed 2.0.1 example, and it was not re-run with the new image. Each release is tagged with its exact version, so replace `2.1.2` to run another one.

Release update, 2026-11-14: [Hive 3.8.0](https://github.com/ChefTaco/hive/releases/tag/v3.8.0) pins Oathweave 2.3.0, tag [`v2.3.0`](https://github.com/ChefTaco/Oathweave/releases/tag/v2.3.0), commit `d2ac3c08c8a55200160321f51bd807515bb0d249`. The container example now uses the `2.3.0` image, as the [server README](https://github.com/ChefTaco/Oathweave/blob/v2.3.0/apps/iam-core/README.md) at that tag does; its environment files and commands are otherwise unchanged, and it was not re-run with the new image. The sign-in and client address rules above follow the [changelog](https://github.com/ChefTaco/Oathweave/blob/v2.3.0/CHANGELOG.md) and the server README's client address section at that tag.
