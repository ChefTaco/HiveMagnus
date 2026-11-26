# Site contributor instructions

This repository is the public website for the Hive:Magnus suite at `hivemagnus.com`: a static
Vite and TypeScript page plus Markdown guides for people and agents. It documents the products;
it does not ship any of them. Each product's own repository is the source of truth.

## Layout

- `index.html`: page shell, head metadata and the Schema.org JSON-LD graph.
- `src/main.ts`, `src/style.css`: all homepage content (product sections, architecture,
  walkthroughs) and its behavior. `HIVE_SUITE_VERSION` names the reviewed suite release.
- `public/`: copied unchanged into `dist/`. Agent docs (`llms.txt`, `index.md`, `guides/*.md`),
  captures, `_headers` (security headers and CSP), `_redirects`, `404.html`, `sitemap.xml`,
  `.well-known/security.txt` and font licenses.
- `scripts/`: the browser check, the capture scripts, the Emberfold sample input and the
  Gitleaks tooling.
- `docs/`: [deployment and rollback](docs/deployment.md), [media provenance](docs/media.md) and
  [how to update the guides](docs/agent-guides.md).
- `deployment/node-build/`: the Node.js definition Cloudflare Pages builds with.

## Commands

Use Node.js from `.node-version` (24.22.3).

```bash
npm ci
npm run build          # tsc --noEmit, then vite build into dist/
npm run check          # guide index, internal links and anchors, JSON-LD CSP hash, bash -n
npm run check:browser  # scripts/check-browser.js in the pinned Playwright CLI against the preview
npm run check:links    # external links, GitHub links at their refs; set GITHUB_TOKEN
npm run preview        # serve dist/ on http://127.0.0.1:4173/
bash scripts/gitleaks.sh --staged
```

Run `npm run build` and `npm run check` before every commit. The `Site` workflow runs the build
and all three checks on every pull request and push to `main`, and the link check weekly. For UI
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
- `public/404.html` must stay: without it Pages answers unknown paths with `index.html` and 200.
- Keep the build static: no Pages Functions, bindings or analytics.
- Cloudflare Pages deploys `main` automatically; branches get preview deployments. See
  [deployment](docs/deployment.md).
