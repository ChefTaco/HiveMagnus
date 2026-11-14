# Ardent Project Studio: agent guide

> Team projects for Ardent agents: team assignment, the conversation room and deliverable review, as the Studio section of HiveXUI.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/ArdentStudio) · [Release 0.4.1](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.4.1) · [npm package](https://www.npmjs.com/package/@hivemagnus/ardent-studio) · [README](https://github.com/ChefTaco/ArdentStudio/blob/v0.4.1/README.md)

## Responsibility

Ardent Project Studio is the Hive:Magnus workspace where an operator gives several [Ardent](https://hivemagnus.com/guides/ardent.md) agents a shared project, puts them in a team, watches them work together and reviews what they deliver. Its UI is the Studio section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md), a fullscreen page at `/studio`. The ArdentStudio service, published as `@hivemagnus/ardent-studio` and the image `ghcr.io/cheftaco/ardent-studio`, owns the records behind it.

A project has three areas:

1. **Team Assignment**: roles, relationships and agent bindings, as draft and published revisions, started from versioned templates.
2. **Team Conversation Room**: the canonical transcript, live agent replies, tasks, clarifications, discussions and decisions, driven by the conductor.
3. **Agent Studio**: agent tuning, previews, development records and **Deliverable Review**, with verified deliverable revisions, anchored comments, revision requests, decisions and exports.

Each product keeps its own records. Studio owns projects, templates, team revisions, the transcript, decisions, deliverables, reviews and its event feed. [Magnus](https://hivemagnus.com/guides/magnus.md) owns the fleet, profile lifecycle and all agent access: Studio never talks to hosts or Ardent directly. Ardent owns execution, sessions, journals and artifacts. [HiveMem](https://hivemagnus.com/guides/hivemem.md) holds one knowledge workspace per project, into which reference files are synced. [Oathweave](https://hivemagnus.com/guides/oathweave.md) signs people in and gives Studio its own service identity. A [ChatterMost](https://hivemagnus.com/guides/chattermost.md) incoming webhook for announcements is optional.

## Requirements

- Magnus with **at least one Ardent agent**, HiveMem and Oathweave. All three are required.
- In a Hive installation, a release that offers Studio: [Hive](https://hivemagnus.com/guides/hive.md) 3.8.0 pins Ardent Project Studio 0.4.1.
- Node.js 24.22.3+ or 26.13.1+ only when running the service outside the suite.

## In a Hive installation

Studio is an optional suite product: no profile selects it, so an installation without it, and the upgrade of one, is unchanged. Interactive setup suggests it with the `full` profile when Magnus and HiveMem are selected:

```text
Deploy Ardent Project Studio, team projects for Ardent agents (yes/no) [yes]:
```

An unattended installation file selects it as the `ardentstudio` component on the host serving HiveXUI, with Oathweave:

```json
"ardentstudio": {
  "host": "control",
  "envFile": "/opt/hive/config/ardentstudio.env",
  "configDirectory": "/opt/hive/config/ardentstudio"
}
```

Expected result: fresh setup registers the HiveXUI browser client for Studio, links the initial operator to a Studio account, declares Studio's own Oathweave machine clients for Magnus and HiveMem with generated secrets that never leave that host, links them in Magnus and HiveMem, and writes `config/ardentstudio.env`. The ingress maps `/api/ardentstudio/*` to the service; without Studio the path answers 404. Its state is the `ardentstudio-data` volume, backed up with the rest of the installation. Magnus can be the `magnus` component or an external Magnus.

Sign in to HiveXUI and open **Studio**; it appears only when Studio is installed. Create at least one Ardent agent in **Magnus > Ardent** first, for example with **New Agent**. Adding Studio to an existing installation is not automated yet: follow the full-profile guide's manual entries, then select the component.

## Run it on its own

The repository's quick start builds and runs the service from a checkout, with its settings supplied privately through the environment:

```bash
npm ci
npm run build
cp .env.example .env   # fill in real values privately; never commit them
set -a; . ./.env; set +a
node dist/main.js serve
```

Expected result: the service listens on `127.0.0.1:8097` by default and serves its API under `/api/ardentstudio/v1`. `node dist/main.js env` lists every variable, and the service refuses to start, naming each problem, when a required setting is missing or unsafe. Service URLs must use HTTPS except on loopback. The browser UI is HiveXUI's Studio module; the service has no UI of its own.

## Full instructions

- [Configuration, architecture and API](https://github.com/ChefTaco/ArdentStudio/blob/v0.4.1/README.md)
- [Conductor](https://github.com/ChefTaco/ArdentStudio/blob/v0.4.1/docs/CONDUCTOR.md)
- [Oathweave account links](https://github.com/ChefTaco/ArdentStudio/blob/v0.4.1/docs/OATHWEAVE.md)
- [Operations and backups](https://github.com/ChefTaco/ArdentStudio/blob/v0.4.1/docs/OPERATIONS.md)
- [Hive full profile: Ardent Project Studio](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/FULL.md#ardent-project-studio)
- [Repository instructions](https://github.com/ChefTaco/ArdentStudio/blob/v0.4.1/AGENTS.md)

## Source review

Reviewed 2026-11-12 against tag `v0.2.0`, commit `7f1279f2726ad9665c1de24eb5168d98548bb8a1`, the version Hive `v3.1.1` pins: [README](https://github.com/ChefTaco/ArdentStudio/blob/v0.2.0/README.md) and [changelog](https://github.com/ChefTaco/ArdentStudio/blob/v0.2.0/CHANGELOG.md), with the Hive [full-profile guide](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/FULL.md#ardent-project-studio) and `releases/3.1.1.json`. The later `v0.2.1` security patch requires the patched Node.js lines and updates Hono; its README changes only the Node.js requirement. No installation command was run against an operational environment. License: Apache-2.0.

Release update, 2026-11-12: [Hive 3.3.0](https://github.com/ChefTaco/hive/releases/tag/v3.3.0) pins Ardent Project Studio 0.3.0, so the release and documentation links now use tag [`v0.3.0`](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.3.0), commit `490c60d8fe381c27434518c455e4f479ac3187cd`, with the Hive [full-profile guide](https://github.com/ChefTaco/hive/blob/v3.3.0/deployment/FULL.md#ardent-project-studio) at `v3.3.0`. Its README changes from 0.2.0 only in the patched Node.js requirement listed above; the quick start is unchanged. Per its [changelog](https://github.com/ChefTaco/ArdentStudio/blob/v0.3.0/CHANGELOG.md), 0.3.0 verifies Oathweave tokens with the suite's shared verifier and keeps the same accepted principals, audience, permissions and link rules, but now refuses a malformed `roles` claim, a token over 16 KiB, or a user token whose client ID equals its subject. It calls HiveMem through `@hivemagnus/hivemem-sdk`, carries `x-request-id` and `traceparent` through to HiveMem, and adds an optional `agentRef` filter to `GET /projects` that lists only projects where that agent is bound to a role.

Release update, 2026-11-13: [Hive 3.7.0](https://github.com/ChefTaco/hive/releases/tag/v3.7.0) pins Ardent Project Studio 0.4.0, so the release and documentation links now use tag [`v0.4.0`](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.4.0), commit `f51d439c64c8cfb90633bcb580ff6c01420f2a33`, with the Hive full-profile guide at `v3.7.0`. The quick start in its [README](https://github.com/ChefTaco/ArdentStudio/blob/v0.4.0/README.md) is unchanged from 0.3.0. Per its [changelog](https://github.com/ChefTaco/ArdentStudio/blob/v0.4.0/CHANGELOG.md), 0.4.0 adds the suite audit export at `GET /api/ardentstudio/v1/audit/export`. No installation command was run for this update.

Release update, 2026-11-14: [Hive 3.8.0](https://github.com/ChefTaco/hive/releases/tag/v3.8.0) pins Ardent Project Studio 0.4.1, so the release and documentation links now use tag [`v0.4.1`](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.4.1), commit `216cc101c07c896ada6efc69416141683e143107`, with the Hive full-profile guide at `v3.8.0`. The quick start in its [README](https://github.com/ChefTaco/ArdentStudio/blob/v0.4.1/README.md) is unchanged from 0.4.0. Per its [changelog](https://github.com/ChefTaco/ArdentStudio/blob/v0.4.1/CHANGELOG.md), 0.4.1 is a bug-fix release for artifact transfers, team publishing, knowledge sync, turn following and request size limits. No installation command was run for this update.
