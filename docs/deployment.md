# Cloudflare Pages deployment

The `hivemagnus` Pages project connects to `ChefTaco/HiveMagnus`. Production follows `main`; other branches receive preview deployments. The canonical public URL is `https://hivemagnus.com/`.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output | `dist` |
| Root | repository root |
| Node | `.node-version` |
| Hosting | static Cloudflare Pages; no Functions or service bindings |

The quick start clones Hive’s launcher and uses `./hive.sh --release latest`. The launcher resolves the published release at install time, so the site stays static and its install command needs no version bump. Users can replace `latest` with an exact version. Keep installation commands aligned with Hive’s public launcher docs. The product details in `public/guides/hive.md` and the other guides name the suite release they were reviewed against (`HIVE_SUITE_VERSION` in `src/main.ts`); refresh them as [Updating the guides](agent-guides.md) describes after checking a new release’s tagged docs and attached files.

For a site change, run `npm ci`, `npm run build` and the checks documented in [AGENTS.md](../AGENTS.md#commands). Push a branch and open a pull request: the `Site` workflow (`.github/workflows/site.yml`) builds it and runs the site, browser and external link checks, and Pages builds a preview. Merge the reviewed change to `main` only when the workflow passes; Pages builds the committed source automatically. Keep `Site` and `Gitleaks` as required status checks on the default branch.

After deployment, check the canonical domain in a real browser, verify the certificate, navigate every walkthrough, copy a command, and open the UI captures. Confirm the served deployment corresponds to the intended Git commit. The static response policy is in `public/_headers`. Unknown paths must return the `public/404.html` page with status 404; without that file Pages answers every path with `index.html` and status 200.

HSTS uses `max-age=31536000` (one year), raised from the initial `86400` on 2026-11-17 after HTTPS stayed healthy. It omits `includeSubDomains` and `preload`, so it applies only to the host that sends it; add those only after confirming every current and future subdomain serves HTTPS.

HTML uses `no-transform` to keep automatic proxy script injection from conflicting with the site's source-only content policy. No analytics script is part of this site.

Security reporting contacts are published at `/.well-known/security.txt`; `/security.txt` redirects there through `public/_redirects`. The file links to each project's GitHub private vulnerability reporting form and security policy. Recheck these links and renew its `Expires` field before 2027-05-05. After deployment, verify the canonical file returns `200` with `text/plain; charset=utf-8` and the root alias redirects to it.

## Node.js version on Pages

The preview and production build environments use
`NODE_BUILD_DEFINITIONS=/opt/buildhome/repo/deployment/node-build`.
This is [node-build's supported definition search path](https://github.com/nodenv/node-build#custom-build-configuration).
The repository definition selects the official Node.js 24.22.3 archive and verifies
its SHA-256 from the [upstream release checksums](https://nodejs.org/dist/v24.22.3/SHASUMS256.txt).
It lets Pages install the security release before its shared node-build catalog
includes that version. Cloudflare documents the checkout directory in its
[build configuration guide](https://developers.cloudflare.com/pages/how-to/npm-private-registry/#managing-multiple-environments).

When changing `.node-version`, add the matching definition with reviewed upstream
checksums and prove a preview build before updating production settings.

## Rollback

For rollback, select the last known good production deployment in the Pages dashboard and choose **Rollback to this deployment**. Revert the source change as well so the next push does not republish it. Keep DNS connected to the Pages custom domain during a code rollback.
