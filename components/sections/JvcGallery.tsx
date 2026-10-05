'use client';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import dynamic from 'next/dynamic';
import Photo from '@/components/ui/Photo';
import SignFlicker from '@/components/fx/SignFlicker';
import { photo } from '@/data/photos';
import { prefersReduced } from '@/lib/gsap';
import type { LbItem } from './Lightbox';
import styles from './JvcGallery.module.css';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

const CHANNELS: LbItem[] = [
  { id: 'blue-counter', label: 'Стойка' },
  { id: 'bowl-top', label: 'Фо бо' },
  { id: 'board-kitchen', label: 'Меню мелом' },
  { id: 'sauces', label: 'Соусы' },
  { id: 'cup-hand', label: 'Литр в руке' },
  { id: 'kitchen-red', label: 'Кухня' },
  { id: 'spring-rolls-red', label: 'Спринг-роллы' },
  { id: 'wall-posters', label: 'Полка с плакатами' },
  { id: 'lamps', label: 'Лампы' },
  { id: 'bao-rolls', label: 'Бань бао' },
  { id: 'night-facade', label: 'Вечер на Профсоюзной' },
  { id: 'two-cups', label: 'Два стакана' },
  { id: 'shutters', label: 'Ставни' },
  { id: 'tray', label: 'Поднос' },
  { id: 'winter-night', label: 'Зимой' },
  { id: 'jvc-2018', label: 'Тот самый JVC · 2018' },
];

const ch = (n: number) => String(n + 1).padStart(2, '0');

