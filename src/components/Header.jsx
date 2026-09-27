import { useEffect, useRef, useState } from 'react';
import { toneAt } from '../lib/tone.js';

const links = [
  ['#studio', 'Studio'],
  ['#works', 'Works'],
  ['#services', 'Services'],
  ['#team', 'Team'],
];

// Fixed header: wordmark, hairline, nav. Each section declares
// data-tone="dark"|"light"; the header reads the one under its baseline.
export default function Header({ scrollerRef }) {
  const [tone, setTone] = useState('dark');
  const [open, setOpen] = useState(false);
  const menuBtn = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef?.current;
    if (!scroller) return;
    let frame = 0;
    const probe = () => {
      frame = 0;
      const sections = [...scroller.querySelectorAll('section[data-tone]')].map((s) => {
        const r = s.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, tone: s.dataset.tone };
      });
      setTone(toneAt(sections));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };
    probe();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollerRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const textColour = open || tone === 'dark' ? 'text-paper' : 'text-navy';

  return (
    <>
      <header
        data-tone={open || tone === 'dark' ? 'dark' : 'light'}
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center gap-6 px-5 py-4 transition-colors duration-300 md:px-10 md:py-[22px] ${textColour}`}
      >
        <a
          href="#top"
          className="pointer-events-auto whitespace-nowrap text-[13px] font-medium uppercase leading-none tracking-[0.08em]"
        >
          ARYA SAMODRA ARCHITECTS<sup className="ml-0.5 text-[0.7em]">®</sup>
        </a>
        <span aria-hidden="true" className="hidden h-px flex-1 bg-current opacity-40 md:block" />
        <nav aria-label="Primary" className="pointer-events-auto hidden items-center gap-[30px] text-[13px] md:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="transition-opacity hover:opacity-70">
              {label}
            </a>
          ))}
          <a href="#contact" className="inline-flex items-center gap-[9px]">
            Enquire <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-terracotta" />
          </a>
        </nav>
        <button
          ref={menuBtn}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
          className="pointer-events-auto relative z-10 ml-auto flex h-11 w-11 items-center justify-center text-label uppercase md:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </header>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="fixed inset-0 z-40 flex flex-col justify-end gap-2 bg-navy px-5 pb-14 pt-24 text-paper md:hidden"
        >
          {[...links, ['#contact', 'Enquire']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="text-display font-light">
              {label}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
