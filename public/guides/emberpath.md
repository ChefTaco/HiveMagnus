# Emberpath

> OpenAI-compatible model gateway with external providers, routing, failover, quotas and a trace for every request.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Emberpath) · [README](https://github.com/ChefTaco/Emberpath#readme)

## Responsibility

Clients talk to one endpoint. Emberpath picks an upstream provider, fails over when it is safe to, enforces per-key quotas and records a trace for every request, with a separate administration API. Ollama, llama.cpp and hosted APIs are independently operated dependencies: it routes to them and never installs or manages them. Native model endpoints remain distinct from HiveMem client endpoints.

## In a Hive installation

Emberpath is part of the core profile. [Hive](https://hivemagnus.com/guides/hive.md) 3.8.0 installs Emberpath 2.5.0 as a digest-pinned image, verifies external endpoints and registers verified providers. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md), reached through a separate administration listener; the native model API keeps its own listener and API keys.

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
  --env-file emberpath.env ghcr.io/cheftaco/emberpath:2.5.0 check
docker run -d --name emberpath --network oathweave \
  -p 127.0.0.1:4020:4020 -p 127.0.0.1:9443:9443 -v emberpath-data:/data \
  -v "$PWD/tls:/config/tls:ro" --env-file emberpath.env ghcr.io/cheftaco/emberpath:2.5.0
```

Expected result: `check` validates configuration, TLS and Oathweave reachability and starts nothing. Once the container is healthy, `curl --cacert tls/server.crt https://localhost:4020/health` answers, with the OpenAI-compatible API at `https://localhost:4020/v1` and the administration API at `https://localhost:9443/api`. Emberpath has no web UI of its own: it is managed through its administration API, or through HiveXUI in the suite. Non-API paths on the administration listener serve a short page pointing to HiveXUI, or redirect there when `HIVEXUI_URL` is set. See the README for keys, public URLs and HiveMem.

## Source review

Reviewed 2026-11-06 against `main` commit `d5fbb8855a70223972f6e2981fb97f9b2b36ba9b`, documentation added after tag `v2.0.1`: [README](https://github.com/ChefTaco/Emberpath/blob/d5fbb8855a70223972f6e2981fb97f9b2b36ba9b/README.md). The commands follow its container example and were run with throwaway containers, together with the Oathweave example, against the image the [2.0.1 release](https://github.com/ChefTaco/Emberpath/releases/tag/v2.0.1) publishes, which Hive 2.0.0 and 2.0.1 installed; the release attaches no other files. Original attribution and migration history are preserved. License: Apache-2.0.

Release update, 2026-11-12: [Hive 3.3.0](https://github.com/ChefTaco/hive/releases/tag/v3.3.0) pins Emberpath 2.1.0, tag [`v2.1.0`](https://github.com/ChefTaco/Emberpath/releases/tag/v2.1.0), commit `08dc5f683203c80fb0b3d11d06495024e1fce417`. Per its [changelog](https://github.com/ChefTaco/Emberpath/blob/v2.1.0/CHANGELOG.md), it verifies Oathweave admin tokens with the suite's shared verifier while keeping Emberpath's rules and the existing account link format, returns the suite-standard body from `/health/live` and `/health/ready` on both listeners, and tags every request with a request ID. The administration listener accepts a safe inbound request ID; the inference listener always generates its own. The standalone container example above keeps its original 2.0.1 review.

Release update, 2026-11-13: [Hive 3.7.0](https://github.com/ChefTaco/hive/releases/tag/v3.7.0) pins Emberpath 2.4.0, tag [`v2.4.0`](https://github.com/ChefTaco/Emberpath/releases/tag/v2.4.0), commit `c87215750ab844ff526bdf61c35854dc2cec684e`. The container example now uses the `2.4.0` image, as the [README](https://github.com/ChefTaco/Emberpath/blob/v2.4.0/README.md) at that tag does; its environment file and commands are otherwise identical to the reviewed 2.0.1 example, and it was not re-run with the new image. Per the [changelog](https://github.com/ChefTaco/Emberpath/blob/v2.4.0/CHANGELOG.md), 2.2.0 changes the data format (a suite upgrade from before Hive 3.4.0 needs `--allow-migrations`), 2.3.0 retires the bundled web UI, and 2.4.0 adds the Decisions API at `POST /v1/decisions`, which stays off until an operator enables a provider for it.

Release update, 2026-11-14: [Hive 3.8.0](https://github.com/ChefTaco/hive/releases/tag/v3.8.0) pins Emberpath 2.5.0, tag [`v2.5.0`](https://github.com/ChefTaco/Emberpath/releases/tag/v2.5.0), commit `b9c7568c4af0d2a687774b2ade2cf5eb3046677a`. The container example now uses the `2.5.0` image, as the [README](https://github.com/ChefTaco/Emberpath/blob/v2.5.0/README.md) at that tag does; its environment file and commands are otherwise unchanged, and it was not re-run with the new image. The provider rules above follow the README's editing section and the [changelog](https://github.com/ChefTaco/Emberpath/blob/v2.5.0/CHANGELOG.md) at that tag. Per Hive's upgrade notes, 2.5.0 adds no migration.
