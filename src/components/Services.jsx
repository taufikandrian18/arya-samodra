import { services } from '../data.js';

export default function Services() {
  return (
    <section id="services" data-tone="light" className="snap-section flex flex-col bg-white px-10 pb-10 pt-24">
      <div className="eyebrow mb-10 text-ink/45">
        <span className="eyebrow-rule" />03 · WHAT WE DO
      </div>
      <div className="grid min-h-0 flex-1 gap-px border border-ink/15 bg-ink/15 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        {services.map((s) => (
          <div
            key={s.no}
            className="group flex min-h-0 flex-col justify-between bg-white px-5 pb-[26px] pt-[22px] transition-colors duration-300 hover:bg-terracotta hover:text-white"
          >
            <span className="font-mono text-[10px] leading-none tracking-[0.14em] opacity-55">{s.no}</span>
            <div>
              <h3 className="mb-3 mt-0 text-2xl font-medium leading-[1.12] tracking-[-0.025em]">{s.name}</h3>
              <p className="text-pretty m-0 text-[13px] leading-[1.55] opacity-70">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
