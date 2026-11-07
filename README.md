# Hive:Magnus site

Public home for the Hive:Magnus ecosystem at [hivemagnus.com](https://hivemagnus.com).

## Develop

Use Node.js 24.22.1, then run `npm ci` and `npm run dev`. `npm run build` typechecks and emits static files in `dist/`.

The interactive walkthroughs are browser-only explanations. Commands are sourced from the linked repository installation guides and must be rechecked when releases change. UI captures use synthetic data on a disposable installation; never publish a live operator screen, credential, or private endpoint.

The homepage leads with full-stack agent management, a copyable one-line launch command using `--release latest` for the signed Hive release, Linux availability (macOS and Windows are coming), an interactive architecture view, and eleven individual product sections. The launcher resolves the release when run; users can substitute an exact version. It opens guided setup on a prepared host: choose `full`, review the plan, then confirm. A nearby prerequisite link and walkthrough cover fresh Linux hosts. Inference runtimes and model storage stay external.

Tailscale is the recommended optional path to private console access and a certificate. The recommendation links to Tailscale, and its setup modal covers installation and sign-in, MagicDNS and HTTPS Certificates, Hive's explicit certificate helper, and separately scheduled renewal. Hive setup asks for existing certificate files; it does not automatically install Tailscale or request a certificate. Bring-your-own certificates remain supported.

With the local preview open in Playwright CLI (`npx @playwright/cli`), run `playwright-cli run-code --filename scripts/check-browser.js`. It checks page hierarchy, all eleven architecture selections and product sections, capture switching and image loading, walkthroughs, clipboard, modal focus and dismissal, deep links, agent docs, accessibility and overflow at desktop, tablet and phone widths. Save review screenshots under the ignored `output/playwright/` directory.

The product sections show nine areas of the same HiveXUI console. Magnus and Cindertrace have switchable captures. Ardent is headless and is illustrated by a clearly labeled Magnus mission-control capture; Emberfold shows its verified CLI excerpt. All products remain visible while scrolling, and `#interface-PROJECT`, `#interfaces` and legacy `#security` links remain supported. The footer links the GitHub account and npm publisher profile.

Regenerate captures with `scripts/capture-hivexui.mjs` against a disposable seeded installation; see [media provenance](docs/media.md).

See [media provenance](docs/media.md) for screenshot sources and the verified CLI example. Font licenses are included in `public/licenses/`.

## Agent documentation

The public agent index is [`public/llms.txt`](public/llms.txt). The Markdown site overview is [`public/index.md`](public/index.md); project guides live in [`public/guides/`](public/guides/). These are static files copied unchanged into the build. The site links them through the For agents section, a no-JavaScript fallback, and discovery links in the HTML head.

Each guide records the public source revision and review date. Before changing commands, fetch the current public repository docs and compare prerequisites, arguments, release versions, and expected results. Review existing website walkthroughs for consistency. Do not test installation examples against an existing operator environment. See [the source review record](docs/agent-guides.md).

Project metadata is a static Schema.org `SoftwareSourceCode` JSON-LD graph in `index.html`, including Ardent, which has its own repository. If editing that script, update its exact SHA-256 hash in `public/_headers` to preserve the content security policy.

## Deploy

Cloudflare Pages builds the public GitHub repository's `main` branch with `npm run build` and publishes `dist/`. The production domain is `hivemagnus.com`.

See the [deployment and rollback guide](docs/deployment.md).

## License

Apache-2.0. Product names and screenshots belong to their respective open source projects.
