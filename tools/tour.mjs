// Скриншот-тур: node tools/tour.mjs [w] [h] [--reduced] [--only name]
import { chromium } from 'playwright-core';
import os from 'node:os'; import path from 'node:path'; import fs from 'node:fs';
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const W = +(args[0] || 1440), H = +(args[1] || (W < 700 ? 844 : 900));
const reduced = process.argv.includes('--reduced');
const oi = process.argv.indexOf('--only'); const only = oi > 0 ? process.argv[oi + 1] : null;
const url = process.env.URL || 'http://localhost:8414/';
const STOPS = [
  ['01-hero', '#top', 0], ['02-ticker', '#space', -0.35], ['03-space-a', '#space', 0.02], ['04-space-b', '#space', 0.5], ['05-space-c', '#space', 1.35],
  ['06-pho', '#pho', 0.05], ['07-pho-b', '#pho', 0.4], ['08-bowl', '#toppings', 0.08], ['09-bowl-b', '#toppings', 0.45], ['10-menu', '#menu', 0.05], ['11-menu-b', '#menu', 0.45],
  ['12-jvc', '#gallery', 0.08], ['13-jvc-b', '#gallery', 0.5], ['14-hostess', 'section[aria-labelledby=hostess-title]', 0.08], ['15-receipts', 'section[aria-labelledby=receipts-title]', 0.12],
  ['16-faq', '#faq', 0.05], ['17-route', '#route', 0.08], ['18-route-b', '#route', 0.5], ['19-finale', '#finale', 0], ['20-footer', 'footer', 0],
];
const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'fosh-tour'), { channel: 'chrome', headless: true, viewport: { width: W, height: H }, isMobile: W < 700, hasTouch: W < 700, reducedMotion: reduced ? 'reduce' : 'no-preference', locale: 'ru-RU' });
const page = ctx.pages()[0] || (await ctx.newPage());
const errs = [];
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errs.push(m.type() + ': ' + m.text().slice(0, 300)));
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
page.on('response', (r) => r.status() >= 400 && errs.push(r.status() + ' ' + r.url()));
await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(1500);
const scrollTo = (y) => page.evaluate((y) => { const l = window.__lenis; if (l) l.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }, y);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 500) { await scrollTo(y); await page.waitForTimeout(90); }
await scrollTo(0); await page.waitForTimeout(800);
const dir = `raw/tour-${W}${reduced ? '-rm' : ''}`; fs.mkdirSync(dir, { recursive: true });
for (const [name, sel, frac] of STOPS) {
  if (only && !name.includes(only)) continue;
  const y = await page.evaluate(({ sel, frac }) => { const el = document.querySelector(sel); if (!el) return -1; const r = el.getBoundingClientRect(); const top = r.top + scrollY; const h = el.offsetHeight; return Math.max(0, top + (frac < 0 ? frac * innerHeight : frac * (frac > 1 ? innerHeight : h))); }, { sel, frac });
  if (y < 0) { console.log('нет', sel); continue; }
  // доезжаем шагами, чтобы pin/scrub догнали
  const cur = await page.evaluate(() => scrollY);
  const steps = 8; for (let i = 1; i <= steps; i++) { await scrollTo(cur + ((y - cur) * i) / steps); await page.waitForTimeout(60); }
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${dir}/${name}.png` });
}
const info = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight }));
console.log(dir, JSON.stringify(info));
console.log([...new Set(errs)].join('\n'));
await ctx.close();
