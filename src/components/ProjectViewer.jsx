import { useEffect, useId, useRef, useState } from 'react';
import Picture from './ui/Picture.jsx';
import Odometer from './ui/Odometer.jsx';
import { getWork } from '../data.js';

const pad = (n) => String(n).padStart(2, '0');
const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Full-screen project view in a native <dialog>. It wipes up from the bottom,
// the title rises line by line and the year rolls in (after kononenkogroup.com);
// scrolling reveals the details and the gallery. Previous/Next and ←/→ move
// within `ids` (the list it was opened from) and wrap.
export default function ProjectViewer({ openId, ids, onChange, onClose }) {
  const ref = useRef(null);
  const opener = useRef(null);
  const closing = useRef(false);
  const titleId = useId();
  const [imageIndex, setImageIndex] = useState(0);
  const work = openId ? getWork(openId) : null;

  useEffect(() => {
    setImageIndex(0);
    ref.current?.scrollTo?.({ top: 0 });
  }, [openId]);

  const isOpen = !!work;
  useEffect(() => {
    const d = ref.current;
    if (!isOpen || !d) return;
    opener.current = document.activeElement;
    closing.current = false;
    if (!d.open) d.showModal();
    // Start focus on the dialog itself, not the first button, so no focus
    // ring sits on Close as the project opens. Keys still reach onKeyDown.
    d.focus?.();
    return () => {
      if (d.open) d.close();
      const el = opener.current;
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!work) return null;

  // Wipe back down, then let the parent unmount us.
  const requestClose = () => {
    const d = ref.current;
    if (closing.current) return;
    if (!d || typeof d.animate !== 'function' || reducedMotion()) return onClose();
    closing.current = true;
    d.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(100% 0 0 0)' }], {
      duration: 520,
      easing: 'cubic-bezier(0.7,0,0.84,0)',
      fill: 'forwards',
    }).finished.then(onClose, onClose);
  };

  const pos = Math.max(0, ids.indexOf(work.id));
  const step = (d) => onChange(ids[(pos + d + ids.length) % ids.length]);
  const images = work.images;
  const n = images.length;
  const nameLines = splitLines(work.name);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      requestClose();
    }
  };

  const onThumbKey = (e, i) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    e.stopPropagation();
    const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
    setImageIndex(next);
    e.currentTarget.closest('ul')?.children[next]?.querySelector('button')?.focus();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      className="viewer thin-scroll m-0 h-svh max-h-none w-full max-w-none overflow-y-auto overflow-x-hidden bg-navy-deep p-0 text-paper"
    >
      {/* Top bar stays put while the page scrolls under it. */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-gradient-to-b from-navy-deep/70 to-transparent px-5 py-4 md:px-10">
        <span className="text-label text-paper">
          {pad(pos + 1)} / {pad(ids.length)}
        </span>
        <button type="button" onClick={requestClose} className="min-h-[44px] px-2 text-label uppercase text-paper hover:text-terracotta-light">
          Close
        </button>
      </div>

      {/* Hero: full-bleed cover, title bottom-left, year bottom-right. */}
      <header key={work.id} className="relative -mt-[76px] flex h-svh flex-col justify-end">
        <div className="absolute inset-0">
          <Picture name={work.cover} alt={work.name} sizes="100vw" reveal={false} eager className="h-full w-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,21,44,.55)_0%,rgba(6,21,44,0)_30%,rgba(6,21,44,.2)_60%,rgba(6,21,44,.85)_100%)]" />
        </div>
        <div className="relative flex flex-wrap items-end justify-between gap-6 px-5 pb-8 md:px-10 md:pb-10">
          <div>
            <p className="m-0 mb-4 overflow-hidden text-label uppercase text-paper">
              <span className="mask-rise block" style={{ '--i': 0 }}>
                {work.place} · {work.type} · <span className="text-terracotta-light">[{work.status}]</span>
              </span>
            </p>
            <h2 id={titleId} className="m-0 max-w-[16ch] text-[clamp(40px,6vw,96px)] font-light leading-[0.95] tracking-[-0.02em]">
              {nameLines.map((line, i) => (
                <span key={i} className="block overflow-hidden pb-[0.06em]">
                  <span className="mask-rise block" style={{ '--i': i + 1 }}>
                    {line}
                    {i < nameLines.length - 1 && ' '}
                  </span>
                </span>
              ))}
            </h2>
          </div>
          <Odometer value={work.year} className="text-[clamp(56px,10vw,160px)] font-light leading-none tracking-[-0.03em]" label={`Year ${work.year}`} />
        </div>
      </header>

      {/* Details: meta left, statement right. */}
      <section className="grid gap-10 px-5 py-16 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-16 md:px-10 md:py-24">
        <dl className="m-0 self-start border-t border-paper/15">
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
        <div>
          {work.heading && <h3 className="m-0 mb-5 text-label uppercase text-terracotta-light">{work.heading}</h3>}
          <p className="text-pretty m-0 max-w-[40ch] text-[clamp(20px,2.2vw,32px)] font-light leading-[1.3] tracking-[-0.01em]">
            {work.description}
          </p>
        </div>
      </section>

      {/* Gallery: large image with a thumbnail rail. */}
      <section aria-label="Gallery" className="px-5 pb-16 md:px-10 md:pb-24">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_96px]">
          <div className="relative h-[70svh] min-h-[280px] bg-navy">
            <Picture
              key={images[imageIndex]}
              name={images[imageIndex]}
              alt={`${work.name}, image ${imageIndex + 1} of ${n}`}
              fit="contain"
              sizes="(min-width:1024px) 85vw, 100vw"
              reveal={false}
              className="viewer-fade absolute inset-0 h-full w-full"
            />
          </div>
          {n > 1 && (
            <ul className="thin-scroll m-0 flex list-none gap-2 overflow-x-auto p-0 pb-1 lg:max-h-[70svh] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
              {images.map((key, i) => (
                <li key={key} className="shrink-0">
                  <button
                    type="button"
                    aria-label={`Image ${i + 1} of ${n}`}
                    aria-pressed={i === imageIndex}
                    onClick={() => setImageIndex(i)}
                    onKeyDown={(e) => onThumbKey(e, i)}
                    className={`block h-14 w-20 border-2 lg:h-16 lg:w-full ${i === imageIndex ? 'border-terracotta-light' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <Picture name={key} alt="" sizes="96px" reveal={false} className="h-full w-full" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <nav aria-label="Projects" className="flex justify-between gap-4 border-t border-paper/15 px-5 py-6 md:px-10">
        <button type="button" onClick={() => step(-1)} className="min-h-[44px] text-label uppercase hover:text-terracotta-light">
          ← Previous project
        </button>
        <button type="button" onClick={() => step(1)} className="min-h-[44px] text-label uppercase hover:text-terracotta-light">
          Next project →
        </button>
      </nav>
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
