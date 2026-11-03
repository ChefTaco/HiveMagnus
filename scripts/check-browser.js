// With the site open in Playwright CLI:
// playwright-cli run-code --filename scripts/check-browser.js
async function checkBrowser(page) {
  const assert = (ok, message) => {
    if (!ok) throw new Error(message);
  };
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript({ path: "node_modules/axe-core/axe.min.js" });
  await page.reload();
  await page.locator(".atlas-node").first().waitFor();
  for (const name of ["Hive", "Magnus", "ChatterMost", "Emberfold"]) {
    const node = page.getByRole("button", {
      name: new RegExp(`0[1-4] ${name}`),
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
  for (const name of ["Hive", "Magnus", "ChatterMost", "Ardent + Emberfold"]) {
    await page
      .getByRole("tab", { name: new RegExp(name.replace("+", "\\+")) })
      .click();
    const firstCommand = await page.locator("#demo-panel code").textContent();
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
  await page.getByRole("tab").first().focus();
  await page.keyboard.press("End");
  assert(
    await page
      .getByRole("tab", { selected: true })
      .textContent()
      .then((v) => v.includes("Ardent")),
    "End tab navigation",
  );
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  assert(
    await page
      .getByRole("tab", { selected: true })
      .textContent()
      .then((v) => v.includes("Magnus")),
    "Arrow tab navigation",
  );
  await page.getByRole("tab", { name: /01.*Hive/ }).click();
  const brokenAnchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .filter((link) => !document.getElementById(link.hash.slice(1)))
        .map((link) => link.hash),
    );
  assert(!brokenAnchors.length, `Missing anchor targets: ${brokenAnchors}`);
  for (const image of await page.locator(".screen-frame img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((img) => img.decode());
    assert(
      await image.evaluate((img) => img.naturalWidth > 0),
      "Capture failed to load",
    );
  }
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
    `Accessibility violations: ${JSON.stringify(accessibility)}`,
  );
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Horizontal overflow at ${width}px`,
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert(
    (await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    )) === "auto",
    "Reduced motion scroll",
  );
  assert(!errors.length, `Page errors: ${errors.join("; ")}`);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator(".atlas-node").first().click();
  await page.evaluate(() => window.scrollTo(0, 0));
  return {
    atlasSelections: 4,
    walkthroughs: 4,
    steps: 12,
    clipboardChecks: 4,
    accessibilityViolations: 0,
    viewportWidths: [1440, 390, 320],
    pageErrors: errors.length,
  };
}
