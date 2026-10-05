import type { CSSProperties, ElementType, ReactNode } from 'react';
import styles from './PaperTag.module.css';

// детерминированные повороты: одинаково на сервере и в браузере
const TILTS = [-4, 3, -6, 2, 5, -2, -5, 4, 1, -3];
const TAPES = [-4, 3, 2, -3, 4, -2];

type Props = {
  index?: number;
  /** явный угол вместо табличного */
  rotate?: number;
  tape?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  [k: string]: unknown;
};

/** Бумажный стикер цвета рисовой бумаги со скотчем сверху. */
export default function PaperTag({ index = 0, rotate, tape = true, as: Tag = 'div', className, style, children, ...rest }: Props) {
  const r = rotate ?? TILTS[index % TILTS.length];
  const tr = TAPES[index % TAPES.length];
  return (
    <Tag
      className={`${styles.tag} ${className ?? ''}`}
      style={{ '--r': `${r}deg`, '--tr': `${tr}deg`, ...style } as CSSProperties}
      {...rest}
    >
      {tape && <span className={styles.tape} aria-hidden="true" />}
      {children}
    </Tag>
  );
}
