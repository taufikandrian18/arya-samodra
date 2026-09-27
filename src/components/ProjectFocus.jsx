export default function ProjectFocus() {
  return (
    <section id="project" data-tone="dark" className="snap-section grid grid-cols-1 bg-navy text-white md:grid-cols-2 md:grid-rows-2">
      <div className="relative overflow-hidden md:row-span-2">
        <img src="/assets/p31-1.png" alt="Araya Resto & Kostel, Malang" className="block h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,31,32,.5),rgba(35,31,32,.05)_40%,rgba(35,31,32,.75))]" />
        <div className="absolute left-9 top-[100px] font-mono text-[10px] leading-none tracking-[0.18em] text-white/70">IN FOCUS · 11</div>
        <div className="absolute inset-x-9 bottom-10">
          <h2 className="mb-3.5 mt-0 text-[clamp(28px,3.6vw,54px)] font-medium leading-[1.04] tracking-[-0.03em]">
            Araya Resto &amp; Kostel
          </h2>
          <div className="flex flex-wrap gap-[26px] font-mono text-[10px] leading-[1.8] tracking-[0.12em] text-white/65">
            <span>MALANG</span>
            <span>MIXED USE</span>
            <span>TIMBER SCREEN · COURTYARD</span>
          </div>
        </div>
      </div>
      <Tile src="/assets/p47-2.png" alt="Courtyard dining" caption="COURTYARD · PLANTED SCREEN WALL" />
      <Tile src="/assets/p26-1.png" alt="Facade detail" caption="FACADE · PERFORATED SHADING" />
    </section>
  );
}

function Tile({ src, alt, caption }) {
  return (
    <div className="relative hidden overflow-hidden md:block">
      <img src={src} alt={alt} className="block h-full w-full object-cover" />
      <span className="absolute bottom-4 left-5 font-mono text-[9px] leading-none tracking-[0.14em] text-white/85">{caption}</span>
    </div>
  );
}
