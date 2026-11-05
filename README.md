# Hive:Magnus site

Public home for the Hive:Magnus ecosystem at [hivemagnus.com](https://hivemagnus.com).

## Develop

Use Node.js 24.22.1, then run `npm ci` and `npm run dev`. `npm run build` typechecks and emits static files in `dist/`.

The interactive walkthroughs are browser-only explanations. Commands are sourced from the linked repository installation guides and must be rechecked when releases change. UI captures use synthetic data on a disposable installation; never publish a live operator screen, credential, or private endpoint.

With the site open in Playwright CLI (`npx @playwright/cli`), run `playwright-cli run-code --filename scripts/check-browser.js` to check the atlas, all nine console areas, every capture view, hero/directory links, all walkthrough steps, clipboard, keyboard navigation, image loading, accessibility, minimum text size, overflow, and reduced motion at desktop, tablet, and phone widths. The check uses the local `axe-core` development dependency. Save review screenshots under the ignored `output/playwright/` directory.

The gallery in section 3 is one interface, HiveXUI, shown across its product areas in sidebar order. The Magnus area is selected initially; Magnus and Cindertrace offer several captures. Emberfold has no console section, so its CLI excerpt sits below the gallery. Hero and directory links select the matching area. `#interface-PROJECT` deep links and the legacy `#security` anchor remain supported. The atlas distinguishes configured connections from bundled components.

Regenerate captures with `scripts/capture-hivexui.mjs` against a disposable seeded installation; see [media provenance](docs/media.md).

See [media provenance](docs/media.md) for screenshot sources and the verified CLI example. Font licenses are included in `public/licenses/`.

## Agent documentation

The public agent index is [`public/llms.txt`](public/llms.txt). The Markdown site overview is [`public/index.md`](public/index.md); project guides live in [`public/guides/`](public/guides/). These are static files copied unchanged into the build. The site links them through the For agents section, a no-JavaScript fallback, and discovery links in the HTML head.

Each guide records the public source revision and review date. Before changing commands, fetch the current public repository docs and compare prerequisites, arguments, release versions, and expected results. Review existing website walkthroughs for consistency. Do not test installation examples against an existing operator environment. See [the source review record](docs/agent-guides.md).

Project metadata is a static Schema.org `SoftwareSourceCode` JSON-LD graph in `index.html`, including Ardent as part of Magnus. If editing that script, update its exact SHA-256 hash in `public/_headers` to preserve the content security policy.

## Deploy

Cloudflare Pages builds the public GitHub repository's `main` branch with `npm run build` and publishes `dist/`. The production domain is `hivemagnus.com`.

See the [deployment and rollback guide](docs/deployment.md).

## License

Apache-2.0. Product names and screenshots belong to their respective open source projects.
