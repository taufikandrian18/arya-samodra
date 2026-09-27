import Picture from './ui/Picture.jsx';

export default function ProjectFocus() {
  return (
    <section id="project" data-tone="dark" className="snap-section grid grid-cols-1 bg-navy text-white md:grid-cols-2 md:grid-rows-2">
      <div className="relative overflow-hidden md:row-span-2">
        <Picture name="works/araya-resto-kostel/01" alt="Araya Resto & Kostel, Malang" sizes="(min-width:768px) 50vw, 100vw" className="h-full w-full" />
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
      <Tile name="works/araya-resto-kostel/04" alt="Courtyard dining" caption="COURTYARD · PLANTED SCREEN WALL" />
      <Tile name="works/araya-resto-kostel/03" alt="Facade detail" caption="FACADE · PERFORATED SHADING" />
    </section>
  );
}

function Tile({ name, alt, caption }) {
  return (
    <div className="relative hidden overflow-hidden md:block">
      <Picture name={name} alt={alt} sizes="25vw" className="h-full w-full" />
      <span className="absolute bottom-4 left-5 font-mono text-[9px] leading-none tracking-[0.14em] text-white/85">{caption}</span>
    </div>
  );
}
