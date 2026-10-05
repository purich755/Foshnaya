'use client';
import { useEffect, useRef } from 'react';
import SignFlicker from '@/components/fx/SignFlicker';
import OpenStatus from '@/components/fx/OpenStatus';
import map from '@/data/map.json';
import { venue } from '@/data/venue';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import styles from './Route.module.css';

// где ставить подпись вдоль улицы (доля длины) — подобрано, чтобы попадала в кадр
const LABEL_AT: Record<string, string> = {
  Баумана: '38%',
  Профсоюзная: '30%',
  Пушкина: '62%',
  Петербургская: '55%',
  Кремлёвская: '30%',
  Чернышевского: '55%',
  'Право-Булачная': '35%',
  Островского: '50%',
  Московская: '50%',
};

export default function Route() {
  const root = useRef<HTMLElement>(null);
  const [vx, vy] = map.venue;
  const [mx, my] = map.metro;

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const ctx = gsap.context(() => {
      const draw = el.querySelector<SVGPathElement>('[data-draw]')!;
      const len = draw.getTotalLength();
      gsap.set(draw, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set('[data-pin]', { y: -70, opacity: 0 });
      gsap.set('[data-dist]', { opacity: 0 });
      ScrollTrigger.create({
        trigger: el.querySelector('[data-map]'),
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(draw, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
            .to('[data-dist]', { opacity: 1, duration: 0.5 }, 1.2)
            .to('[data-pin]', { y: 0, opacity: 1, duration: 0.55, ease: 'bounce.out' }, 1.4)
            .fromTo('[data-swing]', { rotate: 9 }, { rotate: 0, duration: 2.4, ease: 'elastic.out(1.1, 0.18)' }, 1.85);
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="route" ref={root} className={`${styles.section} cv`} aria-labelledby="route-title">
      <div className={`wrap ${styles.inner}`}>
        <SignFlicker as="h2" id="route-title" tone="yellow" className={styles.sign}>
          Профсоюзная, 26
        </SignFlicker>

        <div className={styles.grid}>
          <div className={styles.mapBox} data-map>
            <svg viewBox={`0 0 ${map.w} ${map.h}`} className={styles.map} role="img" aria-label={`Схема: от метро «Площадь Тукая» до «Фошной» около ${map.routeMeters} метров, ${map.routeMinutes} минут пешком по Профсоюзной улице, параллельно улице Баумана`}>
              <defs>
                <mask id="route-mask" maskUnits="userSpaceOnUse">
                  <path data-draw d={map.route} stroke="#fff" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </mask>
              </defs>
              <rect width={map.w} height={map.h} fill="#1b1511" />
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {map.bulak.map((d, i) => (
                  <path key={i} d={d} stroke="#2c5158" strokeWidth="9" opacity=".8" />
                ))}
                {map.minor.map((d, i) => (
                  <path key={i} d={d} stroke="#3a2e25" strokeWidth="2.2" />
                ))}
                {map.major.map((s) => (
                  <path key={s.id} d={s.d} stroke={s.name === 'Профсоюзная' ? '#9A6428' : s.pedestrian ? '#5d4a37' : '#4d3d30'} strokeWidth={s.name === 'Профсоюзная' ? 7 : s.pedestrian ? 9 : 5} />
                ))}
              </g>
              {map.major.map((s) => (
                <g key={`l-${s.id}`}>
                  <path id={`${s.id}-l`} d={s.label} fill="none" />
                  <text className={`${styles.street} ${s.name === 'Профсоюзная' ? styles.streetHi : ''}`} dy="-8">
                    <textPath href={`#${s.id}-l`} startOffset={LABEL_AT[s.name] ?? '50%'} textAnchor="middle">
                      {s.name === 'Баумана' ? 'ул. Баумана · пешеходная' : s.name}
                    </textPath>
                  </text>
                </g>
              ))}

              {/* маршрут: пунктир, проявляемый маской */}
              <path d={map.route} stroke="#F4C21B" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" fill="none" mask="url(#route-mask)" />

              {/* метро */}
              <g transform={`translate(${mx} ${my})`}>
                <circle r="15" fill="#D3261C" stroke="#1b1511" strokeWidth="3" />
                <text className={styles.metroM} textAnchor="middle" dy="5.5">
                  М
                </text>
                <text className={styles.metroLabel} x="22" y="22">
                  Площадь Тукая
                </text>
              </g>

              {/* подпись расстояния */}
              <g data-dist transform={`translate(${Math.round((vx + mx) / 2 + 26)} ${Math.round((vy + my) / 2 + 4)})`}>
                <rect x="0" y="-15" width="218" height="26" fill="#15110E" stroke="#F4C21B" strokeWidth="1" />
                <text className={styles.dist} x="10" y="3">
                  ≈ {venue.metroMeters} м · {venue.walkMinutes} минут пешком
                </text>
              </g>

              {/* пин-вывеска */}
              <g transform={`translate(${vx} ${vy})`}>
                <g data-pin>
                  <circle r="5" fill="#F4C21B" />
                  <g data-swing style={{ transformOrigin: '0px -18px' }}>
                    <line x1="0" y1="-4" x2="0" y2="-18" stroke="#F4EADA" strokeWidth="2" />
                    <rect x="-17" y="-104" width="34" height="86" fill="#D3261C" />
                    <text className={styles.pinText} x="0" y="-61" textAnchor="middle" transform="rotate(90 0 -61)">
                      PHỞ
                    </text>
                  </g>
                </g>
              </g>
              <text className={styles.north} x={map.w - 30} y="34" textAnchor="middle">
                С ↑
              </text>
            </svg>
          </div>

          <div className={styles.info}>
            <dl className={styles.dl}>
              <div>
                <dt>Адрес</dt>
                <dd>
                  {venue.city}, {venue.street}
                </dd>
              </div>
              <div>
                <dt>Часы</dt>
                <dd>
                  Ежедневно 12:00 — 23:00
                  <OpenStatus className={styles.status} />
                </dd>
              </div>
              <div>
                <dt>Телефон</dt>
                <dd>
                  <a href={venue.phoneHref}>{venue.phone}</a>
                </dd>
              </div>
              <div>
                <dt>VK</dt>
                <dd>
                  <a href={venue.vk} target="_blank" rel="noopener noreferrer">
                    {venue.vkLabel}
                  </a>
                </dd>
              </div>
            </dl>
            <div className={styles.actions}>
              <a className="btn" href={venue.routeUrl} target="_blank" rel="noopener noreferrer">
                Построить маршрут <span className="arr">→</span>
              </a>
              <a className="btn btn--ghost" href={venue.phoneHref}>
                Позвонить
              </a>
            </div>
            <p className={styles.fine}>Рядом с улицей Баумана · Метро «Площадь Тукая» · Можно с питомцами</p>
          </div>
        </div>
      </div>
    </section>
  );
}
