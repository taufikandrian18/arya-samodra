import { useEffect, useRef, useState } from 'react';
import Picture from './ui/Picture.jsx';
import { focus, getWork } from '../data.js';

const pad = (n) => String(n).padStart(2, '0');

// In Focus: a pinned horizontal run of project panes, driven by ordinary
// vertical scrolling. The section is one viewport tall per pane; its content
// stays pinned (sticky) while the page scrolls through it, and the scroll
// position moves the row sideways. So scrolling down slides the panes left
// until the last one, then the page carries on; scrolling up slides them back
// to the first, then the page carries on. Nothing intercepts wheel or touch
// events: wheel, trackpad, touch, keys and the scrollbar all behave the same.
// On desktop each pane has its own snap point, so one gesture = one pane.
export default function ProjectFocus({ onOpenStory }) {
  const sectionRef = useRef(null);
  const rowRef = useRef(null);
  const barRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const works = focus.ids.map(getWork).filter(Boolean);
  const n = works.length;
  const ids = works.map((w) => w.id);

  useEffect(() => {
    const section = sectionRef.current;
    const row = rowRef.current;
    if (!section || !row) return;
    const scroller = section.parentElement;
    let travel = 0;
    let frame = 0;
    let last = -1;

    const measure = () => {
      const panes = row.querySelectorAll('[data-pane]');
      travel = panes.length > 1 ? panes[panes.length - 1].offsetLeft - panes[0].offsetLeft : 0;
    };
    const update = () => {
      frame = 0;
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
      row.style.transform = `translate3d(${-p * travel}px,0,0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0.04, p)})`;
      const vw = window.innerWidth;
      row.querySelectorAll('[data-pane]').forEach((pane) => {
        const b = pane.getBoundingClientRect();
        pane.style.setProperty('--shift', String(Math.max(-1, Math.min(1, (b.left + b.width / 2 - vw / 2) / b.width))));
      });
      const i = Math.round(p * (n - 1));
      if (i !== last) {
        last = i;
        setCurrent(i);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    (scroller || window).addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    ro?.observe(row);
    return () => {
      (scroller || window).removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [n]);

  // Buttons and arrow keys scroll the page to pane i's stop.
  const goTo = (i) => {
    const section = sectionRef.current;
    const scroller = section?.parentElement;
    if (!section || !scroller) return;
    const k = Math.max(0, Math.min(n - 1, i));
    const span = section.offsetHeight - window.innerHeight;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    scroller.scrollTo({ top: section.offsetTop + (n > 1 ? (span * k) / (n - 1) : 0), behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="project"
      data-tone="dark"
      aria-roledescription="carousel"
      aria-label="In focus"
      className="focus-section relative bg-navy-deep text-paper"
      style={{ height: `${n * 100}svh` }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          goTo(current + (e.key === 'ArrowRight' ? 1 : -1));
        }
      }}
    >
      {/* One snap stop per pane (desktop), one viewport apart. */}
      {works.map((w, i) => (
        <span key={w.id} aria-hidden="true" className="focus-stop absolute left-0 h-px w-px" style={{ top: `${i * 100}svh` }} />
      ))}

      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pb-8 pt-24">
        <div className="flex items-end justify-between gap-6 px-5 md:px-10">
          <div className="eyebrow eyebrow-dark">
            <span className="eyebrow-rule" />
            {focus.label}
          </div>
          <div className="flex items-center gap-2 text-label text-haze">
            <span aria-live="polite" className="mr-2">
              {pad(current + 1)} / {pad(n)}
            </span>
            <button
              type="button"
              aria-label="Previous project"
              disabled={current === 0}
              onClick={() => goTo(current - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/30 text-[16px] text-paper transition-colors hover:border-paper disabled:opacity-30"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next project"
              disabled={current === n - 1}
              onClick={() => goTo(current + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/30 text-[16px] text-paper transition-colors hover:border-paper disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-6 min-h-0 flex-1">
          <div ref={rowRef} className="focus-row flex h-full gap-4 px-5 will-change-transform md:gap-6 md:px-10">
            {works.map((w, i) => (
              <article key={w.id} data-pane className="focus-pane relative h-full w-[84vw] shrink-0 overflow-hidden md:w-[min(64vw,1100px)]">
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
                    <span aria-hidden="true" className="flex h-9 w-9 -rotate-45 items-center justify-center rounded-full bg-terracotta text-paper transition-transform duration-500 ease-studio group-hover/cta:rotate-0">
                      →
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div aria-hidden="true" className="mx-5 mt-6 h-px bg-paper/15 md:mx-10">
          <div ref={barRef} className="h-px origin-left bg-terracotta-light" style={{ transform: 'scaleX(0.04)' }} />
        </div>
      </div>
    </section>
  );
}
