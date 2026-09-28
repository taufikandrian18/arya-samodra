import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import Picture from './ui/Picture.jsx';
import Odometer from './ui/Odometer.jsx';
import { attachDrag } from '../lib/drag.js';
import { getWork } from '../data.js';

const pad = (n) => String(n).padStart(2, '0');
const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// The ring (after the "People & Process" section of kononenkogroup.com):
// photos sit on the lower rim of a very large circle, each tilted along it.
// Turning the circle carries them up and across the screen.
const deg = (rad) => (rad * 180) / Math.PI;

// The ring lives in the band between the title block (`top`, its bottom
// edge) and the bottom bar (`bar`, its height): the selected photo rests
// just above the bar, and photos shrink when the band is short (landscape
// phones, browsers with tall toolbars), so they never cover the controls.
function ringGeometry(vw, vh, top = 0, bar = 0) {
  const mobile = vw < 768;
  const gap = mobile ? 14 : 24;
  const floor = vh - bar - gap; // lowest edge of the resting photo
  let W = mobile ? Math.round(vw * 0.62) : Math.round(clamp(vw * 0.24, 220, 420));
  const R = Math.round(Math.max(vw, vh) * (mobile ? 1.6 : 1.25));
  const cx = Math.round(vw * (mobile ? 0.34 : 0.3));
  // Positive angles sit left of cx. A tile at angle a + rot rests at
  // x = cx - R·sin(a + rot); a selected photo comes to rest mid-screen.
  const focus = -deg(Math.asin(clamp((vw / 2 - cx) / R, -1, 1)));
  const f = Math.abs(focus) * (Math.PI / 180);
  // Half the height of the resting photo, tilted and at its 1.06 selected scale.
  const halfH = (w) => 1.06 * ((w * 0.375) * Math.cos(f) + (w / 2) * Math.sin(f));
  if (top > 0) {
    const room = floor - top - gap * 2; // extra headroom: photos off the rest point rise along the curve
    while (W > 112 && 2 * halfH(W) > room) W -= 4;
  }
  const cy = Math.round(floor - halfH(W) - R * Math.cos(f));
  const step = deg((W * 1.12) / R);
  // The first photo starts fully on screen, a gutter in from the left edge.
  const start = deg(Math.asin(clamp((cx - W * 0.62 - 24) / R, -1, 1)));
  return { W, R, cx, cy, step, start, focus };
}

