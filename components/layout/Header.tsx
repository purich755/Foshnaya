'use client';
import { useEffect, useRef, useState } from 'react';
import OpenStatus from '@/components/fx/OpenStatus';
import TileGrid from '@/components/fx/TileGrid';
import { venue } from '@/data/venue';
import { gsap } from '@/lib/gsap';
import { lockScroll } from '@/lib/scroll';
import { Logo, NAV } from './nav';
import styles from './Header.module.css';


export default function Header() {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 80);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    lockScroll(open);
    if (open) {
      const links = menu.querySelectorAll('[data-mlink]');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduce) gsap.fromTo(links, { xPercent: -30, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power4.out', delay: 0.1 });
      (links[0] as HTMLElement | undefined)?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false);
          burgerRef.current?.focus();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [open]);

  return (
    <>
      <header className={`${styles.header} ${solid || open ? styles.solid : ''} ${hidden && !open ? styles.hide : ''}`}>
        <div className={styles.inner}>
          <a href="#top" className={styles.home} aria-label="Фошная — в начало">
            <Logo />
          </a>
          <nav className={styles.nav} aria-label="Разделы">
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className={styles.right}>
            <OpenStatus compact className={styles.status} />
            <a className={styles.call} href={venue.phoneHref}>
              Позвонить
            </a>
            <button
              ref={burgerRef}
              type="button"
              className={styles.burger}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" ref={menuRef} className={`${styles.menu} ${open ? styles.menuOpen : ''}`} hidden={!open} data-lenis-prevent>
        <TileGrid size={60} color="var(--ochre-d)" opacity={0.45} />
        <nav className={styles.mnav} aria-label="Меню">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} data-mlink onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className={styles.mfoot}>
          <OpenStatus />
          <a className="btn btn--dark" href={venue.phoneHref}>
            Позвонить · {venue.phone}
          </a>
          <p className="f-mono">{venue.streetShort} · 12:00 — 23:00</p>
        </div>
      </div>
    </>
  );
}
