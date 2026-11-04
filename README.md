# Hive:Magnus site

Public home for Hive, Magnus, Cindertrace, ChatterMost, and Emberfold at [hivemagnus.com](https://hivemagnus.com).

## Develop

Use Node.js 24.22.1, then run `npm ci` and `npm run dev`. `npm run build` typechecks and emits static files in `dist/`.

The interactive walkthroughs are browser-only explanations. Commands are sourced from the linked repository installation guides and must be rechecked when releases change. UI captures use synthetic or disposable data; never publish a live operator screen, credential, or private endpoint.

With the site open in Playwright CLI, run `playwright-cli run-code --filename scripts/check-browser.js` to check the atlas, all walkthrough steps, clipboard, keyboard navigation, image loading, accessibility and minimum text size at each viewport, narrow viewports, and reduced motion. The check uses the local `axe-core` development dependency. Save review screenshots under the ignored `output/playwright/` directory.

Cindertrace has a dedicated security section, synthetic overview and investigation captures, a Compose installation walkthrough, and an agent guide covering its upgrade path. The system atlas distinguishes its optional Hive and Magnus integrations.

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
