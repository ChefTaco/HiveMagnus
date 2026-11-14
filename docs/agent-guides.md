# Agent documentation maintenance

`public/llms.txt` indexes the Markdown overview and twelve project guides. The visual site links them in its For agents section and no-JavaScript fallback. The HTML head advertises `llms.txt` with `rel="describedby"` and the overview with `rel="alternate" type="text/markdown"`. Markdown responses also advertise the index through an HTTP Link header.

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

## Hive 3.1.1, Ardent and Ardent Project Studio, 2026-11-12

The current product review moves from Hive 2.0.6 to the published suite release 3.1.1, tag `v3.1.1`, commit `d1ff02dd4fbe16e9552f891584e8221aa52d0d93`. The 3.1.2 manifest merged on Hive `main` is not tagged or published and is not presented. The launcher command stays `./hive.sh --release latest`; exact-version examples, the walkthrough and the homepage now use one `HIVE_SUITE_VERSION` constant in `src/main.ts`. Hive guide links now point at the `v3.1.1` tag instead of a commit SHA, and every linked file and anchor was checked to exist in that tree.

| Project | Release | Commit | Reviewed sources |
| --- | --- | --- | --- |
| Hive | `v3.1.1` | `d1ff02dd4fbe16e9552f891584e8221aa52d0d93` | `README.md`, `deployment/README.md`, `deployment/QUICKSTART.md`, `deployment/FULL.md`, `UPGRADING.md`, `docs/ADVISORY_REMEDIATION.md`, `CHANGELOG.md` `[3.0.0]` to `[3.1.1]`, `releases/3.1.1.json`, `hive.sh --help`, release notes |
| Magnus | `v2.4.2` | `c14cdacaad1d2f01922be84755f1f85ed5d373c5` | `README.md`, `docs/ARDENT.md`, `packages/agent/npm-shrinkwrap.json` |
| HiveXUI | `v0.2.7` | `de613008a438a90d660e5a7161b3fe805095572b` | `README.md` |
| Ardent | `v3.1.2` | `58c4b35034ea20a3400f04e9f131012cba4df471` | `README.md`, `CHANGELOG.md`, `package.json` |
| Ardent Project Studio | `v0.2.0` | `7f1279f2726ad9665c1de24eb5168d98548bb8a1` | `README.md`, `CHANGELOG.md`; `v0.2.1` README diff |
| Cindertrace | `v0.2.2` | `addf3062039e273ab9f7336ec71e60fd7c50414d` | `README.md`, `docs/UPGRADING.md` diff from `v0.2.1` |
| ChatterMost | `v0.4.4` | `c777c786667e75ad7cf544b21d8c44bf2c3a3807` | `README.md`, `AGENTS.md`, `docs/containers.md` diff from `v0.4.1`, release assets |
| Emberfold | `v0.2.2` | `ab7541028acbf381e1cb67d8f6bcc01b239014ca` | `README.md`, package manifests diff from `v0.2.1`, npm metadata |

`releases/3.1.1.json` pins Oathweave 2.1.1, Emberpath 2.0.4, HiveMem 1.4.1, HiveSkills 1.3.3, HiveXUI 0.2.7, Magnus server, gateway and host agent 2.4.2, Cindertrace 0.2.2, ChatterMost 0.4.4, Emberfold 0.2.2, Ardent Project Studio 0.2.0, Hive Registry 1.1.0 and the ingress 2.0.5. The Magnus host agent's dependency lock pins Ardent 3.1.1. The Hive guide now covers guided local setup (from 2.4.0), full-node enrollment, the 2.x to 3.x PostgreSQL migration with `--allow-migrations` and the refusal of code-only rollback across it, and the Ardent package update after an upgrade.

Ardent has its own guide, `public/guides/ardent.md`, reviewed at its latest tag `v3.1.2` (npm `latest`); the suite manages Ardent 3.1.1 through Magnus. The Magnus guide keeps its `#ardent-with-bundled-emberfold` anchor as a pointer. Ardent Project Studio, an optional suite product shown as HiveXUI's Studio section at `/studio`, has a new guide reviewed at `v0.2.0`, the version the suite pins. It is listed in the agent index, the overview, the For agents list, the no-JavaScript fallback and the metadata graph, which now has twelve `SoftwareSourceCode` entries; the CSP hash in `public/_headers` was updated. It has no product section or capture.

