#!/usr/bin/env node
// Captures the HiveXUI gallery from a DISPOSABLE suite installation seeded with synthetic data.
// Never point this at an operational installation: the origin must be https://localhost:PORT.
//
//   node scripts/capture-hivexui.mjs --credentials FILE --ui-dist HIVEXUI/dist \
//     --playwright-from HIVEXUI --output output/captures [--only fleet-map,chat] [--webp-quality 0.82]
//
// FILE is JSON holding {origin, username, password}. Static files come from a fresh HiveXUI build;
// API requests reach the disposable stack. Two responses are changed for the capture only:
// - Oathweave's public liveness reports normal sign-in limits, so a test stack's relaxed-limits
//   warning strip never appears in a public image.
// - The fleet topology marks seeded nodes reachable, because the API probes their documentation
//   addresses and fake hosts could never answer.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    credentials: { type: 'string' },
    'ui-dist': { type: 'string' },
    'playwright-from': { type: 'string' },
    output: { type: 'string' },
    only: { type: 'string' },
    width: { type: 'string', default: '1440' },
    height: { type: 'string', default: '900' },
    'webp-quality': { type: 'string', default: '0.82' },
  },
});
for (const required of ['credentials', 'ui-dist', 'playwright-from', 'output']) {
  if (!args[required]) throw new Error(`--${required} is required`);
}
const credentials = JSON.parse(readFileSync(args.credentials, 'utf8'));
const origin = credentials.origin;
if (!/^https:\/\/localhost:\d+$/.test(origin) || credentials.disposable === false) throw new Error('Refusing: not a disposable localhost origin');
const dist = resolve(args['ui-dist']);
const output = resolve(args.output);
mkdirSync(output, { recursive: true });
const { chromium } = createRequire(resolve(args['playwright-from']) + '/')('@playwright/test');
const only = args.only?.split(',');

// Each entry names one capture. `act` runs after the page settles and before the screenshot.
const SHOTS = [
  { name: 'fleet-overview', url: '/fleet', wait: 70000 }, // long enough for the session trend to draw
  { name: 'fleet-map', url: '/fleet/fleet-map', wait: 6000 },
  { name: 'fleet-mission', url: '/fleet/mission-control', wait: 6000 },
  { name: 'hive-overview', url: '/?page=hive', wait: 5000 },
  {
    // The users directory, not the overview: session rows show the host's real bridge address.
    name: 'identity',
    url: '/?page=iam-users',
    wait: 4000,
    act: async (page) => { await page.getByText('Directory', { exact: false }).first().scrollIntoViewIfNeeded(); await page.evaluate(() => { const heading = [...document.querySelectorAll('*')].find((el) => el.children.length === 0 && /directory/i.test(el.textContent)); heading?.scrollIntoView({ block: 'start' }); }); await page.waitForTimeout(600); },
  },
  { name: 'models', url: '/?page=traces', wait: 5000 },
  { name: 'memories', url: '/?page=memories', wait: 5000 },
  { name: 'skills', url: '/?page=skills' },
  { name: 'cindertrace-overview', url: '/?page=security', wait: 5000 },
  {
    name: 'cindertrace-case',
    url: '/?page=security',
    wait: 3000,
    act: async (page) => {
      await page.getByRole('link', { name: 'Cases', exact: true }).first().click().catch(() => page.getByText('Cases', { exact: true }).first().click());
      await page.waitForTimeout(2000);
      await page.getByText('SSH brute force followed by a successful login').first().click();
      await page.waitForTimeout(3000);
    },
  },
  {
    name: 'chat',
    url: '/?page=chat',
    wait: 4000,
    act: async (page) => {
      await page.getByRole('button', { name: /Operations/ }).first().click();
      await page.waitForTimeout(1500);
      await page.getByRole('button', { name: 'Dismiss' }).click().catch(() => {});
      await page.waitForTimeout(1500);
    },
  },
  { name: 'palette', url: '/?page=hive', wait: 4000, act: async (page) => { await page.keyboard.press('Control+k'); await page.waitForTimeout(800); } },
];

