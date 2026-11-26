// Unit tests for the site's build and check helpers: `npm test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { compatibilityMarkdown, crossedRules, llmsFull } from "./lib/generate.mjs";
import { codeBlocks, headingAnchors, markdownLinks, slug } from "./lib/markdown.mjs";
import { homepageVersions, loadVersions, renderTokens, sinceRelease } from "./lib/site-data.mjs";

const release = (version, published, components, extra = {}) => ({
  version, tag: `v${version}`, commit: "c".repeat(40), published, upgrading: null, manifestSHA256: "m".repeat(64), controllerSHA256: "k".repeat(64), ardent: null,
  components: Object.fromEntries(Object.entries(components).map(([name, v]) => [name, { kind: "application", version: v, digest: `sha256:${name}` }])),
  ...extra,
});
const fixture = () => {
  const releases = [
    release("3.2.0", "2026-01-03", { hivexui: "0.3.0", magnus: "2.0.0" }, { ardent: "1.1.0", magnusAgent: { name: "@hivemagnus/magnus-agent", version: "2.0.0", integrity: "sha512-x" } }),
    release("3.1.1", null, { hivexui: "0.2.0", magnus: "1.9.0" }),
    release("3.1.0", "2026-01-02", { hivexui: "0.2.0", magnus: "1.9.0" }),
    release("3.0.0", "2026-01-01", { hivexui: "0.2.0", magnus: "1.8.0" }),
  ];
  return { current: "3.2.0", currentRelease: releases[0], releases, notes: { "3.1.1": "never published" }, upgradeRules: [{ before: "3.1.0", appliesTo: "every installation", reason: "a format change", anchor: "suite-310" }], pathRules: [] };
};

test("tokens render the reviewed release and its pins", () => {
  const data = fixture();
  assert.equal(renderTokens("Hive {{hm.suite}} pins HiveXUI {{hm.version:hivexui}} (since {{hm.since:hivexui}}) and Ardent {{hm.version:ardent}}; agent {{hm.version:magnus-agent}}.", data),
    "Hive 3.2.0 pins HiveXUI 0.3.0 (since 3.2.0) and Ardent 1.1.0; agent 2.0.0.");
  assert.equal(renderTokens("Go templates stay: {{.State.Status}}", data), "Go templates stay: {{.State.Status}}");
});

test("unknown tokens and unpinned components fail", () => {
  const data = fixture();
  assert.throws(() => renderTokens("{{hm.version:nope}}", data, "guide.md"), /guide\.md: .*does not pin/);
  assert.throws(() => renderTokens("{{hm.sweet}}", data), /unknown token/);
  assert.throws(() => renderTokens("{{hm.version}}", data), /unknown token/);
});

test("since walks back over published releases only", () => {
  const data = fixture();
  data.currentRelease = data.releases[2];
  data.current = "3.1.0";
  // 3.1.1 is unpublished and newer than the current release, so it is ignored.
  assert.equal(sinceRelease(data, "hivexui"), "3.0.0");
  assert.equal(sinceRelease(data, "magnus"), "3.1.0");
});

test("the homepage gets only current pins", () => {
  const values = homepageVersions(fixture());
  assert.deepEqual(values, { suite: "3.2.0", versions: { hivexui: "0.3.0", magnus: "2.0.0", ardent: "1.1.0", "magnus-agent": "2.0.0" } });
});

test("upgrade rules apply when the upgrade crosses their boundary", () => {
  const data = fixture();
  assert.equal(crossedRules(data, "3.0.0", "3.1.0").length, 1);
  assert.equal(crossedRules(data, "3.0.0", "3.2.0").length, 1);
  assert.equal(crossedRules(data, "3.1.0", "3.2.0").length, 0);
});

test("the compatibility page lists published releases and flags unpublished tags", () => {
  const page = compatibilityMarkdown(fixture());
  assert.match(page, /^# Hive:Magnus compatibility matrix/);
  assert.match(page, /## Current release: 3\.2\.0/);
  assert.match(page, /\| HiveXUI \| 0\.3\.0 \| 3\.2\.0 \| `sha256:hivexui` \|/);
  assert.match(page, /\| 3\.1\.0 \| 2026-01-02 \|.*\| from 3\.0\.0: flag for every installation \|/);
  assert.match(page, /\| 3\.2\.0 \| 2026-01-03 \|.*\| from 3\.1\.0: no flag \|/);
  assert.match(page, /no installation should use: 3\.1\.1 \(never published\)/);
  assert.doesNotMatch(page, /### 3\.1\.1/);
  // A pin reaching the oldest recorded release may be older still.
  assert.match(page, /\| Magnus server \| 2\.0\.0 \| 3\.2\.0 \|/);
});

test("llms-full.txt introduces each document with its URL", () => {
  const text = llmsFull([{ url: "https://hivemagnus.com/index.md", text: "# One\n" }, { url: "https://hivemagnus.com/guides/a.md", text: "# Two\n\n" }]);
  assert.match(text, /^# Hive:Magnus documentation, complete\n/);
  assert.match(text, /Source: https:\/\/hivemagnus\.com\/index\.md\n\n# One\n\n---\n\nSource: https:\/\/hivemagnus\.com\/guides\/a\.md\n\n# Two\n$/);
});

test("the repository data file is consistent", () => {
  const data = loadVersions();
  assert.ok(data.currentRelease.published, "the reviewed release is published");
  assert.equal(data.releases.filter(r => r.version === data.current).length, 1);
  for (const rule of data.upgradeRules) assert.ok(rule.before && rule.appliesTo && rule.reason && rule.anchor, JSON.stringify(rule));
  for (const version of Object.keys(data.notes)) assert.ok(data.releases.some(r => r.version === version && !r.published), `note for unpublished ${version}`);
});

test("GitHub-style heading anchors", () => {
  assert.equal(slug("Suite 3.14.0: Ardent `execution` <code>recovery</code> & [lineage](x)"), "suite-3140-ardent-execution-recovery--lineage");
  assert.deepEqual([...headingAnchors("# Install\n## Install\n```\n# not a heading\n```\n### Use `hive.sh`\n<a id=\"custom\"></a>")], ["install", "install-1", "use-hivesh", "custom"]);
});

test("links outside code and fenced blocks", () => {
  const markdown = "See [a](https://a.example/x) and <https://b.example/>.\n`[no](https://c.example)`\n```bash\ncurl https://d.example\n```\n![img](/i.png \"t\")";
  assert.deepEqual(markdownLinks(markdown).map(link => link.url), ["https://a.example/x", "https://b.example/", "/i.png"]);
  assert.deepEqual(codeBlocks(markdown).map(block => [block.lang, block.code]), [["bash", "curl https://d.example"]]);
});
