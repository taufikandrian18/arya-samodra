import HlsVideo from './HlsVideo.jsx';
import { HERO_VIDEO } from '../data.js';

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

export default function Hero() {
  return (
    <section id="top" data-tone="dark" className="snap-section relative flex flex-col bg-ink">
      <div className="absolute inset-0">
        <HlsVideo
          src={HERO_VIDEO}
          className="absolute inset-0 h-full w-full object-cover [filter:saturate(.82)_contrast(1.04)_brightness(.8)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,31,32,.4)_0%,rgba(35,31,32,.12)_38%,rgba(35,31,32,.88)_100%)]" />
        <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: grain }} />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end px-10 pb-[clamp(24px,4.5vh,52px)] pt-[88px] text-white">
        <div className="mb-[clamp(14px,3vh,30px)] flex items-center gap-3.5 text-[10px] uppercase leading-none tracking-wide3 text-white/80">
          <span className="h-px w-10 bg-white/60" />
          <span>Est. 2018 · Surabaya, East Java</span>
        </div>

        <h1 className="text-balance m-0 max-w-[19ch] font-display text-[clamp(34px,min(8.4vw,10.5vh),124px)] font-light leading-[0.94] tracking-[-0.02em]">
          Architecture measured in{' '}
          <em className="font-normal italic text-terracotta-blush">standing light</em>.
        </h1>

        <div className="mt-[clamp(20px,4.5vh,46px)] flex flex-wrap items-end justify-between gap-[clamp(18px,3vh,34px)]">
          <p className="text-pretty m-0 max-w-[30rem] text-[clamp(14px,1.6vh,16px)] leading-[1.55] text-white/85">
            A studio led by Ar. Arya Samodra, IAI. Design, documentation and construction supervision for
            hospitality, retail and residential work across East Java.
          </p>
          <div className="flex items-center gap-[18px]">
            <a
              href="#works"
              className="inline-flex items-center gap-3 border border-white/70 px-7 py-4 text-[13px] leading-none transition-colors duration-500 ease-studio hover:bg-white hover:text-ink"
            >
              Explore the works <span className="text-[15px]">→</span>
            </a>
            <a href="#project" className="group inline-flex items-center gap-3 text-[13px] leading-none">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 transition-colors group-hover:bg-white group-hover:text-ink">
                <span className="translate-x-px text-[10px]">▶</span>
              </span>
              In focus · Araya
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/20 bg-ink/30 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-[18px] px-10 py-4 text-[10px] uppercase leading-none tracking-wide2 text-white/80">
          <span>7°15′S · 112°45′E</span>
          <span>12 Projects · 05 Services · 07 Members</span>
          <span className="hidden md:inline">Design · Documentation · Supervision</span>
          <span>Licensed IAI</span>
        </div>
      </div>
    </section>
  );
}
