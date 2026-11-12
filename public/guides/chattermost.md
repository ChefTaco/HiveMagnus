# ChatterMost: agent guide

> A self-hosted, Mattermost-compatible chat backend for channels, DMs, threads, official clients, and agent conversations.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/ChatterMost) · [Current installation runbook](https://github.com/ChefTaco/ChatterMost/blob/main/AGENTS.md#installation-runbook-for-agents)

## Prerequisites

- A new Linux AMD64 or ARM64 installation, with Docker Engine access.
- Compose v2.24+ (or v5), patched Python 3.11.4+, `curl`, `tar`, and `sha256sum`.
- An HTTPS origin, reverse proxy, and certificate. The default app listener is loopback port 8065; setup does not install a proxy or certificate.
- A new installation directory outside any Git worktree, owned by the managing account.

The distribution includes PostgreSQL, persistent files, and optional Redis for abuse counters. It requires one application writer. It does not require Node, a source checkout, or a registry login. Existing installations use their current manager and the upgrade guide.

## Verify and install release 0.4.4

The following is the public agent runbook's first-install sequence. Replace `https://chat.example.test` with the actual HTTPS origin before running. Run the complete block in one shell:

```bash
set -eu
umask 077
VERSION=0.4.4
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

The [container guide](https://github.com/ChefTaco/ChatterMost/blob/main/docs/containers.md#install-a-release) also documents optional GitHub publisher attestation verification. Complete its HTTPS/WebSocket reverse-proxy setup, then verify browser login and a real message before treating installation as complete. Setup does not install a host service or backup schedule.

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

Mattermost-compatible REST lives under `/api/v4`; WebSocket events use `/api/v4/websocket`. Connect official clients using the HTTPS origin, without an API path. Mobile background push, calls and upstream plugins/marketplace are not implemented.

In a [Hive](https://hivemagnus.com/guides/hive.md) installation (3.1.1 pins ChatterMost 0.4.4 with its private PostgreSQL in the `full` profile), the browser interface is a section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md). An explicitly linked Oathweave identity is exchanged for a short native session; existing user IDs, roles, memberships and Mattermost sessions remain product-owned. ChatterMost keeps its small included web UI, which the official desktop app loads and recovery relies on. ChatterMost is independently developed; Mattermost, Inc. does not affiliate with, endorse, or sponsor it.

- [Container installation](https://github.com/ChefTaco/ChatterMost/blob/main/docs/containers.md)
- [Hermes setup](https://github.com/ChefTaco/ChatterMost/blob/main/docs/hermes-compatibility.md)
- [API compatibility](https://github.com/ChefTaco/ChatterMost/blob/main/docs/compatibility.md)
- [Upgrades and recovery](https://github.com/ChefTaco/ChatterMost/blob/main/docs/upgrading.md)
- [Repository instructions](https://github.com/ChefTaco/ChatterMost/blob/main/AGENTS.md)

## Source review

Reviewed 2026-11-05 against tag `v0.4.1`, commit `8962cebeca1473957e2358a22c2855c106b85303`: [README](https://github.com/ChefTaco/ChatterMost/blob/8962cebeca1473957e2358a22c2855c106b85303/README.md), [container guide](https://github.com/ChefTaco/ChatterMost/blob/8962cebeca1473957e2358a22c2855c106b85303/docs/containers.md), [agent runbook](https://github.com/ChefTaco/ChatterMost/blob/8962cebeca1473957e2358a22c2855c106b85303/AGENTS.md) and [Oathweave integration](https://github.com/ChefTaco/ChatterMost/blob/8962cebeca1473957e2358a22c2855c106b85303/docs/oathweave.md). The installation block matches the runbook at that tag. The [0.4.1 release](https://github.com/ChefTaco/ChatterMost/releases/tag/v0.4.1) attaches `chattermost-0.4.1.tar.gz` and `SHA256SUMS`, and the archive's line in `SHA256SUMS` matches both the asset digest GitHub reports and the downloaded file. Release `0.4.1` is pinned intentionally. Follow current docs for later versions. License: Apache-2.0.

Release update, 2026-11-12: [Hive 3.1.1](https://github.com/ChefTaco/hive/releases/tag/v3.1.1) pins ChatterMost 0.4.4, so the installation block now uses tag [`v0.4.4`](https://github.com/ChefTaco/ChatterMost/releases/tag/v0.4.4), commit `c777c786667e75ad7cf544b21d8c44bf2c3a3807`. The [agent runbook](https://github.com/ChefTaco/ChatterMost/blob/v0.4.4/AGENTS.md) block at that tag differs from 0.4.1 only in `VERSION`. The release attaches `chattermost-0.4.4.tar.gz` and `SHA256SUMS`; the archive's line matches the asset digest GitHub reports and the downloaded file, which contains `chattermost-0.4.4/`. The [container guide](https://github.com/ChefTaco/ChatterMost/blob/v0.4.4/docs/containers.md) lists 0.3.2, 0.3.3, 0.4.1 and 0.4.2 as reviewed upgrade sources for 0.4.4; container releases from 0.4.2 run Node 26 on a maintained glibc distribution.
