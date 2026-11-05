# Emberpath

> OpenAI-compatible model gateway with external providers, routing, failover, quotas and a trace for every request.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Emberpath) · [README](https://github.com/ChefTaco/Emberpath#readme)

## Responsibility

Clients talk to one endpoint. Emberpath picks an upstream provider, fails over when it is safe to, enforces per-key quotas and records a trace for every request, with a separate administration API. Ollama, llama.cpp and hosted APIs are independently operated dependencies: it routes to them and never installs or manages them. Native model endpoints remain distinct from HiveMem client endpoints.

## In a Hive installation

Emberpath is part of the core profile. [Hive](https://hivemagnus.com/guides/hive.md) installs a pinned image, verifies external endpoints and registers verified providers. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md), reached through a separate administration listener; the native model API keeps its own listener and API keys.

## Run it on its own

Requires Node.js 24.22.1+ or 26.13.0+. For sign-in, either Linux with `pamtester` or a running identity service. The published package keeps its original name, `@hivemagnus/hive-router`, and its `HIVE_ROUTER_` settings.

```bash
mkdir -p ~/.hive && chmod 700 ~/.hive
install -m 600 /dev/null ~/.hive/router.env
echo "HIVE_ROUTER_SECRET=$(openssl rand -hex 32)" >> ~/.hive/router.env
echo "HIVE_ROUTER_ADMIN_USERS=$USER" >> ~/.hive/router.env
npx --allow-scripts=better-sqlite3 @hivemagnus/hive-router check --env-file ~/.hive/router.env
npx --allow-scripts=better-sqlite3 @hivemagnus/hive-router --env-file ~/.hive/router.env
```

Expected result: `check` validates configuration and starts nothing. The server then listens on loopback, with the OpenAI-compatible API at `http://127.0.0.1:4020/v1` and the administration listener on `127.0.0.1:9443`; both answer `GET /health`. TLS is required when `NODE_ENV=production` or `REQUIRE_TLS=true`. See the README for keys, TLS and remote exposure.

## Source review

Reviewed 2026-11-05 against public revision `1ee9f3c37f28694ae971e2f8ec599b57ad4f89c0`: [README](https://github.com/ChefTaco/Emberpath/blob/1ee9f3c37f28694ae971e2f8ec599b57ad4f89c0/README.md). The commands follow its npm quick start. Original attribution and migration history are preserved. License: Apache-2.0.
