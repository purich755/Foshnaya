// Меню доставки с Яндекс.Карт (источник — Яндекс Еда, обновлено 02.10.2026).
// Нэмы и бань бао в меню доставки без цены — на сайте тоже без цены.
import type { PhotoId } from './photos';

export type PhoSize = { grams: number; label: string; price: number; note?: string };

export const PHO_DESCRIPTION = 'Традиционный вьетнамский суп с рисовой лапшой на крепком говяжьем бульоне.';

export const phoSizes: PhoSize[] = [
  { grams: 500, label: '500 г', price: 550 },
  { grams: 700, label: '700 г', price: 650 },
  { grams: 1000, label: '1000 г', price: 750, note: 'тот самый литр' },
];

export type Snack = {
  id: string;
  name: string;
  viet?: string;
  weight?: string;
  price?: number;
  text: string;
  photo?: PhotoId;
  hand?: string;
};

export const snacks: Snack[] = [
  { id: 'rolls', name: 'Спринг-роллы, 2 шт', viet: 'Gỏi cuốn', weight: '180 г', price: 400, text: 'Рисовая бумага, креветка, манго', photo: 'spring-rolls' },
  { id: 'shrimp', name: 'Креветки «Том Чьен»', weight: '100 г', price: 450, text: 'Тигровые креветки в панировке с фирменным соусом' },
  { id: 'nem', name: 'Нэмы', viet: 'Nem rán', text: 'Жареные роллы из рисовой бумаги', photo: 'nems' },
  { id: 'bao', name: 'Бань бао', viet: 'Bánh bao', text: 'Паровые булочки с курицей', photo: 'bao', hand: 'бывают не всегда — спросите!' },
  { id: 'juice', name: 'Вьетнамский фруктовый сок', weight: '330 мл', price: 200, text: 'В банке. Чтобы было чем запить шрирачу', photo: 'juice' },
];

export const PRICE_NOTE = 'Цены по меню доставки. Наличие и стоимость в зале уточняйте у стойки.';
