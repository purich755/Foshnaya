'use client';
import { useEffect, useState } from 'react';
import { HOURS } from '@/data/venue';

export type OpenState = 'open' | 'closing' | 'closed';

/** минуты от полуночи в Казани (Europe/Moscow, UTC+3) */
export function kazanMinutes(date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return h * 60 + m;
}

export function statusAt(min: number): OpenState {
  if (min >= HOURS.openMin && min < HOURS.closingSoonMin) return 'open';
  if (min >= HOURS.closingSoonMin && min < HOURS.closeMin) return 'closing';
  return 'closed';
}

/** для проверки: ?t=22:45 подменяет текущее время */
function overrideMinutes(): number | null {
  const t = new URLSearchParams(window.location.search).get('t');
  const m = t?.match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** null до гидратации — время зависит от клиента, на сервере не рендерим */
export function useOpenStatus(): OpenState | null {
  const [state, setState] = useState<OpenState | null>(null);
  useEffect(() => {
    const tick = () => setState(statusAt(overrideMinutes() ?? kazanMinutes()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return state;
}