/** карта бочкообразной дисторсии для feDisplacementMap */
function barrelMap(): string {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(s, s);
  for (let y = 0; y < s; y++)
    for (let x = 0; x < s; x++) {
      const nx = (x / (s - 1)) * 2 - 1;
      const ny = (y / (s - 1)) * 2 - 1;
      const r2 = nx * nx + ny * ny;
      const i = (y * s + x) * 4;
      img.data[i] = 128 - nx * r2 * 60;
      img.data[i + 1] = 128 - ny * r2 * 60;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

export default function JvcGallery() {
  const [cur, setCur] = useState(0);
  const [knob, setKnob] = useState(0);
  const [sound, setSound] = useState(false);
  const [lb, setLb] = useState<number | null>(null);
  const [map, setMap] = useState('');
  const root = useRef<HTMLElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const noise = useRef<HTMLCanvasElement>(null);
  const sync = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const lastTouch = useRef(0);
  const busy = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  const visible = useRef(false);
  const curRef = useRef(0);
  curRef.current = cur;

  useEffect(() => setMap(barrelMap()), []);

  const click = useCallback(() => {
    if (!sound) return;
    const a = audio.current ?? (audio.current = new AudioContext());
    const len = Math.floor(a.sampleRate * 0.12);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = a.createBufferSource();
    const g = a.createGain();
    g.gain.value = 0.18;
    src.buffer = buf;
    src.connect(g).connect(a.destination);
    src.start();
  }, [sound]);

  const switchTo = useCallback(
    (n: number, user = true) => {
      if (user) lastTouch.current = performance.now();
      const next = (n + CHANNELS.length) % CHANNELS.length;
      if (busy.current) return;
      if (prefersReduced()) {
        setCur(next);
        return;
      }
      busy.current = true;
      click();
      // белый шум ~180 мс, 30 к/с
      const cv = noise.current;
      const ctx = cv?.getContext('2d');
      let frames = 0;
      let t: number | undefined;
      if (cv && ctx) {
        cv.style.opacity = '1';
        const draw = () => {
          const img = ctx.createImageData(cv.width, cv.height);
          for (let i = 0; i < img.data.length; i += 4) {
            const v = Math.random() * 255;
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
            img.data[i + 3] = 255;
          }
          ctx.putImageData(img, 0, 0);
          frames++;
          if (frames < 6) t = window.setTimeout(draw, 33);
          else {
            setCur(next);
            cv.style.opacity = '0';
            const s = sync.current;
            if (s) {
              s.classList.remove(styles.syncOn);
              void s.offsetWidth;
              s.classList.add(styles.syncOn);
            }
            busy.current = false;
          }
        };
        draw();
      } else {
        setCur(next);
        busy.current = false;
      }
      return () => window.clearTimeout(t);
    },
    [click],
  );

  // автопереключение: каждые 5 с, пока секция видна и 8 с без взаимодействия
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const id = window.setInterval(() => {
      if (!visible.current || lb !== null || document.hidden) return;
      if (performance.now() - lastTouch.current < 8000) return;
      switchTo(curRef.current + 1, false);
    }, 5000);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [lb, switchTo]);

  // активная миниатюра — в поле зрения ленты (без вертикального скролла страницы)
  useEffect(() => {
    const strip = thumbs.current;
    const btn = strip?.querySelectorAll<HTMLElement>('button')[cur];
    if (!strip || !btn) return;
    const left = btn.offsetLeft - strip.clientWidth / 2 + btn.clientWidth / 2;
    strip.scrollTo({ left, behavior: prefersReduced() ? 'auto' : 'smooth' });
  }, [cur]);

  const turn = (d: number) => {
    setKnob((k) => k + d * 30);
    switchTo(cur + d);
  };

  const onKey = (e: KeyboardEvent) => {
    if (lb !== null) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      turn(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      turn(-1);
    }
  };

  const sx = useRef<number | null>(null);
  const onDown = (e: PointerEvent) => (sx.current = e.clientX);
  const onUp = (e: PointerEvent) => {
    if (sx.current === null) return;
    const dx = e.clientX - sx.current;
    sx.current = null;
    if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1);
  };

  const c = CHANNELS[cur];

  return (
    <section id="gallery" ref={root} className={`${styles.section} cv`} aria-labelledby="gallery-title" onKeyDown={onKey}>
      <div className="lamp" aria-hidden="true" />
      {map && (
        <svg className={styles.defs} aria-hidden="true">
          <filter id="crt" x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
            <feImage href={map} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="m" />
            <feDisplacementMap in="SourceGraphic" in2="m" scale="0.05" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      <div className={`wrap ${styles.inner}`}>
        <SignFlicker as="h2" id="gallery-title" vertical className={styles.vsign}>
          Прямой эфир с Профсоюзной
        </SignFlicker>

        <div className={styles.center}>
          <div className={styles.tv}>
            <div className={styles.cabinet}>
              <div className={styles.bezel}>
                <div
                  ref={screen}
                  className={styles.screen}
                  tabIndex={0}
                  role="group"
                  aria-roledescription="телевизор-галерея"
                  aria-label={`Канал ${ch(cur)} из ${CHANNELS.length}: ${c.label}. Стрелки — переключить, двойной клик — на весь экран`}
                  data-cursor="view"
                  onDoubleClick={() => setLb(cur)}
                  onPointerDown={onDown}
                  onPointerUp={onUp}
                >
                  <div className={styles.picture} style={map ? { filter: 'url(#crt)' } : undefined}>
                    <Photo key={c.id} id={c.id} sizes="(min-width: 1100px) 760px, 92vw" className={styles.img} />
                  </div>
                  <canvas ref={noise} className={styles.noise} width={160} height={120} aria-hidden="true" />
                  <div ref={sync} className={styles.sync} aria-hidden="true" />
                  <div className={styles.lines} aria-hidden="true" />
                  <div className={styles.vignette} aria-hidden="true" />
                  <div className={styles.osd} aria-hidden="true">
                    <span>
                      CH {ch(cur)} · {c.label}
                    </span>
                    <span className={styles.live}>● эфир</span>
                  </div>
                </div>
              </div>
              <div className={styles.panel}>
                <div className={styles.brand}>JVC</div>
                <div className={styles.grille} aria-hidden="true" />
                <div className={styles.knobs}>
                  <button type="button" className={styles.knob} style={{ transform: `rotate(${knob}deg)` }} onClick={() => turn(1)} aria-label="Крутилка: следующий канал">
                    <span />
                  </button>
                  <button type="button" className={`${styles.knob} ${styles.knobSm}`} style={{ transform: `rotate(${-knob}deg)` }} onClick={() => turn(-1)} aria-label="Крутилка: предыдущий канал">
                    <span />
                  </button>
                </div>
                <div className={styles.chBtns}>
                  <button type="button" onClick={() => turn(-1)} aria-label="CH− предыдущий канал">
                    CH−
                  </button>
                  <button type="button" onClick={() => turn(1)} aria-label="CH+ следующий канал">
                    CH+
                  </button>
                </div>
                <span className={styles.led} aria-hidden="true" />
              </div>
            </div>
            <div className={styles.feet} aria-hidden="true">
              <span />
              <span />
            </div>
          </div>

          <div className={styles.tools}>
            <button type="button" className={styles.tool} onClick={() => setLb(cur)}>
              ⤢ <span>на весь экран</span>
            </button>
            <button type="button" className={styles.tool} aria-pressed={sound} onClick={() => setSound((s) => !s)}>
              {sound ? '🔊' : '🔇'} <span>{sound ? 'щелчок включён' : 'без звука'}</span>
            </button>
          </div>

          <div className={styles.guideHead}>
            <span className="f-mono">Программа передач</span>
            <span className={styles.guideNote}>Все кадры — из «Фошной». Без стоков.</span>
          </div>
          <div ref={thumbs} className={styles.thumbs} role="group" aria-label="Каналы">
            {CHANNELS.map((x, i) => {
              const p = photo(x.id);
              return (
                <button key={x.id} type="button" aria-pressed={i === cur} className={styles.thumb} onClick={() => switchTo(i)} title={`CH ${ch(i)} · ${x.label}`}>
                  <img src={`${p.src}-${p.widths[0]}.webp`} alt="" loading="lazy" decoding="async" width={120} height={90} style={{ backgroundColor: p.color }} draggable={false} />
                  <span className={styles.thumbCh}>{ch(i)}</span>
                  <span className="sr-only">{x.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {lb !== null && <Lightbox items={CHANNELS} index={lb} onIndex={(n) => { setLb(n); setCur(n); }} onClose={() => setLb(null)} origin={() => screen.current?.getBoundingClientRect() ?? null} />}
    </section>
  );
}
