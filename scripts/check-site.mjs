#!/usr/bin/env node
// Offline checks of the built site in dist/ (run `npm run build` first):
// - every guide is listed in llms.txt, sitemap.xml, the no-JavaScript fallback and the JSON-LD graph;
// - every hivemagnus.com or root-relative link resolves to a built file, and Markdown anchors exist;
// - the JSON-LD block parses and its SHA-256 matches the CSP in _headers;
// - Bash blocks in the Markdown docs pass `bash -n`;
// - version tokens are filled, compatibility.md and llms-full.txt are generated, llms-full.txt holds
//   every guide, and every sitemap URL has a <lastmod> (unless the clone is shallow).
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { codeBlocks, headingAnchors, markdownLinks } from "./lib/markdown.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const origin = "https://hivemagnus.com";
const failures = [];
const fail = message => failures.push(message);

if (!existsSync(join(dist, "index.html"))) {
  console.error("dist/index.html is missing: run `npm run build` first.");
  process.exit(2);
}

const read = path => readFileSync(join(dist, path), "utf8");
const walk = dir => readdirSync(join(dist, dir), { withFileTypes: true }).flatMap(entry => {
  const path = dir ? `${dir}/${entry.name}` : entry.name;
  return entry.isDirectory() ? walk(path) : [path];
});
const files = walk("");
const docs = files.filter(path => /\.(md|txt)$/.test(path) && !path.startsWith("licenses/"));
const guides = readdirSync(join(root, "public", "guides")).filter(name => name.endsWith(".md")).sort();

// Guide index: the manual rule in AGENTS.md, enforced.
const llms = read("llms.txt");
const sitemap = read("sitemap.xml");
const html = read("index.html");
for (const name of guides) {
  const url = `${origin}/guides/${name}`;
  if (!llms.includes(`](${url})`)) fail(`llms.txt does not list guides/${name}`);
  if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap.xml does not list guides/${name}`);
  if (!html.includes(`<a href="/guides/${name}">`)) fail(`the no-JavaScript fallback in index.html does not link guides/${name}`);
  if (!html.includes(`"url": "${url}"`)) fail(`the JSON-LD graph in index.html has no entry with url ${url}`);
}
for (const match of llms.matchAll(/\]\(https:\/\/hivemagnus\.com\/guides\/([^)#]+)\)/g)) {
  if (!guides.includes(match[1])) fail(`llms.txt links guides/${match[1]}, which does not exist`);
}
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  if (!resolveLocal(new URL(match[1]).pathname)) fail(`sitemap.xml lists ${match[1]}, which is not built`);
}

// JSON-LD and its CSP hash.
const jsonLd = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
if (!jsonLd) fail("index.html has no JSON-LD block");
else {
  try {
    JSON.parse(jsonLd[1]);
  } catch (error) {
    fail(`the JSON-LD block does not parse: ${error.message}`);
  }
  const hash = `'sha256-${createHash("sha256").update(jsonLd[1]).digest("base64")}'`;
  if (!read("_headers").includes(hash)) fail(`public/_headers does not allow the JSON-LD block: expected ${hash} in script-src`);
}

// Internal links and anchors.
const anchorCache = new Map();
function resolveLocal(pathname) {
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, "");
  for (const candidate of [decoded, join(decoded, "index.html")]) {
    const full = join(dist, candidate);
    if (candidate !== "" && existsSync(full) && statSync(full).isFile()) return candidate;
  }
  return decoded === "" ? "index.html" : null;
}
function checkInternal(source, line, href) {
  const url = new URL(href, `${origin}/`);
  const target = resolveLocal(url.pathname);
  if (!target) return fail(`${source}:${line}: ${href} does not resolve to a built file`);
  const fragment = decodeURIComponent(url.hash.slice(1));
  if (!fragment || !target.endsWith(".md")) return;
  if (!anchorCache.has(target)) anchorCache.set(target, headingAnchors(read(target)));
  if (!anchorCache.get(target).has(fragment)) fail(`${source}:${line}: ${href} names an anchor that ${target} does not have`);
}
const isInternal = href => href.startsWith(`${origin}/`) || href === origin || (href.startsWith("/") && !href.startsWith("//"));
for (const path of docs) {
  for (const { url, line } of markdownLinks(read(path))) if (isInternal(url)) checkInternal(path, line, url);
}
for (const path of files.filter(path => path.endsWith(".html"))) {
  const text = read(path);
  for (const match of text.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (isInternal(match[1])) checkInternal(path, text.slice(0, match.index).split("\n").length, match[1]);
  }
}

// Generated output.
for (const path of docs) if (/\{\{hm\./.test(read(path))) fail(`${path} still contains a {{hm.*}} version token`);
for (const path of ["compatibility.md", "llms-full.txt"]) if (!files.includes(path)) fail(`${path} was not generated`);
if (files.includes("llms-full.txt")) {
  const full = read("llms-full.txt");
  for (const path of ["index.md", ...guides.map(name => `guides/${name}`)]) {
    if (!full.includes(`Source: ${origin}/${path}\n`)) fail(`llms-full.txt does not include ${path}`);
  }
}
if (!llms.includes(`](${origin}/compatibility.md)`) || !llms.includes(`](${origin}/llms-full.txt)`)) fail("llms.txt does not link compatibility.md and llms-full.txt");
const shallow = spawnSync("git", ["-C", root, "rev-parse", "--is-shallow-repository"], { encoding: "utf8" }).stdout.trim() !== "false";
if (!shallow) {
  for (const match of sitemap.matchAll(/<url>(.*?)<\/url>/g)) if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(match[1])) fail(`sitemap.xml entry has no <lastmod>: ${match[1]}`);
}

// Shell syntax of documented commands.
let shellBlocks = 0;
for (const path of docs.filter(path => path.endsWith(".md"))) {
  for (const block of codeBlocks(read(path))) {
    if (!["bash", "sh", "shell"].includes(block.lang)) continue;
    shellBlocks++;
    const result = spawnSync("bash", ["-n"], { input: block.code, encoding: "utf8" });
    if (result.status !== 0) fail(`${path}:${block.line}: bash -n failed: ${result.stderr.trim()}`);
  }
}

if (failures.length) {
  console.error(`Site check failed (${failures.length}):\n${failures.map(message => `- ${message}`).join("\n")}`);
  process.exit(1);
}
console.log(`Site check passed: ${guides.length} guides indexed, ${docs.length} Markdown and text files, ${shellBlocks} shell blocks, ${relative(root, dist)}/ links and anchors resolve.`);
