import { useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { works } from '../data.js';

const types = ['ALL', ...new Set(works.map((w) => w.type))];

export default function Works() {
  const [filter, setFilter] = useState('ALL');
  const [active, setActive] = useState(null);
  const imgRef = useRef(null);

  const visible = useMemo(
    () => (filter === 'ALL' ? works : works.filter((w) => w.type === filter)),
    [filter]
  );

  const enter = (w) => {
    setActive(w);
    if (imgRef.current) gsap.fromTo(imgRef.current, { scale: 1.07 }, { scale: 1, duration: 0.8, ease: 'power3.out' });
  };

  return (
    <section id="works" data-tone="dark" className="snap-section flex flex-col bg-ink px-10 pb-9 pt-24 text-white">
      <div className="flex flex-wrap items-end justify-between gap-10 border-b border-white/15 pb-5">
        <div>
          <div className="eyebrow mb-3.5 text-white/50">
            <span className="eyebrow-rule" />02 · SELECTED WORKS
          </div>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => {
              const on = t === filter;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`cursor-pointer rounded-sm border px-3 py-2 font-mono text-[9px] font-medium leading-none tracking-[0.14em] transition-colors ${
                    on
                      ? 'border-terracotta bg-terracotta text-white'
                      : 'border-white/20 bg-transparent text-white/70 hover:border-white/60 hover:text-white'
                  }`}
                >
                  {t === 'ALL' ? 'ALL WORK' : t}
                </button>
              );
            })}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[clamp(30px,3.4vw,52px)] font-medium leading-none tracking-[-0.04em] text-terracotta-light">
            {String(visible.length).padStart(2, '0')}
          </div>
          <div className="mt-1.5 font-mono text-[9px] leading-none tracking-eyebrow text-white/50">PROJECTS SHOWN</div>
        </div>
      </div>

      <div className="relative grid min-h-0 flex-1 gap-10 pt-1 md:grid-cols-[minmax(0,1fr)_30vw]">
        <div className="thin-scroll min-h-0 overflow-y-auto">
          {visible.map((w) => (
            <a
              key={w.no}
              href="#project"
              onMouseEnter={() => enter(w)}
              onMouseLeave={() => setActive(null)}
              className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-[22px] border-b border-white/10 px-1 py-[18px] transition-all duration-300 ease-studio hover:bg-white/5 hover:pl-4"
            >
              <span className="font-mono text-[10px] leading-none tracking-[0.12em] text-white/40">{w.no}</span>
              <span>
                <span className="block text-[clamp(18px,2vw,28px)] font-medium leading-[1.12] tracking-[-0.025em]">{w.name}</span>
                <span className="mt-1.5 block font-mono text-[10px] leading-snug tracking-[0.12em] text-white/50">{w.place}</span>
              </span>
              <span className="whitespace-nowrap text-right font-mono text-[9px] leading-snug tracking-[0.12em] text-terracotta-light">
                {w.type}
              </span>
            </a>
          ))}
        </div>

        <aside className="hidden self-start md:block">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/15 bg-ink-2">
            <img
              ref={imgRef}
              src={(active || works[0]).img}
              alt=""
              className={`block h-full w-full object-cover transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-35'}`}
            />
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-ink/90 p-5 transition-opacity duration-300 ${
                active ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="text-xl font-medium leading-[1.16] tracking-[-0.02em]">{active?.name}</div>
              <div className="mt-2 font-mono text-[9px] leading-relaxed tracking-[0.14em] text-white/65">
                {active && `${active.place} · ${active.type}`}
              </div>
            </div>
            <div
              className={`absolute inset-0 flex items-center justify-center bg-ink/50 text-center font-mono text-[9px] leading-[1.8] tracking-[0.18em] text-white/55 transition-opacity duration-300 ${
                active ? 'opacity-0' : 'opacity-100'
              }`}
            >
              HOVER A PROJECT<br />TO PREVIEW
            </div>
          </div>
          <div
            className="h-0.5 bg-terracotta transition-[width] duration-500 ease-studio"
            style={{ width: active ? `${(Number(active.no) / works.length) * 100}%` : '0%' }}
          />
        </aside>
      </div>
    </section>
  );
}
