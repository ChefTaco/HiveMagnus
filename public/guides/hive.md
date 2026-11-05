# Hive: agent guide

> Bash installer and controller for signed, digest-pinned suite releases, with upgrades, backups, restore rehearsals and the Hive Registry.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/hive) · [Releases](https://github.com/ChefTaco/hive/releases) · [Deployment overview](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/deployment/README.md)

## When to use Hive

Choose Hive to plan, install, upgrade and recover a tested combination of independent ecosystem products. `hive.sh` verifies a signed release manifest, renders per-host Compose projects from digest-pinned images, and records what it did. Hive plans, applies and recovers; each product keeps its own data, credentials and recovery lifecycle.

| Profile | Adds |
| --- | --- |
| `core` | Oathweave, Emberpath, HiveMem, HiveSkills, HiveXUI, the HTTPS ingress and the Hive Registry, with their private datastores |
| `full` | Core plus Magnus, Cindertrace, ChatterMost and the optional Emberfold HTTP service |
| `custom` | Oathweave, HiveXUI, the ingress and the Hive Registry, plus the products you select |

Ardent and other native host agents are opt-in selections with independent pinned artifacts. Selecting Magnus does not install an agent.

## Check what is published

Hive installs only from a signed release. Look for one on the [releases page](https://github.com/ChefTaco/hive/releases). A passing disposable rehearsal is not production cutover approval, physical multi-host certification or ARM64 certification. Do not cut over an existing installation based on this guide or on a passing fresh fixture.

## Prerequisites

- On the controller: Bash, `jq`, OpenSSL and `sha256sum`.
- On each host: Docker with Compose, reached locally or through strictly verified SSH. On console hosts also `ss` (iproute2), `df` and coreutils.
- The release manifest, its detached signature and the publisher's public key. Defaults are `releases/VERSION.json`, the same path plus `.sig`, and `trust/publisher.pub`.
- An HTTPS console origin with existing certificate and key files on the console host.

## Install

In an interactive terminal:

```bash
./hive.sh --release __HIVE_RELEASE__
```

Expected result: the controller verifies the manifest signature, then asks for the installation name and directory, host, console origin, profile and certificate references. It never asks for a password on the command line. It shows a plan and applies it after you confirm. Use `--manifest`, `--signature` and `--trust-key` for files outside the default paths.

To prepare configuration separately or run unattended, supply the same installation JSON ([example](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/examples/installation.json), [schema](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/examples/installation.schema.json)):

```bash
./hive.sh plan --config installation.json --release __HIVE_RELEASE__
./hive.sh install --config installation.json --release __HIVE_RELEASE__ --non-interactive --yes
./hive.sh status --config installation.json
./hive.sh doctor --config installation.json
```

Planning does not contact hosts. Per-product secrets, initial identities and internal transport keys are generated once into protected files, and retries check the exact inputs. Existing data, configuration, model resources and Compose projects are never silently adopted or overwritten. `./hive.sh --help` lists the lifecycle commands: `init`, `upgrade`, `rollback`, `backup`, `adopt`, `restore` and `rehearse`.

For hosts beyond one, read the [distributed](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/deployment/DISTRIBUTED.md), [full](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/deployment/FULL.md) and [custom](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/deployment/CUSTOM.md) guides.

## Open the console

Visit the HTTPS origin you configured and sign in through Oathweave. Initial sign-in instructions are stored on the identity host in `config/initial-credentials.env`; read them privately. [HiveXUI](https://hivemagnus.com/guides/hivexui.md) is the console for every installed product, and shows sections only for products in this installation.

## Hive Registry

Every installation runs a Hive Registry: its install catalog and lookup API, a small SQLite container on the console host. It is mandatory, one per installation, and unrelated to [HiveSkills](https://hivemagnus.com/guides/hiveskills.md), the skills registry. It holds the products the signed release offers, what this installation actually runs, the links an operator or client needs, and an append-only history. It has no console section.

```bash
./hive.sh registry list --config installation.json
./hive.sh registry get emberpath --config installation.json
```

`list` also has `installed`, `summary` and `history` forms. `hive.sh` is the normal writer; `registry add`, `update` and `remove` cover externally managed products only, and any credential in an entry is refused. The ingress passes only explicit `GET` routes under `/api/registry/`, so writes never leave the private network. `status` reports drift by name and `doctor` fails on any drift. See the [API reference](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/docs/hive-registry-api.md).

## External inference

Ollama, llama.cpp, other inference services and hosted APIs are external dependencies. Hive only verifies connectivity, model discovery, generation and streaming, then registers verified providers with Emberpath. It never installs or manages inference services, model downloads, storage, licenses or GPUs. See [external inference](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/deployment/INFERENCE.md).

## Existing installations

The npm launcher `@hivemagnus/hive` predates this separation and remains the path for installations it already manages; follow [UPGRADING](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/UPGRADING.md). To bring one under the controller, rehearse its own backups and read [existing-data rehearsals](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/deployment/EXISTING_DATA_REHEARSALS.md) before any separately approved maintenance window. Preserve each installation's state.

## Source review

Reviewed 2026-11-05 against public revision `623eba65fc67b7b97bb58180088b6b8fb17dc307` on branch `codex/ecosystem-separation`: [deployment overview](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/deployment/README.md), [full profile](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/deployment/FULL.md), [Hive Registry API](https://github.com/ChefTaco/hive/blob/623eba65fc67b7b97bb58180088b6b8fb17dc307/docs/hive-registry-api.md) and `hive.sh --help`. Commands follow those sources; `__HIVE_RELEASE__` is the exact release version. Follow current docs for later releases. License: Apache-2.0.
