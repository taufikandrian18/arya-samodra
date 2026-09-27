import Picture from './ui/Picture.jsx';
import { team } from '../data.js';

export default function Team() {
  return (
    <section id="team" data-tone="light" className="snap-section flex flex-col bg-paper px-5 pb-10 pt-24 text-navy md:px-10">
      <div className="eyebrow mb-8">
        <span className="eyebrow-rule" />
        04 · OUR TEAM
      </div>
      <ul className="thin-scroll m-0 grid min-h-0 flex-1 list-none content-start gap-x-6 gap-y-10 p-0 sm:grid-cols-2 md:overflow-y-auto md:pr-2 lg:grid-cols-3">
        {team.map((p) => (
          <li key={p.name} className="grid grid-cols-[120px_1fr] gap-5 sm:block">
            <Picture
              name={p.photo}
              alt={p.name}
              ratio="4 / 5"
              sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 120px"
              className="bg-concrete sm:max-h-[36vh]"
              imgClassName="object-top"
            />
            <div className="sm:mt-4">
              <div className="text-label text-terracotta">{p.no}</div>
              <h3 className="m-0 mt-1 text-[20px] font-normal tracking-[-0.01em]">{p.name}</h3>
              <div className="mt-1 text-label uppercase text-slate">{p.role}</div>
              <p className="text-pretty m-0 mt-2 text-[13px] leading-[1.5] text-slate">{p.line}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
