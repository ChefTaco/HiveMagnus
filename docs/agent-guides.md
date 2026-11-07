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

The static JSON-LD graph in `index.html` describes eleven repositories, Ardent included, using Schema.org `SoftwareSourceCode`. It includes descriptions, repository URLs, TypeScript language, license links, and links to the guides. Keep its CSP SHA-256 hash in `public/_headers` synchronized with the exact script text, including whitespace. Do not loosen the policy to allow arbitrary inline scripts.

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

## Hive 2.0.1, 2026-11-06

Hive published suite release 2.0.1, a controller-only release with the same images and product versions as 2.0.0. `migrate-native` now verifies migrated data before serving clients. The Hive guide, the agent index and the walkthrough constant now name `v2.0.1`, commit `02f9f9ff1becb9b14b74a8634f54cdc9ce1fba52`, and every linked file was checked to exist at that commit.

## Ardent repository, 2026-11-07

Ardent moved out of the Magnus monorepo into its own public repository, `https://github.com/ChefTaco/Ardent`, at extraction commit `90ec90594a15ad412e1385dc6cb9972f15eec66a` (package `@hivemagnus/ardent` 2.1.1, unchanged). The site now presents Ardent as its own product: the metadata graph gives it its own repository and license and no longer nests it in Magnus, the atlas shows Magnus managing Ardent as a configured connection, the fallback and footer link the repository, `security.txt` lists its advisories, and `llms.txt` links its AGENTS.md. Ardent keeps sharing the Magnus guide. The install commands in that guide were compared with the Ardent README at the extraction commit and are unchanged. The earlier review records above, including the Magnus guide's `v2.1.1` source pin, are historical and were not edited.


## Hive 2.0.4, 2026-11-07

The site moves from Hive suite release 2.0.2 (commit `a7f8c285ff9d111435d569b0d068f1381828109e`, presented without a record in this file) to 2.0.4; 2.0.3 was never presented. The Hive guide, the agent index, the overview, the walkthrough constant and the deployment note now name `v2.0.4`, which marks commit `f16a80c71a546e950867d6987c42ff2b6b1b9b50`. Every Hive link the guide carries points at that commit, and every linked file and anchor was checked to exist there.

| Project | Release | Commit | Reviewed sources |
| --- | --- | --- | --- |
| Hive | `v2.0.4` | `f16a80c71a546e950867d6987c42ff2b6b1b9b50` | `README.md`, `deployment/README.md`, `deployment/QUICKSTART.md`, `deployment/FULL.md`, `deployment/MIGRATE_NATIVE.md`, `deployment/BACKUPS.md`, `docs/RELEASING.md`, `docs/hive-registry-api.md`, `CHANGELOG.md` `[2.0.4]`, `releases/2.0.4.json`, `hive.sh --help` |

`releases/2.0.4.json` pins the images and versions of 2.0.3 and adds the Magnus agent package `@hivemagnus/magnus-agent` 2.1.1 with its npm integrity as `components.magnus.agentPackage`; the guide's component list follows the manifest. In the tree at that commit the manifest verifies against `releases/2.0.4.json.sig` with `trust/publisher.pub`, whose DER SHA-256 matches the fingerprint in the changelog. The install, plan and setup commands match the README and installation guide at that commit. The guide adds what the changelog and `hive.sh --help` document for 2.0.4: online backup pauses that no longer grow with the data, `hive.sh magnus-agent install|status|remove`, `hive.sh cindertrace-collector add|list|remove` and the optional Magnus agent port on fresh installations.

Since 2.0.2 the suite pins Oathweave 2.0.2, Emberpath 2.0.2 and HiveMem 1.3.2, so their guides now say which versions Hive 2.0.4 installs. Their standalone container examples keep the images reviewed and run on 2026-11-06, which Hive 2.0.0 and 2.0.1 installed, and their review records are otherwise unchanged. HiveSkills 1.3.1 and HiveXUI 0.1.1 are pinned by the same digests as before.

The tag and release did not exist at this review, so the attached manifest, signature and key were not compared with the tree, and no installation command was exercised against an operational environment.

## Homepage install and Tailscale preparation, 2026-11-07

Rechecked the published `v2.0.4` README and `deployment/QUICKSTART.md` through the public repository, and confirmed the release exists with the signed manifest, signature and publisher key attached. The homepage one-line command combines the documented tag checkout and setup invocation; it is explicitly for a prepared Linux host and opens the reviewed plan rather than bypassing setup. The fresh-host prerequisites remain linked beside it.

Checked `scripts/console-certificate.sh` and `scripts/suite/controller.sh` at `v2.0.4`: the helper discovers the Tailscale MagicDNS name with `tailscale status --json`, requires HTTPS Certificates, calls `tailscale cert`, and writes the certificate and owner-only key under `/etc/hive/tls`. Setup asks for existing certificate/key paths. The new modal links the public Tailscale download and HTTPS guide, explains those separate preparation steps and the optional weekly `schedule --config FILE` renewal. No install, certificate or renewal command was executed against an operator environment.

