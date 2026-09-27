import { useEffect, useRef, useState } from 'react';
import { services, servicesIntro, workflow } from '../data.js';

// One line drawing per service, in the language of architectural drawings:
// elevation, site plan, colonnade, sun path + fins, structural frame.
const GLYPHS = {
  '01': [
    'M8 46 L60 14 L112 46',
    'M20 46 H100',
    'M26 46 V104 M94 46 V104',
    'M26 75 H94',
    'M38 56 H56 V67 H38 Z M64 56 H82 V67 H64 Z',
    'M40 104 V86 H56 V104',
    'M64 84 H82 M64 90 H82 M64 96 H82',
    'M6 104 H114',
  ],
  '02': [
    'M10 10 H110 V110 H10 Z',
    'M10 60 H48 M72 60 H110 M60 10 V48 M60 72 V110',
    'M72 60 A12 12 0 1 0 48 60 A12 12 0 1 0 72 60',
    'M18 18 H50 V50 H18 Z',
    'M70 18 H102 V32 H70 Z M70 38 H102 V50 H70 Z',
    'M18 70 H30 V102 H18 Z M36 70 H50 V102 H36 Z',
    'M70 70 H102 V102 H70 Z M70 70 L102 102',
  ],
  '03': [
    'M8 40 H112 M8 48 H112',
    'M14 104 V70 A12 12 0 0 1 38 70 V104',
    'M48 104 V70 A12 12 0 0 1 72 70 V104',
    'M82 104 V70 A12 12 0 0 1 106 70 V104',
    'M22 16 H98 V40',
    'M22 16 V40',
    'M6 104 H114',
  ],
  '04': [
    'M12 72 A48 48 0 0 1 108 72',
    'M91 36 A8 8 0 1 0 75 36 A8 8 0 1 0 91 36',
    'M83 20 V14 M97 30 L102 26 M69 30 L64 26',
    'M14 80 H106 M14 106 H106',
    'M22 80 L34 106 M38 80 L50 106 M54 80 L66 106 M70 80 L82 106 M86 80 L98 106',
  ],
  '05': [
    'M20 106 V22 M60 106 V22 M100 106 V22',
    'M14 22 H106 M14 64 H106',
    'M20 64 L60 22 M60 64 L100 22',
    'M20 106 L60 64 M60 106 L100 64',
    'M6 106 H114',
  ],
};

function Glyph({ no }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className="svc-glyph h-full w-auto max-w-full">
      {GLYPHS[no].map((d, i) => (
        <path key={i} d={d} pathLength="1" style={{ '--p': i }} />
      ))}
    </svg>
  );
}

export default function Services() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="services"
      data-tone="dark"
      data-inview={inView ? 'true' : 'false'}
      className="snap-section thin-scroll flex flex-col bg-navy px-5 pb-10 pt-24 text-paper md:overflow-y-auto md:px-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div className="eyebrow eyebrow-dark">
          <span className="eyebrow-rule" />
          03 · WHAT WE DO
        </div>
        <p className="text-balance m-0 max-w-[46ch] text-[clamp(18px,1.7vw,22px)] font-light leading-[1.35] tracking-[-0.01em] text-terracotta-light">
          {servicesIntro}
        </p>
      </div>

      <div className="svc-cols mt-8 grid min-h-0 flex-1 gap-px border border-paper/15 bg-paper/15 md:grid-cols-5 md:min-h-[380px]">
        {services.map((s, i) => (
          <article
            key={s.no}
            style={{ '--i': i }}
            className="svc group grid grid-cols-[64px_1fr] items-start gap-x-5 bg-navy p-5 md:flex md:min-h-0 md:flex-col md:justify-between md:gap-4 md:p-6"
          >
            <span className="svc-no col-start-2 text-label text-haze md:order-1">{s.no}</span>
            <div className="col-start-1 row-span-2 row-start-1 h-16 md:order-2 md:row-auto md:flex md:h-auto md:min-h-0 md:flex-1 md:items-center">
              <div className="h-16 md:h-[clamp(64px,16vh,150px)]">
                <Glyph no={s.no} />
              </div>
            </div>
            <div className="col-start-2 md:order-3">
              <h3 className="m-0 text-[clamp(18px,1.7vw,24px)] font-normal leading-[1.15] tracking-[-0.01em]">{s.name}</h3>
              <p className="svc-scope text-pretty m-0 mt-2 text-[14px] leading-[1.55] text-haze">{s.scope}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <div className="text-label uppercase text-haze">Workflow</div>
        <ol aria-label="Workflow" className="relative m-0 mt-4 grid list-none gap-6 p-0 md:grid-cols-6 md:gap-4">
          <span aria-hidden="true" className="absolute left-4 top-4 hidden h-px w-[calc(100%-2rem)] border-t border-dashed border-terracotta md:block" />
          <span aria-hidden="true" className="absolute bottom-4 left-4 top-4 w-px border-l border-dashed border-terracotta md:hidden" />
          {workflow.map((w) => (
            <li key={w.step} className="relative grid grid-cols-[32px_1fr] gap-4 md:block">
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-terracotta bg-navy text-[13px] text-paper">
                {w.step}
              </span>
              <div className="md:mt-3">
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
