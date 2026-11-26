// Generated documents: compatibility.md (from data/versions.json) and llms-full.txt (every current
// Markdown doc in one file). Both are written into dist/ by the build and served by the dev server.
import { compareVersions, origin, pinnedVersion, sinceRelease } from "./site-data.mjs";

const hiveRepo = "https://github.com/ChefTaco/hive";
const columns = [
  ["oathweave", "Oathweave"],
  ["emberpath", "Emberpath"],
  ["hivemem", "HiveMem"],
  ["hiveskills", "HiveSkills"],
  ["hivexui", "HiveXUI"],
  ["magnus", "Magnus"],
  ["ardent", "Ardent (staged)"],
  ["embermend", "Embermend"],
  ["cindertrace", "Cindertrace"],
  ["chattermost", "ChatterMost"],
  ["emberfold", "Emberfold"],
  ["ardentstudio", "Studio"],
  ["hive-registry", "Registry"],
  ["ingress", "Ingress"],
];
const names = {
  "hive-registry": "Hive Registry", ingress: "Hive Ingress", oathweave: "Oathweave", "oathweave-redis": "Oathweave Redis",
  emberpath: "Emberpath", hivemem: "HiveMem", "hivemem-qdrant": "HiveMem Qdrant", hiveskills: "HiveSkills", hivexui: "HiveXUI",
  magnus: "Magnus server", "magnus-gateway": "Magnus fleet gateway", "magnus-postgres": "Magnus PostgreSQL", "magnus-redis": "Magnus Redis",
  embermend: "Embermend", "embermend-worker": "Embermend worker", "embermend-postgres": "Embermend PostgreSQL",
  cindertrace: "Cindertrace", "cindertrace-collector": "Cindertrace collector", "cindertrace-postgres": "Cindertrace PostgreSQL", "cindertrace-redis": "Cindertrace Redis",
  chattermost: "ChatterMost", "chattermost-postgres": "ChatterMost PostgreSQL", emberfold: "Emberfold HTTP service", ardentstudio: "Ardent Project Studio",
};
const label = key => names[key] ?? key;
const upgradingLink = (data, release) => release.upgrading ? `${hiveRepo}/blob/v${data.current}/UPGRADING.md#${release.upgrading}` : null;

/** Rules whose boundary lies in (from, to]: an upgrade from `from` to `to` crosses them. */
export function crossedRules(data, from, to) {
  return data.upgradeRules.filter(rule => compareVersions(from, rule.before) < 0 && compareVersions(rule.before, to) <= 0);
}

