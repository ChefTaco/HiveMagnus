# HiveXUI

> The single browser UI for a Hive installation: fleet, identity, models, memory, skills, security, chat and team projects in one shell, with sections only for installed products.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveXUI) · [Release 0.4.0](https://github.com/ChefTaco/HiveXUI/releases/tag/v0.4.0) · [Theme](https://github.com/ChefTaco/HiveXUI/blob/v0.4.0/docs/THEME.md)

## Responsibility

HiveXUI is a static TypeScript and React application. The container serves compiled assets only: no application backend, database access, signing keys or infrastructure credentials. Same-origin HTTPS ingress forwards the signed-in user's own credentials to the owning API. Access tokens stay in memory; Oathweave owns the SSO session. Nothing puts credentials in URLs or browser storage.

HiveXUI shows one section per installed product, plus Hive and System. The Hive Registry is the source of which products are installed when it is reachable; a section shows only for a product that the runtime `products` configure and the Registry lists. If the Registry is unreachable or unreadable, HiveXUI follows `runtime.json` and warns on the overview. A bookmark to an absent product opens the overview. `Ctrl` or `Cmd` + `K` searches every visible screen. There is one theme for now: dark, in the Magnus look.

## What it covers

| Section | Product | Notes |
| --- | --- | --- |
| Hive | Installation overview and incidents | Readiness shows availability, not migration or workflow acceptance |
| Magnus | Fleet, operations, provisioning, Hermes Agent, Ardent and Codex pages at `/fleet` | Reaches an allowlist of browser routes through `/api/magnus`. The web terminal appears on node detail only when a fleet gateway is deployed |
| Studio | [Ardent Project Studio](https://hivemagnus.com/guides/ardent-studio.md) | Projects and Gallery open a fullscreen page at `/studio`. Needs at least one Ardent agent in Magnus |
| Oathweave | Account security, users, roles, service accounts, clients, sessions, audit | Actors also needs Emberpath and HiveMem |
| Emberpath | Routers, providers, routing, tests, traces, API keys, audit | |
| HiveMem | Memories, memory operations, workspaces | |
| HiveSkills | Catalogue, releases, assignments, agent targets, distribution receipts, deployment jobs | |
| Cindertrace | Cases, entities, events, evidence, sources, policies, audit, approvals | The investigation lab keeps its own UI and local sign-in; see the [Cindertrace guide](https://hivemagnus.com/guides/cindertrace.md#try-the-evolving-investigation-lab) |
| ChatterMost | Channels, DMs, threads, files, search, administration | Official apps connect to ChatterMost directly |

The HiveXUI README keeps native frontends and clients available until each module passes acceptance. Do not treat synthetic screenshots as evidence of backend authorization or workflow parity.

## In a Hive installation

[Hive](https://hivemagnus.com/guides/hive.md) 3.3.0 installs HiveXUI 0.4.0, a digest-pinned image, next to the ingress, in every profile, and writes its public runtime file. There is nothing else to configure. In 0.4.0, every product's errors show a consistent message with the product's code and request ID, destructive actions are confirmed in one shared dialog, and the Magnus fleet timeline and data retention have their own pages again.

## Build it

```bash
npm ci --ignore-scripts
npm run build
npm test
```

Expected result: compiled assets in `dist/`. `Dockerfile` serves them as UID 101. Without Hive, mount a public `runtime.json` listing product prefixes and Oathweave public clients, and configure HTTPS and API routing in a separate ingress, as the README describes. Runtime JSON contains public identifiers only.

## Source review

Reviewed 2026-11-12 against tag `v0.2.7`, commit `de613008a438a90d660e5a7161b3fe805095572b`, the version Hive `v3.1.1` pins: [README](https://github.com/ChefTaco/HiveXUI/blob/v0.2.7/README.md), [changelog](https://github.com/ChefTaco/HiveXUI/blob/v0.2.7/CHANGELOG.md) and [theme](https://github.com/ChefTaco/HiveXUI/blob/v0.2.7/docs/THEME.md). The [0.2.7 release](https://github.com/ChefTaco/HiveXUI/releases/tag/v0.2.7) publishes the container image that Hive installs. License: Apache-2.0.

Release update, 2026-11-12: [Hive 3.3.0](https://github.com/ChefTaco/hive/releases/tag/v3.3.0) pins HiveXUI 0.4.0, tag [`v0.4.0`](https://github.com/ChefTaco/HiveXUI/releases/tag/v0.4.0), commit `96dd09e5b6b6989d73a738a0c0c26bdb2c4be50d`. Compared with 0.2.7, its [README](https://github.com/ChefTaco/HiveXUI/blob/v0.4.0/README.md) keeps the same sections and build commands and now notes that every page of the earlier Magnus dashboard has an equivalent, apart from the deliberate omissions listed in the Magnus module. Per its [changelog](https://github.com/ChefTaco/HiveXUI/blob/v0.4.0/CHANGELOG.md), 0.3.0 added the Embermend section, and 0.4.0 sends an `x-request-id` with every API request, presents every section through the shared UI kit, names audit and incident pages by product, derives navigation and deep links from one route table without changing any address, adds automated WCAG 2.1 A/AA checks and updates the Magnus agent upgrade drawer.
