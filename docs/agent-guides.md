# Agent documentation maintenance

`public/llms.txt` indexes the Markdown overview and ten project guides. The visual site links them in its For agents section and no-JavaScript fallback. The HTML head advertises `llms.txt` with `rel="describedby"` and the overview with `rel="alternate" type="text/markdown"`. Markdown responses also advertise the index through an HTTP Link header.

## Public source review, 2026-11-03

Commands were compared against the public GitHub source at these exact revisions, fetched independently of local product checkouts:

| Project | Revision | Reviewed sources |
| --- | --- | --- |
| Hive | `78fb6cced1aade79b4c55160754f4d6466bf8891` | `README.md`, `packages/hive/README.md`, `AGENTS.md` |
| Magnus / Ardent | `c53cbf3915a679c6545a4cea7fc4dce76ff00f7d` | `README.md`, `packages/ardent/README.md`, `AGENTS.md` |
| ChatterMost | `bab016695d493dcc094b82e0a498fac74bba9f7c` | `README.md`, `docs/containers.md`, `AGENTS.md` |
| Emberfold | `aac58682312fb509d8a7ba240b9a151651d272de` | `README.md`, `package.json`, `packages/cli/package.json`, package READMEs, `AGENTS.md` |

- Hive's `init`, `start`, and `doctor` follow the launcher guide. Documented platform, native dependency, Docker, and optional Skills requirements were checked.
- Magnus's managed `init` follows the root README. Ardent's install, profile initialization, model settings, diagnostics, chat, and gateway commands follow its package README. Emberfold is bundled; no additional HTTP service is required.
- ChatterMost's complete download/checksum/setup/start/status block matches the public agent runbook, including restrictive umask, fresh-directory check, argument ordering, and pinned `0.3.3` release. Hermes commands and configuration follow the root README. The site guide retains the documented HTTPS and single-writer requirements.
- Emberfold's CLI package/version, executable, and Node engines were checked against the public package manifest and npm metadata. The `prepare --input ... --dry-run` arguments and TypeScript example follow the root README. The synthetic input matches the site's existing sample. Hermes source revision and plugin/core version relationship follow the README.

The published Emberfold CLI `0.1.0` example was run in a temporary directory: exit 0, `fits: true`, `compacted: false`, zero protected spans verified, and no model calls. All guide Bash blocks passed shell syntax checks. Guide links were checked against public GitHub trees; all six Markdown files were present byte-for-byte in the build. The five metadata entries parse as JSON and the built script matches its CSP hash.

Command review does not install or reconfigure Hive, Magnus, ChatterMost, or a Hermes gateway. The Emberfold synthetic CLI example can be exercised in a temporary directory with no model credentials or persistent runtime. Full installation and release acceptance remain the owning repositories' responsibility.

## Updating guides

Fetch current public docs, record their commit IDs, and compare commands and prerequisites before changing examples. Preserve exact release pins where shown; never substitute mutable image tags. Recheck the interactive install lab if any documented command changes. Update each guide's source review date and immutable source links.

The static JSON-LD graph in `index.html` describes ten repositories and Ardent as a part of Magnus using Schema.org `SoftwareSourceCode`. It includes descriptions, repository URLs, TypeScript language, license links, and links to the guides. Keep its CSP SHA-256 hash in `public/_headers` synchronized with the exact script text, including whitespace. Do not loosen the policy to allow arbitrary inline scripts.

Before publishing, build, check local Markdown links and shell syntax, validate the JSON-LD and CSP hash, run the browser check, and inspect the For agents section at desktop/mobile widths. Review the Pages preview before promotion to `main`; verify live Markdown content types, discovery headers, assets, and the intended source revision after deployment.

## Cindertrace addition, 2026-11-04

Reviewed public Cindertrace `a92c12a4e7386be6099e6becebc115fc146b91b1`: README, installation, integrations, upgrade runbook, and package Node engines. The release pin `v0.1.0` resolves to application commit `576f4b4e7ba4ef5f0524deb213137b3fd643aa88`. The installation walkthrough uses that release's documented source/Compose path; no npm installer is advertised. The upgrade guide uses an explicit immutable commit and a dry run before activation. Current-state rollback and uncertain-effect handling follow the owning repository's runbook.

Magnus security ownership was checked against public `7a6782d2085702ef14e1bc997df65fe37d2b5673`. The Magnus guide links Cindertrace and identifies the retired embedded security runtime. Existing installation examples for the other projects are unchanged and retain their original review records.

The metadata graph now contains six SoftwareSourceCode entries: five projects and Ardent within Magnus. The Cindertrace captures come from a new disposable Compose installation, documented in media.md.

## Cindertrace evolving lab, 2026-11-04

Reviewed the public lab workflow at `0368abb6779c0c715e1dc00f7f346b2253f5f040` and the matching README, initialization and lifecycle scripts, API contracts, and upgrade guidance. The lab commands explicitly check out that revision in a new directory; `v0.1.0` predates the lab and remains the normal installation example. Documentation covers evidence-bound revisions, structured comparisons, separate progression credentials, human-approved simulation, and history-preserving restarts. The site links the lab from Cindertrace's interface panel; existing captures continue to depict the original synthetic demo, not the new lab. No screenshots or source metadata changed.

