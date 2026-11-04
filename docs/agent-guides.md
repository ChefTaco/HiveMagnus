# Agent documentation maintenance

`public/llms.txt` indexes the Markdown overview and five project guides. The visual site links them in its For agents section and no-JavaScript fallback. The HTML head advertises `llms.txt` with `rel="describedby"` and the overview with `rel="alternate" type="text/markdown"`. Markdown responses also advertise the index through an HTTP Link header.

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

The static JSON-LD graph in `index.html` describes five repositories and Ardent as a part of Magnus using Schema.org `SoftwareSourceCode`. It includes descriptions, repository URLs, TypeScript language, license links, and links to the guides. Keep its CSP SHA-256 hash in `public/_headers` synchronized with the exact script text, including whitespace. Do not loosen the policy to allow arbitrary inline scripts.

Before publishing, build, check local Markdown links and shell syntax, validate the JSON-LD and CSP hash, run the browser check, and inspect the For agents section at desktop/mobile widths. Review the Pages preview before promotion to `main`; verify live Markdown content types, discovery headers, assets, and the intended source revision after deployment.

## Cindertrace addition, 2026-11-04

Reviewed public Cindertrace `a92c12a4e7386be6099e6becebc115fc146b91b1`: README, installation, integrations, upgrade runbook, and package Node engines. The release pin `v0.1.0` resolves to application commit `576f4b4e7ba4ef5f0524deb213137b3fd643aa88`. The installation walkthrough uses that release's documented source/Compose path; no npm installer is advertised. The upgrade guide uses an explicit immutable commit and a dry run before activation. Current-state rollback and uncertain-effect handling follow the owning repository's runbook.

Magnus security ownership was checked against public `7a6782d2085702ef14e1bc997df65fe37d2b5673`. The Magnus guide links Cindertrace and identifies the retired embedded security runtime. Existing installation examples for the other projects are unchanged and retain their original review records.

The metadata graph now contains six SoftwareSourceCode entries: five projects and Ardent within Magnus. The Cindertrace captures come from a new disposable Compose installation, documented in media.md.

## Cindertrace evolving lab, 2026-11-04

Reviewed the public lab workflow at `0368abb6779c0c715e1dc00f7f346b2253f5f040` and the matching README, initialization and lifecycle scripts, API contracts, and upgrade guidance. The lab commands explicitly check out that revision in a new directory; `v0.1.0` predates the lab and remains the normal installation example. Documentation covers evidence-bound revisions, structured comparisons, separate progression credentials, human-approved simulation, and history-preserving restarts. The site links the lab from Cindertrace's interface panel; existing captures continue to depict the original synthetic demo, not the new lab. No screenshots or source metadata changed.
