# Emberpath

> OpenAI-compatible model gateway with external providers, routing, failover, quotas and a trace for every request.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Emberpath) · [README](https://github.com/ChefTaco/Emberpath#readme)

## Responsibility

Clients talk to one endpoint. Emberpath picks an upstream provider, fails over when it is safe to, enforces per-key quotas and records a trace for every request, with a separate administration API. Ollama, llama.cpp and hosted APIs are independently operated dependencies: it routes to them and never installs or manages them. Native model endpoints remain distinct from HiveMem client endpoints.

## In a Hive installation

Emberpath is part of the core profile. [Hive](https://hivemagnus.com/guides/hive.md) 2.0.6 installs Emberpath 2.0.2 as a digest-pinned image, verifies external endpoints and registers verified providers. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md), reached through a separate administration listener; the native model API keeps its own listener and API keys.

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
  --env-file emberpath.env ghcr.io/cheftaco/emberpath:2.0.1 check
docker run -d --name emberpath --network oathweave \
  -p 127.0.0.1:4020:4020 -p 127.0.0.1:9443:9443 -v emberpath-data:/data \
  -v "$PWD/tls:/config/tls:ro" --env-file emberpath.env ghcr.io/cheftaco/emberpath:2.0.1
```

Expected result: `check` validates configuration, TLS and Oathweave reachability and starts nothing. Once the container is healthy, `curl --cacert tls/server.crt https://localhost:4020/health` answers, with the OpenAI-compatible API at `https://localhost:4020/v1` and the administration API at `https://localhost:9443/api`. Emberpath has no built-in console: it is managed through its administration API, or through HiveXUI in the suite. See the README for keys, public URLs and HiveMem.

## Source review

Reviewed 2026-11-06 against `main` commit `d5fbb8855a70223972f6e2981fb97f9b2b36ba9b`, documentation added after tag `v2.0.1`: [README](https://github.com/ChefTaco/Emberpath/blob/d5fbb8855a70223972f6e2981fb97f9b2b36ba9b/README.md). The commands follow its container example and were run with throwaway containers, together with the Oathweave example, against the image the [2.0.1 release](https://github.com/ChefTaco/Emberpath/releases/tag/v2.0.1) publishes, which Hive 2.0.0 and 2.0.1 installed; the release attaches no other files. Original attribution and migration history are preserved. License: Apache-2.0.
