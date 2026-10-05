import { chromium } from 'playwright-core'; import os from 'node:os'; import path from 'node:path';
const W = +(process.argv[2] || 1440);
const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'fosh-ov'), { channel: 'chrome', headless: true, viewport: { width: W, height: 900 }, isMobile: W < 700, hasTouch: W < 700 });
const page = ctx.pages()[0];
await page.goto(process.env.URL || 'http://localhost:8414/', { waitUntil: 'load' }); await page.waitForTimeout(2500);
const r = await page.evaluate(() => { const out = []; const iw = document.documentElement.clientWidth; for (const el of document.querySelectorAll('body *')) { const b = el.getBoundingClientRect(); let p = el.parentElement, clipped = false; while (p && p !== document.body) { const o = getComputedStyle(p); if (/hidden|clip|auto|scroll/.test(o.overflowX)) { clipped = true; break; } p = p.parentElement; } if (!clipped && b.right > iw + 1 && b.width > 0) { const cs = getComputedStyle(el); out.push(`${el.tagName}.${(el.className?.baseVal ?? el.className) || ''} right=${Math.round(b.right)} w=${Math.round(b.width)} pos=${cs.position}`); } } window.scrollTo(2000, 0); const sx = window.scrollX; return { sx, sw: document.documentElement.scrollWidth, iw, out: out.slice(0, 25) }; });
console.log(JSON.stringify(r, null, 1)); await ctx.close();
