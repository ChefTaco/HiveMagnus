// Version facts for the site, from data/versions.json (generated from the signed Hive release
// manifests by scripts/sync-versions.mjs). The build uses this module to fill version tokens in the
// Markdown and text docs, to generate compatibility.md and llms-full.txt, and to add <lastmod> to
// the sitemap. Tokens:
//   {{hm.suite}}              the reviewed suite release, e.g. 3.14.3
//   {{hm.version:COMPONENT}}  the version that release pins (a manifest component, `ardent` or `magnus-agent`)
//   {{hm.since:COMPONENT}}    the oldest published release in the unbroken run that pins that version
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../..", import.meta.url));
export const origin = "https://hivemagnus.com";
export const versionsFile = "data/versions.json";

export function loadVersions() {
  const data = JSON.parse(readFileSync(join(root, versionsFile), "utf8"));
  const current = data.releases.find(release => release.version === data.current);
  if (!current) throw new Error(`${versionsFile}: current release ${data.current} is not in releases`);
  if (!current.published) throw new Error(`${versionsFile}: current release ${data.current} is not published`);
  return { ...data, currentRelease: current };
}

/** The version a release pins for a manifest component, or for the derived `ardent` and `magnus-agent`. */
export function pinnedVersion(release, key) {
  if (key === "ardent") return release.ardent ?? null;
  if (key === "magnus-agent") return release.magnusAgent?.version ?? null;
  return release.components[key]?.version ?? null;
}

export function sinceRelease(data, key) {
  const published = data.releases
    .filter(release => release.published && compareVersions(release.version, data.current) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version));
  const version = pinnedVersion(data.currentRelease, key);
  let since = data.current;
  for (const release of published) {
    if (pinnedVersion(release, key) !== version) break;
    since = release.version;
  }
  return since;
}

export function compareVersions(a, b) {
  const x = a.split(".").map(Number), y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

/** The values the homepage needs, kept small so the bundle does not carry the whole history. */
export function homepageVersions(data) {
  const keys = [...Object.keys(data.currentRelease.components), "ardent", "magnus-agent"];
  return { suite: data.current, versions: Object.fromEntries(keys.map(key => [key, pinnedVersion(data.currentRelease, key)])) };
}

const tokenPattern = /\{\{hm\.([a-z]+)(?::([a-z0-9-]+))?\}\}/g;
export const hasTokens = text => /\{\{hm\./.test(text);

/** Replace version tokens; unknown tokens and components throw, so a typo fails the build. */
export function renderTokens(text, data, where = "input") {
  return text.replace(tokenPattern, (token, kind, key) => {
    if (kind === "suite" && !key) return data.current;
    if ((kind === "version" || kind === "since") && key) {
      const version = pinnedVersion(data.currentRelease, key);
      if (!version) throw new Error(`${where}: ${token} names a component that ${data.current} does not pin`);
      return kind === "version" ? version : sinceRelease(data, key);
    }
    throw new Error(`${where}: unknown token ${token}`);
  });
}

const isShallow = () => execFileSync("git", ["-C", root, "rev-parse", "--is-shallow-repository"], { encoding: "utf8" }).trim() !== "false";

/**
 * Fetch the full history when the build runs in a shallow clone (Cloudflare Pages clones shallowly),
 * so the sitemap can be dated. Returns whether full history is available.
 */
export function ensureHistory(log = () => {}) {
  try {
    if (!isShallow()) return true;
    execFileSync("git", ["-C", root, "fetch", "--unshallow", "--quiet"], { stdio: "pipe", timeout: 120000 });
    log("Fetched the full Git history to date the sitemap.");
    return !isShallow();
  } catch (error) {
    log(`Could not fetch the full Git history: ${error.message.split("\n")[0]}`);
    return false;
  }
}

/**
 * Date (YYYY-MM-DD) of the last commit touching any of the paths, or null in a shallow clone or
 * without Git. Paths that exist but were never committed are newer than any commit: today.
 */
export function lastCommitDate(paths) {
  try {
    if (isShallow()) return null;
    const date = execFileSync("git", ["-C", root, "log", "-1", "--format=%cs", "--", ...paths], { encoding: "utf8" }).trim();
    return date || new Date().toISOString().slice(0, 10);
  } catch {
    return null;
  }
}
