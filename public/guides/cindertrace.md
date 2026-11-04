# Cindertrace: security investigations and response

> Standalone security operations: correlated cases, hashed evidence, investigation drafts, assurance, policies, and an auditable approval trail.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/cindertrace) · [Current installation guide](https://github.com/ChefTaco/cindertrace/blob/main/docs/INSTALLATION.md) · [Releases](https://github.com/ChefTaco/cindertrace/releases)

## Choose an entry point

Use Cindertrace to investigate endpoint, network, identity, and application observations. It runs with local administrator login, PostgreSQL, and Redis. Hive and Magnus are optional. Collectors send signed observations directly to Cindertrace; sources and listeners must be explicitly configured.

Cindertrace owns security cases, evidence, correlation, investigations, assurance, policies, retention, audit, and approvals. Magnus owns fleet management and host execution. Existing `/security-fusion` pages and `/api/v1/security-fusion/*` API paths remain compatible.

## Install a fresh Compose stack

Prerequisites: Git, npm, OpenSSL, Docker Engine with Compose v2, and Node.js 24.22.1 or later on the 24.x line, or 26.13.0 or later on the 26.x line. Use a fresh checkout and installation directory. The first release is `v0.1.0`.

```bash
git clone --branch v0.1.0 https://github.com/ChefTaco/cindertrace.git
cd cindertrace
npm ci
npm run init
docker compose up --build -d
```

Expected result: initialization writes unique installation secrets, an Argon2id administrator hash, and a 90-day local TLS certificate. It refuses to overwrite an existing `.env`. Compose starts the console, API, PostgreSQL, and Redis, applies migrations, and keeps database and Redis ports private to the Compose network.

Open `https://localhost:3444`. The console binds to loopback by default. Read the generated login privately from `state/initial-credentials.txt`. Trust the generated local certificate for development. For remote access, use your own CA-issued certificate, configure the public origin, and explicitly choose the listening interface using the full installation guide. Keep certificate verification enabled.

Source adapters begin disabled. After configuring admitted sources and their credentials, start the optional collector:

```bash
docker compose --profile collector up -d collector
```

Do not publish `.env`, credentials, certificates, state, incident records, or live case captures. For an isolated synthetic demonstration, follow the repository's [demo instructions](https://github.com/ChefTaco/cindertrace#synthetic-demo) in a separate installation with no operational sources or credentials.

## Investigate and approve

ADMIN can access evidence and approve response plans. OPERATOR can investigate and request response review. VIEWER cannot enumerate sensitive security data. Agent read and investigation-draft credentials cannot approve containment.

Response requires explicit confirmation of an exact immutable plan, expires after ten minutes, and is used once. Unknown outcomes require review and are never automatically replayed. Host response controls require a configured Magnus bridge, managed-node admission, explicit allowlists, protected targets, and an opted-in managed agent. Installing Cindertrace alone does not install a host agent or enable response.

## Optional integrations

- **Hive:** IAM sign-in and scoped IAM audit and Router security metadata. Security export uses scoped OAuth client credentials; the retired static-token fallback is not supported.
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

Reviewed 2026-11-04 against public revision `a92c12a4e7386be6099e6becebc115fc146b91b1`: [README](https://github.com/ChefTaco/cindertrace/blob/a92c12a4e7386be6099e6becebc115fc146b91b1/README.md), [installation](https://github.com/ChefTaco/cindertrace/blob/a92c12a4e7386be6099e6becebc115fc146b91b1/docs/INSTALLATION.md), [integrations](https://github.com/ChefTaco/cindertrace/blob/a92c12a4e7386be6099e6becebc115fc146b91b1/docs/INTEGRATIONS.md), [upgrade runbook](https://github.com/ChefTaco/cindertrace/blob/a92c12a4e7386be6099e6becebc115fc146b91b1/docs/UPGRADING.md), and [Node engines](https://github.com/ChefTaco/cindertrace/blob/a92c12a4e7386be6099e6becebc115fc146b91b1/package.json). The `v0.1.0` application release resolves to `576f4b4e7ba4ef5f0524deb213137b3fd643aa88`; only documentation differs at the reviewed main revision. There is no npm installer in this release. License: Apache-2.0.
