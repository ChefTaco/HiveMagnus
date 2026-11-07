# Site contributor instructions

This is a public static website. Keep credentials, personal email addresses, account IDs, private infrastructure, and operational state out of commits and captures. Use synthetic examples for all product screenshots.

Use Node.js from `.node-version`. Run `npm ci` and `npm run build` before committing. For UI changes, run the Playwright CLI check in `scripts/check-browser.js` against the local preview, then inspect desktop and mobile captures. Review installation commands against the linked public project docs when changing a walkthrough.

Cloudflare Pages builds `main` and serves `dist/`. Keep the build static. Update `docs/media.md` when replacing public UI captures. The directory covers Hive, Emberpath, Oathweave, HiveMem, HiveSkills, HiveXUI, Magnus, Cindertrace, ChatterMost and Emberfold, plus Ardent, which has its own repository and shares the Magnus guide because Magnus can manage it on fleet hosts. HiveXUI is the one browser UI in a Hive installation, so show product screens as areas of that console. Do not claim a release or production readiness unless the owning repository's docs say so. Inference runtimes and model storage remain external to Hive.
