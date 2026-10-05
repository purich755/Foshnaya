'use client';
import { useEffect, useRef } from 'react';
import styles from './Cursor.module.css';

/** Кружок цвета бульона с инерцией. Только для точного указателя. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.setAttribute('data-cursor-on', '');
    const pos = { x: -100, y: -100 };
    const cur = { x: -100, y: -100 };
    let raf = 0;
    let mode = '';
    const setMode = (m: string) => {
      if (m === mode) return;
      mode = m;
      el.dataset.mode = m;
    };
    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const t = e.target as HTMLElement;
      if (t.closest('[data-cursor="view"]')) setMode('view');
      else if (t.closest('a, button, [role="radio"], summary, [data-cursor="hit"]')) setMode('hit');
      else if (t.closest('[data-cursor="grab"]')) setMode('grab');
      else setMode('');
    };
    const onLeave = () => setMode('out');
    const loop = () => {
      const k = reduce ? 1 : 0.22;
      cur.x += (pos.x - cur.x) * k;
      cur.y += (pos.y - cur.y) * k;
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.removeAttribute('data-cursor-on');
    };
  }, []);
  return (
    <div ref={ref} className={styles.cursor} aria-hidden="true">
      <span className={styles.dot}>
        <span className={styles.label}>Смотреть</span>
      </span>
    </div>
  );
}
