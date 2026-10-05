'use client';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Photo from '@/components/ui/Photo';
import Steam from '@/components/fx/Steam';
import SignFlicker from '@/components/fx/SignFlicker';
import TileGrid from '@/components/fx/TileGrid';
import PaperTag from '@/components/fx/PaperTag';
import { PHO_DESCRIPTION, PRICE_NOTE, phoSizes } from '@/data/menu';
import { quotes } from '@/data/reviews';
import { gsap, prefersReduced } from '@/lib/gsap';
import styles from './SizePicker.module.css';

// геометрия стакана в координатах viewBox 420×640
const VBW = 420;
const VBH = 640;
const CX = 210;
const BOTTOM = 612;
const GEO = [
  { h: 300, wt: 232 },
  { h: 384, wt: 264 },
  { h: 476, wt: 300 },
];
const DENSITY = [0.45, 0.7, 1];

const r1 = (n: number) => Math.round(n * 10) / 10;

function cupShape(h: number, wt: number) {
  const top = BOTTOM - h;
  const wb = wt * 0.72;
  const xAt = (y: number, side: -1 | 1) => CX + side * (wb / 2 + ((wt - wb) / 2) * ((BOTTOM - y) / h));
  return { top, wb, xAt };
}

/** все пути стакана для текущих h/wt и фазы волны */
function paths(h: number, wt: number, phase: number, amp: number) {
  const { top, wb, xAt } = cupShape(h, wt);
  const body = `M${r1(CX - wt / 2)} ${r1(top)}L${r1(CX + wt / 2)} ${r1(top)}L${r1(CX + wb / 2)} ${BOTTOM - 8}Q${r1(CX + wb / 2)} ${BOTTOM} ${r1(CX + wb / 2 - 10)} ${BOTTOM}L${r1(CX - wb / 2 + 10)} ${BOTTOM}Q${r1(CX - wb / 2)} ${BOTTOM} ${r1(CX - wb / 2)} ${BOTTOM - 8}Z`;
  // поверхность бульона с волной
  const surf = top + 30;
  let broth = `M${r1(CX - wt / 2 - 10)} ${r1(surf)}`;
  for (let x = CX - wt / 2 - 10; x <= CX + wt / 2 + 10; x += 12) {
    const y = surf + Math.sin(x * 0.045 + phase) * amp + Math.sin(x * 0.021 - phase * 0.7) * amp * 0.6;
    broth += `L${r1(x)} ${r1(y)}`;
  }
  broth += `L${r1(CX + wt / 2 + 10)} ${BOTTOM + 4}L${r1(CX - wt / 2 - 10)} ${BOTTOM + 4}Z`;
  // рваный край передней стенки: ниже — крафт с печатью
  const tearY = BOTTOM - h * 0.36;
  const lx = xAt(tearY, -1);
  const rx = xAt(tearY, 1);
  let tear = `M${r1(lx)} ${r1(tearY)}`;
  const steps = 14;
  for (let i = 1; i < steps; i++) {
    const x = lx + ((rx - lx) * i) / steps;
    const jag = [7, -5, 9, -3, 6, -8, 4, -6, 8, -4, 5, -7, 3][i - 1];
    tear += `L${r1(x)} ${r1(tearY + jag)}`;
  }
  tear += `L${r1(rx)} ${r1(tearY)}L${r1(CX + wb / 2)} ${BOTTOM - 8}Q${r1(CX + wb / 2)} ${BOTTOM} ${r1(CX + wb / 2 - 10)} ${BOTTOM}L${r1(CX - wb / 2 + 10)} ${BOTTOM}Q${r1(CX - wb / 2)} ${BOTTOM} ${r1(CX - wb / 2)} ${BOTTOM - 8}Z`;
  return { body, broth, tear, top, surf, tearY, wt };
}

