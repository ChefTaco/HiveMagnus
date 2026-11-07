# Hive:Magnus

> Open source tools for running agents on your own infrastructure.

[Visual site](https://hivemagnus.com/) · [Agent index](https://hivemagnus.com/llms.txt)

## Choose a project

| Need | Project | Guide | Repository |
| --- | --- | --- | --- |
| Install a tested suite from signed, digest-pinned releases, then upgrade, back up and recover it | Hive | [Hive](https://hivemagnus.com/guides/hive.md) | [ChefTaco/hive](https://github.com/ChefTaco/hive) |
| One browser console for every installed product | HiveXUI | [HiveXUI](https://hivemagnus.com/guides/hivexui.md) | [ChefTaco/HiveXUI](https://github.com/ChefTaco/HiveXUI) |
| Identity, sign-in, roles, MFA, service identities and audit | Oathweave | [Oathweave](https://hivemagnus.com/guides/oathweave.md) | [ChefTaco/Oathweave](https://github.com/ChefTaco/Oathweave) |
| Route model requests to external providers, with quotas and traces | Emberpath | [Emberpath](https://hivemagnus.com/guides/emberpath.md) | [ChefTaco/Emberpath](https://github.com/ChefTaco/Emberpath) |
| Long-term agent memory, sessions, graph and workspaces | HiveMem | [HiveMem](https://hivemagnus.com/guides/hivemem.md) | [ChefTaco/HiveMem](https://github.com/ChefTaco/HiveMem) |
| Distribute immutable skills to agents | HiveSkills | [HiveSkills](https://hivemagnus.com/guides/hiveskills.md) | [ChefTaco/HiveSkills](https://github.com/ChefTaco/HiveSkills) |
| Inventory and operate Linux hosts, jobs, skills, and agent rollouts | Magnus | [Magnus](https://hivemagnus.com/guides/magnus.md) | [ChefTaco/magnus](https://github.com/ChefTaco/magnus) |
| Run durable agent tasks, locally or under fleet management | Ardent | [Ardent](https://hivemagnus.com/guides/magnus.md#ardent-with-bundled-emberfold) | [Ardent source](https://github.com/ChefTaco/Ardent) |
| Investigate security observations, preserve evidence, and approve response | Cindertrace | [Cindertrace](https://hivemagnus.com/guides/cindertrace.md) | [ChefTaco/cindertrace](https://github.com/ChefTaco/cindertrace) |
| Self-host channels, DMs, threads, and agent conversations | ChatterMost | [ChatterMost](https://hivemagnus.com/guides/chattermost.md) | [ChefTaco/ChatterMost](https://github.com/ChefTaco/ChatterMost) |
| Fit context and carry continuity into the next model turn | Emberfold | [Emberfold](https://hivemagnus.com/guides/emberfold.md) | [ChefTaco/emberfold](https://github.com/ChefTaco/emberfold) |

Hive installs only from a signed release. The current suite release is [Hive 2.0.0](https://github.com/ChefTaco/hive/releases/tag/v2.0.0); later ones appear on the [releases page](https://github.com/ChefTaco/hive/releases). A passing disposable rehearsal is not production cutover approval. Existing installations keep their own recovery paths and upgrade guides.

Ollama, llama.cpp, other inference services and hosted providers remain external. Hive only configures and verifies endpoints and protected credential references, then registers verified providers with Emberpath. It never installs, manages or stores inference services or model assets.

## How they connect

- HiveXUI is the single browser UI of a Hive installation. It is a static application with no backend: every call goes to the owning product's API with the signed-in user's own credentials, and sections appear only for installed products. It is dark only for now.
- Hive owns deployment orchestration. Every installation also runs a mandatory Hive Registry, its install catalog and lookup API, written by `hive.sh` and read through `/api/registry`. It is separate from HiveSkills, the skills registry.
- Oathweave, Emberpath and HiveMem provide independent identity, routing and memory integrations for Magnus. In a Hive installation Magnus's console is HiveXUI's fleet module at `/fleet`. Its web terminal goes through a separate fleet gateway requiring fresh identity verification, and is off unless deployed. Ardent can use HiveMem for long-term memory.
- Cindertrace is a section of HiveXUI in a Hive installation, and also runs standalone with its retained console and local login. Oathweave can add identity sign-in and Emberpath can supply scoped routing security metadata; Magnus can add fleet context and explicitly approved host response. Cindertrace owns investigations and evidence; Magnus retains host execution. Its optional [evolving investigation lab](https://hivemagnus.com/guides/cindertrace.md#try-the-evolving-investigation-lab) is a separate disposable synthetic installation that forbids external identity and integrations, so it keeps its own console and is not reached through HiveXUI.
- Ardent is its own product with its own repository. It runs standalone and does not require a Magnus server; Magnus can install and manage it on fleet hosts.
- Ardent imports a pinned Emberfold library for context fitting. The separate Emberfold HTTP service is optional. Ardent retains its authoritative history and task journal.
- ChatterMost implements Mattermost-compatible REST and WebSocket interfaces. Its browser interface in a Hive installation is a section of HiveXUI; the official apps connect directly. Hermes Agent connects through its Mattermost gateway; Ardent has an optional Mattermost channel.
- Emberfold offers a TypeScript library, CLI, optional authenticated HTTP service, and a standard Hermes context-engine plugin. It has no console section and does not require Hive or Magnus.

Enable only the integrations you configure. Installing every project is not a prerequisite for using one.

## Install and explore

Each linked guide gives prerequisites, copyable commands, expected results, and full repository instructions. The visual site's install lab explains the first steps for Hive, Magnus, Cindertrace, ChatterMost, and Ardent with Emberfold. Commands shown on the site do not execute in visitors' environments.

Section 3 shows one interface, HiveXUI, across its product areas: Hive, Magnus, Oathweave, Emberpath, HiveMem, HiveSkills, Cindertrace, ChatterMost and the command palette. Magnus and Cindertrace offer several views. Emberfold has no console section, so it appears below the gallery with actual synthetic CLI dry-run output. All captures use a disposable installation with synthetic data. The atlas distinguishes configured connections from bundled components.

Use `#interface-hive`, `#interface-magnus`, `#interface-oathweave`, `#interface-emberpath`, `#interface-hivemem`, `#interface-hiveskills`, `#interface-cindertrace`, `#interface-chattermost`, `#interface-hivexui`, or `#interface-emberfold` on the visual site to go to an area directly. The earlier `#security` link still opens Cindertrace.

## Limits and licensing

This is a static project documentation site, with no required account or backend. It does not host a public operational API, MCP server, or A2A agent endpoint.

ChatterMost is independently developed and Mattermost-compatible. Mobile background push delivery, calls and upstream server plugins/marketplace are not implemented. Native Mattermost sessions remain available. Mattermost, Inc. does not affiliate with, endorse, or sponsor ChatterMost.

The ecosystem products use Apache-2.0. Read the relevant repository's AGENTS.md before contributing. See the [site source](https://github.com/ChefTaco/HiveMagnus) for the website itself.
