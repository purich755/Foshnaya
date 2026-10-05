// Изометрический план зала «Фошной». Схематично: 8 × 5 плиток = 40 плиток ≈ 14 м² (1 плитка ≈ 0,35 м²).
// Раскладка по фото зала: стойка с кухней — у дальней стены, узкая полка с соусами — вдоль левой,
// телевизор — высоко в углу над стойкой, вход и витрина — со стороны Профсоюзной.

export const W = 8;
export const D = 5;
export const H = 3.1;
const S = 46;
const C = Math.cos(Math.PI / 6);
const SN = 0.5;
const OX = 262;
const OY = 168;
export const VB = { w: 600, h: 500 };

const r2 = (n: number) => Math.round(n * 100) / 100;
export function P(x: number, y: number, z = 0): [number, number] {
  return [r2(OX + (x - y) * C * S), r2(OY + (x + y) * SN * S - z * S)];
}
const pts = (list: [number, number, number][]) => list.map(([x, y, z]) => P(x, y, z).join(',')).join(' ');

export type Poly = { points: string; fill: string; stroke?: string; sw?: number; opacity?: number };

/** плитки пола; diag — номер диагонали для раскладки «волной» */
export const tiles = Array.from({ length: W * D }, (_, k) => {
  const i = k % W;
  const j = Math.floor(k / W);
  return {
    key: k,
    diag: i + j,
    points: pts([
      [i, j, 0],
      [i + 1, j, 0],
      [i + 1, j + 1, 0],
      [i, j + 1, 0],
    ]),
    alt: (i + j) % 2 === 0,
  };
});

/** параллелепипед: три видимые грани (верх, левая-передняя, правая-передняя) */
function box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, top: string, left: string, right: string): Poly[] {
  return [
    { points: pts([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]), fill: left },
    { points: pts([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]), fill: right },
    { points: pts([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]), fill: top },
  ];
}

export const walls: Poly[] = [
  // дальняя правая стена (вдоль x)
  { points: pts([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]]), fill: '#BD7C3C' },
  // дальняя левая стена (вдоль y) — в тени
  { points: pts([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]]), fill: '#9E6431' },
];

/** вертикальные швы фанеры на стенах */
export const seams: string[] = [
  ...[1.6, 3.2, 4.8, 6.4].map((x) => `M${P(x, 0, 0).join(',')}L${P(x, 0, H).join(',')}`),
  ...[1.25, 2.5, 3.75].map((y) => `M${P(0, y, 0).join(',')}L${P(0, y, H).join(',')}`),
];

export type PlanObject = { id: string; polys: Poly[]; extra?: { d: string; stroke: string; sw: number; fill?: string }[] };

