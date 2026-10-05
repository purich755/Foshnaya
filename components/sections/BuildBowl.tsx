'use client';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import Photo from '@/components/ui/Photo';
import SignFlicker from '@/components/fx/SignFlicker';
import PaperTag from '@/components/fx/PaperTag';
import { heatLabel, MAX_HEAT, toppings, type ToppingId } from '@/data/toppings';
import { quotes } from '@/data/reviews';
import { gsap, loadDrag, prefersReduced } from '@/lib/gsap';

type Drag = InstanceType<typeof import('gsap/Draggable').Draggable>;
import styles from './BuildBowl.module.css';

type Item = { key: number; type: ToppingId; x: number; y: number; rot: number; s: number };

const COUNT: Record<ToppingId, number> = { onion: 3, chili: 4, lemon: 1, ginger: 3, mint: 3, vinegar: 4, sriracha: 2, sate: 5 };

// позиции баночек по кругу (в % от сцены), посчитаны заранее — одинаково на сервере и клиенте
const RING = toppings.map((_, i) => {
  const a = ((i * 45 - 90 + 22.5) * Math.PI) / 180;
  return { x: Math.round((50 + Math.cos(a) * 43) * 100) / 100, y: Math.round((50 + Math.sin(a) * 43) * 100) / 100 };
});

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ToppingShape({ type }: { type: ToppingId }) {
  switch (type) {
    case 'onion':
      return (
        <g fill="none" stroke="#C25C97" strokeWidth="2.4">
          <ellipse rx="10" ry="6" />
          <ellipse rx="6" ry="3.4" strokeWidth="1.6" opacity=".8" />
        </g>
      );
    case 'chili':
      return (
        <g>
          <circle r="4.6" fill="none" stroke="#D3261C" strokeWidth="2.4" />
          <circle r="1" cx="-1" cy=".6" fill="#F4E3B0" />
          <circle r=".9" cx="1.4" cy="-.8" fill="#F4E3B0" />
        </g>
      );
    case 'lemon':
      return (
        <g>
          <path d="M-13 0a13 13 0 0 1 26 0z" fill="#F4C21B" stroke="#F8E08A" strokeWidth="2" />
          <path d="M0 0L-8 -8M0 0L0 -11M0 0L8 -8" stroke="#F8E08A" strokeWidth="1.2" />
        </g>
      );
    case 'ginger':
      return <rect x="-8" y="-1.4" width="16" height="2.8" rx="1.2" fill="#E9C48C" />;
    case 'mint':
      return (
        <g>
          <path d="M-10 0q10 -9 20 0q-10 9 -20 0z" fill="#4E9A5C" />
          <path d="M-9 0h18" stroke="#8CCB97" strokeWidth="1" />
        </g>
      );
    case 'vinegar':
      return <circle r="3.6" fill="rgba(255,255,255,.38)" stroke="rgba(255,255,255,.55)" strokeWidth=".8" />;
    case 'sriracha':
      return <path d="M-10 2c4 -8 10 -8 12 -2s6 6 9 -1" fill="none" stroke="#E0461F" strokeWidth="3.4" strokeLinecap="round" />;
    case 'sate':
      return (
        <g fill="rgba(170,28,14,.82)">
          <circle r="4.4" />
          <circle cx="6" cy="3" r="2.2" />
        </g>
      );
  }
}

function JarIcon({ type }: { type: ToppingId }) {
  // крупные значки на «крышках» баночек
  return (
    <svg viewBox="-16 -16 32 32" className={styles.jarIcon} aria-hidden="true">
      <g transform="scale(1.15)">
        <ToppingShape type={type} />
      </g>
    </svg>
  );
}

function Pepper({ on, n }: { on: boolean; n: number }) {
  return (
    <svg viewBox="0 0 40 40" className={`${styles.pepper} ${on ? styles.pepperOn : ''}`} aria-hidden="true" style={{ transitionDelay: `${n * 40}ms` }}>
      <path d="M22 9c1-4 4-5 7-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={styles.stem} />
      <path d="M21 10c-7 0-9 6-9 12 0 6-3 10-6 12 9 2 21-3 23-13 1-6-2-11-8-11z" className={styles.body} />
    </svg>
  );
}

