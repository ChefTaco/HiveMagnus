# ChatterMost: agent guide

> A self-hosted, Mattermost-compatible chat backend for channels, DMs, threads, official clients, and agent conversations.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/ChatterMost) · [Current installation runbook](https://github.com/ChefTaco/ChatterMost/blob/main/AGENTS.md#installation-runbook-for-agents)

## Prerequisites

- A new Linux AMD64 or ARM64 installation, with Docker Engine access.
- Compose v2.24+ (or v5), patched Python 3.11.4+, `curl`, `tar`, and `sha256sum`.
- An HTTPS origin, reverse proxy, and certificate. The default app listener is loopback port 8065; setup does not install a proxy or certificate.
- A new installation directory outside any Git worktree, owned by the managing account.

The distribution includes PostgreSQL, persistent files, and optional Redis for abuse counters. It requires one application writer. It does not require Node, a source checkout, or a registry login. Existing installations use their current manager and the upgrade guide.

## Verify and install release 0.10.0

The following follows the download, checksum and setup steps of the [container runbook](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/containers.md#install-a-release), which the agent runbook points to from 0.7.1, with the restrictive umask, fresh-directory check and temporary download directory of the earlier agent runbook. Replace `https://chat.example.test` with the actual HTTPS origin before running. Run the complete block in one shell:

```bash
set -eu
umask 077
VERSION=0.10.0
INSTALL_DIR="$HOME/chattermost-installation"
test ! -e "$INSTALL_DIR"
DOWNLOAD_DIR="$(mktemp -d)"
cd "$DOWNLOAD_DIR"
curl --fail --location --remote-name "https://github.com/ChefTaco/ChatterMost/releases/download/v$VERSION/chattermost-$VERSION.tar.gz"
curl --fail --location --remote-name "https://github.com/ChefTaco/ChatterMost/releases/download/v$VERSION/SHA256SUMS"
awk -v archive="chattermost-$VERSION.tar.gz" '$2 == archive { print; found=1 } END { if (!found) exit 1 }' SHA256SUMS > archive.sha256
sha256sum --check archive.sha256
tar xzf "chattermost-$VERSION.tar.gz"
./chattermost-"$VERSION"/chattermost --directory "$INSTALL_DIR" setup --server-url https://chat.example.test
"$INSTALL_DIR/chattermost" --directory "$INSTALL_DIR" start
"$INSTALL_DIR/chattermost" --directory "$INSTALL_DIR" status
```

Supply verified trusted-proxy CIDRs through `--trusted-proxies` at setup when you know them.

Expected result: the archive checksum reports `OK` before extraction; setup creates a fresh installation with unique credentials and pinned image digests; `start` launches the stack; `status` reports its state. Read the initial administrator credentials privately from `$INSTALL_DIR/secrets/runtime.env`. Preserve that file and the database password; do not publish the installation directory.

The [container guide](https://github.com/ChefTaco/ChatterMost/blob/main/docs/containers.md#install-a-release) also documents optional GitHub publisher attestation verification. Complete its HTTPS/WebSocket reverse-proxy setup; from 0.7.1 the proxy must set `X-Forwarded-For` from the connection's real client address on every location, the WebSocket one included, because rate limits and WebSocket ceilings count against that address. Then verify browser login and a real message before treating installation as complete. Setup does not install a host service or backup schedule.

## Upgrade a standalone installation

Never run `setup` again on an existing installation. The release manager upgrades only along the [supported paths](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/upgrading.md#supported-paths), through the stepping stones 0.8.0 and 0.9.0: 0.10.0 upgrades only from 0.9.0, an installation on 0.8.0 upgrades to 0.9.0 first, and one on 0.3.2 to 0.7.2 upgrades to 0.8.0, then 0.9.0, then 0.10.0. For each step, download and verify that release's bundle with the download and checksum steps above (with that `VERSION`, and without `setup`), take the backup the [upgrade procedure](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/upgrading.md#container-upgrade-procedure) requires, and run its manager against the existing directory (substitute your installation directory for `/srv/chattermost`); for the last step:

```bash
./chattermost-0.10.0/chattermost --directory /srv/chattermost upgrade 0.10.0
```

Read each step's upgrade notes before running it, because two of them permanently delete data:

- **0.8.0** enforces channel retention limits, including **Retention days** values the Policy form saved in earlier releases without applying them. About a minute after startup, and then hourly, it deletes older posts and their files in those channels. List and clear unwanted limits while still on the old release, as the [0.8.0 upgrade notes](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/releases.md#upgrade-notes-for-080) describe. From 0.9.0 only system admins can set a limit, and a thread is purged only when its newest post is older than the limit.
- **0.9.0**'s first sweep removes the attachment files of posts deleted earlier and uploads older than a week that no post references; set `ORPHAN_UPLOAD_GRACE_HOURS=0` before upgrading to keep them. Post `order` lists are newest first, the container health check calls `/health/ready`, and the import helper no longer accepts `--token` ([0.9.0 upgrade notes](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/releases.md#upgrade-notes-for-090)).
- **0.10.0** hashes new and changed passwords with scrypt and replaces each bcrypt hash at that account's next sign-in, so roll back only to 0.9.x; `PASSWORD_HASHING=bcrypt` keeps the earlier behaviour. Deleting a thread's root now deletes its replies, including other people's ([0.10.0 upgrade notes](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/releases.md#upgrade-notes-for-0100)).

None of these releases adds a database migration.

## Connect an agent

For an existing Hermes Agent, retain its model/provider settings and configure its bundled Mattermost platform plugin:

```bash
hermes gateway setup
```

Select **Mattermost**, set `MATTERMOST_URL` to the ChatterMost HTTPS origin, supply the bot token privately as `MATTERMOST_TOKEN`, and set `MATTERMOST_ALLOWED_USERS` to the intended human users' 26-character IDs. The seeded bot token is in the protected installation credentials; do not paste the file into logs or documentation.

For a new gateway:

```bash
hermes gateway run
```

Restart an existing gateway through its current supervisor instead. Keep one gateway per bot token. Verify a human-to-bot DM and its reply; channels require a bot mention by default. Ardent can also use its optional Mattermost channel, configured in the [Ardent guide](https://hivemagnus.com/guides/ardent.md).

## Interfaces and limits

Mattermost-compatible REST lives under `/api/v4`; WebSocket events use `/api/v4/websocket`. Connect official clients using the HTTPS origin, without an API path. From 0.9.0, mobile background push works through an operator-configured push proxy (`PUSH_NOTIFICATION_SERVER`, off by default; see [mobile push](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/clients.md#mobile-push)); calls, upstream server plugins/marketplace and SSO are not implemented.

In a [Hive](https://hivemagnus.com/guides/hive.md) installation (Hive {{hm.suite}} pins ChatterMost {{hm.version:chattermost}} (since {{hm.since:chattermost}}) with its private PostgreSQL in the `full` profile, and from Hive 3.15.0 `hive.sh add chattermost` adds both to a running installation), the browser interface is a section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md). An explicitly linked Oathweave identity is exchanged for a short native session; existing user IDs, roles, memberships and Mattermost sessions remain product-owned. From 0.7.0, an optional loopback-only administrator provisioning API, enabled by its own purpose secret, lets `hive.sh admin-access setup` create a separate native account for a suite administrator with a permanent receipt; it never adopts an existing account or infers an Oathweave link, and needs no SQL migration. From Hive 3.12.6, when the ingress runs on ChatterMost's host and ChatterMost publishes no port of its own, the controller sets ChatterMost's `TRUSTED_PROXIES` to the pinned suite network (`console.networkSubnet`) or to the private ranges Docker assigns, so ChatterMost's per-address sign-in, sign-up and WebSocket limits apply to each browser rather than to the ingress. Hive 3.15.0 upgrades a suite ChatterMost from 0.7.2 to 0.10.0 in one step instead of through the stepping stones, since the stored layout and Prisma migrations are unchanged, but the retention purge, the attachment sweep and scrypt hashing above still apply. Before upgrading, read the ChatterMost part of Hive's [Suite 3.15.0 upgrade notes](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round); they give the suite's query for affected channels and set `ORPHAN_UPLOAD_GRACE_HOURS=0` in `config/chattermost.env` to keep old uploads. ChatterMost keeps its small included web UI, which the official desktop app loads and recovery relies on. ChatterMost is independently developed; Mattermost, Inc. does not affiliate with, endorse, or sponsor it.

- [Container installation](https://github.com/ChefTaco/ChatterMost/blob/main/docs/containers.md)
- [Hermes setup](https://github.com/ChefTaco/ChatterMost/blob/main/docs/hermes-compatibility.md)
- [API compatibility](https://github.com/ChefTaco/ChatterMost/blob/main/docs/compatibility.md)
- [Upgrades and recovery](https://github.com/ChefTaco/ChatterMost/blob/main/docs/upgrading.md)
- [Repository instructions](https://github.com/ChefTaco/ChatterMost/blob/main/AGENTS.md)

## Source review

Reviewed 2026-11-05 against tag `v0.4.1`, commit `8962cebeca1473957e2358a22c2855c106b85303`: [README](https://github.com/ChefTaco/ChatterMost/blob/8962cebeca1473957e2358a22c2855c106b85303/README.md), [container guide](https://github.com/ChefTaco/ChatterMost/blob/8962cebeca1473957e2358a22c2855c106b85303/docs/containers.md), [agent runbook](https://github.com/ChefTaco/ChatterMost/blob/8962cebeca1473957e2358a22c2855c106b85303/AGENTS.md) and [Oathweave integration](https://github.com/ChefTaco/ChatterMost/blob/8962cebeca1473957e2358a22c2855c106b85303/docs/oathweave.md). The installation block matches the runbook at that tag. The [0.4.1 release](https://github.com/ChefTaco/ChatterMost/releases/tag/v0.4.1) attaches `chattermost-0.4.1.tar.gz` and `SHA256SUMS`, and the archive's line in `SHA256SUMS` matches both the asset digest GitHub reports and the downloaded file. Release `0.4.1` is pinned intentionally. Follow current docs for later versions. License: Apache-2.0.

Release update, 2026-11-27: [Hive 3.15.1](https://github.com/ChefTaco/hive/releases/tag/v3.15.1), tag `v3.15.1`, commit `ac79185031440e1b76f5c62d4c8d0f83f19b98b7`, pins ChatterMost 0.10.0 and its matching migrator, as Hive 3.15.0 (commit `4055623fc57b804a27237e5e493bd2985dcd3cd6`) first did; Hive 3.12.9 to 3.14.3 pinned 0.7.2. The release is tag [`v0.10.0`](https://github.com/ChefTaco/ChatterMost/releases/tag/v0.10.0), commit `e23603edcb5c02a4f46df662e45e0586f0a7071e`, and attaches `chattermost-0.10.0.tar.gz`, `SHA256SUMS`, `release.json`, `compose.yaml`, the `chattermost` manager and its scan and lifecycle reports; the stepping stones [`v0.8.0`](https://github.com/ChefTaco/ChatterMost/releases/tag/v0.8.0) (commit `bb92c487012a023bb212c4336e689a05c245dc72`) and [`v0.9.0`](https://github.com/ChefTaco/ChatterMost/releases/tag/v0.9.0) (commit `5c6cdc58073760fed64b9753578d651b2f516604`) are published releases too. The [container runbook](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/containers.md#install-a-release) at that tag differs from 0.7.2 in its download, checksum and setup commands only in `VERSION`, so the installation block now uses `VERSION=0.10.0` and keeps the earlier agent runbook's umask, fresh-directory check and temporary download directory; the [agent runbook](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/AGENTS.md#installation-runbook-for-agents) still points to it. The new upgrade section follows the runbook's lifecycle commands, the [upgrade guide](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/upgrading.md#supported-paths) and the [release notes](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/releases.md#changes-in-0100) for 0.8.0 (retention limits enforced, with permanent purges), 0.9.0 (deleted and orphan attachment sweep, newest-first post order, readiness health check, import without `--token`, optional push proxy, system-admin-only retention limits, whole-thread purges; 0.8.0 becomes a stepping stone) and 0.10.0 (scrypt by default with bcrypt rehashed at sign-in, rollback only to 0.9.x, root deletion removing the thread; 0.9.0 becomes a stepping stone); none adds a database migration. The interface limits follow the [README](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/README.md) and [client guide](https://github.com/ChefTaco/ChatterMost/blob/v0.10.0/docs/clients.md#mobile-push). The Hive sentences follow Hive's [changelog](https://github.com/ChefTaco/hive/blob/v3.15.1/CHANGELOG.md) (`hive.sh add chattermost` from 3.15.0) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round), which upgrades a suite ChatterMost from 0.7.2 to 0.10.0 directly; every upgrade from 3.14.x to 3.15.x needs `--allow-migrations` for the suite's other products. No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [chattermost release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/chattermost.md); what each ChatterMost release changed is in its [release notes](https://github.com/ChefTaco/ChatterMost/releases).