export const objects: PlanObject[] = [
  {
    // красная доска меню на дальней стене
    id: 'board',
    polys: [{ points: pts([[1.3, 0, 1.85], [5.6, 0, 1.85], [5.6, 0, 2.8], [1.3, 0, 2.8]]), fill: '#D3261C' }],
    extra: [
      // «меловые» строки меню
      ...[2.62, 2.42, 2.24, 2.07].map((z, n) => ({ d: `M${P(1.6, 0, z).join(',')}L${P(1.6 + [2.6, 1.9, 2.2, 1.4][n], 0, z).join(',')}`, stroke: 'rgba(244,234,218,.85)', sw: 1.6 })),
      ...[2.62, 2.42, 2.24, 2.07].map((z) => ({ d: `M${P(4.5, 0, z).join(',')}L${P(5.3, 0, z).join(',')}`, stroke: 'rgba(244,194,27,.9)', sw: 1.6 })),
    ],
  },
  {
    // голубая стойка
    id: 'counter',
    polys: box(1, 0, 0, 7.2, 1.25, 1.15, '#E8C79A', '#86BFC6', '#5E9EA6'),
    extra: [
      // панели обшивки
      ...[2, 3, 4, 5, 6].map((x) => ({ d: `M${P(x, 1.25, 0.08).join(',')}L${P(x, 1.25, 1.05).join(',')}`, stroke: 'rgba(43,29,20,.28)', sw: 1 })),
    ],
  },
  {
    // стопки стаканов на стойке
    id: 'cups',
    polys: [...box(5.6, 0.25, 1.15, 6.0, 0.65, 1.75, '#F4EADA', '#E9DCC6', '#CDBFA8'), ...box(6.2, 0.25, 1.15, 6.6, 0.65, 1.6, '#F4EADA', '#E9DCC6', '#CDBFA8')],
  },
  {
    // узкая полка вдоль левой стены
    id: 'ledge',
    polys: box(0, 1.6, 1.0, 0.55, 4.7, 1.14, '#E8C79A', '#B98B52', '#A67A45'),
  },
  {
    // соусы на полке
    id: 'sauces',
    polys: [
      ...box(0.12, 2.0, 1.14, 0.34, 2.22, 1.6, '#E0461F', '#D3261C', '#A3180F'),
      ...box(0.12, 2.4, 1.14, 0.34, 2.62, 1.52, '#3F7D4E', '#D3261C', '#A3180F'),
      ...box(0.12, 2.8, 1.14, 0.34, 3.02, 1.44, '#2B1D14', '#5a3a26', '#3c2618'),
      ...box(0.12, 3.25, 1.14, 0.34, 3.47, 1.58, '#F4C21B', '#E0461F', '#B23415'),
    ],
  },
  {
    // красный шкафчик с соусами на стене
    id: 'cabinet',
    polys: box(0, 3.2, 1.75, 0.35, 4.3, 2.55, '#E0461F', '#D3261C', '#A3180F'),
  },
  {
    // телевизор под потолком в углу
    id: 'tv',
    polys: box(6.5, 0, 2.3, 7.6, 0.75, 3.0, '#2a211a', '#352a21', '#1f1914'),
    extra: [],
  },
  {
    // колонка
    id: 'speaker',
    polys: box(0, 0.35, 2.45, 0.32, 0.85, 2.95, '#2a211a', '#352a21', '#1f1914'),
  },
];

/** экран телевизора — светится люминофором */
export const tvScreen = pts([
  [6.62, 0.75, 2.38],
  [7.48, 0.75, 2.38],
  [7.48, 0.75, 2.92],
  [6.62, 0.75, 2.92],
]);

/** фасад на Профсоюзную: витрина и открытая дверь (прозрачная передняя стена) */
export const facade = {
  glass: pts([[2.7, D, 0.15], [7.7, D, 0.15], [7.7, D, 2.6], [2.7, D, 2.6]]),
  frame: [3.95, 5.2, 6.45].map((x) => `M${P(x, D, 0.15).join(',')}L${P(x, D, 2.6).join(',')}`),
  door: pts([[0.7, D, 0], [2.2, D, 0], [2.2, D, 2.35], [0.7, D, 2.35]]),
  doorOpen: pts([[0.7, D, 0], [0.7, D + 1.2, 0], [0.7, D + 1.2, 2.35], [0.7, D, 2.35]]),
  sill: `M${P(0, D, 0).join(',')}L${P(W, D, 0).join(',')}L${P(W, 0, 0).join(',')}`,
};

export type Hotspot = { id: string; n: number; title: string; text: string; at: [number, number]; side: 'l' | 'r' };

const pct = ([x, y]: [number, number]): [number, number] => [r2((x / VB.w) * 100), r2((y / VB.h) * 100)];

export const hotspots: Hotspot[] = [
  { id: 'counter', n: 1, title: 'Стойка', text: 'Здесь заказывают, здесь же и едят. Сидячих мест нет — фо берут навынос или прямо у стойки.', at: pct(P(4.1, 1.25, 0.75)), side: 'r' },
  { id: 'sauces', n: 2, title: 'Соусы и добавки', text: 'Лук, чили, лимон, имбирь, мята, шрирача. Остроту каждый доводит сам.', at: pct(P(0.3, 2.9, 1.75)), side: 'r' },
  { id: 'tv', n: 3, title: 'Телевизор JVC', text: 'Вьетнамские клипы. Иногда — «Кунг Фьюри».', at: pct(P(7.05, 0.75, 2.65)), side: 'l' },
  { id: 'music', n: 4, title: 'Музыка', text: 'Вьетнамская поп-музыка. Без неё было бы не то.', at: pct(P(0.16, 0.6, 2.7)), side: 'r' },
  { id: 'window', n: 5, title: 'Окно на Профсоюзную', text: 'Отсюда до Баумана — пара минут с литром фо в руке.', at: pct(P(5.2, D, 1.45)), side: 'l' },
];