const browser = await chromium.launch({ headless: true, args: ['--disable-features=LocalNetworkAccessChecks'] });
const context = await browser.newContext({
  viewport: { width: Number(args.width), height: Number(args.height) },
  deviceScaleFactor: 2,
  ignoreHTTPSErrors: true,
  colorScheme: 'dark',
  reducedMotion: 'no-preference',
});
const page = await context.newPage();
page.on('pageerror', (error) => console.log('PAGEERROR', String(error).slice(0, 300)));
await context.route(`${origin}/**`, (route) => {
  const { pathname } = new URL(route.request().url());
  if (pathname.startsWith('/api/') || pathname.startsWith('/v1/') || pathname === '/runtime.json') return route.fallback();
  const file = join(dist, pathname === '/' ? 'index.html' : pathname);
  return route.fulfill({ path: file.startsWith(dist) && existsSync(file) && !statSync(file).isDirectory() ? file : join(dist, 'index.html') });
});
await context.route(/\/api\/oathweave\/health\/live$/, (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', authLimitsRelaxed: false }) }));
await context.route(/\/topology(\?|$)/, async (route) => {
  if (route.request().method() !== 'GET') return route.fallback();
  const response = await route.fetch();
  const body = await response.json();
  for (const node of body.data?.nodes ?? []) {
    if (node.status === 'OFFLINE') continue;
    node.reachable = true;
    node.latencyMs = node.status === 'DEGRADED' ? 85 : node.status === 'PROVISIONING' ? 45 : 3 + (Number(node.name.slice(5, 7)) % 7);
  }
  return route.fulfill({ response, json: body });
});

async function answerPrompts() {
  for (const name of ['Review access', 'Verify your identity']) {
    const dialog = page.getByRole('dialog', { name, exact: true });
    if (!(await dialog.isVisible().catch(() => false))) continue;
    if (name === 'Verify your identity') await dialog.getByRole('textbox', { name: /password/i }).fill(credentials.password);
    await dialog.getByRole('button', { name: /approve|allow|continue|verify|confirm/i }).first().click();
    return true;
  }
  return false;
}

await page.goto(origin + '/');
await page.getByRole('textbox', { name: 'Username', exact: true }).fill(credentials.username);
await page.getByRole('textbox', { name: 'Password', exact: true }).fill(credentials.password);
await page.getByRole('button', { name: /sign in/i }).first().click();
await page.locator('nav.nav').waitFor({ state: 'attached', timeout: 30000 });
await page.waitForTimeout(1500);
while (await answerPrompts()) await page.waitForTimeout(800);

for (const shot of SHOTS) {
  if (only && !only.includes(shot.name)) continue;
  await page.goto(origin + shot.url);
  await page.locator('nav.nav').waitFor({ state: 'attached', timeout: 30000 });
  const end = Date.now() + (shot.wait ?? 3500);
  while (Date.now() < end) { await answerPrompts(); await page.waitForTimeout(250); }
  if (shot.act) await shot.act(page);
  await answerPrompts();
  await page.waitForTimeout(400);
  const text = await page.evaluate(() => document.body.innerText);
  if (/relaxed|testing mode/i.test(text)) throw new Error(`${shot.name}: the testing-mode strip is visible`);
  await page.screenshot({ path: join(output, `${shot.name}.png`) });
  console.log(shot.name, '->', await page.evaluate(() => document.querySelector('.topbar')?.textContent?.slice(0, 80)));
}

// Encode every reviewed PNG in the output directory to WebP with Chromium's encoder: no extra dependency.
const encoder = await browser.newPage();
for (const file of readdirSync(output).filter((name) => name.endsWith('.png'))) {
  const png = readFileSync(join(output, file)).toString('base64');
  const data = await encoder.evaluate(async ({ png, quality }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d').drawImage(image, 0, 0);
    return canvas.toDataURL('image/webp', quality);
  }, { png, quality: Number(args['webp-quality']) });
  writeFileSync(join(output, file.replace(/\.png$/, '.webp')), Buffer.from(data.split(',')[1], 'base64'));
}
await browser.close();
