'use client';
import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from 'react';
import styles from './SignFlicker.module.css';

type Props = {
  as?: ElementType;
  /** red — красная плашка с жёлтым текстом, yellow — наоборот */
  tone?: 'red' | 'yellow';
  vertical?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  id?: string;
};

/** Вывеска: при первом появлении «включается» — 2–3 вспышки лампы, дальше горит ровно. */
export default function SignFlicker({ as: Tag = 'div', tone = 'red', vertical, className, style, children, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add(styles.on);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const cls = ['sign', tone === 'yellow' ? 'sign--y' : '', vertical ? 'sign--v' : '', styles.sign, className ?? ''].join(' ');
  return (
    <Tag ref={ref} className={cls} style={style} id={id}>
      {children}
    </Tag>
  );
}
