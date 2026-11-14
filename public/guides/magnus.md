# Magnus: agent guide

> Magnus operates Linux fleets and the agents that run on them: inventory and health, commands, cron jobs, files, logs, skills, rollouts, incidents and an append-only audit log.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/magnus) · [Release 2.10.0](https://github.com/ChefTaco/magnus/releases/tag/v2.10.0) · [Changelog](https://github.com/ChefTaco/magnus/blob/v2.10.0/CHANGELOG.md) · [Current standalone instructions](https://github.com/ChefTaco/magnus#quick-start-standalone) · [Ardent guide](https://hivemagnus.com/guides/ardent.md)

## Choose an entry point

Use Magnus for fleet inventory, health, jobs, skills, rollouts and audit. A small agent on each host reports to a central API server. Magnus can also manage the AI agents on those hosts: Hermes Agent, the Codex CLI and [Ardent](https://hivemagnus.com/guides/ardent.md), a separate product with its own repository. Oathweave sign-in, HiveMem memory, HiveSkills distribution and Emberpath model routing are optional integrations.

There are two ways to run Magnus. Through [Hive](https://hivemagnus.com/guides/hive.md) 3.8.0, the full profile adds Magnus 2.10.0 and its browser pages are the Magnus section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md) at `/fleet`, reaching the API through an allowlist of browser routes with a short-lived Oathweave token. Agents and services keep using the Magnus endpoint directly. The standalone installer below is for Magnus without Hive, and installs the Next.js UI that Magnus's README documents for standalone installs.

Cindertrace is the separate security product for correlated cases, evidence, investigations and approvals. Magnus can export observations and provide fleet context and approved host execution; the embedded security runtime was retired in Magnus 2.0. See the [Cindertrace guide](https://hivemagnus.com/guides/cindertrace.md) and the repository migration guidance before upgrading an existing local-security installation.

## In a Hive installation

Hive 3.8.0 pins the Magnus server and fleet gateway 2.10.0 by image digest and the host agent `@hivemagnus/magnus-agent` 2.10.0 by npm integrity. With a port for host agents, `hive.sh magnus-agent install` installs the agent on a fleet host and stages the Ardent 3.1.3 package the agent's lock pins; `hive.sh magnus-agent enroll` then reviews and enables full node capabilities on an installer-owned single host: commands, managed cron and a selected restricted web terminal. Guided setup offers both after installation. After a suite upgrade, `hive.sh post-upgrade` or `hive.sh magnus-agent install` updates an existing agent while keeping its enrollment scope. See the [Hive guide](https://hivemagnus.com/guides/hive.md#fleet-hosts-and-security-events).

In HiveXUI, **Magnus > Ardent > Installations** installs and updates the staged Ardent package, and **New Agent** creates, configures and starts an Ardent profile with its own HiveMem identity. [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md) uses the same Magnus Ardent bridge through its own Oathweave service identity. Since the reviewed 2.4.2, Magnus added an agent identity lookup that HiveXUI's Agent 360 uses (2.7.0), an event feed for the HiveXUI inbox (2.8.0) an opt-in Emberpath model provider for the fleet assistant (2.9.0) and per-node credentials (2.10.0). An external Magnus, managed and upgraded separately, can serve an installation's Magnus pages and Studio instead of the `magnus` component.

## Per-node keys

From 2.10.0 each host agent has its own Ed25519 node key, and the server has a signing key; requests in both directions are signed for exactly one node. The fleet-wide `NODE_MANAGER_SECRET` keeps working while the fleet moves over, in the default `compat` mode. Nothing has to be done on the nodes: upgrade the server first, then the agents, and each upgraded agent binds its own key after its first accepted heartbeat, for 30 days after the server's first start on 2.10.0 (or until `NODE_AUTH_LEGACY_UPGRADE_UNTIL`). The server binds a key only for an inventory node without one, from the node's recorded address, and notifies you with the key fingerprint; compare it with `magnus-agent identity show` on the host. A binding refused because the agent calls from another address, for example through a reverse proxy, is kept for an administrator to approve after comparing fingerprints. Agents that reach a Hive installation's Magnus through the suite's host agent port cannot ask for the automatic binding at all and keep the shared secret until they are enrolled with a one-time token (`magnus-agent enroll --token-file`). Agents upgraded after the window need a token too.

In HiveXUI, **Magnus > Fleet > Nodes** shows each node's key, the fleet's progress and what blocks enforcing keys; administrators can approve a binding refused for its address and revoke or reset a key. Enforcing keys only (`NODE_AUTH_MODE=enforce`) is opt-in and last: set it on an agent only once it has a bound key, and on the server only when `GET /api/v1/node-credentials/summary` reports nothing that blocks it; `warn` first shows what still uses the shared secret. Back up the server key file (`$MAGNUS_HOME/state/node-auth/`) with the database. Before moving an agent with a key back to a release older than 2.10.0, reset its credentials on the server. Per the changelog, 2.10.0 and 2.10.1 agents with a key refuse the server's managed requests on enrolled nodes, so agent upgrades from Magnus, Embermend, skills and other changes to such a node fail; 2.10.2, the latest patch on npm, fixes this; Hive 3.8.0 pins 2.10.0 and Hive 3.8.1 pins 2.10.2. See [per-node credentials](https://github.com/ChefTaco/magnus/blob/v2.10.0/docs/NODE_CREDENTIALS.md).

## Install Magnus on its own

Prerequisites: Linux with systemd, npm, Node.js 24.22.3+ in the 24 series or 26.13.1+ in the 26 series, and Docker Compose or existing PostgreSQL and Redis. The docs recommend PostgreSQL 17 (15+ works) and Redis 7, and TLS certificates for the server, the standalone UI and each agent.

```bash
npx @hivemagnus/magnus init
```

Expected result: the installer creates `~/.magnus`, installs the server and the standalone UI, generates credentials and a self-signed certificate, prepares PostgreSQL/Redis through Compose (or uses `--database-url` and `--redis-url`), and starts systemd user services. Use the printed URL and login. Save the generated password privately; the self-signed certificate is for evaluation.

Inspect options before choosing an installation mode:

```bash
npx @hivemagnus/magnus init --help
```

`--system --service-user magnus` installs system units under `/opt/magnus` instead. For user services to survive logout and start at boot, the setup may require `loginctl enable-linger $USER`. Add managed nodes through the standalone UI and the documented node-agent setup; each node requires its own configuration and secret. Installing the server alone does not enroll other hosts.

## Web terminal

The browser terminal runs through a separate [fleet gateway](https://github.com/ChefTaco/magnus/tree/v2.10.0/services/fleet-gateway) that holds the restricted SSH key, so neither the browser nor the Magnus API does. It is off by default: HiveXUI offers a terminal only when a gateway is deployed and configured on the server, and the person holds an `ADMIN` link and the `magnus:terminal` permission. Opening one also needs identity verified within the last five minutes, otherwise `STEP_UP_REQUIRED`, and an operator-approved host key for that node; unknown keys are refused and nothing is learned on first use. The audit log records metadata only. The gateway ships as the container image `ghcr.io/cheftaco/magnus-fleet-gateway`; Hive offers it in every release but never selects it in a profile.

## Ardent with bundled Emberfold

Ardent now has [its own guide](https://hivemagnus.com/guides/ardent.md): standalone installation with `npm i -g @hivemagnus/ardent`, model configuration, the gateway, the 3.x storage change and management through Magnus. Ardent imports its pinned Emberfold library directly; no separate Emberfold account or HTTP server is needed.

## Full instructions

- [Magnus installer](https://github.com/ChefTaco/magnus/tree/v2.10.0/packages/magnus)
- [Node agent setup](https://github.com/ChefTaco/magnus/tree/v2.10.0/packages/agent)
- [Ardent agents, New Agent and the service bridge](https://github.com/ChefTaco/magnus/blob/v2.10.0/docs/ARDENT.md)
- [Browser route inventory](https://github.com/ChefTaco/magnus/blob/v2.10.0/docs/console-api.md)
- [Cindertrace migration](https://github.com/ChefTaco/magnus/blob/v2.10.0/docs/CINDERTRACE_MIGRATION.md)
- [Repository instructions](https://github.com/ChefTaco/magnus/blob/v2.10.0/AGENTS.md)

## Source review

Reviewed 2026-11-14 against tag `v2.10.0`, commit `32417a3742172858c6fdb8c44009ebbe737b13ec`, the version Hive `v3.8.0` pins: the [changelog](https://github.com/ChefTaco/magnus/blob/v2.10.0/CHANGELOG.md) entry for 2.10.0, [per-node credentials](https://github.com/ChefTaco/magnus/blob/v2.10.0/docs/NODE_CREDENTIALS.md), the [agent README](https://github.com/ChefTaco/magnus/blob/v2.10.0/packages/agent/README.md) and the host agent's `npm-shrinkwrap.json`, which pins Ardent `3.1.3`, with the changelog entries for 2.10.1 and 2.10.2. The root README, installer README, fleet gateway README and Ardent management doc are unchanged from `v2.9.1`; they were last read in full at `v2.4.2` on 2026-11-12, and the changelog from 2.4.3 to 2.9.1 on 2026-11-13. Suite behavior follows Hive `v3.8.0` [full profile](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/FULL.md#node-keys), [upgrading](https://github.com/ChefTaco/hive/blob/v3.8.0/UPGRADING.md) and [installation guide](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/QUICKSTART.md). npm publishes `@hivemagnus/magnus` and `@hivemagnus/magnus-agent` 2.10.0, and 2.10.2 as `latest`. No installation command was run for this review. The standalone commands are unpinned: npm resolves `@hivemagnus/magnus` to its current `latest`, which may be newer than the suite pin. Follow current instructions for upgrades. License: Apache-2.0.