## Ecosystem candidate boundaries, 2026-11-05

The maintainer requested the five extracted products in the public directory: Emberpath, Oathweave, HiveMem, HiveSkills and HiveXUI. This supersedes the earlier five-project content limit. Candidate guides identify local implementation review and explicitly state that official publication and migration acceptance are pending. Existing published installation recipes retain their original source review and are labeled legacy where appropriate. No unverified new public repository link or official release is advertised.

The ten-product atlas distinguishes deployment orchestration, identity, model routing, memory, distribution, the static console, host execution, security, chat and context. Inference services, hosted providers and model storage remain external dependencies. The metadata and Markdown discovery index follow the same boundaries.

These two earlier records describe the site as reviewed then. The section below supersedes the candidate labels.

## Unified console, 2026-11-05

The extracted products are now public repositories, and HiveXUI is the single browser UI of a Hive installation. Guides for Emberpath, Oathweave, HiveMem, HiveSkills and HiveXUI now carry real commands from their READMEs at these public revisions, and link the repositories instead of a candidate label. Hive, Magnus, Cindertrace and ChatterMost guides gained their console and installer changes; Emberfold's revision is unchanged.

| Project | Revision | Reviewed sources |
| --- | --- | --- |
| Hive | `623eba65fc67b7b97bb58180088b6b8fb17dc307`, before the first suite release; superseded by `v2.0.0` below | `deployment/README.md`, `deployment/FULL.md`, `deployment/CUSTOM.md`, `deployment/DISTRIBUTED.md`, `docs/hive-registry-api.md`, `scripts/suite/suite-catalog.json`, `hive.sh --help` |
| HiveXUI | `565eec413fd4361f0db319ecfb9384a860c7b05f` | `README.md`, `CHANGELOG.md`, `docs/THEME.md`, `src/lib/navigation.ts` |
| Emberpath | `1ee9f3c37f28694ae971e2f8ec599b57ad4f89c0` | `README.md` |
| Oathweave | `f2150cc277e5b96b619cfaae98af96c54133e66d` | `README.md`, `apps/iam-core/README.md` |
| HiveMem | `ac4195fe4bc58647d74d644a6fbb5a1150bbc0d2` | `README.md`, `ts-core/README.md` |
| HiveSkills | `1d950c8695ab69af0c1d5ba246bbf6b0417fcbb8` | `README.md` |
| Magnus | `887d039a6a167b04acbf787ab0e548f87e866450` | `README.md`, `services/fleet-gateway/README.md`, `docs/console-api.md` |
| Cindertrace | `dfca27f77ae2d34625069a641c906e2f77f28f86` | `README.md`, `docs/OATHWEAVE.md`, `docs/OATHWEAVE_CONSOLE.md`, `docs/INVESTIGATION-LAB.md`, `services/security-fusion/src/config/lab-isolation.ts` |
| ChatterMost | `88a08663454f69ef8b07ccdcfc31ae9e6184efcb` | `README.md`, `docs/containers.md`, `docs/oathweave.md` |
| Emberfold | `aac58682312fb509d8a7ba240b9a151651d272de` | Unchanged |

At this review Hive had published no suite release, so its `hive.sh` commands carried a placeholder version and the walkthrough pointed to the releases page without a download command. The release section below replaces the placeholder with 2.0.0 and adds the documented checkout of the release tag.

Cindertrace's lab commands keep their pinned `0368abb6779c0c715e1dc00f7f346b2253f5f040` review; the lab's startup fence at the revision above confirms it forbids `OATHWEAVE_`, `HIVE_` and `MAGNUS_` settings, so it keeps its own console. No installation command was exercised against an operational environment. All guide Bash blocks passed `bash -n`.

## Hive 2.0.0 and product releases, 2026-11-05

Hive published suite release 2.0.0, and each product published the release it pins. Every guide's source review now names a release tag and its commit, verified with the GitHub API and against local fetches of the public tags. Each release was confirmed published, not a draft or prerelease, and marked latest.

