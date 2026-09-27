import Picture from './ui/Picture.jsx';
import { clients, contact } from '../data.js';

export default function Contact() {
  return (
    <section
      id="contact"
      data-tone="dark"
      className="snap-section thin-scroll flex flex-col justify-between gap-12 bg-terracotta px-5 pb-10 pt-24 text-paper md:overflow-y-auto md:px-10"
    >
      <div>
        <div className="eyebrow mb-8 text-blush">
          <span className="eyebrow-rule !bg-paper" />
          05 · GET IN TOUCH
        </div>
        <h2 className="m-0 text-display font-light">{contact.heading}</h2>
        <p className="m-0 mt-3 text-[17px] text-blush">{contact.sub}</p>

        <div className="mt-10 grid gap-x-8 gap-y-7 border-t border-paper/30 pt-6 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {contact.channels.map((c) => (
            <div key={c.label}>
              <div className="text-label uppercase text-blush">{c.label}</div>
              <a
                href={c.href}
                {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="mt-2 block text-[17px] leading-snug underline decoration-paper/40 underline-offset-4 hover:decoration-paper"
              >
                {c.value}
              </a>
              <p className="m-0 mt-2 text-[13px] leading-[1.5] text-blush">{c.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-label uppercase text-blush">Our clients</div>
        <div role="group" aria-label="Client logos" className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-10">
          {clients.map((c, i) => (
            <div key={c.key} role="img" aria-label={c.name || `Client logo ${i + 1}`} className="flex h-12 items-center justify-center p-1">
              <Picture
                name={c.key}
                alt=""
                reveal={false}
                fit="contain"
                sizes="120px"
                className="h-full w-full"
                imgClassName="opacity-80 mix-blend-screen grayscale invert transition-opacity duration-500 hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
