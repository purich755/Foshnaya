'use client';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import styles from './Steam.module.css';

type Props = {
  /** плотность 0–1; можно менять на лету через densityRef */
  density?: number;
  densityRef?: MutableRefObject<number>;
  /** нарастание плотности при появлении (с) */
  intro?: number;
  /** где рождается пар: 0 — у нижнего края, 0.3 — выше */
  base?: number;
  /** множитель прозрачности — для светлого фона */
  strength?: number;
  className?: string;
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * .5 + .5; gl_Position = vec4(aPos, 0., 1.); }`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform float uDensity;
uniform float uBase;
uniform float uStrength;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= .5; }
  return v;
}
void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);
  vec2 d = p - m;
  float dist = length(d);
  float fall = exp(-dist * dist * 22.) * uMouseOn;
  // завихрение и раздвигание вокруг курсора
  float ang = fall * 2.4;
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 q = m + rot * (p - m);
  q += normalize(d + 1e-4) * fall * .09;

  float t = uTime;
  vec2 flow = vec2(q.x * 1.9 + sin(q.y * 2.6 + t * .35) * .22, q.y * 1.35 - t * .12);
  float n = fbm(flow + vec2(fbm(flow * 1.4 + t * .04), fbm(flow * 1.1 - t * .03)) * 1.1);
  float shape = smoothstep(.42, .98, n);

  // плотность: максимум внизу, к верху затухает
  float y = max(uv.y - uBase, 0.) / (1. - uBase);
  float mask = smoothstep(1.02, .05, y) * smoothstep(-.02, .12, uv.y);
  float a = min(shape * mask * uDensity * .35 * uStrength, .7);
  a *= 1. - fall * .9;
  vec3 col = mix(vec3(1., .97, .92), vec3(.91, .64, .24), .14 + .22 * (1. - uv.y));
  gl_FragColor = vec4(col * a, a);
}`;

export default function Steam({ density = 0.8, densityRef, intro = 1.5, base = 0, strength = 1, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const staticRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // WebGL поднимаем после load: компиляция шейдера не мешает первой отрисовке и гидратации
  useEffect(() => {
    let t = 0;
    const go = () => (t = window.setTimeout(() => setReady(true), 120));
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('load', go);
    };
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !ready) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.hidden = true;
      if (staticRef.current) staticRef.current.hidden = false;
      return;
    }

    let running = false;
    let visible = false;
    let raf = 0;
    let w = 0;
    let h = 0;
    const start = performance.now();
    let cur = 0;
    const mouse = { x: 0.5, y: -1, on: 0, target: 0 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      // рендер в половинном разрешении, CSS растягивает
      w = Math.max(2, Math.round(r.width * dpr * 0.5));
      h = Math.max(2, Math.round(r.height * dpr * 0.5));
      canvas.width = w;
      canvas.height = h;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !visible) return;
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      mouse.x = x;
      mouse.y = y;
      mouse.target = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? 1 : 0;
    };

    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
    let draw: (t: number) => void;

    if (gl) {
      const compile = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const u = (n: string) => gl.getUniformLocation(prog, n);
      const uRes = u('uRes'), uTime = u('uTime'), uMouse = u('uMouse'), uMouseOn = u('uMouseOn'), uDensity = u('uDensity'), uBase = u('uBase');
      gl.uniform1f(uBase, base);
      gl.uniform1f(u('uStrength'), strength);
      draw = (t) => {
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
        gl.uniform1f(uTime, t);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uMouseOn, mouse.on);
        gl.uniform1f(uDensity, cur);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      };
    } else {
      // фолбэк: 40 мягких клубов на Canvas 2D
      const ctx = canvas.getContext('2d')!;
      const puffs = Array.from({ length: 40 }, (_, i) => ({ x: (i * 0.618) % 1, y: (i * 0.371) % 1, r: 0.08 + ((i * 7) % 10) / 70, s: 0.02 + ((i * 3) % 7) / 260 }));
      draw = (t) => {
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (const p of puffs) {
          const yy = 1 - ((p.y + t * p.s) % 1.2);
          const xx = p.x + Math.sin(t * 0.4 + p.y * 9) * 0.04;
          let px = xx * w, py = yy * h;
          const dx = xx - mouse.x, dy = (1 - yy) - mouse.y;
          const dd = Math.hypot(dx, dy);
          if (mouse.on > 0.05 && dd < 0.2) { px += (dx / dd) * (0.2 - dd) * w * 0.5 * mouse.on; py -= (dy / dd) * (0.2 - dd) * h * 0.5 * mouse.on; }
          const fade = Math.max(0, 1 - (1 - yy)) * cur * 0.22;
          const g = ctx.createRadialGradient(px, py, 0, px, py, p.r * w);
          g.addColorStop(0, `rgba(255,244,228,${fade})`);
          g.addColorStop(1, 'rgba(255,244,228,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, p.r * w, 0, Math.PI * 2);
          ctx.fill();
        }
      };
    }

    const loop = (now: number) => {
      const t = (now - start) / 1000;
      const target = densityRef ? densityRef.current : density;
      const ramp = intro > 0 ? Math.min(1, t / intro) : 1;
      cur += (target * ramp - cur) * 0.06;
      mouse.on += (mouse.target - mouse.on) * 0.08;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else pause();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? pause() : play());
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [ready, density, densityRef, intro, base, strength]);

  return (
    <div className={`${styles.root} ${className ?? ''}`} aria-hidden="true">
      <canvas ref={ref} className={styles.canvas} />
      <div ref={staticRef} className={styles.static} hidden />
    </div>
  );
}
