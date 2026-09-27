import { useMemo, useState } from 'react';
import Picture from './ui/Picture.jsx';
import { works } from '../data.js';

const ALL = 'All work';
const types = [ALL, ...new Set(works.map((w) => w.type))];

// Project index: a numbered list on the left, a large preview on the right.
// Pointer hover and keyboard focus both drive the preview; clicking a row or
// the preview opens the Project Viewer. Below md the preview is hidden and a
// tap on a row opens the project directly.
export default function Works({ onOpenWork }) {
  const [filter, setFilter] = useState(ALL);
  const [activeId, setActiveId] = useState(null);
  const visible = useMemo(() => (filter === ALL ? works : works.filter((w) => w.type === filter)), [filter]);
  const ids = visible.map((w) => w.id);
  const active = visible.find((w) => w.id === activeId) ?? visible[0];
  const activePos = visible.indexOf(active) + 1;

  const open = (id) => onOpenWork?.(id, ids);

  return (
    <section id="works" data-tone="dark" className="snap-section flex flex-col bg-navy px-5 pb-9 pt-24 text-paper md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-paper/15 pb-5">
        <div>
          <div className="eyebrow eyebrow-dark mb-4">
            <span className="eyebrow-rule" />
            02 · SELECTED WORKS
          </div>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => {
              const on = t === filter;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setFilter(t);
                    setActiveId(null);
                  }}
                  className={`min-h-[36px] border px-3 text-label uppercase transition-colors ${
                    on ? 'border-terracotta bg-terracotta text-paper' : 'border-paper/25 bg-transparent text-paper hover:border-paper'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <div className="text-right">
          <div data-testid="works-count" className="text-[clamp(32px,3.4vw,56px)] font-light leading-none tracking-[-0.03em] text-terracotta-light">
            {String(visible.length).padStart(2, '0')}
          </div>
          <div className="mt-1.5 text-label uppercase text-haze">Projects shown</div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-10 md:grid-cols-[minmax(0,1fr)_30vw]">
        <ul className="thin-scroll m-0 min-h-0 list-none p-0 md:overflow-y-auto">
          {visible.map((w) => {
            const on = w.id === active?.id && activeId !== null;
            return (
              <li key={w.id}>
                <button
                  type="button"
                  aria-label={`Open project: ${w.name}`}
                  onClick={() => open(w.id)}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setActiveId(w.id)}
                  onFocus={() => setActiveId(w.id)}
                  className={`grid w-full grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-4 border-b border-paper/10 px-1 py-[18px] text-left transition-all duration-300 ease-studio md:grid-cols-[48px_minmax(0,1fr)_auto] md:gap-6 ${
                    on ? 'bg-paper/5 md:pl-4' : ''
                  }`}
                >
                  <span className="text-label text-haze">{w.no}</span>
                  <span className="min-w-0">
                    <span className="block text-[clamp(20px,2.3vw,34px)] font-medium leading-[1.1] tracking-[-0.03em]">{w.name}</span>
                    <span className="mt-1.5 block text-label uppercase text-haze">{w.place}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1 text-right">
                    <span className="whitespace-nowrap text-label uppercase text-terracotta-light">{w.type}</span>
                    <span className="hidden whitespace-nowrap text-label uppercase text-haze sm:inline">[{w.status}]</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <aside className="hidden self-start pt-[18px] md:block">
          {active && (
            <>
              <button
                type="button"
                aria-label={`View project: ${active.name}`}
                onClick={(e) => {
                  // A small "pop" on the preview while the page dims and the viewer wipes up.
                  const el = e.currentTarget;
                  el.classList.remove('is-popping');
                  void el.offsetWidth;
                  el.classList.add('is-popping');
                  setTimeout(() => el.classList.remove('is-popping'), 900);
                  open(active.id);
                }}
                className="works-preview group relative block aspect-[4/5] max-h-[calc(100svh-300px)] w-full overflow-hidden border border-paper/15 bg-navy-deep text-left"
              >
                <Picture
                  key={active.id}
                  name={active.cover}
                  alt=""
                  reveal={false}
                  sizes="30vw"
                  className="preview-swap absolute inset-0 h-full w-full"
                  imgClassName="transition-transform duration-700 ease-lift group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-navy-deep/90 p-5">
                  <span className="block text-[clamp(18px,1.6vw,24px)] font-medium leading-[1.15] tracking-[-0.02em]">{active.name}</span>
                  <span className="mt-2 block text-label uppercase text-haze">
                    {active.place} · {active.type}
                  </span>
                </span>
                <span className="absolute right-4 top-4 border border-paper/60 px-3 py-2 text-label uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  View project →
                </span>
              </button>
              <div
                aria-hidden="true"
                className="h-0.5 bg-terracotta transition-[width] duration-500 ease-studio"
                style={{ width: `${(activePos / visible.length) * 100}%` }}
              />
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
