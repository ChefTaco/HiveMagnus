#!/usr/bin/env node
// Version checks (run `npm run build` first for the offline check).
//
//   node scripts/check-versions.mjs             offline: no stale suite version in current-state text
//   node scripts/check-versions.mjs --manifest  also compare data/versions.json with the signed
//                                               manifest of the current release on GitHub
//   node scripts/check-versions.mjs --latest    also fail when Hive has published a newer release
//
// The offline check reads the built Markdown and text docs. Outside a guide's "Source review"
// section (dated review records), every Hive release link (`hive/blob/vX`, `hive/releases/tag/vX`),
// every `--release X.Y.Z` and every "Hive X.Y.Z installs|pins|stages|keeps" must name the reviewed
// release in data/versions.json. Write version facts with the {{hm.*}} tokens to keep them current.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compareVersions, loadVersions, root } from "./lib/site-data.mjs";

const flags = new Set(process.argv.slice(2));
const data = loadVersions();
const failures = [];
const dist = join(root, "dist");
if (!existsSync(join(dist, "index.html"))) {
  console.error("dist/index.html is missing: run `npm run build` first.");
  process.exit(2);
}

const patterns = [
  /ChefTaco\/hive\/(?:blob|tree)\/v(\d+\.\d+\.\d+)\//g,
  /ChefTaco\/hive\/releases\/tag\/v(\d+\.\d+\.\d+)\b/g,
  /--release (\d+\.\d+\.\d+)\b/g,
  /\bHive (\d+\.\d+\.\d+),? (?:installs|pins|stages|keeps|still)\b/g,
];
const docs = ["index.md", "llms.txt", ...readdirSync(join(dist, "guides")).filter(name => name.endsWith(".md")).map(name => `guides/${name}`)];
for (const path of docs) {
  const lines = readFileSync(join(dist, path), "utf8").split("\n");
  for (const [index, line] of lines.entries()) {
    if (/^## Source review\b/.test(line)) break;
    for (const pattern of patterns) for (const match of line.matchAll(pattern)) {
      if (match[1] !== data.current) failures.push(`${path}:${index + 1}: names Hive ${match[1]} ("${match[0]}"); the reviewed release is ${data.current}`);
    }
  }
}

const github = async path => {
  const response = await fetch(`https://api.github.com${path}`, { headers: { accept: "application/vnd.github+json", "user-agent": "hivemagnus-site-version-check", ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) } });
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${path}`);
  return response.json();
};
const raw = async path => {
  const response = await fetch(`https://raw.githubusercontent.com/ChefTaco/hive/v${data.current}/${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${path} at v${data.current}`);
  return Buffer.from(await response.arrayBuffer());
};

if (flags.has("--manifest")) {
  const [manifest, signature, key] = await Promise.all([raw(`releases/${data.current}.json`), raw(`releases/${data.current}.json.sig`), raw("trust/publisher.pub")]);
  const work = mkdtempSync(join(tmpdir(), "hive-manifest-"));
  try {
    writeFileSync(join(work, "m.json"), manifest);
    writeFileSync(join(work, "m.sig"), signature);
    writeFileSync(join(work, "k.pub"), key);
    execFileSync("openssl", ["pkeyutl", "-verify", "-pubin", "-inkey", join(work, "k.pub"), "-rawin", "-in", join(work, "m.json"), "-sigfile", join(work, "m.sig")], { stdio: "pipe" });
  } catch (error) {
    failures.push(`the signature of releases/${data.current}.json at v${data.current} does not verify: ${error.stderr?.toString().trim() || error.message}`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  const current = data.currentRelease;
  if (createHash("sha256").update(manifest).digest("hex") !== current.manifestSHA256) failures.push(`data/versions.json: manifest SHA-256 of ${data.current} differs from the published manifest`);
  const published = JSON.parse(manifest.toString("utf8"));
  if (published.controllerSHA256 !== current.controllerSHA256) failures.push(`data/versions.json: controllerSHA256 of ${data.current} differs from the manifest`);
  for (const [name, component] of Object.entries(published.components)) {
    const recorded = current.components[name];
    if (!recorded) failures.push(`data/versions.json: ${data.current} is missing component ${name}`);
    else if (recorded.version !== component.version || recorded.digest !== component.image.split("@")[1]) failures.push(`data/versions.json: ${name} in ${data.current} differs from the manifest`);
  }
  for (const name of Object.keys(current.components)) if (!(name in published.components)) failures.push(`data/versions.json: ${name} is not in the ${data.current} manifest`);
}

if (flags.has("--latest")) {
  const latest = (await github("/repos/ChefTaco/hive/releases/latest")).tag_name.replace(/^v/, "");
  if (compareVersions(latest, data.current) > 0) failures.push(`Hive ${latest} is published, but the site is reviewed against ${data.current}: follow docs/agent-guides.md ("When a suite release ships") and run scripts/sync-versions.mjs`);
}

if (failures.length) {
  console.error(`Version check failed (${failures.length}):\n${failures.map(message => `- ${message}`).join("\n")}`);
  process.exit(1);
}
console.log(`Version check passed: the site is reviewed against Hive ${data.current}${flags.has("--manifest") ? ", which matches its signed manifest" : ""}${flags.has("--latest") ? " and is the latest published release" : ""}.`);
