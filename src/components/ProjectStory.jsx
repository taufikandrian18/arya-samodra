import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import Picture from './ui/Picture.jsx';
import Odometer from './ui/Odometer.jsx';
import { getWork } from '../data.js';

const pad = (n) => String(n).padStart(2, '0');
const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(0.16,1,0.3,1)';

// Full-screen project story, opened from an In Focus pane. The pane grows
// into the screen, the title pulls up word by word, the statement lights up
// word by word as it scrolls past, and the gallery runs in an editorial
// rhythm (one wide, two side by side) before the next project.
export default function ProjectStory({ openId, ids, origin, onChange, onClose }) {
  const ref = useRef(null);
  const statementRef = useRef(null);
  const opener = useRef(null);
  const closing = useRef(false);
  const titleId = useId();
  const work = openId ? getWork(openId) : null;
  const isOpen = !!work;

  useEffect(() => {
    const d = ref.current;
    if (!isOpen || !d) return;
    opener.current = document.activeElement;
    closing.current = false;
    if (!d.open) d.showModal();
    d.focus?.({ preventScroll: true });
    d.scrollTop = 0;
    // The pane grows into the screen.
    if (origin && typeof d.animate === 'function' && !reducedMotion()) {
      const { innerWidth: W, innerHeight: H } = window;
      const inset = `inset(${origin.top}px ${W - origin.right}px ${H - origin.bottom}px ${origin.left}px)`;
      d.animate([{ clipPath: inset }, { clipPath: 'inset(0px 0px 0px 0px)' }], { duration: 950, easing: EASE });
    }
    return () => {
      if (d.open) d.close();
      const el = opener.current;
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus({ preventScroll: true });
    };
    // origin is only read on open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [openId]);

  // Statement words light up as the paragraph scrolls through the viewport.
  useEffect(() => {
    const d = ref.current;
    const p = statementRef.current;
    if (!d || !p) return;
    const words = [...p.querySelectorAll('.story-word')];
    if (reducedMotion()) {
      words.forEach((w) => (w.style.opacity = '1'));
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = p.getBoundingClientRect();
      const vh = window.innerHeight;
      const t = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = t * words.length;
      words.forEach((w, i) => (w.style.opacity = String(Math.max(0.16, Math.min(1, lit - i + 1)))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    d.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      d.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [openId]);

  if (!work) return null;

  const requestClose = () => {
    const d = ref.current;
    if (closing.current) return;
    if (!d || typeof d.animate !== 'function' || reducedMotion()) return onClose();
    closing.current = true;
    d.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(4%)' }], {
      duration: 420,
      easing: 'cubic-bezier(0.7,0,0.84,0)',
      fill: 'forwards',
    }).finished.then(onClose, onClose);
  };

  const pos = Math.max(0, ids.indexOf(work.id));
  const next = getWork(ids[(pos + 1) % ids.length]);
  const gallery = work.images.slice(1);
  const words = work.name.split(' ');
  const statement = (work.heading ? `${work.heading} ` : '') + work.description;

  // Editorial rhythm: one wide, then two side by side, repeating.
  const rows = [];
  for (let i = 0; i < gallery.length; ) {
    if (rows.length % 2 === 0 || i === gallery.length - 1) {
      rows.push([gallery[i]]);
      i += 1;
    } else {
      rows.push([gallery[i], gallery[i + 1]]);
      i += 2;
    }
  }
  let shown = 1;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      tabIndex={-1}
      autoFocus
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          requestClose();
        }
      }}
      className="story thin-scroll m-0 h-svh max-h-none w-full max-w-none overflow-y-auto overflow-x-clip overscroll-contain bg-navy-deep p-0 text-paper"
    >
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-gradient-to-b from-navy-deep/80 to-transparent px-5 py-4 md:px-10">
        <span className="text-label uppercase text-paper">
          In focus · {pad(pos + 1)} / {pad(ids.length)}
        </span>
        <button
          type="button"
          onClick={requestClose}
          className="group/close inline-flex items-center gap-3 rounded-full border border-paper/40 py-1.5 pl-4 pr-1.5 text-label uppercase transition-colors hover:border-paper"
        >
          Close
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-[14px] text-navy transition-transform duration-500 ease-studio group-hover/close:rotate-90">
            ×
          </span>
        </button>
      </div>

      {/* Hero */}
      <header key={work.id} className="relative -mt-[68px] flex h-svh flex-col justify-end">
        <div className="absolute inset-0">
          <Picture name={work.cover} alt={work.name} sizes="100vw" reveal={false} eager className="story-hero-img h-full w-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,21,44,.5)_0%,rgba(6,21,44,0)_30%,rgba(6,21,44,.15)_55%,rgba(6,21,44,.9)_100%)]" />
        </div>
        <div className="relative flex flex-wrap items-end justify-between gap-8 px-5 pb-10 md:px-10 md:pb-14">
          <div>
            <p className="m-0 mb-5 overflow-hidden text-label uppercase">
              <span className="word-up block" style={{ '--i': 0 }}>
                {work.place} · {work.type} · <span className="text-terracotta-light">[{work.status}]</span>
              </span>
            </p>
            <h2 id={titleId} className="m-0 max-w-[14ch] text-[clamp(44px,8vw,132px)] font-light leading-[0.92] tracking-[-0.03em]">
              {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className="word-up inline-block" style={{ '--i': i + 1 }}>
                    {word}
                  </span>
                  {i < words.length - 1 && ' '}
                </span>
              ))}
            </h2>
          </div>
          <Odometer value={work.year} label={`Year ${work.year}`} className="text-[clamp(48px,7vw,112px)] font-light leading-none tracking-[-0.03em]" />
        </div>
        <div aria-hidden="true" className="story-cue absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-label uppercase text-paper md:flex">
          Scroll
          <span className="block h-10 w-px bg-paper/60" />
        </div>
      </header>

      {/* Facts */}
      <section aria-label="Facts" className="grid grid-cols-2 border-y border-paper/15 md:grid-cols-4">
        {[
          ['Location', work.place],
          ['Year', work.year],
          ['Status', work.status],
          ['Client', work.client],
        ].map(([k, v], i) => (
          <div key={k} className={`relative px-5 py-8 md:px-10 ${i > 0 ? 'md:border-l md:border-paper/15' : ''} ${i % 2 ? 'border-l border-paper/15 md:border-l' : ''} ${i > 1 ? 'border-t border-paper/15 md:border-t-0' : ''}`}>
            <div className="text-label uppercase text-haze">{k}</div>
            <div className="mt-3 text-[clamp(18px,1.8vw,26px)] font-light leading-tight tracking-[-0.01em]">{v}</div>
          </div>
        ))}
      </section>

      {/* Statement */}
      <section className="grid gap-10 px-5 py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] md:px-10 md:py-36">
        <div className="text-label uppercase text-haze">
          <span className="eyebrow-rule" />
          Scope
          <p className="text-pretty m-0 mt-4 max-w-[30ch] text-[15px] normal-case leading-[1.6] tracking-normal text-paper">{work.scope}</p>
        </div>
        <p ref={statementRef} className="m-0 text-[clamp(24px,3vw,46px)] font-light leading-[1.2] tracking-[-0.02em]">
          {statement.split(' ').map((w, i) => (
            <span key={i} className="story-word" style={{ opacity: 0.16 }}>
              {w}{' '}
            </span>
          ))}
        </p>
      </section>

      {/* Gallery */}
      <section aria-label="Gallery" className="flex flex-col gap-4 px-5 pb-24 md:gap-6 md:px-10">
        {rows.map((row, r) => (
          <div key={r} className={`grid gap-4 md:gap-6 ${row.length === 2 ? 'md:grid-cols-2' : ''}`}>
            {row.map((key) => {
              shown += 1;
              const n = shown;
              return (
                <figure key={key} className="m-0">
                  <Picture
                    name={key}
                    alt={`${work.name}, image ${n} of ${work.images.length}`}
                    ratio={row.length === 2 ? '4 / 5' : '16 / 9'}
                    sizes={row.length === 2 ? '(min-width:768px) 50vw, 100vw' : '100vw'}
                  />
                  <figcaption className="mt-3 text-label text-haze">
                    {pad(n)} / {pad(work.images.length)}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        ))}
      </section>

      {/* Next project */}
      {next && next.id !== work.id && (
        <button
          type="button"
          onClick={() => onChange(next.id)}
          className="group/next relative block w-full overflow-hidden border-t border-paper/15 text-left"
        >
          <div className="absolute inset-0 opacity-40 transition-opacity duration-700 ease-studio group-hover/next:opacity-70">
            <Picture name={next.cover} alt="" sizes="100vw" className="h-full w-full" />
          </div>
          <div className="absolute inset-0 bg-navy-deep/60" />
          <div className="relative flex min-h-[46svh] flex-col justify-end gap-4 px-5 py-12 md:px-10">
            <span className="text-label uppercase text-paper">Next project →</span>
            <span className="max-w-[16ch] text-[clamp(40px,7vw,120px)] font-light leading-[0.95] tracking-[-0.03em] transition-transform duration-700 ease-studio group-hover/next:translate-x-3">
              {next.name}
            </span>
          </div>
        </button>
      )}
    </dialog>
  );
}
