import Picture from './ui/Picture.jsx';
import { team, teamHeading } from '../data.js';

// Cut-out portraits, all cropped to the same bust framing, on white; a card
// turns terracotta and the portrait lifts on hover or focus.
export default function Team() {
  return (
    <section id="team" data-tone="light" className="snap-section thin-scroll flex flex-col justify-between gap-10 bg-paper px-5 pb-10 pt-24 text-navy md:overflow-y-auto md:px-10">
      <div>
        <div className="eyebrow mb-6">
          <span className="eyebrow-rule" />
          04 · OUR TEAM
        </div>
        <h2 className="text-balance m-0 max-w-[14ch] text-display-xl font-light">{teamHeading}</h2>
      </div>
      <ul className="m-0 grid shrink-0 list-none content-end gap-x-4 gap-y-10 p-0 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-5">
        {team.map((p) => (
          <li key={p.name} tabIndex={0} className="team-card group outline-none">
            <div className="overflow-hidden border border-navy/10 bg-paper transition-colors duration-500 ease-studio group-hover:border-terracotta group-hover:bg-terracotta group-focus-visible:border-terracotta group-focus-visible:bg-terracotta">
              <Picture
                name={p.photo}
                alt={p.name}
                ratio="4 / 5"
                sizes="(min-width:1024px) 16vw, (min-width:640px) 30vw, 45vw"
                                imgClassName="origin-bottom transition-transform duration-700 ease-lift group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
              />
            </div>
            <div className="mt-4">
              <div className="text-label text-terracotta">{p.no}</div>
              <h3 className="m-0 mt-1 text-[clamp(16px,1.3vw,20px)] font-normal leading-tight tracking-[-0.01em]">{p.name}</h3>
              <div className="mt-1 text-label uppercase text-slate">{p.role}</div>
              <p className="text-pretty m-0 mt-2 text-[13px] leading-[1.5] text-slate">{p.line}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
