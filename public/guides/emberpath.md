# Emberpath

> OpenAI-compatible model gateway with external providers, routing, failover, quotas and a trace for every request.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Emberpath) · [README](https://github.com/ChefTaco/Emberpath#readme)

## Responsibility

Clients talk to one endpoint. Emberpath picks an upstream provider, fails over when it is safe to, enforces per-key quotas and records a trace for every request, with a separate administration API. Ollama, llama.cpp and hosted APIs are independently operated dependencies: it routes to them and never installs or manages them. Native model endpoints remain distinct from HiveMem client endpoints.

## In a Hive installation

Emberpath is part of the core profile. [Hive](https://hivemagnus.com/guides/hive.md) {{hm.suite}} installs Emberpath {{hm.version:emberpath}} (pinned since {{hm.since:emberpath}}) as a digest-pinned image, verifies external endpoints and registers verified providers. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md), reached through a separate administration listener; the native model API keeps its own listener and API keys.

Emberpath's HiveMem principal is `emberpath`, both for the static `HIVE_ROUTER_MEMORY_PROXY_TOKEN` fallback (minted with `hivemem-server issue-token --env-file hivemem.env --subject emberpath --role admin`) and for the `localId` of its Oathweave link; the setting keeps its Hive Router name. An installation from the Hive Router days whose memory data still belongs to `hive-router` moves it with HiveMem 1.9.0's `hivemem-server rename-agent --from hive-router --to emberpath`, then re-issues the token and updates the link. Hive does this during an upgrade from a release before 3.12.0, which then needs `--allow-migrations`; see the [Hive guide](https://hivemagnus.com/guides/hive.md#upgrade).

Emberpath 2.6.0 moves its router data from `emberpath-managed-format-2` to `emberpath-managed-format-3`, which adds six nullable `Trace` columns and two indexes; it is additive and fast. Every upgrade from a release before 3.14.0 to Hive 3.14.0 or later therefore needs `--allow-migrations`: the installer runs `emberpath migrate` on the restored copy of its pre-change backup, then once on the stopped live store. No earlier release reads the new format, so a code-only rollback from 3.14.0 is refused; recover with the verified pre-upgrade backup. Standalone, apply it with `emberpath migrate` (or `HIVE_AUTO_MIGRATE=true`) when upgrading. Emberpath 2.7.0 to 2.10.0 keep this format and add no migration, so a downgrade to 2.9.0 keeps working.

## Signing in and re-authentication

Emberpath no longer handles Oathweave passwords. From 2.10.0, with `HIVE_ROUTER_AUTH_MODE=iam-oidc` (sign-in through Oathweave, as the [container example](#run-it-on-its-own) and Hive's `migrate-native` set it), `POST /api/auth/login` and `POST /api/auth/reauthenticate` (`/api/emberpath/auth/login` and `/api/emberpath/auth/reauthenticate` through the suite ingress) answer `410 Gone` with `{"error": "PASSWORD_RELAY_DISABLED", "stepUp": "/api/auth/step-up", ...}` unless `EMBERPATH_PASSWORD_RELAY=true` (default `false`). Administrators sign in through HiveXUI on Oathweave's own sign-in page, with a password and MFA or with a passkey. A script or tool that signed in to Emberpath with an Oathweave password stops working: use an Oathweave token or an Emberpath client key instead. Existing admin sessions and `GET /api/auth/me` keep working. OS mode (`HIVE_ROUTER_AUTH_MODE=os`, PAM, the default for a source installation) is no relay: its sign-in and its `POST /api/auth/reauthenticate` with the OS password are unchanged.

Hive 3.15.1's `post-upgrade` writes `EMBERPATH_PASSWORD_RELAY=false` and names an `EMBERPATH_PASSWORD_RELAY=true` it keeps; remove that line (the default is off) and run `post-upgrade` again. A standalone `iam-oidc` installation whose operators still sign in to Emberpath with their Oathweave password must set `EMBERPATH_PASSWORD_RELAY=true` before upgrading to keep doing so. The relay is deprecated: its answers carry `Deprecation`, `Sunset: Mon, 31 May 2027` and `Link: rel="deprecation"` headers, and it is removed in the next major release.

Credential and policy changes (writes to `/api/client-keys`, `/api/iam/clients`, `/api/iam/roles`, `/api/iam/password-policy`, `/api/hive/actors` and `/api/hive/upgrades`) still need a sign-in from the last 15 minutes and otherwise answer `403 STEP_UP_REQUIRED`. The caller confirms it with a fresh Oathweave ID token instead of a password ([step-up with an ID token](https://github.com/ChefTaco/Emberpath/blob/v2.10.0/docs/OATHWEAVE.md#step-up-with-an-id-token)):

1. `POST /api/auth/step-up/challenge` hands out a single-use `nonce`, valid for 10 minutes.
2. The client asks Oathweave for an authorization with `prompt=login` (or `max_age`), PKCE and that nonce, for a client in `EMBERPATH_STEP_UP_AUDIENCES` (default `hivexui-emberpath`), and exchanges the code.
3. `POST /api/auth/step-up` with `{"idToken": "..."}` and an Emberpath access token of the same Oathweave session.

Emberpath checks the token's signature and issuer against `OATHWEAVE_JWKS_URL` and `OATHWEAVE_ISSUER`, its audience, the nonce, the caller's subject and session, and an `auth_time` at most `EMBERPATH_STEP_UP_MAX_AGE_SECONDS` (default 300, 1 to 3600) old and not earlier than the challenge. The session's credential and policy changes then count from that `auth_time` for 15 minutes. Refusals are `401` `REAUTH_REQUIRED`, `REAUTH_STALE` or `REAUTH_INVALID` with a `reason`; without Oathweave browser sign-in configured the step-up answers `503 STEP_UP_UNAVAILABLE`. HiveXUI 0.14.0 does all of this when you confirm in **Verify your identity**; older HiveXUI releases used the password re-authentication, so upgrade HiveXUI with Emberpath. Step-ups are kept in memory: after an Emberpath restart, verify again.

## Changes from 2.7.0 to 2.9.0

Hive 3.15.0 brought these in ([changelog](https://github.com/ChefTaco/Emberpath/blob/v2.10.0/CHANGELOG.md)); none changes the data format:

- `POST /api/pull` needs a client key whose scopes include `ollama:manage` (or `*`).
- A provider's `timeoutMs` is an idle timeout for each wait (headers, then each body chunk), and its `concurrency` limits running streams. Review both on providers that serve long streams. Anthropic providers now receive `stream: true` requests and tools unless their capabilities set `streaming: false`.
- API clients get an allowlist of upstream response headers: the upstream `x-request-id` and `x-ratelimit-*` arrive as `x-emberpath-upstream-*`, and `EMBERPATH_UPSTREAM_RESPONSE_HEADERS=passthrough` restores the old behaviour. A routing denial (`403`) no longer returns `route_decision`.
- Writes through the IAM proxy need `iam:*` permissions instead of `router:admin:write`. Provider circuit breakers count failures in a 60-second window and have a half-open trial.
- Oathweave token URLs must be HTTPS off loopback: startup and `check` stop when `HIVE_IAM_INTERNAL_URL` (with `HIVE_ROUTER_IAM_CLIENT_SECRET` set) or `EMBERPATH_HIVEMEM_TOKEN_URL` is plain HTTP to another host. The suite's already are.
- `EMBERPATH_TRUSTED_PROXIES` (default `loopback`) names the proxies whose `X-Forwarded-For` the admin listener believes; the Hive controller sets it when Emberpath runs on the ingress's host without a published port.
- Client keys can carry per-minute request and token limits, `maxInFlight`, daily and monthly USD budgets and model and provider allowlists, and an exact-match response cache is available (`EMBERPATH_RESPONSE_CACHE_TTL_MS`, off by default).

## Retries and execution traces

From 2.6.0, a failed upstream attempt (a `5xx`, `408` or `429`, a network error, or a stream error before the first token) is retried on the same provider only when the request is safe to repeat: a `GET`, `HEAD` or `OPTIONS`, or a request with an `Idempotency-Key` (or `X-Idempotency-Key`) header. Between attempts Emberpath waits a full-jitter exponential backoff (250 ms doubling to at most 2 s), or the upstream's `Retry-After` when that is longer. A `Retry-After` over 10 s, or a wait that would pass the request deadline, moves to the next provider at once. The deadline is the earlier of `EMBERPATH_REQUEST_DEADLINE_MS` (default 300000) after arrival and the caller's execution `deadline_ms`; no retry or failover starts after it. A stream whose bytes reached the client is never retried or spliced. Every inference-plane answer carries `x-hive-retry`: `exhausted` when Emberpath already retried or failed over and the answer is still a `5xx`, `429` or `408`, so callers should not retry it, otherwise `none`.

Clients may send the suite execution context in `x-hive-execution`, their own `x-request-id` and a W3C `traceparent`. Emberpath records them on the trace as attribution only: routing, quotas and access never read them, its own request ID and the key's `actorId` stay authoritative, invalid values are ignored, and neither `x-hive-execution` nor `x-hive-retry` is forwarded to upstream providers. `GET /api/traces` accepts `executionRoot`, `executionTask` and `executionParent`, and with any of them each trace also carries `execution` and every upstream attempt in order. HiveXUI's Agent 360 Traffic tab uses this for its **Linked to executions** view. Both listeners' `GET /health` list the capabilities `emberpath.execution-trace.v1` and `retry-signal.v1`. See [retries and execution traces](https://github.com/ChefTaco/Emberpath/blob/v2.10.0/README.md#retries-and-execution-traces).

## Provider credentials and redirects

From 2.5.0, a stored provider credential stays with the server it was entered for. An update that changes the scheme, host or port of a provider's `baseUrl` must send the auth secret again in the same request, and give every credential default header its real value or leave it out; otherwise it is refused with `422 provider_origin_change_requires_secret`, nothing changes and the attempt is audited. A path change on the same server keeps the stored credentials, and setting `authMode` to `NONE` with the new address discards the secret. The `CODEX` provider cannot be moved: authorize it again or delete it. HiveXUI's provider form asks for the secret again before it saves such a change.

Provider requests no longer follow redirects. A provider behind a redirect, such as `http://` redirecting to `https://`, fails until `baseUrl` is set to the final address; the trace and health error name the target. Provider reads and configuration exports show `[redacted]` for default header values that may carry a credential, and sending `[redacted]` back keeps the stored value. See [editing a provider](https://github.com/ChefTaco/Emberpath/blob/v2.10.0/README.md#editing-a-provider).

## Run it on its own

Emberpath 2.x ships only as the container image `ghcr.io/cheftaco/emberpath`. `@hivemagnus/emberpath` is not on npm, and the npm package `@hivemagnus/hive-router` is the legacy Hive Router 1.x line: npm resolves it to `1.2.2`, which still bundles the old console. Requires Docker and OpenSSL. The image serves both listeners with TLS and has no PAM, so it runs with `HIVE_ROUTER_AUTH_MODE=iam-oidc`, and administrators sign in through HiveXUI with Oathweave browser sign-in; Emberpath's own password sign-in answers `410 Gone` unless the deprecated `EMBERPATH_PASSWORD_RELAY=true` is set (see [signing in](#signing-in-and-re-authentication)). This joins the network of the [Oathweave container example](https://hivemagnus.com/guides/oathweave.md#run-it-on-its-own) and reads the `hive-router` client secret Oathweave generated. Emberpath sends that secret to Oathweave, so Oathweave must serve HTTPS here, with a certificate for the name `oathweave` (see its [TLS](https://github.com/ChefTaco/Oathweave/blob/v2.7.0/apps/iam-core/README.md#tls) section); plain HTTP is accepted only on a loopback address. Put a certificate and key for the listeners in `tls/` as `server.crt` and `server.key`, and the CA certificate that signed Oathweave's certificate as `tls/oathweave-ca.crt`, all readable by uid 1000.

```bash
umask 077
cat > emberpath.env <<EOF
HIVE_AUTO_MIGRATE=true
HIVE_ROUTER_SECRET=$(openssl rand -hex 32)
HIVE_ROUTER_ADMIN_USERS=admin
HIVE_ROUTER_AUTH_MODE=iam-oidc
HIVE_IAM_INTERNAL_URL=https://oathweave:4200
HIVE_ROUTER_IAM_CA_CERT_PATH=/config/tls/oathweave-ca.crt
HIVE_ROUTER_IAM_CLIENT_SECRET=$(docker exec oathweave sed -n 's/^SEED_HIVE_ROUTER_CLIENT_SECRET=//p' /data/iam/initial-credentials.env)
API_HOST=0.0.0.0
ADMIN_HOST=0.0.0.0
TLS_CERT_PATH=/config/tls/server.crt
TLS_KEY_PATH=/config/tls/server.key
NODE_EXTRA_CA_CERTS=/config/tls/server.crt
EOF
docker run --rm --network oathweave -v emberpath-data:/data -v "$PWD/tls:/config/tls:ro" \
  --env-file emberpath.env ghcr.io/cheftaco/emberpath:2.10.0 check
docker run -d --name emberpath --network oathweave \
  -p 127.0.0.1:4020:4020 -p 127.0.0.1:9443:9443 -v emberpath-data:/data \
  -v "$PWD/tls:/config/tls:ro" --env-file emberpath.env ghcr.io/cheftaco/emberpath:2.10.0
```

Expected result: `check` validates configuration, TLS and Oathweave reachability and starts nothing. Once the container is healthy, `curl --cacert tls/server.crt https://localhost:4020/health` answers, with the OpenAI-compatible API at `https://localhost:4020/v1` and the administration API at `https://localhost:9443/api`. Emberpath has no web UI of its own: it is managed through its administration API, or through HiveXUI in the suite. Non-API paths on the administration listener serve a short page pointing to HiveXUI, or redirect there when `HIVEXUI_URL` is set. Browser sign-in also needs the `OATHWEAVE_ISSUER`, `OATHWEAVE_JWKS_URL` and `OATHWEAVE_USERINFO_URL` settings, which this example does not set and the README's [Oathweave browser sign-in](https://github.com/ChefTaco/Emberpath/blob/v2.10.0/README.md#oathweave-browser-sign-in) section describes; without them a step-up answers `503 STEP_UP_UNAVAILABLE`. See the README for keys, public URLs and HiveMem.

## Source review

Reviewed 2026-11-06 against `main` commit `d5fbb8855a70223972f6e2981fb97f9b2b36ba9b`, documentation added after tag `v2.0.1`: [README](https://github.com/ChefTaco/Emberpath/blob/d5fbb8855a70223972f6e2981fb97f9b2b36ba9b/README.md). The commands follow its container example and were run with throwaway containers, together with the Oathweave example, against the image the [2.0.1 release](https://github.com/ChefTaco/Emberpath/releases/tag/v2.0.1) publishes, which Hive 2.0.0 and 2.0.1 installed; the release attaches no other files. Original attribution and migration history are preserved. License: Apache-2.0.

Release update, 2026-11-27: [Hive 3.15.1](https://github.com/ChefTaco/hive/releases/tag/v3.15.1), tag `v3.15.1`, commit `ac79185031440e1b76f5c62d4c8d0f83f19b98b7`, pins Emberpath 2.10.0, tag [`v2.10.0`](https://github.com/ChefTaco/Emberpath/releases/tag/v2.10.0), commit `c62197aed5ce60a8a31ec2807068829443366c4f` (Hive 3.15.0 pinned 2.9.0, commit `b3e46c9740679b47100e7ca1a935a630fe0569af`; Hive 3.14.0 to 3.14.3 pinned 2.6.0). The container example now follows the [README](https://github.com/ChefTaco/Emberpath/blob/v2.10.0/README.md#run-the-image-on-its-own) at that tag: the `2.10.0` image, `HIVE_IAM_INTERNAL_URL=https://oathweave:4200` and `HIVE_ROUTER_IAM_CA_CERT_PATH` for the CA of Oathweave's certificate (Emberpath 2.9.0 refuses a plain HTTP Oathweave off loopback), and the text on browser sign-in and the retired password relay; it was not re-run. The new signing in and re-authentication section follows the [changelog](https://github.com/ChefTaco/Emberpath/blob/v2.10.0/CHANGELOG.md), the README's admin authentication settings and [docs/OATHWEAVE.md](https://github.com/ChefTaco/Emberpath/blob/v2.10.0/docs/OATHWEAVE.md#password-sign-in-is-retired) at `v2.10.0`, and Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3151-browser-sign-in-on-every-installation-no-password-relay); the 2.7.0 to 2.9.0 section follows the changelog and Hive's [3.15.0 notes](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round). The README links now name `v2.10.0`. No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [emberpath release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/emberpath.md); what each Emberpath release changed is in its [changelog](https://github.com/ChefTaco/Emberpath/blob/main/CHANGELOG.md).
