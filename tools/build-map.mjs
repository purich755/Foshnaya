// Схема района для блока «Профсоюзная, 26»: проецирует улицы OSM и пеший маршрут в SVG-координаты.
//   node tools/build-map.mjs  → data/map.json
// Источники: raw/osm.json, raw/osm-water.json (Overpass), raw/route.json (routing.openstreetmap.de, foot).
import fs from 'node:fs';

const W = 800, H = 600;
const BB = { w: 49.1066, e: 49.1276, s: 55.7848, n: 55.7948 };
const k = Math.cos((55.79 * Math.PI) / 180);
const sx = W / ((BB.e - BB.w) * k);
const sy = H / (BB.n - BB.s);
const s = Math.min(sx, sy);
const ox = (W - (BB.e - BB.w) * k * s) / 2;
const oy = (H - (BB.n - BB.s) * s) / 2;
const P = (lon, lat) => [+(ox + (lon - BB.w) * k * s).toFixed(1), +(oy + (BB.n - lat) * s).toFixed(1)];

const osm = JSON.parse(fs.readFileSync('raw/osm.json', 'utf8'));
const water = JSON.parse(fs.readFileSync('raw/osm-water.json', 'utf8'));
const route = JSON.parse(fs.readFileSync('raw/route.json', 'utf8')).routes[0];

const MAJOR = {
  'улица Баумана': 'Баумана',
  'Профсоюзная улица': 'Профсоюзная',
  'улица Пушкина': 'Пушкина',
  'Петербургская улица': 'Петербургская',
  'Кремлёвская улица': 'Кремлёвская',
  'улица Чернышевского': 'Чернышевского',
  'Право-Булачная улица': 'Право-Булачная',
  'улица Островского': 'Островского',
  'Московская улица': 'Московская',
};
const SKIP = /footway|path|steps|service|cycleway|pedestrian_area|track|corridor/;

const segs = [];
for (const e of osm.elements) {
  if (!e.tags?.highway || !e.geometry || SKIP.test(e.tags.highway)) continue;
  const pts = e.geometry.map((g) => P(g.lon, g.lat));
  if (pts.every(([x, y]) => x < -40 || x > W + 40 || y < -40 || y > H + 40)) continue;
  segs.push({ name: e.tags.name, hw: e.tags.highway, pts });
}
const toD = (pts) => 'M' + pts.map(([x, y]) => `${x} ${y}`).join('L');
const len = (pts) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

// склеиваем сегменты одной улицы в длинные цепочки (концы совпадают)
function chains(list) {
  const out = list.map((x) => x.pts.slice());
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < out.length && !merged; i++) for (let j = 0; j < out.length && !merged; j++) {
      if (i === j) continue;
      const a = out[i], b = out[j];
      const eq = (p, q) => Math.abs(p[0] - q[0]) < 0.6 && Math.abs(p[1] - q[1]) < 0.6;
      let c = null;
      if (eq(a[a.length - 1], b[0])) c = a.concat(b.slice(1));
      else if (eq(a[a.length - 1], b[b.length - 1])) c = a.concat(b.slice().reverse().slice(1));
      else if (eq(a[0], b[b.length - 1])) c = b.concat(a.slice(1));
      else if (eq(a[0], b[0])) c = b.slice().reverse().concat(a.slice(1));
      if (c) { out[i] = c; out.splice(j, 1); merged = true; }
    }
  }
  return out;
}

const minor = [];
const major = [];
const byName = new Map();
for (const sg of segs) {
  if (MAJOR[sg.name]) { if (!byName.has(sg.name)) byName.set(sg.name, []); byName.get(sg.name).push(sg); }
  else minor.push(toD(sg.pts));
}
for (const [name, list] of byName) {
  const cs = chains(list);
  const best = cs.slice().sort((a, b) => len(b) - len(a))[0];
  // подпись читается слева направо
  const label = best[0][0] <= best[best.length - 1][0] ? best : best.slice().reverse();
  major.push({
    id: 'st-' + MAJOR[name].toLowerCase().replace(/[^a-zа-яё]/gi, ''),
    name: MAJOR[name],
    pedestrian: list.some((x) => x.hw === 'pedestrian'),
    d: cs.map(toD).join(''),
    label: toD(label),
  });
}
const bulak = water.elements.filter((e) => e.tags?.waterway && e.geometry).map((e) => toD(e.geometry.map((g) => P(g.lon, g.lat))));
const metroEntrances = water.elements.filter((e) => e.tags?.railway === 'subway_entrance').map((e) => P(e.lon, e.lat));
const routePts = route.geometry.coordinates.map(([lon, lat]) => P(lon, lat));

const out = {
  w: W, h: H,
  minor, major, bulak,
  route: toD(routePts),
  routeMeters: Math.round(route.distance),
  routeMinutes: Math.round(route.duration / 60),
  venue: P(49.116559, 55.791026),
  metro: P(49.121843, 55.787455),
  metroEntrances,
};
fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/map.json', JSON.stringify(out));
console.log('✓ data/map.json', (JSON.stringify(out).length / 1024).toFixed(1) + 'КБ', 'minor', minor.length, 'major', major.map((m) => m.name).join(','), 'venue', out.venue, 'metro', out.metro);
