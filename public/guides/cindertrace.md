# Cindertrace: security investigations and response

> Standalone security operations: correlated cases, hashed evidence, investigation drafts, assurance, policies, and an auditable approval trail.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/cindertrace) · [Current installation guide](https://github.com/ChefTaco/cindertrace/blob/main/docs/INSTALLATION.md) · [Releases](https://github.com/ChefTaco/cindertrace/releases)

## Choose an entry point

Use Cindertrace to investigate endpoint, network, identity, and application observations. In a Hive installation it is a section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md), signed in through Oathweave with resource tokens, and [Hive](https://hivemagnus.com/guides/hive.md) 3.12.5 installs Cindertrace 0.8.1 (pinned since 3.12.2) with its private PostgreSQL in the `full` profile, and `hive.sh add cindertrace` adds it to an existing installation. Fresh Hive setup starts its ingestion, dispatch and notification integrations disabled until you review them. When Oathweave is unavailable, HiveXUI's Cindertrace recovery sign-in uses Cindertrace's own local administrator. HiveXUI is Cindertrace's only UI: 0.8.0 removed its standalone console. It also runs on its own with its local administrator sign-in, PostgreSQL, and Redis; a standalone installation then serves HiveXUI in local mode, which shows only Cindertrace's pages. Hive and Magnus are optional. Collectors send signed observations directly to Cindertrace; sources and listeners must be explicitly configured.

Cindertrace owns security cases, evidence, correlation, investigations, assurance, policies, retention, audit, and approvals. Magnus owns fleet management and host execution. Existing `/security-fusion` pages and `/api/v1/security-fusion/*` API paths remain compatible.

## Install a fresh Compose stack on its own

Prerequisites: Git, npm, OpenSSL, Docker Engine with Compose v2, and Node.js 24.22.3 or later on the 24.x line, or 26.13.1 or later on the 26.x line. Use a fresh checkout and installation directory. The release reviewed here is [`v0.8.1`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.8.1).

```bash
git clone --branch v0.8.1 https://github.com/ChefTaco/cindertrace.git
cd cindertrace
npm ci
npm run init
docker compose up --build -d
```

Expected result: initialization writes unique installation secrets, an Argon2id administrator hash, a 90-day local TLS certificate and HiveXUI's `ui/runtime.json`. It refuses to overwrite an existing `.env`. Compose starts the API, PostgreSQL, Redis, HiveXUI (the pinned `ghcr.io/cheftaco/hivexui` image, static files only) and a small gateway from the Cindertrace image, applies migrations, and keeps database and Redis ports private to the Compose network.

Open `https://localhost:3444`. The gateway is the only published service and binds to loopback by default: it serves HiveXUI in local mode and forwards `/api/cindertrace/*` to the API's `/api/v1/*`, and the API owns the sign-in and its `cindertrace_session` cookie. Read the generated login privately from `state/initial-credentials.txt`. Trust the generated local certificate for development. For remote access, use your own CA-issued certificate, set `DASHBOARD_PUBLIC_ORIGIN` to the exact HTTPS origin people open, and publish the gateway on your chosen interface in a `compose.override.yaml`, as the [installation guide](https://github.com/ChefTaco/cindertrace/blob/v0.8.1/docs/INSTALLATION.md#the-ui-hivexui-in-local-mode) describes. Keep certificate verification enabled.

Source adapters begin disabled. After configuring admitted sources and their credentials, start the optional collector:

```bash
docker compose --profile collector up -d collector
```

Do not publish `.env`, credentials, certificates, state, incident records, or live case captures. For an isolated synthetic demonstration, follow the repository's [demo instructions](https://github.com/ChefTaco/cindertrace#synthetic-demo) in a separate installation with no operational sources or credentials.

## Try the evolving investigation lab

The optional lab is a disposable three-stage investigation for people and external agents, using synthetic evidence. It runs without Hive, Magnus, external sources, or a model provider. Lab startup forbids external identity and integration settings, including Oathweave, so the lab serves HiveXUI in local mode with its own local administrator sign-in and is not reached through a suite installation. Use a **fresh separate checkout**; never initialize it over an operational installation. Labs initialized before 0.8.0 ran the retired console: initialize a new lab instead of upgrading one. The lab ships in the release above:

```bash
git clone --branch v0.8.1 https://github.com/ChefTaco/cindertrace.git cindertrace-lab
cd cindertrace-lab
npm ci
npm run init -- --lab
npm run lab -- up
```

Open `https://localhost:3445/security-fusion/lab`, sign in using this checkout's private `state/initial-credentials.txt`, then choose **Start investigation**. Initialization creates separate credentials, state, database volumes, TLS certificate, and a dedicated Compose project; it refuses existing configuration. The gateway binds to loopback.

1. **Suspicious login:** repeated authentication failures invite competing hypotheses; failures alone do not establish compromise.
2. **Benign explanation:** an approved automation change explains the retries. Revisit confidence while keeping other activity open to investigation.
3. **Corroborating activity:** a separate successful session, unauthorized privilege change, and suspicious outbound activity call for another revision and narrowly scoped containment review.

Save a revision before each evidence release and before completion. Record compromise confidence, what changed, structured assertions with evidence citations, next checks, and a containment choice. Freeform reasoning is unscored. Completion compares supported and unsupported assertions, tentative hypotheses, retractions, confidence changes, and unnecessary containment across revisions. It uses only evidence available at each revision and has no aggregate score. Existing case confidence is labeled **correlation confidence** separately from investigator compromise confidence.

Containment remains an explicitly labeled simulation: an ADMIN reviews the exact target, effect, evidence and expiry, then approves or rejects it. Approval expires after ten minutes and is consumed once; newer evidence or a revision invalidates pending plans. Simulated decisions never contact Magnus or enter the production action outbox. External collection, integrations, notifications and dispatch are disabled, and synthetic evidence does not alter integration health.

External agents use separate server-side read, draft and lab-control credentials through `CindertraceClient`. They can investigate and advance evidence, but cannot start runs or approve containment. Keep generated agent credentials in the lab's private state directory. See the [complete lab workflow and API](https://github.com/ChefTaco/cindertrace/blob/v0.8.1/docs/INVESTIGATION-LAB.md).

`npm run lab -- stop` preserves history; `npm run lab -- up` resumes it. Restarting an investigation creates a new run while retaining prior results. Destruction requires `npm run lab -- destroy NAME`, with the exact generated `COMPOSE_PROJECT_NAME`, and removes only that lab's containers and volumes. Local state and credentials remain until separately removed.

## Investigate and approve

ADMIN can access evidence and approve response plans. OPERATOR can investigate and request response review. VIEWER cannot enumerate sensitive security data. Agent read and investigation-draft credentials cannot approve containment.

Response requires explicit confirmation of an exact immutable plan, expires after ten minutes, and is used once. Unknown outcomes require review and are never automatically replayed. Host response controls require a configured Magnus bridge, managed-node admission, explicit allowlists, protected targets, and an opted-in managed agent. Installing Cindertrace alone does not install a host agent or enable response.

## Optional integrations

- **Oathweave and Emberpath:** sign-in and scoped identity audit and routing security metadata. Security export uses scoped OAuth client credentials; the retired static-token fallback is not supported.
- **Magnus:** inventory, durable observations, summaries and links, and explicitly approved restart, isolation, or release through its response bridge. Fleet operations remain independent of Cindertrace availability.
- **Suite products:** from 0.5.0 Cindertrace serves an event feed for the HiveXUI inbox, and from 0.6.0 its collector can pull the audit exports of HiveMem, HiveSkills, Ardent Project Studio and Embermend. Hive 3.12.5 still leaves that suite audit collection off. From Hive 3.12.0 the collector can also run inside the installation as the optional managed `cindertrace-collector` component, for sources outside it such as a logging host's Loki; no profile selects it. See the [Hive guide](https://hivemagnus.com/guides/hive.md#fleet-hosts-and-security-events).
- **Sources:** Wazuh, UniFi, NetFlow/IPFIX, Tailscale, Loki, and ChatterMost/Mattermost adapters. Only configured inputs and listeners run. ChatterMost/Mattermost audit export excludes message bodies. From 0.8.1 one `LOKI_QUERY` should select every stream of a UniFi gateway: UniFi Network 11 no longer logs firewall hits as syslog lines, so the collector also reads IPFIX or NetFlow v9 flows decoded by GoFlow2 (`-format json`) as `netflow` events, plus `unifi_dns` activity for port 53, with sampled and estimated volumes, and UniFi CEF lines (Activity Logging to a SIEM server) on the Loki path. A watched source whose polls succeed but that has had no event for `SECURITY_FUSION_QUIET_AFTER_HOURS` hours (default 6, `0` turns it off) reports `degraded`; `SECURITY_FUSION_QUIET_SOURCES` lists the watched sources (default `netflow`). See [UniFi gateway streams in Loki](https://github.com/ChefTaco/cindertrace/blob/v0.8.1/docs/INTEGRATIONS.md#unifi-gateway-streams-in-loki).
- **Agents:** the server-side Cindertrace adapter supports scoped reads and investigation drafts. Keep its credentials server-side.

Follow the [integration guide](https://github.com/ChefTaco/cindertrace/blob/main/docs/INTEGRATIONS.md) for exact scope and configuration requirements.

## Upgrade an existing installation

Use the dedicated upgrade command from a trusted Cindertrace checkout. Review a release and resolve its tag to an immutable 40-character commit. Replace `COMMIT` and `/opt/cindertrace` with the selected revision and your installation directory.

```bash
npm run upgrade -- --to COMMIT --project-dir /opt/cindertrace --dry-run
```

Expected result: the tool builds the selected source and checks the installation before downtime. Follow the [upgrade runbook](https://github.com/ChefTaco/cindertrace/blob/main/docs/UPGRADING.md) to resume the resulting upgrade record and activate it. It covers Compose installations, frozen encrypted backups, independent restore verification, additive migration reruns, health checks, and interrupted upgrades. From 0.8.0 the command upgrades Compose installations only; native systemd installations are no longer supported and move to Compose through a verified backup and restore.

Moving a standalone 0.7.x installation to 0.8.0 is a one-time manual step, because the standalone console is replaced by the `ui` and `gateway` services and the upgrade command refuses that layout change. Follow [From 0.7.x to 0.8.0](https://github.com/ChefTaco/cindertrace/blob/v0.8.0/docs/UPGRADING.md#from-07x-to-080): make and verify a recovery backup, stop the old services and check out `v0.8.0`, create HiveXUI's `ui/runtime.json`, edit `.env` as it lists (including `CINDERTRACE_BROWSER_AUTH_ENABLED=true`), then start 0.8.0 with `--remove-orphans`. 0.8.0 adds no database migration, and Hive suite installations are unaffected because they never ran that console.

Rollback keeps current state and requires reviewed application compatibility. After new writes, reconcile current state; do not restore a stale database or automatically replay uncertain host effects. Database engine or deployment-layout changes require a separate rehearsed migration.

## Full instructions

- [Installation and TLS](https://github.com/ChefTaco/cindertrace/blob/main/docs/INSTALLATION.md)
- [Upgrade and recovery command](https://github.com/ChefTaco/cindertrace/blob/main/docs/UPGRADING.md)
- [Migration, backup, and restore](https://github.com/ChefTaco/cindertrace/blob/main/docs/MIGRATION.md)
- [Privacy and data handling](https://github.com/ChefTaco/cindertrace/blob/main/PRIVACY.md)
- [Security model and private reporting](https://github.com/ChefTaco/cindertrace/blob/main/SECURITY.md)
- [Repository instructions](https://github.com/ChefTaco/cindertrace/blob/main/AGENTS.md)

## Source review

Reviewed 2026-11-05 against tag `v0.2.1`, commit `36d3a00e0e9588cf87128226083fc804d64d9a49`: [README](https://github.com/ChefTaco/cindertrace/blob/36d3a00e0e9588cf87128226083fc804d64d9a49/README.md), [lab workflow and API](https://github.com/ChefTaco/cindertrace/blob/36d3a00e0e9588cf87128226083fc804d64d9a49/docs/INVESTIGATION-LAB.md), [installation](https://github.com/ChefTaco/cindertrace/blob/36d3a00e0e9588cf87128226083fc804d64d9a49/docs/INSTALLATION.md), [integrations](https://github.com/ChefTaco/cindertrace/blob/36d3a00e0e9588cf87128226083fc804d64d9a49/docs/INTEGRATIONS.md), [upgrade runbook](https://github.com/ChefTaco/cindertrace/blob/36d3a00e0e9588cf87128226083fc804d64d9a49/docs/UPGRADING.md), `docs/OATHWEAVE.md`, `docs/OATHWEAVE_CONSOLE.md` and the package Node engines. The tag contains the lab implementation reviewed earlier at `0368abb6779c0c715e1dc00f7f346b2253f5f040` and the HiveXUI placement reviewed at `dfca27f77ae2d34625069a641c906e2f77f28f86`; the lab, installation and upgrade docs are unchanged since then. Both the normal installation and the lab now check out the release tag. The lab adds schema profile `cindertrace-v2`, which declares `rollbackCompatible=false`: before upgrading an existing `v0.1.0` installation, prepare a verified restore and review the target schema, as the upgrade runbook says. License: Apache-2.0.

Release update, 2026-11-12: [Hive 3.1.1](https://github.com/ChefTaco/hive/releases/tag/v3.1.1) pins Cindertrace 0.2.2, so the installation and lab examples now check out tag [`v0.2.2`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.2.2), commit `addf3062039e273ab9f7336ec71e60fd7c50414d`. Compared with `v0.2.1`, its [README](https://github.com/ChefTaco/cindertrace/blob/v0.2.2/README.md) and [upgrade runbook](https://github.com/ChefTaco/cindertrace/blob/v0.2.2/docs/UPGRADING.md) only add that releases from 0.2.0 publish the container image and no native archive; the installation, integration and lab docs are unchanged. In the suite, upgrading from Hive 2.x migrates its PostgreSQL store with `--allow-migrations`; see the [Hive guide](https://hivemagnus.com/guides/hive.md#upgrade).

Release update, 2026-11-12: [Hive 3.3.0](https://github.com/ChefTaco/hive/releases/tag/v3.3.0) pins Cindertrace 0.3.0, so the installation and lab examples now check out tag [`v0.3.0`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.3.0), commit `c20228cfd6f6978c4b0d07a3e0179d3b1ff218bd`. Compared with `v0.2.2`, its [README](https://github.com/ChefTaco/cindertrace/blob/v0.3.0/README.md) and [upgrade runbook](https://github.com/ChefTaco/cindertrace/blob/v0.3.0/docs/UPGRADING.md) raise the Node.js requirement to the patched 24.22.3 and 26.13.1 lines already listed above, and the [installation guide](https://github.com/ChefTaco/cindertrace/blob/v0.3.0/docs/INSTALLATION.md) adds the suite-standard `/health/live` and `/health/ready` checks and an `x-request-id` on every response; the installation commands and lab docs are unchanged. 0.3.0 verifies Oathweave resource tokens with the suite's shared verifier while keeping Cindertrace's rules, and now refuses identity links that name a `service:` or `system` account.

Release update, 2026-11-13: [Hive 3.7.0](https://github.com/ChefTaco/hive/releases/tag/v3.7.0) pins Cindertrace 0.6.1, so the installation and lab examples now check out tag [`v0.6.1`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.6.1), commit `eeec7e894fb83d5dc5a7f8f653f30c4f96da66cd`. Its [README](https://github.com/ChefTaco/cindertrace/blob/v0.6.1/README.md) is unchanged from `v0.3.0`, so the commands are the same; it still names an older tag in its own clone example. Per the [changelog](https://github.com/ChefTaco/cindertrace/blob/v0.6.1/CHANGELOG.md), 0.4.0 adds the `agent` entity type and a case filter by entity, 0.5.0 the event feed, 0.6.0 the audit collector sources, and 0.6.1 rejects a single event with an out-of-range time instead of failing its whole batch; none needs a database migration. The examples were not run for this update.

Release update, 2026-11-14: [Hive 3.8.0](https://github.com/ChefTaco/hive/releases/tag/v3.8.0) pins Cindertrace 0.7.0, so the installation and lab examples now check out tag [`v0.7.0`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.7.0), commit `c0a8867a7aeedd36eb6f241e72b76058db87e61f`. Its [README](https://github.com/ChefTaco/cindertrace/blob/v0.7.0/README.md) and Node.js engines are unchanged from `v0.6.1`, so the commands are the same. Per the [changelog](https://github.com/ChefTaco/cindertrace/blob/v0.7.0/CHANGELOG.md), 0.7.0 stops the collector retrying a refused batch forever, deletes a case's assurance packets with it, validates case updates and redacts sensitive keys in any letter case; it needs no database migration. The examples were not run for this update.

Release update, 2026-11-15: [Hive 3.9.3](https://github.com/ChefTaco/hive/releases/tag/v3.9.3) pins Cindertrace 0.7.1, so the installation and lab examples now check out tag [`v0.7.1`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.7.1), commit `b9424c17b03228b0134b0a5d220f5538296e3c73`. Its [README](https://github.com/ChefTaco/cindertrace/blob/v0.7.1/README.md) commands and Node.js engines are unchanged from `v0.7.0`, so the commands are the same. Per the [changelog](https://github.com/ChefTaco/cindertrace/blob/v0.7.1/CHANGELOG.md), 0.7.1 moves to `@hivemagnus/hive-common` 0.5.0 and uses its credential comparisons, security headers and HiveEvent feed order; responses, status codes and feed cursors are unchanged, and it needs no database migration. The examples were not run for this update.

Release update, 2026-11-17: [Hive 3.11.1](https://github.com/ChefTaco/hive/releases/tag/v3.11.1) pins Cindertrace 0.7.2, so the installation and lab examples now check out tag [`v0.7.2`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.7.2), commit `d413a9469d9afa6bae80625fed0cce7baa1b6c6e`. Its [README](https://github.com/ChefTaco/cindertrace/blob/v0.7.2/README.md) commands and Node.js engines are unchanged from `v0.7.1`, so the commands are the same. Per the [changelog](https://github.com/ChefTaco/cindertrace/blob/v0.7.2/CHANGELOG.md), 0.7.2 updates the standalone console to Next.js 16.4.6 for GHSA-mfr8-8qww-v76h; the console is part of the runtime image, and it needs no database migration. The examples were not run for this update.

Release update, 2026-11-17: [Hive 3.12.0](https://github.com/ChefTaco/hive/releases/tag/v3.12.0) pins Cindertrace 0.8.0, so the installation and lab examples now check out tag [`v0.8.0`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.8.0), commit `0c9064793020c9adeaea9c249f9a9ba98d5b6140`. Per its [changelog](https://github.com/ChefTaco/cindertrace/blob/v0.8.0/CHANGELOG.md), 0.8.0 removes the standalone console (`apps/security-console`) and the native systemd upgrade backend; HiveXUI is Cindertrace's only UI. The standalone and lab text above now follows the [README](https://github.com/ChefTaco/cindertrace/blob/v0.8.0/README.md), [installation guide](https://github.com/ChefTaco/cindertrace/blob/v0.8.0/docs/INSTALLATION.md), [lab workflow](https://github.com/ChefTaco/cindertrace/blob/v0.8.0/docs/INVESTIGATION-LAB.md) and [upgrade runbook](https://github.com/ChefTaco/cindertrace/blob/v0.8.0/docs/UPGRADING.md#from-07x-to-080) at that tag: the install and lab commands and Node.js engines are unchanged, Compose now runs HiveXUI 0.10.0 in local mode (`ui`) behind `scripts/ui-gateway.mjs` (`gateway`) at the same addresses (`https://localhost:3444`, lab `3445`), and a standalone 0.7.x installation moves to 0.8.0 by the manual steps summarized above. The API, collector and schema migrations are unchanged and it needs no database migration. Per Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.12.0/UPGRADING.md#suite-3120-cindertrace-080-and-the-emberpath-memory-principal), a suite installation with Cindertrace needs no change, `hive.sh add cindertrace` adds it to one without, and the optional `cindertrace-collector` component runs its collector inside the installation. The examples were not run for this update.

Release update, 2026-11-18: [Hive 3.12.2](https://github.com/ChefTaco/hive/releases/tag/v3.12.2) pins Cindertrace 0.8.1 for Cindertrace and the `cindertrace-collector` component, so the installation and lab examples now check out tag [`v0.8.1`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.8.1), commit `b8b0aaebb9457781dad096071d822d877bdf0a53`. Its README, installation guide, lab workflow, upgrade runbook and Node.js engines are unchanged from `v0.8.0`, so the commands are the same. Per the [changelog](https://github.com/ChefTaco/cindertrace/blob/v0.8.1/CHANGELOG.md), 0.8.1 reads UniFi IPFIX and NetFlow v9 flows decoded by GoFlow2 from Loki as `netflow` events (and `unifi_dns` activity for port 53) with sampled and estimated volumes, reads UniFi CEF lines on the Loki path, fixes five-minute flow and firewall summaries that dropped later polls' rows as duplicates, and adds the quiet-source signal (`SECURITY_FUSION_QUIET_AFTER_HOURS`, `SECURITY_FUSION_QUIET_SOURCES`); the Sources item above follows its [integration guide](https://github.com/ChefTaco/cindertrace/blob/v0.8.1/docs/INTEGRATIONS.md#unifi-gateway-streams-in-loki). It needs no database migration. Per Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.12.2/UPGRADING.md#suite-3122-cindertrace-081), the 3.12.2 controller accepts both quiet-source settings in the managed collector's source settings file. The examples were not run for this update.
