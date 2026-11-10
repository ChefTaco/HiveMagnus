// With the local preview open in Playwright CLI:
// playwright-cli run-code --filename scripts/check-browser.js
async function checkBrowser(page) {
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const hasEcosystemLinks = hrefs => { const destinations = new Set(hrefs); return destinations.has("https://github.com/ChefTaco") && destinations.has("https://www.npmjs.com/~hivemagnus"); };
  const errors = [], consoleErrors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript({ path: "node_modules/axe-core/axe.min.js" });
  await page.goto(new URL("/", page.url()).href);
  await page.locator(".atlas-node").first().waitFor();
  const names = ["Hive", "HiveXUI", "Oathweave", "Emberpath", "HiveMem", "HiveSkills", "Magnus", "Ardent", "Cindertrace", "ChatterMost", "Emberfold"];
  const walkthroughs = page.locator(".demo-tabs");
  const sectionOrder = await page.locator("main > section").evaluateAll(sections => sections.map(section => section.id));
  assert(JSON.stringify(sectionOrder) === JSON.stringify(["top", "install", "atlas", "projects", "walkthroughs", "agents"]), "Overview, install, architecture, products, then guides");
  assert(await page.locator("h1").textContent().then(t => t.includes("Full-stack") && t.includes("agent management")), "Full-stack overview");
  assert(await page.locator(".platforms").textContent().then(t => /Linux/.test(t) && /macOS.*coming/.test(t) && /Windows.*coming/.test(t)), "Platform availability");
  const command = await page.locator(".install-command code").textContent();
  assert(command === "git clone https://github.com/ChefTaco/hive.git && cd hive && ./hive.sh --release latest", "One-line latest suite installer");
  assert(await page.locator(".quick-start").textContent().then(t => t.includes("Replace latest with an exact version")), "Explicit release selection is explained");
  assert(await page.locator(".quick-start").textContent().then(t => t.includes("full") && t.includes("Docker Engine") && t.includes("TLS certificate")), "Profile and prerequisites are explained");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy Hive install command" }).click();
  assert(await page.evaluate(() => navigator.clipboard.readText()) === command, "Quick-start clipboard");
  for (const name of names) {
    const button = page.locator(`.atlas-node[data-project="${name.toLowerCase()}"]`);
    await button.click();
    assert(await button.getAttribute("aria-pressed") === "true", `${name} architecture selection`);
    assert(await page.locator("#atlas-detail h3").textContent() === name, `${name} architecture details`);
    const explore = page.locator("#atlas-detail a");
    await explore.click();
    assert(new URL(page.url()).hash === `#interface-${name.toLowerCase()}`, `${name} architecture link`);
  }
  const dialog = page.getByRole("dialog", { name: /Get your host ready/ });
  const setupButton = page.locator(".tailscale-recommendation [data-open-tailscale]");
  assert(await page.locator('.tailscale-recommendation a').getAttribute("href") === "https://tailscale.com/download", "Tailscale recommendation links to download");
  await setupButton.click();
  assert(await dialog.isVisible(), "Setup modal opens");
  assert(await dialog.locator("li").count() === 4, "Four setup steps");
  assert(await dialog.textContent().then(t => t.includes("MagicDNS") && t.includes("HTTPS Certificates") && t.includes("does not install or sign") && t.includes("schedule")), "Accurate Tailscale preparation and renewal");
  assert(await dialog.getByRole("link", { name: /Tailscale’s HTTPS guide/ }).getAttribute("href") === "https://tailscale.com/docs/how-to/set-up-https-certificates", "Official HTTPS instructions");
  for (const label of ["Copy Tailscale certificate command", "Copy certificate renewal command"]) {
    const button = dialog.getByRole("button", { name: label });
    const expected = await button.getAttribute("data-copy-text");
    await button.click();
    assert(await page.evaluate(() => navigator.clipboard.readText()) === expected, `${label} clipboard`);
  }
  await dialog.locator("[data-close-tailscale]").last().focus();
  await page.keyboard.press("Tab");
  assert(await dialog.locator("[data-close-tailscale]").first().evaluate(el => el === document.activeElement), "Modal traps forward focus");
  await page.keyboard.press("Shift+Tab");
  assert(await dialog.locator("[data-close-tailscale]").last().evaluate(el => el === document.activeElement), "Modal traps backward focus");
  await page.keyboard.press("Escape");
  assert(!await dialog.isVisible(), "Escape closes modal");
  assert(await setupButton.evaluate(el => el === document.activeElement), "Modal restores focus");
  await page.locator(".demo-sidebar [data-open-tailscale]").click();
  assert(await dialog.isVisible(), "Walkthrough also opens modal");
  await dialog.getByRole("button", { name: "Close Tailscale setup guide" }).click();
  await setupButton.click();
  await page.mouse.click(2, 2);
  assert(!await dialog.isVisible(), "Backdrop closes modal");
  for (const name of names) {
    const panel = page.locator(`#interface-${name.toLowerCase()}`);
    assert(await panel.isVisible(), `${name} has its own visible section`);
    await page.locator(".product-jump-links").getByRole("link", { name, exact: true }).click();
    assert(new URL(page.url()).hash === `#interface-${name.toLowerCase()}`, `${name} product jump`);
    if (name === "Emberfold") {
      assert(await panel.locator("pre").textContent().then(t => t.includes('"fits": true')), "Actual Emberfold CLI excerpt");
    } else {
      const image = panel.locator("img");
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
      assert(await image.evaluate(img => img.naturalWidth === 2880 && img.naturalHeight === 1800), `${name} capture decoded`);
      assert(await panel.locator(".capture-link").getAttribute("href") === await image.getAttribute("src"), `${name} opens full capture`);
    }
  }
  for (const [id, captures] of Object.entries({ magnus: ["fleet-overview", "fleet-map", "fleet-mission"], cindertrace: ["cindertrace-overview", "cindertrace-case"] })) {
    const panel = page.locator(`#interface-${id}`);
    for (const [i, file] of captures.entries()) {
      const button = panel.locator(`[data-capture="${i}"]`);
      await button.click();
      assert(await button.getAttribute("aria-pressed") === "true", `${id} capture selection`);
      const image = panel.locator("img");
      await image.evaluate(img => img.decode());
      assert(await image.getAttribute("src") === `/captures/${file}.webp`, `${id} capture image`);
      assert(await panel.locator(".capture-full-link").getAttribute("href") === `/captures/${file}.webp`, `${id} full capture link`);
    }
    await panel.locator('[data-capture="0"]').click();
  }
  assert(await page.locator("#interface-ardent").textContent().then(t => t.includes("Ardent is headless") && t.includes("does not include")), "Ardent runtime scope is accurate");
  const security = page.locator("#interface-cindertrace");
  await security.locator("summary").click();
  assert(await security.getByRole("link", { name: /Try the disposable investigation lab/ }).isVisible(), "Cindertrace lab details retained");
  assert(await security.textContent().then(t => t.includes("not reached through HiveXUI")), "Lab remains separate");
  await page.goto(new URL("/#security", page.url()).href);
  assert(await security.isVisible(), "Legacy security deep link");
  await page.goto(new URL("/#interface-hivemem", page.url()).href);
  await page.locator("#interface-hivemem").waitFor();
  assert(await page.locator("#interface-hivemem").evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= -5 && r.top < innerHeight; }), "Direct product URL scrolls to its section");
  let steps = 0;
  for (const name of ["Hive", "Magnus", "Cindertrace", "ChatterMost", "Ardent + Emberfold"]) {
    await walkthroughs.getByRole("tab", { name, exact: true }).click();
    const firstCommand = await page.locator("#demo-panel pre code").textContent();
    await page.getByRole("button", { name: /^Copy command for/ }).click();
    assert(await page.evaluate(() => navigator.clipboard.readText()) === firstCommand, `${name} walkthrough clipboard`);
    assert(await page.getByRole("button", { name: "← Previous" }).isDisabled(), `${name} initial boundary`);
    const count = await page.locator(".step-progress i").count();
    steps += count;
    for (let step = 2; step <= count; step++) {
      await page.getByRole("button", { name: "Next step →" }).click();
      assert(await page.locator(".step-head").textContent().then(t => t.includes(`STEP 0${step}`)), `${name} step ${step}`);
      assert(await page.locator("#demo-panel").evaluate(el => el === document.activeElement), `${name} step focus`);
    }
    assert(await page.getByRole("button", { name: "Next step →" }).isDisabled(), `${name} final boundary`);
    await page.getByRole("button", { name: "← Previous" }).click();
    assert(await page.locator(".step-head").textContent().then(t => t.includes(`STEP 0${count - 1}`)), `${name} previous step`);
  }
  await walkthroughs.getByRole("tab").first().focus();
  await page.keyboard.press("End");
  assert(await walkthroughs.getByRole("tab", { selected: true }).textContent().then(t => t.includes("Ardent")), "Walkthrough End key");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  assert(await walkthroughs.getByRole("tab", { selected: true }).textContent().then(t => t.includes("Magnus")), "Walkthrough arrow key");
  const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash));
  assert(!brokenAnchors.length, `Missing anchors: ${brokenAnchors}`);
  assert(await page.locator(".agent-guides a").count() === 10, "Ten Markdown guides, including shared Ardent guide");
  for (const link of await page.locator(".agent-guides a").all()) {
    const response = await page.request.get(new URL(await link.getAttribute("href"), page.url()).href);
    assert(response.ok() && (await response.text()).includes("## Source review"), "Guide response and provenance");
  }
  for (const path of ["/llms.txt", "/index.md"]) {
    const response = await page.request.get(new URL(path, page.url()).href);
    assert(response.ok() && (await response.text()).startsWith("# Hive:Magnus"), `${path} documentation`);
  }
  const metadata = JSON.parse(await page.locator("#project-metadata").textContent());
  assert(metadata["@graph"].filter(item => item["@type"] === "SoftwareSourceCode").length === 11, "Eleven source metadata entries");
  assert(await page.locator('link[rel="describedby"][href="/llms.txt"]').count(), "Agent discovery metadata");
  assert(await page.locator('.ecosystem-links a').evaluateAll(links => links.map(link => link.href)).then(hasEcosystemLinks), "GitHub and npm footer links");
  const deceptiveFooterLinks = await page.locator('.ecosystem-links a').evaluateAll(links => links.map(link => { const url = new URL(link.href); return `https://example.com/?redirect=${encodeURIComponent(url.href)}`; }));
  assert(!hasEcosystemLinks(deceptiveFooterLinks), "Footer destinations require exact URL membership");
  await walkthroughs.getByRole("tab", { name: "ChatterMost", exact: true }).click();
  let accessibilityAudits = 0;
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    await page.mouse.move(0, 0);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}px`);
    const overlaps = await page.locator('.atlas-node').evaluateAll(nodes => nodes.flatMap((a, i) => nodes.slice(i + 1).filter(b => {
      const x = a.getBoundingClientRect(), y = b.getBoundingClientRect();
      return x.left < y.right && x.right > y.left && x.top < y.bottom && x.bottom > y.top;
    }).map(b => `${a.textContent.trim()} / ${b.textContent.trim()}`)));
    assert(!overlaps.length, `Architecture overlaps at ${width}px: ${overlaps}`);
    for (const modalOpen of [false, true]) {
      if (modalOpen) await setupButton.click();
      if (modalOpen) assert(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth && el.getBoundingClientRect().right <= innerWidth), `Modal fits at ${width}px`);
      const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
      accessibilityAudits++;
      assert(!violations.length, `Accessibility at ${width}px, modal ${modalOpen}: ${JSON.stringify(violations)}`);
      if (modalOpen) await page.keyboard.press("Escape");
    }
    const tinyText = await page.evaluate(() => [...document.querySelectorAll("body *")].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize) < 11).map(el => el.className || el.tagName));
    assert(!tinyText.length, `Text below 11px at ${width}px: ${tinyText}`);
  }
  assert(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === "auto", "Reduced motion");
  assert(!errors.length, `Page errors: ${errors}`);
  assert(!consoleErrors.length, `Console errors: ${consoleErrors}`);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await walkthroughs.getByRole("tab", { name: "Hive", exact: true }).click();
  await page.locator('.atlas-node[data-project="hive"]').click();
  await page.goto(new URL("/", page.url()).href);
  return { productSections: names.length, atlasSelections: names.length, walkthroughs: 5, steps, clipboardChecks: 8, tailscaleModal: true, accessibilityAudits, accessibilityViolations: 0, agentGuides: 10, sourceCodeEntries: 11, viewportWidths: [1440, 1024, 768, 390, 320], pageErrors: errors.length, consoleErrors: consoleErrors.length };
}
