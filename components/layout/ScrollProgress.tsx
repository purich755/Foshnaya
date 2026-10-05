'use client';
import { useEffect, useRef } from 'react';

/** 2px куркумы по верху экрана. Высота документа кэшируется, в кадре читается только scrollY. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let max = 1;
    let raf = 0;
    const measure = () => (max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    const draw = () => {
      raf = 0;
      if (ref.current) ref.current.style.transform = `scaleX(${Math.min(1, window.scrollY / max)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    measure();
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', left: 0, top: 0, right: 0, height: 2, zIndex: 120, background: 'var(--turmeric)', transformOrigin: '0 50%', transform: 'scaleX(0)', pointerEvents: 'none' }}
    />
  );
}
