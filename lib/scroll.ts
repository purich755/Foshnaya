'use client';
import type Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** общая скорость скролла (px/кадр), пишет SmoothScroll — читают бегущие строки */
export const scrollState = { velocity: 0 };

/**
 * Плавный переход к якорю: через Lenis, если он включён, иначе нативно.
 * Секции с content-visibility узнают реальную высоту только при отрисовке,
 * поэтому после доезда сверяемся с целью и, если промахнулись, доезжаем ещё раз.
 */
export function scrollToTarget(target: string | HTMLElement, offset = -72) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const lenis = window.__lenis;
  const want = -offset; // где должен оказаться верх секции
  if (lenis) {
    // Lenis сам учитывает scroll-margin-top секций (64px) — компенсируем, чтобы не удвоить
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    let tries = 0;
    const go = (duration: number) =>
      lenis.scrollTo(el, {
        offset: offset + margin,
        duration,
        onComplete: () => {
          if (++tries < 3 && Math.abs(el.getBoundingClientRect().top - want) > 4) go(0.45);
        },
      });
    go(1.3);
  } else {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tries = 0;
    const go = () => {
      const y = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    };
    const check = () => {
      if (++tries < 3 && Math.abs(el.getBoundingClientRect().top - want) > 4) {
        go();
        window.addEventListener('scrollend', check, { once: true });
      }
    };
    go();
    window.addEventListener('scrollend', check, { once: true });
  }
}

export function lockScroll(lock: boolean) {
  const lenis = window.__lenis;
  if (lenis) lock ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}
