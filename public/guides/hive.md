# Hive: agent guide

> Bash installer and controller for signed, digest-pinned suite releases, with upgrades, backups, restore rehearsals and the Hive Registry.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/hive) · [Release 2.0.5](https://github.com/ChefTaco/hive/releases/tag/v2.0.5) · [Deployment overview](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/README.md)

## When to use Hive

Choose Hive to plan, install, upgrade and recover a tested combination of independent ecosystem products. `hive.sh` verifies a signed release manifest, renders per-host Compose projects from digest-pinned images, and records what it did. Hive plans, applies and recovers; each product keeps its own data, credentials and recovery lifecycle.

| Profile | Adds |
| --- | --- |
| `core` | Oathweave, Emberpath, HiveMem, HiveSkills, HiveXUI, the HTTPS ingress and the Hive Registry, with their private datastores |
| `full` | Core plus Magnus, Cindertrace, ChatterMost and the optional Emberfold HTTP service |
| `custom` | Oathweave, HiveXUI, the ingress and the Hive Registry, plus the products you select |

Ardent and other native host agents are opt-in selections with independent pinned artifacts. Selecting Magnus does not install an agent; `hive.sh magnus-agent install` installs the Magnus host agent separately. Every release offers the Magnus web terminal gateway, but no profile selects it.

## Release 2.0.5

The current suite release is [Hive 2.0.5](https://github.com/ChefTaco/hive/releases/tag/v2.0.5). Its tag `v2.0.5` holds the signed manifest `releases/2.0.5.json`, its detached Ed25519 signature `releases/2.0.5.json.sig` and the publisher key `trust/publisher.pub`; the same three files are attached to the release. The manifest pins every product, datastore and initialization image by multi-architecture digest (linux/amd64 and linux/arm64), and pins the controller source with `controllerSHA256`.

It pins Oathweave 2.0.3, Emberpath 2.0.2, HiveMem 1.3.2, HiveSkills 1.3.1, HiveXUI 0.1.1, Magnus 2.1.1 and its gateway, Cindertrace 0.2.1, ChatterMost 0.4.1, Emberfold 0.2.1 and Hive Registry 1.0.0, and the Magnus agent package `@hivemagnus/magnus-agent` 2.1.1 with its npm integrity (`components.magnus.agentPackage`). The release notes list every image digest.

2.0.5 changes only Oathweave, from 2.0.2 to 2.0.3, which updates its passkey library for security advisory GHSA-2g3p-m8c9-hhwh. The controller is the same as in 2.0.4.

Since 2.0.4, an online backup's pauses no longer grow with the data: copies are taken while each application serves, and its short pause only proves them current or brings what changed up to date. `hive.sh magnus-agent install` installs the pinned Magnus agent on a fleet host, `hive.sh cindertrace-collector` provisions the credentials Cindertrace collectors sign events with, and a fresh installation with Magnus can publish the agent API on its own port. See the [changelog](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/CHANGELOG.md).

A passing disposable rehearsal is not production cutover approval, physical multi-host certification or ARM64 certification. Do not cut over an existing installation based on this guide or on a passing fresh fixture. Later releases are listed on the [releases page](https://github.com/ChefTaco/hive/releases).

## Prerequisites

- A host running Ubuntu 22.04 or 24.04, or Debian 12 or 13, on amd64 or arm64, with sudo. The `full` profile needs about 2 CPUs, 4 GB of memory and 20 GB of disk. On other Linux distributions, install Docker Engine with the Compose plugin and the tools `./scripts/install-prerequisites.sh --check` lists yourself.
- A DNS name for the console and a certificate and unencrypted key for it, from `tailscale cert`, your own CA or an ACME client.
- The signed services run as UID/GID 1000 (HiveXUI as 101), so run fresh setup as that account (usually the first account on the host) or with sudo.
- No model runtime: inference stays external.

## Install

The [installation guide](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/QUICKSTART.md) covers every step and setup question. On the host:

```bash
git clone --branch v2.0.5 https://github.com/ChefTaco/hive.git && cd hive
sudo ./scripts/install-prerequisites.sh --directory /opt/hive
# log out and back in for the docker group, then:
./scripts/install-prerequisites.sh --check
sudo ./scripts/console-certificate.sh tailscale
./hive.sh --release 2.0.5
```

Expected result: `install-prerequisites.sh` shows its plan, installs Docker Engine and the Compose plugin from Docker's apt repository after checking its signing key, plus jq, OpenSSL, curl, git, iproute2 and the other tools `hive.sh` uses, adds you to the `docker` group and creates `/opt/hive`; `--check` then prints `Ready`. `console-certificate.sh tailscale` writes `/etc/hive/tls/console.crt` and `console.key` for the host's MagicDNS name, owned by you. With your own certificate, check it instead with `./scripts/console-certificate.sh check --cert FILE --key FILE --name NAME`.

`hive.sh` verifies `releases/2.0.5.json` against its signature with `trust/publisher.pub` before it reads anything else, then asks for the installation name, directory, host, console origin, profile, bind address and certificate files, and, with Magnus, an optional port for host agents. It never asks for a password on the command line. It shows a plan, applies it after you confirm, and ends with the console origin, the initial sign-in file and the next commands. If setup stops after writing its configuration, running it again offers to continue with that file.

To install from separately downloaded files instead, pass `--manifest`, `--signature` and `--trust-key`, still from the same tag's checkout. First check the key's fingerprint against the one in the [release notes](https://github.com/ChefTaco/hive/releases/tag/v2.0.5). The fingerprint is the SHA-256 of the DER public key:

```bash
openssl pkey -pubin -in trust/publisher.pub -outform DER | sha256sum
```

To prepare configuration separately or run unattended, supply the same installation JSON ([example](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/examples/installation.json), [schema](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/examples/installation.schema.json)). Interactive setup writes it to a protected configuration directory outside the checkout:

```bash
./hive.sh plan --config installation.json --release 2.0.5
./hive.sh install --config installation.json --release 2.0.5 --non-interactive --yes
./hive.sh status --config installation.json
./hive.sh doctor --config installation.json
```

Planning does not contact hosts. Per-product secrets, initial identities and internal transport keys are generated once into protected files, and retries check the exact inputs. Existing data, configuration, model resources and Compose projects are never silently adopted or overwritten. `./hive.sh --help` lists the lifecycle commands: `init`, `upgrade`, `rollback`, `backup`, `adopt`, `restore`, `rehearse` and `migrate-native`. A later release upgrades with `./hive.sh upgrade --config FILE --release X.Y.Z` from that release's checkout.

For hosts beyond one, read the [distributed](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/DISTRIBUTED.md), [full](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/FULL.md) and [custom](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/CUSTOM.md) guides.

## Open the console

Visit the HTTPS origin you configured and sign in through Oathweave. [HiveXUI](https://hivemagnus.com/guides/hivexui.md) is the console for every installed product, and shows sections only for products in this installation.

On a fresh installation, the initial username and password are in `config/initial-credentials.env` in the installation directory on the identity host, for example `/opt/hive/config/initial-credentials.env`; read them privately.

The installer copies the console certificate into the ingress. After renewing it, run `./hive.sh tls-refresh --config FILE`; `sudo ./scripts/console-certificate.sh schedule --config FILE` does this weekly for a Tailscale certificate. Back up with `./hive.sh backup --config FILE --archive NAME --yes`, which keeps the suite serving; each application pauses only briefly, however much data it holds. See [backups](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/BACKUPS.md).

An installation migrated with `hive.sh migrate-native` keeps its accounts, roles and password hashes instead, and the owner sets a new administrator password once with a one-use reset token. Cutover writes the token to the configured `adminAccount.tokenFile` on the controller, mode 0600; it expires after 24 hours. On the host, run the installation's `bin/hive-set-admin-password` with `sudo` (for example `sudo /opt/hive-suite/bin/hive-set-admin-password`), or `hive.sh migrate-native set-admin-password --config FILE` from the controller. It prompts for the token and the new password without echo; neither can be a command-line argument. Then sign in and delete the token file. `hive.sh migrate-native issue-admin-token` issues a new token and cancels the old one; it refuses to overwrite an existing token file. See [first sign-in](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/MIGRATE_NATIVE.md#first-sign-in).

## Fleet hosts and security events

With Magnus and a port for host agents, one command installs the Magnus agent on the Magnus host, or with `--host` on another fleet host, and waits for Magnus to accept its first heartbeat. Without a suitable Node.js it offers to install Node.js 24 from NodeSource's signed apt repository (`--install-node` agrees unattended). It installs exactly the agent version the release pins, after checking the package's integrity, and never prints the node credentials. With the web terminal gateway, `--trust` approves the host's SSH key. A fresh Cindertrace ingests nothing until a collector exists; `cindertrace-collector add` generates a collector's credential into an owner-only file on the Cindertrace host and never prints it.

```bash
./hive.sh magnus-agent install --config installation.json
./hive.sh magnus-agent status --config installation.json
./hive.sh cindertrace-collector add edge --sources tailscale --config installation.json
./hive.sh cindertrace-collector list --config installation.json
```

See [Magnus host agents](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/FULL.md#magnus-host-agents) and [sending security events](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/FULL.md#sending-security-events-to-cindertrace).

## Hive Registry

Every installation runs a Hive Registry: its install catalog and lookup API, a small SQLite container on the console host. It is mandatory, one per installation, and unrelated to [HiveSkills](https://hivemagnus.com/guides/hiveskills.md), the skills registry. It holds the products the signed release offers, what this installation actually runs, the links an operator or client needs, and an append-only history. It has no console section.

```bash
./hive.sh registry list --config installation.json
./hive.sh registry get emberpath --config installation.json
```

`list` also has `installed`, `summary` and `history` forms. `hive.sh` is the normal writer; `registry add`, `update` and `remove` cover externally managed products only, and any credential in an entry is refused. The ingress passes only explicit `GET` routes under `/api/registry/`, so writes never leave the private network. `status` reports drift by name and `doctor` fails on any drift. See the [API reference](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/docs/hive-registry-api.md).

## External inference

Ollama, llama.cpp, other inference services and hosted APIs are external dependencies. Hive only verifies connectivity, model discovery, generation and streaming, then registers verified providers with Emberpath. It never installs or manages inference services, model downloads, storage, licenses or GPUs. See [external inference](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/INFERENCE.md).

## Existing installations

A native installation, with Router, IAM, HiveMem and, where installed, Skills running as systemd services, moves onto the suite on the same host and ports with `hive.sh migrate-native`. It keeps every native port, certificate, issuer, key and account. Read [migrating a native installation](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/MIGRATE_NATIVE.md) before any separately approved maintenance window. Use release 2.0.1 or later: it verifies the migrated data before any client can reach it, so live traffic during the cutover no longer fails verification. `adopt` takes over existing Compose stacks only.

The npm launcher `@hivemagnus/hive` and the other 1.x npm packages are the legacy line. The suite products supersede them, and they still receive maintenance releases on v1. Installations the launcher manages follow [UPGRADING](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/UPGRADING.md). To bring one under the controller, rehearse its own backups and read [existing-data rehearsals](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/EXISTING_DATA_REHEARSALS.md) first. Preserve each installation's state.

## Source review

Reviewed 2026-11-07 against commit `91bd31da798e6a3ddd986728301a5119c6a53d0c`, which tag `v2.0.5` marks: [README](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/README.md), [deployment overview](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/README.md), [installation guide](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/QUICKSTART.md), [full profile](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/FULL.md), [native migration](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/MIGRATE_NATIVE.md), [backups](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/deployment/BACKUPS.md), [releasing](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/docs/RELEASING.md), [Hive Registry API](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/docs/hive-registry-api.md), the [changelog](https://github.com/ChefTaco/hive/blob/91bd31da798e6a3ddd986728301a5119c6a53d0c/CHANGELOG.md) entry for 2.0.5 and `hive.sh --help`. Commands follow those sources. In the tree at that commit, `releases/2.0.5.json` verifies against its signature with `trust/publisher.pub`, whose fingerprint matches the one in the changelog. Release notes: [2.0.5](https://github.com/ChefTaco/hive/releases/tag/v2.0.5). Follow current docs for later releases. License: Apache-2.0.
