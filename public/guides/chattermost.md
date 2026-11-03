# ChatterMost: agent guide

> A self-hosted, Mattermost-compatible chat backend for channels, DMs, threads, official clients, and agent conversations.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/ChatterMost) · [Current installation runbook](https://github.com/ChefTaco/ChatterMost/blob/main/AGENTS.md#installation-runbook-for-agents)

## Prerequisites

- A new Linux AMD64 or ARM64 installation, with Docker Engine access.
- Compose v2.24+ (or v5), patched Python 3.11.4+, `curl`, `tar`, and `sha256sum`.
- An HTTPS origin, reverse proxy, and certificate. The default app listener is loopback port 8065; setup does not install a proxy or certificate.
- A new installation directory outside any Git worktree, owned by the managing account.

The distribution includes PostgreSQL, persistent files, and optional Redis for abuse counters. It requires one application writer. It does not require Node, a source checkout, or a registry login. Existing installations use their current manager and the upgrade guide.

## Verify and install release 0.3.3

The following is the public agent runbook's first-install sequence. Replace `https://chat.example.test` with the actual HTTPS origin before running. Run the complete block in one shell:

```bash
set -eu
umask 077
VERSION=0.3.3
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

Restart an existing gateway through its current supervisor instead. Keep one gateway per bot token. Verify a human-to-bot DM and its reply; channels require a bot mention by default. Ardent can also use its optional Mattermost channel, configured in the [Magnus/Ardent guide](https://hivemagnus.com/guides/magnus.md).

## Interfaces and limits

Mattermost-compatible REST lives under `/api/v4`; WebSocket events use `/api/v4/websocket`. Connect official clients using the HTTPS origin, without an API path. Mobile background push, calls, upstream plugins/marketplace, and SSO are not implemented. ChatterMost is independently developed; Mattermost, Inc. does not affiliate with, endorse, or sponsor it.

- [Container installation](https://github.com/ChefTaco/ChatterMost/blob/main/docs/containers.md)
- [Hermes setup](https://github.com/ChefTaco/ChatterMost/blob/main/docs/hermes-compatibility.md)
- [API compatibility](https://github.com/ChefTaco/ChatterMost/blob/main/docs/compatibility.md)
- [Upgrades and recovery](https://github.com/ChefTaco/ChatterMost/blob/main/docs/upgrading.md)
- [Repository instructions](https://github.com/ChefTaco/ChatterMost/blob/main/AGENTS.md)

## Source review

Reviewed 2026-11-03 against public revision `bab016695d493dcc094b82e0a498fac74bba9f7c`: [README](https://github.com/ChefTaco/ChatterMost/blob/bab016695d493dcc094b82e0a498fac74bba9f7c/README.md), [container guide](https://github.com/ChefTaco/ChatterMost/blob/bab016695d493dcc094b82e0a498fac74bba9f7c/docs/containers.md), and [agent runbook](https://github.com/ChefTaco/ChatterMost/blob/bab016695d493dcc094b82e0a498fac74bba9f7c/AGENTS.md). Release `0.3.3` is pinned intentionally. Follow current docs for later versions. License: Apache-2.0.
