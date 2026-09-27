import Picture from './ui/Picture.jsx';
import { team } from '../data.js';

export default function Team() {
  return (
    <section id="team" data-tone="dark" className="snap-section flex flex-col bg-ink px-10 pb-10 pt-24 text-white">
      <div className="eyebrow mb-10 text-white/50">
        <span className="eyebrow-rule" />04 · OUR TEAM
      </div>
      <div className="thin-scroll grid min-h-0 flex-1 content-start gap-5 overflow-y-auto [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {team.map((p) => (
          <div key={p.name}>
            <div className="relative mb-3 flex aspect-[3/4] items-end overflow-hidden border border-white/20 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.07)_0_2px,transparent_2px_11px)] p-3">
              {p.photo ? (
                <Picture name={p.photo} alt={p.name} sizes="200px" className="absolute inset-0 h-full w-full" />
              ) : (
                <span className="relative font-mono text-[9px] leading-snug tracking-[0.12em] text-white/45">PORTRAIT 3:4</span>
              )}
            </div>
            <div className="text-[15px] font-medium leading-tight tracking-[-0.015em]">{p.name}</div>
            <div className="font-mono text-[10px] leading-relaxed tracking-[0.12em] text-white/50">{p.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