| Project | Release | Commit | Reviewed sources |
| --- | --- | --- | --- |
| Hive | `v2.0.0` | `cc784bfa641b704d2ad0a87256d3271c28edc1dd` | `README.md`, `deployment/README.md`, `deployment/FULL.md`, `deployment/MIGRATE_NATIVE.md`, `docs/RELEASING.md`, `docs/hive-registry-api.md`, `releases/2.0.0.json`, `hive.sh --help`, release notes |
| Oathweave | `v2.0.1` | `dd164d733235cac26c13f410c869f5cf424222a8` | `README.md`, `apps/iam-core/README.md` |
| Emberpath | `v2.0.1` | `7aada3201bed915d36e37458c3b8a1dc5fe71c84` | `README.md` |
| HiveMem | `v1.3.1` | `96638e704f1c8b3fa583f42b5ca0de01ee447d23` | `README.md`, `ts-core/README.md` |
| HiveSkills | `v1.3.1` | `e61d7a1962cc20fef12aed28d9a2a5824aa53a4b` | `README.md` |
| HiveXUI | `v0.1.1` | `18120937ad89443df81e789b0494ba7f217fc2b9` | `README.md`, `CHANGELOG.md`, `docs/THEME.md` |
| Magnus / Ardent | `v2.1.1` | `084a3292f4b459fe74c91af7e06b37d2aeb2774e` | `README.md`, `packages/magnus/README.md`, `packages/ardent/README.md`, `services/fleet-gateway/README.md`, `docs/console-api.md`, `docs/CINDERTRACE_MIGRATION.md` |
| Cindertrace | `v0.2.1` | `36d3a00e0e9588cf87128226083fc804d64d9a49` | `README.md`, `docs/INSTALLATION.md`, `docs/INTEGRATIONS.md`, `docs/INVESTIGATION-LAB.md`, `docs/UPGRADING.md`, `docs/OATHWEAVE.md`, `package.json` |
| ChatterMost | `v0.4.1` | `8962cebeca1473957e2358a22c2855c106b85303` | `README.md`, `AGENTS.md`, `docs/containers.md`, `docs/oathweave.md`, release assets |
| Emberfold | `v0.2.1` | `f97b7eec1083cbbab79361f6360b8b8412f50bc9` | `README.md`, `package.json`, package manifests, npm metadata |

Hive: the walkthrough and guide now clone the repository at `v2.0.0` before `./hive.sh --release 2.0.0`, because the signed manifest pins the controller's SHA-256. The release attaches `2.0.0.json`, `2.0.0.json.sig` and `publisher.pub`; all three are byte-identical to the tagged tree, the signature verifies with that key, and the key's DER SHA-256 matches the fingerprint in the release notes. The guide gives the fingerprint command from `docs/RELEASING.md` rather than repeating the value. Initial sign-in now distinguishes fresh installs, which still use `config/initial-credentials.env`, from installations moved with `migrate-native`, which use the one-time administrator reset token and `hive-set-admin-password`. The component versions the guide lists come from the signed manifest.

Product guides: ChatterMost pins `0.4.1`, whose runbook block is unchanged apart from the version; the archive's `SHA256SUMS` line matches the GitHub asset digest and the downloaded archive, which contains `chattermost-0.4.1/chattermost`. Cindertrace pins `v0.2.1` for both the normal installation and the lab, since the tag contains the lab and its docs are unchanged since the earlier lab review. Emberfold pins core and CLI `0.2.1`; the synthetic CLI dry run exits 0 with output identical to `0.1.0`, so the site excerpt stays as captured. HiveMem's guide no longer offers its standalone `/dashboard`, which the release docs reduce to a placeholder page. Emberpath's guide now notes that the npm package predates the repository and still bundles the old console. Magnus and Ardent commands are unchanged and unpinned; npm `latest` is `2.1.1`.

The standalone npm commands for Oathweave, Emberpath, HiveMem and HiveSkills follow their READMEs, but npm still resolves those package names to the legacy `1.2.2` line; the new releases ship as container images, which Hive installs. Only Emberpath's README says so explicitly. No installation command was exercised against an operational environment.

## Standalone container paths, 2026-11-06

npm resolves `@hivemagnus/hive-iam-server`, `@hivemagnus/hivemem-server`, `@hivemagnus/hive-skills` and `@hivemagnus/hive-router` to the legacy `1.2.2` line, and `@hivemagnus/oathweave` and `@hivemagnus/emberpath` are not on npm. The current releases ship only as GHCR images, so the Oathweave, HiveMem, HiveSkills and Emberpath READMEs now document their images, and the guides' standalone sections follow those container examples instead of `npx`. Each block was run with throwaway containers against the image its release publishes (the multi-architecture digests Hive `2.0.0` and `2.0.1` both pin); Emberpath's block was run on the network of the Oathweave example.

| Project | Image | Commit | Reviewed sources |
| --- | --- | --- | --- |
| Oathweave | `ghcr.io/cheftaco/oathweave:2.0.1` | `056b33500181db6fbd3c124a40f5bfa7b90a9873` | `README.md`, `apps/iam-core/README.md` |
| HiveMem | `ghcr.io/cheftaco/hivemem:1.3.1` | `7f382cc05192f07ab1761d0e93754f404449d0c0` | `README.md`, `ts-core/README.md`, `APP_ARCHITECTURE.md` |
| HiveSkills | `ghcr.io/cheftaco/hiveskills:1.3.1` | `aa4fa782509912a95584738d12b3e4b343b19dc9` | `README.md` |
| Emberpath | `ghcr.io/cheftaco/emberpath:2.0.1` | `d5fbb8855a70223972f6e2981fb97f9b2b36ba9b` | `README.md` |

The Cindertrace guide already installs from the release tag with Compose and does not claim release assets; its README now says that only `v0.1.0` attaches a native archive and that later releases publish the image. The HiveXUI and Cindertrace guides already keep the investigation lab out of HiveXUI, which now matches the HiveXUI README.
