'use client';
import { use, useEffect, type ReactNode } from 'react';

// Ленивая гидратация секций ниже первого экрана.
// Внутри <Suspense> компонент «подвешивает» гидратацию: серверный HTML уже на экране,
// а React не тратит главный поток до первой отрисовки. Секции просыпаются по одной —
// каждая в своём idle-колбэке, чтобы эффекты (GSAP, ScrollTrigger) не слипались в одну длинную задачу.
// Клик по ещё не гидратированной секции React перехватит и гидратирует её вне очереди.

type Ric = (cb: () => void, o?: { timeout: number }) => number;

const queue: (() => void)[] = [];
let pumping = false;
let loaded = false;

function pump() {
  if (pumping || !loaded) return;
  const next = queue.shift();
  if (!next) return;
  pumping = true;
  const ric = (window as Window & { requestIdleCallback?: Ric }).requestIdleCallback;
  const run = () => {
    next();
    pumping = false;
    // следующая секция — после того как эта закоммитится
    setTimeout(pump, 60);
  };
  if (ric) ric(run, { timeout: 900 });
  else setTimeout(run, 120);
}

const promises = new Map<string, Promise<void>>();
function slot(name: string): Promise<void> {
  let p = promises.get(name);
  if (!p) {
    p = new Promise<void>((resolve) => {
      queue.push(resolve);
      if (!loaded) {
        if (document.readyState === 'complete') loaded = true;
        else window.addEventListener('load', () => ((loaded = true), pump()), { once: true });
      }
      pump();
    });
    promises.set(name, p);
  }
  return p;
}

const registered = new Set<string>();
const done = new Set<string>();
let resolveAll: () => void = () => {};
const all = new Promise<void>((r) => (resolveAll = r));

/** резолвится, когда все отложенные секции гидратированы (или через 6 с — страховка) */
export function whenAllHydrated(): Promise<void> {
  return Promise.race([all, new Promise<void>((r) => setTimeout(r, 6000))]);
}

export default function HydrateLater({ name, children }: { name: string; children: ReactNode }) {
  if (typeof window !== 'undefined') {
    registered.add(name);
    use(slot(name));
  }
  useEffect(() => {
    done.add(name);
    if (done.size >= registered.size) resolveAll();
  }, [name]);
  return children;
}