ChatterMost, Cindertrace and Emberfold examples move to the versions the suite pins; their command blocks are otherwise unchanged at those tags. The ChatterMost 0.4.4 archive matches its `SHA256SUMS` line and GitHub asset digest. The Emberfold 0.2.2 CLI dry run exits 0 with output identical to the site excerpt. Oathweave, Emberpath, HiveMem and HiveSkills guides update their Hive-installed versions; their dated standalone container examples keep their original source reviews.

Embermend's README describes a development preview with no tags, and it is not in the suite catalog. The agent index and overview mention it only as in development, with no guide or installation instructions.

Site copy no longer calls HiveXUI a console. Script and file names such as `console-certificate.sh` keep their real names, and Cindertrace's and Magnus's own standalone UIs keep their documented names. No installation command was run against an operational environment. No public product captures were replaced.


## Embermend and signed Hive 3.2.2, 2026-11-12

The portfolio adds Embermend as a Magnus-dependent optional suite product, with a
HiveXUI section, installation guide, recommendation workflow and explicit
assessment/automation limits. Source reviews use these immutable releases:

| Project | Release | Reviewed source |
| --- | --- | --- |
| Embermend | `v0.1.0` | `f92a580e92e687cf105dec77a4b9d503b65e7215` |
| Magnus | `v2.5.0` | `18acbca1b966b7141d2472659d1f3d966ea6e575` |
| Oathweave | `v2.2.0` | `3b6d7df399b72f16630b6af16ca3d49040eae2ac` |
| HiveXUI | `v0.3.0` | `baffab13e0e34f6998f5cafc9a0b20088e25a0ef` |
| Hive | `v3.2.2` | `e99f6be17b3f6858d9f29da4d2b40716e12d11e2` |

The Embermend review covers its README, product specification, inference,
provider-authorization and recovery guides, OpenAPI/browser contract, release
compatibility metadata and acceptance ledger. The accepted reference journeys
include actual managed scanning with the approved model, separate source/image/
runtime outcomes, native fault recovery and isolated combined-store restoration.
Production starts with one explicitly scoped inventory canary and disabled
mutation policies. Unsupported profile checks and unknown exposure remain visible.

The Hive guide follows the signed manifest, current launcher, release guide,
initialization/upgrade controller and the storage-registration regression. Its
product table preserves the security-patched 3.1.2 runtime combination and updates
Magnus, Oathweave and HiveXUI for optional Embermend. The 3.2.2 recovery explicitly
verifies the already initialized PostgreSQL major, runtime receipt and checksums;
it does not treat arbitrary unversioned data as a new store. Earlier dated
reviews above remain historical. The latest-release command stays unchanged.

The new capture uses the actual HiveXUI build with synthetic browser responses;
its provenance and reproduction callback are recorded in `docs/media.md`.
TypeScript is exactly 6.0.3 with all three strictness options, the JSON-LD source
graph and CSP hash agree, and the browser gate covers all twelve product sections,
six walkthroughs, thirteen guides and five viewport widths.

The operational documentation review uses Embermend commit `31390ff520d13ed0faf598b4151dba424e095aea`, separately from the immutable 0.1.0 runtime source. It records all 24 reference acceptance journeys, three post-upgrade production assessments with explicit partial Ubuntu coverage, exact final product/native restore identities, unchanged identity security fields and disabled production mutation policies. The signed suite review uses Hive `v3.2.2` at `e99f6be17b3f6858d9f29da4d2b40716e12d11e2`; both PostgreSQL majors passed native amd64/arm64 checks and the full release image policy.

## Signed Hive 3.3.0 product update, 2026-11-12

The current suite review moves from Hive 3.2.2 to the published release 3.3.0, tag `v3.3.0`, commit `f2d4db2af7e9827fc85ef4cc6c527e003d6740d5`. `HIVE_SUITE_VERSION` in `src/main.ts`, the Hive guide, the overview and the agent index now name 3.3.0. The three release assets are byte-identical to the tagged manifest, signature and publisher key; the detached Ed25519 signature verifies with the unchanged key, DER SHA-256 `c0d0665a70969f37c8f1cffbdcf8e54df13626f8dbd4b5759a7c44843d86d1b2`. The manifest keeps the 3.2.2 `controllerSHA256` (`86d48819063894b8266e07c48609d1c50fba42e85b4ee91d7f4d4dfb205b64a9`), and every Hive file the guide links exists at the tag. The tag's README, quick start and Embermend deployment note differ from 3.2.2 only in version numbers.