export default function SizePicker() {
  const [sel, setSel] = useState(2);
  const density = useRef(DENSITY[2]);
  const svgRef = useRef<SVGSVGElement>(null);
  const steamRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);
  const geo = useRef({ h: GEO[2].h, wt: GEO[2].wt, amp: 2.2 });
  const priceVal = useRef({ v: phoSizes[2].price });
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const renderRef = useRef<() => void>(() => {});

  // покадрово: волна + геометрия
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduce = prefersReduced();
    const q = (s: string) => svg.querySelector<SVGElement>(s)!;
    const els = { body: q('[data-body]'), clip: q('[data-clip]'), broth: q('[data-broth]'), tear: q('[data-tear]'), top: q('[data-topstuff]'), noodles: q('[data-noodles]'), beef: q('[data-beef]'), stamp: q('[data-stamp]'), rimL: q('[data-riml]'), rimR: q('[data-rimr]') };
    let phase = 0;
    // масштаб viewBox → CSS-пиксели кэшируем: getBoundingClientRect в кадре форсировал бы раскладку
    let scale = 1;
    const ro = new ResizeObserver(([e]) => (scale = e.contentRect.height / VBH));
    ro.observe(svg);
    let raf = 0;
    let visible = false;
    let last = performance.now();
    const render = () => {
      const g = geo.current;
      const p = paths(g.h, g.wt, phase, g.amp);
      els.body.setAttribute('d', p.body);
      els.clip.setAttribute('d', p.body);
      els.broth.setAttribute('d', p.broth);
      els.tear.setAttribute('d', p.tear);
      els.top.setAttribute('transform', `translate(0 ${r1(p.surf - 166)})`);
      els.beef.setAttribute('transform', `translate(0 ${r1(p.surf - 166)})`);
      els.noodles.setAttribute('transform', `translate(0 ${r1((BOTTOM - g.h) - (BOTTOM - 476))})`);
      els.stamp.setAttribute('transform', `translate(${CX} ${r1(BOTTOM - g.h * 0.17)}) rotate(-8)`);
      els.rimL.setAttribute('x', String(r1(CX - p.wt / 2 - 7)));
      els.rimL.setAttribute('y', String(r1(p.top - 6)));
      els.rimR.setAttribute('x', String(r1(CX + p.wt / 2 - 21)));
      els.rimR.setAttribute('y', String(r1(p.top - 6)));
      if (steamRef.current) {
        steamRef.current.style.transform = `translateY(${r1((GEO[2].h - g.h) * scale)}px)`;
      }
    };
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      phase += dt * 2.4;
      geo.current.amp += (2.2 - geo.current.amp) * dt * 1.6;
      render();
      raf = requestAnimationFrame(loop);
    };
    renderRef.current = render;
    render();
    if (reduce) return () => ro.disconnect();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(svg);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const choose = useCallback((i: number) => {
    setSel(i);
    density.current = DENSITY[i];
    const reduce = prefersReduced();
    const g = geo.current;
    if (reduce) {
      g.h = GEO[i].h;
      g.wt = GEO[i].wt;
      priceVal.current.v = phoSizes[i].price;
      if (priceRef.current) priceRef.current.textContent = String(phoSizes[i].price);
      renderRef.current();
      return;
    }
    gsap.to(g, { h: GEO[i].h, wt: GEO[i].wt, duration: 0.8, ease: 'elastic.out(1, 0.6)', overwrite: true });
    g.amp = 9;
    gsap.to(priceVal.current, {
      v: phoSizes[i].price,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        if (priceRef.current) priceRef.current.textContent = String(Math.round(priceVal.current.v));
      },
    });
  }, []);

  const onKey = (e: KeyboardEvent) => {
    const k = e.key;
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(k)) return;
    e.preventDefault();
    let n = sel;
    if (k === 'ArrowRight' || k === 'ArrowDown') n = (sel + 1) % 3;
    if (k === 'ArrowLeft' || k === 'ArrowUp') n = (sel + 2) % 3;
    if (k === 'Home') n = 0;
    if (k === 'End') n = 2;
    choose(n);
    radios.current[n]?.focus();
  };

  const init = paths(GEO[2].h, GEO[2].wt, 0, 2.2);

  return (
    <section id="pho" className={`${styles.section} cv`} aria-labelledby="pho-title">
      <TileGrid size={58} color="var(--ochre-d)" opacity={0.4} />
      <div className={`wrap ${styles.inner}`}>
        <header className={styles.head}>
          <SignFlicker as="h2" id="pho-title" className={styles.sign}>
            Один суп. Три размера.
          </SignFlicker>
          <p className={styles.kicker} data-reveal>
            <span className="f-viet" lang="vi">
              Phở bò
            </span>{' '}
            — главное и почти единственное блюдо. Выберите, сколько вы голодны.
          </p>
        </header>

        <div className={styles.grid}>
          <div className={styles.cupCol}>
            <div ref={steamRef} className={styles.steamBox}>
              <Steam densityRef={density} intro={0} base={0.05} strength={2.2} />
            </div>
            <svg ref={svgRef} className={styles.cup} viewBox={`0 0 ${VBW} ${VBH}`} role="img" aria-label={`Стакан фо, ${phoSizes[sel].label}`}>
              <defs>
                <clipPath id="cup-clip">
                  <path data-clip d={init.body} />
                </clipPath>
                <linearGradient id="broth-g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#F2B451" />
                  <stop offset="1" stopColor="#B86F22" />
                </linearGradient>
                <pattern id="kraft-lines" width="9" height="9" patternUnits="userSpaceOnUse">
                  <rect width="9" height="9" fill="#C99B67" />
                  <path d="M0 0V9" stroke="#B8895A" strokeWidth="1" opacity=".5" />
                </pattern>
              </defs>
              {/* задняя стенка */}
              <path data-body d={init.body} fill="#7d5a37" />
              <g clipPath="url(#cup-clip)">
                <path data-broth d={init.broth} fill="url(#broth-g)" />
                {/* лапша: волнистые ленты от дна вверх */}
                <g data-noodles fill="none" stroke="#F7EBD3" strokeWidth="5" strokeLinecap="round" opacity=".88">
                  {Array.from({ length: 14 }, (_, i) => {
                    const y = 590 - i * 30;
                    return <path key={i} d={`M40 ${y}c25 -16 45 16 70 0s45 -16 70 0 45 16 70 0 45 -16 70 0 45 16 70 0`} transform={`translate(${(i % 3) * 9} 0)`} />;
                  })}
                </g>
                {/* ломтики говядины у поверхности */}
                <g data-beef>
                  {[
                    [140, 196, -12],
                    [228, 204, 9],
                    [290, 188, -4],
                    [178, 222, 15],
                  ].map(([x, y, a], i) => (
                    <ellipse key={i} cx={x} cy={y} rx="34" ry="11" fill="#7B4A33" stroke="#5C3424" strokeWidth="2" transform={`rotate(${a} ${x} ${y})`} />
                  ))}
                </g>
                {/* поверхность: зелень, лук, лимон, чили */}
                <g data-topstuff>
                  {[
                    [128, 160, 24],
                    [196, 156, -30],
                    [262, 162, 50],
                    [310, 158, -12],
                    [160, 168, 70],
                  ].map(([x, y, a], i) => (
                    <path key={`l${i}`} d={`M${x} ${y}q14 -12 28 0q-14 12 -28 0z`} fill="#4E9A5C" transform={`rotate(${a} ${x} ${y})`} />
                  ))}
                  {[
                    [230, 162],
                    [286, 170],
                  ].map(([x, y], i) => (
                    <ellipse key={`o${i}`} cx={x} cy={y} rx="15" ry="6" fill="none" stroke="#B4508A" strokeWidth="3" />
                  ))}
                  <path d="M168 154a20 20 0 0 1 40 0z" fill="#F4C21B" stroke="#E2A80F" strokeWidth="2" />
                  <circle cx="252" cy="152" r="4" fill="#D3261C" />
                  <circle cx="262" cy="157" r="3" fill="#D3261C" />
                </g>
              </g>
              {/* передняя стенка ниже рваного края */}
              <path data-tear d={init.tear} fill="url(#kraft-lines)" />
              <g data-stamp transform={`translate(${CX} ${BOTTOM - 476 * 0.17}) rotate(-8)`}>
                <circle r="38" fill="none" stroke="#C0261C" strokeWidth="3" />
                <circle r="31" fill="none" stroke="#C0261C" strokeWidth="1.2" />
                <text y="-3" textAnchor="middle" fontSize="17" fill="#C0261C" className={styles.stampText}>
                  ФОШ
                </text>
                <text y="16" textAnchor="middle" fontSize="17" fill="#C0261C" className={styles.stampText}>
                  НАЯ
                </text>
              </g>
              <rect data-riml width="28" height="12" rx="3" fill="#E6CFAE" />
              <rect data-rimr width="28" height="12" rx="3" fill="#E6CFAE" />
            </svg>
            <p className={styles.cupNote} aria-live="polite">
              <span className="f-mono">{phoSizes[sel].label}</span> · {phoSizes[sel].price} ₽
            </p>
          </div>

          <div className={styles.controls}>
            <div role="radiogroup" aria-label="Размер фо бо" className={styles.radios} onKeyDown={onKey}>
              {phoSizes.map((s, i) => (
                <button
                  key={s.grams}
                  ref={(el) => {
                    radios.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={sel === i}
                  tabIndex={sel === i ? 0 : -1}
                  className={styles.radio}
                  onClick={() => choose(i)}
                >
                  <PaperTag as="span" index={i + 2} rotate={sel === i ? 0 : [-5, 4, -3][i]} className={`${styles.price} ${sel === i ? styles.priceOn : ''}`}>
                    <span className={styles.grams}>{s.label}</span>
                    <span className={styles.rub}>{s.price} ₽</span>
                  </PaperTag>
                  {s.note && (
                    <span className={`f-hand ${styles.note}`} aria-hidden="true">
                      <svg viewBox="0 0 60 40" className={styles.arrow}>
                        <path d="M56 6C40 4 18 10 8 30m0 0l-2-11m2 11l10-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>
                      {s.note}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className={styles.readout}>
              <span className={styles.big}>
                <span ref={priceRef}>{phoSizes[2].price}</span>
                <span className={styles.cur}> ₽</span>
              </span>
              <p className={styles.desc}>{PHO_DESCRIPTION}</p>
              <p className={styles.fine}>{PRICE_NOTE}</p>
            </div>
          </div>

          <figure className={styles.photoCol} data-reveal>
            <Photo id="bowl-chili" sizes="(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 92vw" className={styles.photo} view />
            <PaperTag index={1} className={styles.quote} as="blockquote">
              <p>«{quotes.harmony}»</p>
              <cite className="f-mono">Отзыв гостя</cite>
            </PaperTag>
          </figure>
        </div>
      </div>
    </section>
  );
}