Rechecked Ardent's public README for its headless runtime, independently configured integrations and bundled Emberfold library. The homepage labels its visual as Magnus mission control and keeps native Ardent installation separate from the signed Hive 2.0.4 suite. npm package metadata for `@hivemagnus/ardent` identifies publisher `hivemagnus`; the footer links that public npm profile.

## Hive 2.0.5, 2026-11-07

The site moves from Hive suite release 2.0.4 to 2.0.5. The Hive guide, the agent index, the overview, the walkthrough constant, the product guides' "Hive installs" lines and the deployment note now name `v2.0.5`, which marks commit `91bd31da798e6a3ddd986728301a5119c6a53d0c`. Every Hive link the guides carry points at that commit, and every linked file and anchor was checked to exist there.

| Project | Release | Commit | Reviewed sources |
| --- | --- | --- | --- |
| Hive | `v2.0.5` | `91bd31da798e6a3ddd986728301a5119c6a53d0c` | `README.md`, `deployment/README.md`, `deployment/QUICKSTART.md`, `CHANGELOG.md` `[2.0.5]`, `releases/2.0.5.json` |
| Oathweave | `v2.0.3` | `7f9770ea03254b1a99b6e35ab75ffb741ef0c8db` | `CHANGELOG.md` `2.0.3` |

`releases/2.0.5.json` differs from `releases/2.0.4.json` only in the Oathweave image, now 2.0.3, which updates `@simplewebauthn/server` to 14.1.0 for GHSA-2g3p-m8c9-hhwh; `controllerSHA256` and the publisher key are unchanged. The release attaches the manifest, signature and publisher key; they are byte-identical to the tagged tree and the signature verifies. The Oathweave guide's standalone container example keeps the image reviewed and run on 2026-11-06; its review record is otherwise unchanged. The install commands are those of 2.0.4 with the new version, as in the README and installation guide at that commit.

## Hive release launcher, 2026-11-07

The website quick start, walkthrough, Markdown overview and agent index now use `./hive.sh --release latest` from an unpinned launcher checkout. An exact version remains selectable. Commands were checked against published Hive commit [`e5079e9`](https://github.com/ChefTaco/hive/blob/e5079e996b7cf799edd56dd23444586ea898e110/deployment/QUICKSTART.md), its README and release launcher. The launcher resolves GitHub’s published release once, retains the matching tagged controller, checks its signature and signed source digest before execution, and forwards the exact version while preserving working directory, arguments and terminal input. Failed lookup, modified source, signature tampering and a publisher-key change stop execution.

Live checks selected published release 2.0.5 and explicit release 2.0.0. The published controller reached its first interactive setup prompt, and an unattended run produced a digest-bearing plan then refused to apply without confirmation. No operational installation was changed. The product details in the Hive guide remain explicitly labeled as a review of 2.0.5; they are not a moving claim about the latest release. Local site checks covered all five viewport widths, ten accessibility audits, clipboard and walkthroughs, plus inspected desktop and mobile captures. No public product captures were replaced.


## Hive 2.0.6 security release, 2026-11-07

The current product review moves to Hive 2.0.6, source commit `3cadb5590a9c9b0aa0884ecfcac48c7ebc10aa5b`. The launcher command stays `./hive.sh --release latest`, with exact-version examples updated to 2.0.6. The signed controller includes the release launcher reviewed above; the source review in the Hive guide now pins both launcher and product documentation to the same revision. Referenced files were checked in that tree.

The release pins Oathweave 2.0.4 and Magnus server, gateway and agent 2.1.2. Its controller keeps collector secrets out of process arguments and requires a complete, integrity-bearing agent dependency shrinkwrap before installing a staged package. Oathweave retains SimpleWebAuthn 14.1.0 while updating Hono to 4.13.16 and its HTTP adapter to 2.1.6. The Magnus dashboard artifact includes Next.js 16.4.5. The ingress and hardened datastore images receive the security updates described in the changelog; the image gate covers both architectures and requires no fixable High or Critical findings. Unfixed upstream findings remain documented by Hive.

The manifest's controller SHA-256 is `c564a81bfcb651765d6e5730b604c398b01b2b116cf8018c7bd728a7a360145f`. Its signature verifies with the unchanged publisher key, DER SHA-256 `c0d0665a70969f37c8f1cffbdcf8e54df13626f8dbd4b5759a7c44843d86d1b2`.

The other product guides update their explicitly labeled Hive-installed versions. Their dated standalone installation examples retain their original source reviews. The Magnus guide adds a separate 2.1.2 security review after comparing the release README and installer README; the installation commands are unchanged. Ardent remains separate, with package 2.1.2 and no native artifact in Hive 2.0.6. No public product captures were replaced.

The refreshed lifecycle guidance also covers the launcher’s offline fast path: when this checkout already matches the selected signed controller, it stays in use; a retained cache path is printed when a controller is downloaded. The site no longer assumes that every invocation downloads a checkout.

Publication verification: the three downloaded Hive 2.0.6 release assets are byte-identical to the tagged manifest, signature and publisher key, and the detached signature verifies. Local site validation passed the build, all five viewport widths, ten accessibility audits, clipboard actions and walkthroughs, with zero page or console errors. Desktop and mobile captures were inspected.
