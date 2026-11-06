# Hive: agent guide

> Bash installer and controller for signed, digest-pinned suite releases, with upgrades, backups, restore rehearsals and the Hive Registry.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/hive) · [Release 2.0.1](https://github.com/ChefTaco/hive/releases/tag/v2.0.1) · [Deployment overview](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/README.md)

## When to use Hive

Choose Hive to plan, install, upgrade and recover a tested combination of independent ecosystem products. `hive.sh` verifies a signed release manifest, renders per-host Compose projects from digest-pinned images, and records what it did. Hive plans, applies and recovers; each product keeps its own data, credentials and recovery lifecycle.

| Profile | Adds |
| --- | --- |
| `core` | Oathweave, Emberpath, HiveMem, HiveSkills, HiveXUI, the HTTPS ingress and the Hive Registry, with their private datastores |
| `full` | Core plus Magnus, Cindertrace, ChatterMost and the optional Emberfold HTTP service |
| `custom` | Oathweave, HiveXUI, the ingress and the Hive Registry, plus the products you select |

Ardent and other native host agents are opt-in selections with independent pinned artifacts. Selecting Magnus does not install an agent. Every release offers the Magnus web terminal gateway, but no profile selects it.

## Release 2.0.1

The current suite release is [Hive 2.0.1](https://github.com/ChefTaco/hive/releases/tag/v2.0.1). Its tag `v2.0.1` holds the signed manifest `releases/2.0.1.json`, its detached Ed25519 signature `releases/2.0.1.json.sig` and the publisher key `trust/publisher.pub`; the same three files are attached to the release. The manifest pins every product, datastore and initialization image by multi-architecture digest (linux/amd64 and linux/arm64), and pins the controller source with `controllerSHA256`.

It pins Oathweave 2.0.1, Emberpath 2.0.1, HiveMem 1.3.1, HiveSkills 1.3.1, HiveXUI 0.1.1, Magnus 2.1.1 and its gateway, Cindertrace 0.2.1, ChatterMost 0.4.1, Emberfold 0.2.1 and Hive Registry 1.0.0. The release notes list every image digest.

A passing disposable rehearsal is not production cutover approval, physical multi-host certification or ARM64 certification. Do not cut over an existing installation based on this guide or on a passing fresh fixture. Later releases are listed on the [releases page](https://github.com/ChefTaco/hive/releases).

## Prerequisites

- On the controller: Git, Bash, `jq`, OpenSSL and `sha256sum`.
- On each host: Docker with Compose, reached locally or through strictly verified SSH. On console hosts also `ss` (iproute2), `df` and coreutils.
- An HTTPS console origin with existing certificate and key files on the console host.
- The signed services run as UID/GID 1000 (HiveXUI as 101), so run fresh setup as that account or as a host administrator.

## Install

Install from a checkout of the release tag. The manifest pins the controller's SHA-256, and `hive.sh` refuses a manifest pinned to a different controller. In an interactive terminal:

```bash
git clone --branch v2.0.1 https://github.com/ChefTaco/hive.git && cd hive
./hive.sh --release 2.0.1
```

Expected result: the controller verifies `releases/2.0.1.json` against its signature with `trust/publisher.pub` before it reads anything else, then asks for the installation name and directory, host, console origin, profile and certificate references. It never asks for a password on the command line. It shows a plan and applies it after you confirm.

To install from separately downloaded files instead, pass `--manifest`, `--signature` and `--trust-key`, still from the same tag's checkout. First check the key's fingerprint against the one in the [release notes](https://github.com/ChefTaco/hive/releases/tag/v2.0.1). The fingerprint is the SHA-256 of the DER public key:

```bash
openssl pkey -pubin -in trust/publisher.pub -outform DER | sha256sum
```

To prepare configuration separately or run unattended, supply the same installation JSON ([example](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/examples/installation.json), [schema](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/examples/installation.schema.json)). Interactive setup writes it to a protected configuration directory outside the checkout:

```bash
./hive.sh plan --config installation.json --release 2.0.1
./hive.sh install --config installation.json --release 2.0.1 --non-interactive --yes
./hive.sh status --config installation.json
./hive.sh doctor --config installation.json
```

Planning does not contact hosts. Per-product secrets, initial identities and internal transport keys are generated once into protected files, and retries check the exact inputs. Existing data, configuration, model resources and Compose projects are never silently adopted or overwritten. `./hive.sh --help` lists the lifecycle commands: `init`, `upgrade`, `rollback`, `backup`, `adopt`, `restore`, `rehearse` and `migrate-native`. A later release upgrades with `./hive.sh upgrade --config FILE --release X.Y.Z` from that release's checkout.

For hosts beyond one, read the [distributed](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/DISTRIBUTED.md), [full](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/FULL.md) and [custom](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/CUSTOM.md) guides.

## Open the console

Visit the HTTPS origin you configured and sign in through Oathweave. [HiveXUI](https://hivemagnus.com/guides/hivexui.md) is the console for every installed product, and shows sections only for products in this installation.

On a fresh installation, initial sign-in instructions are stored on the identity host in `config/initial-credentials.env`; read them privately.

An installation migrated with `hive.sh migrate-native` keeps its accounts, roles and password hashes instead, and the owner sets a new administrator password once with a one-use reset token. Cutover writes the token to the configured `adminAccount.tokenFile` on the controller, mode 0600; it expires after 24 hours. On the host, run the installation's `bin/hive-set-admin-password` with `sudo` (for example `sudo /opt/hive-suite/bin/hive-set-admin-password`), or `hive.sh migrate-native set-admin-password --config FILE` from the controller. It prompts for the token and the new password without echo; neither can be a command-line argument. Then sign in and delete the token file. `hive.sh migrate-native issue-admin-token` issues a new token and cancels the old one; it refuses to overwrite an existing token file. See [first sign-in](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/MIGRATE_NATIVE.md#first-sign-in).

## Hive Registry

Every installation runs a Hive Registry: its install catalog and lookup API, a small SQLite container on the console host. It is mandatory, one per installation, and unrelated to [HiveSkills](https://hivemagnus.com/guides/hiveskills.md), the skills registry. It holds the products the signed release offers, what this installation actually runs, the links an operator or client needs, and an append-only history. It has no console section.

```bash
./hive.sh registry list --config installation.json
./hive.sh registry get emberpath --config installation.json
```

`list` also has `installed`, `summary` and `history` forms. `hive.sh` is the normal writer; `registry add`, `update` and `remove` cover externally managed products only, and any credential in an entry is refused. The ingress passes only explicit `GET` routes under `/api/registry/`, so writes never leave the private network. `status` reports drift by name and `doctor` fails on any drift. See the [API reference](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/docs/hive-registry-api.md).

## External inference

Ollama, llama.cpp, other inference services and hosted APIs are external dependencies. Hive only verifies connectivity, model discovery, generation and streaming, then registers verified providers with Emberpath. It never installs or manages inference services, model downloads, storage, licenses or GPUs. See [external inference](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/INFERENCE.md).

## Existing installations

A native installation, with Router, IAM, HiveMem and, where installed, Skills running as systemd services, moves onto the suite on the same host and ports with `hive.sh migrate-native`. It keeps every native port, certificate, issuer, key and account. Read [migrating a native installation](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/MIGRATE_NATIVE.md) before any separately approved maintenance window. Use release 2.0.1 or later: it verifies the migrated data before any client can reach it, so live traffic during the cutover no longer fails verification. `adopt` takes over existing Compose stacks only.

The npm launcher `@hivemagnus/hive` and the other 1.x npm packages are the legacy line. The suite products supersede them, and they still receive maintenance releases on v1. Installations the launcher manages follow [UPGRADING](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/UPGRADING.md). To bring one under the controller, rehearse its own backups and read [existing-data rehearsals](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/EXISTING_DATA_REHEARSALS.md) first. Preserve each installation's state.

## Source review

Reviewed 2026-11-06 against tag `v2.0.1`, commit `02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52`: [README](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/README.md), [deployment overview](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/README.md), [full profile](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/FULL.md), [native migration](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/deployment/MIGRATE_NATIVE.md), [releasing](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/docs/RELEASING.md), [Hive Registry API](https://github.com/ChefTaco/hive/blob/02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52/docs/hive-registry-api.md), `hive.sh --help` and the [2.0.0 release notes](https://github.com/ChefTaco/hive/releases/tag/v2.0.1). Commands follow those sources. The attached manifest, signature and key match the tagged tree, and the signature verifies with that key. Follow current docs for later releases. License: Apache-2.0.
