import type { NextConfig } from 'next';

// GITHUB_PAGES=true — статический экспорт под https://purich755.github.io/Foshnaya/ (собирает GitHub Actions).
// Без переменной — обычная сборка Next (Vercel, локально).
const pages = process.env.GITHUB_PAGES === 'true';
// STATIC_EXPORT=true — тот же статический экспорт, но в корень домена (деплой папки out/ на любой хостинг)
const exportOnly = pages || process.env.STATIC_EXPORT === 'true';
const basePath = pages ? '/Foshnaya' : '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // в родительской папке лежит свой package-lock — фиксируем корень трассировки на проекте
  outputFileTracingRoot: process.cwd(),
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: pages ? 'https://purich755.github.io' : 'https://foshnaya.vercel.app',
  },
  ...(exportOnly
    ? { output: 'export' as const, trailingSlash: true }
    : {
        async headers() {
          return [{ source: '/photos/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }];
        },
      }),
};

export default nextConfig;
