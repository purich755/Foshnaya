// Скачивает реальные фото «Фошной» и готовит их для сайта.
//   npm run photos            — скачать недостающее + пересобрать WebP и data/photos.ts
//   npm run photos -- --force — пересобрать WebP заново
//
// Источники: галерея Яндекс.Карт (avatars.mds.yandex.net/get-altay, размер orig),
// Restoclub (готовые w1230), Enter 2018 (только интерьер, которого нет на свежих фото).
// Хотлинки на avatars.mds в продакшене отдают 403, поэтому всё лежит в public/photos.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const YA = 'https://avatars.mds.yandex.net/get-altay/';
const RC = 'https://img.restoclub.ru/uploads/place/';
const EN = 'https://entermedia.io/wp-content/uploads/2018/';

// [id, категория, источник, alt, источник-подпись]
const PLAN = [
  // hero
  ['pho-cup-dark', 'hero', YA + '1633000/2a0000016b8c665d024bbfc93f3ba8f9fdbf/orig', 'Фо бо в крафтовом стакане навынос: зелень, красный лук, мята и лимон', 'Яндекс.Карты'],
  ['pho-cup-studio', 'hero', RC + '4/4/e/b/44eb03c8b41c4b39361a93c706aa673b_w1230_h820--no-cut.webp', 'Фо бо в стакане с красной печатью «Фошной», рядом соусы в розетках', 'Restoclub'],
  // pho
  ['bowl-top', 'pho', YA + '7383884/2a0000018332f32a3102a039fc41cfbaf974/orig', 'Фо бо сверху: говядина, красный лук, кинза и лимон', 'Яндекс.Карты'],
  ['bowl-dark-top', 'pho', YA + '1547687/2a0000016b8c6676b6b5294aa6f812517cbb/orig', 'Миска фо сверху: зелёный лук, лимон, чили и рисовая лапша', 'Яндекс.Карты'],
  ['bowl-chili', 'pho', YA + '15249330/2a00000193ecbfbeaea3f681a7d833cef5fe/orig', 'Фо с говядиной, чили и лимоном крупным планом', 'Яндекс.Карты'],
  ['bowl-spoon', 'pho', YA + '5548986/2a000001832855dd49bbd8608e7406fefdd8/orig', 'Фо бо с ложкой на стойке, за ним шрирача', 'Яндекс.Карты'],
  ['cup-stamp', 'pho', YA + '3733076/2a0000017907797b72bae8e94d7e33e3377b/orig', 'Крафтовый стакан фо с красной печатью «Фошной»', 'Яндекс.Карты'],
  ['cup-hand', 'pho', YA + '4324292/2a00000178bb775bb79e9d575aa30b07b4af/orig', 'Стакан фо в руке у окна, палочки сверху', 'Яндекс.Карты'],
  ['two-cups', 'pho', YA + '1359533/2a00000184a896f21be2dfdb7260836bebe3/orig', 'Два стакана фо с палочками на деревянной стойке', 'Яндекс.Карты'],
  ['cup-cans', 'pho', YA + '4012648/2a00000178bb7472faac0f11a55e53192d13/orig', 'Фо в стакане, палочки и банки фруктового сока', 'Яндекс.Карты'],
  ['bowl-rolls', 'pho', RC + 'a/7/a/3/a7a348adb6419634e7521c2a145772db_w1230_h820--no-cut.webp', 'Фо бо с говядиной, рядом соусы и плетёные тарелки', 'Restoclub'],
  // counter
  ['sauces', 'counter', YA + '4079855/2a00000178bb7a706cfbbea781650aed31a2/orig', 'Шрирача, соус чили и соевый соус на стойке', 'Яндекс.Карты'],
  ['blue-counter', 'counter', YA + '10239151/2a0000019010d5a14da74b23cb8a5649b3c7/orig', 'Голубая стойка, красная доска меню и стопки стаканов', 'Яндекс.Карты'],
  ['board-queue', 'counter', YA + '15251163/2a00000196dfd0c2a59b5f8135aa01e37346/orig', 'Гости у голубой стойки, над кухней — доска меню', 'Яндекс.Карты'],
  ['board-kitchen', 'counter', YA + '13581124/2a0000018eb9957536bffd63d388f9fa065d/orig', 'Доска меню мелом: Phở bò, Bánh bao, Spring roll, Nem, Juice', 'Яндекс.Карты'],
  ['kitchen-red', 'counter', YA + '20456665/2a000001a04289e2d8ded11c20aa66b6d00f/orig', 'Кухня за стойкой: кастрюли с бульоном под красной доской меню', 'Яндекс.Карты'],
  ['board-chalk', 'counter', YA + '4538345/2a00000178bb73223bc1ecbace7cd9b694f9/orig', 'Меню мелом на красной доске за листом пальмы', 'Яндекс.Карты'],
  // interior
  ['wall-posters', 'interior', YA + '13790728/2a00000193ecbfb53eaeb8058ac32e3510a4/orig', 'Узкая стойка вдоль стены с плакатами и соусами', 'Яндекс.Карты'],
  ['flag-shelf', 'interior', YA + '4612894/2a000001810b7a5553ccd3f421a584015a81/orig', 'Красный шкафчик с соусами под вьетнамским флажком', 'Яндекс.Карты'],
  ['shutters', 'interior', YA + '20305182/2a000001a0ce96bafe8cfe9cd5af3e7fa613/orig', 'Охристая стена с голубыми ставнями и узкой стойкой', 'Яндекс.Карты'],
  ['counter-shelf', 'interior', YA + '17632979/2a000001a04289cfb8345c305eea31844b8d/orig', 'Полки со стаканами и красный шкафчик над стойкой', 'Яндекс.Карты'],
  ['lamps', 'interior', YA + '5496626/2a0000017e360717599482a02629b94df89a/orig', 'Плетёные лампы и пальма у окна', 'Яндекс.Карты'],
  ['lamp-window', 'interior', YA + '14238289/2a00000191f1bbfc5e3932098e5a31848578/orig', 'Плетёная лампа у окна вечером', 'Яндекс.Карты'],
  ['jvc-2018', 'interior', EN + '10/IMG_4598-1.jpg', 'Старый телевизор JVC на жёлтом холодильнике', 'Enter, 2018'],
  ['tv-corner-2018', 'interior', EN + '10/IMG_4580-1.jpg', 'Угол кухни: телевизор на жёлтом холодильнике и мятная стойка', 'Enter, 2018'],
  ['cups-2018', 'interior', EN + '10/IMG_4556-1.jpg', 'Стаканы с печатью «Фошной» и хризантемы у охристой стены', 'Enter, 2018'],
  // snacks
  ['spring-rolls', 'snacks', YA + '3733076/2a00000178bb77ee3ba658d000e3ddf7a251/orig', 'Спринг-роллы с креветкой и манго в рисовой бумаге', 'Яндекс.Карты'],
  ['spring-rolls-red', 'snacks', YA + '4332216/2a00000178bb782fe9b144584224c56e1dea/orig', 'Спринг-роллы с креветками на красном столе', 'Яндекс.Карты'],
  ['nems', 'snacks', RC + 'd/a/c/6/dac6fbbd4de7ea36c3acdd5615a285a4_w1230_h820--no-cut.webp', 'Нэмы — жареные роллы из рисовой бумаги с соусом', 'Restoclub'],
  ['nems-slate', 'snacks', YA + '1871013/2a0000016b8c6671d2f7bcbf420b9d1e1af1/orig', 'Жареные роллы на чёрной доске с чили и лимоном', 'Яндекс.Карты'],
  ['bao', 'snacks', YA + '4437246/2a00000178bb7160c6ee776564f0e23df337/orig', 'Бань бао в разрезе на фоне красной доски меню', 'Яндекс.Карты'],
  ['bao-rolls', 'snacks', YA + '14774583/2a00000198c2cd731350365f0d15c204af87/orig', 'Бань бао и спринг-ролл на плетёной тарелке', 'Яндекс.Карты'],
  ['tray', 'snacks', YA + '1551063/2a00000166f7daabd81c242c7c4e8c9841cf/orig', 'Фо, нэмы и соус на одном подносе', 'Яндекс.Карты'],
  ['juice', 'snacks', YA + '11368589/2a0000018c87081306d4ee88a2b6abdb4f99/orig', 'Две банки вьетнамского фруктового сока', 'Яндекс.Карты'],
  // people
  ['hostess', 'people', YA + '4465274/2a00000178bb76b0a483b8d0c730e93e5115/orig', 'Хозяйка стойки с бань бао в руке у красной доски меню', 'Яндекс.Карты'],
  ['kitchen', 'people', YA + '15112342/2a00000195f6f8a87c5c401d68f7fb80334a/orig', 'Кухня «Фошной» за работой под доской меню', 'Яндекс.Карты'],
  ['cook', 'people', YA + '21048456/2a000001a039e2a34ec0478fa5e1f4152d11/orig', 'Повар у кастрюль за стойкой', 'Яндекс.Карты'],
  // street
  ['night-facade', 'street', YA + '4012648/2a00000178bb5de17b7c78ce9bb4879e8f70/orig', 'Вход в «Фошную» вечером: розовый фонарь над дверью', 'Яндекс.Карты'],
  ['night-street', 'street', YA + '11400839/2a0000018c7bcf19a529ca5cf85348f904c4/orig', 'Профсоюзная улица ночью после дождя', 'Яндекс.Карты'],
  ['night-door', 'street', YA + '16329823/2a00000198bf0d5901533389503644625001/orig', 'Дверь «Фошной» в розовом свете фонаря', 'Яндекс.Карты'],
  ['day-facade', 'street', YA + '13287730/2a000001925e06b71db384b18f3857aebdea/orig', 'Жёлтый фасад «Фошной» и граффити на соседнем заборе', 'Яндекс.Карты'],
  ['bench', 'street', YA + '4120601/2a000001775a69ff209f3d23b4593431df52/orig', 'Скамейка и меню у входа солнечным днём', 'Яндекс.Карты'],
  ['winter-night', 'street', YA + '19803395/2a0000019b5a2b3ddb924921ed494fef0277/orig', 'Зимний вечер у «Фошной», снег и неон', 'Яндекс.Карты'],
];

