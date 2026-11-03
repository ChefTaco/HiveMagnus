# Hive:Magnus site

Public home for the Hive ecosystem at [hivemagnus.com](https://hivemagnus.com).

## Develop

Use Node.js 24.22.1, then run `npm ci` and `npm run dev`. `npm run build` typechecks and emits static files in `dist/`.

The interactive walkthroughs are browser-only explanations. Commands are sourced from the linked repository installation guides and must be rechecked when releases change. UI captures use synthetic or disposable data; never publish a live operator screen, credential, or private endpoint.

With the site open in Playwright CLI, run `playwright-cli run-code --filename scripts/check-browser.js` to check the atlas, all walkthrough steps, clipboard, keyboard navigation, image loading, accessibility and minimum text size at each viewport, narrow viewports, and reduced motion. The check uses the local `axe-core` development dependency. Save review screenshots under the ignored `output/playwright/` directory.

See [media provenance](docs/media.md) for screenshot sources and the verified CLI example. Font licenses are included in `public/licenses/`.

## Deploy

Cloudflare Pages builds the public GitHub repository's `main` branch with `npm run build` and publishes `dist/`. The production domain is `hivemagnus.com`.

See the [deployment and rollback guide](docs/deployment.md).

## License

Apache-2.0. Product names and screenshots belong to their respective open source projects.
