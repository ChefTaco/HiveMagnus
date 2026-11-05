# Oathweave

> Identity and access management: OAuth 2.0 and OpenID Connect, role-based access, MFA and passkeys, service identities and an append-only audit trail.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Oathweave) · [Server README](https://github.com/ChefTaco/Oathweave/blob/main/apps/iam-core/README.md)

## Responsibility

Oathweave issues RS256-signed JWTs and keeps sessions, roles, clients, service accounts and audit. Browser sign-in uses Authorization Code with PKCE S256 and explicit resource audiences. Product APIs validate independently. Account links require an approved issuer and subject mapped to an existing product ID; matching email never merges accounts. MFA, passkeys, recovery and consent remain identity-owned.

## In a Hive installation

Oathweave and its private Redis are required in every profile; [Hive](https://hivemagnus.com/guides/hive.md) 2.0.0 installs Oathweave 2.0.1 as a digest-pinned image. Hive provisions the initial operator and registers a public client for each selected product. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md); browser access tokens stay in memory and the identity session stays in cookies only Oathweave receives.

## Run it on its own

Requires Node.js 24.22.1+ or 26.13.0+ on Linux or macOS, Redis 7+ and OpenSSL. The published package keeps its original name, `@hivemagnus/hive-iam-server`.

```bash
docker run -d --name hive-redis -p 127.0.0.1:6379:6379 redis:7.4.7-alpine
cat > iam.env <<ENV
HIVE_AUTO_MIGRATE=true
COOKIE_SECRET=$(openssl rand -hex 32)
IAM_AGENT_SECRET=$(openssl rand -hex 32)
SEED_ADMIN_PASSWORD=$(openssl rand -base64 24)
ENV
chmod 600 iam.env
npx --allow-scripts=better-sqlite3,argon2 @hivemagnus/hive-iam-server check --env-file iam.env
npx --allow-scripts=better-sqlite3,argon2 @hivemagnus/hive-iam-server --env-file iam.env
```

Expected result: the first start creates its data directory, signing keys, database and initial `SUPER_ADMIN` account. From another terminal, `curl http://127.0.0.1:4200/api/v1/health/ready` reports readiness. Keep `iam.env` private. Later starts refuse pending migrations unless explicitly allowed, and missing databases or signing keys must be restored rather than regenerated.

## Source review

Reviewed 2026-11-05 against tag `v2.0.1`, commit `dd164d733235cac26c13f410c869f5cf424222a8`: [README](https://github.com/ChefTaco/Oathweave/blob/dd164d733235cac26c13f410c869f5cf424222a8/README.md) and [server README](https://github.com/ChefTaco/Oathweave/blob/dd164d733235cac26c13f410c869f5cf424222a8/apps/iam-core/README.md). The commands follow its quick start. The [2.0.1 release](https://github.com/ChefTaco/Oathweave/releases/tag/v2.0.1) publishes the container image that Hive installs. Original attribution and migration history are preserved. License: Apache-2.0.
