// Собирает фото заведения из дампов Яндекса (state-view + DOM-сбор) и качает крупнейший размер.
//   node tools/ya-photos.mjs
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';

const OID = '125898877343';
const bases = new Set();
const walk = (o, own = true) => {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) return o.forEach((x) => walk(x, own));
  if (o.businessId && o.businessId !== OID) own = false;
  if (own && typeof o.urlTemplate === 'string' && /avatars\.mds/.test(o.urlTemplate)) {
    bases.add(o.urlTemplate.replace(/%s$|\{size\}$/, ''));
  }
  for (const k of Object.keys(o)) {
    if (/similar|advert|competitor|discover|topObjects|references/i.test(k)) continue;
    walk(o[k], own);
  }
};
for (const f of []) {
  try { walk(JSON.parse(fs.readFileSync(`raw/${f}.json`, 'utf8'))); } catch {}
}
for (const f of ['ya-photos.json']) {
  try { JSON.parse(fs.readFileSync(`raw/${f}`, 'utf8')).forEach((p) => bases.add(p.base)); } catch {}
}
fs.mkdirSync('raw/photos', { recursive: true });
const SIZES = ['orig', 'XXXL', 'XXL', 'XL'];
let ok = 0;
for (const base of bases) {
  if (/get-yapic|landing_logo/.test(base)) continue;
  const id = crypto.createHash('md5').update(base).digest('hex').slice(0, 8);
  const kind = (base.match(/get-([a-z-]+)\//) || [0, 'x'])[1];
  const dest = path.join('raw/photos', `${kind}-${id}.jpg`);
  if (fs.existsSync(dest)) { ok++; continue; }
  for (const s of SIZES) {
    try {
      const r = await fetch(base + s, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://yandex.ru/' } });
      if (!r.ok) continue;
      const b = Buffer.from(await r.arrayBuffer());
      if (b.length < 12000) continue;
      fs.writeFileSync(dest, b); ok++; console.log('✓', path.basename(dest), s, (b.length / 1024).toFixed(0) + 'КБ');
      break;
    } catch {}
  }
}
console.log(`фото: ${ok} из ${bases.size} ссылок`);
