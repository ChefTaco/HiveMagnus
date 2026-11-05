# HiveSkills

> The skills registry for agents: a digest-verified archive API with immutable releases, channels, assignments and audited distribution.

[Agent index](https://hivemagnus.com/llms.txt) · [Repository](https://github.com/ChefTaco/HiveSkills) · [README](https://github.com/ChefTaco/HiveSkills#readme)

## Responsibility

The registry distributes authenticated manifests and immutable archives. It is unrelated to the [Hive Registry](https://hivemagnus.com/guides/hive.md#hive-registry), which catalogs one installation's products. Approved host deployment runs through Magnus jobs and agents with a dedicated endpoint-scoped grant that cannot run arbitrary commands or administer the fleet.

## In a Hive installation

HiveSkills is part of the core profile, installed by [Hive](https://hivemagnus.com/guides/hive.md). Its catalogue, archive and assignment screens are in [HiveXUI](https://hivemagnus.com/guides/hivexui.md). Native host mappings are prepared separately and are never activated by installation alone.

## Run it on its own

Requires Linux, Node.js 24.22.1+ or 26.13.0+, TLS certificates and `pamtester` for OS-backed sign-in. Agent deployment also needs Bash, OpenSSH and permission to enable the target's user timer. Prepare a private `skills.env` with the settings its README lists, including a session secret from `openssl rand -hex 32`.

```bash
npx @hivemagnus/hive-skills check --env-file skills.env
npx @hivemagnus/hive-skills migrate --env-file skills.env
npx @hivemagnus/hive-skills --env-file skills.env
```

Expected result: `check` validates TLS, configuration and an existing database without creating state, and a fresh install starts with an empty catalog. On this standalone path the registry has its own OS-authenticated operator page, and its administration is independent of Oathweave sign-in.

## Source review

Reviewed 2026-11-05 against public revision `1d950c8695ab69af0c1d5ba246bbf6b0417fcbb8`: [README](https://github.com/ChefTaco/HiveSkills/blob/1d950c8695ab69af0c1d5ba246bbf6b0417fcbb8/README.md). The commands follow its npm instructions. Original attribution and migration history are preserved. License: Apache-2.0.
