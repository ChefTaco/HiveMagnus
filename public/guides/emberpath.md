# Emberpath

> OpenAI-compatible model gateway with external providers, routing, failover, quotas and a trace for every request.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Emberpath) · [README](https://github.com/ChefTaco/Emberpath#readme)

## Responsibility

Clients talk to one endpoint. Emberpath picks an upstream provider, fails over when it is safe to, enforces per-key quotas and records a trace for every request, with a separate administration API. Ollama, llama.cpp and hosted APIs are independently operated dependencies: it routes to them and never installs or manages them. Native model endpoints remain distinct from HiveMem client endpoints.

## In a Hive installation

Emberpath is part of the core profile. [Hive](https://hivemagnus.com/guides/hive.md) 2.0.0 installs Emberpath 2.0.1 as a digest-pinned image, verifies external endpoints and registers verified providers. Its screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md), reached through a separate administration listener; the native model API keeps its own listener and API keys.

## Run it on its own

Requires Node.js 24.22.1+ or 26.13.0+. For admin sign-in, either Linux with `pamtester` or a running identity service. The source package `@hivemagnus/emberpath` is not on npm yet, so these commands use `@hivemagnus/hive-router`, the last published name, with its `HIVE_ROUTER_` settings. That package predates this repository and still bundles the old console on the admin listener; this source has no built-in console and is managed through its administration API, or through HiveXUI in the suite.

```bash
mkdir -p ~/.hive && chmod 700 ~/.hive
install -m 600 /dev/null ~/.hive/router.env
echo "HIVE_ROUTER_SECRET=$(openssl rand -hex 32)" >> ~/.hive/router.env
echo "HIVE_ROUTER_ADMIN_USERS=$USER" >> ~/.hive/router.env
npx --allow-scripts=better-sqlite3 @hivemagnus/hive-router check --env-file ~/.hive/router.env
npx --allow-scripts=better-sqlite3 @hivemagnus/hive-router --env-file ~/.hive/router.env
```

Expected result: `check` validates configuration and starts nothing. The server then listens on loopback, with the OpenAI-compatible API at `http://127.0.0.1:4020/v1` and the administration API at `http://127.0.0.1:9443/api`, where operators sign in with `POST /api/auth/login`; both listeners answer `GET /health`. TLS is required when `NODE_ENV=production` or `REQUIRE_TLS=true`. See the README for keys, TLS and remote exposure.

## Source review

Reviewed 2026-11-05 against tag `v2.0.1`, commit `7aada3201bed915d36e37458c3b8a1dc5fe71c84`: [README](https://github.com/ChefTaco/Emberpath/blob/7aada3201bed915d36e37458c3b8a1dc5fe71c84/README.md). The commands follow its npm quick start. The [2.0.1 release](https://github.com/ChefTaco/Emberpath/releases/tag/v2.0.1) publishes the container image that Hive installs; it attaches no other files. Original attribution and migration history are preserved. License: Apache-2.0.
