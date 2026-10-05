import styles from './Logo.module.css';

export const NAV = [
  { href: '#space', label: '14 м²' },
  { href: '#pho', label: 'Фо' },
  { href: '#toppings', label: 'Добавки' },
  { href: '#menu', label: 'Меню' },
  { href: '#gallery', label: 'Галерея' },
  { href: '#route', label: 'Как дойти' },
];

/** Логотип-вывеска: красная плашка, жёлтые буквы. Векторного логотипа заведения нет — типографический. */
export function Logo({ small }: { small?: boolean }) {
  return (
    <span className={`${styles.logo} ${small ? styles.small : ''}`}>
      <span className={styles.text}>Фошная</span>
    </span>
  );
}
