import { Fragment, useEffect } from 'react';
import Odometer from './ui/Odometer.jsx';
import copy from '../content/not-found.json';
import { asset } from '../lib/media.js';

const BASE = import.meta.env?.BASE_URL ?? '/';

// Plan drawing behind the page: a small floor plan whose walls draw in, with
// one room left as a dashed terracotta outline: the page that isn't there.
const WALLS = [
  'M20 20 H580 V380 H20 Z',
  'M20 170 H230 M290 170 H360 V20',
  'M360 230 H580 M360 170 V380',
  'M150 170 V380 M150 290 H20',
  'M230 170 A60 60 0 0 1 290 110',
  'M360 290 A58 58 0 0 1 418 232',
  'M20 80 H8 M20 110 H8 M580 300 H592 M580 330 H592',
  'M440 380 V392 M500 380 V392',
];

// 404: the hero poster pushed in slowly under a deep navy wash and a grain
// layer; a giant 404 rolls up like the preloader's counter; the heading
// pulls up word by word; one pill button back to the site.
export default function NotFound() {
  useEffect(() => {
    document.title = copy.title;
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  const words = copy.heading.split(' ');
  const path = decodeURI(window.location.pathname);

  return (
    <main data-tone="dark" className="nf relative isolate flex min-h-svh flex-col overflow-hidden bg-navy-deep text-paper">
      {/* Backdrop */}
      <img src={asset('media/hero/poster.webp')} alt="" aria-hidden="true" className="nf-poster absolute inset-0 -z-10 h-full w-full object-cover opacity-25" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(6,21,44,.55)_0%,rgba(6,21,44,.35)_40%,rgba(6,21,44,.96)_100%)]" />
      <svg aria-hidden="true" viewBox="0 0 600 400" fill="none" className="nf-plan absolute -right-[18%] top-[14%] -z-10 w-[min(120vw,980px)] md:-right-[6%] md:top-[10%] md:w-[min(70vw,980px)]">
        {WALLS.map((d, i) => (
          <path key={i} d={d} pathLength="1" style={{ '--p': i }} />
        ))}
        <rect className="nf-room" x="376" y="36" width="188" height="178" />
      </svg>
      <svg aria-hidden="true" className="nf-grain pointer-events-none absolute inset-0 -z-10 h-full w-full">
        <filter id="nf-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#nf-noise)" />
      </svg>

      {/* Top bar */}
      <header className="flex items-center justify-between gap-6 px-5 pt-6 md:px-10 md:pt-8">
        <a href={BASE} className="text-label uppercase tracking-[0.2em] text-paper hover:text-terracotta-light">
          Arya Samodra
        </a>
        <span className="text-label uppercase text-haze">Error 404</span>
      </header>

      {/* Giant counter */}
      <div aria-hidden="true" className="pointer-events-none mt-6 px-3 md:absolute md:right-6 md:top-16 md:mt-0 md:px-0">
        <Odometer value="404" label="404" className="text-[clamp(150px,34vw,560px)] font-light leading-[0.8] tracking-[-0.06em] text-navy nf-numeral" />
      </div>

      {/* Message */}
      <div className="relative mt-auto px-5 pb-10 pt-12 md:px-10 md:pb-14">
        <div className="eyebrow eyebrow-dark nf-rise" style={{ '--i': 0 }}>
          <span className="eyebrow-rule" />
          {copy.eyebrow}
        </div>
        <h1 className="m-0 mt-6 max-w-[13ch] text-[clamp(40px,6.4vw,104px)] font-light leading-[0.95] tracking-[-0.03em]">
          {words.map((w, i) => (
            <Fragment key={i}>
              <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <span className="word-up inline-block" style={{ '--i': i }}>
                  {w}
                </span>
              </span>
              {i < words.length - 1 && ' '}
            </Fragment>
          ))}
        </h1>
        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,44ch)_1fr] md:items-end">
          <div className="nf-rise" style={{ '--i': 2 }}>
            <p className="text-pretty m-0 text-[clamp(16px,1.25vw,19px)] leading-[1.55] text-haze">{copy.body}</p>
            <p className="m-0 mt-4 flex min-w-0 items-baseline gap-3 text-label uppercase text-haze">
              {copy.pathLabel}
              <code className="min-w-0 truncate font-sans normal-case tracking-normal text-[13px] text-terracotta-light">{path}</code>
            </p>
          </div>
          <div className="nf-rise flex flex-wrap items-center gap-x-6 gap-y-4 md:justify-end" style={{ '--i': 3 }}>
            <a
              href={BASE}
              className="group/cta inline-flex items-center gap-3 rounded-full bg-paper py-2 pl-5 pr-2 text-[14px] text-navy transition-transform duration-500 ease-studio hover:scale-[1.03]"
            >
              {copy.home}
              <span aria-hidden="true" className="flex h-10 w-10 -rotate-45 items-center justify-center rounded-full bg-terracotta text-paper transition-transform duration-500 ease-studio group-hover/cta:rotate-0">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M2 8h11M9 4l4 4-4 4" />
                </svg>
              </span>
            </a>
            {copy.links.map((l) => (
              <a key={l.hash} href={`${BASE}${l.hash}`} className="border-b border-paper/30 pb-1 text-label uppercase text-paper transition-colors hover:border-terracotta-light hover:text-terracotta-light">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
