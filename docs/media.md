# Public media provenance

All captures show actual project UI code. Data is synthetic; the images are illustrative, not evidence of a production fleet or live agent activity.

| Asset | Source revision | Capture scenario |
| --- | --- | --- |
| Hive console | `e29ffb40d70bb9c3e7ae3abc6453995e5ffa1a2a` | Public Hive UI dev server, browser API fixtures in `scripts/demo-hive.js` |
| Magnus console | `f1f3c6a2e3dce2e2fa506341ee400d4d4d6d5d75` | Public Magnus UI dev server, isolated Redis and synthetic local Control API responses; eight fictional nodes |
| ChatterMost chat | `b4834314b330c6f9b723d4b37a67c7ea4687adb6` | Disposable JSON-store server with sample administrator and sample messages |
| Emberfold CLI excerpt | `@hivemagnus/emberfold-cli@0.1.0` | Actual `prepare --dry-run` output for `scripts/samples/emberfold.json`; no model calls |

The Next.js development toolbar was hidden before the Magnus capture. Product content and styling were not altered. Each screenshot was reviewed visually before publication.

Reproduce the Emberfold output from the site checkout:

```bash
npx --package @hivemagnus/emberfold-cli@0.1.0 emberfold prepare --input scripts/samples/emberfold.json --dry-run
```

The system atlas, brand mark, and orbit illustration are original SVG/CSS artwork. DM Sans, Space Grotesk, and IBM Plex Mono are self-hosted; their licenses ship in `public/licenses/`.
