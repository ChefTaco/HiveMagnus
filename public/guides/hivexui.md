# HiveXUI

> The single browser console for a Hive installation: fleet, identity, models, memory, skills, security and chat in one shell, with sections only for installed products.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveXUI) · [Theme](https://github.com/ChefTaco/HiveXUI/blob/main/docs/THEME.md)

## Responsibility

HiveXUI is a static TypeScript and React application. The container serves compiled assets only: no application backend, database access, signing keys or infrastructure credentials. Same-origin HTTPS ingress forwards the signed-in user's own credentials to the owning API. Access tokens stay in memory; Oathweave owns the SSO session. Nothing puts credentials in URLs or browser storage.

Runtime `products` decide what the console shows: one section per installed product, plus Hive and System. A bookmark to an absent product opens the overview. `Ctrl` or `Cmd` + `K` searches every visible screen. There is one theme for now: dark, in the Magnus look.

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

The HiveXUI README records these modules as ports with workflows still under live integration acceptance. Keep native clients available, and do not treat synthetic screenshots as evidence of backend authorization or workflow parity.

## In a Hive installation

[Hive](https://hivemagnus.com/guides/hive.md) installs HiveXUI next to the ingress on the console host, in every profile, and writes its public runtime file. There is nothing else to configure.

## Build it

```bash
npm ci --ignore-scripts
npm run build
npm test
```

Expected result: compiled assets in `dist/`. `Dockerfile` serves them as UID 101. Without Hive, mount a public `runtime.json` listing product prefixes and Oathweave public clients, and configure HTTPS and API routing in a separate ingress, as the README describes. Runtime JSON contains public identifiers only.

## Source review

Reviewed 2026-11-05 against public revision `565eec413fd4361f0db319ecfb9384a860c7b05f`: [README](https://github.com/ChefTaco/HiveXUI/blob/565eec413fd4361f0db319ecfb9384a860c7b05f/README.md), [changelog](https://github.com/ChefTaco/HiveXUI/blob/565eec413fd4361f0db319ecfb9384a860c7b05f/CHANGELOG.md) and [theme](https://github.com/ChefTaco/HiveXUI/blob/565eec413fd4361f0db319ecfb9384a860c7b05f/docs/THEME.md). License: Apache-2.0.