| Project | Release | Commit | Reviewed sources |
| --- | --- | --- | --- |
| Hive | `v3.3.0` | `f2d4db2af7e9827fc85ef4cc6c527e003d6740d5` | `README.md`, `deployment/QUICKSTART.md`, `deployment/EMBERMEND.md` and `CHANGELOG.md` diffs from `v3.2.2`, `releases/3.3.0.inputs.json`, `releases/3.3.0.json`, release assets |
| HiveSkills | `v1.4.0` | `45dc95ed0322f7573759b5a08f35e4feb366f5ac` | `CHANGELOG.md` |
| ChatterMost | `v0.5.1` | `848d317aa9df6a8e94b318997d859aa8d68cacd2` | `README.md`, `AGENTS.md`, `docs/containers.md` diff from `v0.4.4`, commits since `v0.4.5`, release assets |
| Cindertrace | `v0.3.0` | `c20228cfd6f6978c4b0d07a3e0179d3b1ff218bd` | `CHANGELOG.md`, `README.md`, `docs/INSTALLATION.md` and `docs/UPGRADING.md` diffs from `v0.2.2`, `package.json` engines |
| Ardent Project Studio | `v0.3.0` | `490c60d8fe381c27434518c455e4f479ac3187cd` | `CHANGELOG.md`, `README.md`, `AGENTS.md` and `docs/OATHWEAVE.md` diffs from `v0.2.0` |
| Emberpath | `v2.1.0` | `08dc5f683203c80fb0b3d11d06495024e1fce417` | `CHANGELOG.md` |
| HiveMem | `v1.5.0` | `13281b0a0019484d2b639320207612c06ec8b26f` | `CHANGELOG.md` |
| HiveXUI | `v0.4.0` | `96dd09e5b6b6989d73a738a0c0c26bdb2c4be50d` | `CHANGELOG.md` `[0.2.8]` to `[0.4.0]`, `README.md` diff from `v0.2.7` |

`releases/3.3.0.json` pins HiveSkills 1.4.0, ChatterMost and its migrator 0.5.1, Cindertrace 0.3.0, Ardent Project Studio 0.3.0, Emberpath 2.1.0, HiveMem 1.5.0 and HiveXUI 0.4.0. Oathweave 2.2.0, Magnus server, gateway and host agent 2.5.0, Emberfold 0.2.3, Embermend 0.1.0, the Hive Registry 1.1.0, the ingress 2.0.5 and the PostgreSQL 17.11 and 18.6, Redis 8.2.10 and Qdrant 1.18.3 images are unchanged. Each GitHub tag above resolves to the listed commit and has a published, non-prerelease release.

The Hive guide's product table and release summary follow the manifest and changelog. ChatterMost and Cindertrace installation examples, and the ChatterMost and Cindertrace walkthroughs, move to the pinned tags; their command blocks are otherwise unchanged at those tags. The ChatterMost 0.5.1 archive matches its `SHA256SUMS` line and GitHub asset digest and contains `chattermost-0.5.1/`. The Ardent Project Studio guide links to `v0.3.0` and drops the superseded Node.js note. HiveSkills, Emberpath, HiveMem and HiveXUI update their Hive-installed versions and add dated release notes; standalone container examples keep their original source reviews. The Embermend guide notes that 3.3.0 keeps its reviewed Magnus and Oathweave versions. The Oathweave, Magnus, Ardent and Emberfold guides are not changed in this update. No installation command was run against an operational environment, and no public product captures were replaced.

## Signed Hive 3.7.0 review, 2026-11-13

`HIVE_SUITE_VERSION` moved to 3.6.0, 3.6.1 and 3.7.0 without the guides following; they still described 3.3.0. This review brings the Hive guide, the product guides, the overview, the agent index and the walkthroughs to release 3.7.0, tag `v3.7.0`, commit `5d16e488d8fcc725d7cebd1a8d1cad952714e098`. Its `controllerSHA256` equals 3.6.1's.

