'use client';
// Единая точка регистрации GSAP. В первый бандл идёт только ScrollTrigger;
// Draggable / Inertia / MotionPath нужны двум секциям ниже первого экрана — грузятся по требованию.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });
}

export { gsap, ScrollTrigger };

type DragKit = { Draggable: typeof import('gsap/Draggable').Draggable };
let dragKit: Promise<DragKit> | null = null;

/** Draggable + InertiaPlugin + MotionPathPlugin, зарегистрированные один раз */
export function loadDrag(): Promise<DragKit> {
  if (!dragKit) {
    dragKit = Promise.all([import('gsap/Draggable'), import('gsap/InertiaPlugin'), import('gsap/MotionPathPlugin')]).then(([d, i, m]) => {
      gsap.registerPlugin(d.Draggable, i.InertiaPlugin, m.MotionPathPlugin);
      return { Draggable: d.Draggable };
    });
  }
  return dragKit;
}

/** prefers-reduced-motion на момент вызова */
export function prefersReduced(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** «большой» режим: десктоп, анимации разрешены — тот же запрос, что в CSS для pin-сцен */
export const PIN_QUERY = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';
