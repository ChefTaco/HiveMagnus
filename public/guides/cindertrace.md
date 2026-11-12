# Cindertrace: security investigations and response

> Standalone security operations: correlated cases, hashed evidence, investigation drafts, assurance, policies, and an auditable approval trail.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/cindertrace) · [Current installation guide](https://github.com/ChefTaco/cindertrace/blob/main/docs/INSTALLATION.md) · [Releases](https://github.com/ChefTaco/cindertrace/releases)

## Choose an entry point

Use Cindertrace to investigate endpoint, network, identity, and application observations. In a Hive installation it is a section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md), signed in through Oathweave with resource tokens, and [Hive](https://hivemagnus.com/guides/hive.md) 3.3.0 installs Cindertrace 0.3.0 with its private PostgreSQL in the `full` profile. Fresh Hive setup starts its ingestion, dispatch and notification integrations disabled until you review them. It also runs on its own with its retained console, local administrator login, PostgreSQL, and Redis. Hive and Magnus are optional. Collectors send signed observations directly to Cindertrace; sources and listeners must be explicitly configured.

Cindertrace owns security cases, evidence, correlation, investigations, assurance, policies, retention, audit, and approvals. Magnus owns fleet management and host execution. Existing `/security-fusion` pages and `/api/v1/security-fusion/*` API paths remain compatible.

## Install a fresh Compose stack on its own

Prerequisites: Git, npm, OpenSSL, Docker Engine with Compose v2, and Node.js 24.22.3 or later on the 24.x line, or 26.13.1 or later on the 26.x line. Use a fresh checkout and installation directory. The current release is [`v0.3.0`](https://github.com/ChefTaco/cindertrace/releases/tag/v0.3.0).

```bash
git clone --branch v0.3.0 https://github.com/ChefTaco/cindertrace.git
cd cindertrace
npm ci
npm run init
docker compose up --build -d
```

Expected result: initialization writes unique installation secrets, an Argon2id administrator hash, and a 90-day local TLS certificate. It refuses to overwrite an existing `.env`. Compose starts the console, API, PostgreSQL, and Redis, applies migrations, and keeps database and Redis ports private to the Compose network.

Open `https://localhost:3444`. This is the retained standalone console, which binds to loopback by default. Read the generated login privately from `state/initial-credentials.txt`. Trust the generated local certificate for development. For remote access, use your own CA-issued certificate, configure the public origin, and explicitly choose the listening interface using the full installation guide. Keep certificate verification enabled.

Source adapters begin disabled. After configuring admitted sources and their credentials, start the optional collector:

```bash
docker compose --profile collector up -d collector
```

Do not publish `.env`, credentials, certificates, state, incident records, or live case captures. For an isolated synthetic demonstration, follow the repository's [demo instructions](https://github.com/ChefTaco/cindertrace#synthetic-demo) in a separate installation with no operational sources or credentials.

## Try the evolving investigation lab

The optional lab is a disposable three-stage investigation for people and external agents, using synthetic evidence. It runs without Hive, Magnus, external sources, or a model provider. Lab startup forbids external identity and integration settings, including Oathweave, so the lab keeps its own console with local administrator login and is not reached through HiveXUI. Use a **fresh separate checkout**; never initialize it over an operational installation. The lab ships in the release above:

```bash
git clone --branch v0.3.0 https://github.com/ChefTaco/cindertrace.git cindertrace-lab
cd cindertrace-lab
npm ci
npm run init -- --lab
npm run lab -- up
```

Open `https://localhost:3445`, sign in using this checkout's private `state/initial-credentials.txt`, then choose **Lab → Start investigation**. Initialization creates separate credentials, state, database volumes, and a dedicated Compose project; it refuses existing configuration. The console binds to loopback.

1. **Suspicious login:** repeated authentication failures invite competing hypotheses; failures alone do not establish compromise.
2. **Benign explanation:** an approved automation change explains the retries. Revisit confidence while keeping other activity open to investigation.
3. **Corroborating activity:** a separate successful session, unauthorized privilege change, and suspicious outbound activity call for another revision and narrowly scoped containment review.

Save a revision before each evidence release and before completion. Record compromise confidence, what changed, structured assertions with evidence citations, next checks, and a containment choice. Freeform reasoning is unscored. Completion compares supported and unsupported assertions, tentative hypotheses, retractions, confidence changes, and unnecessary containment across revisions. It uses only evidence available at each revision and has no aggregate score. Existing case confidence is labeled **correlation confidence** separately from investigator compromise confidence.

Containment remains an explicitly labeled simulation: an ADMIN reviews the exact target, effect, evidence and expiry, then approves or rejects it. Approval expires after ten minutes and is consumed once; newer evidence or a revision invalidates pending plans. Simulated decisions never contact Magnus or enter the production action outbox. External collection, integrations, notifications and dispatch are disabled, and synthetic evidence does not alter integration health.

External agents use separate server-side read, draft and lab-control credentials through `CindertraceClient`. They can investigate and advance evidence, but cannot start runs or approve containment. Keep generated agent credentials in the lab's private state directory. See the [complete lab workflow and API](https://github.com/ChefTaco/cindertrace/blob/36d3a00e0e9588cf87128226083fc804d64d9a49/docs/INVESTIGATION-LAB.md).

`npm run lab -- stop` preserves history; `npm run lab -- up` resumes it. Restarting an investigation creates a new run while retaining prior results. Destruction requires `npm run lab -- destroy NAME`, with the exact generated `COMPOSE_PROJECT_NAME`, and removes only that lab's containers and volumes. Local state and credentials remain until separately removed.

## Investigate and approve

ADMIN can access evidence and approve response plans. OPERATOR can investigate and request response review. VIEWER cannot enumerate sensitive security data. Agent read and investigation-draft credentials cannot approve containment.

Response requires explicit confirmation of an exact immutable plan, expires after ten minutes, and is used once. Unknown outcomes require review and are never automatically replayed. Host response controls require a configured Magnus bridge, managed-node admission, explicit allowlists, protected targets, and an opted-in managed agent. Installing Cindertrace alone does not install a host agent or enable response.

## Optional integrations

- **Oathweave and Emberpath:** sign-in and scoped identity audit and routing security metadata. Security export uses scoped OAuth client credentials; the retired static-token fallback is not supported.
- **Magnus:** inventory, durable observations, summaries and links, and explicitly approved restart, isolation, or release through its response bridge. Fleet operations remain independent of Cindertrace availability.
- **Sources:** Wazuh, UniFi, NetFlow/IPFIX, Tailscale, Loki, and ChatterMost/Mattermost adapters. Only configured inputs and listeners run. ChatterMost/Mattermost audit export excludes message bodies.
- **Agents:** the server-side Cindertrace adapter supports scoped reads and investigation drafts. Keep its credentials server-side.

Follow the [integration guide](https://github.com/ChefTaco/cindertrace/blob/main/docs/INTEGRATIONS.md) for exact scope and configuration requirements.

## Upgrade an existing installation

Use the dedicated upgrade command from a trusted Cindertrace checkout. Review a release and resolve its tag to an immutable 40-character commit. Replace `COMMIT` and `/opt/cindertrace` with the selected revision and your installation directory.

```bash
npm run upgrade -- --to COMMIT --project-dir /opt/cindertrace --dry-run
```

Expected result: the tool builds the selected source and checks the installation before downtime. Follow the [upgrade runbook](https://github.com/ChefTaco/cindertrace/blob/main/docs/UPGRADING.md) to resume the resulting upgrade record and activate it. It covers Compose and native systemd layouts, frozen encrypted backups, independent restore verification, additive migration reruns, health checks, and interrupted upgrades.

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
