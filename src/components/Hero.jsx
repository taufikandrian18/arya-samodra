import HeroVideo from './HeroVideo.jsx';
import { hero } from '../data.js';

export default function Hero() {
  return (
    <section id="top" data-tone="dark" className="snap-section flex flex-col bg-navy-deep">
      <div className="absolute inset-0">
        <HeroVideo className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,21,44,.45)_0%,rgba(6,21,44,.05)_40%,rgba(6,21,44,.8)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end px-5 pb-[clamp(24px,4.5vh,52px)] pt-[88px] text-paper md:px-10">
        <div className="eyebrow mb-[clamp(14px,3vh,30px)] text-paper [text-shadow:0_1px_12px_rgba(6,21,44,.6)]">
          <span className="eyebrow-rule" />
          {hero.eyebrow}
        </div>

        <h1 className="m-0 text-display-xl font-light uppercase text-paper">
          {hero.lines.map((line, i) => (
            <span key={line}>
              {i > 0 && ' '}
              <span className="rise block" style={{ '--i': i }}>
                {line}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-[clamp(20px,4.5vh,46px)] flex flex-wrap items-end justify-between gap-[clamp(18px,3vh,34px)]">
          <p className="text-pretty m-0 max-w-[32rem] text-[17px] leading-[1.55] text-paper">{hero.lead}</p>
          <a
            href="#works"
            className="inline-flex items-center gap-3 border border-paper px-7 py-4 text-[13px] leading-none transition-colors duration-500 ease-studio hover:bg-paper hover:text-navy"
          >
            {hero.cta} <span aria-hidden="true" className="text-[15px]">→</span>
          </a>
        </div>
        {hero.caption && (
          <p data-testid="hero-caption" className="mt-4 text-label uppercase text-haze">
            {hero.caption}
          </p>
        )}
      </div>

      <div className="relative z-10 border-t border-paper/20 bg-navy-deep/40 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-x-[18px] gap-y-2 px-5 py-4 text-label uppercase text-haze md:px-10">
          {hero.bar.map((item, i) => (
            <span key={item} className={i === 0 ? 'hidden sm:inline' : undefined}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
