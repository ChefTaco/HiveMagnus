// Playwright CLI: run-code --filename scripts/capture-cindertrace.js
// Open a NEW isolated Cindertrace demo, seed scripts/demo.mjs --preserve,
// and sign in locally first. Never run against an operational installation.
async function captureCindertrace(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(new URL('/security-fusion', page.url()).href);
  await page.getByRole('heading', { name: 'Cindertrace', exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'output/playwright/cindertrace-overview.png' });
  await page.locator('a[href^="/security-fusion/cases/"]').first().click();
  await page.getByRole('heading', { name: 'credential abuse · Example application host' }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'output/playwright/cindertrace-case.png' });
  return { captures: 2, scenario: 'isolated synthetic authentication case' };
}
