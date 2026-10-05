'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { photo, type PhotoId } from '@/data/photos';
import { gsap, prefersReduced } from '@/lib/gsap';
import { lockScroll } from '@/lib/scroll';
import styles from './Lightbox.module.css';

export type LbItem = { id: PhotoId; label: string };

type Props = {
  items: LbItem[];
  index: number;
  onIndex: (n: number) => void;
  onClose: () => void;
  /** откуда раскрываться — прямоугольник экрана телевизора */
  origin: () => DOMRect | null;
};

function fitRect(w: number, h: number) {
  const pad = window.innerWidth < 700 ? 12 : 48;
  const maxW = window.innerWidth - pad * 2;
  const maxH = window.innerHeight - pad * 2 - 64;
  const s = Math.min(maxW / w, maxH / h);
  const fw = w * s;
  const fh = h * s;
  return { left: (window.innerWidth - fw) / 2, top: (window.innerHeight - 64 - fh) / 2 + 8, width: fw, height: fh };
}

export default function Lightbox({ items, index, onIndex, onClose, origin }: Props) {
  const [mounted, setMounted] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const p = photo(items[index].id);
  const [rect, setRect] = useState(() => (typeof window === 'undefined' ? null : fitRect(p.width, p.height)));

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const on = () => setRect(fitRect(p.width, p.height));
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [p.width, p.height]);

  // FLIP: из экрана телевизора — в полный размер
  useLayoutEffect(() => {
    if (!mounted || !frame.current || !box.current) return;
    lockScroll(true);
    const prev = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus({ preventScroll: true });
    const o = origin();
    const r = frame.current.getBoundingClientRect();
    if (o && !prefersReduced()) {
      gsap.fromTo(box.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.from(frame.current, {
        x: o.left + o.width / 2 - (r.left + r.width / 2),
        y: o.top + o.height / 2 - (r.top + r.height / 2),
        scaleX: o.width / r.width,
        scaleY: o.height / r.height,
        borderRadius: 40,
        duration: 0.6,
        ease: 'power3.inOut',
      });
    }
    return () => {
      lockScroll(false);
      prev?.focus({ preventScroll: true });
    };
    // открывается один раз
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const o = origin();
    const f = frame.current;
    if (!o || !f || prefersReduced()) return onClose();
    const r = f.getBoundingClientRect();
    gsap.to(box.current, { opacity: 0, duration: 0.4, delay: 0.15 });
    gsap.to(f, {
      x: o.left + o.width / 2 - (r.left + r.width / 2),
      y: o.top + o.height / 2 - (r.top + r.height / 2),
      scaleX: o.width / r.width,
      scaleY: o.height / r.height,
      duration: 0.5,
      ease: 'power3.inOut',
      onComplete: onClose,
    });
  };

  const go = (d: number) => onIndex((index + d + items.length) % items.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab' && box.current) {
        // фокус-ловушка
        const f = Array.from(box.current.querySelectorAll<HTMLElement>('button'));
        const i = f.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // свайп
  const sx = useRef<number | null>(null);

  if (!mounted || !rect) return null;
  const srcSet = p.widths.map((w) => `${p.src}-${w}.webp ${w}w`).join(', ');
  return createPortal(
    <div
      ref={box}
      className={styles.box}
      role="dialog"
      aria-modal="true"
      aria-label="Фото «Фошной» на весь экран"
      onClick={(e) => e.target === e.currentTarget && close()}
      onPointerDown={(e) => (sx.current = e.clientX)}
      onPointerUp={(e) => {
        if (sx.current === null) return;
        const dx = e.clientX - sx.current;
        sx.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      data-lenis-prevent
    >
      <div ref={frame} className={styles.frame} style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }} onClick={(e) => e.target === e.currentTarget && close()}>
        <img key={p.id} src={`${p.src}-${p.widths[p.widths.length - 1]}.webp`} srcSet={srcSet} sizes={`${Math.round(rect.width)}px`} alt={p.alt} className={styles.img} style={{ backgroundColor: p.color }} draggable={false} />
      </div>
      <div className={styles.bar}>
        <span className={styles.count}>
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
        <span className={styles.label}>{items[index].label}</span>
        <div className={styles.btns}>
          <button type="button" onClick={() => go(-1)} aria-label="Предыдущее фото">
            ←
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Следующее фото">
            →
          </button>
          <button ref={closeBtn} type="button" onClick={close} aria-label="Закрыть">
            ✕
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
