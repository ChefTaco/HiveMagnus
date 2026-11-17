# Hive: agent guide

> Bash installer and controller for signed, digest-pinned suite releases, with upgrades, backups, restore rehearsals and the Hive Registry.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/hive) · [Release 3.11.2](https://github.com/ChefTaco/hive/releases/tag/v3.11.2) · [Deployment overview](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/README.md)

## When to use Hive

Choose Hive to plan, install, upgrade and recover a tested combination of independent Hive:Magnus products. `hive.sh` verifies a signed release manifest, renders per-host Compose projects from digest-pinned images, and records what it did. Hive plans, applies and recovers; each product keeps its own data, credentials and recovery lifecycle. The controller needs only Bash, jq, OpenSSL and Docker Compose; no Node.js runtime.

| Profile | Adds |
| --- | --- |
| `core` | Oathweave, Emberpath, HiveMem, HiveSkills, HiveXUI, the HTTPS ingress and the Hive Registry, with their private Redis and Qdrant stores |
| `full` | Core plus Magnus, Cindertrace and ChatterMost, each with its own private PostgreSQL, and the optional Emberfold HTTP service |
| `custom` | Oathweave, HiveXUI, the ingress and the Hive Registry, plus the products you select |

Embermend is an explicit optional selection requiring compatible Magnus; see [its guide](https://hivemagnus.com/guides/embermend.md). No profile selects the Magnus web terminal gateway or [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md); every release offers the gateway, and interactive setup suggests Studio with the full profile. Selecting Magnus does not install a host agent: the guided setup offers one after installation, and `hive.sh magnus-agent install` installs it separately. [Ardent](https://hivemagnus.com/guides/ardent.md) is not a suite container: the Magnus host agent stages the Ardent package its signed dependency lock pins, and Magnus installs and manages it on the host; `hive.sh ardent setup` creates a first assistant profile through Magnus.

## Reviewed release: 3.11.2

The release reviewed for the product details below is [Hive 3.11.2](https://github.com/ChefTaco/hive/releases/tag/v3.11.2). Its tag `v3.11.2` holds the signed manifest `releases/3.11.2.json`, its detached Ed25519 signature `releases/3.11.2.json.sig` and the publisher key `trust/publisher.pub`; the same three files are attached to the release. The manifest pins every product, datastore and initialization image by multi-architecture digest (linux/amd64 and linux/arm64), and pins the controller source with `controllerSHA256`.

| Product | Version in 3.11.2 |
| --- | --- |
| Oathweave | 2.3.1 |
| Emberpath | 2.5.2 |
| HiveMem | 1.8.1 |
| HiveSkills | 1.8.1 |
| HiveXUI | 0.9.2 |
| Embermend and its worker (optional) | 0.3.2 |
| Magnus server and fleet gateway | 3.1.2 |
| Magnus host agent `@hivemagnus/magnus-agent` | 3.1.2, with its npm integrity (`components.magnus.agentPackage`) |
| Ardent, staged by the Magnus host agent | 3.1.3 |
| Cindertrace | 0.7.2 |
| ChatterMost and its migrator | 0.7.0 |
| Emberfold HTTP service | 0.4.0 |
| Ardent Project Studio | 0.4.3 |
| Hive Registry | 1.3.1 |
| Hive Ingress | 2.0.6 |

The release notes list every image digest, including the private PostgreSQL 17.12 and 18.7, Redis 8.2.10 and Qdrant 1.18.3 stores.

### What recent releases changed

- **3.11.2** pins Oathweave 2.3.1, whose SDK's default issuer now matches the server default (the server is unchanged), HiveMem 1.8.1 (deployment script and documentation fixes), Emberpath 2.5.2, which removes the expired static security-export credential so its security export accepts only the `security-exporter` Oathweave client token, Magnus 3.1.2 for the server, the fleet gateway and the host agent (help text and environment schema fixes; Ardent stays at 3.1.3), and Ardent Project Studio 0.4.3 (Magnus contracts 3.1.2, no behaviour change). HiveXUI stays at 0.9.2. It pins a new controller (`controllerSHA256` `dd8910e233ceb1e3db6658707e1947e9e4a965c4ad7c3f9b862c32a94240414e`) whose `./hive.sh --help` now says `--release latest` also works for `admin-access`, so run 3.11.2 from a checkout of its tag. No storage format changes, and an upgrade from 3.11.1 needs no flag.
- **3.11.1** pins Cindertrace 0.7.2, whose standalone console is built with Next.js 16.4.6 for GHSA-mfr8-8qww-v76h. Every other pin, the storage formats and the controller are those of 3.11.0 (`controllerSHA256` `829e1e3d75a6d4dd0f33164044cd86218c6725d882a7d3ad5338e22b0e32c3f1`), and an upgrade from 3.11.0 needs no flag.
- **3.11.0** pins HiveMem 1.8.0 and ChatterMost 0.7.0, whose product-owned provisioning APIs let the new `./hive.sh admin-access setup` give an existing Oathweave administrator separate native accounts and reviewed grants in each installed product, with durable receipts; see [Sign in to HiveXUI](#sign-in-to-hivexui). The setup checklist tracks `administrator-product-access` separately from `first-admin`. Once you have run it, keep using the 3.11.0 or a newer controller: earlier controllers change the ownership of its protected access journals during privileged operations. It pins a new controller (`controllerSHA256` `829e1e3d75a6d4dd0f33164044cd86218c6725d882a7d3ad5338e22b0e32c3f1`); every other pin and storage format is that of 3.10.0, and an upgrade from 3.10.0 needs no flag.
- **3.10.0** adds `./hive.sh ardent setup`, which installs the staged Ardent package and creates a first `assistant` profile through Magnus's New Agent workflow (see [Fleet hosts](#fleet-hosts-and-security-events)), and lets local native backup, rehearsal and restore ask for ordinary sudo authorization. Every product pin is that of 3.9.8.
- **3.9.8** pins Magnus 3.1.1 (server, fleet gateway and host agent). Its **magnus status** quick action runs a registered diagnostic with signed, supervised evidence once the server and the agent run 3.1.1, and unsupported quick commands are refused before any work is created. Guided setup records certificate renewal and host-agent installation in the setup checklist as soon as they succeed.
- **3.9.7** pins HiveXUI 0.9.2, whose node software card reads Magnus 3.1.0's read-only software status instead of running shell commands on the node.
- **3.9.6** pins Magnus 3.1.0, whose agent's `native-snapshot` contract lets backups, upgrades and rollbacks include the Ardent profiles of the Magnus agent the Hive installer created, also those created through **New Agent**, once that agent runs 3.1.0 (`./hive.sh post-upgrade` moves it). Agents installed outside the Hive installer, such as fleet agents, are not part of Hive backups and are listed as not included.
- **3.9.3 to 3.9.5** add backup and rehearsal retention. `./hive.sh backups list` shows each host's backups and rehearsals and why each stays; `./hive.sh backups prune` previews what the rules would remove (by default everything beyond the newest 5 restorable pairs and older than 14 days, never an archive a state file names) and removes it only with `--apply`. From 3.9.4, `./hive.sh backups schedule enable|disable|status` runs that prune daily on a single-host installation. From 3.9.5, only the newest passed rehearsal keeps its full restored copy (`--keep-full N`); `./hive.sh rehearse --archive ID` rebuilds one. A controller before 3.9.4 refuses `retention.schedule` and one before 3.9.3 refuses `retention`, so run `backups schedule disable` and remove those keys before rolling back that far. Copy any archive you plan to restore later outside the installation directory before `--apply`.
- **3.9.0 to 3.9.2** move Magnus to 3, which accepts node keys only and upgrades from Magnus 2.10.2 only; see [Upgrade](#upgrade). 3.9.1 lets operators retire the last shared keys, and 3.9.2 pins the ingress 2.0.6.
- **3.8.0** moved every product except the ingress to a new version; see [What 3.8.0 changes for users](#what-380-changes-for-users). Earlier, 3.4.0 added Agent 360 and new Emberpath and HiveSkills data formats, 3.5.0 the HiveXUI inbox and the retirement of the web UIs Emberpath and HiveSkills used to bundle, and 3.6.0 the setup checklist and record search.

Suite audit collection by Cindertrace is prepared in the controller but stays off in 3.11.2. Every release is described in the [changelog](https://github.com/ChefTaco/hive/blob/v3.11.2/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.11.2/UPGRADING.md).

Since 3.0.0 the suite runs maintained system libraries and patched embedded SQLite, and its PostgreSQL images are rebuilt against new glibc and ICU libraries. An existing PostgreSQL store from 2.x needs an explicit, rehearsed migration to enter that runtime; see [Upgrade](#upgrade). From 2.4.0, guided local setup prepares the host itself with consent, and full-node enrollment adds commands, managed cron and a selected web terminal to the local Magnus host.

A passing disposable rehearsal is not production cutover approval, physical multi-host certification or ARM64 certification. Do not cut over an existing installation based on this guide or on a passing fresh fixture. Later releases are listed on the [releases page](https://github.com/ChefTaco/hive/releases).

### What 3.8.0 changes for users

- **Oathweave 2.3.0, sign-in clients.** A confidential client must now send its client secret when it exchanges an authorization code; a public client must have started sign-in with a PKCE (S256) challenge. The suite's HiveXUI clients are public PKCE clients and need nothing. A confidential client that exchanged codes without its secret, such as Magnus's standalone UI registered as confidential, must be given it (`HIVE_OAUTH_CLIENT_SECRET` for Magnus), and a confidential client with no secret gets one with `POST /clients/{id}/rotate-secret`. Behind several proxy tiers, list every tier in `TRUSTED_PROXY_IPS`.
- **Emberpath 2.5.0, providers.** A stored provider credential stays with the server it was entered for: changing a provider's base URL to another scheme, host or port needs its secret again in the same change. Provider requests no longer follow redirects, so a provider behind a redirect fails until its base URL is the final address. Provider reads and configuration exports show `[redacted]` for credential header values.
- **HiveMem 1.7.0, workspaces.** Editing or moving a memory needs write access to its workspace, and to the destination when it moves; only an administrator can create the `default` workspace record; and another agent's profile summarises only memories you can read.
- **Magnus 2.10.0, per-node keys.** Each host agent gets its own node key while the shared node secret keeps working (`compat` mode). After the server upgrade, existing agents bind their key automatically for 30 days, and Magnus notifies you with each key's fingerprint. An agent that reaches Magnus through the suite's host agent port is the exception: it keeps the shared secret until you enroll it with a one-time token. `hive.sh magnus-agent install` enrolls a new agent with a token. HiveXUI shows the state under **Magnus > Fleet > Nodes**: a Node key column, a Node credentials panel with the fleet's progress towards enforcing keys, and a Node credential card on node detail, where administrators see the fingerprint and can revoke or reset a key. Enforcing keys only (`NODE_AUTH_MODE=enforce`) is opt-in; leave it off until every agent has a key. 2.10.0 and 2.10.1 agents with a key refuse the server's managed requests on enrolled nodes; Magnus 2.10.2, which 3.8.1 pins, fixes this and reaches those agents without upgrading them first, so upgrade the suite to 3.8.1 before the agents; see the [Magnus guide](https://hivemagnus.com/guides/magnus.md#per-node-keys). See [node keys](https://github.com/ChefTaco/hive/blob/v3.8.1/deployment/FULL.md#node-keys).

## Prerequisites

- A host running Ubuntu 22.04 or 24.04, or Debian 12 or 13, on amd64 or arm64, with sudo, 2 CPUs, 4 GB of memory and 20 GB of free disk. The `full` profile uses about 1 GB of memory when idle and about 6 GB of container images. On other Linux distributions, install Docker Engine with the Compose plugin and the tools `./scripts/install-prerequisites.sh --check` lists yourself.
- A DNS name for the browser address and a certificate and unencrypted key for it, from `tailscale cert`, your own CA or an ACME client.
- The signed services run as UID/GID 1000 (HiveXUI as 101), so run fresh setup as that account (usually the first account on the host) or with sudo.
- No model runtime: inference stays external.

## Install

The [installation guide](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/QUICKSTART.md) covers every step and setup question. On a fresh host:

```bash
git clone https://github.com/ChefTaco/hive.git && cd hive
./hive.sh --release latest
```

Expected result: the launcher resolves GitHub’s latest published, non-prerelease suite release once, prints its exact version, verifies it and starts guided setup. For a fresh local installation, setup offers to install Docker Engine and the required tools, using sudo only after showing its changes and asking for consent; the new `docker` group membership takes effect in a child shell, so no logout is needed. It then offers to create the installation directory. If Tailscale is already signed in with HTTPS Certificates enabled, setup suggests this host's HTTPS name and can obtain its certificate. Every offer can be declined.

To choose this release explicitly, as its release notes show:

```bash
git clone --branch v3.11.2 https://github.com/ChefTaco/hive.git hive && cd hive
./hive.sh --release 3.11.2
```

Failed lookups stop setup instead of falling back to an older release. An already-matching local checkout stays in use. Otherwise the launcher retains the tagged controller under `${XDG_DATA_HOME:-$HOME/.local/share}/hive/releases/` and prints its path. After setup, change to that retained checkout for the lifecycle and certificate commands below, and keep it while a renewal timer uses it. Return to the original launcher checkout when selecting a new release with `--release latest`.

The launcher checks the manifest signature against its original publisher key and verifies the signed controller source digest before executing it. It refuses changed release checkouts or a different key. For example, 3.11.2 verifies `releases/3.11.2.json` against its signature with `trust/publisher.pub`, then asks for the installation name, directory, host, browser address (the HTTPS origin), profile, bind address and certificate files, and, with Magnus, an optional port for host agents. It never asks for a password on the command line. It shows a plan, applies it after you confirm, and ends with the HTTPS origin, the initial sign-in file and the next commands. After installation it offers the certificate renewal timer and, when an agent port was selected, the Magnus host agent, full-node enrollment and then a first Ardent assistant. The steps that still need a person are recorded as a setup checklist: `./hive.sh status` and `./hive.sh setup` list the pending ones, `./hive.sh setup done ID` or `setup skip ID` settles one, and HiveXUI shows the list to administrators. If setup stops after writing its configuration, running it again offers to continue with that file.

### Manual host preparation

Existing configuration files, unattended commands and remote hosts keep explicit prerequisite and certificate management:

```bash
sudo ./scripts/install-prerequisites.sh --directory /opt/hive
# log out and back in for the docker group, then:
./scripts/install-prerequisites.sh --check
sudo ./scripts/console-certificate.sh tailscale
```

Expected result: `install-prerequisites.sh` shows its plan and asks before changing anything. It installs Docker Engine and the Compose plugin from Docker's apt repository after checking its signing key, plus jq, OpenSSL, curl, git, iproute2 and the other tools `hive.sh` uses, adds you to the `docker` group and creates `/opt/hive`; `--check` then prints `Ready`. `console-certificate.sh tailscale` writes `/etc/hive/tls/console.crt` and `console.key` for the host's MagicDNS name, owned by you. With your own certificate, check it instead with `./scripts/console-certificate.sh check --cert FILE --key FILE --name NAME`. Hive runs no ACME client itself.

To install from separately downloaded files instead, pass `--manifest`, `--signature` and `--trust-key`, still from the same tag's checkout. First check the key's fingerprint against the one in the [release notes](https://github.com/ChefTaco/hive/releases/tag/v3.11.2). The fingerprint is the SHA-256 of the DER public key:

```bash
openssl pkey -pubin -in trust/publisher.pub -outform DER | sha256sum
```

### Repeatable plans

For retries and for planning then applying, use the same exact release setup reported; do not resolve `latest` separately between the two steps. To prepare configuration separately or run unattended, supply the same installation JSON ([example](https://github.com/ChefTaco/hive/blob/v3.11.2/examples/installation.json), [schema](https://github.com/ChefTaco/hive/blob/v3.11.2/examples/installation.schema.json)). Interactive setup writes it to a protected configuration directory outside the checkout, by default `~/.config/hive/ID/installation.json`:

```bash
./hive.sh plan --config installation.json --release 3.11.2
./hive.sh install --config installation.json --release 3.11.2 --non-interactive --yes
./hive.sh status --config installation.json
./hive.sh doctor --config installation.json
```

Planning does not contact hosts. Per-product secrets, initial identities and internal transport keys are generated once into protected files, and retries check the exact inputs. Existing data, configuration, model resources and Compose projects are never silently adopted or overwritten. `./hive.sh --help` lists the lifecycle commands, including `init`, `upgrade`, `post-upgrade`, `setup`, `rollback`, `backup`, `backups`, `adopt`, `restore`, `rehearse`, `admin-access`, `ardent` and `migrate-native`. Commands other than `install`, `init` and `plan` find the installation file themselves when `~/.config/hive` holds exactly one.

For hosts beyond one, read the [distributed](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/DISTRIBUTED.md), [full](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/FULL.md) and [custom](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/CUSTOM.md) guides.

## Sign in to HiveXUI

Visit the HTTPS origin you configured and sign in through Oathweave. [HiveXUI](https://hivemagnus.com/guides/hivexui.md) is the browser UI for every installed product, and shows sections only for products in this installation.

On a fresh installation, the initial username and password are in `config/initial-credentials.env` in the installation directory on the identity host, for example `/opt/hive/config/initial-credentials.env`; read them privately and leave the file in place. Add a passkey or authenticator app under **Oathweave > Account security**.

Keep the initial operator for recovery and work as your own administrator. Create it in **Oathweave > Users**, then give it access to the installed products:

```bash
./hive.sh admin-access setup --release 3.11.2
```

Expected result: it lists the active administrators to choose from (`admin-access list` shows them), shows the products the account will administer, asks for sudo when needed, adds the Suite Administrator role, creates separate product accounts with reviewed grants, reconnects only the affected services and records `first-admin` and `administrator-product-access` as done in the setup checklist. Existing accounts and service identities are preserved; conflicting, locked or disabled accounts are refused. `admin-access setup NAME` selects an account by name, `--yes` confirms an unattended run after review, and `admin-access status NAME` reads the retained operation; after an interruption, repeat the same command. Sign out of HiveXUI and sign in with your own account, then take and rehearse a fresh backup. An external Magnus needs its own installation owner. See [administrator product access](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/QUICKSTART.md#administrator-product-access).

The installer copies the certificate into the ingress. After renewing it, run `./hive.sh tls-refresh --config FILE`; `sudo ./scripts/console-certificate.sh schedule --config FILE` does this weekly for a Tailscale certificate, and successful upgrades refresh an existing renewal service to the new checkout. Back up with `./hive.sh backup --config FILE --archive NAME --yes`, which keeps the suite serving; each application pauses only briefly, however much data it holds. See [backups](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/BACKUPS.md). Each upgrade keeps a backup and a restored rehearsal copy: on a single-host installation, `./hive.sh backups schedule enable --config FILE --at HH:MM` prunes old pairs every day with the [retention rules](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/BACKUPS.md#daily-pruning), and `./hive.sh backups schedule status --config FILE` shows the crontab line and the last run.

An installation migrated with `hive.sh migrate-native` keeps its accounts, roles and password hashes instead, and the owner sets a new administrator password once with a one-use reset token. Cutover writes the token to the configured `adminAccount.tokenFile` on the controller, mode 0600; it expires after 24 hours. On the host, run the installation's `bin/hive-set-admin-password` with `sudo`, or `hive.sh migrate-native set-admin-password --config FILE` from the controller. It prompts for the token and the new password without echo; neither can be a command-line argument. Then sign in and delete the token file. See [first sign-in](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/MIGRATE_NATIVE.md#first-sign-in).

## Upgrade

Return to the original launcher checkout. It selects and retains the new release controller; use an exact version instead of `latest` to review and apply a specific release. An upgrade shows its plan and requires confirmation:

```bash
./hive.sh upgrade --config installation.json --release latest
```

Some upgrades also need explicit migration approval with `--allow-migrations`:

- from 2.x, with existing PostgreSQL stores (Magnus, Cindertrace or ChatterMost);
- from a release before 3.4.0, when the installation includes Emberpath or HiveSkills, whose data formats changed;
- from a release before 3.6.0, when the installation includes Embermend;
- from a release before 3.8.0, when the installation runs Magnus, for Magnus 2.10.0's two additive migrations.

An upgrade from 3.7.x without Magnus, or with an external Magnus, needs none, and neither does one from 3.8.0 to 3.8.1 or from 3.8.1 to any later release (for example 3.9.7 to 3.9.8, 3.10.0 to 3.11.0, 3.11.0 to 3.11.1 or 3.11.1 to 3.11.2). Magnus 3 upgrades from Magnus 2.10.2 only, so an installation that runs Magnus on a release before 3.8.1 upgrades to 3.8.1 first, then to 3.11.2. Before it changes anything, `hive.sh upgrade` checks a suite-managed Magnus as Magnus 3's start-up guard will and refuses, naming the blockers, while a node has no active key or its agent does not sign its evidence.

```bash
./hive.sh plan --config installation.json --release 3.11.2 --allow-migrations
./hive.sh upgrade --config installation.json --release 3.11.2 --allow-migrations
```

The installer takes a verified pre-change backup, rehearses the new runtime and migration on a disposable copy, then migrates the stopped live stores and rebuilds their indexes before activation. Credentials, ownership, PostgreSQL majors, application records and component selection are retained. HiveXUI is unavailable while services and stores are stopped or migrated; the duration depends on the data and index rebuilds. A core installation has no PostgreSQL store to migrate, and moving between releases with unchanged datastore formats does not repeat a migration.

**Code-only rollback across the 3.0.0 PostgreSQL boundary is refused.** `./hive.sh rollback` can still return to a compatible storage format, but recovery from the PostgreSQL collation change requires the verified original-state backup, rehearsed with the retained original controller and images, and reconciliation of later writes; it must not discard them. A failed or uncertain live migration holds the transaction for recovery: repeat exactly the same command rather than editing transaction or runtime receipts. Read the release notes, [advisory remediation](https://github.com/ChefTaco/hive/blob/v3.11.2/docs/ADVISORY_REMEDIATION.md#postgresql-needs-a-separate-migration-proof), the [upgrade procedure](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/QUICKSTART.md#8-upgrade) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.11.2/UPGRADING.md) first.

After upgrading, switch to the retained checkout the launcher printed and finish the remaining steps. `post-upgrade` shows and confirms each change: it updates Magnus host agents older than the release, adds missing HiveXUI browser clients to Oathweave, marks the setup checklist items it completes as done, and lists what is left. A successful interactive upgrade also offers `admin-access setup`; after an unattended one, run it when ready:

```bash
./hive.sh post-upgrade --config installation.json --release 3.11.2
./hive.sh magnus-agent install --config installation.json --release 3.11.2
```

`magnus-agent install` is the same scope-preserving package maintenance path run on its own: it upgrades the agent and stages the verified Ardent package while keeping its enrollment scope, node identity, profiles and completed history. Full-node enrollment remains a separate explicit operation. An updated agent is not re-enrolled for a node key either: with Magnus 2.10 it binds its own key automatically, and with Magnus 3 an agent that has a key keeps it while one without a key is enrolled with a one-time token. Agents that Magnus manages cross from 2.10.2 to 3.x by way of 2.10.3, with `magnus-server agents upgrade --to 2.10.3` and then `--to 3.1.2 --allow-major` (or **Allow major upgrade** in HiveXUI), and move from an earlier 3.x with `--to 3.1.2` within the major, each after a `--dry-run`; see the [Magnus guide](https://hivemagnus.com/guides/magnus.md#upgrade-to-301). Then, in **Magnus > Ardent > Installations** in HiveXUI, stop running profiles, choose **Update package** and start them again. From 3.9.1 `./hive.sh post-upgrade` asks Magnus, read only, which installations are behind the Ardent version their node agent stages, names them, and records `ardent-packages-updated` as done once none is; with an external Magnus it asks through Ardent Project Studio's service identity, so without Studio record it with `./hive.sh setup done ardent-packages-updated`.

## Fleet hosts and security events

With Magnus and a port for host agents, one command installs the Magnus agent on the Magnus host, or with `--host` on another fleet host, and waits for Magnus to accept its first heartbeat. Without a suitable Node.js it offers to install Node.js 24 from NodeSource's signed apt repository (`--install-node` agrees unattended). It installs exactly the agent version the release pins, after checking the package's integrity, never prints the node credentials, and stages the pinned Ardent package without installing or starting a runtime. With Magnus 2.10 it gives a new agent its own node key through a one-time enrollment token that is never printed or passed on a command line (with Magnus 3, every agent without a key, and it copies no fleet-wide node secret to agents), and ends with the key fingerprint to compare with Magnus's notification; `magnus-agent status` includes the node key state. On an installer-owned single host, `magnus-agent enroll` then reviews and enables full node capabilities: commands, managed cron and a selected restricted web terminal. A fresh Cindertrace ingests nothing until a collector exists; `cindertrace-collector add` generates a collector's credential into an owner-only file on the Cindertrace host and never prints it.

```bash
./hive.sh magnus-agent install --config installation.json
./hive.sh magnus-agent enroll --config installation.json
./hive.sh magnus-agent status --config installation.json
./hive.sh cindertrace-collector add edge --sources tailscale --config installation.json
./hive.sh cindertrace-collector list --config installation.json
```

With Magnus, HiveMem and Oathweave and an enrolled host agent, `ardent setup` installs the staged Ardent package and creates the `assistant` profile through Magnus's **New Agent** workflow. It asks for an OpenAI-compatible model API URL (including `/v1`) and the model name, configures HiveMem, starts the profile and makes a real model request before reporting success. It accepts only model endpoints that need no separate API key. Existing profiles are preserved, and repeating it follows its retained operation instead of creating another profile; a failed operation is resumed only explicitly, after review. Magnus-created profiles are included in native suite backups, so do not add them to the installation file's `agents`.

```bash
./hive.sh ardent setup --config installation.json
./hive.sh ardent status --profile assistant --config installation.json
./hive.sh ardent check --profile assistant --config installation.json
```

See the [setup checklist](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/FULL.md#setup-checklist), [creating an Ardent assistant](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/FULL.md#create-an-ardent-assistant), [Magnus host agents](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/FULL.md#magnus-host-agents), [Ardent Project Studio](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/FULL.md#ardent-project-studio) and [sending security events](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/FULL.md#sending-security-events-to-cindertrace).

## Hive Registry

Every installation runs a Hive Registry: its install catalog and lookup API, a small SQLite container on the host serving HiveXUI. It is mandatory, one per installation, and unrelated to [HiveSkills](https://hivemagnus.com/guides/hiveskills.md), the skills registry. It holds the products the signed release offers, what this installation actually runs, the links an operator or client needs, the setup checklist, each product's announced capabilities such as its event feed, and an append-only history. It has no HiveXUI section of its own; HiveXUI reads it to decide which sections to show and for its Setup page.

```bash
./hive.sh registry list --config installation.json
./hive.sh registry get emberpath --config installation.json
```

`list` also has `installed`, `summary` and `history` forms. `hive.sh` is the normal writer; `registry add`, `update` and `remove` cover externally managed products only, and any credential in an entry is refused. The ingress passes only explicit `GET` routes under `/api/registry/`, so writes never leave the private network. `status` reports drift by name and `doctor` fails on any drift. See the [API reference](https://github.com/ChefTaco/hive/blob/v3.11.2/docs/hive-registry-api.md).

## External inference

Ollama, llama.cpp, other inference services and hosted APIs are external dependencies. Hive only verifies connectivity, model discovery, generation and streaming, then registers verified providers with Emberpath. It never installs or manages inference services, model downloads, storage, licenses or GPUs. See [external inference](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/INFERENCE.md).

## Existing installations

A native installation, with Router, IAM, HiveMem and, where installed, Skills running as systemd services, moves onto the suite on the same host and ports with `hive.sh migrate-native`. It keeps every native port, certificate, issuer, key and account. Read [migrating a native installation](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/MIGRATE_NATIVE.md) before any separately approved maintenance window. `adopt` takes over existing Compose stacks only.

The npm launcher `@hivemagnus/hive` and the other 1.x npm packages are the legacy line. The suite products supersede them; 1.2.2 was the final legacy npm release and its archived source remains at that tag. Installations the launcher manages follow [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.11.2/UPGRADING.md). To bring one under the controller, rehearse its own backups and read [existing-data rehearsals](https://github.com/ChefTaco/hive/blob/v3.11.2/deployment/EXISTING_DATA_REHEARSALS.md) first. Preserve each installation's state.

## Source review

Reviewed 2026-11-14 against tag `v3.8.0`, commit `2fe6f690556ff75d47b76301eb6cc8e5c25a4a91`: [README](https://github.com/ChefTaco/hive/blob/v3.8.0/README.md), [deployment overview](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/README.md), [installation guide](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/QUICKSTART.md), [full profile](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/FULL.md), [native migration](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/MIGRATE_NATIVE.md), [backups](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/BACKUPS.md), [upgrading](https://github.com/ChefTaco/hive/blob/v3.8.0/UPGRADING.md), [advisory remediation](https://github.com/ChefTaco/hive/blob/v3.8.0/docs/ADVISORY_REMEDIATION.md), [releasing](https://github.com/ChefTaco/hive/blob/v3.8.0/docs/RELEASING.md), [Hive Registry API](https://github.com/ChefTaco/hive/blob/v3.8.0/docs/hive-registry-api.md), [release launcher](https://github.com/ChefTaco/hive/blob/v3.8.0/scripts/suite/release-launcher.sh), the [changelog](https://github.com/ChefTaco/hive/blob/v3.8.0/CHANGELOG.md) entries for 3.0.0 to 3.8.0, `releases/3.8.0.json` and the `hive.sh --help` text. No installation command was run for this review. Release notes: [3.8.0](https://github.com/ChefTaco/hive/releases/tag/v3.8.0). The default command clones the launcher and uses `--release latest`; exact versions remain supported. Follow current docs for later releases. License: Apache-2.0.

Release update, 2026-11-14: [Hive 3.8.1](https://github.com/ChefTaco/hive/releases/tag/v3.8.1), tag `v3.8.1`, commit `b7ff9b9f2c8edb7eb25552bd8d907d87df4c0dee`, pins Magnus, its fleet gateway and host agent 2.10.2 and keeps every other pin and the controller (`controllerSHA256` unchanged) of 3.8.0, so the installation and upgrade links and commands now use `v3.8.1`. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.8.1/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.8.1/UPGRADING.md#suite-381-magnus-managed-requests-to-agents-with-a-node-key), an upgrade from 3.8.0 needs no flag. No installation command was run for this update.

Release update, 2026-11-14: [Hive 3.9.0](https://github.com/ChefTaco/hive/releases/tag/v3.9.0), tag `v3.9.0`, commit `7ce6c8fe5448d15898754b24b283996df5851dc2`, pins Magnus, its fleet gateway and host agent 3.0.1 and HiveXUI 0.9.0, keeps every other pin of 3.8.1 and pins a new controller (`controllerSHA256` `78e3447193b1b49728d4d8331d41795188ab2a010c6df221a9b403cd4a67cf3c`), so the installation and upgrade links and commands now use `v3.9.0`. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.9.0/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.9.0/UPGRADING.md#suite-390-magnus-301-node-keys-only), an upgrade from 3.8.1 needs no flag, and the upgrade checks a suite-managed Magnus for node-key blockers before it changes anything. No installation command was run for this update.

Release update, 2026-11-15: [Hive 3.9.1](https://github.com/ChefTaco/hive/releases/tag/v3.9.1), tag `v3.9.1`, commit `ec1b19aaa4fdcfa21b577f93b05d0df8481dedc0`, pins Magnus, its fleet gateway and host agent 3.0.2, keeps every other pin of 3.9.0 and pins a new controller (`controllerSHA256` `389da4b0c82448a20d48ee6bfb1088f34f25a9d62504a8b80fe6040cc40b45fb`) in which `post-upgrade` settles `ardent-packages-updated` from a read-only Magnus check, so the installation and upgrade links and commands now use `v3.9.1`. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.9.1/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.9.1/UPGRADING.md#suite-391-magnus-302-retiring-the-shared-keys), an upgrade from 3.9.0 needs no flag, and retiring the shared keys follows Magnus's [Retiring the shared keys](https://github.com/ChefTaco/magnus/blob/v3.0.2/docs/NODE_CREDENTIALS.md#retiring-the-shared-keys). No installation command was run for this update.

Release update, 2026-11-15: [Hive 3.9.2](https://github.com/ChefTaco/hive/releases/tag/v3.9.2), tag `v3.9.2`, commit `91859363039a7c1a2ce4c73403aadee9a31bf006`, pins Magnus, its fleet gateway and host agent 3.0.3, HiveXUI 0.9.1 and the ingress 2.0.6, and keeps every other pin and the controller of 3.9.1 (`controllerSHA256` `389da4b0c82448a20d48ee6bfb1088f34f25a9d62504a8b80fe6040cc40b45fb`, unchanged), so the installation and upgrade links and commands now use `v3.9.2`. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.9.2/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.9.2/UPGRADING.md#suite-392-magnus-303-hivexui-091-ingress-206), it adds no migrations and an upgrade from 3.9.1 needs no flag. No installation command was run for this update.

Release update, 2026-11-15: [Hive 3.9.3](https://github.com/ChefTaco/hive/releases/tag/v3.9.3), tag `v3.9.3`, commit `a1e3f61cdd2123051115804230a235b78deb4e51`, pins HiveMem 1.7.1, HiveSkills 1.8.1, Cindertrace 0.7.1, Embermend 0.3.2, Emberpath 2.5.1, Ardent Project Studio 0.4.2 and ChatterMost 0.6.4, keeps every other pin of 3.9.2 and pins a new controller (`controllerSHA256` `ce4b9eae1ae13cf3e1c3506067dca5dc8a4ce47dd02b4e551b03e723ad636715`) that adds backup and rehearsal retention (`hive.sh backups list|prune`, with automatic pruning after an upgrade off by default and single-host only), so the installation and upgrade links and commands now use `v3.9.3`. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.9.3/CHANGELOG.md), [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.9.3/UPGRADING.md#suite-393-retention-and-the-hive-common-050-products) and [retention rules](https://github.com/ChefTaco/hive/blob/v3.9.3/deployment/BACKUPS.md#retention), it adds no migrations and an upgrade from 3.9.2 needs no flag. No installation command was run for this update.

Release update, 2026-11-15: [Hive 3.9.4](https://github.com/ChefTaco/hive/releases/tag/v3.9.4), tag `v3.9.4`, commit `047e767bcf22ffd2a8070cad410c59dcd1e18a74`, keeps every product pin of 3.9.3 and pins a new controller (`controllerSHA256` `5ada70afc33fb6472fea32d629dfa29e243eddb1cd98eb64c38747c40879b44c`) that adds daily backup pruning (`hive.sh backups schedule enable|disable|status`, single-host only, with `retention.schedule` for install and guided setup), so the installation and upgrade links and commands now use `v3.9.4`. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.9.4/CHANGELOG.md), [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.9.4/UPGRADING.md#suite-394-daily-backup-pruning) and [daily pruning](https://github.com/ChefTaco/hive/blob/v3.9.4/deployment/BACKUPS.md#daily-pruning), it adds no migrations and an upgrade from 3.9.3 needs no flag. No installation command was run for this update.

Release update, 2026-11-15: [Hive 3.9.5](https://github.com/ChefTaco/hive/releases/tag/v3.9.5), tag `v3.9.5`, commit `935a1716b07c1c27dad3ac3b18a947138587c0a9`, keeps every product pin of 3.9.4 (Magnus 3.0.3) and pins a new controller (`controllerSHA256` `201be83c28295a72be050253299f7ce45910f00c42be7aec12e44fdf9bde71b8`) that keeps only the newest passed rehearsal's full restored copy (`backups prune --keep-full N`), backs up the native profiles of the installer-owned Magnus agent once it has `native-snapshot` and lists them as not included until then, and leaves agents installed outside the Hive installer out of Hive backups, so the installation and upgrade links and commands now use `v3.9.5`. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.9.5/CHANGELOG.md), [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.9.5/UPGRADING.md#suite-395-restored-copies-and-native-profile-backup) and [restored copies](https://github.com/ChefTaco/hive/blob/v3.9.5/deployment/BACKUPS.md#restored-copies), it adds no migrations and an upgrade from 3.9.4 needs no flag. No installation command was run for this update.

Release update, 2026-11-15: [Hive 3.9.6](https://github.com/ChefTaco/hive/releases/tag/v3.9.6), tag `v3.9.6`, commit `9a3563e39b0c2c37f0bc0a23427f5e4239a0cc13`, pins Magnus 3.1.0 (server, fleet gateway and host agent) and keeps every other pin and the controller of 3.9.5 (`controllerSHA256` `201be83c28295a72be050253299f7ce45910f00c42be7aec12e44fdf9bde71b8`), so the installation and upgrade links and commands now use `v3.9.6`. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.9.6/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.9.6/UPGRADING.md#suite-396-magnus-310-and-native-profile-backup), the installer-owned Magnus agent's native profiles are included in backups once it runs 3.1.0, agents installed outside the Hive installer are still not, it adds no migrations, and an upgrade from 3.9.5 needs no flag. No installation command was run for this update.

Release update, 2026-11-16: [Hive 3.9.7](https://github.com/ChefTaco/hive/releases/tag/v3.9.7), tag `v3.9.7`, commit `ef4b9f3439188d10a78c4a88a0e5e1242fd932a7`, pins HiveXUI 0.9.2 and keeps every other pin, Magnus 3.1.0 included, and the controller of 3.9.6 (`controllerSHA256` `201be83c28295a72be050253299f7ce45910f00c42be7aec12e44fdf9bde71b8`), so the installation and upgrade links and commands now use `v3.9.7`. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.9.7/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.9.7/UPGRADING.md#suite-397-hivexui-092-and-the-read-only-software-status), the node software card reads Magnus 3.1.0's read-only software status, a mixed fleet shows older agents as unavailable rather than erroring, and an upgrade from 3.9.6 needs no flag. No installation command was run for this update.

Release update, 2026-11-16: [Hive 3.11.0](https://github.com/ChefTaco/hive/releases/tag/v3.11.0), tag `v3.11.0`, commit `f2536e7531c1d30db0c8f47f9c0cf522333b5621`, pins HiveMem 1.8.0 and ChatterMost 0.7.0 with a new controller (`controllerSHA256` `829e1e3d75a6d4dd0f33164044cd86218c6725d882a7d3ad5338e22b0e32c3f1`) that adds `hive.sh admin-access setup`. It follows [Hive 3.10.0](https://github.com/ChefTaco/hive/releases/tag/v3.10.0), which adds `hive.sh ardent setup`, and [Hive 3.9.8](https://github.com/ChefTaco/hive/releases/tag/v3.9.8), which pins Magnus 3.1.1. The version table, the recent-release summary, the administrator access and Ardent assistant steps, and the installation and upgrade links and commands now follow the `v3.11.0` [changelog](https://github.com/ChefTaco/hive/blob/v3.11.0/CHANGELOG.md), [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.11.0/UPGRADING.md#suite-3110-guided-administrator-product-access), [installation guide](https://github.com/ChefTaco/hive/blob/v3.11.0/deployment/QUICKSTART.md#administrator-product-access), [full profile](https://github.com/ChefTaco/hive/blob/v3.11.0/deployment/FULL.md#create-an-ardent-assistant), `releases/3.11.0.json` and the `hive.sh --help` text. The long per-release paragraph that summarized 3.3.0 to 3.9.7 is condensed into the summary above. Upgrades from 3.9.7, 3.9.8 and 3.10.0 need no flag. No installation command was run for this update.

Release update, 2026-11-17: [Hive 3.11.1](https://github.com/ChefTaco/hive/releases/tag/v3.11.1), tag `v3.11.1`, commit `9b8eedb8963adcf4a88e6e20ad0ae41ebe1d6556`, pins Cindertrace 0.7.2 and keeps every other pin and the controller of 3.11.0 (`controllerSHA256` `829e1e3d75a6d4dd0f33164044cd86218c6725d882a7d3ad5338e22b0e32c3f1`), so the installation and upgrade links and commands now use `v3.11.1`. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.11.1/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.11.1/UPGRADING.md#suite-3111-cindertrace-072), Cindertrace 0.7.2 updates its standalone console to Next.js 16.4.6 for GHSA-mfr8-8qww-v76h, it adds no migrations, and an upgrade from 3.11.0 needs no flag. No installation command was run for this update.

Release update, 2026-11-17: [Hive 3.11.2](https://github.com/ChefTaco/hive/releases/tag/v3.11.2), tag `v3.11.2`, commit `bdbcfb36c937aad12e7a969e0dbf268f42fd470f`, pins Oathweave 2.3.1, Emberpath 2.5.2, HiveMem 1.8.1, Magnus 3.1.2 (server, fleet gateway and host agent) and Ardent Project Studio 0.4.3, keeps every other pin, HiveXUI 0.9.2 included, and pins a new controller (`controllerSHA256` `dd8910e233ceb1e3db6658707e1947e9e4a965c4ad7c3f9b862c32a94240414e`) whose `hive.sh --help` text now says `--release latest` also works for `admin-access`. The version table, the recent-release summary and the installation and upgrade links and commands now use `v3.11.2`, and the Magnus agent upgrade targets name 3.1.2. Per its [changelog](https://github.com/ChefTaco/hive/blob/v3.11.2/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.11.2/UPGRADING.md#suite-3112-product-maintenance-releases), no storage format changes, none of the new product versions has a database migration, and an upgrade from 3.11.1 needs no flag; a checkout of the 3.11.1 tag refuses the 3.11.2 manifest. No installation command was run for this update.
