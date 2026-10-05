// Быстрый скриншот: node tools/peek.mjs [w] [h] [scrollY|#id] [out] [--reduced] [--wait ms]
import { chromium } from 'playwright-core';
import os from 'node:os'; import path from 'node:path'; import fs from 'node:fs';
const [w = '1440', h = '900', at = '0', out = 'raw/peek.png'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const reduced = process.argv.includes('--reduced');
const wi = process.argv.indexOf('--wait'); const wait = wi > 0 ? +process.argv[wi + 1] : 2500;
const url = process.env.URL || 'http://localhost:8414/';
const W = +w, H = +h;
const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'fosh-peek'), { channel: 'chrome', headless: true, viewport: { width: W, height: H }, isMobile: W < 700, hasTouch: W < 700, reducedMotion: reduced ? 'reduce' : 'no-preference', locale: 'ru-RU' });
const page = ctx.pages()[0] || (await ctx.newPage());
const errs = [];
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errs.push(m.type() + ': ' + m.text().slice(0, 400)));
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(800);
if (at !== '0') {
  await page.evaluate(async (at) => {
    const step = async (y) => { const l = window.__lenis; if (l) l.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); };
    let target = at.startsWith('#') ? document.querySelector(at).getBoundingClientRect().top + scrollY : +at;
    if (at.includes('+')) { const [id, off] = at.split('+'); target = document.querySelector(id).getBoundingClientRect().top + scrollY + +off; }
    for (let y = 0; y < target; y += 400) await step(y);
    await step(target);
  }, at);
}
await page.waitForTimeout(wait);
fs.mkdirSync(path.dirname(out), { recursive: true });
await page.screenshot({ path: out });
const info = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight }));
console.log(out, JSON.stringify(info));
if (errs.length) console.log(errs.join('\n'));
await ctx.close();
