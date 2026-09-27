import { useEffect, useId, useRef, useState } from 'react';
import Picture from './ui/Picture.jsx';
import { getWork } from '../data.js';

const pad = (n) => String(n).padStart(2, '0');

// Native <dialog> with the project's full gallery and details. Previous/Next
// and ←/→ move within `ids` (the list it was opened from) and wrap.
export default function ProjectViewer({ openId, ids, onChange, onClose }) {
  const ref = useRef(null);
  const opener = useRef(null);
  const titleId = useId();
  const [imageIndex, setImageIndex] = useState(0);
  const work = openId ? getWork(openId) : null;

  useEffect(() => setImageIndex(0), [openId]);

  const isOpen = !!work;
  useEffect(() => {
    const d = ref.current;
    if (!isOpen || !d) return;
    opener.current = document.activeElement;
    if (!d.open) d.showModal();
    return () => {
      if (d.open) d.close();
      const el = opener.current;
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus();
    };
  }, [isOpen]);

  if (!work) return null;

  const pos = Math.max(0, ids.indexOf(work.id));
  const step = (d) => onChange(ids[(pos + d + ids.length) % ids.length]);
  const images = work.images;
  const n = images.length;

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const onThumbKey = (e, i) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    e.stopPropagation();
    const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
    setImageIndex(next);
    e.currentTarget.parentElement?.parentElement?.children[next]?.querySelector('button')?.focus();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="viewer m-0 h-full max-h-none w-full max-w-none bg-navy-deep p-0 text-paper"
    >
      <div className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-1">
        <div className="flex min-h-0 flex-col p-4 md:p-6">
          <div className="relative min-h-[45vh] flex-1 lg:min-h-0">
            <Picture
              key={images[imageIndex]}
              name={images[imageIndex]}
              alt={`${work.name}, image ${imageIndex + 1} of ${n}`}
              fit="contain"
              sizes="100vw"
              reveal={false}
              className="absolute inset-0 h-full w-full"
            />
          </div>
          {n > 1 && (
            <ul className="thin-scroll m-0 mt-4 flex list-none gap-2 overflow-x-auto p-0 pb-1">
              {images.map((key, i) => (
                <li key={key} className="shrink-0">
                  <button
                    type="button"
                    aria-label={`Image ${i + 1} of ${n}`}
                    aria-pressed={i === imageIndex}
                    onClick={() => setImageIndex(i)}
                    onKeyDown={(e) => onThumbKey(e, i)}
                    className={`block h-14 w-20 border-2 ${i === imageIndex ? 'border-terracotta-light' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <Picture name={key} alt="" sizes="80px" reveal={false} className="h-full w-full" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="thin-scroll flex min-h-0 flex-col overflow-y-auto border-t border-paper/15 p-5 md:p-8 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-4">
            <span className="text-label text-haze">
              {pad(pos + 1)} / {pad(ids.length)}
            </span>
            <button type="button" onClick={onClose} className="min-h-[44px] px-2 text-label uppercase text-paper hover:text-terracotta-light">
              Close
            </button>
          </div>

          <h2 id={titleId} className="m-0 mt-6 text-display font-light">
            {work.name}
          </h2>
          <p className="m-0 mt-2 text-label uppercase text-haze">{work.place}</p>
          <span className="mt-4 self-start text-label uppercase text-terracotta-light">[{work.status}]</span>

          <dl className="m-0 mt-6 border-t border-paper/15">
            {[
              ['Year', work.year],
              ['Scope', work.scope],
              ['Client', work.client],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[72px_1fr] gap-4 border-b border-paper/15 py-3">
                <dt className="text-label uppercase text-haze">{k}</dt>
                <dd className="m-0 text-[14px] leading-[1.5]">{v}</dd>
              </div>
            ))}
          </dl>

          {work.heading && <h3 className="m-0 mt-6 text-[20px] font-normal tracking-[-0.01em]">{work.heading}</h3>}
          <p className="text-pretty m-0 mt-4 text-[15px] leading-[1.6] text-paper">{work.description}</p>

          <div className="mt-auto flex justify-between gap-4 pt-8">
            <button type="button" onClick={() => step(-1)} className="min-h-[44px] text-label uppercase hover:text-terracotta-light">
              ← Previous project
            </button>
            <button type="button" onClick={() => step(1)} className="min-h-[44px] text-label uppercase hover:text-terracotta-light">
              Next project →
            </button>
          </div>
        </aside>
      </div>
    </dialog>
  );
}
