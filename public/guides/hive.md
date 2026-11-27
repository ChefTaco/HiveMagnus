# Hive: agent guide

> Bash installer and controller for signed, digest-pinned suite releases, with upgrades, backups, restore rehearsals and the Hive Registry.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/hive) · [Release {{hm.suite}}](https://github.com/ChefTaco/hive/releases/tag/v{{hm.suite}}) · [Deployment overview](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/README.md)

## When to use Hive

Choose Hive to plan, install, upgrade and recover a tested combination of independent Hive:Magnus products. `hive.sh` verifies a signed release manifest, renders per-host Compose projects from digest-pinned images, and records what it did. Hive plans, applies and recovers; each product keeps its own data, credentials and recovery lifecycle. The controller needs only Bash, jq, OpenSSL and Docker Compose; no Node.js runtime.

| Profile | Adds |
| --- | --- |
| `core` | Oathweave, Emberpath, HiveMem, HiveSkills, HiveXUI, the HTTPS ingress and the Hive Registry, with their private Redis and Qdrant stores |
| `full` | Core plus Magnus, Cindertrace and ChatterMost, each with its own private PostgreSQL, and the optional Emberfold HTTP service |
| `custom` | Oathweave, HiveXUI, the ingress and the Hive Registry, plus the products you select |

Embermend is an explicit optional selection requiring compatible Magnus; see [its guide](https://hivemagnus.com/guides/embermend.md). No profile selects the Magnus web terminal gateway or [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md); every release offers the gateway, and interactive setup suggests Studio with the full profile. Selecting Magnus does not install a host agent: the guided setup offers one after installation, and `hive.sh magnus-agent install` installs it separately. [Ardent](https://hivemagnus.com/guides/ardent.md) is not a suite container: the Magnus host agent stages the Ardent package its signed dependency lock pins, and Magnus installs and manages it on the host; `hive.sh ardent setup` creates a first assistant profile through Magnus.

## Reviewed release: {{hm.suite}}

The release reviewed for the product details below is [Hive {{hm.suite}}](https://github.com/ChefTaco/hive/releases/tag/v{{hm.suite}}). Its tag `v{{hm.suite}}` holds the signed manifest `releases/{{hm.suite}}.json`, its detached Ed25519 signature `releases/{{hm.suite}}.json.sig` and the publisher key `trust/publisher.pub`; the same three files are attached to the release. The manifest pins every product, datastore and initialization image by multi-architecture digest (linux/amd64 and linux/arm64), and pins the controller source with `controllerSHA256`.

| Product | Version in {{hm.suite}} |
| --- | --- |
| Oathweave | {{hm.version:oathweave}} |
| Emberpath | {{hm.version:emberpath}} |
| HiveMem | {{hm.version:hivemem}} |
| HiveSkills | {{hm.version:hiveskills}} |
| HiveXUI | {{hm.version:hivexui}} |
| Embermend and its worker (optional) | {{hm.version:embermend}} |
| Magnus server and fleet gateway | {{hm.version:magnus}} |
| Magnus host agent `@hivemagnus/magnus-agent` | {{hm.version:magnus-agent}}, with its npm integrity (`components.magnus.agentPackage`) |
| Ardent, staged by the Magnus host agent | {{hm.version:ardent}} |
| Cindertrace, with its optional managed collector | {{hm.version:cindertrace}} |
| ChatterMost and its migrator | {{hm.version:chattermost}} |
| Emberfold HTTP service | {{hm.version:emberfold}} |
| Ardent Project Studio | {{hm.version:ardentstudio}} |
| Hive Registry | {{hm.version:hive-registry}} |
| Hive Ingress | {{hm.version:ingress}} |

The release notes list every image digest, including the private PostgreSQL 17.12 and 18.7 (`hive-postgres` 17.12-3 and 18.7-3 with Zstandard 1.6.0), Redis 8.2.10 (`hive-redis` 8.2.10-3 with OpenSSL 3.5.9-r2) and Qdrant 1.18.3 stores, selected by the datastore profile `runtime-2026-11-pg1712-zstd-openssl`. Qdrant 1.18.3 still bundles Zstandard 1.5.x, because no Qdrant release ships 1.6.0 yet; only HiveMem reaches it, on the private network.

### What recent releases changed

- **3.15.1** sends every sign-in, and every re-authentication before a sensitive action such as an upgrade or a credential change, through Oathweave's own sign-in page in the browser, so accounts with MFA or only a passkey can re-authenticate too, and no product handles a password: Emberpath's password relay to Oathweave is retired. It pins Oathweave 2.7.0 (OpenID Connect `prompt=login` and `max_age`, and re-authentication with a passkey alone, `IAM_PASSWORDLESS_PASSKEYS`, on by default), Emberpath 2.10.0 (with `HIVE_ROUTER_AUTH_MODE=iam-oidc`, `POST /api/emberpath/auth/login` and `/api/emberpath/auth/reauthenticate` answer `410 PASSWORD_RELAY_DISABLED`, and sensitive changes take a step-up with a fresh Oathweave ID token; OS mode keeps its PAM sign-in) and HiveXUI 0.14.0 (passkey sign-in and re-authentication through Oathweave, no Emberpath password form), which work only together, with a new controller (`controllerSHA256` `6a76d18ad78d3ef029355b871a8e1bedde097cf58b2fdfb3defbdd110f90870b`). Every other pin, the datastore profile and the Hive Registry are those of 3.15.0. None of the three changes a data format, so an upgrade from 3.15.0 needs no `--allow-migrations` and a code-only rollback to 3.15.0 is allowed. Run `./hive.sh post-upgrade` afterwards: it adds the browser sign-in settings that an installation moved with `migrate-native`, extended with `add` or edited by hand may lack, and `EMBERPATH_PASSWORD_RELAY=false`; `./hive.sh console-clients check` previews this and only reads. A script that signs in to Emberpath with an Oathweave password stops working; use an Oathweave token or an Emberpath client key. See [Upgrade](#upgrade) and [Suite 3.15.1](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3151-browser-sign-in-on-every-installation-no-password-relay).
- **3.15.0** is a product security round. It pins Oathweave 2.6.0, Emberpath 2.9.0, HiveMem 1.12.0, HiveSkills 1.11.1, HiveXUI 0.13.0, Cindertrace 0.10.0 (and its collector), ChatterMost 0.10.0, Emberfold 0.5.0, Ardent Project Studio 0.7.0, Embermend 0.6.1, Magnus 3.4.1 for the server, the fleet gateway and the host agent package (its agent stages Ardent 3.5.1) and the Hive Registry 1.6.0 (image 2.0.14, which advertises Cindertrace's `audit.v1` export), selects the datastore profile `runtime-2026-11-pg1712-zstd-openssl` (`hive-redis` 8.2.10-3, OpenSSL 3.5.9-r2 for CVE-2026-124709) and has a new controller (`controllerSHA256` `f6074852e0cfc437828cbc43b7e25120735b5bf99493ac49fddb92273797c945`); the ingress image and the storage recovery profile are those of 3.14.3. Every upgrade to 3.15.0 needs `--allow-migrations`: Oathweave 2.6.0 moves to `oathweave-managed-format-2` (five SQLite migrations, one dropping the legacy encrypted password column) and HiveSkills to `hiveskills-managed-format-5`, and on a full installation Cindertrace, Embermend and Magnus apply additive migrations and Ardent Project Studio its one-way migrations 11 and 12. No earlier Oathweave reads the migrated store, so the way back is the pre-upgrade backup. ChatterMost 0.10.0 starts enforcing channel retention limits about a minute after it starts, deleting older posts permanently, and removes old orphan uploads; list the affected channels first. Upgrade the Magnus host agents before the server, because a 3.4.1 server refuses file pushes to an older agent. See [Upgrade](#upgrade) and [Suite 3.15.0](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3150-product-security-round).
- **Before 3.15.0**: every release is in the Hive [changelog](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md); the upgrade flags each needs are under [Upgrade](#upgrade). The [compatibility matrix](https://hivemagnus.com/compatibility.md) lists what each release pins; never install the unpublished 3.12.8, 3.2.1 or 3.0.1 tags. This guide's earlier summaries, 3.8.0 to 3.14.3, are kept in the [hive release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/hive.md#earlier-release-summaries).

Suite audit collection by Cindertrace is prepared in the controller but stays off in {{hm.suite}}. Every release is described in the [changelog](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/CHANGELOG.md) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md).

Since 3.0.0 the suite runs maintained system libraries and patched embedded SQLite, and its PostgreSQL images are rebuilt against new glibc and ICU libraries. An existing PostgreSQL store from 2.x needs an explicit, rehearsed migration to enter that runtime; see [Upgrade](#upgrade). From 2.4.0, guided local setup prepares the host itself with consent, and full-node enrollment adds commands, managed cron and a selected web terminal to the local Magnus host.

A passing disposable rehearsal is not production cutover approval, physical multi-host certification or ARM64 certification. Do not cut over an existing installation based on this guide or on a passing fresh fixture. Later releases are listed on the [releases page](https://github.com/ChefTaco/hive/releases).

## Prerequisites

- A host running Ubuntu 22.04 or 24.04, or Debian 12 or 13, on amd64 or arm64, with sudo, 2 CPUs, 4 GB of memory and 20 GB of free disk. The `full` profile uses about 1 GB of memory when idle and about 6 GB of container images. On other Linux distributions, install Docker Engine with the Compose plugin and the tools `./scripts/install-prerequisites.sh --check` lists yourself.
- A DNS name for the browser address and a certificate and unencrypted key for it, from `tailscale cert`, your own CA or an ACME client.
- The signed services run as UID/GID 1000 (HiveXUI as 101), so run fresh setup as that account (usually the first account on the host) or with sudo.
- No model runtime: inference stays external.

## Install

The [installation guide](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/QUICKSTART.md) covers every step and setup question. On a fresh host:

```bash
git clone https://github.com/ChefTaco/hive.git && cd hive
./hive.sh --release latest
```

Expected result: the launcher resolves GitHub’s latest published, non-prerelease suite release once, prints its exact version, verifies it and starts guided setup. For a fresh local installation, setup offers to install Docker Engine and the required tools, using sudo only after showing its changes and asking for consent; the new `docker` group membership takes effect in a child shell, so no logout is needed. It then offers to create the installation directory. If Tailscale is already signed in with HTTPS Certificates enabled, setup suggests this host's HTTPS name and can obtain its certificate. Every offer can be declined.

To choose this release explicitly, as its release notes show:

```bash
git clone --branch v{{hm.suite}} https://github.com/ChefTaco/hive.git hive && cd hive
./hive.sh --release {{hm.suite}}
```

Failed lookups stop setup instead of falling back to an older release. An already-matching local checkout stays in use. Otherwise the launcher retains the tagged controller under `${XDG_DATA_HOME:-$HOME/.local/share}/hive/releases/` and prints its path. After setup, change to that retained checkout for the lifecycle and certificate commands below, and keep it while a renewal timer uses it. Return to the original launcher checkout when selecting a new release with `--release latest`.

The launcher checks the manifest signature against its original publisher key and verifies the signed controller source digest before executing it. It refuses changed release checkouts or a different key. For example, {{hm.suite}} verifies `releases/{{hm.suite}}.json` against its signature with `trust/publisher.pub`, then asks for the installation name, directory, host, browser address (the HTTPS origin), profile, bind address and certificate files (from 3.12.4, `tailscale` as the bind address selects the detected tailnet address, and a port in the HTTPS origin becomes the listener default), and, with Magnus, an optional port for host agents. It never asks for a password on the command line. It shows a plan, applies it after you confirm, and ends with the HTTPS origin, the initial sign-in file and the next commands. After installation it offers the certificate renewal timer and, when an agent port was selected, the Magnus host agent, full-node enrollment and then a first Ardent assistant. The steps that still need a person are recorded as a setup checklist: `./hive.sh status` and `./hive.sh setup` list the pending ones, `./hive.sh setup done ID` or `setup skip ID` settles one, and HiveXUI shows the list to administrators. If setup stops after writing its configuration, running it again offers to continue with that file.

### Manual host preparation

Existing configuration files, unattended commands and remote hosts keep explicit prerequisite and certificate management:

```bash
sudo ./scripts/install-prerequisites.sh --directory /opt/hive
# log out and back in for the docker group, then:
./scripts/install-prerequisites.sh --check
sudo ./scripts/console-certificate.sh tailscale
```

Expected result: `install-prerequisites.sh` shows its plan and asks before changing anything. It installs Docker Engine and the Compose plugin from Docker's apt repository after checking its signing key, plus jq, OpenSSL, curl, git, iproute2 and the other tools `hive.sh` uses, adds you to the `docker` group and creates `/opt/hive`; `--check` then prints `Ready`. From 3.14.1, while another package manager, such as the unattended upgrades of a freshly booted machine, holds apt's lock, it says that it is waiting and waits up to 10 minutes instead of failing. `console-certificate.sh tailscale` writes `/etc/hive/tls/console.crt` and `console.key` for the host's MagicDNS name, owned by you. With your own certificate, check it instead with `./scripts/console-certificate.sh check --cert FILE --key FILE --name NAME`. Hive runs no ACME client itself.

To install from separately downloaded files instead, pass `--manifest`, `--signature` and `--trust-key`, still from the same tag's checkout. First check the key's fingerprint. The fingerprint is the SHA-256 of the DER public key:

```bash
openssl pkey -pubin -in trust/publisher.pub -outform DER | sha256sum
```

It must print this publisher-key fingerprint, the same value as in the Hive [README](https://github.com/ChefTaco/hive#security) and the [release notes](https://github.com/ChefTaco/hive/releases/tag/v{{hm.suite}}):

```text
c0d0665a70969f37c8f1cffbdcf8e54df13626f8dbd4b5759a7c44843d86d1b2
```

This page is published from a separate repository, so it is an independent place to compare against. If the values differ, stop and do not install. A rotated key ships with a statement signed by the key it replaces, and this guide is updated when that happens; see [rotating the key](https://github.com/ChefTaco/hive/blob/main/docs/RELEASING.md#rotating-the-key).

### Repeatable plans

For retries and for planning then applying, use the same exact release setup reported; do not resolve `latest` separately between the two steps. To prepare configuration separately or run unattended, supply the same installation JSON ([example](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/examples/installation.json), [schema](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/examples/installation.schema.json)). Interactive setup writes it to a protected configuration directory outside the checkout, by default `~/.config/hive/ID/installation.json`:

```bash
./hive.sh plan --config installation.json --release {{hm.suite}}
./hive.sh install --config installation.json --release {{hm.suite}} --non-interactive --yes
./hive.sh status --config installation.json
./hive.sh doctor --config installation.json
```

Planning does not contact hosts. Per-product secrets, initial identities and internal transport keys are generated once into protected files, and retries check the exact inputs. Existing data, configuration, model resources and Compose projects are never silently adopted or overwritten. `./hive.sh --help` lists the lifecycle commands, including `init`, `upgrade`, `post-upgrade`, `setup`, `rollback`, `backup`, `backups`, `adopt`, `restore`, `rehearse`, `admin-access`, `ardent` and `migrate-native`. Commands other than `install`, `init` and `plan` find the installation file themselves when `~/.config/hive` holds exactly one.

For hosts beyond one, read the [distributed](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/DISTRIBUTED.md), [full](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md) and [custom](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/CUSTOM.md) guides.

## Sign in to HiveXUI

Visit the HTTPS origin you configured and sign in on Oathweave's own sign-in page, with your password and authenticator code or with a passkey. From 3.15.1 every sign-in, and every re-authentication before a sensitive action such as an upgrade or a credential change, goes through that page in the browser, so MFA and passkey-only accounts work everywhere and no product sees a password; Emberpath's password relay is retired (see the [Emberpath guide](https://hivemagnus.com/guides/emberpath.md#signing-in-and-re-authentication)). [HiveXUI](https://hivemagnus.com/guides/hivexui.md) is the browser UI for every installed product, and shows sections only for products in this installation.

On a fresh installation, the initial username and password are in `config/initial-credentials.env` in the installation directory on the identity host, for example `/opt/hive/config/initial-credentials.env`; read them privately and leave the file in place. Add a passkey or authenticator app under **Oathweave > Account security**.

Keep the initial operator for recovery and work as your own administrator. Create it in **Oathweave > Users** with **IAM Administrator** as its initial role, then give it access to the installed products:

```bash
./hive.sh admin-access setup --release {{hm.suite}}
```

Expected result: it lists the active administrators to choose from (`admin-access list` shows them), shows the products the account will administer, asks for sudo when needed, adds the Suite Administrator role, creates separate product accounts with reviewed grants, reconnects only the affected services and records `first-admin` and `administrator-product-access` as done in the setup checklist. Existing accounts and service identities are preserved; conflicting, locked or disabled accounts are refused. `admin-access setup NAME` selects an account by name, `--yes` confirms an unattended run after review, and `admin-access status NAME` reads the retained operation; after an interruption, repeat the same command. Sign out of HiveXUI and sign in with your own account, then take and rehearse a fresh backup. An external Magnus needs its own installation owner. See [administrator product access](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/QUICKSTART.md#administrator-product-access).

The installer copies the certificate into the ingress. After renewing it, run `./hive.sh tls-refresh --config FILE`; `sudo ./scripts/console-certificate.sh schedule --config FILE` does this weekly for a Tailscale certificate, and successful upgrades refresh an existing renewal service to the new checkout. Back up with `./hive.sh backup --config FILE --archive NAME --yes`, which keeps the suite serving; each application pauses only briefly, however much data it holds. See [backups](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/BACKUPS.md). Each upgrade keeps a backup and a restored rehearsal copy: on a single-host installation, `./hive.sh backups schedule enable --config FILE --at HH:MM` prunes old pairs every day with the [retention rules](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/BACKUPS.md#daily-pruning), and `./hive.sh backups schedule status --config FILE` shows the crontab line and the last run.

An installation migrated with `hive.sh migrate-native` keeps its accounts, roles and password hashes instead, and the owner sets a new administrator password once with a one-use reset token. Cutover writes the token to the configured `adminAccount.tokenFile` on the controller, mode 0600; it expires after 24 hours. On the host, run the installation's `bin/hive-set-admin-password` with `sudo`, or `hive.sh migrate-native set-admin-password --config FILE` from the controller. It prompts for the token and the new password without echo; neither can be a command-line argument. Then sign in and delete the token file. See [first sign-in](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/MIGRATE_NATIVE.md#first-sign-in).

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
- from a release before 3.12.0, when HiveMem has data owned by `hive-router` (an installation migrated from the native Hive Router), which HiveMem 1.9.0's signed initialization moves to `emberpath` before re-linking the memory credential;
- from any release before 3.14.0, for every installation, because Emberpath 2.6.0 moves its router data from `emberpath-managed-format-2` to `emberpath-managed-format-3` (six nullable `Trace` columns and two indexes, additive and fast). Without the flag the upgrade stops before any service is stopped. The transition is declared from `managed-format-2` only, so an installation still on `emberpath-v1` (a release before 3.4.0) upgrades to a release from 3.4.0 to 3.13.5 first;
- from a release before 3.14.2, when the installation runs a suite-managed Magnus (the full profile), for Magnus 3.3.4's fast additive migration `20261124190000_ardent_agent_operation_definition_kind`. An installation without Magnus, or with an external Magnus, which is upgraded on its own host, needs none for it;
- from any release before 3.15.0, for every installation, because Oathweave 2.6.0 moves its store to `oathweave-managed-format-2` and HiveSkills 1.11.1 to `hiveskills-managed-format-5`; on a full installation Cindertrace 0.10.0, Embermend 0.6.1 and Magnus 3.4.1 also apply additive migrations and Ardent Project Studio 0.7.0 its one-way migrations 11 and 12. No earlier Oathweave reads the migrated store, so a code-only rollback from 3.15.0 or later to 3.14.x is refused; the way back is the verified pre-upgrade backup.

An upgrade from 3.7.x without Magnus, or with an external Magnus, needs none, and neither does one from 3.8.0 to 3.8.1 or from 3.8.1 to any later release up to 3.13.5 (for example 3.9.7 to 3.9.8, 3.10.0 to 3.11.0, 3.11.0 to 3.11.1, 3.11.1 to 3.11.2, 3.12.0 to 3.12.1 or 3.12.1 to 3.12.2, 3.12.2 to 3.12.3, 3.12.3 to 3.12.4, 3.12.4 to 3.12.5, 3.12.5 to 3.12.6, 3.12.6 to 3.12.7, 3.12.7 to 3.12.9, 3.12.9 to 3.13.0, 3.13.0 to 3.13.1, 3.13.1 to 3.13.2, 3.13.2 to 3.13.3, 3.13.3 to 3.13.4 or 3.13.4 to 3.13.5), nor one from 3.14.0 to 3.14.1, nor one from 3.14.1 to 3.14.2 without a suite-managed Magnus, nor one from 3.14.2 to 3.14.3, nor one from 3.15.0 to 3.15.1, except an upgrade to 3.12.0 or later where HiveMem has data owned by `hive-router`, as listed above. Magnus 3 upgrades from Magnus 2.10.2 only, so an installation that runs Magnus on a release before 3.8.1 upgrades to 3.8.1 first, then to {{hm.suite}}. Before it changes anything, `hive.sh upgrade` checks a suite-managed Magnus as Magnus 3's start-up guard will and refuses, naming the blockers, while a node has no active key or its agent does not sign its evidence.

```bash
./hive.sh plan --config installation.json --release {{hm.suite}} --allow-migrations
./hive.sh upgrade --config installation.json --release {{hm.suite}} --allow-migrations
```

The installer takes a verified pre-change backup, rehearses the new runtime and migration on a disposable copy, then migrates the stopped live stores and rebuilds their indexes before activation. Credentials, ownership, PostgreSQL majors, application records and component selection are retained. HiveXUI is unavailable while services and stores are stopped or migrated; the duration depends on the data and index rebuilds. A core installation has no PostgreSQL store to migrate, and moving between releases with unchanged datastore formats does not repeat a migration.

**Code-only rollback across the 3.0.0 PostgreSQL boundary is refused.** `./hive.sh rollback` can still return to a compatible storage format, but recovery from the PostgreSQL collation change requires the verified original-state backup, rehearsed with the retained original controller and images, and reconciliation of later writes; it must not discard them. A failed or uncertain live migration holds the transaction for recovery: repeat exactly the same command rather than editing transaction or runtime receipts. Read the release notes, [advisory remediation](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/docs/ADVISORY_REMEDIATION.md#postgresql-needs-a-separate-migration-proof), the [upgrade procedure](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/QUICKSTART.md#8-upgrade) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md) first.

From 3.12.3, every container the controller creates rotates its Docker log (`json-file`, 10 MB per file, 3 files). The setting is part of the rendered Compose file, so the first upgrade to 3.12.3 recreates every container on each host, datastores and unchanged images included. Data is kept, but the log of each replaced container is removed with it: save what you need first, for example with `docker compose -f INSTALL_DIR/compose.json logs --no-color`. To use other bounds, set `containerLogs` (for example `{"maxSize":"50m","maxFiles":5}`) in the installation file before the upgrade. Controllers before 3.12.3 refuse that key, so remove it before rolling back to 3.12.2. See [Suite 3.12.3](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3123-bounded-container-logs-and-security-updates).

From 3.13.0, HiveXUI's **Installed software** page reads the Hive Registry's inventory with the browser client `hivexui-registry`, which an existing installation gets in two steps. Before any `plan`, `rehearse` or `upgrade` from 3.12.x to 3.13.0 or later, merge `"hivexui-registry":{"audience":"hive-registry","permissions":["registry:inventory"]}` into the JSON of `IAM_BROWSER_CLIENT_POLICIES` in `config/oathweave.env`, keeping every existing key, so the upgrade starts Oathweave with it. A rehearsal or upgrade pins the deployment inputs of its plan, so an edit after one of them makes that plan refuse ("Deployment input artifacts changed for this plan") until the installation has a new `configurationRevision`. After the upgrade, run `./hive.sh console-clients add` (or `./hive.sh post-upgrade` where it runs it), sign out of HiveXUI and in again, and run `./hive.sh status` once so the registry records what the hosts run. Without the policy, `console-clients add` skips the registry client and names it; the other clients are unaffected. A rollback to 3.12.9 keeps the new registry files, which that registry ignores, but stops with the same message until you set a new `configurationRevision` in `installation.json` and run it from the retained 3.12.9 checkout. See [Hive Registry inventory](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#hive-registry-inventory) and [Suite 3.13.0](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3130-hive-registry-141-and-the-installed-software-view).

From 3.14.0, the upgrade's pre-change backup is also the way back. The installer runs `emberpath migrate` on the restored copy, then once on the stopped live store, and a code-only `rollback` from 3.14.0 is refused because no earlier release reads `emberpath-managed-format-3`; recover with the verified pre-upgrade backup. Ardent Project Studio 0.5.1 runs its migrations 7 to 10 on its first start: they are additive and keep existing rows, but Studio 0.4.x no longer starts on a database they have run on, so keep the backup until you have checked Studio on 0.5.1. A fresh Studio gets `ARDENT_STUDIO_INSTANCE_ID` set to the installation ID, so its execution references name the installation; an existing Studio keeps `local`, and to change that, add the line to `config/ardentstudio.env` before you run `plan`. Ardent 3.2.0 resumes interrupted tasks after a restart by default (`execution.recovery.enabled: false` in the profile's Ardent configuration restores the earlier behaviour). Release any extension package that pins an exact `@hivemagnus/ardent` peer for 3.2.0 before Magnus moves the agents, because a managed upgrade holds the runtime when a peer differs; until a profile moves to Ardent 3.2.0, its recovery, lineage and artifact reads answer `409 unsupported_capability`. Magnus 3.3.0 adds no migration and the optional settings `MAGNUS_HIVE_REGISTRY_URL` and `MAGNUS_HIVE_REGISTRY_TOKEN_FILE`, which the suite does not set and you do not need. See [Suite 3.14.0](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3140-ardent-execution-recovery-lineage-and-artifact-transfer-v2).

From 3.14.1, on an installation coming from 3.14.0 whose host agent owns an Ardent 3.2.0 profile (guided Ardent setup creates one), upgrade the host agent before the suite. With Magnus 3.3.0, a native backup or upgrade captured such a profile and then held, leaving it stopped; from Magnus 3.3.3 the agent's native snapshot knows the Ardent 3.2.0 tables and resumes it. Run `./hive.sh magnus-agent install --release {{hm.suite}}`, then upgrade the suite. A fresh 3.14.1 installation's Magnus gets `MAGNUS_ARDENT_EMBERPATH_URL=<console origin>/v1`, the model route agents reach from their hosts, which New Agent writes into an agent that uses an Emberpath model alias. An installation set up before 3.14.1 keeps its Magnus environment; to use Emberpath aliases there, add the line to `config/magnus.env` before you run `plan`, so the pre-change backup and the plan include it. Hive's UPGRADING gives this command, with `ID` your installation's ID:

```bash
printf 'MAGNUS_ARDENT_EMBERPATH_URL=%s/v1\n' "$(jq -r .origin ~/.config/hive/ID/installation.json)" >> /opt/hive/config/magnus.env
```

An external Magnus is configured on its own host, as before. See [Suite 3.14.1](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3141-agent-model-route-magnus-333-and-zstandard-160).

From 3.14.2, Magnus 3.3.4's migration makes a suite-managed Magnus need `--allow-migrations`, as listed above; existing rows are unchanged, and a rollback restores the pre-upgrade backup. After the upgrade, `./hive.sh post-upgrade --yes` (or `./hive.sh magnus-agent install`) moves the agents the suite installs to 3.3.5, and fleet agents you installed yourself are upgraded from Magnus as before. Ardent profiles keep running the version they have until you update them in **Magnus > Ardent**; Ardent 3.2.1 changes only the client package, not the runtime. See [Suite 3.14.2](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3142-magnus-335-agent-definitions-and-ardent-321).

From 3.14.3, an upgrade from 3.14.2 needs no migration or new setting. After it, `./hive.sh post-upgrade --yes` with the same installation config moves the Hive-managed host agents to Magnus 3.3.6, whose dependency lock carries the `fast-xml-parser` fixes; update fleet agents you installed yourself from Magnus. See [Suite 3.14.3](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3143-magnus-336-xml-dependency-fixes).

From 3.15.0, read [Suite 3.15.0](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3150-product-security-round) before you run `plan`. Upgrade the Magnus host agents before the server: a Magnus 3.4.1 server refuses file pushes, role applications and library skill deploys to an older agent with `409 AGENT_FILE_WRITE_UNSUPPORTED`, so run `./hive.sh magnus-agent install --release {{hm.suite}}` before the upgrade, or `./hive.sh post-upgrade --yes` straight after it, and update other fleet agents from Magnus; then re-run `sudo magnus-agent install-service` on each node. Ardent profiles keep their version until you update them in **Magnus > Ardent** after their agents run Magnus 3.4.1, because Ardent 3.4.0 and later accept the management token only with the `Bearer` scheme; Ardent 3.4.0 also applies `execution.max_parallel_tasks` above 4, so set 4 to keep the previous concurrency. ChatterMost moves from 0.7.2 to 0.10.0 in one step and then enforces channel retention limits, permanently deleting older posts and files in channels that have one about a minute after it starts; Hive's UPGRADING gives the query that lists them, and `ORPHAN_UPLOAD_GRACE_HOURS=0` in `config/chattermost.env` before the `plan` keeps old unreferenced uploads. Add `IAM_PUBLIC_URL` before the `plan`, or Oathweave's native OIDC discovery answers 503, and review group role assignments, which now reach tokens. An external Magnus whose `IAM_CORE_URL` is plain HTTP to a host other than loopback refuses to start; switch it to HTTPS first. After the upgrade, redeploy the HiveSkills Hermes bridge (`scripts/deploy-hermes-agent.sh`); once it pins publisher keys it refuses unsigned skill releases.

From 3.15.1, `post-upgrade` runs `./hive.sh console-clients add`, which adds the browser sign-in settings an installation may lack (Oathweave's `IAM_BROWSER_ISSUER`, `IAM_BROWSER_AUTHORIZATION_URL`, `IAM_BROWSER_API_BASE_URL` and the HiveXUI client policies in `IAM_BROWSER_CLIENT_POLICIES`, and `EMBERPATH_PASSWORD_RELAY=false` for Emberpath), keeps every key you set, copies each changed file to `config/.browser-signin/` and recreates Oathweave and Emberpath when their environment changed. Preview it with the new controller before the upgrade; it only reads:

```bash
./hive.sh console-clients check --config ~/.config/hive/ID/installation.json --release {{hm.suite}}
```

Resolve every `Needs attention` line first. After `post-upgrade`, a `Kept on HOST` line for `EMBERPATH_PASSWORD_RELAY=true` keeps the relay on: remove that line and run `post-upgrade` again, then sign out of HiveXUI and in again. A code-only rollback to 3.15.0 is allowed, but first set a new `configurationRevision` in `installation.json`, because `post-upgrade` changed environment files that 3.15.0's plan pinned. See [Suite 3.15.1](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md#suite-3151-browser-sign-in-on-every-installation-no-password-relay) and [browser sign-in settings](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#browser-sign-in-settings).

After upgrading, switch to the retained checkout the launcher printed and finish the remaining steps. `post-upgrade` shows and confirms each change: it updates Magnus host agents older than the release (unattended, only with `--yes`), adds missing HiveXUI browser clients to Oathweave, marks the setup checklist items it completes as done, and lists what is left. A successful interactive upgrade also offers `admin-access setup`; after an unattended one, run it when ready:

```bash
./hive.sh post-upgrade --config installation.json --release {{hm.suite}}
./hive.sh magnus-agent install --config installation.json --release {{hm.suite}}
```

`magnus-agent install` is the same scope-preserving package maintenance path run on its own: it upgrades the agent and stages the verified Ardent package while keeping its enrollment scope, node identity, profiles and completed history; from 3.13.5, on the Magnus host it also records the `magnus-agent-enrolled` checklist item once the pinned agent runs and Magnus has accepted its heartbeat. Full-node enrollment remains a separate explicit operation. An updated agent is not re-enrolled for a node key either: with Magnus 2.10 it binds its own key automatically, and with Magnus 3 an agent that has a key keeps it while one without a key is enrolled with a one-time token. Agents that Magnus manages cross from 2.10.2 to 3.x by way of 2.10.3, with `magnus-server agents upgrade --to 2.10.3` and then `--to {{hm.version:magnus-agent}} --allow-major` (or **Allow major upgrade** in HiveXUI), and move from an earlier 3.x with `--to {{hm.version:magnus-agent}}` within the major, each after a `--dry-run`; see the [Magnus guide](https://hivemagnus.com/guides/magnus.md#upgrade-to-301). Then, in **Magnus > Ardent > Installations** in HiveXUI, stop running profiles, choose **Update package** and start them again. From 3.9.1 `./hive.sh post-upgrade` asks Magnus, read only, which installations are behind the Ardent version their node agent stages, names them, and records `ardent-packages-updated` as done once none is; with an external Magnus it asks through Ardent Project Studio's service identity, so without Studio record it with `./hive.sh setup done ardent-packages-updated`.

## Fleet hosts and security events

With Magnus and a port for host agents, one command installs the Magnus agent on the Magnus host, or with `--host` on another fleet host, and waits for Magnus to accept its first heartbeat. Without a suitable Node.js it offers to install Node.js 24 from NodeSource's signed apt repository (`--install-node` agrees unattended); from 3.14.1 it waits up to 10 minutes for apt's lock when another package manager holds it. It installs exactly the agent version the release pins, after checking the package's integrity, never prints the node credentials, and stages the pinned Ardent package without installing or starting a runtime. With Magnus 2.10 it gives a new agent its own node key through a one-time enrollment token that is never printed or passed on a command line (with Magnus 3, every agent without a key, and it copies no fleet-wide node secret to agents), and ends with the key fingerprint to compare with Magnus's notification; `magnus-agent status` includes the node key state. On an installer-owned single host, `magnus-agent enroll` then reviews and enables full node capabilities: commands, managed cron and a selected restricted web terminal. A fresh Cindertrace ingests nothing until a collector exists; `cindertrace-collector add` generates a collector's credential into an owner-only file on the Cindertrace host and never prints it.

```bash
./hive.sh magnus-agent install --config installation.json
./hive.sh magnus-agent enroll --config installation.json
./hive.sh magnus-agent status --config installation.json
./hive.sh cindertrace-collector add edge --sources tailscale --config installation.json
./hive.sh cindertrace-collector list --config installation.json
```

With Magnus, HiveMem and Oathweave and an enrolled host agent, `ardent setup` installs the staged Ardent package and creates the `assistant` profile through Magnus's **New Agent** workflow. It asks for an OpenAI-compatible model API URL (including `/v1`) and the model name, configures HiveMem, starts the profile and makes a real model request before reporting success. It accepts only model endpoints that need no separate API key. Existing profiles are preserved, and repeating it follows its retained operation instead of creating another profile; a failed operation is resumed only explicitly, after review. Magnus-created profiles are included in native suite backups, so do not add them to the installation file's `agents`. From 3.14.0, setup waits up to 60 seconds for Magnus to release the install command's node owner before it creates the profile, and a create refused before any request was sent drops its receipt and says so, so `./hive.sh ardent setup` can simply run again; an ambiguous refusal still keeps the receipt and repeats nothing.

```bash
./hive.sh ardent setup --config installation.json
./hive.sh ardent status --profile assistant --config installation.json
./hive.sh ardent check --profile assistant --config installation.json
```

From 3.14.0, `doctor` and `ardent status` also list the [agent dependencies](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#agent-dependencies) Magnus resolved for Ardent (`GET /api/v1/ardent/dependencies`, Magnus 3.3.0 or later): HiveMem, HiveSkills and Emberpath, each with its status (`usable`, `missing`, `unsupported` or `awaiting_configuration`), its source (`override`, `registry` or `none`) and, when it is not usable, why; `ardent status` adds the report to its JSON as `dependencies`. A Magnus before 3.3.0 prints `Magnus is too old to report agent dependencies (needs 3.3.0)`, and neither command fails because of the report. The suite configures HiveMem, HiveSkills and, from 3.14.1, Emberpath for a suite-managed Magnus explicitly, so they report `source: override`; Emberpath's address is `MAGNUS_ARDENT_EMBERPATH_URL=<console origin>/v1`, the model route agents reach from their own hosts. An installation set up before 3.14.1 keeps its Magnus environment and adds that line by hand, as described under [Upgrade](#upgrade). The suite does not set Magnus's Registry discovery (`MAGNUS_HIVE_REGISTRY_URL` and `MAGNUS_HIVE_REGISTRY_TOKEN_FILE`), because the Registry's internal endpoints are private-network addresses that agents on fleet hosts cannot reach. From Magnus 3.3.1 the report checks Emberpath at its model API (`GET <endpoint>/models`), so a console whose root health belongs to another service no longer makes Emberpath look usable. A resolved dependency is only available: HiveMem enrollment, skill installation and channel enablement keep their own steps and credentials.

See the [setup checklist](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#setup-checklist), [creating an Ardent assistant](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#create-an-ardent-assistant), [Magnus host agents](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#magnus-host-agents), [Ardent Project Studio](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#ardent-project-studio), [sending security events](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#sending-security-events-to-cindertrace), [events from a separate logging host](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#events-from-a-separate-logging-host) and [adding a product to an existing installation](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/FULL.md#adding-a-product-to-an-existing-installation).

## Hive Registry

Every installation runs a Hive Registry: its install catalog and lookup API, a small SQLite container on the host serving HiveXUI. It is mandatory, one per installation, and unrelated to [HiveSkills](https://hivemagnus.com/guides/hiveskills.md), the skills registry. It holds the products the signed release offers, what this installation actually runs, the links an operator or client needs, the setup checklist, each product's announced capabilities such as its event feed, and an append-only history. It has no HiveXUI section of its own; HiveXUI reads it to decide which sections to show and for its Setup page.

```bash
./hive.sh registry list --config installation.json
./hive.sh registry get emberpath --config installation.json
```

`list` also has `installed`, `summary` and `history` forms. `hive.sh` is the normal writer; `registry add`, `update` and `remove` cover externally managed products only, and any credential in an entry is refused. The ingress passes only explicit `GET` routes under `/api/registry/`, so writes never leave the private network. `status` reports drift by name and `doctor` fails on any drift. See the [API reference](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/docs/hive-registry-api.md).

From 3.13.0 (Hive Registry 1.4.1), the registry also serves administrators an [inventory](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/docs/hive-registry-api.md#inventory), `GET /v1/inventory`, announced with the `inventory.v1` capability: each product's signed release pin (version and image digest) beside what each host reports it runs (the configured and local image, whether they match, state and health). HiveXUI's **Installed software** page shows it. It accepts the shared credentials, or an Oathweave token for the `hive-registry` audience with `registry:inventory`, which `SUITE_ADMIN` holds through the `hivexui-registry` client; every other route refuses such a token. `hive.sh status`, `doctor` and completed `install`, `upgrade`, `rollback` and `adopt` commands record what they observe (`PUT /v1/observations`), best effort, so the page shows the state as of the last of them. The inventory carries no origin, internal endpoint or credential, and the storage format is unchanged.

From 3.14.0 (Hive Registry 1.5.0, image 2.0.13), a product's connection read with a credential (`GET /v1/products/{id}/connection`) also carries [service capabilities](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/docs/hive-registry-api.md#service-capabilities), `serviceCapabilities`, beside `internalEndpoints`: what the product offers other products, each with the first version offering it. The suite catalog declares Emberpath `emberpath.execution-trace.v1` and `retry-signal.v1` (2.6.0), HiveMem `memory.v1` (1.9.1), HiveSkills `skills.pinned-release.v1` (1.9.0) and Magnus `ardent.recovery.v1`, `ardent.lineage.v1` and `artifact-transfer.v2` (3.3.0), and `hive.sh` records them with each connection. An entry is `confirmed: true` only once the product is recorded as running that version; while it is still activating, or when the registry cannot tell the version (an external Magnus), it is `confirmed: false`, and the reader compares `since` with the version the product reports. `?capability=NAME` narrows a connection to that entry (`404 capability_not_offered` otherwise), and `GET /v1/products?capability=NAME` lists the products offering it. A capability makes an endpoint available and never grants a permission. The public views and the browser contract are unchanged.

From 3.15.0 (Hive Registry 1.6.0, image 2.0.14, browser contract 5), the registry also advertises the browser [capability](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/docs/hive-registry-api.md#capabilities) `audit.v1` for Cindertrace 0.10.0: its own audit as HiveAuditRecord v1 pages at `/api/cindertrace/audit/export` in the browser, with its normal user authentication. Suite audit collection, where Cindertrace pulls the other products' audit exports, stays off.

## External inference

Ollama, llama.cpp, other inference services and hosted APIs are external dependencies. Hive only verifies connectivity, model discovery, generation and streaming, then registers verified providers with Emberpath. It never installs or manages inference services, model downloads, storage, licenses or GPUs. See [external inference](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/INFERENCE.md).

## Existing installations

A native installation, with Router, IAM, HiveMem and, where installed, Skills running as systemd services, moves onto the suite on the same host and ports with `hive.sh migrate-native`. It keeps every native port, certificate, issuer, key and account. Read [migrating a native installation](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/MIGRATE_NATIVE.md) before any separately approved maintenance window. `adopt` takes over existing Compose stacks only.

The npm launcher `@hivemagnus/hive` and the other 1.x npm packages are the legacy line. The suite products supersede them; 1.2.2 was the final legacy npm release and its archived source remains at that tag. Installations the launcher manages follow [UPGRADING](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/UPGRADING.md). To bring one under the controller, rehearse its own backups and read [existing-data rehearsals](https://github.com/ChefTaco/hive/blob/v{{hm.suite}}/deployment/EXISTING_DATA_REHEARSALS.md) first. Preserve each installation's state.

## Source review

Reviewed 2026-11-14 against tag `v3.8.0`, commit `2fe6f690556ff75d47b76301eb6cc8e5c25a4a91`: [README](https://github.com/ChefTaco/hive/blob/v3.8.0/README.md), [deployment overview](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/README.md), [installation guide](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/QUICKSTART.md), [full profile](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/FULL.md), [native migration](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/MIGRATE_NATIVE.md), [backups](https://github.com/ChefTaco/hive/blob/v3.8.0/deployment/BACKUPS.md), [upgrading](https://github.com/ChefTaco/hive/blob/v3.8.0/UPGRADING.md), [advisory remediation](https://github.com/ChefTaco/hive/blob/v3.8.0/docs/ADVISORY_REMEDIATION.md), [releasing](https://github.com/ChefTaco/hive/blob/v3.8.0/docs/RELEASING.md), [Hive Registry API](https://github.com/ChefTaco/hive/blob/v3.8.0/docs/hive-registry-api.md), [release launcher](https://github.com/ChefTaco/hive/blob/v3.8.0/scripts/suite/release-launcher.sh), the [changelog](https://github.com/ChefTaco/hive/blob/v3.8.0/CHANGELOG.md) entries for 3.0.0 to 3.8.0, `releases/3.8.0.json` and the `hive.sh --help` text. No installation command was run for this review. Release notes: [3.8.0](https://github.com/ChefTaco/hive/releases/tag/v3.8.0). The default command clones the launcher and uses `--release latest`; exact versions remain supported. Follow current docs for later releases. License: Apache-2.0.

Release update, 2026-11-27: [Hive 3.15.1](https://github.com/ChefTaco/hive/releases/tag/v3.15.1), tag `v3.15.1`, commit `ac79185031440e1b76f5c62d4c8d0f83f19b98b7`, pins Oathweave 2.7.0, Emberpath 2.10.0 and HiveXUI 0.14.0 and keeps every other pin, the datastore profile and the Hive Registry of [Hive 3.15.0](https://github.com/ChefTaco/hive/releases/tag/v3.15.0), tag `v3.15.0`, commit `4055623fc57b804a27237e5e493bd2985dcd3cd6`, which moved every product except the ingress (Oathweave 2.6.0, Emberpath 2.9.0, HiveMem 1.12.0, HiveSkills 1.11.1, HiveXUI 0.13.0, Cindertrace 0.10.0, ChatterMost 0.10.0, Emberfold 0.5.0, Ardent Project Studio 0.7.0, Embermend 0.6.1, Magnus 3.4.1 with its agent staging Ardent 3.5.1, and the Hive Registry 1.6.0) and selected the datastore profile `runtime-2026-11-pg1712-zstd-openssl`. The manifests `releases/3.15.1.json` (SHA-256 `6fe2246418e264e535ddb70f2b811381eadd4cbc16a2f76c59f8c57629c6a846`, `controllerSHA256` `6a76d18ad78d3ef029355b871a8e1bedde097cf58b2fdfb3defbdd110f90870b`) and `releases/3.15.0.json` (SHA-256 `3d476bf78884ecb7975795e7724b3175c063e36bd4adf1eab1b0f0ff58b10ef8`, `controllerSHA256` `f6074852e0cfc437828cbc43b7e25120735b5bf99493ac49fddb92273797c945`) verify against `trust/publisher.pub`, unchanged from 3.14.3, and the 3.15.1 release notes give the same publisher-key fingerprint. The datastore sentence, the recent-release summary (the 3.14.x bullets moved to the release records), the browser sign-in paragraph, the `--allow-migrations` list and flagless upgrades, the 3.15.0 and 3.15.1 upgrade notes with the `console-clients check` preview, the Magnus agent upgrade targets and the Registry `audit.v1` paragraph follow the [changelog](https://github.com/ChefTaco/hive/blob/v3.15.1/CHANGELOG.md), [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3151-browser-sign-in-on-every-installation-no-password-relay) (Suite 3.15.1 and Suite 3.15.0), [browser sign-in settings](https://github.com/ChefTaco/hive/blob/v3.15.1/deployment/FULL.md#browser-sign-in-settings), the [Hive Registry API](https://github.com/ChefTaco/hive/blob/v3.15.1/docs/hive-registry-api.md#capabilities) and the release notes of both tags. No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [hive release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/hive.md); what each Hive release changed is in its [changelog](https://github.com/ChefTaco/hive/blob/main/CHANGELOG.md).
