// склейка скриншотов тура в листы 2×2: node tools/sheet.mjs raw/tour-1440 [cols] [cellW]
import sharp from 'sharp'; import fs from 'node:fs';
const d = process.argv[2]; const cols = +(process.argv[3] || 2); const cw = +(process.argv[4] || 720);
const fl = fs.readdirSync(d).filter((f) => f.endsWith('.png')).sort();
const per = cols * 2; const m0 = await sharp(`${d}/${fl[0]}`).metadata(); const ch = Math.round((m0.height / m0.width) * cw);
for (let p = 0; p < fl.length; p += per) {
  const chunk = fl.slice(p, p + per); const comps = [];
  for (let i = 0; i < chunk.length; i++) comps.push({ input: await sharp(`${d}/${chunk[i]}`).resize(cw, ch, { fit: 'cover', position: 'top' }).toBuffer(), left: (i % cols) * (cw + 4), top: Math.floor(i / cols) * (ch + 4) });
  await sharp({ create: { width: cols * (cw + 4), height: 2 * (ch + 4), channels: 3, background: '#000' } }).composite(comps).jpeg({ quality: 80 }).toFile(`${d}-s${p / per + 1}.jpg`);
}
console.log('ok', Math.ceil(fl.length / per));
