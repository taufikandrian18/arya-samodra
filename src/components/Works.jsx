import { useMemo, useState } from 'react';
import Picture from './ui/Picture.jsx';
import { works } from '../data.js';

const ALL = 'All work';
const types = [ALL, ...new Set(works.map((w) => w.type))];

export default function Works({ onOpenWork }) {
  const [filter, setFilter] = useState(ALL);
  const visible = useMemo(() => (filter === ALL ? works : works.filter((w) => w.type === filter)), [filter]);
  const ids = visible.map((w) => w.id);

  return (
    <section id="works" data-tone="light" className="snap-section flex flex-col bg-concrete px-5 pb-10 pt-24 text-navy md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-navy/15 pb-5">
        <div>
          <div className="eyebrow mb-4">
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
                  onClick={() => setFilter(t)}
                  className={`min-h-[36px] border px-3 text-label uppercase transition-colors ${
                    on ? 'border-terracotta bg-terracotta text-paper' : 'border-navy/25 bg-transparent text-navy hover:border-navy'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <div className="text-right">
          <div data-testid="works-count" className="text-display font-light leading-none text-terracotta">
            {String(visible.length).padStart(2, '0')}
          </div>
          <div className="mt-1.5 text-label uppercase text-slate">projects</div>
        </div>
      </div>

      <div className="thin-scroll min-h-0 flex-1 pt-8 md:overflow-y-auto md:pr-2">
        <ul className="m-0 grid list-none gap-x-6 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                aria-label={`Open project: ${w.name}`}
                onClick={() => onOpenWork?.(w.id, ids)}
                className="group block w-full text-left"
              >
                <div className="overflow-hidden">
                  <Picture
                    name={w.cover}
                    alt={w.name}
                    ratio="3 / 2"
                    sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw"
                    className="transition-transform duration-700 ease-lift group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="mt-3 text-label uppercase text-slate">{`${w.no} · ${w.type} · ${w.place}`}</div>
                <div className="mt-1 text-[20px] leading-tight tracking-[-0.01em]">{w.name}</div>
                <span className="mt-2 inline-block bg-paper px-1.5 py-0.5 text-label uppercase text-terracotta">[{w.status}]</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
