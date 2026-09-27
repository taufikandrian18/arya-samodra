import { useEffect, useRef, useState } from 'react';
import Picture from './ui/Picture.jsx';
import { focus, getWork } from '../data.js';

const pad = (n) => String(n).padStart(2, '0');

// In Focus: a horizontal run of project panes. While the section is on
// screen, vertical scrolling moves the panes sideways; at either end the
// page carries on. Touch swipes natively; the track is keyboard scrollable.
// Each pane's photo drifts slightly against the scroll (parallax).
export default function ProjectFocus({ onOpenStory }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const works = focus.ids.map(getWork).filter(Boolean);

  const currentRef = useRef(0);
  const dragged = useRef(false);

  // Move to pane i with the browser's own smooth scroll (works with snapping
  // in every browser, unlike stepping scrollLeft by hand).
  const goTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const panes = track.querySelectorAll('[data-pane]');
    const pane = panes[Math.max(0, Math.min(panes.length - 1, i))];
    if (!pane) return;
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: pane.offsetLeft - pad, behavior: reduce ? 'auto' : 'smooth' });
  };

  // Wheel: one gesture = one pane; at either end the page carries on.
  // Mouse: drag the panes. Trackpad sideways and touch: native, snapped.
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let acc = 0;
    let lockedUntil = 0;
    const atStart = () => track.scrollLeft <= 4;
    const atEnd = () => track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const dir = Math.sign(e.deltaY);
      if ((dir < 0 && atStart()) || (dir > 0 && atEnd())) return;
      e.preventDefault();
      if (performance.now() < lockedUntil) return;
      acc += e.deltaY;
      if (Math.abs(acc) < 24) return;
      const n = track.querySelectorAll('[data-pane]').length;
      const next = Math.max(0, Math.min(n - 1, currentRef.current + dir));
      acc = 0;
      lockedUntil = performance.now() + 650;
      if (next === currentRef.current) {
        // Last pane already centred but the track can still travel: finish it.
        track.scrollTo({ left: dir > 0 ? track.scrollWidth : 0, behavior: 'smooth' });
      } else goTo(next);
    };

    let startX = 0;
    let startLeft = 0;
    let startIndex = 0;
    let pointer = null;
    const onDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      pointer = e.pointerId;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      startIndex = currentRef.current;
      dragged.current = false;
    };
    const onMove = (e) => {
      if (e.pointerId !== pointer) return;
      const dx = e.clientX - startX;
      if (!dragged.current && Math.abs(dx) < 6) return;
      if (!dragged.current) {
        dragged.current = true;
        track.setPointerCapture?.(e.pointerId);
        track.classList.add('is-dragging');
      }
      track.scrollLeft = startLeft - dx;
    };
    const onUp = (e) => {
      if (e.pointerId !== pointer) return;
      pointer = null;
      if (!dragged.current) return;
      track.classList.remove('is-dragging');
      const dx = e.clientX - startX;
      // One pane per drag, counted from where the drag began.
      goTo(startIndex + (Math.abs(dx) > 60 ? -Math.sign(dx) : 0));
      setTimeout(() => (dragged.current = false), 0);
    };

    section.addEventListener('wheel', onWheel, { passive: false });
    track.addEventListener('pointerdown', onDown);
    track.addEventListener('pointermove', onMove);
    track.addEventListener('pointerup', onUp);
    track.addEventListener('pointercancel', onUp);
    return () => {
      section.removeEventListener('wheel', onWheel);
      track.removeEventListener('pointerdown', onDown);
      track.removeEventListener('pointermove', onMove);
      track.removeEventListener('pointerup', onUp);
      track.removeEventListener('pointercancel', onUp);
    };
  }, []);

  // Progress bar, current pane and parallax, from the track's scroll.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      setProgress(max > 0 ? track.scrollLeft / max : 0);
      const box = track.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const anchor = box.left + pad;
      let best = 0;
      let bestD = Infinity;
      track.querySelectorAll('[data-pane]').forEach((pane, i) => {
        const r = pane.getBoundingClientRect();
        pane.style.setProperty('--shift', String(Math.max(-1, Math.min(1, (r.left + r.width / 2 - (box.left + box.width / 2)) / r.width))));
        if (Math.abs(r.left - anchor) < bestD) {
          bestD = Math.abs(r.left - anchor);
          best = i;
        }
      });
      if (max > 0 && track.scrollLeft >= max - 4) best = works.length - 1;
      currentRef.current = best;
      setCurrent(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [works.length]);

  const ids = works.map((w) => w.id);

  return (
    <section
      ref={sectionRef}
      id="project"
      data-tone="dark"
      aria-roledescription="carousel"
      aria-label="In focus"
      className="snap-section flex flex-col bg-navy-deep pb-8 pt-24 text-paper"
    >
      <div className="flex items-end justify-between gap-6 px-5 md:px-10">
        <div className="eyebrow eyebrow-dark">
          <span className="eyebrow-rule" />
          {focus.label}
        </div>
        <div className="flex items-center gap-2 text-label text-haze">
          <span aria-live="polite" className="mr-2">
            {pad(current + 1)} / {pad(works.length)}
          </span>
          <button
            type="button"
            aria-label="Previous project"
            disabled={current === 0 && progress <= 0.001}
            onClick={() => goTo(current - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/30 text-[16px] text-paper transition-colors hover:border-paper disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next project"
            disabled={progress >= 0.999}
            onClick={() => goTo(current + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/30 text-[16px] text-paper transition-colors hover:border-paper disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        tabIndex={0}
        aria-label="In focus projects, scroll horizontally"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(current + (e.key === 'ArrowRight' ? 1 : -1));
          }
        }}
        className="focus-track mt-6 flex min-h-0 flex-1 snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto overflow-y-hidden px-5 outline-none md:scroll-px-10 md:gap-6 md:px-10"
      >
        {works.map((w, i) => (
          <article key={w.id} data-pane className="focus-pane relative min-h-[60svh] w-[84vw] shrink-0 snap-start self-stretch overflow-hidden md:min-h-0 md:w-[min(64vw,1100px)]">
            <div className="focus-parallax absolute inset-y-0 -left-[6%] w-[112%]">
              <Picture name={w.cover} alt={`${w.name}, ${w.place}`} sizes="(min-width:768px) 64vw, 84vw" className="h-full w-full" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,21,44,0)_45%,rgba(6,21,44,.85)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-5 p-5 md:p-8">
              <div className="min-w-0">
                <div className="text-label uppercase text-paper">
                  {pad(i + 1)} · {w.place} · {w.type} · <span className="text-terracotta-light">[{w.status}]</span>
                </div>
                <h3 className="m-0 mt-3 max-w-[18ch] text-[clamp(28px,3.6vw,56px)] font-light leading-[1] tracking-[-0.02em]">{w.name}</h3>
              </div>
              <button
                type="button"
                aria-label={`View project: ${w.name}`}
                onClick={(e) => {
                  if (dragged.current) return;
                  onOpenStory?.(w.id, ids, e.currentTarget.closest('[data-pane]').getBoundingClientRect());
                }}
                className="group/cta inline-flex items-center gap-3 rounded-full bg-paper py-2 pl-5 pr-2 text-[13px] text-navy transition-transform duration-500 ease-studio hover:scale-[1.03]"
              >
                View project
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-paper transition-transform duration-500 ease-studio group-hover/cta:rotate-0 -rotate-45">
                  →
                </span>
              </button>
            </div>
          </article>
        ))}
        <div aria-hidden="true" className="w-1 shrink-0" />
      </div>

      <div aria-hidden="true" className="mx-5 mt-6 h-px bg-paper/15 md:mx-10">
        <div className="h-px bg-terracotta-light" style={{ width: `${Math.max(4, progress * 100)}%` }} />
      </div>
    </section>
  );
}
