// Добавки на стойке (Афиша, 2018 — состав уточнить у клиента).
// heat — сколько «перчиков» добавляет на шкале остроты.

export type ToppingId = 'onion' | 'chili' | 'lemon' | 'ginger' | 'mint' | 'vinegar' | 'sriracha' | 'sate';

export type Topping = { id: ToppingId; ru: string; vi: string; heat: number; color: string };

export const toppings: Topping[] = [
  { id: 'onion', ru: 'Красный лук', vi: 'hành tím', heat: 0, color: '#B4508A' },
  { id: 'chili', ru: 'Чили', vi: 'ớt', heat: 1, color: '#D3261C' },
  { id: 'lemon', ru: 'Лимон', vi: 'chanh', heat: 0, color: '#F4C21B' },
  { id: 'ginger', ru: 'Имбирь', vi: 'gừng', heat: 0, color: '#E2B676' },
  { id: 'mint', ru: 'Мята', vi: 'bạc hà', heat: 0, color: '#4E9A5C' },
  { id: 'vinegar', ru: 'Уксус', vi: 'giấm', heat: 0, color: '#C9D8D0' },
  { id: 'sriracha', ru: 'Шрирача', vi: 'tương ớt', heat: 1, color: '#E0461F' },
  { id: 'sate', ru: 'Острый соус', vi: 'sa tế', heat: 2, color: '#A3180F' },
];

export const MAX_HEAT = 5;

export function heatLabel(level: number): string {
  if (level <= 0) return 'Классика. Бабушка одобряет';
  if (level <= 2) return 'Чуть бодрее';
  if (level === 3) return 'Уже по-ханойски';
  if (level === 4) return 'Держите салфетку';
  return 'CAY QUÁ! Вы смелый человек';
}
