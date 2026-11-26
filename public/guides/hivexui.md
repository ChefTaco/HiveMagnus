# HiveXUI

> The single browser UI for a Hive installation: fleet, identity, models, memory, skills, security, chat and team projects in one shell, with sections only for installed products.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveXUI) · [Release 0.12.0](https://github.com/ChefTaco/HiveXUI/releases/tag/v0.12.0) · [Theme](https://github.com/ChefTaco/HiveXUI/blob/v0.12.0/docs/THEME.md)

## Responsibility

HiveXUI is a static TypeScript and React application. The container serves compiled assets only: no application backend, database access, signing keys or infrastructure credentials. Same-origin HTTPS ingress forwards the signed-in user's own credentials to the owning API. Access tokens stay in memory; Oathweave owns the SSO session. Nothing puts credentials in URLs or browser storage.

HiveXUI shows one section per installed product, plus Hive and System. The Hive Registry is the source of which products are installed when it is reachable; a section shows only for a product that the runtime `products` configure and the Registry lists. If the Registry is unreachable or unreadable, HiveXUI follows `runtime.json` and warns on the overview. A bookmark to an absent product opens the overview. `Ctrl` or `Cmd` + `K` searches every visible screen and, from 0.7.0, records in the installed products you can read, such as Magnus nodes, Studio projects, memories, cases, skills and users. There is one theme for now: dark, in the Magnus look.

## What it covers

| Section | Product | Notes |
| --- | --- | --- |
| Hive | Installation overview and incidents | Readiness shows availability, not migration or workflow acceptance |
| Inbox | Notable events from every installed product that announces an event feed in the Hive Registry | The header bell shows the unread count. Read positions stay in this browser |
| Setup | The first-run checklist the Hive Registry records after an install or upgrade | Administrators only. HiveXUI shows each step and its `./hive.sh` command and never writes the checklist |
| Installed software | From 0.11.0, the signed release's pins beside what each host reports it runs, and Magnus's installation report | Administrators only, linked from the Installation overview. Needs the Hive Registry 1.4.0 or later and the `hivexui-registry` client; see [Installed software](#installed-software) |
| Agent 360 | One page for one agent at `/agents/NODE~PROFILE`, with a tab per product | Each tab says when its product is absent or cannot filter by agent. From 0.12.0, an Executions tab lists the profile's recent Ardent tasks through Magnus |
| Magnus | Fleet, operations, provisioning, Hermes Agent, Ardent and Codex pages at `/fleet` | Reaches an allowlist of browser routes through `/api/magnus`. The web terminal appears on node detail only when a fleet gateway is deployed |
| Studio | [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md) | Projects and Gallery open a fullscreen page at `/studio`. Needs at least one Ardent agent in Magnus |
| Oathweave | Account security, users, roles, service accounts, clients, sessions, audit | Actors also needs Emberpath and HiveMem |
| Emberpath | Routers, providers, routing, tests, traces, API keys, audit | |
| HiveMem | Memories, memory operations, workspaces | |
| HiveSkills | Catalogue, releases, assignments, agent targets, distribution receipts, deployment jobs | |
| Embermend | Recommendations, scoped decisions, pause controls, evidence and outcomes | Optional product; see the [Embermend guide](https://hivemagnus.com/guides/embermend.md) |
| Cindertrace | Cases, entities, events, evidence, sources, policies, audit, approvals | The investigation lab is a separate installation that HiveXUI serves in local mode; see the [Cindertrace guide](https://hivemagnus.com/guides/cindertrace.md#try-the-evolving-investigation-lab) |
| ChatterMost | Channels, DMs, threads, files, search, administration | Official apps connect to ChatterMost directly |

The [HiveXUI README](https://github.com/ChefTaco/HiveXUI/blob/v0.12.0/README.md) retires the products' own web UIs, except Magnus's standalone console for installations without the suite. It kept Cindertrace's console only until Cindertrace shipped HiveXUI in local mode for standalone installs and the lab, which [Cindertrace 0.8.0](https://hivemagnus.com/guides/cindertrace.md) does: it removes its console, and HiveXUI is its only UI. Every product API stays usable on its own, by native clients and scripts. Do not treat synthetic screenshots as evidence of backend authorization or workflow parity.

From 0.10.0, HiveXUI signs in to Cindertrace without Oathweave in two cases, and then shows only Cindertrace's pages and refuses requests to products the runtime does not configure. In **local mode**, for a standalone Cindertrace or its investigation lab, `runtime.json` names only Cindertrace and no `identity` (`{"schema": 1, "mode": "local", "products": {"cindertrace": "/api/cindertrace"}}`) and HiveXUI uses Cindertrace's own API sign-in. On a suite installation with Cindertrace, the sign-in page offers **Oathweave unavailable? Cindertrace recovery sign-in** with Cindertrace's local administrator; the choice lasts for the tab. See [Cindertrace sign-in](https://github.com/ChefTaco/HiveXUI/blob/v0.10.0/README.md#cindertrace-sign-in-local-mode-and-recovery).

## In a Hive installation

[Hive](https://hivemagnus.com/guides/hive.md) 3.14.3 installs HiveXUI 0.12.0 (pinned since 3.14.0), a digest-pinned image, next to the ingress, in every profile, and writes its public runtime file. There is nothing else to configure. HiveXUI is the suite's browser UI: Emberpath, HiveSkills and, from Cindertrace 0.8.0, Cindertrace no longer bundle a web UI of their own. Every product's errors show a consistent message with the product's code and request ID, and destructive actions are confirmed in one shared dialog.

From 0.8.0, with Magnus 2.10, **Magnus > Fleet > Nodes** shows each host agent's node key: a Node key column in the list, a Node credentials panel (administrators and operators) with the mode, the automatic binding window and what still blocks enforcing keys, and a Node credential card on node detail. Administrators see key fingerprints there, approve or reject a binding Magnus refused for its address, and revoke or reset a key behind the shared confirmation; issuing an enrollment token and rotating a key stay command-line and API steps. Against a Magnus without per-node credentials all of this stays hidden. On **Emberpath > Providers**, changing a provider's base URL to another server asks for its secret again before saving, matching Emberpath 2.5.0.

From 0.9.0, with Magnus 3, the Node credentials panel says whether the node-auth mode is set on the server or is the default (enforce), warns about a deprecated explicit `compat` or `warn`, names agents that still need an upgrade, and shows the server key rotation: the active and staged key fingerprints, how many agents pin each, and the next step, which stays a command-line and API step. In enforce mode Reset on node detail stays disabled and says why; Revoke still works. Against a Magnus before 3.0.0 the panel reads as in 0.8.0.

From 0.9.1, against a Magnus that reports 3.0.1 or later, **Magnus > Fleet > Upgrade agents** offers ADMIN an **Allow major upgrade** option, the browser counterpart of `magnus-server agents upgrade --allow-major`. Turning it on asks first and explains the stepping stone (2.10.x to 2.10.3, then 3.x) and the one-hour major-upgrade authorization the server signs for each node with its server key, which the agent verifies against the key it pins, so the node needs a bound node key. The drawer then checks eligibility with the option, says in the run confirmation how many selected agents cross a major, lists the agents held back with Magnus's cause and remedy (`MAJOR_NEEDS_STEPPING_STONE`, `MAJOR_NEEDS_NODE_KEY`), and marks the rollout "major upgrades allowed". The option resets each time the drawer opens. Against a Magnus before 3.0.1 the drawer keeps its manual major-version notice and offers no option; operators and viewers read that an ADMIN can include those agents.

From 0.9.2, with Magnus 3.1.0, the Software revisions card on node detail reads the node's read-only software status (`GET /api/v1/nodes/:nodeId/software`) when you press **Check versions** or **Read update cache**: installed versions, and the pending updates in the node's existing APT cache with its refresh time. It dispatches no command and runs nothing on the node, and node viewers can use it; **APT upgrade** stays an explicit operator command. Against a node agent older than 3.1.0 (`SOFTWARE_STATUS_UNAVAILABLE`) or a Magnus server without the route, the card says the status is unavailable and to update Magnus and the node agent, and never falls back to a shell command.

## Installed software

From 0.11.0, **Installed software** (`/?page=software`, linked from the Installation overview for administrators) puts the signed release's pins beside what the hosts report: each host's activation receipt against the release version and manifest digest, and each component's pinned version and image digest against the image digest, state and health its host last reported, which `hive.sh` records in the Hive Registry. A digest that differs from the pin is flagged whatever the version label says. For Magnus, the page reads Magnus's installation report (`GET /api/magnus/system/installation`, Magnus 3.2.0 or later, for Magnus administrators): the running version against the pin, whether it is a native npm install, and every dependency npm resolved differently from the `npm-shrinkwrap.json` the Magnus package shipped. Host agents are counted against the pinned version; they report no installed integrity yet. Against a Magnus without the report the Magnus panel says so and the rest of the page still shows.

The inventory is the registry's only signed-in read, with the fixed Oathweave client `hivexui-registry` and prefix `/api/registry`, so `runtime.json` does not change. HiveXUI enables it when the registry's public product entry announces `inventory.v1` (Hive Registry 1.4.0 or later); otherwise the page says to upgrade and run `./hive.sh console-clients add`, which is also how an upgraded installation adds the client. See [Installed software](https://github.com/ChefTaco/HiveXUI/blob/v0.11.0/README.md#installed-software) and the [Hive guide](https://hivemagnus.com/guides/hive.md#upgrade).

## Execution recovery, lineage and delivery

From 0.12.0, HiveXUI shows the execution recovery, lineage and artifact transfer of Ardent 3.2.0, Magnus 3.3.0, Ardent Project Studio 0.5 and Emberpath 2.6.0. Against older products these views stay hidden or say what is missing, and Studio fields added in 0.5.0 are read as optional.

- **Studio room.** Interrupted tasks carry a state chip: **Recovering** (Ardent continues the run under the same task), **Needs decision (effect unknown)** (held, and counted among the blockers) or **Unknown outcome** (cannot be resumed). A held task has a recovery panel with the reason and only the decisions the backend lists, each confirmed with what it does to the interrupted call and sent once with an idempotency key. The lineage drawer traces a task from the originating request through hand-offs, reassignments and workflow steps to each Ardent attempt's model attempts, linked to their Emberpath traces, tool calls and artifacts. The **Workflows** drawer shows branch-and-join runs with their steps, needs, waiting and blocked reasons and the node actions Studio offers (retry, skip, cancel run).
- **Deliverable Review.** Preview renditions are shown inline; **Download original** streams with progress, resumes with `Range` up to five times after a dropped connection and saves only after the SHA-256 matches. The Receiving strip shows import progress, resumes and failures, and a Provenance panel links to the execution history.
- **Agent 360.** The Executions tab lists the profile's recent Ardent tasks with state, recovery, root and parent, linked to the Magnus task view; Traffic gains an execution column and a **Linked to executions** view, and its outcome badge reads Emberpath's outcomes correctly (every trace showed as failed before).
- **Magnus.** The Ardent overview shows the agent dependency report (`GET /ardent/dependencies`): HiveMem, HiveSkills and Emberpath as usable, missing, unsupported or awaiting configuration, with where each was found, and **Check again**. The Ardent profile page lists every artifact the agent registered and, when the profile offers artifact transfer v2, downloads through `/content` with the real type and file name, checking the digest before saving.

## Build it

```bash
npm ci --ignore-scripts
npm run build
npm test
```

Expected result: compiled assets in `dist/`. `Dockerfile` serves them as UID 101. Without Hive, mount a public `runtime.json` listing product prefixes and Oathweave public clients, or the local-mode file above for a standalone Cindertrace, and configure HTTPS and API routing in a separate ingress, as the README describes. Runtime JSON contains public identifiers only.

## Source review

Reviewed 2026-11-12 against tag `v0.2.7`, commit `de613008a438a90d660e5a7161b3fe805095572b`, the version Hive `v3.1.1` pins: [README](https://github.com/ChefTaco/HiveXUI/blob/v0.2.7/README.md), [changelog](https://github.com/ChefTaco/HiveXUI/blob/v0.2.7/CHANGELOG.md) and [theme](https://github.com/ChefTaco/HiveXUI/blob/v0.2.7/docs/THEME.md). The [0.2.7 release](https://github.com/ChefTaco/HiveXUI/releases/tag/v0.2.7) publishes the container image that Hive installs. License: Apache-2.0.

From 0.10.2, **Submit test** on an Ardent profile under **Magnus** sends a UUID as the Ardent task ID, so Ardent accepts the test task and the profile can use its configured tools, including HiveMem. The image requires nginx 1.30.7 or later.

From 0.10.3, the ChatterMost section vendors ChatterMost 0.7.1's browser conversation contract: requests ChatterMost now refuses, such as reaction names with path, query or markup characters and over-long profile, channel and post fields, stop in the browser with the contract error, and removing a reaction encodes every segment of its request path.

Release update, 2026-11-24: [Hive 3.14.0](https://github.com/ChefTaco/hive/releases/tag/v3.14.0), tag `v3.14.0`, commit `d182802ce71edb17501ef68f2eaec802aca19e9a`, pins HiveXUI 0.12.0, tag [`v0.12.0`](https://github.com/ChefTaco/HiveXUI/releases/tag/v0.12.0), commit `72a249e3672a4dd42b3d246038fb0f5b2cbc539c` (Hive 3.13.0 to 3.13.5 pinned 0.11.0). The Agent 360 row and the execution recovery, lineage and delivery section follow its [changelog](https://github.com/ChefTaco/HiveXUI/blob/v0.12.0/CHANGELOG.md); its [README](https://github.com/ChefTaco/HiveXUI/blob/v0.12.0/README.md) changes only the line naming the vendored Magnus contract. Its vendored Magnus browser contract, whose provenance names Magnus commit `4894bfbc95d2a2da5da331a0db525f9801d9729e`, is byte-identical to `packages/contracts/src/browser.ts` at Magnus `v3.3.0`; its Ardent Project Studio contract names Studio commit `633b57252adc2b7bc287c54377cb7de073e79e1c` (tag `v0.5.0`), its Emberpath model administration contract names Emberpath commit `7cd32f83a0cf59fd69872dfb0e53ec9f8fff2daa` (tag `v2.6.0`), and its Hive Registry contracts are unchanged, as are `browser-contract.ts` and `inventory-contract.ts` between Hive `v3.13.4` and `v3.14.0`. It requires `@hivemagnus/hive-common` ^0.6.0. The header links, the README link and the suite sentence now use `v0.12.0`. The build commands are unchanged and were not re-run for this update.

Earlier release records for this guide are kept in the site repository's [hivexui release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/hivexui.md); what each HiveXUI release changed is in its [changelog](https://github.com/ChefTaco/HiveXUI/blob/main/CHANGELOG.md).
