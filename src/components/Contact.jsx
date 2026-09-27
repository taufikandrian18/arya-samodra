import { clients } from '../data.js';

const channels = [
  ['EMAIL', 'studio@aryasamodra.co.id'],
  ['MOBILE', '+62 ··· ···· ····'],
  ['OFFICE', 'Surabaya, East Java'],
  ['INSTAGRAM', '@aryasamodra.architects'],
];

export default function Contact() {
  return (
    <section
      id="contact"
      data-tone="light"
      className="snap-section thin-scroll flex flex-col justify-between overflow-y-auto bg-white px-10 pb-8 pt-24"
    >
      <div>
        <div className="eyebrow mb-9 text-ink/45">
          <span className="eyebrow-rule" />05 · GET IN TOUCH
        </div>
        <h2 className="mb-[clamp(20px,4vh,44px)] mt-0 max-w-[24ch] text-[clamp(30px,4.4vw,68px)] font-medium leading-[1.02] tracking-[-0.035em]">
          Send the site, the brief, or just the constraint.
        </h2>
        <div className="grid gap-7 border-t border-ink/15 pt-6 font-mono text-[11px] leading-[1.9] tracking-[0.08em] [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
          {channels.map(([k, v]) => (
            <div key={k}>
              <div className="mb-1.5 text-ink/45">{k}</div>
              <div>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[60px] flex flex-wrap items-end justify-between gap-10">
        <div className="font-mono text-[9px] leading-[1.8] tracking-[0.14em] text-ink/45">
          OUR CLIENTS<br />20 MARKS
        </div>
        <div className="grid max-w-[1000px] flex-1 grid-cols-5 gap-3 md:grid-cols-10">
          {clients.map((src) => (
            <div key={src} className="flex h-11 items-center justify-center p-1">
              <img
                src={src}
                alt=""
                className="max-h-full max-w-full object-contain opacity-60 mix-blend-multiply grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
