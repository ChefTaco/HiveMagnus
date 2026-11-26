# Emberpath

> OpenAI-compatible model gateway with external providers, routing, failover, quotas and a trace for every request.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Emberpath) · [README](https://github.com/ChefTaco/Emberpath#readme)

## Responsibility

Clients talk to one endpoint. Emberpath picks an upstream provider, fails over when it is safe to, enforces per-key quotas and records a trace for every request, with a separate administration API. Ollama, llama.cpp and hosted APIs are independently operated dependencies: it routes to them and never installs or manages them. Native model endpoints remain distinct from HiveMem client endpoints.

## In a Hive installation

Emberpath is part of the core profile. [Hive](https://hivemagnus.com/guides/hive.md) 3.14.3 installs Emberpath 2.6.0 (pinned since 3.14.0) as a digest-pinned image, verifies external endpoints and registers verified providers. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md), reached through a separate administration listener; the native model API keeps its own listener and API keys.

Emberpath's HiveMem principal is `emberpath`, both for the static `HIVE_ROUTER_MEMORY_PROXY_TOKEN` fallback (minted with `hivemem-server issue-token --env-file hivemem.env --subject emberpath --role admin`) and for the `localId` of its Oathweave link; the setting keeps its Hive Router name. An installation from the Hive Router days whose memory data still belongs to `hive-router` moves it with HiveMem 1.9.0's `hivemem-server rename-agent --from hive-router --to emberpath`, then re-issues the token and updates the link. Hive does this during an upgrade from a release before 3.12.0, which then needs `--allow-migrations`; see the [Hive guide](https://hivemagnus.com/guides/hive.md#upgrade).

Emberpath 2.6.0 moves its router data from `emberpath-managed-format-2` to `emberpath-managed-format-3`, which adds six nullable `Trace` columns and two indexes; it is additive and fast. Every upgrade from a release before 3.14.0 to Hive 3.14.0 or later therefore needs `--allow-migrations`: the installer runs `emberpath migrate` on the restored copy of its pre-change backup, then once on the stopped live store. No earlier release reads the new format, so a code-only rollback from 3.14.0 is refused; recover with the verified pre-upgrade backup. Standalone, apply it with `emberpath migrate` (or `HIVE_AUTO_MIGRATE=true`) when upgrading.

## Retries and execution traces

From 2.6.0, a failed upstream attempt (a `5xx`, `408` or `429`, a network error, or a stream error before the first token) is retried on the same provider only when the request is safe to repeat: a `GET`, `HEAD` or `OPTIONS`, or a request with an `Idempotency-Key` (or `X-Idempotency-Key`) header. Between attempts Emberpath waits a full-jitter exponential backoff (250 ms doubling to at most 2 s), or the upstream's `Retry-After` when that is longer. A `Retry-After` over 10 s, or a wait that would pass the request deadline, moves to the next provider at once. The deadline is the earlier of `EMBERPATH_REQUEST_DEADLINE_MS` (default 300000) after arrival and the caller's execution `deadline_ms`; no retry or failover starts after it. A stream whose bytes reached the client is never retried or spliced. Every inference-plane answer carries `x-hive-retry`: `exhausted` when Emberpath already retried or failed over and the answer is still a `5xx`, `429` or `408`, so callers should not retry it, otherwise `none`.

Clients may send the suite execution context in `x-hive-execution`, their own `x-request-id` and a W3C `traceparent`. Emberpath records them on the trace as attribution only: routing, quotas and access never read them, its own request ID and the key's `actorId` stay authoritative, invalid values are ignored, and neither `x-hive-execution` nor `x-hive-retry` is forwarded to upstream providers. `GET /api/traces` accepts `executionRoot`, `executionTask` and `executionParent`, and with any of them each trace also carries `execution` and every upstream attempt in order. HiveXUI's Agent 360 Traffic tab uses this for its **Linked to executions** view. Both listeners' `GET /health` list the capabilities `emberpath.execution-trace.v1` and `retry-signal.v1`. See [retries and execution traces](https://github.com/ChefTaco/Emberpath/blob/v2.6.0/README.md#retries-and-execution-traces).

## Provider credentials and redirects

From 2.5.0, a stored provider credential stays with the server it was entered for. An update that changes the scheme, host or port of a provider's `baseUrl` must send the auth secret again in the same request, and give every credential default header its real value or leave it out; otherwise it is refused with `422 provider_origin_change_requires_secret`, nothing changes and the attempt is audited. A path change on the same server keeps the stored credentials, and setting `authMode` to `NONE` with the new address discards the secret. The `CODEX` provider cannot be moved: authorize it again or delete it. HiveXUI's provider form asks for the secret again before it saves such a change.

Provider requests no longer follow redirects. A provider behind a redirect, such as `http://` redirecting to `https://`, fails until `baseUrl` is set to the final address; the trace and health error name the target. Provider reads and configuration exports show `[redacted]` for default header values that may carry a credential, and sending `[redacted]` back keeps the stored value. See [editing a provider](https://github.com/ChefTaco/Emberpath/blob/v2.5.0/README.md#editing-a-provider).

## Run it on its own

Emberpath 2.x ships only as the container image `ghcr.io/cheftaco/emberpath`. `@hivemagnus/emberpath` is not on npm, and the npm package `@hivemagnus/hive-router` is the legacy Hive Router 1.x line: npm resolves it to `1.2.2`, which still bundles the old console. Requires Docker and OpenSSL. The image serves both listeners with TLS and has no PAM, so administrators sign in through Oathweave. This joins the network of the [Oathweave container example](https://hivemagnus.com/guides/oathweave.md#run-it-on-its-own) and reads the `hive-router` client secret Oathweave generated. Put a certificate and key for the listeners in `tls/` as `server.crt` and `server.key`, readable by uid 1000.

```bash
umask 077
cat > emberpath.env <<EOF
HIVE_AUTO_MIGRATE=true
HIVE_ROUTER_SECRET=$(openssl rand -hex 32)
HIVE_ROUTER_ADMIN_USERS=admin
HIVE_ROUTER_AUTH_MODE=iam-oidc
HIVE_IAM_INTERNAL_URL=http://oathweave:4200
HIVE_ROUTER_IAM_CLIENT_SECRET=$(docker exec oathweave sed -n 's/^SEED_HIVE_ROUTER_CLIENT_SECRET=//p' /data/iam/initial-credentials.env)
API_HOST=0.0.0.0
ADMIN_HOST=0.0.0.0
TLS_CERT_PATH=/config/tls/server.crt
TLS_KEY_PATH=/config/tls/server.key
NODE_EXTRA_CA_CERTS=/config/tls/server.crt
EOF
docker run --rm --network oathweave -v emberpath-data:/data -v "$PWD/tls:/config/tls:ro" \
  --env-file emberpath.env ghcr.io/cheftaco/emberpath:2.6.0 check
docker run -d --name emberpath --network oathweave \
  -p 127.0.0.1:4020:4020 -p 127.0.0.1:9443:9443 -v emberpath-data:/data \
  -v "$PWD/tls:/config/tls:ro" --env-file emberpath.env ghcr.io/cheftaco/emberpath:2.6.0
```

Expected result: `check` validates configuration, TLS and Oathweave reachability and starts nothing. Once the container is healthy, `curl --cacert tls/server.crt https://localhost:4020/health` answers, with the OpenAI-compatible API at `https://localhost:4020/v1` and the administration API at `https://localhost:9443/api`. Emberpath has no web UI of its own: it is managed through its administration API, or through HiveXUI in the suite. Non-API paths on the administration listener serve a short page pointing to HiveXUI, or redirect there when `HIVEXUI_URL` is set. See the README for keys, public URLs and HiveMem.

## Source review

Reviewed 2026-11-06 against `main` commit `d5fbb8855a70223972f6e2981fb97f9b2b36ba9b`, documentation added after tag `v2.0.1`: [README](https://github.com/ChefTaco/Emberpath/blob/d5fbb8855a70223972f6e2981fb97f9b2b36ba9b/README.md). The commands follow its container example and were run with throwaway containers, together with the Oathweave example, against the image the [2.0.1 release](https://github.com/ChefTaco/Emberpath/releases/tag/v2.0.1) publishes, which Hive 2.0.0 and 2.0.1 installed; the release attaches no other files. Original attribution and migration history are preserved. License: Apache-2.0.

Release update, 2026-11-24: [Hive 3.14.0](https://github.com/ChefTaco/hive/releases/tag/v3.14.0), tag `v3.14.0`, commit `d182802ce71edb17501ef68f2eaec802aca19e9a`, pins Emberpath 2.6.0, tag [`v2.6.0`](https://github.com/ChefTaco/Emberpath/releases/tag/v2.6.0), commit `7cd32f83a0cf59fd69872dfb0e53ec9f8fff2daa` (Hive 3.12.9 to 3.13.5 pinned 2.5.4). The container example now uses the `2.6.0` image, as the [README](https://github.com/ChefTaco/Emberpath/blob/v2.6.0/README.md) at that tag does; its environment file and commands are otherwise unchanged, and it was not re-run with the new image. The data format paragraph and the retries and execution traces section follow the [changelog](https://github.com/ChefTaco/Emberpath/blob/v2.6.0/CHANGELOG.md), the README's retries and execution traces section and Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.14.0/UPGRADING.md#suite-3140-ardent-execution-recovery-lineage-and-artifact-transfer-v2). No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [emberpath release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/emberpath.md); what each Emberpath release changed is in its [changelog](https://github.com/ChefTaco/Emberpath/blob/main/CHANGELOG.md).