export function compatibilityMarkdown(data) {
  const current = data.currentRelease;
  const releases = [...data.releases].sort((a, b) => compareVersions(b.version, a.version));
  const published = releases.filter(release => release.published);
  const oldest = published.at(-1).version;
  // The data starts at the oldest recorded release, so a pin that reaches it may be older still.
  const since = key => {
    const version = sinceRelease(data, key);
    return version === oldest ? `${version} or earlier` : version;
  };
  const lines = [];
  lines.push("# Hive:Magnus compatibility matrix", "");
  lines.push("> Which product versions and image digests each signed Hive suite release pins, and what an upgrade between releases needs.", "");
  lines.push(`[Agent index](${origin}/llms.txt) · [Hive guide](${origin}/guides/hive.md) · [Hive releases](${hiveRepo}/releases) · [UPGRADING](${hiveRepo}/blob/v${data.current}/UPGRADING.md)`, "");
  lines.push(`This page is generated from the signed release manifests (\`releases/X.Y.Z.json\` at each Hive tag), whose Ed25519 signatures were verified against the publisher key at the same tag. Every product in a release is pinned by a multi-architecture image digest (linux/amd64 and linux/arm64); the Magnus host agent is pinned by npm integrity, and the Ardent version is the one that agent's \`npm-shrinkwrap.json\` stages. Install a release only through \`hive.sh\`, which verifies the manifest itself. The site's guides are reviewed against Hive ${data.current}.`, "");

  lines.push(`## Current release: ${data.current}`, "");
  lines.push(`[Hive ${data.current}](${hiveRepo}/releases/tag/v${data.current}), published ${current.published}, tag commit \`${current.commit}\`, manifest SHA-256 \`${current.manifestSHA256}\`, controller \`${current.controllerSHA256}\`.`, "");
  lines.push("| Component | Version | Pinned since | Image digest |", "| --- | --- | --- | --- |");
  for (const [key, component] of Object.entries(current.components).sort(([a], [b]) => label(a).localeCompare(label(b)))) {
    lines.push(`| ${label(key)} | ${component.version} | ${since(key)} | \`${component.digest}\` |`);
  }
  if (current.magnusAgent) lines.push(`| Magnus host agent \`${current.magnusAgent.name}\` | ${current.magnusAgent.version} | ${since("magnus-agent")} | npm \`${current.magnusAgent.integrity}\` |`);
  if (current.ardent) lines.push(`| Ardent, staged by the host agent | ${current.ardent} | ${since("ardent")} | in the agent's lock |`);
  lines.push("");
  const initDigests = Object.entries(current.components).filter(([, component]) => component.initializationDigest);
  if (initDigests.length) lines.push(`Initialization images that differ from the service image: ${initDigests.map(([key, component]) => `${label(key)} \`${component.initializationDigest}\``).join("; ")}.`, "");

  lines.push("## Upgrade paths", "");
  lines.push(`Upgrade with the target release's controller: \`./hive.sh upgrade --config installation.json --release X.Y.Z\`. Moving across one of these boundaries also needs \`--allow-migrations\`; without it the upgrade stops before any service is stopped. The [Hive guide](${origin}/guides/hive.md#upgrade) and [UPGRADING](${hiveRepo}/blob/v${data.current}/UPGRADING.md) are the full instructions.`, "");
  lines.push("| From a release before | Needs `--allow-migrations` for | Why |", "| --- | --- | --- |");
  for (const rule of data.upgradeRules) lines.push(`| ${rule.before} | ${rule.appliesTo} | [${rule.reason}](${hiveRepo}/blob/v${data.current}/UPGRADING.md#${rule.anchor}) |`);
  lines.push("");
  for (const rule of data.pathRules ?? []) lines.push(`- ${rule.text} See [UPGRADING](${hiveRepo}/blob/v${data.current}/UPGRADING.md#${rule.anchor}).`);
  if (data.pathRules?.length) lines.push("");
  const unpublished = releases.filter(release => !release.published);
  if (unpublished.length) lines.push(`Tags without a published release, which no installation should use: ${unpublished.map(release => `${release.version}${data.notes[release.version] ? ` (${data.notes[release.version]})` : ""}`).join("; ")}.`, "");

  lines.push("## Product versions by release", "");
  lines.push("Each row is a published release; a dash means the release does not include that product. The last column lists the `--allow-migrations` boundaries an upgrade from the previous published release crosses.", "");
  lines.push(`| Release | Published | ${columns.map(([, title]) => title).join(" | ")} | Upgrade from previous |`, `| --- | --- | ${columns.map(() => "---").join(" | ")} | --- |`);
  published.forEach((release, index) => {
    const previous = published[index + 1];
    const rules = previous ? crossedRules(data, previous.version, release.version) : [];
    const link = upgradingLink(data, release);
    const upgrade = !previous ? "—" : rules.length ? `from ${previous.version}: flag for ${rules.map(rule => rule.appliesTo).join("; ")}` : `from ${previous.version}: no flag`;
    lines.push(`| ${link ? `[${release.version}](${link})` : release.version} | ${release.published} | ${columns.map(([key]) => pinnedVersion(release, key) ?? "—").join(" | ")} | ${upgrade} |`);
  });
  lines.push("");

  lines.push("## Digests by release", "");
  lines.push("Every component each published release pins, with its image digest. Datastores are the private PostgreSQL, Redis and Qdrant stores of the products.", "");
  for (const release of published) {
    const link = upgradingLink(data, release);
    lines.push(`### ${release.version}`, "");
    lines.push(`Published ${release.published}; tag commit \`${release.commit}\`; manifest SHA-256 \`${release.manifestSHA256}\`; controller \`${release.controllerSHA256}\`.${link ? ` [Upgrade notes](${link}).` : ""}`, "");
    lines.push("| Component | Version | Digest |", "| --- | --- | --- |");
    for (const [key, component] of Object.entries(release.components).sort(([a], [b]) => label(a).localeCompare(label(b)))) lines.push(`| ${label(key)} | ${component.version} | \`${component.digest}\` |`);
    if (release.magnusAgent) lines.push(`| Magnus host agent | ${release.magnusAgent.version} | npm \`${release.magnusAgent.integrity}\` |`);
    if (release.ardent) lines.push(`| Ardent (staged) | ${release.ardent} | in the agent's lock |`);
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

/** All current Markdown docs in one plain-text file, each introduced by its URL. */
export function llmsFull(documents) {
  const parts = [
    "# Hive:Magnus documentation, complete",
    "",
    `> Every current Markdown document of ${origin} in one file: the site overview, then each product guide. The index with one-line descriptions is ${origin}/llms.txt; each document's own URL precedes it. The compatibility matrix (${origin}/compatibility.md) is not included.`,
    "",
  ];
  for (const { url, text } of documents) parts.push("---", "", `Source: ${url}`, "", text.trimEnd(), "");
  return `${parts.join("\n").trimEnd()}\n`;
}
