# Oathweave

> Identity and access management: OAuth 2.0 and OpenID Connect, role-based access, MFA and passkeys, service identities and an append-only audit trail.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Oathweave) · [Server README](https://github.com/ChefTaco/Oathweave/blob/main/apps/iam-core/README.md)

## Responsibility

Oathweave issues RS256-signed JWTs and keeps sessions, roles, clients, service accounts and audit. Browser sign-in uses Authorization Code with PKCE S256 and explicit resource audiences. Product APIs validate independently. Account links require an approved issuer and subject mapped to an existing product ID; matching email never merges accounts. MFA, passkeys, recovery and consent remain identity-owned.

## In a Hive installation

Oathweave and its private Redis are required in every profile; [Hive](https://hivemagnus.com/guides/hive.md) {{hm.suite}} installs Oathweave {{hm.version:oathweave}} (pinned since {{hm.since:oathweave}}) as a digest-pinned image. Hive provisions the initial operator and registers a public client for each selected product. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md); browser access tokens stay in memory and the identity session stays in cookies only Oathweave receives.

Oathweave 2.5.0 and 2.6.0 add five SQLite migrations, one of which drops the legacy `encryptedPassword` column, and refuse to start while any is pending. Hive declares the result `oathweave-managed-format-2`, so every upgrade from a release before 3.15.0 needs `--allow-migrations`: the installer runs `oathweave migrate --backup-dir /data/migration-backups` on the rehearsal copy, then once on the stopped live store. No earlier Oathweave reads the migrated database, so a code-only rollback to 3.14.x is refused; restore the verified pre-upgrade backup instead. 2.7.0 changes no schema, so the upgrade from Hive 3.15.0 needs no flag. Standalone, the migrations apply on start under `HIVE_AUTO_MIGRATE=true` or with `migrate`, and only the pre-migration backup takes you back.

Native OpenID Connect discovery (`/api/v1/oauth/.well-known/openid-configuration` and the issuer's `.well-known` paths) takes its URLs from `IAM_PUBLIC_URL`, Oathweave's own HTTPS URL without `/api/v1`, or from an HTTPS `JWT_ISSUER`, and otherwise answers 503; JWKS, UserInfo, sign-in and every grant work without it. Oathweave refuses to start when `IAM_PUBLIC_URL` is not HTTPS. Fresh Hive 3.15 installations get it; on an existing installation, add it before the `plan` of the upgrade, as Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#client-addresses-and-oidc-discovery-from-3150) describes.

## Browser sign-in and re-authentication

From Hive 3.15.1, every sign-in to HiveXUI and every re-authentication before a sensitive action, such as an upgrade or a credential change, goes through Oathweave's own sign-in page in the browser, so accounts with MFA and passkey-only accounts can complete both, and no other product handles a password: Emberpath's password relay to Oathweave is retired (see the [Emberpath guide](https://hivemagnus.com/guides/emberpath.md#signing-in-and-re-authentication)). Oathweave 2.7.0, Emberpath 2.10.0 and HiveXUI 0.14.0 work only together for this. It also needs Oathweave's browser sign-in settings (`IAM_BROWSER_ISSUER`, `IAM_BROWSER_AUTHORIZATION_URL`, `IAM_BROWSER_API_BASE_URL` and the HiveXUI client policies in `IAM_BROWSER_CLIENT_POLICIES`), which fresh setup writes and `./hive.sh post-upgrade` adds where they are missing; see [browser sign-in settings](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#browser-sign-in-settings) and the [Hive guide](https://hivemagnus.com/guides/hive.md#upgrade).

What Oathweave 2.7.0 adds for relying parties ([re-authentication](https://github.com/ChefTaco/Oathweave/blob/v2.7.0/apps/iam-core/README.md#re-authentication-prompt-max_age-and-auth_time)):

- **`prompt` and `max_age`** on the authorization endpoint. `prompt=login` (or `select_account`, or `max_age=0`) needs a sign-in completed for that request, so a live SSO session is not enough; `max_age=N` reuses the session only if its last authentication is at most N seconds old; `prompt=consent` forces the consent step; `prompt=none` returns `login_required` or `consent_required` to the client's callback. A needed sign-in answers `401 LOGIN_REQUIRED` with a `reason` and a `loginTicket` bound to the request for 10 minutes. After a sign-in by any method, the same request with the ticket gets a code whose ID token's `auth_time` is that sign-in. A relying party checks `auth_time`, `nonce` and that `sub` is the person it expected; Oathweave issues no `amr` or `acr`. `POST /api/v1/oauth/authorize/cancel` returns `access_denied` to the registered callback.
- **Step-up on the same session.** `POST /api/v1/auth/step-up` takes the password with the account's second factor, or a user-verified passkey assertion alone (options from `POST /api/v1/auth/step-up/options`, bound to the session and its user).
- **Passkeys without a password.** Passwordless sign-in with a discoverable passkey and the passkey-alone step-up are on by default (`IAM_PASSWORDLESS_PASSKEYS`). `IAM_PASSWORDLESS_PASSKEYS=false` keeps passkeys a second factor only; the passkey-alone step-up then answers `400 PASSWORD_REQUIRED`.
- `POST /api/v1/oauth/authorize` now checks the client and redirect URI before the sign-in, so an invalid request without a session answers `400` where it answered `401`.

## Sign-in clients and client addresses

From 2.3.0, exchanging an authorization code at `POST /oauth/token` is bound to the client. A confidential client must send its client secret (`client_secret` in the body, or HTTP Basic), and also its `code_verifier` if it used PKCE. A public client must have started sign-in with an S256 `code_challenge`. Wrong or missing client credentials answer `401 invalid_client`, and a refused exchange does not use up the code. The suite's HiveXUI clients are public PKCE clients and need no change. A confidential client that exchanged codes without its secret must now send it, for example Magnus's standalone UI with `HIVE_OAUTH_CLIENT_SECRET`, or be registered as a public client; a confidential client without a secret gets one with `POST /clients/{id}/rotate-secret`.

Oathweave 2.4.0 to 2.6.0, which Hive 3.15.0 brought in, tighten tokens and sessions ([changelog](https://github.com/ChefTaco/Oathweave/blob/v2.7.0/CHANGELOG.md)). HiveXUI's public PKCE clients need no change:

- Group role assignments reach tokens: a group member gains the group's roles and permissions at the next sign-in or refresh. Review group role assignments before upgrading.
- Confidential clients must send their secret on the `refresh_token` grant. Refresh tokens stop at their session's hard expiry (`JWT_REFRESH_TTL`), and replaying a rotated refresh token revokes the session (`token.refresh_reuse`); a retry within 10 seconds of the rotation gets the pair that rotation issued, while its successor is unused. TOTP codes are accepted once. HTTP Basic client credentials are form-URL-decoded.
- Account lockout follows the stored password policy (5 attempts, 15 minutes by default) instead of `RATE_LIMIT_*`. The token, introspection and revocation endpoints are throttled per address, and a client's `allowedIps` also applies at the token endpoint.
- Introspection and revocation act only on tokens issued to the calling client unless it holds `iam:tokens:introspect` or `iam:tokens:revoke`. A write made with the `hive-router` client's token needs `x-hive-operator`.
- ID tokens and UserInfo carry `preferred_username` and `name` only with the `profile` scope and `email` only with `email`; ID tokens always carry `sid` and `auth_time`. A person's token issued to a relying party other than a HiveXUI client is bound to its audience and reaches only UserInfo and sign-out here.
- Deactivating or deleting a user revokes their sessions and refresh tokens, and a browser sign-out revokes the session's refresh tokens. Revocations are published at `GET /api/v1/hive/events` (`session.revoked`, `user.sessions_revoked`; needs `iam:tokens:introspect` or `iam:sessions:revoke`).
- New and off until configured: the device authorization grant (`IAM_DEVICE_VERIFICATION_URL`) and token exchange (`IAM_TOKEN_EXCHANGE_POLICIES`).

With `TRUSTED_PROXY_IPS` set, `X-Forwarded-For` is now read from the right, skipping trusted proxies, so a caller cannot choose its own address. One proxy that sends a single address, such as the suite ingress, needs no change; behind several proxy tiers, list every tier. From Hive 3.12.7, on an installation without a pinned `console.networkSubnet`, where the ingress runs on Oathweave's host and Oathweave publishes no port of its own, the controller sets `TRUSTED_PROXY_IPS` to the private ranges Docker assigns, so the per-address sign-in limits, audit records and IP allowlists on accounts or clients see browser addresses instead of the ingress's. A hand-added `TRUSTED_PROXY_IPS` in `config/oathweave.env` is replaced on such an installation; installations with a pinned network keep the list setup or `migrate-native` wrote.

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
docker run --rm --network oathweave --env-file iam.env ghcr.io/cheftaco/oathweave:2.7.0 check
docker run -d --name oathweave --network oathweave -p 127.0.0.1:4200:4200 \
  -v oathweave-data:/data --env-file iam.env ghcr.io/cheftaco/oathweave:2.7.0
```

Expected result: `check` reports `Result: OK`, and once the container is healthy, `curl http://127.0.0.1:4200/api/v1/health/ready` reports readiness. The first start creates the database, signing keys and initial `SUPER_ADMIN` account in the `oathweave-data` volume; generated client secrets are in `/data/iam/initial-credentials.env` there. This listener is plain HTTP, so keep it on loopback or behind a TLS proxy, or configure TLS as the server README's [TLS](https://github.com/ChefTaco/Oathweave/blob/v2.7.0/apps/iam-core/README.md#tls) section describes (`TLS_CERT_PATH` and `TLS_KEY_PATH`, without the `HIVE_HEALTH_URL` override). The [Emberpath container example](https://hivemagnus.com/guides/emberpath.md#run-it-on-its-own) needs that: Emberpath reaches Oathweave only over HTTPS, here with a certificate for the name `oathweave`. Native discovery answers 503 until `IAM_PUBLIC_URL` is set. Keep both env files private. Later starts refuse pending migrations unless explicitly allowed, and missing databases or signing keys must be restored rather than regenerated.

## Source review

Reviewed 2026-11-06 against `main` commit `056b33500181db6fbd3c124a40f5bfa7b90a9873`, documentation added after tag `v2.0.1`: [README](https://github.com/ChefTaco/Oathweave/blob/056b33500181db6fbd3c124a40f5bfa7b90a9873/README.md) and [server README](https://github.com/ChefTaco/Oathweave/blob/056b33500181db6fbd3c124a40f5bfa7b90a9873/apps/iam-core/README.md). The commands follow the server README's container example and were run with throwaway containers against the image the [2.0.1 release](https://github.com/ChefTaco/Oathweave/releases/tag/v2.0.1) publishes, which Hive 2.0.0 and 2.0.1 installed. Original attribution and migration history are preserved. License: Apache-2.0.

Release update, 2026-11-27: [Hive 3.15.1](https://github.com/ChefTaco/hive/releases/tag/v3.15.1), tag `v3.15.1`, commit `ac79185031440e1b76f5c62d4c8d0f83f19b98b7`, pins Oathweave 2.7.0, tag [`v2.7.0`](https://github.com/ChefTaco/Oathweave/releases/tag/v2.7.0), commit `5758e9484b59df5caf65530f2d988ead67891a45` (Hive 3.15.0 pinned 2.6.0, commit `36c02b017ed0d6d68d3525ce729d75b7aac1060d`; Hive 3.14.0 to 3.14.3 pinned 2.3.3). The container example now uses the `2.7.0` image, as the [server README](https://github.com/ChefTaco/Oathweave/blob/v2.7.0/apps/iam-core/README.md#run-the-container-image) at that tag does; its environment files and commands are otherwise unchanged, and it was not re-run with the new image. The data format, discovery, browser sign-in and token paragraphs replace the 2.3.3 fresh-installation paragraph and follow the [changelog](https://github.com/ChefTaco/Oathweave/blob/v2.7.0/CHANGELOG.md) entries for 2.4.0 to 2.7.0, the server README's re-authentication, TLS and managed upgrade sections at `v2.7.0`, and Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3151-browser-sign-in-on-every-installation-no-password-relay) for 3.15.1 and [3.15.0](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round) and its [browser sign-in settings](https://github.com/ChefTaco/hive/blob/v3.15.1/deployment/FULL.md#browser-sign-in-settings). No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [oathweave release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/oathweave.md); what each Oathweave release changed is in its [changelog](https://github.com/ChefTaco/Oathweave/blob/main/CHANGELOG.md).
