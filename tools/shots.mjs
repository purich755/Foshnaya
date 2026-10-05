// Скриншоты страницы для самопроверки (системный Chrome через playwright-core).
//   node tools/shots.mjs [--w 1440] [--h 900] [--reduced] [--only hero] [--url http://localhost:8340/]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i === -1 ? d : process.argv[i + 1]; };
const W = parseInt(arg('w', '1440'), 10);
const H = parseInt(arg('h', W < 700 ? '844' : '900'), 10);
const only = arg('only', null);
const reduced = process.argv.includes('--reduced');
const URL = arg('url', 'http://localhost:8340/');
const outDir = 'raw/shots';

// [имя, id секции, смещение: доля высоты секции от её верха]
const STOPS = [
  ['01-hero', 'top', 0],
  ['02-slate', 'slate', -0.5],
  ['03-parents', 'parents', 0.05],
  ['04-parents-b', 'parents', 0.45],
  ['05-program', 'program', 0],
  ['06-program-mid', 'program', 1.6],
  ['07-shows', 'shows', 0.05],
  ['08-heroes', 'heroes', 0.05],
  ['09-studio', 'studio', 0.12],
  ['10-gallery', 'gallery', 0.1],
  ['11-formats', 'formats', 0.05],
  ['12-prices', 'prices', 0.1],
  ['13-reviews', 'reviews', 0.1],
  ['14-contacts', 'contacts', 0.05],
  ['15-finale', 'finale', 0],
  ['16-footer', 'finale', 1.0],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = path.join(os.tmpdir(), 'trend-show-shot-profile');

const ctx = await chromium.launchPersistentContext(profile, {
  channel: 'chrome',
  headless: true,
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  locale: 'ru-RU',
  isMobile: W < 700,
  hasTouch: W < 700,
  reducedMotion: reduced ? 'reduce' : 'no-preference',
});
const page = ctx.pages()[0] || (await ctx.newPage());
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 300)));
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

fs.mkdirSync(outDir, { recursive: true });
await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
await sleep(2600);

const scrollTo = async (y) => {
  await page.evaluate((y) => {
    const l = window.__lenis;
    if (l) l.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }, y);
};

// разбудить lazy-кадры и одноразовые reveal-триггеры
const total = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 700) { await scrollTo(y); await sleep(120); }
await scrollTo(0);
await sleep(1500);

const tag = `${W}${reduced ? '-rm' : ''}`;
for (const [name, id, frac] of STOPS) {
  if (only && !name.includes(only)) continue;
  const y = await page.evaluate(({ id, frac }) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return Math.max(0, top + el.offsetHeight * frac - (frac < 0 ? window.innerHeight * 0.3 : 0));
  }, { id, frac });
  await scrollTo(y);
  await sleep(1300);
  await page.screenshot({ path: `${outDir}/${tag}-${name}.png` });
  console.log('✓', name, Math.round(y));
}

const audit = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  innerW: window.innerWidth,
  docH: document.documentElement.scrollHeight,
  pin: !!document.querySelector('.pin-spacer'),
}));
console.log('audit', JSON.stringify(audit));
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].join('\n'));
await ctx.close();
