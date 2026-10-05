'use client';
import { useOpenStatus } from '@/lib/useOpenStatus';
import styles from './OpenStatus.module.css';

const TEXT = {
  open: 'Открыто · до 23:00',
  closing: 'Закрываемся в 23:00 · успевайте',
  closed: 'Закрыто · откроемся в 12:00',
} as const;

/** Живой статус по времени Казани. До гидратации — нейтральные часы работы (сервер не знает время клиента). */
export default function OpenStatus({ compact, className }: { compact?: boolean; className?: string }) {
  const state = useOpenStatus();
  return (
    <span className={`${styles.root} ${compact ? styles.compact : ''} ${className ?? ''}`} data-state={state ?? 'pending'} aria-live="polite">
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.text}>{state ? (compact ? (state === 'closed' ? 'Закрыто до 12:00' : state === 'closing' ? 'До 23:00 · успевайте' : 'Открыто до 23:00') : TEXT[state]) : compact ? '12:00 — 23:00' : 'Ежедневно 12:00 — 23:00'}</span>
    </span>
  );
}
