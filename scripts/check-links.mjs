#!/usr/bin/env node
// External link check of the built site in dist/ (run `npm run build` first).
//
// GitHub links are checked at the ref they name: a blob or raw link must exist at that tag,
// branch or commit and, for Markdown, its #anchor must match a heading; a release link must name a
// published release; a security advisory link needs private vulnerability reporting. npm links
// are checked against the registry. Other links must answer 2xx after redirects. Links inside
// code, loopback and documentation addresses (example.com, .test, .internal) are not fetched.
// Set GITHUB_TOKEN to raise the GitHub API limit; without it, advisory links are not verified.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { headingAnchors, markdownLinks } from "./lib/markdown.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const userAgent = "hivemagnus-site-link-check";

const walk = dir => readdirSync(join(dist, dir), { withFileTypes: true }).flatMap(entry => {
  const path = dir ? `${dir}/${entry.name}` : entry.name;
  return entry.isDirectory() ? walk(path) : [path];
});
const read = path => readFileSync(join(dist, path), "utf8");

/** url -> [source:line, ...] */
const found = new Map();
const add = (url, where) => {
  const clean = url.replace(/&amp;/g, "&");
  if (!/^https?:\/\//.test(clean) || skipHost(new URL(clean).hostname)) return;
  if (!found.has(clean)) found.set(clean, []);
  found.get(clean).push(where);
};
function skipHost(host) {
  return host === "hivemagnus.com" || host === "localhost" || host === "schema.org" || /^\d+(\.\d+){3}$/.test(host) || !host.includes(".") ||
    /(^|\.)example\.(com|org|net)$/.test(host) || /\.(test|example|internal|invalid|localhost)$/.test(host);
}

for (const path of walk("")) {
  if (path.startsWith("licenses/")) continue;
  if (/\.(md|txt)$/.test(path)) {
    const text = read(path);
    for (const { url, line } of markdownLinks(text)) add(url, `${path}:${line}`);
    if (path.endsWith("security.txt")) text.split("\n").forEach((line, index) => {
      const field = line.match(/^(?:Contact|Policy|Canonical|Acknowledgments|Hiring):\s*(\S+)/);
      if (field) add(field[1], `${path}:${index + 1}`);
    });
  } else if (path.endsWith(".html")) {
    const text = read(path);
    for (const match of text.matchAll(/\s(?:href|src)="([^"]+)"/g)) add(match[1], `${path}:${text.slice(0, match.index).split("\n").length}`);
  }
}
// Homepage content is rendered by src/main.ts; check its literal URLs (not template expressions).
const main = readFileSync(join(root, "src", "main.ts"), "utf8");
main.split("\n").forEach((line, index) => {
  for (const match of line.matchAll(/https?:\/\/[^\s"'`<>)\\${}]+/g)) {
    if (line[match.index + match[0].length] === "$") continue;
    add(match[0].replace(/[.,;:]+$/, ""), `src/main.ts:${index + 1}`);
  }
});

async function request(url, { method = "GET", headers = {}, attempts = 4 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { method, redirect: "follow", headers: { "user-agent": userAgent, ...headers }, signal: AbortSignal.timeout(30000) });
      if ((response.status === 429 || response.status >= 500) && attempt < attempts) {
        await response.body?.cancel();
        const retryAfter = Number(response.headers.get("retry-after"));
        await new Promise(resolve => setTimeout(resolve, Math.min(60, retryAfter || 2 ** attempt) * 1000));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000));
    }
  }
  throw lastError;
}
const api = path => request(`https://api.github.com${path}`, { headers: { accept: "application/vnd.github+json", ...(token ? { authorization: `Bearer ${token}` } : {}) } });

const memo = new Map();
const once = (key, task) => {
  if (!memo.has(key)) memo.set(key, task());
  return memo.get(key);
};

