'use client';
import { useEffect, useState } from 'react';
import { venue } from '@/data/venue';
import styles from './MobileBar.module.css';

/** Фиксированная панель на телефонах: появляется после hero, прячется в финале. */
export default function MobileBar() {
  const [pastHero, setPastHero] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const hero = document.getElementById('top');
    const fin = document.getElementById('finale');
    // наблюдатели вместо покадрового getBoundingClientRect — без принудительной раскладки
    const io1 = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin: '-80px 0px 0px 0px' });
    const io2 = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting || e.boundingClientRect.top < 0), { rootMargin: '0px 0px -40% 0px' });
    if (hero) io1.observe(hero);
    if (fin) io2.observe(fin);
    return () => {
      io1.disconnect();
      io2.disconnect();
    };
  }, []);
  const show = pastHero && !atEnd;
  return (
    <div className={`${styles.bar} ${show ? styles.show : ''}`} aria-hidden={!show}>
      <a href={venue.phoneHref} className={styles.call} tabIndex={show ? 0 : -1}>
        Позвонить
      </a>
      <a href="#route" className={styles.route} tabIndex={show ? 0 : -1}>
        Маршрут
      </a>
    </div>
  );
}
