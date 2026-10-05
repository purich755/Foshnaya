'use client';
import { useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import styles from './HonestFaq.module.css';

const FAQ: [string, string][] = [
  ['Где сесть?', 'Внутри — стоячая стойка, сидячих мест нет. Большинство берёт фо навынос и идёт гулять: Баумана совсем рядом.'],
  ['Можно с собакой?', 'Да, с питомцами можно.'],
  ['Есть доставка?', 'Есть доставка и самовывоз, можно сделать предзаказ. Но честно: у стойки, горячий и с добавками, фо вкуснее всего.'],
  ['Как оплатить?', 'Карта, наличные, СБП, QR-код.'],
  ['Почему бань бао не всегда есть?', 'Их немного, разбирают быстро. Лучше спросить у стойки или позвонить заранее.'],
];

function Item({ q, a, n, defaultOpen }: { q: string; a: string; n: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const body = useRef<HTMLDivElement>(null);
  // hidden управляется вручную: React его не перетирает, потому что проп не меняется
  const toggle = () => {
    const el = body.current;
    if (!el) return;
    const next = !open;
    setOpen(next);
    if (prefersReduced()) {
      el.hidden = !next;
      return;
    }
    gsap.killTweensOf(el);
    if (next) {
      el.hidden = false;
      gsap.fromTo(el, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'height' });
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => { el.hidden = true; gsap.set(el, { clearProps: 'height,opacity' }); } });
    }
  };
  const id = `faq-${n}`;
  return (
    <li className={styles.item} data-open={open ? '' : undefined} data-reveal>
      <h3 className={styles.h}>
        <button type="button" className={styles.q} aria-expanded={open} aria-controls={id} onClick={toggle}>
          <span className={styles.n}>{String(n).padStart(2, '0')}</span>
          <span className={styles.qt}>{q}</span>
          <span className={styles.plus} aria-hidden="true" />
        </button>
      </h3>
      <div id={id} ref={body} className={styles.a} hidden={!defaultOpen} role="region" aria-label={q}>
        <p>{a}</p>
      </div>
    </li>
  );
}

export default function HonestFaq() {
  return (
    <section id="faq" className={`${styles.section} cv`} aria-labelledby="faq-title">
      <div className={`wrap ${styles.grid}`}>
        <header className={styles.head}>
          <h2 id="faq-title" className={styles.title} data-reveal>
            Как у нас всё устроено
          </h2>
          <p className={styles.lead} data-reveal>
            Мы маленькие. Поэтому заранее отвечаем на главные вопросы.
          </p>
        </header>
        <ul className={styles.list}>
          {FAQ.map(([q, a], i) => (
            <Item key={q} q={q} a={a} n={i + 1} defaultOpen={i === 0} />
          ))}
        </ul>
      </div>
    </section>
  );
}
