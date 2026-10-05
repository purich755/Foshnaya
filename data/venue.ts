// Проверенные факты о «Фошной». Источники: Яндекс.Карты (карточка, 10.2026), VK, Афиша, Restoclub, Enter (2018).
// Часы — константой: если клиент уточнит, правится только здесь.

export const HOURS = {
  open: '12:00',
  close: '23:00',
  /** минуты от полуночи по Europe/Moscow (Казань = UTC+3) */
  openMin: 12 * 60,
  closeMin: 23 * 60,
  /** с этого момента — «закрываемся, успевайте» */
  closingSoonMin: 22 * 60 + 30,
} as const;

export const venue = {
  name: 'Фошная',
  latin: 'phoshnaya',
  tagline: 'первая закусочная в Казани с моно-кухней вьетнамской кухни',
  street: 'ул. Профсоюзная, 26',
  streetShort: 'Профсоюзная, 26',
  city: 'Казань',
  district: 'Вахитовский район',
  postal: '420111',
  phone: '+7 (987) 187-81-12',
  phoneHref: 'tel:+79871878112',
  vk: 'https://vk.ru/phoshnaya',
  vkLabel: 'vk.ru/phoshnaya',
  yandex: 'https://yandex.ru/maps/org/foshnaya/125898877343/',
  /** пеший маршрут до точки в Яндекс.Картах — от текущего местоположения */
  routeUrl: 'https://yandex.ru/maps/?rtext=~55.791026%2C49.116559&rtt=pd',
  geo: { lat: 55.791026, lon: 49.116559 },
  metro: 'Площадь Тукая',
  metroMeters: 610,
  walkMinutes: 8,
  since: 2018,
  area: 14,
  payment: 'Карта, наличные, СБП, QR-код',
} as const;
