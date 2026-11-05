// With the site open in Playwright CLI:
// playwright-cli run-code --filename scripts/check-browser.js
async function checkBrowser(page) {
  const assert = (ok, message) => {
    if (!ok) throw new Error(message);
  };
  const errors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.addInitScript({ path: "node_modules/axe-core/axe.min.js" });
  await page.reload();
  await page.locator(".atlas-node").first().waitFor();
  const walkthroughs = page.locator(".demo-tabs");
  const interfaces = page.locator(".interface-tabs");
  const expectedProjects = ["Hive", "HiveXUI", "Oathweave", "Emberpath", "HiveMem", "HiveSkills", "Magnus", "Cindertrace", "ChatterMost", "Emberfold"];
  for (const name of expectedProjects) {
    const node = page.getByRole("button", {
      name: new RegExp(`^\\d{2} ${name} `),
    });
    await node.click();
    assert(
      (await node.getAttribute("aria-pressed")) === "true",
      `${name} atlas selection`,
    );
    assert(
      (await page.locator("#atlas-detail h3").textContent()) === name,
      `${name} atlas description`,
    );
  }
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  for (const name of ["Hive", "Magnus", "Cindertrace", "ChatterMost", "Ardent + Emberfold"]) {
    await walkthroughs
      .getByRole("tab", { name: new RegExp(name.replace("+", "\\+")) })
      .click();
    const firstCommand = await page.locator("#demo-panel pre code").textContent();
    await page.getByRole("button", { name: /^Copy command/ }).click();
    assert(
      (await page.evaluate(() => navigator.clipboard.readText())) ===
        firstCommand,
      `${name} clipboard`,
    );
    assert(
      await page.getByRole("button", { name: "← Previous" }).isDisabled(),
      `${name} initial boundary`,
    );
    for (let step = 2; step <= 3; step++) {
      await page.getByRole("button", { name: "Next step →" }).click();
      assert(
        (await page.locator(".step-head").textContent()).includes(
          `STEP 0${step}`,
        ),
        `${name} step ${step}`,
      );
      assert(
        await page
          .locator("#demo-panel")
          .evaluate((el) => el === document.activeElement),
        `${name} step keyboard focus`,
      );
    }
    assert(
      await page.getByRole("button", { name: "Next step →" }).isDisabled(),
      `${name} final boundary`,
    );
    await page.getByRole("button", { name: "← Previous" }).click();
    assert(
      (await page.locator(".step-head").textContent()).includes("STEP 02"),
      `${name} previous step`,
    );
  }
  await walkthroughs.getByRole("tab").first().focus();
  await page.keyboard.press("End");
  assert(
    await walkthroughs
      .getByRole("tab", { selected: true })
      .textContent()
      .then((v) => v.includes("Ardent")),
    "End tab navigation",
  );
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  assert(
    await walkthroughs
      .getByRole("tab", { selected: true })
      .textContent()
      .then((v) => v.includes("Magnus")),
    "Arrow tab navigation",
  );
  await walkthroughs.getByRole("tab", { name: /01.*Hive/ }).click();
  const brokenAnchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .filter((link) => !document.getElementById(link.hash.slice(1)))
        .map((link) => link.hash),
    );
  assert(!brokenAnchors.length, `Missing anchor targets: ${brokenAnchors}`);
  const guideLinks = page.locator(".agent-guides a");
  assert((await guideLinks.count()) === 10, "Ten agent guides");
  for (const link of await guideLinks.all()) {
    const response = await page.request.get(new URL(await link.getAttribute("href"), page.url()).href);
    assert(response.ok(), "Agent guide response");
    assert((await response.text()).includes("## Source review"), "Agent guide provenance");
  }
  for (const path of ["/llms.txt", "/index.md"]) {
    const response = await page.request.get(new URL(path, page.url()).href);
    assert(response.ok(), `${path} response`);
    assert((await response.text()).startsWith("# Hive:Magnus"), `${path} Markdown`);
  }
  assert(await page.locator('link[rel="describedby"][href="/llms.txt"]').count(), "Agent index discovery");
  assert(await page.locator('link[rel="alternate"][type="text/markdown"][href="/index.md"]').count(), "Markdown discovery");
  const metadata = JSON.parse(await page.locator("#project-metadata").textContent());
  assert(metadata["@context"] === "https://schema.org", "Schema.org context");
  assert(metadata["@graph"].filter((item) => item["@type"] === "SoftwareSourceCode").length === 11, "Eleven SoftwareSourceCode entries");

  assert(await page.locator("#interfaces .section-kicker").textContent().then(t => t.includes("IN THE INTERFACE / 03")), "Section 3 retains its interface heading");
  assert((await interfaces.getByRole("tab").count()) === 10, "Section 3 includes all ten products");
  assert((await page.locator(".interface-panel").count()) === 10, "One gallery panel per product");
  for (const name of expectedProjects) {
    const tab = interfaces.getByRole("tab", { name: new RegExp(`^\\d{2} ${name}$`) });
    await tab.click();
    assert(await tab.getAttribute("aria-selected") === "true", `${name} interface selected`);
    assert((await page.locator(".interface-panel:visible").count()) === 1, "Exactly one visible interface");
    const panel = page.locator(`#${await tab.getAttribute("aria-controls")}`);
    assert(await panel.isVisible(), `${name} correct gallery panel`);
    assert(await panel.locator(".interface-story .text-link").textContent().then(t => t.includes(name)), `${name} guide matches capture`);
    for (const image of await panel.locator("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
      assert(await image.evaluate(img => img.naturalWidth > 0), `${name} capture decoded`);
    }
    if (name === "Emberfold") assert(await panel.locator("pre").textContent().then(t => t.includes('"fits": true')), "Verified Emberfold output");
  }
  await interfaces.getByRole("tab", { name: /Cindertrace/ }).click();
  const cindertrace = page.locator("#interface-cindertrace");
  for (const [name, suffix] of [["Investigation", "case"], ["Overview", "overview"]]) {
    const button = cindertrace.getByRole("button", {name, exact: true});
    await button.click();
    assert(await button.getAttribute("aria-pressed") === "true", `${name} capture selection`);
    await cindertrace.locator("img").evaluate(img => img.decode());
    assert(await cindertrace.locator("img").getAttribute("src").then(s => s.endsWith(`cindertrace-${suffix}.webp`)), `${name} image`);
    assert(await cindertrace.locator(".capture-full-link").getAttribute("href").then(s => s.endsWith(`cindertrace-${suffix}.webp`)), `${name} full capture link`);
  }
  await interfaces.getByRole("tab", { name: /Cindertrace/ }).focus();
  await page.keyboard.press("End");
  assert(await interfaces.getByRole("tab", {selected: true}).textContent().then(t => t.includes("Emberfold")), "Interface End key");
  await page.keyboard.press("ArrowRight");
  assert(await interfaces.getByRole("tab", {selected: true}).textContent().then(t => t.includes("Hive")), "Interface arrow wraps");
  await page.keyboard.press("ArrowLeft");
  assert(await interfaces.getByRole("tab", {selected: true}).textContent().then(t => t.includes("Emberfold")), "Interface previous wraps");
  await page.keyboard.press("Home");
  assert(await interfaces.getByRole("tab", {selected: true}).textContent().then(t => t.includes("Hive")), "Interface Home key");
  // Every entry in the hero and project directory opens the matching section 3 panel.
  for (const area of [".stack-index", ".project-grid"]) {
    for (const name of expectedProjects) {
      const link = page.locator(area).getByRole("link", {name: area === ".stack-index" ? new RegExp(`^\\d{2} ${name} `) : "See interface"});
      const target = area === ".stack-index" ? link : page.locator(area).locator(`.project-${name.toLowerCase()} [data-interface-link]`);
      await target.click();
      assert(await interfaces.getByRole("tab", {selected:true}).textContent().then(t => t.includes(name)), `${area} opens ${name}`);
    }
  }
  await interfaces.getByRole("tab", {name: /Cindertrace/}).click();
  const labLink = cindertrace.getByRole("link", {name: /Try the disposable investigation lab/});
  assert(await labLink.isVisible(), "Cindertrace lab entry");
  assert(await labLink.getAttribute("href") === "/guides/cindertrace.md#try-the-evolving-investigation-lab", "Lab instructions link");
  const labGuide = await page.request.get(new URL(await labLink.getAttribute("href"), page.url()).href);
  assert(labGuide.ok() && (await labGuide.text()).includes("git checkout --detach 0368abb6779c0c715e1dc00f7f346b2253f5f040"), "Lab guide pins implementation");
  // Legacy deep links still lead to Cindertrace after a different gallery is selected.
  await page.goto(new URL("/#security", page.url()).href);
  await cindertrace.waitFor({state:"visible"});
  assert(await cindertrace.isVisible(), "Legacy security anchor selects Cindertrace");
  // Audit the longest command at every width: code blocks scroll only when narrow.
  await walkthroughs.getByRole("tab", { name: /ChatterMost/ }).click();
  // Keep hover stable while axe scrolls and samples contrast at each viewport.
  await page.mouse.move(0, 0);
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Horizontal overflow at ${width}px`,
    );
    const overlaps = await page.locator('.atlas-node, .atlas-center').evaluateAll(nodes => nodes.flatMap((a, i) => nodes.slice(i + 1).filter(b => {
      const x = a.getBoundingClientRect(), y = b.getBoundingClientRect();
      return x.left < y.right && x.right > y.left && x.top < y.bottom && x.bottom > y.top;
    }).map(b => `${a.textContent.trim()} / ${b.textContent.trim()}`)));
    assert(!overlaps.length, `Atlas nodes overlap at ${width}px: ${overlaps}`);
    for (const name of ["Cindertrace", "Emberfold"]) {
      await interfaces.getByRole("tab", {name: new RegExp(name)}).click();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} gallery overflow at ${width}px`);
    }
    await interfaces.getByRole("tab", {name: /Cindertrace/}).click();
    await page.mouse.move(0, 0);
    const accessibility = await page.evaluate(async () => {
      const result = await axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      });
      return result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      }));
    });
    assert(
      !accessibility.length,
      `Accessibility violations at ${width}px: ${JSON.stringify(accessibility)}`,
    );
    const tinyText = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter(
          (el) =>
            [...el.childNodes].some(
              (n) => n.nodeType === 3 && n.textContent.trim(),
            ) && parseFloat(getComputedStyle(el).fontSize) < 11,
        )
        .map((el) => el.className || el.tagName),
    );
    assert(!tinyText.length, `Text under 11px at ${width}px: ${tinyText}`);
  }
  await walkthroughs.getByRole("tab", { name: /01.*Hive/ }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert(
    (await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    )) === "auto",
    "Reduced motion scroll",
  );
  assert(!errors.length, `Page errors: ${errors.join("; ")}`);
  assert(!consoleErrors.length, `Console errors: ${consoleErrors.join("; ")}`);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator(".atlas-node").first().click();
  await page.evaluate(() => window.scrollTo(0, 0));
  return {
    atlasSelections: 10,
    walkthroughs: 5,
    steps: 15,
    clipboardChecks: 5,
    agentGuides: 10,
    sourceCodeEntries: 11,
    accessibilityViolations: 0,
    interfaces: 10,
    cindertraceCaptures: 2,
    directoryLinks: 20,
    viewportWidths: [1440, 1024, 768, 390, 320],
    pageErrors: errors.length,
    consoleErrors: consoleErrors.length,
  };
}