// Project pop-up in a native <dialog>. The page stays dimly visible behind it;
// the project's photos swirl up along the ring while the title rises. Wheel,
// ↑/↓ or clicking a photo turns the ring; ←/→ and Previous/Next move within
// `ids` (the list it was opened from) and wrap.
export default function ProjectViewer({ openId, ids, onChange, onClose }) {
  const ref = useRef(null);
  const ringRef = useRef(null);
  const headRef = useRef(null);
  const barRef = useRef(null);
  const opener = useRef(null);
  const closing = useRef(false);
  const titleId = useId();
  const [imageIndex, setImageIndex] = useState(0);
  const [geo, setGeo] = useState(() => ringGeometry(typeof window !== 'undefined' ? window.innerWidth : 1440, typeof window !== 'undefined' ? window.innerHeight : 900));
  const [details, setDetails] = useState(false);
  const [preview, setPreview] = useState(null); // index of the enlarged photo
  const rot = useRef({ current: 0, target: 0, frame: 0 });
  const work = openId ? getWork(openId) : null;
  const n = work?.images.length ?? 0;
  const rotFor = (i) => i * geo.step - geo.start + geo.focus;
  const maxRot = Math.max(0, rotFor(n - 1));

  // Fit the ring between the title block and the bottom bar. They only have
  // a size once the dialog is open (a closed <dialog> is display: none), so
  // measure with a ResizeObserver, which also catches font loading, a new
  // project's title wrapping differently, and viewport changes.
  useLayoutEffect(() => {
    const head = headRef.current;
    const bar = barRef.current;
    const measure = () => {
      const h = head?.offsetHeight ? head.getBoundingClientRect().bottom : 0;
      const b = bar?.offsetHeight ?? 0;
      setGeo((g) => {
        const next = ringGeometry(window.innerWidth, window.innerHeight, h, b);
        return ['W', 'R', 'cx', 'cy'].every((k) => g[k] === next[k]) ? g : next;
      });
    };
    measure();
    window.addEventListener('resize', measure);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (head) ro?.observe(head);
    if (bar) ro?.observe(bar);
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [openId]);

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
    turnTo(rotFor(next));
  };
  // The photo nearest the resting point for a given rotation.
  const nearest = (r) => clamp(Math.round((r + geo.start - geo.focus) / geo.step), 0, Math.max(0, n - 1));

  useLayoutEffect(() => {
    setImageIndex(0);
    setDetails(false);
    setPreview(null);
    const r = rot.current;
    if (r.frame) cancelAnimationFrame(r.frame);
    r.frame = 0;
    r.current = r.target = 0;
    ringRef.current?.style.setProperty('--rot', '0deg');
  }, [openId]);

  // Swipe / drag turns the ring along its rim (sideways or up/down: up and
  // left bring the next photos), then it settles on the nearest photo; a
  // quick flick moves one. A tap is still a tap and opens the preview.
  const live = useRef({});
  live.current = { geo, details, n, turnTo, focusImage, nearest };
  useEffect(() => {
    const el = ringRef.current;
    let from = 0;
    return attachDrag(el, {
      enabled: () => !live.current.details,
      start: () => {
        from = rot.current.target;
      },
      move: (dx, dy, g) => {
        const { geo: G, turnTo: turn } = live.current;
        turn(from + deg(-(g.axis === 'x' ? dx : dy) / G.R));
      },
      end: (dx, dy, g) => {
        const { n: count, focusImage: go, nearest: near } = live.current;
        const v = g.axis === 'x' ? g.vx : g.vy;
        let i = near(rot.current.target);
        if (Math.abs(v) > 0.35) i = clamp(near(from) + (v < 0 ? 1 : -1), 0, count - 1);
        go(i);
      },
    });
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

  // Open (or move) the enlarged preview; the ring follows behind it.
  const showPhoto = (i) => {
    const next = (i + n) % n;
    focusImage(next);
    setPreview(next);
  };

  const pos = Math.max(0, ids.indexOf(work.id));
  const step = (d) => onChange(ids[(pos + d + ids.length) % ids.length]);

  const onKeyDown = (e) => {
    if (preview !== null) {
      const pk = { ArrowRight: () => showPhoto(preview + 1), ArrowLeft: () => showPhoto(preview - 1), Escape: () => setPreview(null) }[e.key];
      if (pk) {
        e.preventDefault();
        pk();
      }
      return;
    }
    const k = { ArrowRight: () => step(1), ArrowLeft: () => step(-1), ArrowDown: () => focusImage(imageIndex + 1), ArrowUp: () => focusImage(imageIndex - 1), Escape: requestClose }[e.key];
    if (!k) return;
    e.preventDefault();
    k();
  };

  const onWheel = (e) => {
    if (details || preview !== null) return;
    turnTo(rot.current.target + e.deltaY * 0.02);
    setImageIndex(nearest(rot.current.target));
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
        if (preview !== null) setPreview(null);
        else requestClose();
      }}
      className="viewer m-0 h-svh max-h-none w-full max-w-none overflow-clip bg-transparent p-0 text-paper"
    >
      {/* The ring of photos. */}
      <div
        ref={ringRef}
        key={work.id}
        className="ring absolute inset-0 touch-none overflow-clip"
        style={ringStyle}
      >
        {work.images.map((key, i) => (
          <button
            key={key}
            type="button"
            aria-label={`Image ${i + 1} of ${n}`}
            aria-pressed={i === imageIndex}
            onClick={() => showPhoto(i)}
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

      {/* Bottom bar: photo stepper left, year right, on one line. */}
      <div ref={barRef} className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 px-4 pb-5 sm:px-5 md:px-10 md:pb-8 [@media(max-height:520px)]:pb-3">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-navy-deep/90 p-1 text-label uppercase text-paper backdrop-blur-sm">
          <button type="button" onClick={() => focusImage(imageIndex - 1)} aria-label="Previous photo" className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-[18px] hover:border-paper">
            ‹
          </button>
          <span aria-live="polite" className="min-w-[64px] text-center">
            {pad(imageIndex + 1)} / {pad(n)}
          </span>
          <button type="button" onClick={() => focusImage(imageIndex + 1)} aria-label="Next photo" className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-[18px] hover:border-paper">
            ›
          </button>
        </div>
        <div aria-hidden="true">
          <Odometer value={work.year} label={`Year ${work.year}`} className="block text-[clamp(44px,7vw,120px)] font-light leading-[0.8] tracking-[-0.03em] text-paper [@media(max-height:520px)]:text-[40px]" />
        </div>
      </div>

      {/* Controls row (counter left; prev/next/close right), then the title.
          One line at every width: on phones Close is a round icon button. */}
      <div ref={headRef} className="pointer-events-none relative z-10 px-4 pt-4 sm:px-5 sm:pt-5 md:px-10 md:pt-8">
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 min-w-0 overflow-hidden text-label uppercase text-paper">
            <span className="mask-rise block truncate" style={{ '--i': 0 }}>
              {pad(pos + 1)} / {pad(ids.length)}
              <span className="hidden sm:inline"> · {work.place} · {work.type}</span> · <span className="text-terracotta-light">[{work.status}]</span>
            </span>
          </p>
          <div className="pointer-events-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => step(-1)} aria-label="Previous project" className="flex h-10 w-10 items-center justify-center rounded-full text-[18px] hover:text-terracotta-light sm:h-11 sm:w-11">
              ←
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next project" className="flex h-10 w-10 items-center justify-center rounded-full text-[18px] hover:text-terracotta-light sm:h-11 sm:w-11">
              →
            </button>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Close"
              className="ml-1 flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-paper/50 px-0 text-label uppercase hover:border-paper sm:ml-2 sm:h-11 sm:px-4"
            >
              <span className="hidden sm:inline">Close</span>
              <span aria-hidden="true" className="text-[16px] leading-none sm:hidden">×</span>
            </button>
          </div>
        </div>
        <div className="mt-3 max-w-[min(100%,760px)] md:mt-4 [@media(max-height:520px)]:mt-1">
          <h2 id={titleId} key={work.id} className="m-0 text-[clamp(32px,5.6vw,92px)] font-light leading-[0.95] tracking-[-0.02em] [@media(max-height:520px)]:text-[26px]">
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
            className="pointer-events-auto mt-4 min-h-[44px] border border-paper/50 px-4 text-label uppercase hover:border-paper md:mt-5 [@media(max-height:520px)]:mt-2 [@media(max-height:520px)]:min-h-[36px]"
          >
            {details ? 'Hide details' : 'Project details'}
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

      {preview !== null && <PhotoPreview work={work} index={preview} onIndex={showPhoto} onClose={() => setPreview(null)} />}
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

// Enlarged photo over the ring, for seeing detail. Tap/click zooms to 2.5×
// at that point (then drag, scroll or pan with a finger to look around; tap
// again to zoom out). Unzoomed, swipe sideways for the next/previous photo
// and swipe down to go back to the ring.
const ZOOM = 2.5;

function PhotoPreview({ work, index, onIndex, onClose }) {
  const n = work.images.length;
  const key = work.images[index];
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const [zoom, setZoom] = useState(false);
  const zoomRef = useRef(false);
  const aim = useRef(null); // where to centre after zooming in (0..1)
  zoomRef.current = zoom;
  const live = useRef({});
  live.current = { index, onIndex, onClose };

  useEffect(() => setZoom(false), [index]);

  // After zooming in, bring the tapped point to the middle of the screen.
  useLayoutEffect(() => {
    const st = stageRef.current;
    if (!zoom || !st || !aim.current) return;
    const { fx, fy } = aim.current;
    st.scrollLeft = fx * st.scrollWidth - st.clientWidth / 2;
    st.scrollTop = fy * st.scrollHeight - st.clientHeight / 2;
    aim.current = null;
  }, [zoom]);

  useEffect(() => {
    const st = stageRef.current;
    let origin = null;
    return attachDrag(st, {
      // Zoomed: a finger scrolls natively; a mouse drags the view.
      enabled: (kind) => !(zoomRef.current && kind === 'touch'),
      start: () => {
        origin = { left: st.scrollLeft, top: st.scrollTop };
      },
      move: (dx, dy, g) => {
        if (zoomRef.current) {
          st.scrollLeft = origin.left - dx;
          st.scrollTop = origin.top - dy;
          return;
        }
        const img = imgRef.current;
        if (img) img.style.transform = g.axis === 'x' ? `translate3d(${dx}px,0,0)` : `translate3d(0,${Math.max(0, dy)}px,0)`;
      },
      end: (dx, dy, g) => {
        const img = imgRef.current;
        if (img) img.style.transform = '';
        if (zoomRef.current) return;
        const { index: i, onIndex: go, onClose: close } = live.current;
        if (g.axis === 'x' && (Math.abs(dx) > 60 || Math.abs(g.vx) > 0.35)) go(i + (dx < 0 ? 1 : -1));
        else if (g.axis === 'y' && (dy > 100 || g.vy > 0.5)) close();
      },
    });
  }, []);

  const toggleZoom = (e) => {
    if (zoom) return setZoom(false);
    const r = e.currentTarget.getBoundingClientRect();
    aim.current = { fx: r.width ? (e.clientX - r.left) / r.width : 0.5, fy: r.height ? (e.clientY - r.top) / r.height : 0.5 };
    setZoom(true);
  };

  return (
    <div role="group" aria-roledescription="photo preview" aria-label={`${work.name}, photo ${index + 1} of ${n}`} className="photo-preview absolute inset-0 z-30 flex flex-col bg-navy-deep">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5 md:px-10 md:pt-8">
        <p className="m-0 min-w-0 truncate text-label uppercase text-paper">
          {pad(index + 1)} / {pad(n)} <span className="text-haze">· {work.name}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to all photos"
          className="flex h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-full border border-paper/50 px-0 text-label uppercase text-paper hover:border-paper sm:h-11 sm:px-4"
        >
          <span className="hidden sm:inline">Back</span>
          <span aria-hidden="true" className="text-[16px] leading-none sm:hidden">×</span>
        </button>
      </div>

      <div
        ref={stageRef}
        className={`thin-scroll relative mt-3 min-h-0 flex-1 md:mt-4 ${zoom ? 'cursor-zoom-out overflow-auto' : 'cursor-zoom-in touch-none overflow-hidden'}`}
      >
        <button
          type="button"
          onClick={toggleZoom}
          aria-label={zoom ? 'Zoom out' : 'Zoom in'}
          className="block p-0"
          style={zoom ? { width: `${ZOOM * 100}%`, height: `${ZOOM * 100}%` } : { width: '100%', height: '100%' }}
        >
          <div ref={imgRef} className="h-full w-full transition-transform duration-300 ease-studio">
            <Picture
              key={key}
              name={key}
              alt={`${work.name}, image ${index + 1} of ${n}, enlarged`}
              fit="contain"
              sizes={zoom ? `${ZOOM * 100}vw` : '100vw'}
              reveal={false}
              eager
              className="preview-swap h-full w-full"
            />
          </div>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pb-5 pt-3 sm:px-5 md:px-10 md:pb-8">
        <span className="text-label uppercase text-haze">{zoom ? 'Tap to zoom out · drag to pan' : 'Tap to zoom · swipe for more'}</span>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => onIndex(index - 1)} aria-label="Previous photo" className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-[18px] text-paper hover:border-paper">
            ‹
          </button>
          <button type="button" onClick={() => onIndex(index + 1)} aria-label="Next photo" className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-[18px] text-paper hover:border-paper">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
