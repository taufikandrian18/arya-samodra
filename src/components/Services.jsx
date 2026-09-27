import { services, servicesIntro, workflow } from '../data.js';

export default function Services() {
  return (
    <section
      id="services"
      data-tone="dark"
      className="snap-section thin-scroll flex flex-col bg-navy px-5 pb-12 pt-24 text-paper md:overflow-y-auto md:px-10"
    >
      <div className="eyebrow eyebrow-dark mb-8">
        <span className="eyebrow-rule" />
        03 · WHAT WE DO
      </div>
      <p className="text-balance m-0 max-w-[40ch] text-[clamp(20px,2vw,24px)] font-light leading-[1.35] tracking-[-0.01em] text-terracotta-light">
        {servicesIntro}
      </p>

      <div className="mt-8 border-t border-paper/15">
        {services.map((s) => (
          <div key={s.no} className="grid gap-2 border-b border-paper/15 py-4 md:grid-cols-[56px_1fr_1.2fr] md:items-baseline md:gap-6">
            <span className="text-label text-haze">{s.no}</span>
            <h3 className="m-0 text-[clamp(18px,1.8vw,22px)] font-normal tracking-[-0.01em]">{s.name}</h3>
            <p className="text-pretty m-0 text-[15px] leading-[1.6] text-haze">{s.scope}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="text-label uppercase text-haze">Workflow</div>
        <ol aria-label="Workflow" className="relative m-0 mt-5 grid list-none gap-6 p-0 md:grid-cols-6 md:gap-4">
          <span aria-hidden="true" className="absolute left-4 top-4 hidden h-px w-[calc(100%-2rem)] border-t border-dashed border-terracotta md:block" />
          <span aria-hidden="true" className="absolute bottom-4 left-4 top-4 w-px border-l border-dashed border-terracotta md:hidden" />
          {workflow.map((w) => (
            <li key={w.step} className="relative grid grid-cols-[32px_1fr] gap-4 md:block">
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-terracotta bg-navy text-[13px] text-paper">
                {w.step}
              </span>
              <div className="md:mt-4">
                <h4 className="m-0 text-label uppercase text-paper">{w.title}</h4>
                <p className="m-0 mt-1 text-[13px] leading-[1.5] text-haze">{w.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
