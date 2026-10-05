'use client';
import { useEffect, useRef } from 'react';
import Photo from '@/components/ui/Photo';
import PaperTag from '@/components/fx/PaperTag';
import { quotes } from '@/data/reviews';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import styles from './Hostess.module.css';

export default function Hostess() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const ctx = gsap.context(() => {
      const img = el.querySelector(`.${styles.photo}`);
      const tags = el.querySelectorAll('[data-sticky]');
      gsap.set(img, { filter: 'brightness(1.8) sepia(0.3)', scale: 1.04 });
      gsap.set(tags, { scale: 1.25, opacity: 0, rotate: -10 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          gsap.to(img, { filter: 'brightness(1) sepia(0)', scale: 1, duration: 1.2, ease: 'power2.out', clearProps: 'filter' });
          gsap.to(tags, { scale: 1, opacity: 1, rotate: 0, duration: 0.6, stagger: 0.25, delay: 0.7, ease: 'back.out(2)' });
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className={`${styles.section} cv`} aria-labelledby="hostess-title">
      <div className={`wrap ${styles.grid}`}>
        <figure className={styles.photoCol}>
          <div className={styles.photoBox}>
            <Photo id="hostess" sizes="(min-width: 900px) 42vw, 92vw" className={styles.photo} pos="50% 40%" view />
          </div>
          <figcaption className={styles.cap}>За стойкой — с бань бао в руке.</figcaption>
        </figure>

        <div className={styles.text}>
          <p className={`f-mono ${styles.kicker}`} data-reveal>
            За стойкой
          </p>
          <h2 id="hostess-title" className={styles.title} data-reveal>
            Бабушка, ради которой возвращаются
          </h2>
          <p className={styles.body} data-reveal>
            В отзывах о «Фошной» чаще всего вспоминают не интерьер и даже не бульон, а её. Вежливая, быстрая, гостеприимная — она встречает каждого так, будто вы
            зашли к ней домой в Ханое.
          </p>
          <div className={styles.stickers}>
            <span data-sticky className={styles.stickyWrap}>
              <PaperTag rotate={-3} className={styles.sticker}>
                <span className="f-hand">«{quotes.grannyKind}»</span>
              </PaperTag>
            </span>
            <span data-sticky className={styles.stickyWrap}>
              <PaperTag rotate={4} className={styles.sticker}>
                <span className="f-hand">«{quotes.granny}»</span>
              </PaperTag>
            </span>
          </div>
          <p className={styles.thanks} data-reveal>
            <span className="f-viet" lang="vi">
              Cảm ơn bà!
            </span>
            <span className={styles.thanksRu}>Спасибо, бабушка!</span>
          </p>
        </div>
      </div>
    </section>
  );
}
