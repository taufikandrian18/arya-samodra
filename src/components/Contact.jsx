import { useEffect, useRef, useState } from 'react';
import Picture from './ui/Picture.jsx';
import { clients, contact } from '../data.js';

export default function Contact() {
  const wallRef = useRef(null);
  const [inView, setInView] = useState(false);

  // Logos rise in one after another when the wall scrolls into view.
  useEffect(() => {
    const el = wallRef.current;
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
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="contact"
      data-tone="dark"
      className="snap-section thin-scroll flex flex-col justify-between gap-12 bg-navy px-5 pb-10 pt-24 text-paper md:overflow-y-auto md:px-10"
    >
      <div>
        <div className="eyebrow eyebrow-dark mb-8">
          <span className="eyebrow-rule" />
          05 · GET IN TOUCH
        </div>
        <h2 className="m-0 text-display font-light">{contact.heading}</h2>
        <p className="m-0 mt-3 text-[17px] text-terracotta-light">{contact.sub}</p>

        <div className="mt-10 grid gap-x-8 gap-y-7 border-t border-paper/15 pt-6 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {contact.channels.map((c) => (
            <div key={c.label}>
              <div className="text-label uppercase text-haze">{c.label}</div>
              <a
                href={c.href}
                {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="mt-2 block text-[17px] leading-snug underline decoration-terracotta underline-offset-4 transition-colors hover:text-terracotta-light"
              >
                {c.value}
              </a>
              <p className="m-0 mt-2 text-[13px] leading-[1.5] text-haze">{c.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-label uppercase text-haze">Our clients</div>
        <div
          ref={wallRef}
          role="group"
          aria-label="Client logos"
          data-inview={inView ? 'true' : 'false'}
          className="logo-wall mt-4 grid grid-cols-4 gap-x-3 gap-y-2 sm:grid-cols-5 md:grid-cols-10"
        >
          {clients.map((c, i) => (
            <div key={c.key} role="img" aria-label={c.name || `Client logo ${i + 1}`} className="logo-cell relative h-14 overflow-hidden" style={{ '--i': i }}>
              {/* Two copies: on hover the first rolls up and the second rolls in. */}
              <div className="logo-roll h-full">
                {[0, 1].map((copy) => (
                  <div key={copy} aria-hidden={copy === 1 || undefined} className="flex h-full items-center justify-center p-1.5">
                    <Picture
                      name={c.key}
                      alt=""
                      reveal={false}
                      fit="contain"
                      sizes="120px"
                      className="h-full w-full"
                      imgClassName="grayscale invert"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
