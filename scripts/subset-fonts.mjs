// Сабсет Dela Gothic One: только латиница, кириллица, цифры и типографские знаки.
// Полный шрифт с японскими глифами весит ~2,5 МБ, гугловские подмножества — ~90 КБ на латиницу+кириллицу.
//   node scripts/subset-fonts.mjs   (исходник: raw/fonts/Dela.ttf из google/fonts)
import fs from 'node:fs';
import subsetFont from 'subset-font';

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join('');
const chars = range(0x20, 0x7e) + range(0x410, 0x44f) + 'Ёё' + '«»—–…№₽²·’“”„×→←↑' + range(0xa0, 0xbf);
const src = fs.readFileSync('raw/fonts/Dela.ttf');
const out = await subsetFont(src, chars, { targetFormat: 'woff2' });
fs.writeFileSync('app/fonts/DelaGothicOne-subset.woff2', out);
console.log('✓ app/fonts/DelaGothicOne-subset.woff2', (out.length / 1024).toFixed(1) + ' КБ');
