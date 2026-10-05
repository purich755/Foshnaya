import { venue } from '@/data/venue';
import { Logo, NAV } from './nav';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={`${styles.footer} cv`}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.brand}>
          <a href="#top" aria-label="Фошная — в начало">
            <Logo />
          </a>
          <p className={styles.tag}>Вьетнамская закусочная фо. Навынос, с {venue.since} года.</p>
        </div>
        <nav className={styles.nav} aria-label="Разделы внизу">
          {NAV.slice(1).map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <dl className={styles.info}>
          <div>
            <dt className="f-mono">Адрес</dt>
            <dd>
              {venue.city}, {venue.street}
            </dd>
          </div>
          <div>
            <dt className="f-mono">Часы</dt>
            <dd>Ежедневно 12:00 — 23:00</dd>
          </div>
          <div>
            <dt className="f-mono">Телефон</dt>
            <dd>
              <a href={venue.phoneHref}>{venue.phone}</a>
            </dd>
          </div>
          <div>
            <dt className="f-mono">VK</dt>
            <dd>
              <a href={venue.vk} target="_blank" rel="noopener noreferrer">
                {venue.vkLabel}
              </a>
            </dd>
          </div>
        </dl>
      </div>
      <div className={`wrap ${styles.bottom}`}>
        <span>© Фошная, Казань</span>
        <span>Демо-версия сайта</span>
      </div>
    </footer>
  );
}
