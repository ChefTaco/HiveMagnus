# Site contributor instructions

This repository is the public website for the Hive:Magnus suite at `hivemagnus.com`: a static
Vite and TypeScript page plus Markdown guides for people and agents. It documents the products;
it does not ship any of them. Each product's own repository is the source of truth.

## Layout

- `index.html`: page shell, head metadata and the Schema.org JSON-LD graph.
- `src/main.ts`, `src/style.css`: all homepage content (product sections, architecture,
  walkthroughs) and its behavior. It reads the reviewed suite release and its pins from
  `virtual:hm-versions`.
- `data/versions.json`: the one source of version facts, generated from the signed Hive release
  manifests by `scripts/sync-versions.mjs`: every 3.x release with its pinned versions, digests,
  staged Ardent and publication date, the reviewed release (`current`), and hand-written upgrade
  rules and notes.
- `vite.config.mjs`: fills the `{{hm.*}}` version tokens in the Markdown and text docs, generates
  `compatibility.md` and `llms-full.txt`, and adds Git `<lastmod>` dates to the sitemap, in the
  build and in the dev server. The helpers are in `scripts/lib/`.
- `public/`: copied into `dist/`, with tokens filled. Agent docs (`llms.txt`, `index.md`,
  `guides/*.md`), captures, `_headers` (security headers and CSP), `_redirects`, `404.html`,
  `sitemap.xml`, `.well-known/security.txt` and font licenses.
- `scripts/`: the site, version, link and browser checks, the version sync, unit tests, the
  capture scripts, the Emberfold sample input and the Gitleaks tooling.
- `docs/`: [deployment and rollback](docs/deployment.md), [media provenance](docs/media.md),
  [how to update the guides](docs/agent-guides.md) and `release-records/`, the earlier dated
  release records of each guide (not published).
- `deployment/node-build/`: the Node.js definition Cloudflare Pages builds with.

## Commands

Use Node.js from `.node-version` (24.22.3).

```bash
npm ci
npm test               # unit tests of the build and check helpers
npm run build          # tsc --noEmit, then vite build into dist/
npm run check          # guide index, internal links and anchors, JSON-LD CSP hash, bash -n, generated docs
npm run check:versions # no stale suite version in current-state text; add -- --manifest, -- --latest
npm run check:browser  # scripts/check-browser.js in the pinned Playwright CLI against the preview
npm run check:links    # external links, GitHub links at their refs; set GITHUB_TOKEN
npm run preview        # serve dist/ on http://127.0.0.1:4173/
bash scripts/gitleaks.sh --staged
```

Run `npm test`, `npm run build`, `npm run check` and `npm run check:versions` before every commit.
The `Site` workflow runs them all on every pull request and push to `main` (with the version data
compared to the signed manifest), and daily also fails when Hive has published a release newer
than the reviewed one. For UI
changes, also inspect desktop and mobile captures under the ignored `output/playwright/`
(`npx playwright-cli open http://127.0.0.1:4173/` uses the pinned CLI).
Activate the hooks once per clone with `git config core.hooksPath .githooks` after
`bash scripts/install-gitleaks.sh`; see [CONTRIBUTING](CONTRIBUTING.md). Never use `--no-verify`.

## Content rules

- Public repository: no credentials, personal emails, usernames, home paths, hostnames, real
  IPs, account IDs, private infrastructure or operational state, in files, captures, commit
  messages or PR text. Gitleaks catches secrets only; review the rest yourself. Use
  `example.com` names and documentation address ranges. Product screenshots use synthetic data
  on a disposable installation (see [media provenance](docs/media.md)).
- Check every command, version, flag and claim against the owning repository at its release
  tag before publishing it, and follow [docs/agent-guides.md](docs/agent-guides.md) when a
  release changes. Do not claim a release or production readiness that the owning repository's
  docs do not.
- HiveXUI is the one browser UI of a Hive installation: show product screens as areas of
  HiveXUI and call it "the UI", never a console. Product APIs stay usable on their own; a
  product's own retained UI (the standalone Magnus console, the Cindertrace console and lab) is
  described as that product's, not as HiveXUI.
- Ardent has its own repository and guide and can be managed by Magnus; it is headless and its
  section shows Magnus mission control. Ardent Project Studio has a guide but no product
  section. Emberfold shows a verified CLI excerpt. Inference runtimes and model storage stay
  external to Hive.
- Embermend claims stay tied to its acceptance ledger and compatible signed Hive releases;
  production starts with scoped assessment and disabled mutation policies.

## Gotchas

- Editing the JSON-LD `<script>` in `index.html` changes its CSP hash: update the exact
  SHA-256 in `public/_headers` (`npm run check` prints the expected value). Do not loosen the policy.
- Every Markdown guide must also be listed in `public/llms.txt`, `public/sitemap.xml`, the
  no-JavaScript fallback and the JSON-LD graph in `index.html`; `npm run check` enforces it.
- Write the reviewed release and its pins in docs as tokens, not literals: `{{hm.suite}}`,
  `{{hm.version:COMPONENT}}` and `{{hm.since:COMPONENT}}` (components are the manifest's, plus
  `ardent` and `magnus-agent`). An unknown token fails the build. Literal versions in dated
  records and in sentences about a specific release stay literal.
- `public/404.html` must stay: without it Pages answers unknown paths with `index.html` and 200.
- Keep the build static: no Pages Functions, bindings or analytics.
- Cloudflare Pages deploys `main` automatically; branches get preview deployments. See
  [deployment](docs/deployment.md).
