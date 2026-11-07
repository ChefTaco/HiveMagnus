# HiveXUI

> The single browser console for a Hive installation: fleet, identity, models, memory, skills, security and chat in one shell, with sections only for installed products.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveXUI) · [Theme](https://github.com/ChefTaco/HiveXUI/blob/main/docs/THEME.md)

## Responsibility

HiveXUI is a static TypeScript and React application. The container serves compiled assets only: no application backend, database access, signing keys or infrastructure credentials. Same-origin HTTPS ingress forwards the signed-in user's own credentials to the owning API. Access tokens stay in memory; Oathweave owns the SSO session. Nothing puts credentials in URLs or browser storage.

The console shows one section per installed product, plus Hive and System. The Hive Registry is the source of which products are installed when it is reachable; a section shows only for a product that the runtime `products` configure and the Registry lists. If the Registry is unreachable or unreadable, the console follows `runtime.json` and warns on the overview. A bookmark to an absent product opens the overview. `Ctrl` or `Cmd` + `K` searches every visible screen. There is one theme for now: dark, in the Magnus look.

## What it covers

| Section | Product | Notes |
| --- | --- | --- |
| Hive | Installation readiness and incidents | Readiness shows availability, not migration or workflow acceptance |
| Magnus | Fleet console at `/fleet` | Reaches an allowlist of browser routes through `/api/magnus`. The web terminal appears only when a fleet gateway is deployed |
| Oathweave | Users, roles, clients, sessions, audit | Actors also needs Emberpath and HiveMem |
| Emberpath | Providers, routing, tests, keys, traces | |
| HiveMem | Memories, workspaces, memory operations | |
| HiveSkills | Catalogue, archives, assignments | |
| Cindertrace | Cases, events, evidence, policies, audit | The investigation lab keeps its own console; see the [Cindertrace guide](https://hivemagnus.com/guides/cindertrace.md#try-the-evolving-investigation-lab) |
| ChatterMost | Channels, DMs, threads, files, search, administration | Official apps connect to ChatterMost directly |

The HiveXUI README keeps native frontends and clients available until each module passes acceptance. Do not treat synthetic screenshots as evidence of backend authorization or workflow parity.

## In a Hive installation

[Hive](https://hivemagnus.com/guides/hive.md) 2.0.5 installs HiveXUI 0.1.1, a digest-pinned image, next to the ingress on the console host, in every profile, and writes its public runtime file. There is nothing else to configure.

## Build it

```bash
npm ci --ignore-scripts
npm run build
npm test
```

Expected result: compiled assets in `dist/`. `Dockerfile` serves them as UID 101. Without Hive, mount a public `runtime.json` listing product prefixes and Oathweave public clients, and configure HTTPS and API routing in a separate ingress, as the README describes. Runtime JSON contains public identifiers only.

## Source review

Reviewed 2026-11-05 against tag `v0.1.1`, commit `18120937ad89443df81e789b0494ba7f217fc2b9`: [README](https://github.com/ChefTaco/HiveXUI/blob/18120937ad89443df81e789b0494ba7f217fc2b9/README.md), [changelog](https://github.com/ChefTaco/HiveXUI/blob/18120937ad89443df81e789b0494ba7f217fc2b9/CHANGELOG.md) and [theme](https://github.com/ChefTaco/HiveXUI/blob/18120937ad89443df81e789b0494ba7f217fc2b9/docs/THEME.md). The [0.1.1 release](https://github.com/ChefTaco/HiveXUI/releases/tag/v0.1.1) publishes the container image that Hive installs. License: Apache-2.0.
