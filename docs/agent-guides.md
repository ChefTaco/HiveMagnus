# Agent documentation maintenance

`public/llms.txt` indexes the Markdown overview and four project guides. The visual site links them in its For agents section and no-JavaScript fallback. The HTML head advertises `llms.txt` with `rel="describedby"` and the overview with `rel="alternate" type="text/markdown"`. Markdown responses also advertise the index through an HTTP Link header.

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

The static JSON-LD graph in `index.html` describes four repositories and Ardent as a part of Magnus using Schema.org `SoftwareSourceCode`. It includes descriptions, repository URLs, TypeScript language, license links, and links to the guides. Keep its CSP SHA-256 hash in `public/_headers` synchronized with the exact script text, including whitespace. Do not loosen the policy to allow arbitrary inline scripts.

Before publishing, build, check local Markdown links and shell syntax, validate the JSON-LD and CSP hash, run the browser check, and inspect the For agents section at desktop/mobile widths. Review the Pages preview before promotion to `main`; verify live Markdown content types, discovery headers, assets, and the intended source revision after deployment.
