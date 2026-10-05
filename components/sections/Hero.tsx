'use client';
import { useEffect, useRef } from 'react';
import Photo from '@/components/ui/Photo';
import Steam from '@/components/fx/Steam';
import SignFlicker from '@/components/fx/SignFlicker';
import PaperTag from '@/components/fx/PaperTag';
import OpenStatus from '@/components/fx/OpenStatus';
import { venue } from '@/data/venue';
import { gsap, prefersReduced } from '@/lib/gsap';
import styles from './Hero.module.css';

const WORD = 'Фошная'.toUpperCase().split('');

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const ctx = gsap.context(() => {
      const chars = el.querySelectorAll('[data-char]');
      gsap.set(chars, { y: 0, yPercent: 112 });
      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(chars, { yPercent: 0, duration: 1.1, stagger: 0.06, ease: 'power4.out' })
        .fromTo('[data-line]', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' }, 0.25)
        .fromTo('[data-fade]', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07 }, 0.55)
        .fromTo('[data-sticker]', { rotate: -9, y: -10 }, { rotate: 0, y: 0, duration: 0.7, ease: 'back.out(2.4)' }, 0.35);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="top" ref={root} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.bg}>
        <Photo id="pho-cup-dark" sizes="100vw" priority className={styles.photo} pos="50% 30%" />
        <div className={styles.shade} />
      </div>

      <SignFlicker className={styles.vsign} vertical>
        <span className="f-viet">PHỞ BÒ</span>
        <span className={styles.since}>С 2018</span>
      </SignFlicker>

      <div className={styles.sticker} data-sticker>
        <PaperTag rotate={-4} className={styles.tag}>
          <span className={styles.tagLabel}>Сейчас у стойки</span>
          <OpenStatus />
        </PaperTag>
      </div>

      <div className={`wrap ${styles.content}`}>
        <div className={styles.row}>
          <h1 id="hero-title" className={styles.title}>
            <span className="sr-only">Фошная — </span>
            <span data-line className={styles.line}>
              Литр фо.
            </span>
            <span data-line className={styles.line}>
              Навынос.
            </span>
          </h1>
          <div className={styles.lead}>
            <p data-fade>
              Вьетнамский суп на крепком говяжьем бульоне. Первая в Казани закусочная с вьетнамской монокухней — 14 квадратных метров на Профсоюзной, в паре
              шагов от Баумана.
            </p>
            <div className={styles.actions} data-fade>
              <a href="#route" className="btn">
                Как дойти <span className="arr">→</span>
              </a>
              <a href={venue.phoneHref} className="btn btn--ghost">
                Позвонить
              </a>
            </div>
          </div>
        </div>

        <div className={styles.wordBox} aria-hidden="true">
          <span className={styles.word}>
            {WORD.map((c, i) => (
              <span key={i} className={styles.mask}>
                <span data-char className={styles.char}>
                  {c}
                </span>
              </span>
            ))}
          </span>
        </div>

        <ul className={styles.meta} data-fade>
          <li>Профсоюзная 26</li>
          <li>м. Площадь Тукая · 610 м</li>
          <li>12:00 — 23:00</li>
          <li>Казань</li>
        </ul>
      </div>

      <Steam className={styles.steam} density={0.9} intro={1.5} />
    </section>
  );
}
