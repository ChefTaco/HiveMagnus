# Magnus and Ardent: agent guide

> Magnus operates Linux fleets. Its Ardent runtime runs durable agent tasks, standalone or under fleet management, with bundled Emberfold context fitting.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/magnus) · [Current Magnus instructions](https://github.com/ChefTaco/magnus#quick-start) · [Current Ardent instructions](https://github.com/ChefTaco/magnus/tree/main/packages/ardent#install)

## Choose an entry point

Use Magnus for fleet inventory, health, jobs, skills, rollouts, and audit. Use Ardent alone if you need a durable headless agent without a fleet server. Hive sign-in, memory, and model routing are optional integrations. ChatterMost is an optional Mattermost-compatible conversation endpoint.

## Install Magnus

Prerequisites: Linux with systemd, npm, Node.js 24.22.1+ in the 24 series or 26.13.0+ in the 26 series, and Docker Compose or existing PostgreSQL and Redis. The docs recommend PostgreSQL 17 (15+ works) and Redis 7.

```bash
npx @hivemagnus/magnus init
```

Expected result: the installer creates `~/.magnus`, installs the server and console, generates credentials and a self-signed certificate, prepares PostgreSQL/Redis through Compose (or uses supplied URLs), and starts systemd user services. Use the printed console URL and login. Save the generated password privately; the self-signed certificate is for evaluation.

Inspect options before choosing an installation mode:

```bash
npx @hivemagnus/magnus init --help
```

For user services to survive logout and start at boot, the setup may require `loginctl enable-linger $USER`. Follow the installer guide for that host. Add managed nodes through the console and the documented node-agent setup; each node requires its own configuration and secret. Installing the console alone does not enroll other hosts.

## Ardent with bundled Emberfold

Ardent needs the same supported Node.js versions and an OpenAI-compatible chat model server or Codex App Server. `better-sqlite3` is a native dependency.

```bash
npm i -g @hivemagnus/ardent
ardent init --non-interactive
ardent doctor
```

Expected result: `init` creates `~/.ardent/profiles/assistant` with configuration, persona, and a random management token in its `.env`. The runtime keeps private SQLite state in the profile. `doctor` lists unresolved configuration; a first run without a model is not yet ready for chat.

For a fresh profile using your own OpenAI-compatible server, replace the sample URL and model name:

```bash
cat >> ~/.ardent/profiles/assistant/.env <<'EOF'
ARDENT_LLAMA_BASE_URL=http://127.0.0.1:8080/
ARDENT_LLAMA_MODEL=your-model-name
EOF
ardent doctor
ardent chat
```

Expected result: after model configuration is valid, `chat` opens an interactive session. Keep provider credentials in the profile's private `.env`. For an existing profile, edit its current settings instead of appending duplicate entries. Follow the full Ardent guide for Codex App Server configuration.

To start the management API, configured channels, and jobs instead of interactive chat:

```bash
ardent gateway run
```

The management API defaults to loopback `127.0.0.1:9910` with bearer authentication; its contract is served at `/openapi.json`. Enable and configure A2A or conversation channels separately. Starting the gateway does not make them public automatically.

Ardent imports its pinned Emberfold library directly. No separate Emberfold account or HTTP server is needed. Ardent retains authoritative SQLite history, journal events, and checkpoint publication. For Emberfold outside Ardent, see the [Emberfold guide](https://hivemagnus.com/guides/emberfold.md).

## Full instructions

- [Magnus installer](https://github.com/ChefTaco/magnus/tree/main/packages/magnus)
- [Node agent setup](https://github.com/ChefTaco/magnus/tree/main/packages/agent)
- [Ardent configuration and integrations](https://github.com/ChefTaco/magnus/tree/main/packages/ardent)
- [Ardent OpenAPI contract](https://github.com/ChefTaco/magnus/blob/main/packages/ardent/openapi/ardent.json)
- [Repository instructions](https://github.com/ChefTaco/magnus/blob/main/AGENTS.md)

## Source review

Reviewed 2026-11-03 against public revision `c53cbf3915a679c6545a4cea7fc4dce76ff00f7d`: [root README](https://github.com/ChefTaco/magnus/blob/c53cbf3915a679c6545a4cea7fc4dce76ff00f7d/README.md) and [Ardent README](https://github.com/ChefTaco/magnus/blob/c53cbf3915a679c6545a4cea7fc4dce76ff00f7d/packages/ardent/README.md). Commands follow those docs; npm resolves current published packages. Follow current instructions for upgrades. License: Apache-2.0.
