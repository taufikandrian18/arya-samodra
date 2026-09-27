import Picture from './ui/Picture.jsx';
import { focus, getWork, workIds } from '../data.js';

export default function ProjectFocus({ onOpenWork }) {
  const w = getWork(focus.id);
  return (
    <section id="project" data-tone="dark" className="snap-section grid grid-cols-1 bg-navy-deep text-paper md:grid-cols-[3fr_2fr]">
      <div className="relative min-h-[50svh] md:min-h-0">
        <Picture name={w.cover} alt={`${w.name}, ${w.place}`} sizes="(min-width:768px) 60vw, 100vw" className="absolute inset-0 h-full w-full" />
      </div>
      <div className="flex min-h-0 flex-col px-5 pb-10 pt-10 md:px-10 md:pt-24">
        <div className="eyebrow eyebrow-dark">
          <span className="eyebrow-rule" />
          {focus.label}
        </div>
        <h2 className="m-0 mt-6 text-display font-light">{w.name}</h2>
        <p className="m-0 mt-3 text-label uppercase text-haze">
          {w.place} · {w.type}
        </p>
        <span className="mt-3 text-label uppercase text-terracotta-light">[{w.status}]</span>
        <p className="text-pretty m-0 mt-5 max-w-[44ch] text-[15px] leading-[1.6] text-paper">{w.scope}</p>

        <div className="mt-8 grid min-h-0 flex-1 grid-cols-2 gap-3">
          {w.images.slice(1, 3).map((key, i) => (
            <div key={key} data-testid="focus-tile" className="relative min-h-[120px]">
              <Picture name={key} alt={`${w.name}, view ${i + 2}`} sizes="(min-width:768px) 20vw, 50vw" className="absolute inset-0 h-full w-full" />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onOpenWork?.(w.id, workIds)}
          className="mt-8 self-start border border-paper px-7 py-4 text-[13px] leading-none transition-colors duration-500 ease-studio hover:bg-paper hover:text-navy"
        >
          View project
        </button>
      </div>
    </section>
  );
}
