// Small Markdown helpers shared by the site checks. They follow GitHub's rendering closely enough
// for link targets and heading anchors; they are not a Markdown parser.

/** Blank out fenced code blocks, keeping line breaks so line numbers stay valid. */
export function withoutFences(markdown) {
  let fence = null;
  return markdown
    .split("\n")
    .map(line => {
      const open = line.match(/^\s*(```+|~~~+)/);
      if (fence) {
        if (open && open[1][0] === fence[0] && open[1].length >= fence.length) fence = null;
        return "";
      }
      if (open) {
        fence = open[1];
        return "";
      }
      return line;
    })
    .join("\n");
}

/** Blank out fenced code blocks and remove inline code spans. */
export function stripCode(markdown) {
  return withoutFences(markdown).replace(/(`+)[^`]*?\1/g, "");
}

/** Fenced code blocks with their info string and starting line (1-based). */
export function codeBlocks(markdown) {
  const blocks = [];
  let current = null;
  markdown.split("\n").forEach((line, index) => {
    const open = line.match(/^\s*(```+|~~~+)\s*([\w-]*)/);
    if (current) {
      if (open && open[1][0] === current.fence[0] && open[1].length >= current.fence.length && !open[2]) {
        blocks.push(current);
        current = null;
      } else current.lines.push(line);
    } else if (open) current = { fence: open[1], lang: open[2] ?? "", line: index + 1, lines: [] };
  });
  return blocks.map(({ lang, line, lines }) => ({ lang, line, code: lines.join("\n") }));
}

/** Link targets outside code: inline links, images and autolinks. */
export function markdownLinks(markdown) {
  const text = stripCode(markdown);
  const links = [];
  text.split("\n").forEach((line, index) => {
    for (const match of line.matchAll(/!?\[(?:[^\]\\]|\\.)*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) links.push({ url: match[1], line: index + 1 });
    for (const match of line.matchAll(/<(https?:\/\/[^>\s]+)>/g)) links.push({ url: match[1], line: index + 1 });
  });
  return links;
}

/** GitHub-style heading anchors for a Markdown document, duplicates numbered like GitHub does. */
export function headingAnchors(markdown) {
  const anchors = new Set();
  const seen = new Map();
  for (const line of withoutFences(markdown).split("\n")) {
    for (const match of line.matchAll(/<a\s+(?:name|id)="([^"]+)"/g)) anchors.add(match[1]);
    const heading = line.match(/^ {0,3}#{1,6}\s+(.*?)\s*#*\s*$/);
    if (!heading) continue;
    const base = slug(heading[1]);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    anchors.add(count ? `${base}-${count}` : base);
  }
  return anchors;
}

export function slug(heading) {
  return heading
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
    .replace(/ /g, "-");
}
