# Cindertrace: security investigations and response

> Standalone security operations: correlated cases, hashed evidence, investigation drafts, assurance, policies, and an auditable approval trail.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/cindertrace) · [Current installation guide](https://github.com/ChefTaco/cindertrace/blob/main/docs/INSTALLATION.md) · [Releases](https://github.com/ChefTaco/cindertrace/releases)

## Choose an entry point

Use Cindertrace to investigate endpoint, network, identity, and application observations. In a Hive installation it is a section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md), signed in through Oathweave with resource tokens, and [Hive](https://hivemagnus.com/guides/hive.md) {{hm.suite}} installs Cindertrace {{hm.version:cindertrace}} (pinned since {{hm.since:cindertrace}}) with its private PostgreSQL in the `full` profile, and `hive.sh add cindertrace` adds it to an existing installation. Fresh Hive setup starts its ingestion, dispatch and notification integrations disabled until you review them. When Oathweave is unavailable, HiveXUI's Cindertrace recovery sign-in uses Cindertrace's own local administrator. HiveXUI is Cindertrace's only UI: 0.8.0 removed its standalone console. It also runs on its own with its local administrator sign-in, PostgreSQL, and Redis; a standalone installation then serves HiveXUI in local mode, which shows only Cindertrace's pages. Hive and Magnus are optional. Collectors send signed observations directly to Cindertrace; sources and listeners must be explicitly configured. From Hive 3.15.0, when the ingress runs on Cindertrace's host and Cindertrace has no published endpoint, the controller sets `CINDERTRACE_TRUSTED_PROXIES=ingress`, so sign-in throttling and API rate limits apply to each browser rather than to the ingress.

Cindertrace owns security cases, evidence, correlation, investigations, assurance, policies, retention, audit, and approvals. Magnus owns fleet management and host execution. Existing `/security-fusion` pages and `/api/v1/security-fusion/*` API paths remain compatible.

## Install a fresh Compose stack on its own

Prerequisites: Git, npm, OpenSSL, Docker Engine with Compose v2, and Node.js 24.22.3 or later on the 24.x line, or 26.13.1 or later on the 26.x line. Use a fresh checkout and installation directory. The release reviewed here is [`v0.10.0`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.10.0).

```bash
git clone --branch v0.10.0 https://github.com/ChefTaco/cindertrace.git
cd cindertrace
npm ci
npm run init
docker compose up --build -d
```

Expected result: initialization writes unique installation secrets, an Argon2id administrator hash, a 90-day local TLS certificate and HiveXUI's `ui/runtime.json`. It refuses to overwrite an existing `.env`. From 0.10.0 it writes the Cindertrace setting names (`CINDERTRACE_PUBLIC_ORIGIN`, `CINDERTRACE_ADMIN_*`); the console-era `DASHBOARD_*` names keep working, and the API refuses to start when both spellings of a setting disagree. Compose starts the API, PostgreSQL, Redis, HiveXUI (the pinned `ghcr.io/cheftaco/hivexui` image, 0.12.1 in this release, static files only) and a small gateway from the Cindertrace image, applies migrations, and keeps database and Redis ports private to the Compose network.

Open `https://localhost:3444`. The gateway is the only published service and binds to loopback by default: it serves HiveXUI in local mode and forwards `/api/cindertrace/*` to the API's `/api/v1/*`, and the API owns the sign-in and its `cindertrace_session` cookie. Read the generated login privately from `state/initial-credentials.txt`. Trust the generated local certificate for development. For remote access, use your own CA-issued certificate, set `CINDERTRACE_PUBLIC_ORIGIN` to the exact HTTPS origin people open, and publish the gateway on your chosen interface in a `compose.override.yaml`, as the [installation guide](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/INSTALLATION.md#the-ui-hivexui-in-local-mode) describes. Keep certificate verification enabled. From 0.9.0 the API reads the browser's address from the gateway's `X-Forwarded-For` (Compose sets `CINDERTRACE_TRUSTED_PROXIES=gateway`), so sign-in throttling applies per browser; add any reverse proxy in front of the gateway to that setting.

From 0.10.0, `CINDERTRACE_LOCAL_ACCOUNTS_JSON` adds local accounts with an Argon2id hash and the `ADMIN`, `OPERATOR` or `VIEWER` role beside the administrator, and each local account, the administrator included, can require a TOTP code. Signing in with a code through HiveXUI needs HiveXUI 0.13.0 or later, newer than the image fresh installations run; set `CINDERTRACE_UI_IMAGE` to move to it. See [more local accounts](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/BROWSER_AUTH.md#more-local-accounts-roles-and-totp).

Source adapters begin disabled. After configuring admitted sources and their credentials, start the optional collector:

```bash
docker compose --profile collector up -d collector
```

From 0.10.0, the opt-in `backup` service writes and verifies an encrypted recovery archive every 24 hours and keeps the newest seven in `state/backups` on the installation's own disk; keep a copy of `SECURITY_BACKUP_ENCRYPTION_KEY` elsewhere and copy the archives off-host, as [scheduled backups](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/MIGRATION.md#scheduled-backups) describes:

```bash
docker compose --profile backup up -d backup
```

Do not publish `.env`, credentials, certificates, state, incident records, or live case captures. For an isolated synthetic demonstration, follow the repository's [demo instructions](https://github.com/ChefTaco/cindertrace#synthetic-demo) in a separate installation with no operational sources or credentials.

## Try the evolving investigation lab

The optional lab is a disposable three-stage investigation for people and external agents, using synthetic evidence. It runs without Hive, Magnus, external sources, or a model provider. Lab startup forbids external identity and integration settings, including Oathweave, so the lab serves HiveXUI in local mode with its own local administrator sign-in and is not reached through a suite installation. Use a **fresh separate checkout**; never initialize it over an operational installation. Labs initialized before 0.8.0 ran the retired console: initialize a new lab instead of upgrading one. The lab ships in the release above:

```bash
git clone --branch v0.10.0 https://github.com/ChefTaco/cindertrace.git cindertrace-lab
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

External agents use separate server-side read, draft and lab-control credentials through `CindertraceClient`. They can investigate and advance evidence, but cannot start runs or approve containment. Keep generated agent credentials in the lab's private state directory. See the [complete lab workflow and API](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/INVESTIGATION-LAB.md).

`npm run lab -- stop` preserves history; `npm run lab -- up` resumes it. Restarting an investigation creates a new run while retaining prior results. Destruction requires `npm run lab -- destroy NAME`, with the exact generated `COMPOSE_PROJECT_NAME`, and removes only that lab's containers and volumes. Local state and credentials remain until separately removed.

## Investigate and approve

ADMIN can access evidence and approve response plans. OPERATOR can investigate and request response review. From 0.10.0 VIEWER can read the overview summary, sources and policies, but not cases, events, entities, evidence or the inbox feed. Agent read and investigation-draft credentials cannot approve containment.

Response requires explicit confirmation of an exact immutable plan, expires after ten minutes, and is used once. From 0.9.0 approvals answer 503 `DISPATCH_DISABLED` while `SECURITY_DISPATCH_ENABLED` is not `true`, and undecided previews and approval requests are cancelled after ten minutes. From 0.10.0 two optional [approval safeguards](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/INTEGRATIONS.md#approval-safeguards), both off by default, require a recent sign-in (`SECURITY_APPROVAL_MAX_AUTH_AGE_SECONDS`) or a different administrator from the one who requested the action (`SECURITY_APPROVAL_DISTINCT_APPROVER=true`). Unknown outcomes require review and are never automatically replayed. Host response controls require a configured Magnus bridge, managed-node admission, explicit allowlists, protected targets, and an opted-in managed agent. Installing Cindertrace alone does not install a host agent or enable response.

## Optional integrations

- **Oathweave and Emberpath:** sign-in and scoped identity audit and routing security metadata. Security export uses scoped OAuth client credentials; the retired static-token fallback is not supported.
- **Magnus:** inventory, durable observations, summaries and links, and explicitly approved restart, isolation, or release through its response bridge. Fleet operations remain independent of Cindertrace availability.
- **Suite products:** from 0.5.0 Cindertrace serves an event feed for the HiveXUI inbox, and from 0.6.0 its collector can pull the audit exports of HiveMem, HiveSkills, Ardent Project Studio and Embermend. Hive {{hm.suite}} still leaves that suite audit collection off. From 0.10.0 `/sources` reports each audit source's last poll, and Cindertrace serves its own audit as HiveAuditRecord v1 at `GET /api/v1/audit/export`, for an ADMIN or the endpoint-scoped `SECURITY_AUDIT_EXPORT_TOKEN_SHA256` credential; from Hive 3.15.0 the Hive Registry advertises it as the `audit.v1` capability. See [Cindertrace's own audit](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/INTEGRATIONS.md#cindertraces-own-audit). From Hive 3.12.0 the collector can also run inside the installation as the optional managed `cindertrace-collector` component, for sources outside it such as a logging host's Loki; no profile selects it. See the [Hive guide](https://hivemagnus.com/guides/hive.md#fleet-hosts-and-security-events).
- **Sources:** Wazuh, UniFi, NetFlow/IPFIX, Tailscale, Loki, and ChatterMost/Mattermost adapters. Only configured inputs and listeners run. ChatterMost/Mattermost audit export excludes message bodies. From 0.8.1 one `LOKI_QUERY` should select every stream of a UniFi gateway: UniFi Network 11 no longer logs firewall hits as syslog lines, so the collector also reads IPFIX or NetFlow v9 flows decoded by GoFlow2 (`-format json`) as `netflow` events, plus `unifi_dns` activity for port 53, with sampled and estimated volumes, and UniFi CEF lines (Activity Logging to a SIEM server) on the Loki path. A watched source whose polls succeed but that has had no event for `SECURITY_FUSION_QUIET_AFTER_HOURS` hours (default 6, `0` turns it off) reports `degraded`; `SECURITY_FUSION_QUIET_SOURCES` lists the watched sources (default `netflow`). See [UniFi gateway streams in Loki](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/INTEGRATIONS.md#unifi-gateway-streams-in-loki).
- **Agents:** the server-side Cindertrace adapter supports scoped reads and investigation drafts. Keep its credentials server-side.

Follow the [integration guide](https://github.com/ChefTaco/cindertrace/blob/main/docs/INTEGRATIONS.md) for exact scope and configuration requirements.

## Upgrade an existing installation

Use the dedicated upgrade command from a trusted Cindertrace checkout. Review a release and resolve its tag to an immutable 40-character commit. Replace `COMMIT` and `/opt/cindertrace` with the selected revision and your installation directory.

```bash
npm run upgrade -- --to COMMIT --project-dir /opt/cindertrace --dry-run
```

Expected result: the tool builds the selected source and checks the installation before downtime. Follow the [upgrade runbook](https://github.com/ChefTaco/cindertrace/blob/main/docs/UPGRADING.md) to resume the resulting upgrade record and activate it. It covers Compose installations, frozen encrypted backups, independent restore verification, additive migration reruns, health checks, and interrupted upgrades. From 0.8.0 the command upgrades Compose installations only; native systemd installations are no longer supported and move to Compose through a verified backup and restore.

Before upgrading to 0.10.0, read its [upgrade notes](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/CHANGELOG.md#0100---2026-11-26). It adds one additive migration (`source_poll_stats`), so run the upgrade with migrations allowed, and a Hive suite upgrade that pins it needs `--allow-migrations`; `release.json` declares `rollbackCompatible=false`, so going back to 0.9.x means a verified restore of the pre-upgrade backup. The API now stops at startup on invalid settings and on a `DASHBOARD_*` setting that disagrees with its `CINDERTRACE_*` name, and refuses the retired console's HS256 tokens: `SECURITY_CONSOLE_TOKEN_SECRET` is no longer read, and a script that minted such tokens must sign in instead. The managed upgrade moves the `ui` service to the HiveXUI image the release pins and records it as `CINDERTRACE_UI_IMAGE` in `.env`; a `compose.override.yaml` that sets the `ui` image itself stops the upgrade. From 0.9.0 it adds `CINDERTRACE_TRUSTED_PROXIES=gateway` to `.env` when that is not set.

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

Release update, 2026-11-27: [Hive 3.15.1](https://github.com/ChefTaco/hive/releases/tag/v3.15.1), tag `v3.15.1`, commit `ac79185031440e1b76f5c62d4c8d0f83f19b98b7`, pins Cindertrace 0.10.0 for Cindertrace and the `cindertrace-collector` component, as Hive 3.15.0 (commit `4055623fc57b804a27237e5e493bd2985dcd3cd6`) first did; Hive 3.14.1 to 3.14.3 pinned 0.8.2, and 0.9.0 (tag [`v0.9.0`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.9.0), commit `3a15bcffeae6e9559153b48f4edbefb08770d35f`) was never pinned by a suite release. The installation and lab examples now check out tag [`v0.10.0`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.10.0), commit `0ab91db697ee1e6c20f5a6556ada6860185627f2`, and the installation, lab, integration and browser-authentication links use that tag. Its [README](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/README.md) changes only the example tag and image version and the Node.js engines are unchanged, so the commands are the same; the [installation guide](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/INSTALLATION.md#setting-names) adds the `CINDERTRACE_*` setting names and per-browser addresses behind the gateway, and the [upgrade runbook](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/UPGRADING.md#the-hivexui-ui-image) adds the managed `ui` image move. The new text on trusted proxies, approvals, VIEWER reads, local accounts and TOTP, scheduled backups, Cindertrace's own audit export and the 0.10.0 upgrade cautions follows the [changelog](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/CHANGELOG.md) for 0.9.0 and 0.10.0, [browser authentication](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/BROWSER_AUTH.md), [migration](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/MIGRATION.md#scheduled-backups) and [integrations](https://github.com/ChefTaco/cindertrace/blob/v0.10.0/docs/INTEGRATIONS.md#suite-product-audit); the HiveXUI version that adds the TOTP code field follows the [HiveXUI changelog](https://github.com/ChefTaco/HiveXUI/blob/v0.14.0/CHANGELOG.md). The Hive sentences follow Hive's [changelog](https://github.com/ChefTaco/hive/blob/v3.15.1/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round) (`CINDERTRACE_TRUSTED_PROXIES=ingress`, the `audit.v1` capability of Hive Registry 1.6.0, and `--allow-migrations` for the `source_poll_stats` migration); suite audit collection stays off because `hive_audit_collection_releases` in [`scripts/suite/audit-collection.sh`](https://github.com/ChefTaco/hive/blob/v3.15.1/scripts/suite/audit-collection.sh) still names no version at that tag. No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [cindertrace release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/cindertrace.md); what each Cindertrace release changed is in its [changelog](https://github.com/ChefTaco/cindertrace/blob/main/CHANGELOG.md).
