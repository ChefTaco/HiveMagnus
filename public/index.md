# Hive:Magnus

> Full-stack agent management on your own infrastructure.

[Visual site](https://hivemagnus.com/) · [Agent index](https://hivemagnus.com/llms.txt) · [Compatibility matrix](https://hivemagnus.com/compatibility.md) · [All guides in one file](https://hivemagnus.com/llms-full.txt)

## What it is good for

Hive:Magnus is a set of open source products for running AI agents on infrastructure you own. Each product has one job and its own repository, release and API; Hive installs a tested, signed combination of them and HiveXUI puts them in one browser UI.

- **Run your own assistants.** After a full install, `./hive.sh ardent setup` creates a first [Ardent](https://hivemagnus.com/guides/ardent.md) assistant through Magnus, with its own HiveMem memory identity. Ardent keeps a durable journal of every task, runs scheduled jobs and can join a ChatterMost channel when you configure one.
- **Manage the hosts your agents live on.** [Magnus](https://hivemagnus.com/guides/magnus.md) inventories Linux hosts and runs jobs, skills, agent rollouts and audit across them. Each host agent enrolls once with a one-time token and keeps its own node key. The web terminal stays off unless you deploy its separate gateway.
- **Put every model behind one endpoint.** [Emberpath](https://hivemagnus.com/guides/emberpath.md) gives agents and tools one OpenAI-compatible API in front of hosted providers, Ollama, llama.cpp or vLLM, with routing, failover before the first token, per-key quotas and a trace for every request. Inference stays external.
- **Give agents memory and reviewed skills.** [HiveMem](https://hivemagnus.com/guides/hivemem.md) keeps long-term memory in workspaces with their own access rules; [HiveSkills](https://hivemagnus.com/guides/hiveskills.md) distributes immutable, digest-verified skill releases; [Emberfold](https://hivemagnus.com/guides/emberfold.md) fits the right context into the next model turn.
- **Investigate and fix with a person in the loop.** [Cindertrace](https://hivemagnus.com/guides/cindertrace.md) correlates signed observations into cases with hashed evidence, and a response approval binds the exact plan, expires after ten minutes and is used once. [Embermend](https://hivemagnus.com/guides/embermend.md) turns findings into recommendations you decide on, then verifies source and runtime outcomes separately; its mutation policies start disabled.
- **Put a team of agents on a project.** [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md) gives several Ardent agents a shared project, a conversation room and deliverable review, in HiveXUI at `/studio`.

[Oathweave](https://hivemagnus.com/guides/oathweave.md) signs people and services in to all of it, with explicit, per-product access. People sign in, and re-authenticate before sensitive actions, on its own page in the browser, with a passkey or a password and MFA; no other product handles a password.

## Two ways to deploy

**Operators and teams: run the whole suite with Hive.**

1. On a fresh Ubuntu or Debian host, run the one-line launcher below. Guided setup can install Docker and the other prerequisites with your consent and request a Tailscale certificate. Choose `full`, review the plan and confirm.
2. Open HiveXUI at your HTTPS address and sign in with the initial login. Create your own account in **Oathweave > Users** with the **IAM Administrator** role, then run `./hive.sh admin-access setup` to give it access to each installed product.
3. If you gave setup a port for host agents, accept the Magnus host agent it offers, add more hosts with `./hive.sh magnus-agent install`, and create a first assistant with `./hive.sh ardent setup`. The setup checklist in HiveXUI and `./hive.sh status` list what still needs a person.
4. Keep it current: `./hive.sh upgrade` moves to a new signed release, `./hive.sh backup` and `./hive.sh rehearse` take backups and test restores on a disposable copy, and a single-host installation can prune old backups daily.

See the [Hive guide](https://hivemagnus.com/guides/hive.md) for each step.

**Developers: build with the pieces.** Every product runs on its own, so you can use one without the rest:

- `npm i -g @hivemagnus/ardent` installs a headless agent runtime with a management API, A2A, scheduled jobs and plugins ([Ardent guide](https://hivemagnus.com/guides/ardent.md)).
- Point any OpenAI-compatible client at Emberpath's `/v1` API ([Emberpath guide](https://hivemagnus.com/guides/emberpath.md)).
- `@hivemagnus/hivemem-sdk` (TypeScript) and HiveMem's Python SDK talk to its REST memory API ([HiveMem guide](https://hivemagnus.com/guides/hivemem.md)).
- `@hivemagnus/hive-iam-sdk` verifies Oathweave tokens and enforces roles in a Node.js or Hono service; Oathweave speaks OAuth 2.0 and OpenID Connect ([Oathweave guide](https://hivemagnus.com/guides/oathweave.md)).
- `@hivemagnus/emberfold` fits context to a token budget inside your own agent loop ([Emberfold guide](https://hivemagnus.com/guides/emberfold.md)).
- `npx @hivemagnus/magnus init` runs the fleet manager on one host without Hive ([Magnus guide](https://hivemagnus.com/guides/magnus.md)).
- Hive's `custom` profile installs only the products you select, and a reviewed installation file runs `plan` and `install` unattended ([Hive guide](https://hivemagnus.com/guides/hive.md#repeatable-plans)).

Every repository is Apache-2.0 and has an AGENTS.md for people and coding agents who contribute.

## Choose a project

| Need | Project | Guide | Repository |
| --- | --- | --- | --- |
| Install a tested suite from signed, digest-pinned releases, then upgrade, back up and recover it | Hive | [Hive](https://hivemagnus.com/guides/hive.md) | [ChefTaco/hive](https://github.com/ChefTaco/hive) |
| Reviewed hardening, vulnerability remediation and independent verification through Magnus | Embermend | [Embermend](https://hivemagnus.com/guides/embermend.md) | [ChefTaco/Embermend](https://github.com/ChefTaco/Embermend) |
| One browser UI for every installed product | HiveXUI | [HiveXUI](https://hivemagnus.com/guides/hivexui.md) | [ChefTaco/HiveXUI](https://github.com/ChefTaco/HiveXUI) |
| Identity, sign-in, roles, MFA, service identities and audit | Oathweave | [Oathweave](https://hivemagnus.com/guides/oathweave.md) | [ChefTaco/Oathweave](https://github.com/ChefTaco/Oathweave) |
| Route model requests to external providers, with quotas and traces | Emberpath | [Emberpath](https://hivemagnus.com/guides/emberpath.md) | [ChefTaco/Emberpath](https://github.com/ChefTaco/Emberpath) |
| Long-term agent memory, sessions, graph and workspaces | HiveMem | [HiveMem](https://hivemagnus.com/guides/hivemem.md) | [ChefTaco/HiveMem](https://github.com/ChefTaco/HiveMem) |
| Distribute immutable skills to agents | HiveSkills | [HiveSkills](https://hivemagnus.com/guides/hiveskills.md) | [ChefTaco/HiveSkills](https://github.com/ChefTaco/HiveSkills) |
| Inventory and operate Linux hosts, jobs, skills, and agent rollouts | Magnus | [Magnus](https://hivemagnus.com/guides/magnus.md) | [ChefTaco/magnus](https://github.com/ChefTaco/magnus) |
| Run durable agent tasks, locally or under fleet management | Ardent | [Ardent](https://hivemagnus.com/guides/ardent.md) | [ChefTaco/Ardent](https://github.com/ChefTaco/Ardent) |
| Give a team of Ardent agents a shared project, then review what they deliver | Ardent Project Studio | [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md) | [ChefTaco/ArdentStudio](https://github.com/ChefTaco/ArdentStudio) |
| Investigate security observations, preserve evidence, and approve response | Cindertrace | [Cindertrace](https://hivemagnus.com/guides/cindertrace.md) | [ChefTaco/cindertrace](https://github.com/ChefTaco/cindertrace) |
| Self-host channels, DMs, threads, and agent conversations | ChatterMost | [ChatterMost](https://hivemagnus.com/guides/chattermost.md) | [ChefTaco/ChatterMost](https://github.com/ChefTaco/ChatterMost) |
| Fit context and carry continuity into the next model turn | Emberfold | [Emberfold](https://hivemagnus.com/guides/emberfold.md) | [ChefTaco/emberfold](https://github.com/ChefTaco/emberfold) |

Hive installs only from a signed release. The launcher selects the [latest published suite release](https://github.com/ChefTaco/hive/releases/latest) or an exact version you choose, and runs its matching tagged controller. The suite installation guide reviews [Hive {{hm.suite}}](https://github.com/ChefTaco/hive/releases/tag/v{{hm.suite}}) and the product versions it pins. Upgrading from 2.x with PostgreSQL stores, from a release before 3.4.0 with Emberpath or HiveSkills, from one before 3.6.0 with Embermend, or from one before 3.8.0 with Magnus, or from one before 3.12.0 where HiveMem has data owned by `hive-router`, needs `--allow-migrations`, and so does every upgrade from a release before 3.14.0 to 3.14.0 or later, for Emberpath 2.6.0's data format (from 3.14.0 to 3.14.1 needs no flag), and so does an upgrade from a release before 3.14.2 on an installation with a suite-managed Magnus, for Magnus 3.3.4's additive migration, and so does every upgrade from a release before 3.15.0, for Oathweave's and HiveSkills' data formats (from 3.15.0 to 3.15.1 needs no flag), and so does an upgrade from a release before 3.15.2 on an installation with a suite-managed Magnus, for Magnus 3.5.0's fast migration (from 3.15.2 to 3.15.3 needs no flag), and code-only rollback across the 2.x PostgreSQL migration is refused; see the [Hive guide](https://hivemagnus.com/guides/hive.md#upgrade). A passing disposable rehearsal is not production cutover approval. Existing installations keep their own recovery paths and upgrade guides.

Ollama, llama.cpp, other inference services and hosted providers remain external. Hive only configures and verifies endpoints and protected credential references, then registers verified providers with Emberpath. It never installs, manages or stores inference services or model assets.

## How they connect

- HiveXUI is the single browser UI of a Hive installation: Emberpath, HiveSkills and Cindertrace no longer bundle a web UI of their own. It is a static application with no backend: every call goes to the owning product's API with the signed-in user's own credentials, and sections appear only for installed products. It is dark only for now. One product UI remains: Magnus's standalone console for installations without the suite. From 0.10.0 HiveXUI also serves a standalone Cindertrace and its investigation lab in local mode, and on a suite installation offers a Cindertrace recovery sign-in when Oathweave is unavailable.
- Hive owns deployment orchestration. Every installation also runs a mandatory Hive Registry, its install catalog and lookup API, written by `hive.sh` and read through `/api/registry`. From Hive 3.13.0 it also serves administrators an inventory of what each host runs beside the signed release pins, which HiveXUI shows on its Installed software page, and from Hive 3.14.0 the service capabilities each product offers the others. It is separate from HiveSkills, the skills registry.
- Oathweave, Emberpath and HiveMem provide independent identity, routing and memory integrations for Magnus. In a Hive installation Magnus's browser pages are HiveXUI's fleet module at `/fleet`. Its web terminal goes through a separate fleet gateway requiring fresh identity verification, and is off unless deployed. Ardent can use HiveMem for long-term memory.
- Cindertrace is a section of HiveXUI in a Hive installation, and also runs standalone with its local login, serving HiveXUI in local mode; 0.8.0 removed its own console. From Hive 3.12.0, `hive.sh add cindertrace` adds it to an existing installation and the optional managed `cindertrace-collector` component runs its collector inside the installation. Oathweave can add identity sign-in and Emberpath can supply scoped routing security metadata; Magnus can add fleet context and explicitly approved host response. Cindertrace owns investigations and evidence; Magnus retains host execution. Its optional [evolving investigation lab](https://hivemagnus.com/guides/cindertrace.md#try-the-evolving-investigation-lab) is a separate disposable synthetic installation that forbids external identity and integrations, so it serves HiveXUI in local mode with its own sign-in and is not reached through a suite installation.
- Ardent is its own product with its own repository. It runs standalone and does not require a Magnus server; Magnus can install and manage it on fleet hosts. In Hive {{hm.suite}} the Magnus host agent stages the Ardent package its signed lock pins ({{hm.version:ardent}}; from 3.2.0 Ardent resumes interrupted tasks and records their lineage), Magnus installs it, and `hive.sh ardent setup` creates a first assistant profile through Magnus once the node is enrolled. From Hive 3.15.2, an agent whose model is an Emberpath alias gets an Emberpath client key, created in Emberpath and delivered through Magnus's New Agent.
- Ardent Project Studio is an optional suite product, the Studio section of HiveXUI at `/studio`. It needs Magnus with at least one Ardent agent, HiveMem and Oathweave, and reaches agents only through Magnus.
- Ardent imports a pinned Emberfold library for context fitting. The separate Emberfold HTTP service is optional. Ardent retains its authoritative history and task journal.
- ChatterMost implements Mattermost-compatible REST and WebSocket interfaces. Its browser interface in a Hive installation is a section of HiveXUI; the official apps connect directly. Hermes Agent connects through its Mattermost gateway; Ardent has an optional Mattermost channel.
- Emberfold offers a TypeScript library, CLI, optional authenticated HTTP service, and a standard Hermes context-engine plugin. It has no HiveXUI section and does not require Hive or Magnus.

Enable only the integrations you configure. Installing every project is not a prerequisite for using one.

## Install and explore

The visual homepage leads with a feature overview, what the suite is good for, the two ways to deploy it, a one-line command to launch the signed Hive installer, an interactive architecture, then a section for each of the twelve products. The full-stack installer targets Linux today; macOS and Windows are coming. On a fresh Ubuntu or Debian host:

```bash
git clone https://github.com/ChefTaco/hive.git && cd hive && ./hive.sh --release latest
```

The launcher resolves `latest` once, reports the exact version, and runs its matching tagged controller. Replace `latest` with an exact version, such as `{{hm.suite}}`, to choose it explicitly. After setup, use the matching release checkout for lifecycle commands and certificate renewal. If the launcher downloads one, it prints that retained path; otherwise keep using this checkout. Keep the selected directory. Choose the `full` profile in setup, review the plan and confirm to install the suite. On a fresh local host, guided setup offers to install Docker Engine with Compose and Hive's other prerequisite tools with your consent, and Tailscale can supply the DNS name and TLS certificate; otherwise prepare them first. Follow the [Hive guide](https://hivemagnus.com/guides/hive.md#install) for host preparation, TLS and sign-in. After signing in, create your own administrator in Oathweave with the IAM Administrator role and run `./hive.sh admin-access setup` to give it access to each installed product. Ardent is not a suite container: in Hive {{hm.suite}} the Magnus host agent stages its pinned package and Magnus installs it on the host. Model runtimes and storage stay external.

[Tailscale](https://tailscale.com/download) is the recommended optional path to private access to HiveXUI and a certificate. Install and sign in on your Linux host and browser computer, then enable MagicDNS and HTTPS Certificates using [Tailscale's guide](https://tailscale.com/docs/how-to/set-up-https-certificates). After cloning Hive and preparing its prerequisites, run `sudo ./scripts/console-certificate.sh tailscale` from the checkout. This helper discovers the host's Tailscale name, requests a certificate and prints the HTTPS origin and file paths to enter in Hive setup. Guided setup can also request it when Tailscale is already signed in with HTTPS Certificates enabled; otherwise the installer asks for existing certificate files. After installation, `sudo ./scripts/console-certificate.sh schedule --config FILE` schedules renewal; replace `FILE` with the protected installation file setup created and rerun from the new checkout after upgrades. Certificates expose the hostname in public Certificate Transparency logs. Your own certificates are supported too. The visual site provides these steps in a keyboard-accessible setup modal.

Each product section pairs an overview with a synthetic capture of its area in HiveXUI, the single browser UI. Magnus and Cindertrace offer multiple views. Ardent has no browser screen; its section explicitly shows Magnus mission control, where its host is managed. Emberfold shows actual synthetic CLI dry-run output. The architecture distinguishes suite services, separately configured Ardent, its bundled Emberfold library, and external inference.

Use `#interface-embermend`, `#interface-hive`, `#interface-magnus`, `#interface-ardent`, `#interface-oathweave`, `#interface-emberpath`, `#interface-hivemem`, `#interface-hiveskills`, `#interface-cindertrace`, `#interface-chattermost`, `#interface-hivexui`, or `#interface-emberfold` to go directly to a product. The earlier `#security` link still goes to Cindertrace, and `#interfaces` goes to the product overview. The use cases are at `#uses`, the two deployment paths at `#paths`, and the detailed installation walkthroughs at `#walkthroughs`.

The footer links [GitHub / ChefTaco](https://github.com/ChefTaco) and [npm / hivemagnus](https://www.npmjs.com/~hivemagnus). npm includes SDKs and individual packages; the current full suite is installed from a signed Hive release rather than the legacy npm launcher.

## Related projects

Three public projects sit beside the suite and are not installed by Hive:

- [HiveCommon](https://github.com/ChefTaco/HiveCommon) (`@hivemagnus/hive-common` 0.10.0): the shared server kit the suite products use for Oathweave token verification, the error envelope, health, request context, the Hive Registry client, logging and HiveEvents.
- [canvas-word](https://github.com/ChefTaco/canvas-word): a canvas-based Word document engine for the browser (`@hivemagnus/canvas-word-engine` 2.0.0) and a headless DOCX codec (`@hivemagnus/canvas-word-codec` 1.2.0), maintained MIT forks of canvas-editor projects.
- [Proser](https://github.com/HiveMagnus/proser) (release 1.2.1): a self-hosted writing studio for long-form fiction, installed with its own Docker Compose files. Writers with an Oathweave account sign in through Oathweave in the browser, with passkeys and MFA at Oathweave; 1.2.1 retired its Oathweave password relay.

## Limits and licensing

This is a static project documentation site, with no required account or backend. It does not host a public operational API, MCP server, or A2A agent endpoint.

ChatterMost is independently developed and Mattermost-compatible. Mobile background push delivery, calls and upstream server plugins/marketplace are not implemented. Native Mattermost sessions remain available. Mattermost, Inc. does not affiliate with, endorse, or sponsor ChatterMost.

Embermend is optional in compatible signed Hive releases and requires Magnus. Begin with explicitly scoped assessment; production mutation policies remain disabled until authorized. Its acceptance ledger records bounded reference workflows, failure recovery and coverage limits.

The ecosystem products, HiveCommon and Proser use Apache-2.0; canvas-word's forks use MIT. Read the relevant repository's AGENTS.md before contributing. See the [site source](https://github.com/ChefTaco/HiveMagnus) for the website itself.
