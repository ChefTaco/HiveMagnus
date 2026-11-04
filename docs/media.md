# Public media provenance

All captures show actual project UI code. Data is synthetic; the images are illustrative, not evidence of a production fleet or live agent activity.

| Asset | Source revision | Capture scenario |
| --- | --- | --- |
| Hive console | `e29ffb40d70bb9c3e7ae3abc6453995e5ffa1a2a` | Public Hive UI dev server, browser API fixtures in `scripts/demo-hive.js` |
| Magnus console | `f1f3c6a2e3dce2e2fa506341ee400d4d4d6d5d75` | Public Magnus UI dev server, isolated Redis and synthetic local Control API responses; eight fictional nodes |
| ChatterMost chat | `b4834314b330c6f9b723d4b37a67c7ea4687adb6` | Disposable JSON-store server with sample administrator and sample messages |
| Emberfold CLI excerpt | `@hivemagnus/emberfold-cli@0.1.0` | Selected fields from actual `prepare --dry-run` output for `scripts/samples/emberfold.json`, with values unchanged; no model calls |

The Next.js development toolbar was hidden before the Magnus capture. Product content and styling were not altered. Each screenshot was reviewed visually before publication.

Reproduce the Emberfold output from the site checkout:

```bash
npx --package @hivemagnus/emberfold-cli@0.1.0 emberfold prepare --input scripts/samples/emberfold.json --dry-run
```

The system atlas, brand mark, project icons, and orbit illustration are original SVG/CSS artwork. DM Sans, Space Grotesk, and IBM Plex Mono are self-hosted; their licenses ship in `public/licenses/`.

## Cindertrace, 2026-11-04

`captures/cindertrace-overview.webp` and `captures/cindertrace-case.webp` show the actual console from public revision `a92c12a4e7386be6099e6becebc115fc146b91b1` (application code matches release `576f4b4e7ba4ef5f0524deb213137b3fd643aa88`). A clean Git archive was built into a separately named image and launched as a new disposable Compose project with fresh secrets, separate PostgreSQL/Redis volumes, and a loopback port. No production configuration or source adapters were copied or enabled. Hive and Magnus were absent.

The public `scripts/demo.mjs --preserve` fixture ingested one synthetic Wazuh authentication observation and preserved its evidence. The examples use `app-1.example.com` and `operator@example.com`. Source health represents this local synthetic ingestion, not a live Wazuh deployment. Host response is visibly unconfigured. Captures contain no operational records, credentials, private hostnames, or browser chrome. Product styling and content were not modified for the screenshots.

To reproduce, follow Cindertrace's isolated demo instructions in a separate checkout with generated configuration. Sign in privately, then run this site's `scripts/capture-cindertrace.js` with Playwright CLI. It waits for the case heading before capture to avoid recording the preceding overview during navigation. Screenshots are 1440 × 900; reviewed PNGs were encoded to WebP at quality 92 with no crop or content edits. Review the images before copying them into `public/captures/`.
