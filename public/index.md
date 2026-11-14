# Hive:Magnus

> Full-stack agent management on your own infrastructure.

[Visual site](https://hivemagnus.com/) · [Agent index](https://hivemagnus.com/llms.txt)

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

Hive installs only from a signed release. The launcher selects the [latest published suite release](https://github.com/ChefTaco/hive/releases/latest) or an exact version you choose, and runs its matching tagged controller. The suite installation guide reviews [Hive 3.8.0](https://github.com/ChefTaco/hive/releases/tag/v3.8.0) and the product versions it pins. Upgrading to 3.8.0 from 2.x with PostgreSQL stores, from a release before 3.4.0, from one before 3.6.0 with Embermend, or from any earlier release with Magnus needs `--allow-migrations`, and code-only rollback across the 2.x PostgreSQL migration is refused; see the [Hive guide](https://hivemagnus.com/guides/hive.md#upgrade). A passing disposable rehearsal is not production cutover approval. Existing installations keep their own recovery paths and upgrade guides.

Ollama, llama.cpp, other inference services and hosted providers remain external. Hive only configures and verifies endpoints and protected credential references, then registers verified providers with Emberpath. It never installs, manages or stores inference services or model assets.

## How they connect

- HiveXUI is the single browser UI of a Hive installation, and the only UI of the suite: Emberpath and HiveSkills no longer bundle a web UI of their own. It is a static application with no backend: every call goes to the owning product's API with the signed-in user's own credentials, and sections appear only for installed products. It is dark only for now.
- Hive owns deployment orchestration. Every installation also runs a mandatory Hive Registry, its install catalog and lookup API, written by `hive.sh` and read through `/api/registry`. It is separate from HiveSkills, the skills registry.
- Oathweave, Emberpath and HiveMem provide independent identity, routing and memory integrations for Magnus. In a Hive installation Magnus's browser pages are HiveXUI's fleet module at `/fleet`. Its web terminal goes through a separate fleet gateway requiring fresh identity verification, and is off unless deployed. Ardent can use HiveMem for long-term memory.
- Cindertrace is a section of HiveXUI in a Hive installation, and also runs standalone with its retained console and local login. Oathweave can add identity sign-in and Emberpath can supply scoped routing security metadata; Magnus can add fleet context and explicitly approved host response. Cindertrace owns investigations and evidence; Magnus retains host execution. Its optional [evolving investigation lab](https://hivemagnus.com/guides/cindertrace.md#try-the-evolving-investigation-lab) is a separate disposable synthetic installation that forbids external identity and integrations, so it keeps its own console and is not reached through HiveXUI.
- Ardent is its own product with its own repository. It runs standalone and does not require a Magnus server; Magnus can install and manage it on fleet hosts. In Hive 3.8.0 the Magnus host agent stages the Ardent package its signed lock pins, and Magnus installs it.
- Ardent Project Studio is an optional suite product, the Studio section of HiveXUI at `/studio`. It needs Magnus with at least one Ardent agent, HiveMem and Oathweave, and reaches agents only through Magnus.
- Ardent imports a pinned Emberfold library for context fitting. The separate Emberfold HTTP service is optional. Ardent retains its authoritative history and task journal.
- ChatterMost implements Mattermost-compatible REST and WebSocket interfaces. Its browser interface in a Hive installation is a section of HiveXUI; the official apps connect directly. Hermes Agent connects through its Mattermost gateway; Ardent has an optional Mattermost channel.
- Emberfold offers a TypeScript library, CLI, optional authenticated HTTP service, and a standard Hermes context-engine plugin. It has no HiveXUI section and does not require Hive or Magnus.

Enable only the integrations you configure. Installing every project is not a prerequisite for using one.

## Install and explore

The visual homepage leads with a feature overview, a one-line command to launch the signed Hive installer, an interactive architecture, then a section for each of the twelve products. The full-stack installer targets Linux today; macOS and Windows are coming. On a fresh Ubuntu or Debian host:

```bash
git clone https://github.com/ChefTaco/hive.git && cd hive && ./hive.sh --release latest
```

The launcher resolves `latest` once, reports the exact version, and runs its matching tagged controller. Replace `latest` with an exact version, such as `3.8.0`, to choose it explicitly. After setup, use the matching release checkout for lifecycle commands and certificate renewal. If the launcher downloads one, it prints that retained path; otherwise keep using this checkout. Keep the selected directory. Choose the `full` profile in setup, review the plan and confirm to install the suite. On a fresh local host, guided setup offers to install Docker Engine with Compose and Hive's other prerequisite tools with your consent, and Tailscale can supply the DNS name and TLS certificate; otherwise prepare them first. Follow the [Hive guide](https://hivemagnus.com/guides/hive.md#install) for host preparation, TLS and sign-in. Ardent is not a suite container: in Hive 3.8.0 the Magnus host agent stages its pinned package and Magnus installs it on the host. Model runtimes and storage stay external.

[Tailscale](https://tailscale.com/download) is the recommended optional path to private access to HiveXUI and a certificate. Install and sign in on your Linux host and browser computer, then enable MagicDNS and HTTPS Certificates using [Tailscale's guide](https://tailscale.com/docs/how-to/set-up-https-certificates). After cloning Hive and preparing its prerequisites, run `sudo ./scripts/console-certificate.sh tailscale` from the checkout. This helper discovers the host's Tailscale name, requests a certificate and prints the HTTPS origin and file paths to enter in Hive setup. The installer itself asks for existing certificate files. After installation, `sudo ./scripts/console-certificate.sh schedule --config FILE` schedules renewal; replace `FILE` with the protected installation file setup created and rerun from the new checkout after upgrades. Certificates expose the hostname in public Certificate Transparency logs. Your own certificates are supported too. The visual site provides these steps in a keyboard-accessible setup modal.

Each product section pairs an overview with a synthetic capture of its area in HiveXUI, the single browser UI. Magnus and Cindertrace offer multiple views. Ardent has no browser screen; its section explicitly shows Magnus mission control, where its host is managed. Emberfold shows actual synthetic CLI dry-run output. The architecture distinguishes suite services, separately configured Ardent, its bundled Emberfold library, and external inference.

Use `#interface-embermend`, `#interface-hive`, `#interface-magnus`, `#interface-ardent`, `#interface-oathweave`, `#interface-emberpath`, `#interface-hivemem`, `#interface-hiveskills`, `#interface-cindertrace`, `#interface-chattermost`, `#interface-hivexui`, or `#interface-emberfold` to go directly to a product. The earlier `#security` link still goes to Cindertrace, and `#interfaces` goes to the product overview. The detailed installation walkthroughs are at `#walkthroughs`.

The footer links [GitHub / ChefTaco](https://github.com/ChefTaco) and [npm / hivemagnus](https://www.npmjs.com/~hivemagnus). npm includes SDKs and individual packages; the current full suite is installed from a signed Hive release rather than the legacy npm launcher.

## Limits and licensing

This is a static project documentation site, with no required account or backend. It does not host a public operational API, MCP server, or A2A agent endpoint.

ChatterMost is independently developed and Mattermost-compatible. Mobile background push delivery, calls and upstream server plugins/marketplace are not implemented. Native Mattermost sessions remain available. Mattermost, Inc. does not affiliate with, endorse, or sponsor ChatterMost.

Embermend is optional in compatible signed Hive releases and requires Magnus. Begin with explicitly scoped assessment; production mutation policies remain disabled until authorized. Its acceptance ledger records bounded reference workflows, failure recovery and coverage limits.

The ecosystem products use Apache-2.0. Read the relevant repository's AGENTS.md before contributing. See the [site source](https://github.com/ChefTaco/HiveMagnus) for the website itself.
