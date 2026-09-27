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

  // Vertical wheel → horizontal travel, eased; pass through at the ends.
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let target = track.scrollLeft;
    let frame = 0;
    const step = () => {
      const d = target - track.scrollLeft;
      track.scrollLeft += Math.abs(d) < 0.5 ? d : d * 0.14;
      frame = Math.abs(target - track.scrollLeft) < 0.5 ? 0 : requestAnimationFrame(step);
    };
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // trackpad sideways: native
      const max = track.scrollWidth - track.clientWidth;
      const from = frame ? target : track.scrollLeft;
      const atEnd = e.deltaY > 0 ? from >= max - 4 : from <= 4;
      if (atEnd) return;
      e.preventDefault();
      target = Math.max(0, Math.min(max, from + e.deltaY * 1.1));
      if (!frame) frame = requestAnimationFrame(step);
    };
    section.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      section.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(frame);
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
      const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      track.querySelectorAll('[data-pane]').forEach((pane, i) => {
        const r = pane.getBoundingClientRect();
        const c = r.left + r.width / 2;
        pane.style.setProperty('--shift', String(Math.max(-1, Math.min(1, (c - mid) / r.width))));
        if (Math.abs(c - mid) < bestD) {
          bestD = Math.abs(c - mid);
          best = i;
        }
      });
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
  }, []);

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
        <div className="flex items-center gap-4 text-label text-haze">
          <span aria-live="polite">
            {pad(current + 1)} / {pad(works.length)}
          </span>
          <span aria-hidden="true" className="hidden md:inline">Scroll →</span>
        </div>
      </div>

      <div
        ref={trackRef}
        tabIndex={0}
        aria-label="In focus projects, scroll horizontally"
        className="focus-track mt-6 flex min-h-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-5 outline-none md:snap-none md:gap-6 md:px-10"
      >
        {works.map((w, i) => (
          <article key={w.id} data-pane className="focus-pane relative min-h-[60svh] w-[84vw] shrink-0 snap-center self-stretch overflow-hidden md:min-h-0 md:w-[min(64vw,1100px)]">
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
                onClick={(e) => onOpenStory?.(w.id, ids, e.currentTarget.closest('[data-pane]').getBoundingClientRect())}
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
