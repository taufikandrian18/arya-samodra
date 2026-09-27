import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import Picture from './ui/Picture.jsx';
import Odometer from './ui/Odometer.jsx';
import { getWork } from '../data.js';

const pad = (n) => String(n).padStart(2, '0');
const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// The ring (after the "People & Process" section of kononenkogroup.com):
// photos sit on the lower rim of a very large circle, each tilted along it.
// Turning the circle carries them up and across the screen.
const FOCUS = -12; // degrees: where a selected photo comes to rest
const deg = (rad) => (rad * 180) / Math.PI;

function ringGeometry(vw, vh) {
  const mobile = vw < 768;
  const W = mobile ? Math.round(vw * 0.62) : Math.round(clamp(vw * 0.24, 220, 420));
  const R = Math.round(Math.max(vw, vh) * (mobile ? 1.6 : 1.25));
  const cx = Math.round(vw * (mobile ? 0.34 : 0.3));
  const cy = Math.round(vh * (mobile ? 0.7 : 0.74)) - R;
  const step = deg((W * 1.12) / R);
  // The first photo starts fully on screen, a gutter in from the left edge.
  const start = deg(Math.asin(clamp((cx - W * 0.62 - 24) / R, -1, 1)));
  return { W, R, cx, cy, step, start };
}

