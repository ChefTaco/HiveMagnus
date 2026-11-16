# Magnus: agent guide

> Magnus operates Linux fleets and the agents that run on them: inventory and health, commands, cron jobs, files, logs, skills, rollouts, incidents and an append-only audit log.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/magnus) · [Release 3.1.0](https://github.com/ChefTaco/magnus/releases/tag/v3.1.0) · [Release 3.0.1](https://github.com/ChefTaco/magnus/releases/tag/v3.0.1) · [Changelog](https://github.com/ChefTaco/magnus/blob/v3.0.1/CHANGELOG.md) · [Per-node credentials](https://github.com/ChefTaco/magnus/blob/v3.0.1/docs/NODE_CREDENTIALS.md) · [Current standalone instructions](https://github.com/ChefTaco/magnus#quick-start-standalone) · [Ardent guide](https://hivemagnus.com/guides/ardent.md)

## Choose an entry point

Use Magnus for fleet inventory, health, jobs, skills, rollouts and audit. A small agent on each host reports to a central API server. Magnus can also manage the AI agents on those hosts: Hermes Agent, the Codex CLI and [Ardent](https://hivemagnus.com/guides/ardent.md), a separate product with its own repository. Oathweave sign-in, HiveMem memory, HiveSkills distribution and Emberpath model routing are optional integrations.

There are two ways to run Magnus. Through [Hive](https://hivemagnus.com/guides/hive.md) 3.9.6, the full profile adds Magnus 3.1.0 and its browser pages are the Magnus section of [HiveXUI](https://hivemagnus.com/guides/hivexui.md) at `/fleet`, reaching the API through an allowlist of browser routes with a short-lived Oathweave token. Agents and services keep using the Magnus endpoint directly. The standalone installer below is for Magnus without Hive, and installs the Next.js UI that Magnus's README documents for standalone installs.

Cindertrace is the separate security product for correlated cases, evidence, investigations and approvals. Magnus can export observations and provide fleet context and approved host execution; the embedded security runtime was retired in Magnus 2.0. See the [Cindertrace guide](https://hivemagnus.com/guides/cindertrace.md) and the repository migration guidance before upgrading an existing local-security installation.

## Reviewed release: 3.0.1

Magnus 3.0.0 is a major release: per-node credentials reach their last phase, and nodes authenticate with their own Ed25519 keys only. 3.0.1 adds the supported way to move existing agents across the major version. Neither release adds a datastore migration, a new environment variable or a removed one. Both upgrade from 2.10.2 only (`minUpgradeFrom`).

- **`enforce` by default.** `NODE_AUTH_MODE` defaults to `enforce` on the server and on the agent (it was `compat`). The shared node secret (`x-node-token`) is refused on every node route and no longer sent, in both directions. Evidence that carries only the shared `RESULT_SIGNING_SECRET` HMAC is refused, and decisions the server makes for a node are signed with the server key only. A 2.10.2 agent with a key keeps working: the server goes by its signature and ignores the secret it also sends.
- **Start-up guard.** A server whose `NODE_AUTH_MODE` is unset refuses to start (exit 1) while any real node has no active key (`NODES_WITHOUT_KEY`), only revoked keys (`NODES_REVOKED`), an agent that does not sign its evidence (`NODES_NOT_SIGNING_EVIDENCE`), or an agent 2.10.0 or 2.10.1 (`AGENTS_NEED_UPGRADE`), whose managed requests enforce cannot reach. The message names the nodes and the two ways out: enroll or upgrade them, or set `NODE_AUTH_MODE=compat` explicitly. Decommissioned nodes and the internal `__control-api__` and `__dashboard__` log sources never count. An explicit mode is never checked.
- **`compat` and `warn` are deprecated.** Set explicitly, either keeps working for this major and logs `DEPRECATED` at start; the fleet summary reports `modeDeprecated` with a `deprecationNotice`. Both are removed in the next major, with `NODE_MANAGER_SECRET`, `RESULT_SIGNING_SECRET` and `COMMAND_RECONCILIATION_SECRET`.
- **Automatic binding closed.** `POST /api/v1/node-enrollment/legacy-upgrade` answers `410 LEGACY_UPGRADE_CLOSED` in enforce mode, whatever `NODE_AUTH_LEGACY_UPGRADE_UNTIL` says, and a binding refused for its address can no longer be approved. New nodes enroll with a one-time token.
- **`NODE_AUTO_REGISTER` off.** In enforce mode unknown agents are no longer added to the inventory on their first heartbeat: register the node first.
- **Shared secrets optional.** The server and the agent no longer require `NODE_MANAGER_SECRET` or `RESULT_SIGNING_SECRET` outside an explicit `compat` or `warn`, and still honour them when set. `magnus init` of 3.0.0 or later no longer generates them.
- **New in 3.0.0:** server-key rotation (stage, promote, retire) and a two-ADMIN approval for scheduler-source settlements in place of the reviewer's `COMMAND_RECONCILIATION_SECRET` signature. Agents MAC their own records with node-local keys when the shared keys are absent.
- **New in 3.0.1:** `magnus-server agents upgrade --allow-major`, a server-signed path that moves agents from 2.10.x to 3.0.x by way of the 2.10.3 stepping stone.
- **New in 3.1.0:** `magnus-agent native-snapshot` (root only, a local command line, not an HTTP route) discovers every managed Ardent profile and captures, verifies, restores and resumes a stopped snapshot of its profile and runtime state; Hive 3.9.6 uses it to back up the profiles of its installer-owned agent. `GET /api/v1/nodes/:nodeId/software` reads software versions and cached package-update counts from a read-only agent route instead of a shell command (agents before 3.1.0 answer `SOFTWARE_STATUS_UNAVAILABLE` and nothing runs), and the agent signs managed terminal completion receipts with its node key. No migrations, no new settings, `minUpgradeFrom` 2.10.2; 3.0.x and 3.1.0 mix in both directions, so move agents with `magnus-server agents upgrade --to 3.1.0`. See the [3.1.0 changelog](https://github.com/ChefTaco/magnus/blob/v3.1.0/CHANGELOG.md) and [native snapshots](https://github.com/ChefTaco/magnus/blob/v3.1.0/docs/NATIVE_SNAPSHOTS.md).

## In a Hive installation

Hive 3.9.7 pins the Magnus server and fleet gateway 3.1.0 by image digest and the host agent `@hivemagnus/magnus-agent` 3.1.0 by npm integrity (as did 3.9.6; Hive 3.9.2 to 3.9.5 pinned 3.0.3), with HiveXUI 0.9.2, whose UI reads the Magnus 3.1.0 browser contract, reads node software status through the read-only software endpoint, and offers **Allow major upgrade** in Upgrade agents (Hive 3.9.0 pinned 3.0.1, Hive 3.9.1 3.0.2). Magnus 3.0.3 changes only the agent: installing or updating the Ardent package no longer fails on a fresh owner account without `~/.local/share`, because the agent now creates the missing parents of the install prefix as the owner, one level at a time inside the owner home; it adds no migrations or settings, and a failed **Update package** can be retried once the node's agent runs 3.0.3. Magnus 3.0.2 adds no migrations and lets an operator retire the last shared keys: on the server, move `RESULT_SIGNING_SECRET` to the verify-only `RESULT_SIGNING_PREVIOUS_SECRET`; on each agent, move `COMMAND_RECONCILIATION_SECRET` to `COMMAND_RECONCILIATION_PREVIOUS_SECRET`, re-seal stored settlements with `magnus-agent historical-settlements reseal --apply` and check with `list --check`; see [Retiring the shared keys](https://github.com/ChefTaco/magnus/blob/v3.0.2/docs/NODE_CREDENTIALS.md#retiring-the-shared-keys). With a port for host agents, `hive.sh magnus-agent install` installs the agent on a fleet host and stages the Ardent 3.1.3 package the agent's lock pins; `hive.sh magnus-agent enroll` then reviews and enables full node capabilities on an installer-owned single host: commands, managed cron and a selected restricted web terminal. Guided setup offers both after installation. From 3.9.0 `magnus-agent install` copies no `NODE_MANAGER_SECRET`, `RESULT_SIGNING_SECRET` or `COMMAND_RECONCILIATION_SECRET` to an agent: a new agent, and an existing agent without a key, is enrolled with a one-time token read by `magnus-agent enroll --token-file -`, and without a token the install stops before changing anything. An agent with a key keeps it. A fresh installation generates none of those three secrets for Magnus. After a suite upgrade, `hive.sh post-upgrade` or `hive.sh magnus-agent install` updates an existing agent while keeping its enrollment scope. See the [Hive guide](https://hivemagnus.com/guides/hive.md#fleet-hosts-and-security-events) and [Upgrade to 3.0.1](#upgrade-to-301) below.

In HiveXUI, **Magnus > Ardent > Installations** installs and updates the staged Ardent package, and **New Agent** creates, configures and starts an Ardent profile with its own HiveMem identity. [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md) uses the same Magnus Ardent bridge through its own Oathweave service identity. Since the reviewed 2.4.2, Magnus added an agent identity lookup that HiveXUI's Agent 360 uses (2.7.0), an event feed for the HiveXUI inbox (2.8.0), an opt-in Emberpath model provider for the fleet assistant (2.9.0), per-node credentials (2.10.0) and node keys only (3.0.0). An external Magnus, managed and upgraded separately, can serve an installation's Magnus pages and Studio instead of the `magnus` component.

## Install Magnus on its own

Prerequisites: Linux with systemd, npm, Node.js 24.22.3+ in the 24 series or 26.13.1+ in the 26 series, and Docker Compose or existing PostgreSQL and Redis. The docs recommend PostgreSQL 17 (15+ works) and Redis 7, and TLS certificates for the server, the standalone UI and each agent.

```bash
npx @hivemagnus/magnus init
```

Expected result: the installer creates `~/.magnus`, installs the server and the standalone UI, generates credentials and a self-signed certificate, prepares PostgreSQL/Redis through Compose (or uses `--database-url` and `--redis-url`), and starts systemd user services. Use the printed URL and login. Save the generated password privately; the self-signed certificate is for evaluation. From 3.0.0 the generated server settings include no shared node secret: agents enroll with their own keys.

Inspect options before choosing an installation mode:

```bash
npx @hivemagnus/magnus init --help
```

`--system --service-user magnus` installs system units under `/opt/magnus` instead. For user services to survive logout and start at boot, the setup may require `loginctl enable-linger $USER`. Installing the server alone does not enroll other hosts.

### Add a host

Register the node in the standalone UI or through the API with the host's FQDN. `POST /api/v1/nodes/register` returns a one-time `enrollmentToken`, valid for one hour; for an existing node an ADMIN issues one with `POST /api/v1/nodes/<nodeId>/enrollment-token`. Issuing a token stays with the API and the command line, never a browser route, because its response is a secret. On the host, install the agent, set `CONTROL_API_URL` and the TLS paths in `/opt/magnus-agent/.env`, enroll once with the token on standard input, then validate and enable the service:

```bash
sudo npm install --prefix /opt/magnus-agent @hivemagnus/magnus-agent
sudo install -m 0600 /opt/magnus-agent/node_modules/@hivemagnus/magnus-agent/.env.example /opt/magnus-agent/.env
# set CONTROL_API_URL, TLS_CERT_PATH and TLS_KEY_PATH in /opt/magnus-agent/.env
cd /opt/magnus-agent
printf '%s' "$ENROLLMENT_TOKEN" | sudo node node_modules/@hivemagnus/magnus-agent/dist/index.js enroll --token-file -
sudo node node_modules/@hivemagnus/magnus-agent/dist/index.js check
sudo cp node_modules/@hivemagnus/magnus-agent/deploy/magnus-agent.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now magnus-agent
```

Expected result: the agent creates its key, proves possession, and stores its node id and the server's public key; the host shows as online within one heartbeat interval (30 seconds). The server stores only the SHA-256 of a token; a token works once, issuing a new one withdraws the previous one, and enrolling with a token replaces whatever key the node had. `--token-file PATH` reads the token from a file instead; `--token` still works but puts it on the process table. No `NODE_MANAGER_SECRET` or `RESULT_SIGNING_SECRET` is needed. By default the agent runs as root; the [agent README](https://github.com/ChefTaco/magnus/blob/v3.0.1/packages/agent/README.md) covers both modes.

## Upgrade to 3.0.1

Magnus 3 upgrades from 2.10.2 only, server first. Nothing crosses a major version by itself: `magnus upgrade` and the agent upgrade action stay on the current major unless asked with `--allow-major`.

**Prepare on 2.10.2.** Every agent runs 2.10.2 or later with a bound key (`nodeCredential.state: active`); agents 2.10.0 and 2.10.1 move to 2.10.2 with **Upgrade agents** or `magnus-server agents upgrade`. Optionally set `NODE_AUTH_MODE=warn` on the 2.10.2 server, restart it and use the fleet for a day, so remaining uses of the shared secret show up before they are refused. Then confirm `GET /api/v1/node-credentials/summary` reports `enforceReady: true`, and remove `NODE_AUTH_MODE` from the server's environment (or set `enforce`).

**The server, 2.10.2 to 3.0.1.** On a managed install, straight to 3.0.1:

```bash
magnus upgrade --to 3.0.1 --allow-major --dry-run
magnus upgrade --to 3.0.1 --allow-major
```

There is no migration to apply. The start-up guard reads the inventory first: if a node would be locked out, the server does not start, names the nodes, and `magnus upgrade` switches back to 2.10.2 by itself. A 3.0.0 server upgrades to 3.0.1 in place with `magnus upgrade`.

**The agents, 2.10.2 to 2.10.3 to 3.0.1.** There is no hurry: a 2.10.2 agent with a key keeps working with a 3.0.x server in enforce mode. An agent before 2.10.3 cannot verify a major-upgrade authorization, so the fleet takes the 2.10.3 patch first (on npm under the dist-tag `maintenance-2.10`; `latest` is 3.0.1). On the server host, dry runs first:

```bash
magnus-server agents upgrade --to 3.0.1 --allow-major --dry-run
magnus-server agents upgrade --to 2.10.3 --dry-run
magnus-server agents upgrade --to 2.10.3
magnus-server agents upgrade --to 3.0.1 --allow-major --dry-run
magnus-server agents upgrade --to 3.0.1 --allow-major
```

The first dry run lists who needs which step: agents 2.10.0 to 2.10.2 as `MAJOR_NEEDS_STEPPING_STONE`, a node without an active key as `MAJOR_NEEDS_NODE_KEY` (enroll it, or let it bind its key). Without `--allow-major` such nodes stay `MAJOR_VERSION`. With it, each request that crosses the major carries an authorization signed with the server key for that node, the version it runs, the target and the tarball integrity, valid for one hour; the agent verifies it against the server key it pins, and the shared node secret never authorizes a major. Once accepted it is an ordinary upgrade with its trial: a node whose trial fails switches back to 2.10.3 by itself. Without `--integrity` the server reads each version's integrity from the registry (`MAGNUS_UPDATE_REGISTRY`); pass it explicitly for offline installs. New nodes install 3.0.x directly and enroll with a token.

Two things wait for a 3.0 agent on the node: the two-ADMIN [scheduler-source settlement](#settling-a-scheduler-source) and pinning a staged server key from the heartbeat, so rotate the server key only after the agents are on 3.0.x.

**In a Hive installation,** follow Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.9.6/UPGRADING.md#suite-390-magnus-301-node-keys-only): upgrade to suite 3.8.1 (Magnus 2.10.2) first, prepare the fleet there, then `./hive.sh upgrade --config FILE --release 3.9.6`, which needs no flag from 3.8.1 or a 3.9 release. Before it confirms the plan or changes anything, it checks the running Magnus as Magnus 3's guard will and refuses, naming the blockers. After the upgrade, `./hive.sh post-upgrade` moves the Magnus host's own agent to the pinned version (3.1.0 in Hive 3.9.6), and `./hive.sh magnus-agent install --config FILE --host HOST` does the same for each fleet host the suite installed; agents that Magnus manages take the commands above inside Magnus's container (`docker compose -f DIRECTORY/compose.json exec magnus ...`). A Hive installation moves to Magnus 3 through the suite release, not by hand.

## Per-node keys

Each host agent has its own Ed25519 node key, in `$AGENT_INSTALL_DIR/identity/node.key` (mode 0600), and the server has a signing key, in `$MAGNUS_HOME/state/node-auth/server-signing-key.json` (`NODE_AUTH_SERVER_KEY_PATH`, mode 0600). Requests in both directions are signed for exactly one node, with a timestamp, a single-use nonce and the hash of the body; the server stores only public keys. Back up the server key file with the database. To check a key, compare `magnus-agent identity show` on the host with the fingerprint the server lists for the node.

**The summary.** `GET /api/v1/node-credentials/summary` (ADMIN, OPERATOR) counts real nodes by credential state, sums the use of the shared credentials over the last 24 hours and lists what blocks `enforce`: `SERVER_KEY_UNAVAILABLE`, `NODES_WITHOUT_KEY`, `NODES_REVOKED`, `NODES_NOT_SIGNING_EVIDENCE`, `AGENTS_NEED_UPGRADE`, `RECENT_SHARED_SECRET_USE` and `PENDING_BINDINGS`. From 3.0.0 it also carries `modeExplicit`, `modeDeprecated` with a `deprecationNotice`, and `serverKeyRotation`.

**Rotate, revoke, re-enroll.** `magnus-agent identity rotate` on the node makes a new key signed for by the old one, which stays valid for 24 hours. A revoke (`POST /api/v1/nodes/<nodeId>/credentials/revoke`, ADMIN, optionally with a `reason`) leaves the agent refused with `401 NODE_CREDENTIAL_REVOKED` once no active key is left, and the node stays closed to the shared secret: re-enroll it with a new token, which replaces the old keys. A reset, which lets a node use the shared secret again, answers `409 NODE_AUTH_ENFORCED` in enforce mode; it needs an explicit `compat` or `warn` on the server and the same in the agent's `.env`. In HiveXUI, **Magnus > Fleet > Nodes** shows each node's key, the fleet's progress and what blocks enforcing keys; an administrator can list and revoke a node's keys there, and Magnus refuses a reset while the mode is `enforce`. The server checks the ADMIN role on each request.

**Rotating the server key.** Each step changes the key file, so back it up with the database afterwards:

```bash
magnus-server node-auth server-key status
magnus-server node-auth server-key stage
magnus-server node-auth server-key promote --force --grace-hours 168
magnus-server node-auth server-key retire
```

Stage creates the next key, which agents pin from their next heartbeats; the server signs nothing with it yet. Promote once the summary shows `serverKeyRotation.agents.pinningNext` equal to `keyedNodes`: `POST /api/v1/node-credentials/server-key/promote` refuses earlier with `409 SERVER_KEY_NOT_PINNED` unless `force`, and the command line cannot see the pins, so it always needs `--force`. The replaced key stays accepted for the grace period (default 7 days). Retire then destroys its private part and keeps its public key, so decisions it signed keep verifying. An agent that missed a promotion is refused once and pins the new key by itself. The rotation routes are not browser routes. See [per-node credentials](https://github.com/ChefTaco/magnus/blob/v3.0.1/docs/NODE_CREDENTIALS.md#rotating-the-server-key).

## Settling a scheduler source

The reviewer-signed `POST /api/v1/cron/scheduler-sources/reconcile` took an assertion signed with `COMMAND_RECONCILIATION_SECRET`, a key that agents held too, so a copy from any node could sign a settlement. In enforce mode it answers `409 NODE_AUTH_ENFORCED`. Its replacement is a two-ADMIN approval: one ADMIN person requests the settlement with a reason (`POST /api/v1/cron/scheduler-sources/reconcile-requests`), a different ADMIN person approves it within 15 minutes (`.../reconcile-requests/<id>/approve`, or `.../reject` to withdraw it), and only then does the server sign it for that node with its server key. The API secret and service identities can take neither step; each step is audited. It needs a 3.0 agent on the node (`features.schedulerSourceAuthorizations`): an older agent gets `409 AGENT_UPGRADE_REQUIRED` in enforce mode. Open requests live in the server process and do not survive a restart. These are API routes with no browser caller yet. See [settling a scheduler source](https://github.com/ChefTaco/magnus/blob/v3.0.1/docs/NODE_CREDENTIALS.md#settling-a-scheduler-source).

## Retiring the shared secrets

On the server, `NODE_MANAGER_SECRET` and `RESULT_SIGNING_SECRET` are required only under an explicit `compat` or `warn`. An agent upgraded from 2.10.x keeps its shared keys in `.env` and keeps MACing its own records (command ledger, mutation observations, receipts and decisions) with `RESULT_SIGNING_SECRET`, so a downgrade to 2.10.x still reads every record. Without the shared key a 3.0 agent uses node-local keys, `local-result.key` and `local-reconciliation.key` in its `identity` directory, separate from the node key. It reads a record signed with any key it may have used: the shared key, its previous value `RESULT_SIGNING_PREVIOUS_SECRET`, or the node-local key.

To retire the shared key from an upgraded agent, move its value from `RESULT_SIGNING_SECRET` to `RESULT_SIGNING_PREVIOUS_SECRET`, and keep it there while those records matter: new records are MACed with the node-local key and old ones keep verifying. Removing the value outright makes records signed with it unreadable. This makes a downgrade lossy: an agent that wrote records with a node-local key cannot be downgraded to 2.10.x without losing them. Hive's `magnus-agent install` never removes the secret lines an existing agent's `.env` has, for the same reason. Log forwarding (`LOG_INGEST_TOKEN`) and the Hermes registry token are separate credentials and are unchanged.

## Rollback

- **Back to the shared secret, same release.** Set `NODE_AUTH_MODE=compat` on the 3.0.x server and restart it: the shared node secret is accepted, and sent where needed, again, and the automatic binding reopens while its window lasts. An agent that should accept the shared secret again needs `NODE_AUTH_MODE=compat` in its `.env`. In a Hive installation, set it in `config/magnus.env` and restart Magnus, with no change of release; remove it again once the summary has no blockers.
- **Back to 2.10.2.** `magnus rollback`: there is no migration to undo, and 2.10.2 reads the same database and server key file (of a rotated file, it uses the active and next keys). 3.0 agents keep working with it: they sign, it verifies.
- **An agent below 3.0.0.** Keep `RESULT_SIGNING_SECRET` in its `.env` first: records it MACed with its node-local key cannot be read by 2.10.x.
- **An agent below 2.10.0.** It knows only the shared secret, which the server refuses for a node with a key. `GET /api/v1/node-credentials/downgrade-check?nodeId=<id>&to=<version>` names the reset to post first; in enforce mode there is none (`enroll-instead`), so keep such nodes on 2.10.0 or later.
- **A lost server key file** (a database restored without `$MAGNUS_HOME/state`): the server creates a new key, and agents re-pin it over verified TLS on their next refused request. A database that lost a node's credential leaves that node refused in enforce mode (`401 NODE_CREDENTIAL_UNKNOWN`) until it is enrolled with a token.

## Web terminal

The browser terminal runs through a separate [fleet gateway](https://github.com/ChefTaco/magnus/tree/v3.0.1/services/fleet-gateway) that holds the restricted SSH key, so neither the browser nor the Magnus API does. It is off by default: HiveXUI offers a terminal only when a gateway is deployed and configured on the server, and the person holds an `ADMIN` link and the `magnus:terminal` permission. Opening one also needs identity verified within the last five minutes, otherwise `STEP_UP_REQUIRED`, and an operator-approved host key for that node; unknown keys are refused and nothing is learned on first use. The audit log records metadata only. The gateway ships as the container image `ghcr.io/cheftaco/magnus-fleet-gateway`; Hive offers it in every release but never selects it in a profile.

## Ardent with bundled Emberfold

Ardent now has [its own guide](https://hivemagnus.com/guides/ardent.md): standalone installation with `npm i -g @hivemagnus/ardent`, model configuration, the gateway, the 3.x storage change and management through Magnus. Ardent imports its pinned Emberfold library directly; no separate Emberfold account or HTTP server is needed.

## Full instructions

- [Magnus installer](https://github.com/ChefTaco/magnus/tree/v3.0.1/packages/magnus)
- [Upgrading, including agents across a major version](https://github.com/ChefTaco/magnus/blob/v3.0.1/UPGRADING.md)
- [Per-node credentials](https://github.com/ChefTaco/magnus/blob/v3.0.1/docs/NODE_CREDENTIALS.md)
- [Node agent setup](https://github.com/ChefTaco/magnus/tree/v3.0.1/packages/agent)
- [Ardent agents, New Agent and the service bridge](https://github.com/ChefTaco/magnus/blob/v3.0.1/docs/ARDENT.md)
- [Browser route inventory](https://github.com/ChefTaco/magnus/blob/v3.0.1/docs/console-api.md)
- [Cindertrace migration](https://github.com/ChefTaco/magnus/blob/v3.0.1/docs/CINDERTRACE_MIGRATION.md)
- [Repository instructions](https://github.com/ChefTaco/magnus/blob/v3.0.1/AGENTS.md)

## Source review

Reviewed 2026-11-14 against tag `v3.0.1`, commit `17331cff15b9d3de5010b56807ff72ad88acd03f`, the version Hive `v3.9.0` pins: the [README](https://github.com/ChefTaco/magnus/blob/v3.0.1/README.md), [per-node credentials](https://github.com/ChefTaco/magnus/blob/v3.0.1/docs/NODE_CREDENTIALS.md), [UPGRADING](https://github.com/ChefTaco/magnus/blob/v3.0.1/UPGRADING.md) (major-version rules, agent upgrades and problem codes), the [agent README](https://github.com/ChefTaco/magnus/blob/v3.0.1/packages/agent/README.md), the node key section of the [browser route inventory](https://github.com/ChefTaco/magnus/blob/v3.0.1/docs/console-api.md#node-key-administration), the [changelog](https://github.com/ChefTaco/magnus/blob/v3.0.1/CHANGELOG.md) from 2.10.0 to 3.0.1, `release/3.0.0.json` and `release/3.0.1.json` (no migrations, no new or removed settings, `minUpgradeFrom` 2.10.2), and the host agent's `npm-shrinkwrap.json`, which pins Ardent `3.1.3`. The installer README, fleet gateway README, `docs/ARDENT.md` and `docs/HERMES_REGISTRY.md` are unchanged from `v2.10.0`. Suite behavior follows Hive `v3.9.0` [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.9.0/UPGRADING.md#magnus-300-node-keys-only), sections "Suite 3.9.0" and "Magnus 3.0.0: node keys only". The [3.0.1 release](https://github.com/ChefTaco/magnus/releases/tag/v3.0.1) is published; npm publishes `@hivemagnus/magnus` and `@hivemagnus/magnus-agent` 3.0.1 as `latest` and 2.10.3 as `maintenance-2.10`. The earlier review of 2.10.0, on the same date, is superseded. No installation command was run for this review. The standalone commands are unpinned: npm resolves `@hivemagnus/magnus` to its current `latest`, which may be newer than the suite pin. Follow current instructions for upgrades. License: Apache-2.0.
