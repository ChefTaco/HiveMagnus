# Hive:Magnus

> Open source tools for running agents on your own infrastructure.

[Visual site](https://hivemagnus.com/) · [Agent index](https://hivemagnus.com/llms.txt)

## Choose a project

| Need | Project | Guide | Repository |
| --- | --- | --- | --- |
| Suite installation, pinned release bundles, upgrades and recovery | Hive | [Hive](https://hivemagnus.com/guides/hive.md) | [ChefTaco/hive](https://github.com/ChefTaco/hive) |
| Inventory and operate Linux hosts, jobs, skills, and agent rollouts | Magnus | [Magnus](https://hivemagnus.com/guides/magnus.md) | [ChefTaco/magnus](https://github.com/ChefTaco/magnus) |
| Run durable agent tasks, locally or under fleet management | Ardent, inside Magnus | [Ardent](https://hivemagnus.com/guides/magnus.md#ardent-with-bundled-emberfold) | [Ardent source](https://github.com/ChefTaco/magnus/tree/main/packages/ardent) |
| Investigate security observations, preserve evidence, and approve response | Cindertrace | [Cindertrace](https://hivemagnus.com/guides/cindertrace.md) | [ChefTaco/cindertrace](https://github.com/ChefTaco/cindertrace) |
| Self-host channels, DMs, threads, and agent conversations | ChatterMost | [ChatterMost](https://hivemagnus.com/guides/chattermost.md) | [ChefTaco/ChatterMost](https://github.com/ChefTaco/ChatterMost) |
| Fit context and carry continuity into the next model turn | Emberfold | [Emberfold](https://hivemagnus.com/guides/emberfold.md) | [ChefTaco/emberfold](https://github.com/ChefTaco/emberfold) |

## Extracted product candidates

The target suite separates these owners. There is no official signed suite release yet; keep legacy frontends and recovery artifacts until replacement acceptance passes.

| Product | Responsibility | Candidate guide |
| --- | --- | --- |
| Emberpath | External providers, model routing, aliases, quotas and telemetry. | [Emberpath](/guides/emberpath.md) |
| Oathweave | Identity, authentication, authorization, browser sign-in and service identities. | [Oathweave](/guides/oathweave.md) |
| HiveMem | Memory storage, retrieval, sessions, graph evidence, consolidation and workspaces. | [HiveMem](/guides/hivemem.md) |
| HiveSkills | Skills registry, immutable archives, channels, assignments and distribution. | [HiveSkills](/guides/hiveskills.md) |
| HiveXUI | Shared strict TypeScript, React and Vite browser application. | [HiveXUI](/guides/hivexui.md) |

Ollama, llama.cpp, other inference services and hosted providers remain external. Hive only configures and verifies endpoints and protected credential references, then registers verified providers with Emberpath. It never installs, manages or stores inference services or model assets.

## How they connect

- Oathweave, Emberpath and HiveMem provide independent identity, routing and memory integrations for Magnus. Hive owns deployment orchestration. Ardent can use HiveMem for long-term memory.
- Cindertrace runs standalone with local login. Oathweave can add identity sign-in and Emberpath can supply scoped routing security metadata; Magnus can add fleet context and explicitly approved host response. Cindertrace owns investigations and evidence; Magnus retains host execution. Its optional [evolving investigation lab](https://hivemagnus.com/guides/cindertrace.md#try-the-evolving-investigation-lab) uses a separate disposable installation to compare hypotheses, citations, confidence changes, and human-approved simulated containment over three evidence releases.
- Magnus ships Ardent and can manage it on fleet hosts. Ardent also runs standalone; it does not require a Magnus server.
- Ardent imports a pinned Emberfold library for context fitting. The separate Emberfold HTTP service is optional. Ardent retains its authoritative history and task journal.
- ChatterMost implements Mattermost-compatible REST and WebSocket interfaces. Hermes Agent connects through its Mattermost gateway; Ardent has an optional Mattermost channel.
- Emberfold offers a TypeScript library, CLI, optional authenticated HTTP service, and a standard Hermes context-engine plugin. It does not require Hive or Magnus.

Enable only the integrations you configure. Installing every project is not a prerequisite for using one.

## Install and explore

Each linked guide gives prerequisites, copyable commands, expected results, and full repository instructions. The visual site's install lab explains the first steps for Hive, Magnus, Cindertrace, ChatterMost, and Ardent with Emberfold. Commands shown on the site do not execute in visitors' environments.

The hero and project directory link directly to each project's interface. Section 3, In the interface, includes all product boundaries in one selectable gallery. Cindertrace is selected initially, with separate overview and investigation views; Emberfold shows actual synthetic CLI dry-run output. All UI captures use disposable sample environments. The atlas distinguishes optional integrations from bundled components.

Use `#interface-hive`, `#interface-magnus`, `#interface-cindertrace`, `#interface-chattermost`, or `#interface-emberfold` on the visual site to select an interface directly. The earlier `#security` link still opens Cindertrace.

## Limits and licensing

This is a static project documentation site, with no required account or backend. It does not host a public operational API, MCP server, or A2A agent endpoint.

ChatterMost is independently developed and Mattermost-compatible. Mobile background push delivery, calls and upstream server plugins/marketplace are not implemented. Suite browser identity is under candidate acceptance; native Mattermost sessions remain available. Mattermost, Inc. does not affiliate with, endorse, or sponsor ChatterMost.

The ecosystem products use Apache-2.0. Read the relevant repository's AGENTS.md before contributing. See the [site source](https://github.com/ChefTaco/HiveMagnus) for the website itself.
