# Ardent Project Studio: agent guide

> Team projects for Ardent agents: team assignment, the conversation room and deliverable review, as the Studio section of HiveXUI.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/ArdentStudio) · [Release 0.7.0](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.7.0) · [Release 0.6.1](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.6.1) · [Release 0.6.0](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.6.0) · [Release 0.5.1](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.5.1) · [npm package](https://www.npmjs.com/package/@hivemagnus/ardent-studio) · [README](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/README.md)

## Responsibility

Ardent Project Studio is the Hive:Magnus workspace where an operator gives several [Ardent](https://hivemagnus.com/guides/ardent.md) agents a shared project, puts them in a team, watches them work together and reviews what they deliver. Its UI is the Studio section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md), a fullscreen page at `/studio`. The ArdentStudio service, published as `@hivemagnus/ardent-studio` and the image `ghcr.io/cheftaco/ardent-studio`, owns the records behind it.

A project has three areas:

1. **Team Assignment**: roles, relationships and agent bindings, as draft and published revisions, started from versioned templates.
2. **Team Conversation Room**: the canonical transcript, live agent replies, tasks, clarifications, discussions, decisions and workflows, driven by the conductor.
3. **Agent Studio**: agent tuning, previews, development records and **Deliverable Review**, with verified deliverable revisions, anchored comments, revision requests, decisions and exports.

Each product keeps its own records. Studio owns projects, templates, team revisions, the transcript, decisions, deliverables, reviews and its event feed. [Magnus](https://hivemagnus.com/guides/magnus.md) owns the fleet, profile lifecycle and all agent access: Studio never talks to hosts or Ardent directly. Ardent owns execution, sessions, journals and artifacts. [HiveMem](https://hivemagnus.com/guides/hivemem.md) holds one knowledge workspace per project, into which reference files are synced. [Oathweave](https://hivemagnus.com/guides/oathweave.md) signs people in and gives Studio its own service identity. A [ChatterMost](https://hivemagnus.com/guides/chattermost.md) incoming webhook for announcements is optional.

## New in 0.6 and 0.7

- **Project membership (0.7.0).** `PUT /projects/{id}/members` (project owners and `ardentstudio:agents:admin`) limits a project to listed Oathweave subjects and Oathweave roles, each `viewer`, `editor` or `owner`. The default, `mode: "everyone"`, keeps every project open to everyone linked, with the creator as owner, so nothing changes until an owner or an admin limits a project. In a limited project every route, the stream, `/blobs` and the agent role lists enforce it: people outside it get `404`, a role that is too low `403 PROJECT_ROLE_REQUIRED`. `GET /people` answers only `ardentstudio:agents:admin` and people who own at least one project, at most 50 people at a time (`truncated: true` when more match).
- **Purge (0.7.0).** `POST /projects/{id}/purge` (`ardentstudio:agents:admin`, with the exact project name as `confirm_name`) deletes an archived project for good: its events, files, team, room, tasks, workflow runs, deliverables, reviews and exports. Its HiveMem sources are retired, the workspace and the audit rows are kept, and the purge is audited as `project.purge`. It refuses with `409 PROJECT_NOT_ARCHIVED`, `422 CONFIRMATION_MISMATCH`, `409 TASKS_ACTIVE` or `409 FILE_IN_USE`.
- **Files and backups (0.6.0).** `DELETE /files/{fileId}` deletes a project file (`409 FILE_IN_USE` while an agent portrait or a team role names it) and retires its HiveMem source first; `POST /projects/{projectId}/reindex` queues a project's references for HiveMem sync again, for example after a restore. An hourly sweep removes stored bytes nothing references once they are ten minutes old. Uploads whose bytes do not match their `Content-Type` get `422 CONTENT_MISMATCH`. `ardent-studio backup DIR` makes a consistent backup of a running data directory: the database in one read transaction, then every blob it records, each checked against its digest; the directory must be new or empty and outside the data directory. `/health/ready` needs no token and answers a failing check as a code; use `/health/live` for container health. 0.6.1 fixes a backup that a concurrent delete or sweep made fail, and keeps a deleted reference's HiveMem source from staying retrievable.

The membership and purge controls are in HiveXUI 0.13.0 and later. See the [changelog](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/CHANGELOG.md) and [operations and backups](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/docs/OPERATIONS.md).

## New in 0.5

- **Workflows.** A workflow is a small DAG of sub-prompts (at most 16 nodes, acyclic, exactly one output) whose nodes run as ordinary tasks of team roles, branching and joining. A node starts when every node it needs is done, with their results and imported artifact references as context marked as data. A failed node blocks its dependents and the run, with `retry`, `skip` (optional nodes) and `cancel_run`; completed nodes are never resubmitted after a restart. HiveXUI shows runs in the room's **Workflows** drawer. 0.5.1 retries a turn Magnus refuses because another managed command is running on the same node, so parallel branches whose agents share a node no longer fail.
- **Recovery decisions.** With Ardent 3.2.0 through Magnus 3.3.0, a task Ardent resumes stays `running` and shows its recovery, and a task Ardent holds for a decision becomes `unknown` with the decisions Studio can send (`POST /tasks/:id/recovery`). A continuation is followed as the same Studio task, which still ends with one completion message. Without the capability no decision is offered.
- **Lineage.** Every task records its execution references (root, parent and self) for requests, hand-offs, reassignments, discussion turns, revisions and workflow nodes, and `GET /tasks/:id/lineage` adds each Ardent attempt's lineage and the Emberpath trace filter. `ARDENT_STUDIO_INSTANCE_ID` (default `local`) names this Studio in those references.
- **Resumable imports with renditions.** From agents with artifact transfer v2, imports resume after a restart or a dropped connection with `Range` and `If-Range`, the whole-file digest is verified before the file enters the blob store, and the artifact's renditions are imported with it and listed on the deliverable revision. Other agents keep the whole download as before.
- **Agent definitions from templates.** An agent template version can be exported as a sealed `hive-agent-definition/1`, a definition can be imported as a new template version, and a template version can be checked against and deployed to a node through Magnus's definition install. A Magnus before 3.3.0 answers `409 MAGNUS_UPGRADE_REQUIRED`, and the deploy (**Create agent from definition**) works from Magnus 3.3.4 (Hive 3.14.2 and later): Magnus 3.3.0 to 3.3.3 failed every definition install with 500 after its preflight passed, before anything was created on the node.

Recovery, Ardent lineage, artifact transfer v2 and definition deploy need Magnus 3.3.0 and agents that report those capabilities; workflows and execution references work with an older Magnus. See the [conductor](https://github.com/ChefTaco/ArdentStudio/blob/v0.5.1/docs/CONDUCTOR.md) and the [changelog](https://github.com/ChefTaco/ArdentStudio/blob/v0.5.1/CHANGELOG.md).

## Requirements

- Magnus with **at least one Ardent agent**, HiveMem and Oathweave. All three are required.
- In a Hive installation, a release that offers Studio: [Hive](https://hivemagnus.com/guides/hive.md) {{hm.suite}} pins Ardent Project Studio {{hm.version:ardentstudio}} (since {{hm.since:ardentstudio}}).
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

**Upgrading to 0.7.** Back up the data volume first. Migration 11 (`file_deletion`, 0.6.0) and migration 12 (`project_membership_purge`, 0.7.0) run on the first start of 0.7.0. They are additive, but one-way: a database they have run on no longer starts under 0.5.x or 0.6.x, so going back means restoring the backup. In a Hive installation, every upgrade from 3.14.x to 3.15.x needs `--allow-migrations`; the rehearsal runs them on the restored copy first, and the upgrade takes the pre-upgrade backup that is the way back. Existing projects stay open to everyone linked until an owner limits their members. See Hive's [Suite 3.15.0](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3150-product-security-round).

**Upgrading to 0.5.** Back up the data volume first. Migrations 7 to 10 run on the first start of 0.5.x: they are additive and keep existing rows, but a database they have run on no longer starts under 0.4.x, so going back means restoring the backup. In a Hive installation, the upgrade to 3.14.0 takes and verifies that backup before it changes anything; keep it until you have checked Studio on 0.5.1. A fresh Studio in Hive 3.14.0 gets `ARDENT_STUDIO_INSTANCE_ID` set to the installation ID; an existing one keeps `local` unless you add the line to `config/ardentstudio.env` before you run `plan`, and references recorded earlier keep `local`. From 0.5.0 to 0.5.1 only the image changes. See Hive's [Suite 3.14.0](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3140-ardent-execution-recovery-lineage-and-artifact-transfer-v2).

## Run it on its own

The repository's quick start builds and runs the service from a checkout, with its settings supplied privately through the environment:

```bash
npm ci
npm run build
cp .env.example .env   # fill in real values privately; never commit them
set -a; . ./.env; set +a
node dist/main.js serve
```

Expected result: the service listens on `127.0.0.1:8097` by default and serves its API under `/api/ardentstudio/v1`. `node dist/main.js env` lists every variable, and the service refuses to start, naming each problem, when a required setting is missing or unsafe. Service URLs must use HTTPS except on loopback. The browser UI is HiveXUI's Studio module; the service has no UI of its own. Back up a running data directory with `ardent-studio backup DIR` (`node dist/main.js backup DIR` from a checkout), or stop the service and copy the whole directory: the database and `blobs/` belong together.

## Full instructions

- [Configuration, architecture and API](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/README.md)
- [API reference](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/docs/API.md)
- [Conductor](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/docs/CONDUCTOR.md)
- [Oathweave account links](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/docs/OATHWEAVE.md)
- [Operations and backups](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/docs/OPERATIONS.md)
- [Hive full profile: Ardent Project Studio](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#ardent-project-studio)
- [Repository instructions](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/AGENTS.md)

## Source review

Reviewed 2026-11-12 against tag `v0.2.0`, commit `7f1279f2726ad9665c1de24eb5168d98548bb8a1`, the version Hive `v3.1.1` pins: [README](https://github.com/ChefTaco/ArdentStudio/blob/v0.2.0/README.md) and [changelog](https://github.com/ChefTaco/ArdentStudio/blob/v0.2.0/CHANGELOG.md), with the Hive [full-profile guide](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/FULL.md#ardent-project-studio) and `releases/3.1.1.json`. The later `v0.2.1` security patch requires the patched Node.js lines and updates Hono; its README changes only the Node.js requirement. No installation command was run against an operational environment. License: Apache-2.0.

Release update, 2026-11-27: [Hive 3.15.1](https://github.com/ChefTaco/hive/releases/tag/v3.15.1), tag `v3.15.1`, commit `ac79185031440e1b76f5c62d4c8d0f83f19b98b7`, pins Ardent Project Studio 0.7.0, release [`v0.7.0`](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.7.0), commit `a7be369dd547799e6df379308c7e32b37f771b1c`, as Hive 3.15.0 (commit `4055623fc57b804a27237e5e493bd2985dcd3cd6`) did first; Hive 3.14.0 to 3.14.3 pinned 0.5.1. No suite release pins [`v0.6.0`](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.6.0), commit `ad76a3e7b9250b535743b79cca9919a007b46f83`, or [`v0.6.1`](https://github.com/ChefTaco/ArdentStudio/releases/tag/v0.6.1), commit `45dacb482569406bc8f9bb032f6171aec0ad91f8`; all three have published GitHub releases, and npm resolves `@hivemagnus/ardent-studio` to `0.7.0` as `latest`. The 0.6 and 0.7 section and the upgrade note follow the [changelog](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/CHANGELOG.md) from 0.5.1 to 0.7.0, [operations and backups](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/docs/OPERATIONS.md) and Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round) ("Suite 3.15.0", which names migrations 11 and 12). The quick start in the [README](https://github.com/ChefTaco/ArdentStudio/blob/v0.7.0/README.md) is unchanged from 0.5.1, as are the Node.js requirement and the default port; the README adds membership and purge to its release summary. The Hive full-profile guide at `v3.15.1` still lists only Cindertrace, its collector and ChatterMost for `hive.sh add`, so the manual path for adding Studio stays. The header, README and full-instructions links now use `v0.7.0`. No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [ardent-studio release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/ardent-studio.md); what each Ardent Project Studio release changed is in its [changelog](https://github.com/ChefTaco/ArdentStudio/blob/main/CHANGELOG.md).
