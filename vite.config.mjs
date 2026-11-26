import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { defineConfig } from "vite";
import { compatibilityMarkdown, llmsFull } from "./scripts/lib/generate.mjs";
import { ensureHistory, hasTokens, homepageVersions, lastCommitDate, loadVersions, origin, renderTokens, root, versionsFile } from "./scripts/lib/site-data.mjs";

const virtualId = "virtual:hm-versions";
const generated = {
  "compatibility.md": data => compatibilityMarkdown(data),
};
const isDoc = path => /\.(md|txt)$/.test(path) && !path.startsWith("licenses/");
const contentType = path => (path.endsWith(".md") ? "text/markdown; charset=utf-8" : "text/plain; charset=utf-8");

/** Guide paths in the order llms.txt lists them, then any it does not list. */
function guideOrder(llms, available) {
  const listed = [...llms.matchAll(/\]\(https:\/\/hivemagnus\.com\/(guides\/[^)#]+\.md)\)/g)].map(match => match[1]);
  return [...new Set([...listed.filter(path => available.includes(path)), ...available])];
}

function render(path, text, data) {
  const out = renderTokens(text, data, path);
  if (/\{\{hm\./.test(out)) throw new Error(`${path}: unrendered version token`);
  return out;
}

function fullText(docs) {
  const order = ["index.md", ...guideOrder(docs.get("llms.txt") ?? "", [...docs.keys()].filter(path => path.startsWith("guides/")).sort())];
  return llmsFull(order.filter(path => docs.has(path)).map(path => ({ url: `${origin}/${path}`, text: docs.get(path) })));
}

/** Source files whose last commit dates a sitemap URL. */
function sources(pathname, publicDir) {
  if (pathname === "/") return ["index.html", "src"];
  const path = pathname.slice(1);
  if (path in generated) return [versionsFile, "scripts/lib/generate.mjs"];
  const file = join(publicDir, path);
  if (!existsSync(file)) return [];
  const own = relative(root, file);
  return hasTokens(readFileSync(file, "utf8")) ? [own, versionsFile] : [own];
}

function siteData() {
  let config;
  return {
    name: "hivemagnus-site-data",
    configResolved(resolved) {
      config = resolved;
    },
    resolveId(id) {
      return id === virtualId ? `\0${virtualId}` : null;
    },
    load(id) {
      if (id !== `\0${virtualId}`) return null;
      this.addWatchFile(join(root, versionsFile));
      return `export default ${JSON.stringify(homepageVersions(loadVersions()))};`;
    },
    configureServer(server) {
      // Serve the docs as the build writes them: tokens filled and generated files present.
      server.middlewares.use((req, res, next) => {
        const path = decodeURIComponent((req.url ?? "").split("?")[0]).replace(/^\/+/, "");
        const file = join(config.publicDir, path);
        const isGenerated = path in generated || path === "llms-full.txt";
        if (!isGenerated && !(isDoc(path) && existsSync(file))) return next();
        try {
          const data = loadVersions();
          let body;
          if (path in generated) body = generated[path](data);
          else if (path === "llms-full.txt") {
            const docs = new Map();
            for (const doc of ["index.md", "llms.txt", ...readdirSync(join(config.publicDir, "guides")).map(name => `guides/${name}`)]) docs.set(doc, render(doc, readFileSync(join(config.publicDir, doc), "utf8"), data));
            body = fullText(docs);
          } else body = render(path, readFileSync(file, "utf8"), data);
          res.setHeader("Content-Type", contentType(path));
          res.end(body);
        } catch (error) {
          next(error);
        }
      });
    },
    writeBundle() {
      const outDir = config.build.outDir;
      const data = loadVersions();
      const walk = dir => readdirSync(join(outDir, dir), { withFileTypes: true }).flatMap(entry => {
        const path = dir ? `${dir}/${entry.name}` : entry.name;
        return entry.isDirectory() ? walk(path) : [path];
      });
      const docs = new Map();
      for (const path of walk("").filter(isDoc)) {
        const text = render(path, readFileSync(join(outDir, path), "utf8"), data);
        writeFileSync(join(outDir, path), text);
        docs.set(path, text);
      }
      for (const [path, make] of Object.entries(generated)) writeFileSync(join(outDir, path), make(data));
      writeFileSync(join(outDir, "llms-full.txt"), fullText(docs));

      const sitemapPath = join(outDir, "sitemap.xml");
      ensureHistory(message => config.logger.info(message));
      let undated = 0;
      const sitemap = readFileSync(sitemapPath, "utf8").replace(/<url><loc>([^<]+)<\/loc><\/url>/g, (entry, loc) => {
        const date = lastCommitDate(sources(new URL(loc).pathname, config.publicDir));
        if (!date) {
          undated++;
          return entry;
        }
        return `<url><loc>${loc}</loc><lastmod>${date}</lastmod></url>`;
      });
      writeFileSync(sitemapPath, sitemap);
      if (undated) config.logger.warn(`sitemap.xml: ${undated} URLs have no <lastmod> (shallow clone or no Git history).`);
    },
  };
}

export default defineConfig({
  plugins: [siteData()],
});
