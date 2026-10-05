'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { scrollState, scrollToTarget } from '@/lib/scroll';
import { whenAllHydrated } from '@/components/ui/HydrateLater';

/**
 * Lenis + ScrollTrigger + якоря + reveal.
 * На тач-устройствах и при prefers-reduced-motion — нативный скролл.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let lenis: Lenis | undefined;
    let tick: ((t: number) => void) | undefined;

    if (!reduce && !coarse) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', (e: Lenis) => {
        scrollState.velocity = e.velocity;
        ScrollTrigger.update();
      });
      tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // скорость для нативного скролла
    let lastY = window.scrollY;
    let velRaf = 0;
    const measure = () => {
      if (!lenis) {
        const y = window.scrollY;
        scrollState.velocity = scrollState.velocity * 0.8 + (y - lastY) * 0.2;
        lastY = y;
      }
      velRaf = requestAnimationFrame(measure);
    };
    velRaf = requestAnimationFrame(measure);

    // якоря
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const hash = a.getAttribute('href')!;
      if (hash === '#') return;
      const target = hash === '#top' ? document.body : document.querySelector<HTMLElement>(hash);
      if (!target) return;
      e.preventDefault();
      if (hash === '#top') {
        if (lenis) lenis.scrollTo(0, { duration: 1.3 });
        else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      } else {
        scrollToTarget(target, hash === '#space' ? 0 : -64);
      }
      history.replaceState(null, '', hash);
    };
    document.addEventListener('click', onClick);

    // reveal: пачка элементов, вошедших одновременно, появляется лесенкой по 80 мс
    const io = new IntersectionObserver(
      (entries) => {
        const entering =entries.filter((en) => en.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        entering.forEach((en, i) => {
          const el = en.target as HTMLElement;
          el.style.setProperty('--rd', `${Math.min(i, 6) * 80}ms`);
          el.classList.add('is-in');
          io.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -4% 0px' },
    );
    // классы reveal ставим только после гидратации отложенных секций — иначе React увидит чужие классы
    let alive = true;
    whenAllHydrated().then(() => alive && document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el)));

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    // content-visibility: реальные высоты секций становятся известны по мере прокрутки — пересчитываем триггеры
    let roT = 0;
    let lastH = 0;
    const ro = new ResizeObserver(([e]) => {
      const h = Math.round(e.contentRect.height);
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      window.clearTimeout(roT);
      roT = window.setTimeout(refresh, 180);
    });
    const main = document.getElementById('main');
    if (main) ro.observe(main);
    // пины отложенных секций создаются позже — пересчитать позиции, когда все на месте
    whenAllHydrated().then(() => alive && requestAnimationFrame(refresh));

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('load', refresh);
      cancelAnimationFrame(velRaf);
      alive = false;
      ro.disconnect();
      window.clearTimeout(roT);
      io.disconnect();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      window.__lenis = undefined;
    };
  }, []);
  return null;
}
