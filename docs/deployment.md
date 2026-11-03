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

After deployment, check the canonical domain in a real browser, verify the certificate, navigate every walkthrough, copy a command, and open the UI captures. Confirm the served deployment corresponds to the intended Git commit. The static response policy is in `public/_headers`.

For rollback, select the last known good production deployment in the Pages dashboard and choose **Rollback to this deployment**. Revert the source change as well so the next push does not republish it. Keep DNS connected to the Pages custom domain during a code rollback.
