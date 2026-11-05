# Site contributor instructions

This is a public static website. Keep credentials, personal email addresses, account IDs, private infrastructure, and operational state out of commits and captures. Use synthetic examples for all product screenshots.

Use Node.js from `.node-version`. Run `npm ci` and `npm run build` before committing. For UI changes, run the Playwright CLI check in `scripts/check-browser.js` against the local preview, then inspect desktop and mobile captures. Review installation commands against the linked public project docs when changing a walkthrough.

Cloudflare Pages builds `main` and serves `dist/`. Keep the build static. Update `docs/media.md` when replacing public UI captures. The directory covers Hive, Emberpath, Oathweave, HiveMem, HiveSkills, HiveXUI, Magnus, Cindertrace, ChatterMost and Emberfold; Ardent is part of Magnus. Distinguish candidate extractions from published releases and retained legacy captures. Inference runtimes and model storage remain external to Hive.
