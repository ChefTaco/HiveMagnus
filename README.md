# Hive:Magnus site

Public home for the Hive:Magnus ecosystem at [hivemagnus.com](https://hivemagnus.com).

## Develop

Use Node.js 24.22.3 and exactly TypeScript 6.0.3 with strict typing, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`, then run `npm ci` and `npm run dev`. `npm run build` typechecks and emits static files in `dist/`.

The interactive walkthroughs are browser-only explanations. Commands are sourced from the linked repository installation guides and must be rechecked when releases change. UI captures use synthetic data on a disposable installation; never publish a live operator screen, credential, or private endpoint.

The homepage leads with full-stack agent management, then tells the story in two sections: what the suite is good for (six use cases, each linking the products it uses) and the two ways to deploy it (operators run the whole suite with Hive in four steps; developers use individual products, npm packages and SDKs on their own). It continues with a copyable one-line launch command using `--release latest` for the signed Hive release, Linux availability (macOS and Windows are coming), an interactive architecture view, and twelve individual product sections. The launcher resolves the release when run; users can substitute an exact version. It opens guided setup on a prepared host: choose `full`, review the plan, then confirm. A nearby prerequisite link and walkthrough cover fresh Linux hosts. Inference runtimes and model storage stay external.

Tailscale is the recommended optional path to private access to HiveXUI and a certificate. The recommendation links to Tailscale, and its setup modal covers installation and sign-in, MagicDNS and HTTPS Certificates, Hive's explicit certificate helper, and separately scheduled renewal. Hive never installs Tailscale. When Tailscale is already signed in with HTTPS Certificates enabled, guided setup can request this host's certificate; otherwise setup asks for existing certificate files. Bring-your-own certificates remain supported.

With `npm run preview` serving the build, open it in Playwright CLI with `npx @playwright/cli open http://127.0.0.1:4173/`, then run `npx @playwright/cli run-code --filename scripts/check-browser.js`. It checks page hierarchy, navigation targets, the use cases and deployment paths, all twelve architecture selections and product sections, capture switching and image loading, walkthroughs, clipboard, modal focus and dismissal, deep links, agent docs, accessibility and overflow at desktop, tablet and phone widths. Save review screenshots under the ignored `output/playwright/` directory.

The product sections show ten areas of HiveXUI, the single browser UI. Magnus and Cindertrace have switchable captures. Ardent is headless and is illustrated by a clearly labeled Magnus mission-control capture; Emberfold shows its verified CLI excerpt. All products remain visible while scrolling, and `#interface-PROJECT`, `#interfaces` and legacy `#security` links remain supported. The footer links the GitHub account and npm publisher profile.

Regenerate captures with `scripts/capture-hivexui.mjs` against a disposable seeded installation. See [media provenance](docs/media.md) for screenshot sources and the verified CLI example. Font licenses are included in `public/licenses/`.

## Agent documentation

The public agent index is [`public/llms.txt`](public/llms.txt). The Markdown site overview is [`public/index.md`](public/index.md); project guides live in [`public/guides/`](public/guides/). These are static files copied unchanged into the build. The site links them through the For agents section, a no-JavaScript fallback, and discovery links in the HTML head.

Each guide records the public source revision and review date. Before changing commands, fetch the current public repository docs and compare prerequisites, arguments, release versions, and expected results. Review existing website walkthroughs for consistency. Do not test installation examples against an existing operator environment. [Updating the guides](docs/agent-guides.md) lists the files to change for a new suite or product release and keeps the dated review history.

Project metadata is a static Schema.org `SoftwareSourceCode` JSON-LD graph in `index.html`, including Ardent, which has its own repository. If editing that script, update its exact SHA-256 hash in `public/_headers` to preserve the content security policy.

## Deploy

Cloudflare Pages builds the public GitHub repository's `main` branch with `npm run build` and publishes `dist/`. The production domain is `hivemagnus.com`.

See the [deployment and rollback guide](docs/deployment.md), which also covers the Node.js version Pages builds with.

## License

Apache-2.0. Product names and screenshots belong to their respective open source projects.