export default function BuildBowl() {
  const root = useRef<HTMLElement>(null);
  const bowlRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [heat, setHeat] = useState(0);
  const [msg, setMsg] = useState('');
  const seq = useRef(1);
  const heatRef = useRef(0);
  const kitReady = useRef(false);

  const add = useCallback((id: ToppingId) => {
    const t = toppings.find((x) => x.id === id)!;
    const rand = rng(seq.current * 7919);
    const fresh: Item[] = Array.from({ length: COUNT[id] }, () => {
      const r = Math.sqrt(rand()) * 66;
      const a = rand() * Math.PI * 2;
      return { key: seq.current++, type: id, x: Math.round((100 + Math.cos(a) * r) * 10) / 10, y: Math.round((100 + Math.sin(a) * r) * 10) / 10, rot: Math.round(rand() * 360), s: Math.round((0.85 + rand() * 0.4) * 100) / 100 };
    });
    setItems((prev) => [...prev, ...fresh].slice(-80));
    const next = Math.min(MAX_HEAT, heatRef.current + t.heat);
    heatRef.current = next;
    setHeat(next);
    setMsg(`Добавлено: ${t.ru.toLowerCase()}. Острота ${next} из ${MAX_HEAT} — ${heatLabel(next)}`);
    const bowl = bowlRef.current;
    if (bowl && !prefersReduced()) gsap.fromTo(bowl, { scale: 1 }, { scale: 1.06, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' });
  }, []);

  const reset = () => {
    setItems([]);
    setHeat(0);
    heatRef.current = 0;
    setMsg('Миска пустая. Острота 0 — классика.');
  };

  // полёт баночки в миску по дуге, затем возврат на место
  const fly = useCallback(
    (jar: HTMLElement, id: ToppingId, drag?: Drag) => {
      const bowl = bowlRef.current;
      if (!bowl) return add(id);
      if (prefersReduced() || !kitReady.current) return add(id);
      const jr = jar.getBoundingClientRect();
      const br = bowl.getBoundingClientRect();
      const x0 = Number(gsap.getProperty(jar, 'x'));
      const y0 = Number(gsap.getProperty(jar, 'y'));
      const tx = x0 + (br.left + br.width / 2) - (jr.left + jr.width / 2);
      const ty = y0 + (br.top + br.height / 2) - (jr.top + jr.height / 2);
      const mx = (x0 + tx) / 2;
      const my = Math.min(y0, ty) - 90;
      drag?.disable();
      jar.dataset.flying = '';
      gsap
        .timeline({
          onComplete: () => {
            add(id);
            gsap.set(jar, { x: 0, y: 0, scale: 0.5, opacity: 0, rotate: 0 });
            gsap.to(jar, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)', delay: 0.1 });
            delete jar.dataset.flying;
            drag?.enable();
            drag?.update();
          },
        })
        .to(jar, { motionPath: { path: [{ x: x0, y: y0 }, { x: mx, y: my }, { x: tx, y: ty }], curviness: 1.25 }, duration: 0.6, ease: 'power1.in' })
        .to(jar, { scale: 0.35, rotate: 140, duration: 0.6, ease: 'power1.in' }, 0)
        .to(jar, { opacity: 0, duration: 0.15 }, 0.45);
    },
    [add],
  );

  useEffect(() => {
    const el = root.current;
    const bowl = bowlRef.current;
    if (!el || !bowl) return;
    let drags: Drag[] = [];
    let dead = false;
    loadDrag().then(({ Draggable }) => {
      if (dead) return;
      kitReady.current = true;
    const jars = Array.from(el.querySelectorAll<HTMLElement>('[data-jar]'));
    drags = jars.map((jar) => {
      const id = jar.dataset.jar as ToppingId;
      const [d] = Draggable.create(jar, {
        type: 'x,y',
        minimumMovement: 6,
        zIndexBoost: true,
        onPress() {
          jar.dataset.drag = '';
        },
        onRelease() {
          delete jar.dataset.drag;
        },
        onDragEnd() {
          if (this.hitTest(bowl, '30%')) fly(jar, id, d);
          else gsap.to(jar, { x: 0, y: 0, rotate: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
        },
        onClick() {
          fly(jar, id, d);
        },
      });
      return d;
    });
    });
    return () => {
      dead = true;
      drags.forEach((d) => d.kill());
    };
  }, [fly]);

  // клавиатура: Enter / пробел по баночке (Draggable ловит только указатель)
  const onJarClick = (e: MouseEvent<HTMLButtonElement>, id: ToppingId) => {
    if (e.detail === 0) fly(e.currentTarget, id);
  };

  return (
    <section id="toppings" ref={root} className={`${styles.section} cv`} aria-labelledby="toppings-title">
      <div className="lamp" aria-hidden="true" />
      <div className={`wrap ${styles.inner}`}>
        <header className={styles.head}>
          <SignFlicker as="h2" id="toppings-title" tone="yellow" className={styles.sign}>
            Острота — на вашей совести
          </SignFlicker>
          <p className={styles.lead} data-reveal>
            У стойки стоят добавки и соусы. Каждый доводит фо до своего вкуса. Попробуйте здесь.
          </p>
        </header>

        <div className={styles.layout}>
          <div className={styles.stage}>
            <div ref={bowlRef} className={styles.bowl} data-cursor="hit">
              <Photo id="bowl-dark-top" sizes="(min-width: 900px) 420px, 70vw" className={styles.bowlImg} alt="Миска фо сверху — сюда падают добавки" />
              <svg viewBox="0 0 200 200" className={styles.layer} aria-hidden="true">
                {items.map((it) => (
                  <g key={it.key} transform={`translate(${it.x} ${it.y}) rotate(${it.rot}) scale(${it.s})`}>
                    <g className={styles.pop}>
                      <ToppingShape type={it.type} />
                    </g>
                  </g>
                ))}
              </svg>
            </div>
            <p className={styles.hint} aria-hidden="true">
              Тащите баночку в миску
              <br /> или просто нажмите на неё
            </p>
            {toppings.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={styles.jar}
                style={{ left: `${RING[i].x}%`, top: `${RING[i].y}%`, '--c': t.color } as React.CSSProperties}
                data-jar={t.id}
                data-cursor="grab"
                onClick={(e) => onJarClick(e, t.id)}
              >
                <span className="sr-only">Добавить: </span>
                <span className={styles.lid}>
                  <JarIcon type={t.id} />
                </span>
                <span className={styles.jarRu}>{t.ru}</span>
                <span className={`f-viet ${styles.jarVi}`} lang="vi">
                  {t.vi}
                </span>
                {t.heat > 0 && <span className="sr-only">, острота +{t.heat}</span>}
              </button>
            ))}
          </div>

          <aside className={styles.side}>
            <div className={styles.meter} role="meter" aria-valuemin={0} aria-valuemax={MAX_HEAT} aria-valuenow={heat} aria-label="Острота миски">
              <div className={styles.peppers}>
                {Array.from({ length: MAX_HEAT }, (_, i) => (
                  <Pepper key={i} on={heat > MAX_HEAT - 1 - i} n={MAX_HEAT - 1 - i} />
                ))}
              </div>
              <div className={styles.meterText}>
                <span className="f-mono">Острота {heat}/5</span>
                <strong className={heat >= 5 ? styles.cay : undefined}>{heatLabel(heat)}</strong>
              </div>
            </div>
            <PaperTag index={4} className={styles.quote} as="blockquote">
              <p>«{quotes.sauces}»</p>
              <cite className="f-mono">Отзыв гостя</cite>
            </PaperTag>
            <div className={styles.actions}>
              <button type="button" className="btn btn--ghost" onClick={reset}>
                Сбросить миску
              </button>
              <a href="#route" className="btn">
                Попробовать вживую <span className="arr">→</span>
              </a>
            </div>
          </aside>
        </div>
        <p className="sr-only" aria-live="polite">
          {msg}
        </p>
      </div>
    </section>
  );
}