const WIDTHS = [640, 1280, 1920];
const SRC = 'raw/src';
const OUT = 'public/photos';
const force = process.argv.includes('--force');
fs.mkdirSync(SRC, { recursive: true });

async function download(url, dest) {
  if (fs.existsSync(dest)) return true;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: url.includes('yandex') ? 'https://yandex.ru/' : '' } });
  if (!r.ok) { console.log('  ✗', r.status, url); return false; }
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
  return true;
}

const entries = [];
for (const [id, cat, url, alt, source] of PLAN) {
  const raw = path.join(SRC, `${cat}-${id}${path.extname(url.replace(/\/orig$/, '.jpg')) || '.jpg'}`);
  if (!(await download(url, raw))) continue;
  const dir = path.join(OUT, cat);
  fs.mkdirSync(dir, { recursive: true });
  // EXIF-поворот применяем до замеров
  const base = sharp(raw).rotate();
  const { data: oriented, info } = await base.toBuffer({ resolveWithObject: true });
  const widths = WIDTHS.filter((w) => w <= info.width);
  if (!widths.length || info.width > widths[widths.length - 1] * 1.15) widths.push(Math.min(info.width, 1920));
  const uniq = [...new Set(widths)];
  for (const w of uniq) {
    const dest = path.join(dir, `${id}-${w}.webp`);
    if (!force && fs.existsSync(dest)) continue;
    await sharp(oriented).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(dest);
  }
  const top = uniq[uniq.length - 1];
  const h = Math.round((info.height / info.width) * top);
  const { dominant } = await sharp(oriented).resize(64).stats();
  const color = '#' + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('');
  entries.push({ id, category: cat, src: `/photos/${cat}/${id}`, widths: uniq, width: top, height: h, alt, color, source });
  console.log('✓', `${cat}/${id}`, uniq.join('/'), `${top}×${h}`);
}

const ts = `// Сгенерировано scripts/fetch-photos.mjs — не править руками.
import { asset } from '@/lib/base';

export type PhotoCategory = 'hero' | 'pho' | 'counter' | 'interior' | 'snacks' | 'people' | 'street';
export type PhotoData = {
  id: string;
  category: PhotoCategory;
  /** путь без суффикса ширины: \`\${src}-\${w}.webp\` */
  src: string;
  widths: number[];
  width: number;
  height: number;
  alt: string;
  /** доминантный цвет — подложка, пока кадр грузится */
  color: string;
  source: string;
};

export const photos = ${JSON.stringify(entries, null, 2)} as const satisfies readonly PhotoData[];

export type PhotoId = (typeof photos)[number]['id'];

// пути с учётом basePath (GitHub Pages)
const byId = new Map<string, PhotoData>(photos.map((p) => [p.id, { ...p, src: asset(p.src) }]));
export function photo(id: PhotoId): PhotoData {
  return byId.get(id)!;
}
`;
fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/photos.ts', ts, 'utf8');
console.log(`\ndata/photos.ts — ${entries.length} фото`);
