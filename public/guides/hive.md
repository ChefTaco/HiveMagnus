# Hive: agent guide

> Bash installer and controller for signed, digest-pinned suite releases, with upgrades, backups, restore rehearsals and the Hive Registry.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/hive) · [Release 3.1.1](https://github.com/ChefTaco/hive/releases/tag/v3.1.1) · [Deployment overview](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/README.md)

## When to use Hive

Choose Hive to plan, install, upgrade and recover a tested combination of independent Hive:Magnus products. `hive.sh` verifies a signed release manifest, renders per-host Compose projects from digest-pinned images, and records what it did. Hive plans, applies and recovers; each product keeps its own data, credentials and recovery lifecycle. The controller needs only Bash, jq, OpenSSL and Docker Compose; no Node.js runtime.

| Profile | Adds |
| --- | --- |
| `core` | Oathweave, Emberpath, HiveMem, HiveSkills, HiveXUI, the HTTPS ingress and the Hive Registry, with their private Redis and Qdrant stores |
| `full` | Core plus Magnus, Cindertrace and ChatterMost, each with its own private PostgreSQL, and the optional Emberfold HTTP service |
| `custom` | Oathweave, HiveXUI, the ingress and the Hive Registry, plus the products you select |

No profile selects the Magnus web terminal gateway or [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md); every release offers the gateway, and interactive setup suggests Studio with the full profile. Selecting Magnus does not install a host agent: the guided setup offers one after installation, and `hive.sh magnus-agent install` installs it separately. [Ardent](https://hivemagnus.com/guides/ardent.md) is not a suite container: the Magnus host agent stages the Ardent package its signed dependency lock pins, and Magnus installs and manages it on the host.

## Reviewed release: 3.1.1

The release reviewed for the product details below is [Hive 3.1.1](https://github.com/ChefTaco/hive/releases/tag/v3.1.1). Its tag `v3.1.1` holds the signed manifest `releases/3.1.1.json`, its detached Ed25519 signature `releases/3.1.1.json.sig` and the publisher key `trust/publisher.pub`; the same three files are attached to the release. The manifest pins every product, datastore and initialization image by multi-architecture digest (linux/amd64 and linux/arm64), and pins the controller source with `controllerSHA256`.

| Product | Version in 3.1.1 |
| --- | --- |
| Oathweave | 2.1.1 |
| Emberpath | 2.0.4 |
| HiveMem | 1.4.1 |
| HiveSkills | 1.3.3 |
| HiveXUI | 0.2.7 |
| Magnus server and fleet gateway | 2.4.2 |
| Magnus host agent `@hivemagnus/magnus-agent` | 2.4.2, with its npm integrity (`components.magnus.agentPackage`) |
| Ardent, staged by the Magnus host agent | 3.1.1 |
| Cindertrace | 0.2.2 |
| ChatterMost | 0.4.4 |
| Emberfold HTTP service | 0.2.2 |
| Ardent Project Studio | 0.2.0 |
| Hive Registry | 1.1.0 |
| Hive Ingress | 2.0.5 |

The release notes list every image digest, including the private PostgreSQL 17.11 and 18.6, Redis 8.2.10 and Qdrant 1.18.3 stores.

3.1.1 updates HiveXUI to 0.2.7 and Magnus to 2.4.2: command status and selected output follow read-only updates without a manual refresh, and transient reads retry without redispatching commands. It keeps Ardent 3.1.1, optional extension packages, existing datastore formats and the other product pins of 3.1.0. See the [changelog](https://github.com/ChefTaco/hive/blob/v3.1.1/CHANGELOG.md).

Since 3.0.0 the suite runs maintained system libraries and patched embedded SQLite, and its PostgreSQL images are rebuilt against new glibc and ICU libraries. An existing PostgreSQL store needs an explicit, rehearsed migration to enter that runtime; see [Upgrade](#upgrade). From 2.4.0, guided local setup prepares the host itself with consent, and full-node enrollment adds commands, managed cron and a selected web terminal to the local Magnus host.

A passing disposable rehearsal is not production cutover approval, physical multi-host certification or ARM64 certification. Do not cut over an existing installation based on this guide or on a passing fresh fixture. Later releases are listed on the [releases page](https://github.com/ChefTaco/hive/releases).

## Prerequisites

- A host running Ubuntu 22.04 or 24.04, or Debian 12 or 13, on amd64 or arm64, with sudo, 2 CPUs, 4 GB of memory and 20 GB of free disk. The `full` profile uses about 1 GB of memory when idle and about 6 GB of container images. On other Linux distributions, install Docker Engine with the Compose plugin and the tools `./scripts/install-prerequisites.sh --check` lists yourself.
- A DNS name for the browser address and a certificate and unencrypted key for it, from `tailscale cert`, your own CA or an ACME client.
- The signed services run as UID/GID 1000 (HiveXUI as 101), so run fresh setup as that account (usually the first account on the host) or with sudo.
- No model runtime: inference stays external.

## Install

The [installation guide](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/QUICKSTART.md) covers every step and setup question. On a fresh host:

```bash
git clone https://github.com/ChefTaco/hive.git && cd hive
./hive.sh --release latest
```

Expected result: the launcher resolves GitHub’s latest published, non-prerelease suite release once, prints its exact version, verifies it and starts guided setup. For a fresh local installation, setup offers to install Docker Engine and the required tools, using sudo only after showing its changes and asking for consent; the new `docker` group membership takes effect in a child shell, so no logout is needed. It then offers to create the installation directory. If Tailscale is already signed in with HTTPS Certificates enabled, setup suggests this host's HTTPS name and can obtain its certificate. Every offer can be declined.

To choose this release explicitly, as its release notes show:

```bash
git clone --branch v3.1.1 https://github.com/ChefTaco/hive.git hive && cd hive
./hive.sh --release 3.1.1
```

Failed lookups stop setup instead of falling back to an older release. An already-matching local checkout stays in use. Otherwise the launcher retains the tagged controller under `${XDG_DATA_HOME:-$HOME/.local/share}/hive/releases/` and prints its path. After setup, change to that retained checkout for the lifecycle and certificate commands below, and keep it while a renewal timer uses it. Return to the original launcher checkout when selecting a new release with `--release latest`.

The launcher checks the manifest signature against its original publisher key and verifies the signed controller source digest before executing it. It refuses changed release checkouts or a different key. For example, 3.1.1 verifies `releases/3.1.1.json` against its signature with `trust/publisher.pub`, then asks for the installation name, directory, host, browser address (the HTTPS origin), profile, bind address and certificate files, and, with Magnus, an optional port for host agents. It never asks for a password on the command line. It shows a plan, applies it after you confirm, and ends with the HTTPS origin, the initial sign-in file and the next commands. After installation it offers the certificate renewal timer and, when an agent port was selected, the Magnus host agent and full-node enrollment. If setup stops after writing its configuration, running it again offers to continue with that file.

### Manual host preparation

Existing configuration files, unattended commands and remote hosts keep explicit prerequisite and certificate management:

```bash
sudo ./scripts/install-prerequisites.sh --directory /opt/hive
# log out and back in for the docker group, then:
./scripts/install-prerequisites.sh --check
sudo ./scripts/console-certificate.sh tailscale
```

Expected result: `install-prerequisites.sh` shows its plan and asks before changing anything. It installs Docker Engine and the Compose plugin from Docker's apt repository after checking its signing key, plus jq, OpenSSL, curl, git, iproute2 and the other tools `hive.sh` uses, adds you to the `docker` group and creates `/opt/hive`; `--check` then prints `Ready`. `console-certificate.sh tailscale` writes `/etc/hive/tls/console.crt` and `console.key` for the host's MagicDNS name, owned by you. With your own certificate, check it instead with `./scripts/console-certificate.sh check --cert FILE --key FILE --name NAME`. Hive runs no ACME client itself.

To install from separately downloaded files instead, pass `--manifest`, `--signature` and `--trust-key`, still from the same tag's checkout. First check the key's fingerprint against the one in the [release notes](https://github.com/ChefTaco/hive/releases/tag/v3.1.1). The fingerprint is the SHA-256 of the DER public key:

```bash
openssl pkey -pubin -in trust/publisher.pub -outform DER | sha256sum
```

### Repeatable plans

For retries and for planning then applying, use the same exact release setup reported; do not resolve `latest` separately between the two steps. To prepare configuration separately or run unattended, supply the same installation JSON ([example](https://github.com/ChefTaco/hive/blob/v3.1.1/examples/installation.json), [schema](https://github.com/ChefTaco/hive/blob/v3.1.1/examples/installation.schema.json)). Interactive setup writes it to a protected configuration directory outside the checkout, by default `~/.config/hive/ID/installation.json`:

```bash
./hive.sh plan --config installation.json --release 3.1.1
./hive.sh install --config installation.json --release 3.1.1 --non-interactive --yes
./hive.sh status --config installation.json
./hive.sh doctor --config installation.json
```

Planning does not contact hosts. Per-product secrets, initial identities and internal transport keys are generated once into protected files, and retries check the exact inputs. Existing data, configuration, model resources and Compose projects are never silently adopted or overwritten. `./hive.sh --help` lists the lifecycle commands, including `init`, `upgrade`, `rollback`, `backup`, `adopt`, `restore`, `rehearse` and `migrate-native`.

For hosts beyond one, read the [distributed](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/DISTRIBUTED.md), [full](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/FULL.md) and [custom](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/CUSTOM.md) guides.

## Sign in to HiveXUI

Visit the HTTPS origin you configured and sign in through Oathweave. [HiveXUI](https://hivemagnus.com/guides/hivexui.md) is the browser UI for every installed product, and shows sections only for products in this installation.

On a fresh installation, the initial username and password are in `config/initial-credentials.env` in the installation directory on the identity host, for example `/opt/hive/config/initial-credentials.env`; read them privately and leave the file in place. Add a passkey or authenticator app under **Oathweave > Account security**.

The installer copies the certificate into the ingress. After renewing it, run `./hive.sh tls-refresh --config FILE`; `sudo ./scripts/console-certificate.sh schedule --config FILE` does this weekly for a Tailscale certificate, and successful upgrades refresh an existing renewal service to the new checkout. Back up with `./hive.sh backup --config FILE --archive NAME --yes`, which keeps the suite serving; each application pauses only briefly, however much data it holds. See [backups](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/BACKUPS.md).

An installation migrated with `hive.sh migrate-native` keeps its accounts, roles and password hashes instead, and the owner sets a new administrator password once with a one-use reset token. Cutover writes the token to the configured `adminAccount.tokenFile` on the controller, mode 0600; it expires after 24 hours. On the host, run the installation's `bin/hive-set-admin-password` with `sudo`, or `hive.sh migrate-native set-admin-password --config FILE` from the controller. It prompts for the token and the new password without echo; neither can be a command-line argument. Then sign in and delete the token file. See [first sign-in](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/MIGRATE_NATIVE.md#first-sign-in).

## Upgrade

Return to the original launcher checkout. It selects and retains the new release controller; use an exact version instead of `latest` to review and apply a specific release. An upgrade shows its plan and requires confirmation:

```bash
./hive.sh upgrade --config installation.json --release latest
```

**From 2.x to 3.1.1 with existing PostgreSQL stores** (Magnus, Cindertrace or ChatterMost), the upgrade also needs explicit migration approval:

```bash
./hive.sh plan --config installation.json --release 3.1.1 --allow-migrations
./hive.sh upgrade --config installation.json --release 3.1.1 --allow-migrations
```

The installer takes a verified pre-change backup, rehearses the new runtime and migration on a disposable copy, then migrates the stopped live stores and rebuilds their indexes before activation. Credentials, ownership, PostgreSQL majors, application records and component selection are retained. HiveXUI is unavailable while services and stores are stopped or migrated; the duration depends on the data and index rebuilds. A core installation without PostgreSQL does not need this transition, and moving between 3.x releases with unchanged datastore formats does not repeat it.

**Code-only rollback across that boundary is refused.** `./hive.sh rollback` can still return to a compatible storage format, but recovery from the PostgreSQL collation change requires the verified original-state backup, rehearsed with the retained original controller and images, and reconciliation of later writes; it must not discard them. A failed or uncertain live migration holds the transaction for recovery: repeat exactly the same command rather than editing transaction or runtime receipts. Read the release notes, [advisory remediation](https://github.com/ChefTaco/hive/blob/v3.1.1/docs/ADVISORY_REMEDIATION.md#postgresql-needs-a-separate-migration-proof), the [upgrade procedure](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/QUICKSTART.md#8-upgrade) and [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.1.1/UPGRADING.md) first.

If the host has a fully enrolled Magnus agent, update it through the installer as well; review the displayed enrollment evidence before accepting it:

```bash
./hive.sh magnus-agent enroll --config installation.json --release 3.1.1
```

This upgrades the agent and stages the verified Ardent package while keeping the node identity, profiles and completed history. Then, in **Magnus > Ardent > Installations** in HiveXUI, stop running profiles, choose **Update package** and start them again.

## Fleet hosts and security events

With Magnus and a port for host agents, one command installs the Magnus agent on the Magnus host, or with `--host` on another fleet host, and waits for Magnus to accept its first heartbeat. Without a suitable Node.js it offers to install Node.js 24 from NodeSource's signed apt repository (`--install-node` agrees unattended). It installs exactly the agent version the release pins, after checking the package's integrity, never prints the node credentials, and stages the pinned Ardent package without installing or starting a runtime. On an installer-owned single host, `magnus-agent enroll` then reviews and enables full node capabilities: commands, managed cron and a selected restricted web terminal. A fresh Cindertrace ingests nothing until a collector exists; `cindertrace-collector add` generates a collector's credential into an owner-only file on the Cindertrace host and never prints it.

```bash
./hive.sh magnus-agent install --config installation.json
./hive.sh magnus-agent enroll --config installation.json
./hive.sh magnus-agent status --config installation.json
./hive.sh cindertrace-collector add edge --sources tailscale --config installation.json
./hive.sh cindertrace-collector list --config installation.json
```

See [Magnus host agents](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/FULL.md#magnus-host-agents), [Ardent Project Studio](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/FULL.md#ardent-project-studio) and [sending security events](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/FULL.md#sending-security-events-to-cindertrace).

## Hive Registry

Every installation runs a Hive Registry: its install catalog and lookup API, a small SQLite container on the host serving HiveXUI. It is mandatory, one per installation, and unrelated to [HiveSkills](https://hivemagnus.com/guides/hiveskills.md), the skills registry. It holds the products the signed release offers, what this installation actually runs, the links an operator or client needs, and an append-only history. It has no HiveXUI section.

```bash
./hive.sh registry list --config installation.json
./hive.sh registry get emberpath --config installation.json
```

`list` also has `installed`, `summary` and `history` forms. `hive.sh` is the normal writer; `registry add`, `update` and `remove` cover externally managed products only, and any credential in an entry is refused. The ingress passes only explicit `GET` routes under `/api/registry/`, so writes never leave the private network. `status` reports drift by name and `doctor` fails on any drift. See the [API reference](https://github.com/ChefTaco/hive/blob/v3.1.1/docs/hive-registry-api.md).

## External inference

Ollama, llama.cpp, other inference services and hosted APIs are external dependencies. Hive only verifies connectivity, model discovery, generation and streaming, then registers verified providers with Emberpath. It never installs or manages inference services, model downloads, storage, licenses or GPUs. See [external inference](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/INFERENCE.md).

## Existing installations

A native installation, with Router, IAM, HiveMem and, where installed, Skills running as systemd services, moves onto the suite on the same host and ports with `hive.sh migrate-native`. It keeps every native port, certificate, issuer, key and account. Read [migrating a native installation](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/MIGRATE_NATIVE.md) before any separately approved maintenance window. `adopt` takes over existing Compose stacks only.

The npm launcher `@hivemagnus/hive` and the other 1.x npm packages are the legacy line. The suite products supersede them, and they still receive maintenance releases on v1. Installations the launcher manages follow [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.1.1/UPGRADING.md). To bring one under the controller, rehearse its own backups and read [existing-data rehearsals](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/EXISTING_DATA_REHEARSALS.md) first. Preserve each installation's state.

## Source review

Reviewed 2026-11-12 against tag `v3.1.1`, commit `d1ff02dd4fbe16e9552f891584e8221aa52d0d93`: [README](https://github.com/ChefTaco/hive/blob/v3.1.1/README.md), [deployment overview](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/README.md), [installation guide](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/QUICKSTART.md), [full profile](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/FULL.md), [native migration](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/MIGRATE_NATIVE.md), [backups](https://github.com/ChefTaco/hive/blob/v3.1.1/deployment/BACKUPS.md), [upgrading](https://github.com/ChefTaco/hive/blob/v3.1.1/UPGRADING.md), [advisory remediation](https://github.com/ChefTaco/hive/blob/v3.1.1/docs/ADVISORY_REMEDIATION.md), [releasing](https://github.com/ChefTaco/hive/blob/v3.1.1/docs/RELEASING.md), [Hive Registry API](https://github.com/ChefTaco/hive/blob/v3.1.1/docs/hive-registry-api.md), [release launcher](https://github.com/ChefTaco/hive/blob/v3.1.1/scripts/suite/release-launcher.sh), the [changelog](https://github.com/ChefTaco/hive/blob/v3.1.1/CHANGELOG.md) entries for 3.0.0 to 3.1.1, `releases/3.1.1.json` and the `hive.sh --help` text. Release notes: [3.1.1](https://github.com/ChefTaco/hive/releases/tag/v3.1.1). The default command clones the launcher and uses `--release latest`; exact versions remain supported. Follow current docs for later releases. License: Apache-2.0.
