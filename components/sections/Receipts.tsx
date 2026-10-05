'use client';
import { useEffect, useRef } from 'react';
import SignFlicker from '@/components/fx/SignFlicker';
import { receipts } from '@/data/reviews';
import { gsap, loadDrag, ScrollTrigger } from '@/lib/gsap';
import styles from './Receipts.module.css';

// веер: доли свободного места по x/y и угол
const FAN: [number, number, number][] = [
  [0.02, 0.2, -7],
  [0.22, 0.62, 4],
  [0.4, 0.14, -2],
  [0.6, 0.58, 6],
  [0.8, 0.18, -5],
  [0.98, 0.66, 3],
];

export default function Receipts() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const st = stage.current;
    if (!el || !st) return;
    const mm = gsap.matchMedia();
    let dead = false;
    loadDrag().then(({ Draggable }) => {
    if (dead) return;
    mm.add('(min-width: 760px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = Array.from(st.querySelectorAll<HTMLElement>('[data-receipt]'));
      const slotY = 18;
      const target = (i: number) => {
        const c = cards[i];
        const [fx, fy, r] = FAN[i % FAN.length];
        return { x: fx * (st.clientWidth - c.offsetWidth), y: 70 + fy * (st.clientHeight - 70 - c.offsetHeight), rotate: r };
      };
      const center = (c: HTMLElement) => (st.clientWidth - c.offsetWidth) / 2;
      gsap.set(cards, { x: (_, c: HTMLElement) => center(c), y: slotY, rotate: 0, clipPath: 'inset(0% 0% 100% 0%)' });

      let printed = false;
      const tl = gsap.timeline({ paused: true, onComplete: () => { printed = true; gsap.set(cards, { clipPath: 'none' }); } });
      cards.forEach((c, i) => {
        tl.to(c, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'steps(14)' }, i * 0.45)
          .to(c, { ...target(i), duration: 0.9, ease: 'power3.out' }, i * 0.45 + 0.8);
      });
      const trig = ScrollTrigger.create({ trigger: st, start: 'top 70%', once: true, onEnter: () => tl.play() });

      const drags = Draggable.create(cards, {
        type: 'x,y',
        bounds: st,
        inertia: true,
        zIndexBoost: true,
        onPress() {
          if (!printed) tl.progress(1);
          gsap.to(this.target, { scale: 1.05, duration: 0.2 });
        },
        onRelease() {
          gsap.to(this.target, { scale: 1, duration: 0.3 });
        },
      });

      const onResize = () => {
        if (!printed) return;
        cards.forEach((c, i) => gsap.set(c, target(i)));
        drags.forEach((d) => d.update());
      };
      window.addEventListener('resize', onResize);
      return () => {
        trig.kill();
        tl.kill();
        drags.forEach((d) => d.kill());
        window.removeEventListener('resize', onResize);
      };
    });
    });
    return () => {
      dead = true;
      mm.revert();
    };
  }, []);

  return (
    <section ref={root} className={`${styles.section} cv`} aria-labelledby="receipts-title">
      <div className="lamp" aria-hidden="true" />
      <div className={`wrap ${styles.inner}`}>
        <header className={styles.head}>
          <SignFlicker as="h2" id="receipts-title" className={styles.sign}>
            Что говорят у стойки
          </SignFlicker>
          <p className={styles.lead} data-reveal>
            Отзывы гостей — дословно, как в чеке. Бумажки можно двигать.
          </p>
        </header>
        <div ref={stage} className={styles.stage}>
          <div className={styles.printer} aria-hidden="true">
            <span className={styles.slot} />
            <span className={styles.led} />
          </div>
          <ul className={styles.list}>
            {receipts.map((q, i) => (
              <li key={i} className={styles.card} data-receipt data-cursor="grab" style={{ '--r': `${FAN[i][2] * 0.6}deg` } as React.CSSProperties}>
                <div className={styles.paper}>
                  <p className={styles.top}>
                    Фошная · Профсоюзная 26
                    <span>№ {String(i + 1).padStart(3, '0')}</span>
                  </p>
                  <p className={styles.dash} aria-hidden="true">
                    --------------------------
                  </p>
                  <p className={styles.label}>Отзыв гостя</p>
                  <blockquote className={styles.quote}>«{q}»</blockquote>
                  <p className={styles.dash} aria-hidden="true">
                    --------------------------
                  </p>
                  <p className={styles.thanks}>
                    <span lang="vi">CẢM ƠN!</span> Спасибо!
                  </p>
                  <span className={styles.barcode} aria-hidden="true" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
