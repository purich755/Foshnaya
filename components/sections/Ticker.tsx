'use client';
import { Fragment, useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { scrollState } from '@/lib/scroll';
import styles from './Ticker.module.css';

const WORDS: [string, string][] = [
  ['PHỞ BÒ', 'фо с говядиной'],
  ['CẢM ƠN', 'спасибо'],
  ['NGON QUÁ', 'очень вкусно'],
  ['CAY', 'остро'],
  ['KHÔNG CAY', 'не остро'],
  ['CHÚC NGON MIỆNG', 'приятного аппетита'],
  ['MỘT LÍT', 'один литр'],
];

function Row({ reverse, offset = 0 }: { reverse?: boolean; offset?: number }) {
  const items = [...WORDS.slice(offset), ...WORDS.slice(0, offset)];
  const run = (
    <>
      {items.map(([vi, ru]) => (
        <Fragment key={vi}>
          <span className={styles.item}>
            <span className={`f-viet ${styles.vi}`} lang="vi">
              {vi}
            </span>
            <span className={styles.ru}>— {ru}</span>
          </span>
          <span className={styles.diamond} aria-hidden="true" />
        </Fragment>
      ))}
    </>
  );
  return (
    <div className={styles.row} data-row data-reverse={reverse ? '' : undefined}>
      <div className={styles.track} data-track>
        <div className={styles.run}>{run}</div>
        <div className={styles.run} aria-hidden="true">
          {run}
        </div>
      </div>
    </div>
  );
}

/** Словарик у стойки: две встречные ленты, тормозят под курсором, ускоряются от скролла. */
export default function Ticker() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>('[data-row]'));
    const tweens = rows.map((row) => {
      const track = row.querySelector('[data-track]')!;
      const rev = row.hasAttribute('data-reverse');
      return gsap.fromTo(track, { xPercent: rev ? -50 : 0 }, { xPercent: rev ? 0 : -50, duration: 46, ease: 'none', repeat: -1 });
    });
    let hover = false;
    let base = 1;
    const onTick = () => {
      if (hover) return;
      const boost = Math.min(Math.abs(scrollState.velocity) * 0.09, 3.5);
      base += (1 + boost - base) * 0.08;
      tweens.forEach((t) => t.timeScale(base));
    };
    gsap.ticker.add(onTick);
    const enter = () => {
      hover = true;
      tweens.forEach((t) => gsap.to(t, { timeScale: 0, duration: 0.8, ease: 'power2.out', overwrite: true }));
    };
    const leave = () => {
      tweens.forEach((t) => gsap.to(t, { timeScale: 1, duration: 0.8, ease: 'power2.in', overwrite: true, onComplete: () => { hover = false; base = 1; } }));
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    // вне экрана не крутим
    const io = new IntersectionObserver(([e]) => tweens.forEach((t) => (e.isIntersecting ? t.resume() : t.pause())));
    io.observe(el);
    return () => {
      gsap.ticker.remove(onTick);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      io.disconnect();
      tweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={root} className={styles.ticker} role="region" aria-label="Словарик у стойки: вьетнамские слова с переводом">
      <Row />
      <Row reverse offset={3} />
    </div>
  );
}
