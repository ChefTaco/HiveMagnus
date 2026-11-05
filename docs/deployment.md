# Cloudflare Pages deployment

The `hivemagnus` Pages project connects to `ChefTaco/HiveMagnus`. Production follows `main`; other branches receive preview deployments. The canonical public URL is `https://hivemagnus.com/`.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output | `dist` |
| Root | repository root |
| Node | `.node-version` |
| Hosting | static Cloudflare Pages; no Functions or service bindings |

For a site change, run `npm ci`, `npm run build`, and the browser check documented in the README. Push a branch, review its Pages preview, then fast-forward or merge the reviewed change to `main`. Pages builds the committed source automatically.

After deployment, check the canonical domain in a real browser, verify the certificate, navigate every walkthrough, copy a command, and open the UI captures. Confirm the served deployment corresponds to the intended Git commit. The static response policy is in `public/_headers`. Unknown paths must return the `public/404.html` page with status 404; without that file Pages answers every path with `index.html` and status 200.

HSTS starts at `max-age=86400`. Raise it to `31536000` once HTTPS has stayed healthy for a week or two. It omits `includeSubDomains` and `preload`, so it applies only to the host that sends it; add those only after confirming every current and future subdomain serves HTTPS.

HTML uses `no-transform` to keep automatic proxy script injection from conflicting with the site's source-only content policy. No analytics script is part of this site.

Security reporting contacts are published at `/.well-known/security.txt`; `/security.txt` redirects there through `public/_redirects`. The file links to each project's GitHub private vulnerability reporting form and security policy. Recheck these links and renew its `Expires` field before 2027-05-05. After deployment, verify the canonical file returns `200` with `text/plain; charset=utf-8` and the root alias redirects to it.

For rollback, select the last known good production deployment in the Pages dashboard and choose **Rollback to this deployment**. Revert the source change as well so the next push does not republish it. Keep DNS connected to the Pages custom domain during a code rollback.
