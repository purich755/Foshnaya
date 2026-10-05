'use client';
import { useEffect, useRef } from 'react';
import Steam from '@/components/fx/Steam';
import { venue } from '@/data/venue';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import styles from './Finale.module.css';

const L1 = 'Приходите'.toUpperCase().split('');
const L2 = 'голодными'.toUpperCase().split('');

export default function Finale() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const ctx = gsap.context(() => {
      const chars = el.querySelectorAll('[data-char]');
      gsap.set(chars, { y: 0, yPercent: 112 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        once: true,
        onEnter: () => gsap.to(chars, { yPercent: 0, duration: 1, stagger: 0.035, ease: 'power4.out' }),
      });
      gsap.fromTo('[data-bgword]', { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  const line = (arr: string[], k: string) => (
    <span className={styles.line}>
      {arr.map((c, i) => (
        <span key={k + i} className={styles.mask}>
          <span data-char className={styles.char}>
            {c}
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <section id="finale" ref={root} className={`${styles.section} cv`} aria-labelledby="finale-title">
      <div className={styles.bgWord} aria-hidden="true">
        <span data-bgword className="f-viet" lang="vi">
          CHÚC NGON MIỆNG
        </span>
      </div>
      <div className={`wrap ${styles.inner}`}>
        <h2 id="finale-title" className={styles.title} aria-label="Приходите голодными">
          <span aria-hidden="true">
            {line(L1, 'a')}
            {line(L2, 'b')}
          </span>
        </h2>
        <p className={styles.text} data-reveal>
          Литр фо ждёт на Профсоюзной, 26. Каждый день с 12:00 до 23:00.
        </p>
        <div className={styles.actions} data-reveal>
          <a className="btn" href="#route">
            Как дойти <span className="arr">→</span>
          </a>
          <a className="btn btn--ghost" href={venue.phoneHref}>
            Позвонить
          </a>
          <a className="btn btn--ghost" href={venue.vk} target="_blank" rel="noopener noreferrer">
            Мы ВКонтакте
          </a>
        </div>
      </div>
      <Steam density={1} intro={0} />
    </section>
  );
}
