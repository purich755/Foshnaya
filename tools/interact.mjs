// Клик-тесты интерактивов «Фошной»: node tools/interact.mjs [url]
import { chromium } from 'playwright-core';
import os from 'node:os'; import path from 'node:path';
const URL = process.argv[2] || process.env.URL || 'http://localhost:8414/';
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗'} ${m}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(w, h, q = '') {
  const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'fosh-int-' + w), { channel: 'chrome', headless: true, viewport: { width: w, height: h }, isMobile: w < 700, hasTouch: w < 700, locale: 'ru-RU' });
  const page = ctx.pages()[0] || (await ctx.newPage());
  const errs = [];
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 200)));
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  await page.goto(URL + q, { waitUntil: 'load' });
  await sleep(1500);
  return { ctx, page, errs };
}
const goto = (page, sel, off = 0) => page.evaluate(async ({ sel, off }) => {
  const el = document.querySelector(sel); const y = el.getBoundingClientRect().top + scrollY + off;
  const l = window.__lenis; const from = scrollY;
  for (let i = 1; i <= 10; i++) { const t = from + ((y - from) * i) / 10; l ? l.scrollTo(t, { immediate: true, force: true }) : scrollTo(0, t); await new Promise((r) => setTimeout(r, 40)); }
}, { sel, off });
const center = (page, sel) => page.evaluate((sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel);

// ───── десктоп
{
  const { ctx, page, errs } = await open(1440, 900);
  // размеры фо
  await goto(page, '#pho', 0); await sleep(900);
  const radios = page.locator('[role=radio]');
  await radios.nth(0).click(); await sleep(1100);
  ok((await radios.nth(0).getAttribute('aria-checked')) === 'true', 'размер: клик 500 г выбирает радио');
  ok((await page.locator('#pho [class*=SizePicker_big] span').first().textContent()) === '550', 'размер: цена докрутилась до 550');
  await page.keyboard.press('ArrowRight'); await sleep(900);
  ok((await radios.nth(1).getAttribute('aria-checked')) === 'true', 'размер: стрелка вправо → 700 г');

  // миска
  await goto(page, '#toppings', 120); await sleep(900);
  const meter = page.locator('[role=meter]');
  let p = await center(page, '[data-jar=chili]');
  await page.mouse.click(p.x, p.y); await sleep(1300);
  ok((await meter.getAttribute('aria-valuenow')) === '1', 'миска: клик по чили → острота 1');
  const a = await center(page, '[data-jar=sate]'); const b = await center(page, '[class*=BuildBowl_bowl]');
  await page.mouse.move(a.x, a.y); await page.mouse.down();
  for (let i = 1; i <= 12; i++) { await page.mouse.move(a.x + ((b.x - a.x) * i) / 12, a.y + ((b.y - a.y) * i) / 12); await sleep(16); }
  await page.mouse.up(); await sleep(1300);
  ok((await meter.getAttribute('aria-valuenow')) === '3', 'миска: перетаскивание острого соуса → острота 3');
  const before = await page.locator('[class*=BuildBowl_layer] > g').count();
  await page.locator('[data-jar=lemon]').focus(); await page.keyboard.press('Enter'); await sleep(1300);
  ok((await page.locator('[class*=BuildBowl_layer] > g').count()) > before, 'миска: Enter по лимону добавляет дольку');
  const c = await center(page, '[data-jar=onion]'); await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.mouse.move(c.x + 30, c.y + 260, { steps: 6 }); await page.mouse.up(); await sleep(1300);
  ok((await meter.getAttribute('aria-valuenow')) === '3', 'миска: мимо миски — ничего не добавилось');
  await page.getByRole('button', { name: 'Сбросить миску' }).click(); await sleep(400);
  ok((await meter.getAttribute('aria-valuenow')) === '0' && (await page.locator('[class*=BuildBowl_layer] > g').count()) === 0, 'миска: сброс');

  // JVC
  await goto(page, '#gallery', 60); await sleep(900);
  await page.getByRole('button', { name: 'CH+ следующий канал', exact: true }).click(); await sleep(700);
  ok(/CH 02/.test(await page.locator('[class*=JvcGallery_osd]').textContent()), 'JVC: CH+ → канал 02');
  await page.locator('button[class*=JvcGallery_thumb__]').nth(4).click(); await sleep(700);
  ok(/CH 05/.test(await page.locator('[class*=JvcGallery_osd]').textContent()), 'JVC: миниатюра → канал 05');
  await page.locator('[class*=JvcGallery_screen]').focus(); await page.keyboard.press('ArrowLeft'); await sleep(700);
  ok(/CH 04/.test(await page.locator('[class*=JvcGallery_osd]').textContent()), 'JVC: стрелка влево → канал 04');
  await page.getByRole('button', { name: /на весь экран/ }).click(); await sleep(900);
  ok(await page.locator('[role=dialog]').isVisible(), 'лайтбокс открылся');
  await page.keyboard.press('ArrowRight'); await sleep(300);
  ok(/05 \/ 16/.test(await page.locator('[role=dialog]').textContent()), 'лайтбокс: стрелка → 05 / 16');
  ok(await page.evaluate(() => document.activeElement?.closest('[role=dialog]') !== null), 'лайтбокс: фокус внутри');
  await page.keyboard.press('Escape'); await sleep(900);
  ok((await page.locator('[role=dialog]').count()) === 0, 'лайтбокс: Esc закрывает');

  // FAQ
  await goto(page, '#faq', 0); await sleep(600);
  const q2 = page.locator('#faq button[aria-controls=faq-2]');
  await q2.click(); await sleep(700);
  ok((await q2.getAttribute('aria-expanded')) === 'true' && (await page.locator('#faq-2').isVisible()), 'FAQ: пункт 2 раскрылся');
  await q2.click(); await sleep(700);
  ok(!(await page.locator('#faq-2').isVisible()), 'FAQ: пункт 2 свернулся');

  // хот-споты в пин-сцене
  await goto(page, '#space', 0); await sleep(300);
  await goto(page, '#space', 1300); await sleep(1800);
  const sp = await center(page, 'button[aria-controls=spot-tv]');
  await page.mouse.move(sp.x, sp.y); await sleep(500);
  ok(await page.evaluate(() => getComputedStyle(document.getElementById('spot-tv')).opacity === '1'), 'план: наведение на хот-спот ТВ показывает карточку');

  // чеки
  await goto(page, 'section[aria-labelledby=receipts-title]', 100); await sleep(4200);
  const rc = await center(page, '[data-receipt]');
  const t0 = await page.evaluate(() => document.querySelector('[data-receipt]').style.transform);
  await page.mouse.move(rc.x, rc.y); await page.mouse.down(); await page.mouse.move(rc.x + 140, rc.y + 60, { steps: 8 }); await page.mouse.up(); await sleep(800);
  ok(t0 !== (await page.evaluate(() => document.querySelector('[data-receipt]').style.transform)), 'чеки: перетаскивание двигает чек');

  // якорь из шапки
  await goto(page, '#top', 0); await sleep(400);
  await page.locator('header nav a[href="#route"]').click(); await sleep(2000);
  { const top = await page.evaluate(() => document.getElementById('route').getBoundingClientRect().top); ok(Math.abs(top) < 120, 'якорь «Как дойти» доезжает до секции (top=' + Math.round(top) + ')'); }

  ok(errs.length === 0, 'десктоп: без ошибок в консоли' + (errs.length ? ' → ' + errs.join(' | ') : ''));
  await ctx.close();
}

// ───── статус по времени
for (const [t, re] of [['13:00', /Открыто/], ['22:45', /Закрываемся/], ['08:00', /Закрыто/]]) {
  const { ctx, page } = await open(1440, 900, `?t=${t}`);
  ok(re.test(await page.locator('[class*=Hero_tag__]').textContent()), `статус в ${t}: ${re}`);
  await ctx.close();
}

// ───── телефон
{
  const { ctx, page, errs } = await open(390, 844);
  await page.locator('button[aria-controls=mobile-menu]').tap(); await sleep(800);
  ok(await page.locator('#mobile-menu').isVisible(), 'телефон: бургер открывает меню');
  await page.locator('#mobile-menu a[href="#menu"]').tap(); await sleep(1600);
  ok(!(await page.locator('#mobile-menu').isVisible()), 'телефон: пункт меню закрывает меню');
  ok(await page.evaluate(() => Math.abs(document.getElementById('menu').getBoundingClientRect().top) < 140), 'телефон: якорь доезжает до меню');
  await goto(page, '#toppings', 300); await sleep(800);
  await page.locator('[data-jar=chili]').tap(); await sleep(1400);
  ok((await page.locator('[role=meter]').getAttribute('aria-valuenow')) === '1', 'телефон: тап по чили добавляет остроту');
  await goto(page, '#space', 600); await sleep(800);
  await page.locator('button[aria-controls=spot-window]').tap(); await sleep(900);
  ok((await page.locator('[data-card=window]').getAttribute('data-on')) === '', 'телефон: тап по хот-споту листает карточки');
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'телефон: нет горизонтального скролла');
  ok(errs.length === 0, 'телефон: без ошибок в консоли' + (errs.length ? ' → ' + errs.join(' | ') : ''));
  await ctx.close();
}
console.log(`\n${pass} ✓  ${fail} ✗`);
process.exit(fail ? 1 : 0);
