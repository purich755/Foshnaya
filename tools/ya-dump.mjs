// Дамп карточки Яндекс.Карт «Фошная»: state-view + innerText карточки, галереи, меню, отзывов.
// Фото галереи берутся только из DOM-скролла /gallery/ (в server HTML подмешаны чужие).
//   node tools/ya-dump.mjs [card,gallery,menu,reviews]
import { chromium } from 'playwright-core';
import fs from 'node:fs'; import path from 'node:path';

const ORG = 'https://yandex.ru/maps/org/foshnaya/125898877343';
const only = (process.argv[2] || 'card,gallery,menu,reviews').split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync('raw', { recursive: true });

async function waitState(page) {
  const end = Date.now() + 180000; let warned = false;
  while (Date.now() < end) {
    if (await page.evaluate(() => !!document.querySelector('script.state-view')).catch(() => false)) return true;
    if (/captcha|showcaptcha/i.test(page.url()) && !warned) { console.log('⚠ Капча — реши в окне браузера'); warned = true; }
    await sleep(2000);
  }
  return false;
}

const profileDir = path.resolve('..', 'leadgen', '.browser-profile');
const ctx = await chromium.launchPersistentContext(profileDir, { channel: 'chrome', headless: false, viewport: { width: 1440, height: 950 }, locale: 'ru-RU' });
const page = ctx.pages()[0] || (await ctx.newPage());

for (const sub of only) {
  const url = ORG + (sub === 'card' ? '/' : `/${sub}/`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  if (!(await waitState(page))) { console.log(`  ! ${sub}`); continue; }
  await sleep(3000);
  const photos = new Set(); const menu = new Map();
  const rounds = sub === 'card' ? 4 : sub === 'gallery' ? 70 : 45;
  for (let i = 0; i < rounds; i++) {
    const got = await page.evaluate((sub) => {
      const o = []; const m = [];
      const scope = document.querySelector('.sidebar-view, [class*="sidebar"]') || document;
      for (const im of scope.querySelectorAll('img')) {
        const s = im.currentSrc || im.src;
        if (/avatars\.mds\.yandex\.net\/get-(altay|goods|sprav|tycoon|vh|ugc)/.test(s)) {
          o.push(s);
          if (sub === 'menu') {
            const card = im.closest('[class*="menu"], [class*="goods"], [class*="product"], li, article');
            if (card) m.push([s, card.innerText.slice(0, 300)]);
          }
        }
      }
      for (const b of document.querySelectorAll('button, [role=button], span')) {
        if (/^(Ещё|Показать ещё|Читать целиком|ещё)$/i.test((b.innerText || '').trim())) { try { b.click(); } catch {} }
      }
      return { o, m };
    }, sub).catch(() => ({ o: [], m: [] }));
    got.o.forEach((u) => photos.add(u.replace(/\/[A-Za-z_0-9]+$/, '/')));
    got.m.forEach(([u, t]) => menu.set(u.replace(/\/[A-Za-z_0-9]+$/, '/'), t));
    // скроллим панель (внутренний контейнер), колесо над ней
    await page.mouse.move(300, 600); await page.mouse.wheel(0, 1300); await sleep(650);
    if (i % 15 === 14) console.log(`  …${sub} photos=${photos.size} menu=${menu.size}`);
  }
  const state = await page.evaluate(() => document.querySelector('script.state-view')?.textContent);
  if (state) fs.writeFileSync(`raw/ya-${sub}.json`, state, 'utf8');
  fs.writeFileSync(`raw/ya-${sub}.txt`, await page.evaluate(() => document.body.innerText), 'utf8');
  if (sub === 'gallery') fs.writeFileSync('raw/ya-photos.json', JSON.stringify([...photos].map((base) => ({ base })), null, 2));
  if (sub === 'menu') fs.writeFileSync('raw/ya-menu-photos.json', JSON.stringify([...menu].map(([base, text]) => ({ base, text })), null, 2));
  console.log(`✓ ${sub}: state ${state ? (state.length / 1024).toFixed(0) + 'КБ' : '—'}, photos ${photos.size}, menu ${menu.size}`);
}
await ctx.close();
