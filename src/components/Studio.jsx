import Picture from './ui/Picture.jsx';
import { studio } from '../data.js';

export default function Studio() {
  const { principal: p, figure } = studio;
  return (
    <section
      id="studio"
      data-tone="light"
      className="snap-section thin-scroll grid content-start gap-12 bg-paper px-5 pb-12 pt-24 text-navy md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-16 md:overflow-y-auto md:px-10"
    >
      <div>
        <div className="eyebrow mb-8">
          <span className="eyebrow-rule" />
          01 · ABOUT US
        </div>
        <h2 className="text-balance m-0 max-w-[22ch] text-display font-light text-terracotta">{studio.heading}</h2>
        <p className="text-pretty mb-0 mt-8 max-w-[56ch] text-[17px] leading-[1.55]">{studio.lead}</p>
        <p className="text-pretty mb-0 mt-5 max-w-[60ch] text-[15px] leading-[1.6] text-slate">{studio.story}</p>

        <dl className="m-0 mt-8 grid grid-cols-2 border-t border-navy/15 sm:grid-cols-4">
          {studio.facts.map(([k, v]) => (
            <div key={k} className="border-b border-navy/15 py-3 pr-4">
              <dt className="text-label uppercase text-slate">{k}</dt>
              <dd className="m-0 mt-1 text-[20px] tracking-[-0.01em]">{v}</dd>
            </div>
          ))}
        </dl>

        <figure className="m-0 mt-10">
          <Picture name={figure.key} alt={figure.alt} ratio="3 / 2" sizes="(min-width:768px) 50vw, 100vw" />
          <figcaption className="mt-3 text-label uppercase text-slate">{figure.caption}</figcaption>
        </figure>
      </div>

      <article className="md:pt-14">
        <Picture name={p.photo} alt={p.photoAlt} ratio="2 / 3" sizes="(min-width:768px) 36vw, 100vw" className="max-w-[420px] bg-concrete" />
        <div className="mt-6 text-label uppercase text-terracotta">{p.no}</div>
        <h3 className="m-0 mt-1 text-[24px] font-normal tracking-[-0.01em]">{p.name}</h3>
        <p className="m-0 mt-1 text-label uppercase text-slate">
          {p.role} · {p.registration}
        </p>
        <p className="text-pretty mb-0 mt-5 text-[15px] leading-[1.6] text-slate">{p.bio}</p>
        <p className="text-pretty mb-0 mt-4 text-[15px] leading-[1.6] text-slate">{studio.note}</p>

        <ul aria-label="Record" className="m-0 mt-8 list-none border-t border-navy/15 p-0">
          {p.record.map((r) => (
            <li key={r.title} className="flex items-baseline justify-between gap-6 border-b border-navy/15 py-3 text-[14px]">
              <span>
                {r.title} <span className="text-slate">· {r.detail}</span>
              </span>
              <span className="whitespace-nowrap text-label text-slate">{r.year}</span>
            </li>
          ))}
        </ul>

        <blockquote className="m-0 mt-8 text-[20px] font-light leading-[1.4] tracking-[-0.01em]">
          <span aria-hidden="true" className="mr-1 text-terracotta">“</span>
          {p.quote}
        </blockquote>
      </article>
    </section>
  );
}
