# Ardent: agent guide

> A headless TypeScript agent runtime with durable tasks, typed tools, scheduled jobs, A2A and a journal of every task. It runs standalone or under Magnus management, with bundled Emberfold context fitting.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Ardent) · [Release 3.1.3](https://github.com/ChefTaco/Ardent/releases/tag/v3.1.3) · [npm package](https://www.npmjs.com/package/@hivemagnus/ardent) · [README](https://github.com/ChefTaco/Ardent/blob/v3.1.3/README.md)

## Responsibility

One Ardent process serves one **profile**: a directory with a YAML config, a persona (`SOUL.md`, `IDENTITY.md`), skills and private SQLite state. Ardent runs model turns against an OpenAI-compatible chat server (llama.cpp, vLLM and others) or the Codex App Server, calls typed tools and keeps a durable journal of every task. Interrupted work is marked `unknown`, never silently replayed.

- **Management API**: bearer-token protected, on loopback `127.0.0.1:9910` by default, for tasks, sessions, configuration, identity, skills, peers, channels and live event streams. Its contract is served at `/openapi.json`.
- **A2A protocol 1.0** server and client over JSON-RPC, HTTP+JSON and gRPC, with authenticated peers and bounded team missions that scope which tools a peer may reach.
- **Scheduled jobs** with cron and IANA timezones or fixed intervals, with exactly-once window receipts.
- **Skills**, **context compaction** and **plugins** that add tools, routes, CLI commands and job handlers from a separate npm package.
- **Optional integrations**, each off until configured: HiveMem long-term memory, Telegram and Mattermost channels (including [ChatterMost](https://hivemagnus.com/guides/chattermost.md)), news research, read-only Magnus Control tools and Hermes Agent team-card compatibility.

Ardent imports the pinned `@hivemagnus/emberfold` library for context fitting and checkpoint compression. The optional [Emberfold](https://hivemagnus.com/guides/emberfold.md) HTTP service is not required, and Ardent keeps its own authoritative SQLite history and task journal. The model never gets a shell, deployment or credential tool from Ardent itself.

## In a Hive installation

Ardent is not a suite container and has no HiveXUI section of its own. [Magnus](https://hivemagnus.com/guides/magnus.md) installs and manages it on fleet hosts, and its pages are in the Magnus section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md). In [Hive](https://hivemagnus.com/guides/hive.md) 3.8.0, `hive.sh magnus-agent install` stages the Ardent 3.1.3 package that the signed Magnus 2.10.0 host agent's dependency lock pins, after verifying its npm integrity. Staging never installs or starts a runtime: in **Magnus > Ardent > Installations**, choose **Install package**, then create a profile with **New Agent**. New Agent gives each agent its own HiveMem identity and can use an Emberpath model alias.

To update the package after a suite upgrade, run `hive.sh post-upgrade` or `hive.sh magnus-agent install` from the new release, which updates the host agent and stages the new package while keeping the node's enrollment scope. Then stop the running profiles, choose **Update package** and start them again. [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md), an optional suite product, gives several Ardent agents a shared team project through Magnus.

## Run it on its own

Prerequisites: Node.js 24.22.3+ in the 24 series or 26.13.1+ in the 26 series (26 is recommended), npm, and an OpenAI-compatible model endpoint or the Codex App Server. The pinned `@photostructure/sqlite` driver bundles SQLite 3.54.1 with Node-API binaries for Linux x64 and arm64, so no compiler or install script is needed.

```bash
npm i -g @hivemagnus/ardent
ardent init --non-interactive
ardent doctor
```

Expected result: `init` copies the bundled `assistant` template to `~/.ardent/profiles/assistant`, sets the profile timezone to the host's zone and writes a random management token to the profile's owner-only `.env`. `doctor` lists unresolved configuration; a first run without a model is not yet ready for chat. Use `--profile NAME` or `--profile-path DIR` for other profiles and `--api-port N` for another management port. `ARDENT_HOME` overrides the `~/.ardent` root.

For a fresh profile using your own OpenAI-compatible server, replace the sample URL and model name:

```bash
cat >> ~/.ardent/profiles/assistant/.env <<'EOF'
ARDENT_LLAMA_BASE_URL=http://127.0.0.1:8080/
ARDENT_LLAMA_MODEL=your-model-name
EOF
ardent doctor
ardent chat
```

Expected result: after model configuration is valid, `chat` opens an interactive session and prints replies as they arrive. Keep provider credentials in the profile's private `.env`; `config.yaml` holds only the names of the variables that carry secrets. For an existing profile, edit its current settings instead of appending duplicate entries. The README covers the Codex App Server.

To start the management API, A2A, configured channels and scheduled jobs instead of interactive chat:

```bash
ardent gateway run
```

A non-loopback management host is refused; put a TLS proxy in front instead. Enable A2A and chat channels separately; starting the gateway does not make them public. `ardent config validate` checks a profile without starting it, and `ardent help` lists every command.

## Upgrading to 3.x

Ardent 3.0 replaced `better-sqlite3` with the pinned Node-API SQLite driver. Profile databases keep their format and journal history. The management API, CLI and plugin hooks keep their contracts, but code that used driver-specific methods of the low-level `TaskStore.db` must move to the application storage boundary; import extension primitives from `@hivemagnus/ardent/plugin-sdk`. Release 3.1.2 is a security patch that requires the patched Node.js lines above and updates Hono; 3.1.3 fixes Mattermost, Telegram, llama.cpp stream and artifact handling.

## Full instructions

- [Configuration, channels, A2A, team missions and plugins](https://github.com/ChefTaco/Ardent/blob/v3.1.3/README.md)
- [OpenAPI contract](https://github.com/ChefTaco/Ardent/blob/v3.1.3/openapi/ardent.json)
- [Changelog](https://github.com/ChefTaco/Ardent/blob/v3.1.3/CHANGELOG.md)
- [Managing Ardent with Magnus](https://github.com/ChefTaco/magnus/blob/v2.10.0/docs/ARDENT.md)
- [Repository instructions](https://github.com/ChefTaco/Ardent/blob/v3.1.3/AGENTS.md)

## Source review

Reviewed 2026-11-12 against tag `v3.1.2`, commit `58c4b35034ea20a3400f04e9f131012cba4df471`: [README](https://github.com/ChefTaco/Ardent/blob/v3.1.2/README.md), [changelog](https://github.com/ChefTaco/Ardent/blob/v3.1.2/CHANGELOG.md) and [package manifest](https://github.com/ChefTaco/Ardent/blob/v3.1.2/package.json). npm resolves `@hivemagnus/ardent` to `3.1.2` as `latest`. Suite management was reviewed again on 2026-11-13 against Hive `v3.7.0` [Magnus host agents](https://github.com/ChefTaco/hive/blob/v3.7.0/deployment/FULL.md#magnus-host-agents) and [installation guide](https://github.com/ChefTaco/hive/blob/v3.7.0/deployment/QUICKSTART.md#8-upgrade), and Magnus `v2.9.1`, whose host-agent lock pins Ardent `3.1.2`. No installation command was run against an operational environment. License: Apache-2.0.

Release update, 2026-11-14: [Hive 3.8.0](https://github.com/ChefTaco/hive/releases/tag/v3.8.0) stages Ardent 3.1.3, tag [`v3.1.3`](https://github.com/ChefTaco/Ardent/releases/tag/v3.1.3), commit `4ea00d3a5bc0ea8c601fb611a6770651e7313de0`, which the Magnus `v2.10.0` host agent's `npm-shrinkwrap.json` pins; npm resolves `@hivemagnus/ardent` to `3.1.3` as `latest`. Its README is unchanged from `v3.1.2`, so the commands are the same. Per the [changelog](https://github.com/ChefTaco/Ardent/blob/v3.1.3/CHANGELOG.md), 3.1.3 is a bug-fix release; per Magnus's changelog its management API is unchanged. No installation command was run for this update.