// Project pop-up in a native <dialog>. The page stays dimly visible behind it;
// the project's photos swirl up along the ring while the title rises. Wheel,
// ↑/↓ or clicking a photo turns the ring; ←/→ and Previous/Next move within
// `ids` (the list it was opened from) and wrap.
export default function ProjectViewer({ openId, ids, onChange, onClose }) {
  const ref = useRef(null);
  const ringRef = useRef(null);
  const opener = useRef(null);
  const closing = useRef(false);
  const titleId = useId();
  const [imageIndex, setImageIndex] = useState(0);
  const [geo, setGeo] = useState(() => ringGeometry(typeof window !== 'undefined' ? window.innerWidth : 1440, typeof window !== 'undefined' ? window.innerHeight : 900));
  const [details, setDetails] = useState(false);
  const rot = useRef({ current: 0, target: 0, frame: 0 });
  const work = openId ? getWork(openId) : null;
  const n = work?.images.length ?? 0;
  const maxRot = Math.max(0, (n - 1) * geo.step + geo.start - FOCUS);

  useEffect(() => {
    const onResize = () => setGeo(ringGeometry(window.innerWidth, window.innerHeight));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Ease the ring's rotation toward its target, one frame at a time.
  const turnTo = (target) => {
    const r = rot.current;
    r.target = clamp(target, 0, maxRot);
    const el = ringRef.current;
    if (!el) return;
    if (typeof requestAnimationFrame === 'undefined' || reducedMotion()) {
      r.current = r.target;
      el.style.setProperty('--rot', `${r.current}deg`);
      return;
    }
    if (r.frame) return;
    const tick = () => {
      r.current += (r.target - r.current) * 0.12;
      if (Math.abs(r.target - r.current) < 0.01) r.current = r.target;
      el.style.setProperty('--rot', `${r.current}deg`);
      r.frame = r.current === r.target ? 0 : requestAnimationFrame(tick);
    };
    r.frame = requestAnimationFrame(tick);
  };

  const focusImage = (i) => {
    const next = (i + n) % n;
    setImageIndex(next);
    turnTo(next * geo.step + geo.start - FOCUS);
  };

  useLayoutEffect(() => {
    setImageIndex(0);
    setDetails(false);
    const r = rot.current;
    if (r.frame) cancelAnimationFrame(r.frame);
    r.frame = 0;
    r.current = r.target = 0;
    ringRef.current?.style.setProperty('--rot', '0deg');
  }, [openId]);

  const isOpen = !!work;
  useEffect(() => {
    const d = ref.current;
    if (!isOpen || !d) return;
    opener.current = document.activeElement;
    closing.current = false;
    if (!d.open) d.showModal();
    // showModal() focuses the first photo, which is still mid-swirl below
    // the fold; browsers scroll to it and the whole pop-up jumps. Keep focus
    // on the dialog and pin its scroll at the top.
    d.focus?.({ preventScroll: true });
    d.scrollTop = 0;
    return () => {
      if (d.open) d.close();
      const el = opener.current;
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!work) return null;

  // Swirl the photos back down, then let the parent unmount us.
  const requestClose = () => {
    const d = ref.current;
    const ring = ringRef.current;
    if (closing.current) return;
    if (!d || !ring || typeof ring.animate !== 'function' || reducedMotion()) return onClose();
    closing.current = true;
    ring.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(70vh) rotate(-6deg)', opacity: 0 }], {
      duration: 560,
      easing: 'cubic-bezier(0.7,0,0.84,0)',
      fill: 'forwards',
    });
    d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 560, easing: 'ease-in', fill: 'forwards' }).finished.then(onClose, onClose);
  };

  const pos = Math.max(0, ids.indexOf(work.id));
  const step = (d) => onChange(ids[(pos + d + ids.length) % ids.length]);

  const onKeyDown = (e) => {
    const k = { ArrowRight: () => step(1), ArrowLeft: () => step(-1), ArrowDown: () => focusImage(imageIndex + 1), ArrowUp: () => focusImage(imageIndex - 1), Escape: requestClose }[e.key];
    if (!k) return;
    e.preventDefault();
    k();
  };

  const onWheel = (e) => {
    if (details) return;
    turnTo(rot.current.target + e.deltaY * 0.02);
  };

  const ringStyle = { '--R': `${geo.R}px`, '--W': `${geo.W}px`, '--cx': `${geo.cx}px`, '--cy': `${geo.cy}px`, '--rot': '0deg' };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      tabIndex={-1}
      autoFocus
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      className="viewer m-0 h-svh max-h-none w-full max-w-none overflow-clip bg-transparent p-0 text-paper"
    >
      {/* The ring of photos. */}
      <div ref={ringRef} key={work.id} className="ring absolute inset-0 overflow-clip" style={ringStyle}>
        {work.images.map((key, i) => (
          <button
            key={key}
            type="button"
            aria-label={`Image ${i + 1} of ${n}`}
            aria-pressed={i === imageIndex}
            onClick={() => focusImage(i)}
            className="ring-tile"
            style={{ '--a': `${geo.start - i * geo.step}deg`, '--i': i }}
          >
            <Picture
              name={key}
              alt={`${work.name}, image ${i + 1} of ${n}`}
              sizes={`${geo.W}px`}
              reveal={false}
              eager={i < 4}
              className="h-full w-full"
            />
          </button>
        ))}
      </div>

      {/* Year, large and behind the photos. */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-6 right-5 md:bottom-8 md:right-10">
        <Odometer value={work.year} label={`Year ${work.year}`} className="text-[clamp(56px,10vw,160px)] font-light leading-none tracking-[-0.03em] text-paper" />
      </div>

      {/* Title and meta, top left; controls, top right. */}
      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-6 px-5 pt-5 md:px-10 md:pt-8">
        <div className="max-w-[min(62vw,760px)]">
          <p className="m-0 mb-3 overflow-hidden text-label uppercase text-paper">
            <span className="mask-rise block" style={{ '--i': 0 }}>
              {pad(pos + 1)} / {pad(ids.length)} · {work.place} · {work.type} · <span className="text-terracotta-light">[{work.status}]</span>
            </span>
          </p>
          <h2 id={titleId} key={work.id} className="m-0 text-[clamp(36px,5.6vw,92px)] font-light leading-[0.95] tracking-[-0.02em]">
            {splitLines(work.name).map((line, i, all) => (
              <span key={i} className="block overflow-hidden pb-[0.06em]">
                <span className="mask-rise block" style={{ '--i': i + 1 }}>
                  {line}
                  {i < all.length - 1 && ' '}
                </span>
              </span>
            ))}
          </h2>
          <button
            type="button"
            aria-expanded={details}
            onClick={() => setDetails((v) => !v)}
            className="pointer-events-auto mt-5 min-h-[44px] border border-paper/50 px-4 text-label uppercase hover:border-paper"
          >
            {details ? 'Hide details' : 'Project details'}
          </button>
        </div>
        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="Previous project" className="flex h-11 w-11 items-center justify-center text-[20px] hover:text-terracotta-light">
            ←
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next project" className="flex h-11 w-11 items-center justify-center text-[20px] hover:text-terracotta-light">
            →
          </button>
          <button type="button" onClick={requestClose} className="ml-2 min-h-[44px] border border-paper/50 px-4 text-label uppercase hover:border-paper">
            Close
          </button>
        </div>
      </div>

      {/* Details sheet: slides over the ring when asked for. */}
      <aside
        aria-label="Project details"
        hidden={!details}
        className="details-sheet thin-scroll absolute inset-y-0 left-0 z-20 w-full max-w-[520px] overflow-y-auto bg-navy-deep px-5 pb-10 pt-24 md:px-10"
      >
        <dl className="m-0 border-t border-paper/15">
          {[
            ['Location', work.place],
            ['Year', work.year],
            ['Status', work.status],
            ['Scope', work.scope],
            ['Client', work.client],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[88px_1fr] gap-4 border-b border-paper/15 py-3">
              <dt className="text-label uppercase text-haze">{k}</dt>
              <dd className="m-0 text-[14px] leading-[1.5]">{v}</dd>
            </div>
          ))}
        </dl>
        {work.heading && <h3 className="m-0 mt-8 text-label uppercase text-terracotta-light">{work.heading}</h3>}
        <p className="text-pretty m-0 mt-4 text-[18px] font-light leading-[1.5]">{work.description}</p>
        <button type="button" onClick={() => setDetails(false)} className="mt-8 min-h-[44px] border border-paper/50 px-4 text-label uppercase hover:border-paper">
          Back to photos
        </button>
      </aside>
    </dialog>
  );
}

// Break a project name into two balanced lines for the masked rise.
function splitLines(name) {
  const words = name.split(' ');
  if (words.length < 3) return [name];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}
