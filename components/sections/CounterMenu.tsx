'use client';
import { useEffect, useRef } from 'react';
import Photo from '@/components/ui/Photo';
import SignFlicker from '@/components/fx/SignFlicker';
import TileGrid from '@/components/fx/TileGrid';
import PaperTag from '@/components/fx/PaperTag';
import { PRICE_NOTE, snacks } from '@/data/menu';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import styles from './CounterMenu.module.css';

const TILT = [-4, 3, -6, 5, -2];

export default function CounterMenu() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-card]');
    const ctx = gsap.context(() => {
      gsap.set(cards, { y: -120, opacity: 0, rotate: (i) => TILT[i] * 3 });
      ScrollTrigger.create({
        trigger: el.querySelector('[data-wall]'),
        start: 'top 78%',
        once: true,
        onEnter: () => gsap.to(cards, { y: 0, opacity: 1, rotate: 0, duration: 0.9, stagger: 0.09, ease: 'back.out(1.6)', clearProps: 'transform' }),
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="menu" ref={root} className={`${styles.section} cv`} aria-labelledby="menu-title">
      <TileGrid size={58} color="var(--ochre-d)" opacity={0.4} />
      <div className={`wrap ${styles.inner}`}>
        <header className={styles.head}>
          <SignFlicker as="h2" id="menu-title" className={styles.sign}>
            Ещё со стойки
          </SignFlicker>
          <p data-reveal className={styles.lead}>
            Меню умещается на одном листе. Пока вам наливают фо — вот что берут к нему.
          </p>
        </header>

        <ul className={styles.wall} data-wall>
          {snacks.map((s, i) => (
            <li key={s.id} className={`${styles.card} ${styles[`c${i}`]}`} data-card>
              <div className={styles.peel} style={{ '--t': `${TILT[i]}deg` } as React.CSSProperties}>
                {s.photo ? (
                  <div className={styles.frame}>
                    <Photo id={s.photo} sizes="(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 78vw" className={styles.img} view />
                  </div>
                ) : (
                  <div className={`${styles.frame} ${styles.typo}`} aria-hidden="true">
                    <span className={styles.typoKicker}>тигровые креветки</span>
                    <span className={styles.typoWord}>Том</span>
                    <span className={styles.typoWord}>Чьен</span>
                    <span className={styles.typoNote}>в панировке · с фирменным соусом</span>
                  </div>
                )}
                <PaperTag index={i + 3} className={styles.tag}>
                  <span className={styles.name}>
                    {s.name}
                    {s.viet && (
                      <span className={`f-viet ${styles.vi}`} lang="vi">
                        {' '}
                        {s.viet}
                      </span>
                    )}
                  </span>
                  <span className={styles.text}>{s.text}</span>
                  <span className={styles.row}>
                    {s.weight && <span className="f-mono">{s.weight}</span>}
                    <span className={styles.price}>{s.price ? `${s.price} ₽` : 'цена у стойки'}</span>
                  </span>
                  {s.hand && <span className={`f-hand ${styles.hand}`}>{s.hand}</span>}
                </PaperTag>
              </div>
            </li>
          ))}
        </ul>
        <p className={styles.fine}>{PRICE_NOTE}</p>
      </div>
    </section>
  );
}
