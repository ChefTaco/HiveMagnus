# Public media provenance

All HiveXUI captures show the real HiveXUI build. Data is synthetic and the installation is disposable; the images are illustrative, not evidence of a production fleet, live agent activity, or workflow parity.

## HiveXUI gallery, 2026-11-05

| Asset (`public/captures/`) | HiveXUI screen | Gallery area |
| --- | --- | --- |
| `hive-overview.webp` | Hive > Installation | Hive |
| `fleet-overview.webp` | Magnus > Fleet overview | Magnus |
| `fleet-map.webp` | Magnus > Fleet map | Magnus |
| `fleet-mission.webp` | Magnus > Mission control | Magnus |
| `identity.webp` | Oathweave > Users, scrolled to the directory | Oathweave |
| `models.webp` | Emberpath > Traces | Emberpath |
| `memories.webp` | HiveMem > Memories | HiveMem |
| `skills.webp` | HiveSkills catalogue | HiveSkills |
| `cindertrace-overview.webp` | Cindertrace overview | Cindertrace |
| `cindertrace-case.webp` | Cindertrace synthetic case detail | Cindertrace |
| `chat.webp` | ChatterMost, Operations channel | ChatterMost |
| `palette.webp` | Command palette over the installation overview | HiveXUI |

Static files came from a fresh `npm run build` of public HiveXUI revision `565eec413fd4361f0db319ecfb9384a860c7b05f`. API requests reached a disposable Hive full-profile fixture running candidate images on a loopback HTTPS origin, with generated credentials and no operational data. `scripts/capture-hivexui.mjs` drove headless Chromium at 1440 × 900 with `deviceScaleFactor` 2 and no browser chrome. Images are 2880 × 1800, encoded to WebP at quality 0.82 with no crop or content edits.

Data came from a throwaway seed script, not part of this repository: fictional hosts `node-NN.example.com`, documentation addresses from `192.0.2.0/24` and `198.51.100.0/24`, `example.com` accounts, `seed-` usernames and channels, and canned model responses. It wrote Magnus heartbeats and Cindertrace events directly to that stack's own databases, because the browser ingress refuses those machine routes. Ardent and Codex agents do not exist, and failed `df` and `uptime` commands in the fleet overview are expected for hosts that do not exist.

Two responses were changed in the browser for the capture only:

- `/api/oathweave/health/live` reports normal sign-in limits. The fixture relaxes them for testing, and the warning strip that follows must never appear in a public image.
- The fleet topology marks seeded nodes reachable with plausible latency, because the API probes documentation addresses that can never answer. Offline nodes stay offline. This affects `fleet-map.webp` only.

The identity capture shows the users directory rather than the overview, because the overview's session table lists the real local bridge address of the fixture's host. Every image was reviewed at full size before publication for hostnames, addresses, emails, usernames and names. Source posture names adapters such as Wazuh and UniFi only because the seed labels synthetic events that way; no such system was connected.

To reproduce, run a new disposable installation, seed it with obviously fake data, then:

```bash
node scripts/capture-hivexui.mjs --credentials FILE --ui-dist HIVEXUI/dist --playwright-from HIVEXUI --output output/captures
```

The script refuses anything but a `https://localhost:PORT` origin. Review each PNG before copying its WebP into `public/captures/`. It needs `@playwright/test`, which the HiveXUI checkout provides.

## Emberfold CLI excerpt

| Asset | Source revision | Capture scenario |
| --- | --- | --- |
| Emberfold CLI excerpt | `@hivemagnus/emberfold-cli@0.2.2` | Selected fields from actual `prepare --dry-run` output for `scripts/samples/emberfold.json`, with values unchanged; no model calls. First captured with `0.1.0`; `0.2.1` and `0.2.2` produce identical output |

Reproduce the Emberfold output from the site checkout:

```bash
npx --package @hivemagnus/emberfold-cli@0.2.2 emberfold prepare --input scripts/samples/emberfold.json --dry-run
```

The system atlas, brand mark, and project icons are original SVG/CSS artwork; the gallery's colors follow HiveXUI's public design tokens. DM Sans, Space Grotesk, and IBM Plex Mono are self-hosted; their licenses ship in `public/licenses/`.

## Product sections, 2026-11-07

The scrolling product sections reuse the twelve existing HiveXUI captures above without changing their bytes. Each screen is labeled as an area of HiveXUI, the single browser UI, and links to its full-size image. Magnus and Cindertrace retain their alternate capture controls. The hero uses the same synthetic `fleet-overview.webp` asset.

Ardent's section reuses `fleet-mission.webp`, explicitly labeled as Magnus mission control in HiveXUI, where the runtime's host is managed. It does not depict a separate Ardent UI. Emberfold retains the verified HTML terminal excerpt described above and has no console section. The architecture is original CSS and SVG artwork; it distinguishes suite services, the separately configured Ardent runtime, its bundled Emberfold library, and external inference.

No new operational captures, user data or generated product screens were introduced. The previous tabbed gallery layout is recorded in Git history.

The social preview (`og.svg` and `og.png`) names all ten projects and shows `captures/fleet-overview.webp`, cropped, in a console-styled frame. The rest is original SVG artwork; the PNG is rendered in Chromium at 1200 × 630 and contains only public project names, website copy and that synthetic capture.
