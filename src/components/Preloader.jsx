import { useEffect, useRef, useState } from 'react';
import { hero } from '../data.js';

const MIN_MS = 2200; // never flash: the count always takes at least this long
const MAX_MS = 7000; // never trap: give up waiting and reveal the page

// Load one thing and report when it is done (or failed: a failure still counts).
const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = src;
  });

// Wait for the hero's own <video> (no second download) to be playable.
function heroVideoReady() {
  const v = document.querySelector('#top video');
  if (!v || v.readyState >= 3) return Promise.resolve();
  return new Promise((resolve) => {
    v.addEventListener('canplay', resolve, { once: true });
    v.addEventListener('error', resolve, { once: true });
  });
}

// The number's colour runs white → terracotta → navy as it counts 0 → 100,
// blended in OKLab so the middle stays rich. On the white screen it
// materialises out of the white, warms to terracotta and settles in navy.
function colourAt(v) {
  if (v <= 50) return `color-mix(in oklab, #9D5338 ${v * 2}%, #FFFFFF)`;
  return `color-mix(in oklab, #06152C ${(v - 50) * 2}%, #9D5338)`;
}

// After kononenkogroup.com: a white screen, a hairline across the top that
// grows with loading progress and a counter bottom-left counting 0 → 100.
// At 100 the number slides up, the line retracts to the right and the
// screen fades away. The html element carries `preloading` meanwhile, which
// holds the hero's entrance animations until the page is revealed.
export default function Preloader() {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined' || import.meta.env.MODE === 'test') return 'gone';
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'gone';
    return 'loading';
  });
  const [shown, setShown] = useState(0);
  const target = useRef(0);

  useEffect(() => {
    if (state !== 'loading') return;
    const root = document.documentElement;
    root.classList.add('preloading');
    const start = performance.now();

    const tasks = [document.fonts?.ready ?? Promise.resolve(), loadImage(hero.poster), heroVideoReady()];
    let done = 0;
    tasks.forEach((t) =>
      Promise.resolve(t).then(() => {
        done += 1;
        target.current = Math.max(target.current, (done / tasks.length) * 100);
      })
    );

    // The count follows the slower of two things: a time curve (so it never
    // flashes past) and real progress (so it waits for the hero, stalling
    // around 60 like the reference). After MAX_MS it finishes regardless.
    let frame = 0;
    let value = 0;
    const tick = (now) => {
      const t = now - start;
      const k = Math.min(1, t / MIN_MS);
      const timeCurve = 100 * k * k * (3 - 2 * k);
      const real = t > MAX_MS ? 100 : target.current === 100 ? 100 : Math.max(target.current, Math.min(60, timeCurve));
      const goal = Math.min(timeCurve, real);
      value += (goal - value) * 0.18;
      if (goal === 100 && 100 - value < 0.6) value = 100;
      setShown(Math.floor(value));
      if (value >= 100) {
        setState('leaving');
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state]);

  useEffect(() => {
    if (state !== 'leaving') return;
    const id = setTimeout(() => {
      document.documentElement.classList.remove('preloading');
      setState('gone');
    }, 1100);
    return () => clearTimeout(id);
  }, [state]);

  if (state === 'gone') return null;

  return (
    <div
      aria-hidden="true"
      data-state={state}
      className="preloader fixed inset-0 z-[200] bg-paper text-navy"
    >
      <div className="preloader-line absolute left-0 top-0 h-px bg-current" style={{ width: `${shown}%` }} />
      <div className="absolute bottom-3 left-5 overflow-hidden md:bottom-4 md:left-10">
        <span className="preloader-count block text-[clamp(120px,24vw,360px)] font-light tabular-nums leading-[0.85] tracking-[-0.05em]" style={{ color: colourAt(shown) }}>
          {shown}
        </span>
      </div>
    </div>
  );
}
