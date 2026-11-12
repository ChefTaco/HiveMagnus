# Magnus: agent guide

> Magnus operates Linux fleets and the agents that run on them: inventory and health, commands, cron jobs, files, logs, skills, rollouts, incidents and an append-only audit log.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/magnus) · [Release 2.4.2](https://github.com/ChefTaco/magnus/releases/tag/v2.4.2) · [Current standalone instructions](https://github.com/ChefTaco/magnus#quick-start-standalone) · [Ardent guide](https://hivemagnus.com/guides/ardent.md)

## Choose an entry point

Use Magnus for fleet inventory, health, jobs, skills, rollouts and audit. A small agent on each host reports to a central API server. Magnus can also manage the AI agents on those hosts: Hermes Agent, the Codex CLI and [Ardent](https://hivemagnus.com/guides/ardent.md), a separate product with its own repository. Oathweave sign-in, HiveMem memory, HiveSkills distribution and Emberpath model routing are optional integrations.

There are two ways to run Magnus. Through [Hive](https://hivemagnus.com/guides/hive.md) 3.1.1, the full profile adds Magnus 2.4.2 and its browser pages are the Magnus section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md) at `/fleet`, reaching the API through an allowlist of browser routes with a short-lived Oathweave token. Agents and services keep using the Magnus endpoint directly. The standalone installer below is for Magnus without Hive, and installs the Next.js UI that Magnus's README documents for standalone installs.

Cindertrace is the separate security product for correlated cases, evidence, investigations and approvals. Magnus can export observations and provide fleet context and approved host execution; the embedded security runtime was retired in Magnus 2.0. See the [Cindertrace guide](https://hivemagnus.com/guides/cindertrace.md) and the repository migration guidance before upgrading an existing local-security installation.

## In a Hive installation

Hive 3.1.1 pins the Magnus server and fleet gateway 2.4.2 by image digest and the host agent `@hivemagnus/magnus-agent` 2.4.2 by npm integrity. With a port for host agents, `hive.sh magnus-agent install` installs the agent on a fleet host and stages the Ardent 3.1.1 package the agent's lock pins; `hive.sh magnus-agent enroll` then reviews and enables full node capabilities on an installer-owned single host: commands, managed cron and a selected restricted web terminal. Guided setup offers both after installation. See the [Hive guide](https://hivemagnus.com/guides/hive.md#fleet-hosts-and-security-events).

In HiveXUI, **Magnus > Ardent > Installations** installs and updates the staged Ardent package, and **New Agent** creates, configures and starts an Ardent profile with its own HiveMem identity. [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md) uses the same Magnus Ardent bridge through its own Oathweave service identity. An external Magnus, managed and upgraded separately, can serve an installation's Magnus pages and Studio instead of the `magnus` component.

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

The browser terminal runs through a separate [fleet gateway](https://github.com/ChefTaco/magnus/tree/v2.4.2/services/fleet-gateway) that holds the restricted SSH key, so neither the browser nor the Magnus API does. It is off by default: HiveXUI offers a terminal only when a gateway is deployed and configured on the server, and the person holds an `ADMIN` link and the `magnus:terminal` permission. Opening one also needs identity verified within the last five minutes, otherwise `STEP_UP_REQUIRED`, and an operator-approved host key for that node; unknown keys are refused and nothing is learned on first use. The audit log records metadata only. The gateway ships as the container image `ghcr.io/cheftaco/magnus-fleet-gateway`; Hive offers it in every release but never selects it in a profile.

## Ardent with bundled Emberfold

Ardent now has [its own guide](https://hivemagnus.com/guides/ardent.md): standalone installation with `npm i -g @hivemagnus/ardent`, model configuration, the gateway, the 3.x storage change and management through Magnus. Ardent imports its pinned Emberfold library directly; no separate Emberfold account or HTTP server is needed.

## Full instructions

- [Magnus installer](https://github.com/ChefTaco/magnus/tree/v2.4.2/packages/magnus)
- [Node agent setup](https://github.com/ChefTaco/magnus/tree/v2.4.2/packages/agent)
- [Ardent agents, New Agent and the service bridge](https://github.com/ChefTaco/magnus/blob/v2.4.2/docs/ARDENT.md)
- [Browser route inventory](https://github.com/ChefTaco/magnus/blob/v2.4.2/docs/console-api.md)
- [Cindertrace migration](https://github.com/ChefTaco/magnus/blob/v2.4.2/docs/CINDERTRACE_MIGRATION.md)
- [Repository instructions](https://github.com/ChefTaco/magnus/blob/v2.4.2/AGENTS.md)

## Source review

Reviewed 2026-11-12 against tag `v2.4.2`, commit `c14cdacaad1d2f01922be84755f1f85ed5d373c5`, the version Hive `v3.1.1` pins: [root README](https://github.com/ChefTaco/magnus/blob/v2.4.2/README.md), [installer README](https://github.com/ChefTaco/magnus/blob/v2.4.2/packages/magnus/README.md), [fleet gateway README](https://github.com/ChefTaco/magnus/blob/v2.4.2/services/fleet-gateway/README.md), [Ardent management](https://github.com/ChefTaco/magnus/blob/v2.4.2/docs/ARDENT.md) and the host agent's `npm-shrinkwrap.json`, which pins Ardent `3.1.1`. Suite behavior follows Hive `v3.1.1` [full profile](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/FULL.md). The standalone commands are unpinned: npm resolves `@hivemagnus/magnus` to its current `latest`, which may be newer than the suite pin. Follow current instructions for upgrades. License: Apache-2.0.