| Project | Pin in `releases/3.7.0.json` | Tag commit | Reviewed sources |
| --- | --- | --- | --- |
| Hive | 3.7.0 | `5d16e488d8fcc725d7cebd1a8d1cad952714e098` | `README.md`, `deployment/QUICKSTART.md`, `deployment/EMBERMEND.md`, `CHANGELOG.md` 3.4.0 to 3.7.0, `UPGRADING.md` and `deployment/FULL.md` headings, `releases/3.7.0.json`, `hive.sh --help` |
| Oathweave | 2.2.0 | `3b6d7df399b72f16630b6af16ca3d49040eae2ac` | `apps/iam-core/README.md` container example |
| Emberpath | 2.4.0 | `c87215750ab844ff526bdf61c35854dc2cec684e` | `README.md` install section, `CHANGELOG.md` |
| HiveMem | 1.6.0 | `8948d16389194821e707fc31910e764e38443e8d` | `README.md` install section, `CHANGELOG.md` |
| HiveSkills | 1.7.1 | `dc6c33974fb85b25baede90eff9b76fcada6aee7` | `README.md` install section, `CHANGELOG.md` |
| HiveXUI | 0.7.0 | `39328ce4bef8cce11ebdefcbe9fb6511d91e5e63` | `README.md`, `CHANGELOG.md` 0.5.0 to 0.7.0 |
| Magnus, gateway and host agent | 2.9.1 | `4d273ababddc641446ceece4be2aaccf6888be60` | `README.md`, `CHANGELOG.md` 2.4.3 to 2.9.1, host agent `npm-shrinkwrap.json` (Ardent 3.1.2) |
| Cindertrace | 0.6.1 | `eeec7e894fb83d5dc5a7f8f653f30c4f96da66cd` | `CHANGELOG.md`, `README.md` (unchanged from `v0.3.0`) |
| ChatterMost | 0.5.2 | `8141ea0af55c4f33efa92a9fdeb9f9a96d0c06a7` | `AGENTS.md` runbook block, `docs/containers.md` upgrade sources, release asset names |
| Emberfold | 0.3.0 | `0ba9d933dd5c4da67537e73771cb20d9e9ab2ce2` | `README.md`, `CHANGELOG.md`, npm versions |
| Ardent Project Studio | 0.4.0 | `f51d439c64c8cfb90633bcb580ff6c01420f2a33` | `README.md` quick start, `CHANGELOG.md` |
| Embermend | 0.3.0 | `b9b522b7ac750cb3160a3abd9a0e15906e44adf2` | `CHANGELOG.md` |

What changed in the published text: the Hive guide's version table, release summary, setup checklist, `post-upgrade` and the three cases that need `--allow-migrations`; the Ardent guide's package update step, which named `magnus-agent enroll` where the scope-preserving path is `post-upgrade` or `magnus-agent install`; standalone image tags in the Oathweave, Emberpath, HiveMem and HiveSkills examples, following each README at its tag; the Cindertrace, ChatterMost and Emberfold version pins in the guides and walkthroughs; HiveXUI's inbox, Setup page, Agent 360 and Embermend section; and the retirement of the web UIs Emberpath and HiveSkills used to bundle.

Limits of this review: the only command run was the Emberfold `0.3.0` CLI dry run, which exits 0 with the documented result. No container example, archive download or installation was run, and the release signature was not verified again. The Magnus `v2.9.1` and Emberfold `v0.3.0` tags have no GitHub release page, so their guides link to the tagged source instead. Every GitHub link in the public Markdown and walkthroughs answered 200 on the review date; anchors were checked only for the Hive documents.

Site checks: `npm run build` and the browser gate pass with twelve product sections, six walkthroughs, thirteen guides and five viewport widths. The sitemap now lists the Markdown overview and guides. The JSON-LD graph is unchanged, so its CSP hash still agrees.

## Signed Hive 3.8.0 review, 2026-11-14

This review brings the Hive guide, the product guides, the overview, the agent index and the walkthroughs to release 3.8.0, tag `v3.8.0`, commit `2fe6f690556ff75d47b76301eb6cc8e5c25a4a91`. 3.8.0 has a new controller (`controllerSHA256` `3e9635029c5c689e046ed5cb47df019a7e50ea81f19170656a6add340ce8e28c`). The manifest signature was verified against `trust/publisher.pub`, whose DER SHA-256 matches the fingerprint in the release notes.