async function rawFile(owner, repo, ref, path) {
  return once(`raw:${owner}/${repo}/${ref}/${path}`, async () => {
    const response = await request(`https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`);
    return response.ok ? await response.text() : null;
  });
}
// GitHub serves /releases/tag/T for a published release and for a bare tag, so accept either.
async function releaseTags(owner, repo) {
  return once(`releases:${owner}/${repo}`.toLowerCase(), async () => {
    const tags = new Set();
    for (let page = 1; ; page++) {
      const response = await api(`/repos/${owner}/${repo}/releases?per_page=100&page=${page}`);
      if (!response.ok) throw new Error(`GitHub API ${response.status} listing releases of ${owner}/${repo}`);
      const releases = await response.json();
      for (const release of releases) if (!release.draft) tags.add(release.tag_name);
      if (releases.length < 100) break;
    }
    const refs = await api(`/repos/${owner}/${repo}/git/matching-refs/tags`);
    if (!refs.ok) throw new Error(`GitHub API ${refs.status} listing tags of ${owner}/${repo}`);
    for (const ref of await refs.json()) tags.add(ref.ref.replace(/^refs\/tags\//, ""));
    return tags;
  });
}

async function checkGitHub(url) {
  const { pathname, hash } = new URL(url);
  const [, owner, repo, kind, ...rest] = pathname.split("/");
  if (!owner) return null;
  if (!repo) return checkPlain(url);
  if (kind === "blob" || kind === "raw") {
    const [ref, ...parts] = rest;
    const path = parts.join("/");
    const text = await rawFile(owner, repo, ref, path);
    if (text === null) return `${path} does not exist at ${ref}`;
    const fragment = decodeURIComponent(hash.slice(1));
    if (fragment && /\.(md|markdown)$/i.test(path) && !/^L\d+/.test(fragment) && !headingAnchors(text).has(fragment)) return `${path} at ${ref} has no heading for #${fragment}`;
    return null;
  }
  if (kind === "tree") {
    const [ref, ...parts] = rest;
    const response = await api(`/repos/${owner}/${repo}/contents/${parts.join("/")}?ref=${encodeURIComponent(ref)}`);
    return response.ok ? null : `${parts.join("/") || "the tree"} does not exist at ${ref} (GitHub API ${response.status})`;
  }
  if (kind === "releases" && rest[0] === "tag") {
    const tag = decodeURIComponent(rest.slice(1).join("/"));
    return (await releaseTags(owner, repo)).has(tag) ? null : `no release or tag ${tag}`;
  }
  if (kind === "releases" && rest[0] === "latest") {
    return (await releaseTags(owner, repo)).size ? null : "the repository has no published release";
  }
  if (kind === "security" && rest[0] === "advisories" && rest[1] === "new") {
    if (!token) return undefined;
    const response = await api(`/repos/${owner}/${repo}/private-vulnerability-reporting`);
    if (!response.ok) return `GitHub API ${response.status} reading private vulnerability reporting`;
    return (await response.json()).enabled ? null : "private vulnerability reporting is disabled, so the advisory form does not open";
  }
  return checkPlain(url);
}

async function checkNpm(url) {
  const { pathname } = new URL(url);
  const pkg = pathname.match(/^\/package\/((?:@[^/]+\/)?[^/]+)(?:\/v\/([^/]+))?/);
  if (pkg) {
    const response = await request(`https://registry.npmjs.org/${pkg[1].replaceAll("/", "%2F")}`);
    if (!response.ok) return `npm registry ${response.status} for ${pkg[1]}`;
    if (pkg[2] && !(pkg[2] in (await response.json()).versions)) return `${pkg[1]} has no version ${pkg[2]}`;
    return null;
  }
  const user = pathname.match(/^\/~([^/]+)/);
  if (user) {
    const response = await request(`https://registry.npmjs.org/-/v1/search?text=maintainer:${encodeURIComponent(user[1])}&size=1`);
    return response.ok && (await response.json()).total > 0 ? null : `npm user ${user[1]} has no packages`;
  }
  return checkPlain(url);
}

async function checkPlain(url) {
  return once(`plain:${url.split("#")[0]}`, async () => {
    const response = await request(url.split("#")[0]);
    await response.body?.cancel();
    return response.ok ? null : `HTTP ${response.status}`;
  });
}

async function check(url) {
  const host = new URL(url).hostname;
  if (host === "github.com") return checkGitHub(url);
  if (host === "raw.githubusercontent.com") {
    const [, owner, repo, ...rest] = new URL(url).pathname.split("/");
    return (await rawFile(owner, repo, rest[0], rest.slice(1).join("/"))) === null ? "the file does not exist at that ref" : null;
  }
  if (host === "www.npmjs.com" || host === "npmjs.com") return checkNpm(url);
  return checkPlain(url);
}

const urls = [...found.keys()].sort();
const broken = [];
let unverified = 0;
let next = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (next < urls.length) {
    const url = urls[next++];
    let problem;
    try {
      problem = await check(url);
    } catch (error) {
      problem = `request failed: ${error.cause?.code ?? error.message}`;
    }
    if (problem === undefined) unverified++;
    else if (problem) broken.push({ url, problem });
  }
}));

if (broken.length) {
  console.error(`Link check failed: ${broken.length} of ${urls.length} links.`);
  for (const { url, problem } of broken.sort((a, b) => a.url.localeCompare(b.url))) console.error(`- ${url}\n  ${problem}; linked from ${found.get(url).join(", ")}`);
  process.exit(1);
}
console.log(`Link check passed: ${urls.length} external links${unverified ? `, ${unverified} advisory links not verified without GITHUB_TOKEN` : ""}.`);
