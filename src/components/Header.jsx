import { useEffect, useState } from 'react';

const links = [
  ['#studio', 'Studio'],
  ['#works', 'Works'],
  ['#services', 'Services'],
  ['#team', 'Team'],
];

// Fixed, transparent header. Each section declares data-tone="dark"|"light";
// the header reads the section under its baseline and flips its ink to match.
export default function Header({ scrollerRef }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const probe = () => {
      const hit = [...scroller.querySelectorAll('section[data-tone]')].find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= 30 && r.bottom > 30;
      });
      setDark(hit ? hit.dataset.tone === 'dark' : true);
    };
    probe();
    scroller.addEventListener('scroll', probe, { passive: true });
    return () => scroller.removeEventListener('scroll', probe);
  }, [scrollerRef]);

  const ink = dark ? 'text-white [text-shadow:0_1px_18px_rgba(35,31,32,.55)]' : 'text-ink';

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-8 px-10 py-[22px] transition-colors duration-300 ${ink}`}
    >
      <a href="#top" className="pointer-events-auto flex items-baseline gap-[11px]">
        <span className="font-display text-[21px] font-light leading-none tracking-[-0.015em]">Arya Samodra</span>
        <span className="text-[9px] uppercase leading-none tracking-[0.28em] opacity-65">Architects</span>
      </a>
      <nav className="pointer-events-auto hidden items-center gap-[30px] text-xs md:flex">
        {links.map(([href, label]) => (
          <a key={href} href={href} className="opacity-85 transition-opacity hover:opacity-100">
            {label}
          </a>
        ))}
        <a href="#contact" className="inline-flex items-center gap-[9px]">
          Enquire <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
        </a>
      </nav>
    </header>
  );
}