| Project | Pin in `releases/3.8.0.json` | Tag commit | Reviewed sources |
| --- | --- | --- | --- |
| Hive | 3.8.0 | `2fe6f690556ff75d47b76301eb6cc8e5c25a4a91` | `CHANGELOG.md` 3.8.0, release notes, `UPGRADING.md` 3.8.0 section, `deployment/QUICKSTART.md` upgrade section, `deployment/FULL.md` Magnus host agents and node keys, `scripts/suite/audit-collection.sh` release list, `releases/3.8.0.json`, `hive.sh --help` |
| Oathweave | 2.3.0 | `d2ac3c08c8a55200160321f51bd807515bb0d249` | `CHANGELOG.md`, `apps/iam-core/README.md` container example and client addresses |
| Emberpath | 2.5.0 | `b9c7568c4af0d2a687774b2ade2cf5eb3046677a` | `README.md` install and editing a provider, `CHANGELOG.md` |
| HiveMem | 1.7.0 | `53b0c636cf81400926030601a89376a0b69e411d` | `README.md` install section, `CHANGELOG.md` |
| HiveSkills | 1.8.0 | `d2424dd74729454692f59a68ebd9720f6dd251bf` | `README.md` install section, `CHANGELOG.md` |
| HiveXUI | 0.8.0 | `afb902509e5c221bc6e542e5ff4431400f97a4b8` | `README.md` (unchanged from 0.7.0), `CHANGELOG.md`, navigation labels |
| Magnus, gateway and host agent | 2.10.0 | `32417a3742172858c6fdb8c44009ebbe737b13ec` | `CHANGELOG.md` 2.10.0 to 2.10.2, `docs/NODE_CREDENTIALS.md`, `packages/agent/README.md`, host agent `npm-shrinkwrap.json` (Ardent 3.1.3) |
| Ardent | 3.1.3 (staged) | `4ea00d3a5bc0ea8c601fb611a6770651e7313de0` | `CHANGELOG.md`, `README.md` (unchanged from 3.1.2) |
| Cindertrace | 0.7.0 | `c0a8867a7aeedd36eb6f241e72b76058db87e61f` | `CHANGELOG.md`, `README.md` and Node engines (unchanged) |
| ChatterMost | 0.6.1 | `ff218472096906fbf9770f3061d995f0c9c39953` | `AGENTS.md` runbook block, `docs/containers.md` upgrade sources, release asset names |
| Emberfold | 0.4.0 | `ae93b77801e880c3ca9c0158ac99ea2fd22bffdf` | `README.md`, `CHANGELOG.md`, npm versions |
| Ardent Project Studio | 0.4.1 | `216cc101c07c896ada6efc69416141683e143107` | `README.md` quick start, `CHANGELOG.md` |
| Embermend | 0.3.1 | `be7e60b09a1f1db6a234c904d1a4875dba3e2259` | `CHANGELOG.md` |

What changed in the published text: `HIVE_SUITE_VERSION`, the Hive guide's version table, release summary, a new "What 3.8.0 changes for users" list, and the `--allow-migrations` case for installations that run Magnus; standalone image tags in the Oathweave, Emberpath, HiveMem and HiveSkills examples, following each README at its tag; the Cindertrace, ChatterMost and Emberfold pins in the guides and walkthroughs; short sections on Oathweave's code-exchange rule (confidential clients send their secret, public clients use PKCE) and client addresses, Emberpath's provider credential and redirect rules, HiveMem's workspace tightening and Magnus's per-node keys, with where HiveXUI 0.8.0 shows them. The Magnus `v2.10.0` and Emberfold `v0.4.0` tags have GitHub release pages, so their guides now link them instead of the tagged source.

Magnus 2.10.2, the latest patch on npm, fixes managed requests to enrolled nodes whose 2.10.0 or 2.10.1 agent has a node key; the suite pins 2.10.0. The Magnus guide says so, citing Magnus's changelog.

Limits of this review: the only command run was the Emberfold `0.4.0` CLI dry run, which exits 0 with the documented result on Node.js 24.22.3. No container example, archive download or installation was run.

Site checks: `npm run build` and the browser gate pass with twelve product sections, six walkthroughs, thirteen guides, five viewport widths and no accessibility violations. Every non-example link in the public Markdown, the agent index and the walkthroughs answered 200 on the review date, apart from npmjs.com pages, which refuse automated requests (the packages were checked in the registry instead). Fragments into the reviewed product documents and between guides match a heading.
