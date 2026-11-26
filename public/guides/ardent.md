# Ardent: agent guide

> A headless TypeScript agent runtime with durable tasks, typed tools, scheduled jobs, A2A and a journal of every task. It runs standalone or under Magnus management, with bundled Emberfold context fitting.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/Ardent) · [Tag 3.2.1](https://github.com/ChefTaco/Ardent/releases/tag/v3.2.1) · [Release 3.2.0](https://github.com/ChefTaco/Ardent/releases/tag/v3.2.0) · [npm package](https://www.npmjs.com/package/@hivemagnus/ardent) · [README](https://github.com/ChefTaco/Ardent/blob/v3.2.1/README.md) · [Client](https://github.com/ChefTaco/Ardent/blob/v3.2.1/client/README.md)

## Responsibility

One Ardent process serves one **profile**: a directory with a YAML config, a persona (`SOUL.md`, `IDENTITY.md`), skills and private SQLite state. Ardent runs model turns against an OpenAI-compatible chat server (llama.cpp, vLLM and others) or the Codex App Server, calls typed tools and keeps a durable journal of every task. From 3.2.0, a task interrupted by a crash or restart resumes under the same ID from its last completed model or tool boundary; a task with an unsettled effect is held as `unknown` for an operator decision, and a write is never repeated merely because execution resumed.

- **Management API**: bearer-token protected, on loopback `127.0.0.1:9910` by default, for tasks, sessions, configuration, identity, skills, peers, channels and live event streams. Its contract is served at `/openapi.json`.
- **A2A protocol 1.0** server and client over JSON-RPC, HTTP+JSON and gRPC, with authenticated peers and bounded team missions that scope which tools a peer may reach.
- **Scheduled jobs** with cron and IANA timezones or fixed intervals, with exactly-once window receipts.
- **Skills**, **context compaction** and **plugins** that add tools, routes, CLI commands and job handlers from a separate npm package.
- **Remote client** `@hivemagnus/ardent-client`, released with Ardent at the same version, for Node.js 24+ and browsers: it submits and follows tasks across stream reconnects, sends recovery decisions, reads lineage and downloads artifacts with resumable, digest-verified transfers, directly (`direct({ baseUrl, getToken })`) or through the Magnus Control API (`viaMagnus`). `viaMagnus` takes the Magnus origin as `baseUrl`, to which the client adds `/api/v1`, or, from 3.2.1, `apiBase`, the URL that stands for Magnus's `/api/v1`, such as a Hive console's `https://<console>/api/magnus`; give exactly one of the two.
- **Optional integrations**, each off until configured: HiveMem long-term memory, Telegram and Mattermost channels (including [ChatterMost](https://hivemagnus.com/guides/chattermost.md)), news research, read-only Magnus Control tools and Hermes Agent team-card compatibility.

Ardent imports the pinned `@hivemagnus/emberfold` library for context fitting and checkpoint compression. The optional [Emberfold](https://hivemagnus.com/guides/emberfold.md) HTTP service is not required, and Ardent keeps its own authoritative SQLite history and task journal. The model never gets a shell, deployment or credential tool from Ardent itself.

## New in 3.2.0

- **Execution recovery.** After a restart, every task that was `running` is planned before queued work starts: resumed under the same ID (reusing completed model replies and settled tool results), reconciled first through its tool's `reconcile` hook, or held as `unknown` with a recovery status and reason. `GET /api/v1/tasks/{id}/recovery` reads it, and `POST` with `mark_applied`, `mark_not_applied`, `retry_with_new_deadline` or `abandon` continues the work as a linked continuation task. `execution.recovery.enabled: false` restores the earlier behaviour. See [Execution recovery](https://github.com/ChefTaco/Ardent/blob/v3.2.0/README.md#execution-recovery).
- **Execution ancestry.** Every new task has an execution context (HiveCommon execution context v1), taken from the caller's `execution` field, the `x-hive-execution` header or A2A metadata, or minted as a root; it is attribution only. `GET /api/v1/tasks/{id}/lineage` returns the task's parent, children, continuations, model attempts with request IDs, tool calls and artifacts, and `ARDENT_INSTANCE_REF` names the instance in its references. See [Execution ancestry](https://github.com/ChefTaco/Ardent/blob/v3.2.0/README.md#execution-ancestry).
- **Artifact transfer v2.** Artifacts up to `artifacts.max_bytes` (at most 64 MiB) move between agents over HTTP `Range` with `If-Range` and whole-file SHA-256 verification, with renditions linked to their original and manifest 1.1 provenance; an interrupted import resumes from the committed bytes. Older peers keep the v1 path up to 2 MiB. See [Artifact transfer v2 and renditions](https://github.com/ChefTaco/Ardent/blob/v3.2.0/README.md#artifact-transfer-v2-and-renditions).
- **Tool scheduling and retries.** Independent `read` calls from one model turn run in parallel, up to `execution.max_parallel_tool_calls` (default 4), and any other call is a barrier. One retry policy model covers llama.cpp, the A2A client and push delivery, Telegram and scheduled jobs, honours `Retry-After` and the deadline, and repeats nothing once its effect is uncertain. See [Tool scheduling](https://github.com/ChefTaco/Ardent/blob/v3.2.0/README.md#tool-scheduling) and [Retries](https://github.com/ChefTaco/Ardent/blob/v3.2.0/README.md#retries).
- **Chat catch-up.** After an outage, the Mattermost and ChatterMost channel walks back through channel history to a durable per-channel boundary and answers the missed posts once, oldest first, within `channels.mattermost.catchup.max_posts` (default 2000) and `catchup.max_age_hours` (default 24).

## New in 3.2.1

- **Client through a Hive console.** `@hivemagnus/ardent-client`'s `viaMagnus({ apiBase, nodeId, profile, getToken })` reaches Magnus behind a proxy that serves its `/api/v1` under another path, such as a Hive console's `/api/magnus`; the client then adds no `/api/v1`. `baseUrl` behaves as before, and giving both or neither is refused. The client's CLI example takes `--magnus-api`. The runtime, its management API and its dependencies are unchanged from 3.2.0. See the [client README](https://github.com/ChefTaco/Ardent/blob/v3.2.1/client/README.md).

## In a Hive installation

Ardent is not a suite container and has no HiveXUI section of its own. [Magnus](https://hivemagnus.com/guides/magnus.md) installs and manages it on fleet hosts, and its pages are in the Magnus section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md). In [Hive](https://hivemagnus.com/guides/hive.md) 3.14.3, `hive.sh magnus-agent install` stages the Ardent 3.2.1 package that the signed Magnus 3.3.6 host agent's dependency lock pins, after verifying its npm integrity. Staging never installs or starts a runtime. From Hive 3.10.0, `hive.sh ardent setup`, which guided setup offers after full-node enrollment, installs that staged package and creates the default `assistant` profile through Magnus's **New Agent** workflow: it asks for an OpenAI-compatible model URL (including `/v1`) and model name, configures HiveMem, starts the profile and makes a real model request. It accepts only model endpoints that need no separate API key; `--profile NAME` creates another new profile, and `ardent status`, `ardent check` and `ardent resume OPERATION_ID` follow it. Otherwise, in **Magnus > Ardent > Installations**, choose **Install package**, then create a profile with **New Agent**. New Agent gives each agent its own HiveMem identity and can use an Emberpath model alias.

To update the package after a suite upgrade, run `hive.sh post-upgrade` or `hive.sh magnus-agent install` from the new release, which updates the host agent and stages the new package while keeping the node's enrollment scope. Then stop the running profiles, choose **Update package** and start them again. A profile keeps its installed Ardent until it is updated; until it runs 3.2.0, Magnus answers its recovery, lineage and artifact transfer reads with `409 unsupported_capability`. Release any extension package that pins an exact `@hivemagnus/ardent` peer for 3.2.0 first: a managed upgrade holds the runtime when a peer differs. From Hive 3.14.1 (Magnus 3.3.3 and later), the host agent's native snapshot knows the tables Ardent 3.2.0 added, so a suite backup or upgrade resumes a 3.2.0 or later profile that the installer-owned agent manages instead of holding it; on such an installation coming from Hive 3.14.0, run `hive.sh magnus-agent install --release 3.14.2` before upgrading the suite. A profile keeps the Ardent it runs until it is updated in **Magnus > Ardent**; 3.2.1 changes only the client package, so a 3.2.0 profile needs no update for the runtime. [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md), an optional suite product, gives several Ardent agents a shared team project through Magnus.

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

Ardent 3.0 replaced `better-sqlite3` with the pinned Node-API SQLite driver. Profile databases keep their format and journal history. The management API, CLI and plugin hooks keep their contracts, but code that used driver-specific methods of the low-level `TaskStore.db` must move to the application storage boundary; import extension primitives from `@hivemagnus/ardent/plugin-sdk`. Release 3.1.2 is a security patch that requires the patched Node.js lines above and updates Hono; 3.1.3 fixes Mattermost, Telegram, llama.cpp stream and artifact handling; 3.1.4 updates `@hono/node-server` to 2.1.6 and requires at least that version. 3.2.0 adds SQLite tables and columns additively for recovery, ancestry, artifact transfers and channel catch-up, turns execution recovery on by default, and deprecates `execution.max_parallel_tools`, which limited tasks: set `execution.max_parallel_tasks` instead (`ardent config validate` and `ardent doctor` list a notice while the old key is used).

## Full instructions

- [Configuration, channels, A2A, team missions and plugins](https://github.com/ChefTaco/Ardent/blob/v3.2.1/README.md)
- [OpenAPI contract](https://github.com/ChefTaco/Ardent/blob/v3.2.1/openapi/ardent.json)
- [Remote client `@hivemagnus/ardent-client`](https://github.com/ChefTaco/Ardent/blob/v3.2.1/client/README.md)
- [Changelog](https://github.com/ChefTaco/Ardent/blob/v3.2.1/CHANGELOG.md)
- [Managing Ardent with Magnus](https://github.com/ChefTaco/magnus/blob/v3.3.6/docs/ARDENT.md)
- [Hive: create an Ardent assistant](https://github.com/ChefTaco/hive/blob/v3.14.3/deployment/FULL.md#create-an-ardent-assistant)
- [Repository instructions](https://github.com/ChefTaco/Ardent/blob/v3.2.1/AGENTS.md)

## Source review

Reviewed 2026-11-12 against tag `v3.1.2`, commit `58c4b35034ea20a3400f04e9f131012cba4df471`: [README](https://github.com/ChefTaco/Ardent/blob/v3.1.2/README.md), [changelog](https://github.com/ChefTaco/Ardent/blob/v3.1.2/CHANGELOG.md) and [package manifest](https://github.com/ChefTaco/Ardent/blob/v3.1.2/package.json). npm resolves `@hivemagnus/ardent` to `3.1.2` as `latest`. Suite management was reviewed again on 2026-11-13 against Hive `v3.7.0` [Magnus host agents](https://github.com/ChefTaco/hive/blob/v3.7.0/deployment/FULL.md#magnus-host-agents) and [installation guide](https://github.com/ChefTaco/hive/blob/v3.7.0/deployment/QUICKSTART.md#8-upgrade), and Magnus `v2.9.1`, whose host-agent lock pins Ardent `3.1.2`. No installation command was run against an operational environment. License: Apache-2.0.

Release update, 2026-11-26: [Hive 3.14.3](https://github.com/ChefTaco/hive/releases/tag/v3.14.3), tag `v3.14.3`, commit `917d2e6d7abb07e97e40949ebdfeff6cc502f05d`, pins the Magnus 3.3.6 host agent, tag [`v3.3.6`](https://github.com/ChefTaco/magnus/releases/tag/v3.3.6), commit `acdedd94fda43e4bfc0664ceda0af365c9cf23fe` (Hive 3.14.2 pinned 3.3.5), a security release whose agent dependency lock moves `fast-xml-parser` to 5.12.1 and `fast-xml-builder` to 1.3.2 and still pins Ardent `3.2.1`, so the staged Ardent package is unchanged. The Magnus and Hive links now use `v3.3.6` (its `docs/ARDENT.md` is unchanged from `v3.3.5`) and `v3.14.3`. Per Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.14.3/UPGRADING.md#suite-3143-magnus-336-xml-dependency-fixes), `hive.sh post-upgrade` updates the Hive-managed host agents and profiles keep the Ardent they run. No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [ardent release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/ardent.md); what each Ardent release changed is in its [changelog](https://github.com/ChefTaco/Ardent/blob/main/CHANGELOG.md).
