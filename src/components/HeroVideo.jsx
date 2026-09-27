import { useEffect, useRef, useState } from 'react';
import { hero } from '../data.js';
import { pickRendition } from '../lib/video.js';
import { usePrefersReducedMotion } from '../lib/motion.js';

// Poster-first muted loop. Reduced motion gets the poster only; the video
// pauses while less than 10% of it is on screen.
export default function HeroVideo({ className = '' }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const [src] = useState(() =>
    hero.sources[
      pickRendition({
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        dpr: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
        saveData: typeof navigator !== 'undefined' && !!navigator.connection?.saveData,
      })
    ]
  );

  useEffect(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio < 0.1) v.pause?.();
        else v.play?.()?.catch?.(() => {});
      },
      { threshold: [0, 0.1] }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced) return <img src={hero.poster} alt="" className={className} />;

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={hero.poster}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
    />
  );
}
