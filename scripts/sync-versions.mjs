#!/usr/bin/env node
// Regenerate data/versions.json from the signed Hive release manifests.
//
//   node scripts/sync-versions.mjs --hive HIVE_CHECKOUT --magnus MAGNUS_CHECKOUT --current X.Y.Z
//
// For every tag v3.* up to --current, it reads releases/X.Y.Z.json, its detached signature and
// trust/publisher.pub at that tag, verifies the Ed25519 signature with OpenSSL, and records the
// pinned versions and image digests. The Ardent version a release stages comes from the Magnus host
// agent's npm-shrinkwrap.json at the agent's tag. Publication dates come from the GitHub releases of
// ChefTaco/hive; a tag without a published release is recorded with "published": null.
// `--current` is the release the guides are reviewed against; never set it to an unpublished tag.
// Each release links its section of UPGRADING.md at the --current tag ("Suite X.Y.Z: ..." or, for
// older releases, "Suite X.Y: ..."). Hand-written notes, upgradeRules and pathRules are kept.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { slug } from "./lib/markdown.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "data", "versions.json");
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, index, all) => (arg.startsWith("--") ? [...pairs, [arg.slice(2), all[index + 1]]] : pairs), []));
for (const name of ["hive", "magnus", "current"]) if (!args[name]) {
  console.error("Usage: node scripts/sync-versions.mjs --hive HIVE_CHECKOUT --magnus MAGNUS_CHECKOUT --current X.Y.Z");
  process.exit(2);
}

const git = (dir, ...rest) => execFileSync("git", ["-C", dir, ...rest], { encoding: "buffer", maxBuffer: 64 << 20 });
const gitText = (dir, ...rest) => git(dir, ...rest).toString("utf8").trim();
const semver = version => version.split(".").map(Number);
const compare = (a, b) => { const x = semver(a), y = semver(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };

const current = args.current;
const tags = gitText(args.hive, "tag", "-l", "v3.*").split("\n").filter(tag => /^v\d+\.\d+\.\d+$/.test(tag)).map(tag => tag.slice(1))
  .filter(version => compare(version, current) <= 0).sort(compare);
if (!tags.includes(current)) throw new Error(`Hive checkout has no tag v${current}; fetch its tags first.`);

const response = await fetch("https://api.github.com/repos/ChefTaco/hive/releases?per_page=100", { headers: { accept: "application/vnd.github+json", "user-agent": "hivemagnus-site-sync" } });
if (!response.ok) throw new Error(`GitHub API ${response.status} listing Hive releases`);
const published = new Map((await response.json()).filter(release => !release.draft && !release.prerelease).map(release => [release.tag_name, release.published_at.slice(0, 10)]));
if (!published.has(`v${current}`)) throw new Error(`v${current} is not a published Hive release.`);

// Release sections of UPGRADING.md at the current tag, by version ("3.14.3") or minor line ("3.6").
const upgradingSections = new Map();
for (const line of gitText(args.hive, "show", `v${current}:UPGRADING.md`).split("\n")) {
  const heading = line.match(/^## (Suite (\d+\.\d+(?:\.\d+)?):.*)$/);
  if (heading && !upgradingSections.has(heading[2])) upgradingSections.set(heading[2], slug(heading[1]));
}
const upgradingAnchor = version => upgradingSections.get(version) ?? upgradingSections.get(version.split(".").slice(0, 2).join(".")) ?? null;

const previous = existsSync(output) ? JSON.parse(readFileSync(output, "utf8")) : {};
const work = mkdtempSync(join(tmpdir(), "hive-manifests-"));
const releases = [];
try {
  for (const version of tags) {
    const tag = `v${version}`;
    let manifest;
    try {
      manifest = git(args.hive, "show", `${tag}:releases/${version}.json`);
    } catch {
      continue;
    }
    writeFileSync(join(work, "manifest.json"), manifest);
    writeFileSync(join(work, "manifest.json.sig"), git(args.hive, "show", `${tag}:releases/${version}.json.sig`));
    writeFileSync(join(work, "publisher.pub"), git(args.hive, "show", `${tag}:trust/publisher.pub`));
    execFileSync("openssl", ["pkeyutl", "-verify", "-pubin", "-inkey", join(work, "publisher.pub"), "-rawin", "-in", join(work, "manifest.json"), "-sigfile", join(work, "manifest.json.sig")], { stdio: "pipe" });
    const data = JSON.parse(manifest.toString("utf8"));
    if (data.version !== version) throw new Error(`${tag}: manifest names version ${data.version}`);
    const components = {};
    for (const [name, component] of Object.entries(data.components).sort(([a], [b]) => a.localeCompare(b))) {
      components[name] = { kind: component.kind, version: component.version, digest: component.image.split("@")[1] };
      const init = component.initialization?.image?.split("@")[1];
      if (init && init !== components[name].digest) components[name].initializationDigest = init;
    }
    const agent = data.components.magnus?.agentPackage;
    let ardent = null;
    if (agent) {
      try {
        const lock = JSON.parse(gitText(args.magnus, "show", `v${agent.version}:packages/agent/npm-shrinkwrap.json`));
        ardent = lock.packages?.["node_modules/@hivemagnus/ardent"]?.version ?? null;
      } catch {
        ardent = null;
      }
    }
    releases.push({
      version,
      tag,
      commit: gitText(args.hive, "rev-list", "-n", "1", tag),
      published: published.get(tag) ?? null,
      upgrading: upgradingAnchor(version),
      manifestSHA256: createHash("sha256").update(manifest).digest("hex"),
      controllerSHA256: data.controllerSHA256,
      ...(agent ? { magnusAgent: { name: agent.name, version: agent.version, integrity: agent.integrity } } : {}),
      ardent,
      components,
    });
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

const result = {
  $comment: "Generated by scripts/sync-versions.mjs from the signed Hive release manifests. Edit only notes, upgradeRules and pathRules by hand.",
  current,
  releases: releases.reverse(),
  notes: previous.notes ?? {},
  upgradeRules: previous.upgradeRules ?? [],
  pathRules: previous.pathRules ?? [],
};
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote ${releases.length} verified releases (3.x up to ${current}) to data/versions.json.`);
