# Hive: agent guide

> Suite deployment, tested product bundles, upgrades, backup and recovery.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/hive) · [Current instructions](https://github.com/ChefTaco/hive#quick-start-with-npm)

## When to use Hive

Choose Hive to plan, install, upgrade and recover a tested combination of independent ecosystem products. Core provides identity, model routing, memory, skill distribution and the shared console. Select additional products only where needed. The published launcher described below predates this separation.

## Candidate ecosystem boundary

Hive is becoming the Bash/Compose installer for independently versioned Oathweave, Emberpath, HiveMem, HiveSkills and HiveXUI, with selectable Magnus/Ardent, Cindertrace, ChatterMost and Emberfold HTTP. The static HiveXUI console calls authorized product APIs through HTTPS ingress. Magnus keeps its current console until a later merge.

The candidate controller supports interactive and unattended configuration, per-host placement, protected secret references, signed release pins, backup and isolated restore rehearsals. No official signed suite release has been published. Do not cut over an existing installation based on a candidate guide or a passing fresh fixture.

Ollama, llama.cpp, other inference services and hosted APIs are external dependencies. Hive only verifies connectivity, model discovery, generation and streaming, then registers verified providers with Emberpath. It never installs or manages inference services, model downloads, storage, licenses or GPUs. Existing external configurations and model resources remain with their current owner.

## Published legacy launcher

The commands below retain the previously reviewed published launcher and its recovery-compatible documentation. They are not commands for the new candidate Bash suite.

## Prerequisites

- Linux or macOS, npm, and Node.js 24.22.1+ in the 24 series or 26.13.0+ in the 26 series.
- OpenSSL for the local TLS certificates.
- Docker to run Qdrant and Redis, or independently configured Qdrant and Redis services.
- `flock` for HiveMem (util-linux on Linux; `brew install flock` on macOS).

These steps are for a first installation. Existing installations should use the launcher's upgrade instructions.

## Install and start

Run in an interactive terminal:

```bash
npx @hivemagnus/hive init
npx @hivemagnus/hive start
```

`init` asks which services to install, prepares configuration and local TLS, and asks before installing packages or starting containers. Without an interactive terminal it refuses to wait for input; consult the launcher's documented `--yes` option when intentionally automating setup.

Expected result: `start` reports `Hive is running` and prints the console URL, normally `https://localhost:9443/`. Services run in the foreground; Ctrl-C stops them. Runtime and configuration live under `~/.hive`.

Sign in as `admin` using the password IAM creates on first start in `~/.hive/iam/initial-credentials.env`. Read it privately. The initial certificate uses a local CA; follow the launcher guide to trust that CA. Change the initial password and follow the guide's credential-file cleanup instructions.

For diagnostics in another terminal:

```bash
npx @hivemagnus/hive doctor
```

The optional Skills registry can be selected during a new setup with `npx @hivemagnus/hive init --services all`. Its OS/PAM administration login is independent of IAM. Read the Skills prerequisites before selecting it; the Linux PAM administration flow is not available on macOS.

## Connect an agent

Use the Router's OpenAI-compatible interface for model requests, HiveMem's REST API or TypeScript SDK for memory, and IAM's SDK for verification in services that trust IAM. Configure each integration explicitly using the relevant service documentation. Do not assume console credentials are an API token or that installing Hive automatically configures an agent.

- [Architecture](https://github.com/ChefTaco/hive/blob/main/docs/HIVE_ARCHITECTURE.md)
- [Launcher, upgrades, and uninstall](https://github.com/ChefTaco/hive/tree/main/packages/hive)
- [HiveMem TypeScript SDK](https://github.com/ChefTaco/hive/tree/main/services/hive-mem/sdks/typescript)
- [OpenAPI documents](https://github.com/ChefTaco/hive/tree/main/docs/openapi)
- [Repository instructions](https://github.com/ChefTaco/hive/blob/main/AGENTS.md)

## Source review

Reviewed 2026-11-03 against public revision `78fb6cced1aade79b4c55160754f4d6466bf8891`: [root README](https://github.com/ChefTaco/hive/blob/78fb6cced1aade79b4c55160754f4d6466bf8891/README.md) and [launcher README](https://github.com/ChefTaco/hive/blob/78fb6cced1aade79b4c55160754f4d6466bf8891/packages/hive/README.md). Commands follow those docs; npm resolves the currently published launcher. Follow current source instructions when versions change. License: Apache-2.0.
