'use client';
import { useEffect, useRef, useState } from 'react';
import Photo from '@/components/ui/Photo';
import PaperTag from '@/components/fx/PaperTag';
import { quotes } from '@/data/reviews';
import { gsap, ScrollTrigger, PIN_QUERY, prefersReduced } from '@/lib/gsap';
import { facade, hotspots, objects, seams, tiles, tvScreen, VB, walls } from './isoPlan';
import styles from './SmallSpace.module.css';

function Plan() {
  return (
    <svg className={styles.svg} viewBox={`0 0 ${VB.w} ${VB.h}`} role="img" aria-label="Схема зала «Фошной»: стойка у дальней стены, полка с соусами слева, телевизор в углу, витрина на Профсоюзную">
      <g data-tiles>
        {tiles.map((t) => (
          <polygon key={t.key} data-tile data-diag={t.diag} points={t.points} fill={t.alt ? '#2a211a' : '#241c16'} stroke="#8C5426" strokeWidth="1" strokeOpacity=".7" />
        ))}
      </g>
      <g data-walls>
        {walls.map((w, i) => (
          <polygon key={i} data-wall points={w.points} fill={w.fill} />
        ))}
        {seams.map((d, i) => (
          <path key={i} data-wall d={d} stroke="#8C5426" strokeWidth="1" opacity=".55" />
        ))}
      </g>
      {objects.map((o) => (
        <g key={o.id} data-obj={o.id}>
          {o.polys.map((p, i) => (
            <polygon key={i} points={p.points} fill={p.fill} stroke="rgba(21,17,14,.35)" strokeWidth=".8" strokeLinejoin="round" />
          ))}
          {o.extra?.map((e, i) => (
            <path key={i} d={e.d} stroke={e.stroke} strokeWidth={e.sw} strokeLinecap="round" fill="none" />
          ))}
          {o.id === 'tv' && <polygon points={tvScreen} fill="#8CFFB8" opacity=".75" className={styles.tvGlow} />}
        </g>
      ))}
      <g data-obj="facade">
        <path d={facade.sill} stroke="#F4EADA" strokeOpacity=".5" strokeWidth="1.2" fill="none" strokeDasharray="4 5" />
        <polygon points={facade.glass} fill="rgba(134,191,198,.13)" stroke="#86BFC6" strokeWidth="1.4" />
        {facade.frame.map((d, i) => (
          <path key={i} d={d} stroke="#86BFC6" strokeWidth="1.2" />
        ))}
        <polygon points={facade.door} fill="none" stroke="#F4EADA" strokeOpacity=".6" strokeWidth="1.2" strokeDasharray="3 4" />
        <polygon points={facade.doorOpen} fill="rgba(21,17,14,.6)" stroke="#F4EADA" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

export default function SmallSpace() {
  const root = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [mobileActive, setMobileActive] = useState(hotspots[0].id);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = prefersReduced();
    const mm = gsap.matchMedia();

    // счётчик 0 → 14 при входе
    const counter = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        if (reduce) return;
        gsap.fromTo(counter, { v: 0 }, { v: 14, duration: 1.4, ease: 'power2.out', onUpdate: () => { if (numRef.current) numRef.current.textContent = String(Math.round(counter.v)); } });
      },
    });

    mm.add(PIN_QUERY, () => {
      const stage = el.querySelector<HTMLElement>('[data-stage]')!;
      const num = el.querySelector<HTMLElement>('[data-num]')!;
      const tileEls = el.querySelectorAll<SVGElement>('[data-tile]');
      const sorted = Array.from(tileEls).sort((a, b) => Number(a.dataset.diag) - Number(b.dataset.diag));
      gsap.set(sorted, { opacity: 0, y: -18 });
      gsap.set(el.querySelectorAll('[data-wall]'), { scaleY: 0, transformOrigin: '50% 100%', transformBox: 'fill-box' });
      gsap.set(el.querySelectorAll('[data-obj]'), { opacity: 0, y: -36 });
      gsap.set(el.querySelectorAll('[data-spot]'), { scale: 0, opacity: 0 });
      gsap.set(el.querySelectorAll('[data-late]'), { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: '+=150%', pin: stage, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true },
      });
      tl.to(num, { scale: 1.04, duration: 3 })
        .to('[data-cap]', { opacity: 0, y: -20, duration: 0.8 }, 3)
        .to(num, {
          scale: 0.3,
          // offsetLeft/Top не зависят от transform — безопасно пересчитывать на refresh
          x: () => Math.min(56, Math.max(16, window.innerWidth * 0.04)) - num.offsetLeft - num.offsetWidth * 0.35,
          y: () => 96 - num.offsetTop - num.offsetHeight * 0.35,
          duration: 2.2,
          ease: 'power2.inOut',
        }, 3)
        .to(sorted, { opacity: 1, y: 0, duration: 0.5, stagger: 0.045, ease: 'power2.out' }, 3.4)
        .to(el.querySelectorAll('[data-wall]'), { scaleY: 1, duration: 1, stagger: 0.05, ease: 'power2.out' }, 4.6)
        .to(el.querySelectorAll('[data-obj]'), { opacity: 1, y: 0, duration: 0.6, stagger: 0.14, ease: 'back.out(1.6)' }, 5.2)
        .to(el.querySelectorAll('[data-spot]'), { scale: 1, opacity: 1, duration: 0.4, stagger: 0.12, ease: 'back.out(2.4)' }, 6.6)
        .to(el.querySelectorAll('[data-late]'), { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 }, 7)
        .to(el, { backgroundColor: '#211A15', duration: 3 }, 7)
        .to({}, { duration: 2 });
      return () => setActive(null);
    });

    // поток (телефон / reduced motion): план собирается разом при появлении
    mm.add(`not all and ${PIN_QUERY}`, () => {
      if (reduce) return;
      const tileEls = el.querySelectorAll<SVGElement>('[data-tile]');
      const sorted = Array.from(tileEls).sort((a, b) => Number(a.dataset.diag) - Number(b.dataset.diag));
      const tl = gsap.timeline({ scrollTrigger: { trigger: el.querySelector('[data-planwrap]'), start: 'top 75%', once: true } });
      tl.from(sorted, { opacity: 0, y: -14, duration: 0.45, stagger: 0.02 })
        .from(el.querySelectorAll('[data-wall]'), { scaleY: 0, transformOrigin: '50% 100%', transformBox: 'fill-box', duration: 0.6, stagger: 0.04 }, 0.4)
        .from(el.querySelectorAll('[data-obj]'), { opacity: 0, y: -26, duration: 0.5, stagger: 0.08, ease: 'back.out(1.6)' }, 0.7)
        .from(el.querySelectorAll('[data-spot]'), { scale: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(2.4)' }, 1.2);
    });

    return () => {
      st.kill();
      mm.revert();
    };
  }, []);

  // карточки на телефоне: активная — та, что в центре ленты
  useEffect(() => {
    const s = strip.current;
    if (!s) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setMobileActive((e.target as HTMLElement).dataset.card!)),
      { root: s, threshold: 0.6 },
    );
    s.querySelectorAll('[data-card]').forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const openSpot = (id: string) => {
    setActive(id);
    setMobileActive(id);
    const s = strip.current;
    const card = s?.querySelector<HTMLElement>(`[data-card="${id}"]`);
    if (s && card && getComputedStyle(s).display !== 'none') s.scrollTo({ left: card.offsetLeft - s.offsetLeft - 16, behavior: prefersReduced() ? 'auto' : 'smooth' });
  };

  return (
    <section id="space" ref={root} className={styles.section} aria-labelledby="space-title">
      <div className={styles.stage} data-stage>
        <div className={styles.lamp} aria-hidden="true" />
        <div className={styles.numWrap}>
          <h2 id="space-title" className={styles.num} data-num>
            <span ref={numRef} className={styles.digits}>
              14
            </span>
            <span className={styles.unit}>
              <span className="f-mono">Квадратных</span>
              <span className="f-mono">метров</span>
            </span>
          </h2>
          <p className={styles.cap} data-cap>
            Меньше половины обычной однушки. И&nbsp;сюда помещается целый Вьетнам.
          </p>
        </div>

        <div className={styles.side} data-late>
          <p className={styles.sideText}>
            Вот и весь зал. Стойка, полка с соусами, телевизор под потолком и витрина на Профсоюзную. Наведите на точку — расскажем, что где.
          </p>
          <blockquote className={styles.quote}>
            «{quotes.vietnamPiece}»<span className="f-mono">отзыв гостя</span>
          </blockquote>
          <p className={styles.scale}>
            <span className={styles.scaleTile} aria-hidden="true" /> на схеме 1 плитка ≈ 0,35 м²
          </p>
        </div>

        <div className={styles.planWrap} data-planwrap>
          <Plan />
          {hotspots.map((h) => (
            <div key={h.id} className={styles.spotBox} style={{ left: `${h.at[0]}%`, top: `${h.at[1]}%` }} data-open={active === h.id ? '' : undefined} data-side={h.side} data-mactive={mobileActive === h.id ? '' : undefined}>
              <button
                type="button"
                className={styles.spot}
                data-spot
                aria-label={`${h.n}. ${h.title}`}
                aria-expanded={active === h.id}
                aria-controls={`spot-${h.id}`}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(h.id)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setActive((a) => (a === h.id ? null : a))}
                onFocus={() => setActive(h.id)}
                onBlur={() => setActive((a) => (a === h.id ? null : a))}
                onClick={() => openSpot(h.id)}
              >
                <span className={styles.spotN}>{h.n}</span>
              </button>
              <PaperTag index={h.n} className={styles.card} id={`spot-${h.id}`} role="tooltip">
                <span className={styles.cardTitle}>{h.title}</span>
                <span className={styles.cardText}>{h.text}</span>
              </PaperTag>
            </div>
          ))}
        </div>

        <figure className={styles.polaroid} data-late>
          <Photo id="blue-counter" sizes="(min-width: 900px) 220px, 46vw" className={styles.polaroidImg} view />
          <figcaption className="f-hand">честно, это всё</figcaption>
        </figure>

        {/* телефон: карточки свайпом под планом */}
        <div ref={strip} className={styles.strip} role="list" aria-label="Что где в зале">
          {hotspots.map((h) => (
            <div key={h.id} role="listitem" className={styles.mcard} data-card={h.id} data-on={mobileActive === h.id ? '' : undefined}>
              <span className={styles.mcardN}>{String(h.n).padStart(2, '0')}</span>
              <span className={styles.cardTitle}>{h.title}</span>
              <span className={styles.cardText}>{h.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
