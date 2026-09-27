import Picture from './ui/Picture.jsx';

const facts = [
  ['FOUNDED', '2018'],
  ['BASE', 'SURABAYA'],
  ['LICENSE', 'IAI'],
  ['TEAM', '07'],
];

export default function Studio() {
  return (
    <section
      id="studio"
      data-tone="light"
      className="snap-section thin-scroll grid content-start gap-10 overflow-y-auto bg-white px-10 pb-10 pt-24 md:grid-cols-[150px_minmax(0,1fr)]"
    >
      <div className="eyebrow self-start leading-[1.8] text-ink/45 md:sticky md:top-[110px]">
        <span className="eyebrow-rule" />
        01<br />ABOUT US<br />OUR STUDIO
      </div>

      <div>
        <p className="text-balance mb-[clamp(16px,3vh,36px)] mt-0 max-w-[20ch] text-[clamp(23px,3vw,46px)] font-medium leading-[1.08] tracking-[-0.03em]">
          We build in the plain language of structure, light and use.
        </p>

        <div className="grid gap-[26px] border-t border-ink/15 pt-[18px] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <p className="text-pretty m-0 text-sm leading-relaxed text-ink/70">
            Arya Samodra Architects is a Surabaya practice working across coffee houses, restaurants, offices,
            housing masterplans and villa resorts. Every commission begins with a site study and ends on site,
            under supervision.
          </p>
          <p className="text-pretty m-0 text-sm leading-relaxed text-ink/70">
            The studio is led by Ar. Arya Samodra, IAI, with a team of seven covering design, documentation and
            construction administration. Work is delivered in East Java, West Java and Yogyakarta.
          </p>
          <dl className="m-0 font-mono text-[10px] leading-loose tracking-[0.12em] text-ink/50">
            {facts.map(([k, v], i) => (
              <div
                key={k}
                className={`flex justify-between py-2 ${i < facts.length - 1 ? 'border-b border-ink/10' : ''}`}
              >
                <dt>{k}</dt>
                <dd className="m-0 text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-[clamp(16px,3vh,36px)] grid grid-cols-[2fr_1fr] gap-3.5">
          <Figure name="studio/interior" alt="HQ Office Arya Samodra Architects, Surabaya" caption="HQ OFFICE · SURABAYA" />
          <Figure name="studio/team-at-work" alt="Studio at work" caption="STUDIO · 07 MEMBERS" />
        </div>
      </div>
    </section>
  );
}

function Figure({ name, alt, caption }) {
  return (
    <figure className="relative m-0 h-[24vh] min-h-[130px] overflow-hidden bg-ink">
      <Picture name={name} alt={alt} sizes="(min-width:768px) 50vw, 100vw" className="h-full w-full" />
      <figcaption className="absolute bottom-3 left-3.5 font-mono text-[9px] leading-none tracking-[0.14em] text-white/85">
        {caption}
      </figcaption>
    </figure>
  );
}
