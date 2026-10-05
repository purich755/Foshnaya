import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Caveat, Geologica, IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { HOURS, venue } from '@/data/venue';
import { asset, BASE } from '@/lib/base';
import './globals.css';

// Шрифты без preload: картинка hero не делит с ними канал, а вёрстка первого экрана от подмены шрифта не прыгает.
// Dela Gothic One — свой сабсет (латиница + кириллица): 15 КБ вместо ~90 КБ гугловских подмножеств
const sign = localFont({ src: './fonts/DelaGothicOne-subset.woff2', weight: '400', variable: '--f-sign', display: 'swap', adjustFontFallback: 'Arial', preload: false });
const text = Geologica({ weight: ['400', '600'], subsets: ['latin', 'cyrillic'], variable: '--f-text', display: 'swap', preload: false });
const mono = IBM_Plex_Mono({ weight: ['500'], subsets: ['latin', 'cyrillic'], variable: '--f-mono', display: 'swap', preload: false });
const viet = Be_Vietnam_Pro({ weight: ['700'], subsets: ['latin', 'vietnamese'], variable: '--f-viet', display: 'swap', preload: false });
const hand = Caveat({ weight: ['400'], subsets: ['latin', 'cyrillic'], variable: '--f-hand', display: 'swap', preload: false });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://foshnaya.vercel.app';
const TITLE = 'Фошная — вьетнамский фо навынос в Казани, Профсоюзная 26';
const DESCRIPTION =
  'Литр фо бо на крепком говяжьем бульоне, спринг-роллы, нэмы и бань бао. Крошечная вьетнамская закусочная в 14 м² у улицы Баумана. Ежедневно 12:00–23:00.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  // демо-версия для показа владельцу — не индексируем
  robots: { index: false, follow: false },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'ru_RU',
    images: [{ url: asset('/photos/hero/pho-cup-dark-1280.webp'), width: 1280, height: 853, alt: 'Фо бо в крафтовом стакане навынос' }],
  },
  icons: { icon: asset('/icon.svg') },
};

export const viewport: Viewport = {
  themeColor: '#15110e',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: venue.name,
  servesCuisine: 'Vietnamese',
  telephone: venue.phone,
  priceRange: '300–750 ₽',
  url: `${SITE}${BASE}/`,
  image: `${SITE}${asset('/photos/hero/pho-cup-dark-1280.webp')}`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Профсоюзная ул., 26',
    addressLocality: venue.city,
    postalCode: venue.postal,
    addressCountry: 'RU',
  },
  geo: { '@type': 'GeoCoordinates', latitude: venue.geo.lat, longitude: venue.geo.lon },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: HOURS.open,
      closes: HOURS.close,
    },
  ],
  sameAs: [venue.vk],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* до гидратации: включаем стартовые состояния reveal только при живом JS */}
        <script
          dangerouslySetInnerHTML={{
            // data-js — стартовые состояния reveal; data-fonts — декоративные шрифты (Caveat, Be Vietnam Pro) только после load
            __html:
              "document.documentElement.setAttribute('data-js','');addEventListener('load',function(){setTimeout(function(){document.documentElement.setAttribute('data-fonts','')},150)})",
          }}
        />
        <link rel="preload" as="image" type="image/webp" href={asset('/photos/hero/pho-cup-dark-1280.webp')} imageSrcSet={[640, 1280, 1920].map((w) => asset(`/photos/hero/pho-cup-dark-${w}.webp`) + ` ${w}w`).join(', ')} imageSizes="100vw" fetchPriority="high" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${sign.variable} ${text.variable} ${mono.variable} ${viet.variable} ${hand.variable}`}>{children}</body>
    </html>
  );
}
