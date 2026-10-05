// Сгенерировано scripts/fetch-photos.mjs — не править руками.
import { asset } from '@/lib/base';

export type PhotoCategory = 'hero' | 'pho' | 'counter' | 'interior' | 'snacks' | 'people' | 'street';
export type PhotoData = {
  id: string;
  category: PhotoCategory;
  /** путь без суффикса ширины: `${src}-${w}.webp` */
  src: string;
  widths: number[];
  width: number;
  height: number;
  alt: string;
  /** доминантный цвет — подложка, пока кадр грузится */
  color: string;
  source: string;
};

export const photos = [
  {
    "id": "pho-cup-dark",
    "category": "hero",
    "src": "/photos/hero/pho-cup-dark",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 1280,
    "alt": "Фо бо в крафтовом стакане навынос: зелень, красный лук, мята и лимон",
    "color": "#081818",
    "source": "Яндекс.Карты"
  },
  {
    "id": "pho-cup-studio",
    "category": "hero",
    "src": "/photos/hero/pho-cup-studio",
    "widths": [
      640,
      1230
    ],
    "width": 1230,
    "height": 827,
    "alt": "Фо бо в стакане с красной печатью «Фошной», рядом соусы в розетках",
    "color": "#180808",
    "source": "Restoclub"
  },
  {
    "id": "bowl-top",
    "category": "pho",
    "src": "/photos/pho/bowl-top",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 1921,
    "alt": "Фо бо сверху: говядина, красный лук, кинза и лимон",
    "color": "#281818",
    "source": "Яндекс.Карты"
  },
  {
    "id": "bowl-dark-top",
    "category": "pho",
    "src": "/photos/pho/bowl-dark-top",
    "widths": [
      640,
      960
    ],
    "width": 960,
    "height": 960,
    "alt": "Миска фо сверху: зелёный лук, лимон, чили и рисовая лапша",
    "color": "#080808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "bowl-chili",
    "category": "pho",
    "src": "/photos/pho/bowl-chili",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Фо с говядиной, чили и лимоном крупным планом",
    "color": "#081828",
    "source": "Яндекс.Карты"
  },
  {
    "id": "bowl-spoon",
    "category": "pho",
    "src": "/photos/pho/bowl-spoon",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2557,
    "alt": "Фо бо с ложкой на стойке, за ним шрирача",
    "color": "#f8f8f8",
    "source": "Яндекс.Карты"
  },
  {
    "id": "cup-stamp",
    "category": "pho",
    "src": "/photos/pho/cup-stamp",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Крафтовый стакан фо с красной печатью «Фошной»",
    "color": "#484848",
    "source": "Яндекс.Карты"
  },
  {
    "id": "cup-hand",
    "category": "pho",
    "src": "/photos/pho/cup-hand",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Стакан фо в руке у окна, палочки сверху",
    "color": "#f8f8f8",
    "source": "Яндекс.Карты"
  },
  {
    "id": "two-cups",
    "category": "pho",
    "src": "/photos/pho/two-cups",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2557,
    "alt": "Два стакана фо с палочками на деревянной стойке",
    "color": "#582818",
    "source": "Яндекс.Карты"
  },
  {
    "id": "cup-cans",
    "category": "pho",
    "src": "/photos/pho/cup-cans",
    "widths": [
      640,
      750
    ],
    "width": 750,
    "height": 1334,
    "alt": "Фо в стакане, палочки и банки фруктового сока",
    "color": "#783828",
    "source": "Яндекс.Карты"
  },
  {
    "id": "bowl-rolls",
    "category": "pho",
    "src": "/photos/pho/bowl-rolls",
    "widths": [
      640,
      1230
    ],
    "width": 1230,
    "height": 840,
    "alt": "Фо бо с говядиной, рядом соусы и плетёные тарелки",
    "color": "#281808",
    "source": "Restoclub"
  },
  {
    "id": "sauces",
    "category": "counter",
    "src": "/photos/counter/sauces",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Шрирача, соус чили и соевый соус на стойке",
    "color": "#783828",
    "source": "Яндекс.Карты"
  },
  {
    "id": "blue-counter",
    "category": "counter",
    "src": "/photos/counter/blue-counter",
    "widths": [
      640,
      956
    ],
    "width": 956,
    "height": 720,
    "alt": "Голубая стойка, красная доска меню и стопки стаканов",
    "color": "#88b8c8",
    "source": "Яндекс.Карты"
  },
  {
    "id": "board-queue",
    "category": "counter",
    "src": "/photos/counter/board-queue",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Гости у голубой стойки, над кухней — доска меню",
    "color": "#180808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "board-kitchen",
    "category": "counter",
    "src": "/photos/counter/board-kitchen",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 1440,
    "alt": "Доска меню мелом: Phở bò, Bánh bao, Spring roll, Nem, Juice",
    "color": "#482828",
    "source": "Яндекс.Карты"
  },
  {
    "id": "kitchen-red",
    "category": "counter",
    "src": "/photos/counter/kitchen-red",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Кухня за стойкой: кастрюли с бульоном под красной доской меню",
    "color": "#080808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "board-chalk",
    "category": "counter",
    "src": "/photos/counter/board-chalk",
    "widths": [
      640
    ],
    "width": 640,
    "height": 640,
    "alt": "Меню мелом на красной доске за листом пальмы",
    "color": "#080808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "wall-posters",
    "category": "interior",
    "src": "/photos/interior/wall-posters",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Узкая стойка вдоль стены с плакатами и соусами",
    "color": "#b88868",
    "source": "Яндекс.Карты"
  },
  {
    "id": "flag-shelf",
    "category": "interior",
    "src": "/photos/interior/flag-shelf",
    "widths": [
      576
    ],
    "width": 576,
    "height": 768,
    "alt": "Красный шкафчик с соусами под вьетнамским флажком",
    "color": "#180808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "shutters",
    "category": "interior",
    "src": "/photos/interior/shutters",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 1440,
    "alt": "Охристая стена с голубыми ставнями и узкой стойкой",
    "color": "#782818",
    "source": "Яндекс.Карты"
  },
  {
    "id": "counter-shelf",
    "category": "interior",
    "src": "/photos/interior/counter-shelf",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Полки со стаканами и красный шкафчик над стойкой",
    "color": "#180808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "lamps",
    "category": "interior",
    "src": "/photos/interior/lamps",
    "widths": [
      576
    ],
    "width": 576,
    "height": 768,
    "alt": "Плетёные лампы и пальма у окна",
    "color": "#583828",
    "source": "Яндекс.Карты"
  },
  {
    "id": "lamp-window",
    "category": "interior",
    "src": "/photos/interior/lamp-window",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Плетёная лампа у окна вечером",
    "color": "#080808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "jvc-2018",
    "category": "interior",
    "src": "/photos/interior/jvc-2018",
    "widths": [
      640,
      1200
    ],
    "width": 1200,
    "height": 700,
    "alt": "Старый телевизор JVC на жёлтом холодильнике",
    "color": "#080808",
    "source": "Enter, 2018"
  },
  {
    "id": "tv-corner-2018",
    "category": "interior",
    "src": "/photos/interior/tv-corner-2018",
    "widths": [
      640,
      1200
    ],
    "width": 1200,
    "height": 700,
    "alt": "Угол кухни: телевизор на жёлтом холодильнике и мятная стойка",
    "color": "#c8e8e8",
    "source": "Enter, 2018"
  },
  {
    "id": "cups-2018",
    "category": "interior",
    "src": "/photos/interior/cups-2018",
    "widths": [
      640,
      1200
    ],
    "width": 1200,
    "height": 700,
    "alt": "Стаканы с печатью «Фошной» и хризантемы у охристой стены",
    "color": "#e89878",
    "source": "Enter, 2018"
  },
  {
    "id": "spring-rolls",
    "category": "snacks",
    "src": "/photos/snacks/spring-rolls",
    "widths": [
      640,
      1120
    ],
    "width": 1120,
    "height": 1120,
    "alt": "Спринг-роллы с креветкой и манго в рисовой бумаге",
    "color": "#f8b808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "spring-rolls-red",
    "category": "snacks",
    "src": "/photos/snacks/spring-rolls-red",
    "widths": [
      640,
      1280
    ],
    "width": 1280,
    "height": 1280,
    "alt": "Спринг-роллы с креветками на красном столе",
    "color": "#880808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "nems",
    "category": "snacks",
    "src": "/photos/snacks/nems",
    "widths": [
      640,
      1230
    ],
    "width": 1230,
    "height": 821,
    "alt": "Нэмы — жареные роллы из рисовой бумаги с соусом",
    "color": "#d89888",
    "source": "Restoclub"
  },
  {
    "id": "nems-slate",
    "category": "snacks",
    "src": "/photos/snacks/nems-slate",
    "widths": [
      640,
      1280
    ],
    "width": 1280,
    "height": 964,
    "alt": "Жареные роллы на чёрной доске с чили и лимоном",
    "color": "#880808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "bao",
    "category": "snacks",
    "src": "/photos/snacks/bao",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Бань бао в разрезе на фоне красной доски меню",
    "color": "#68c8f8",
    "source": "Яндекс.Карты"
  },
  {
    "id": "bao-rolls",
    "category": "snacks",
    "src": "/photos/snacks/bao-rolls",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Бань бао и спринг-ролл на плетёной тарелке",
    "color": "#d8c8b8",
    "source": "Яндекс.Карты"
  },
  {
    "id": "tray",
    "category": "snacks",
    "src": "/photos/snacks/tray",
    "widths": [
      640,
      1258
    ],
    "width": 1258,
    "height": 839,
    "alt": "Фо, нэмы и соус на одном подносе",
    "color": "#a87818",
    "source": "Яндекс.Карты"
  },
  {
    "id": "juice",
    "category": "snacks",
    "src": "/photos/snacks/juice",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Две банки вьетнамского фруктового сока",
    "color": "#080808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "hostess",
    "category": "people",
    "src": "/photos/people/hostess",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Хозяйка стойки с бань бао в руке у красной доски меню",
    "color": "#080808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "kitchen",
    "category": "people",
    "src": "/photos/people/kitchen",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Кухня «Фошной» за работой под доской меню",
    "color": "#080808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "cook",
    "category": "people",
    "src": "/photos/people/cook",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 3413,
    "alt": "Повар у кастрюль за стойкой",
    "color": "#080808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "night-facade",
    "category": "street",
    "src": "/photos/street/night-facade",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Вход в «Фошную» вечером: розовый фонарь над дверью",
    "color": "#080808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "night-street",
    "category": "street",
    "src": "/photos/street/night-street",
    "widths": [
      640,
      828
    ],
    "width": 828,
    "height": 1034,
    "alt": "Профсоюзная улица ночью после дождя",
    "color": "#180808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "night-door",
    "category": "street",
    "src": "/photos/street/night-door",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Дверь «Фошной» в розовом свете фонаря",
    "color": "#080808",
    "source": "Яндекс.Карты"
  },
  {
    "id": "day-facade",
    "category": "street",
    "src": "/photos/street/day-facade",
    "widths": [
      640,
      1277
    ],
    "width": 1277,
    "height": 720,
    "alt": "Жёлтый фасад «Фошной» и граффити на соседнем заборе",
    "color": "#d8b888",
    "source": "Яндекс.Карты"
  },
  {
    "id": "bench",
    "category": "street",
    "src": "/photos/street/bench",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 1440,
    "alt": "Скамейка и меню у входа солнечным днём",
    "color": "#b8f8f8",
    "source": "Яндекс.Карты"
  },
  {
    "id": "winter-night",
    "category": "street",
    "src": "/photos/street/winter-night",
    "widths": [
      640,
      1280,
      1920
    ],
    "width": 1920,
    "height": 2560,
    "alt": "Зимний вечер у «Фошной», снег и неон",
    "color": "#383838",
    "source": "Яндекс.Карты"
  }
] as const satisfies readonly PhotoData[];

export type PhotoId = (typeof photos)[number]['id'];

// пути с учётом basePath (GitHub Pages)
const byId = new Map<string, PhotoData>(photos.map((p) => [p.id, { ...p, src: asset(p.src) }]));
export function photo(id: PhotoId): PhotoData {
  return byId.get(id)!;
}
