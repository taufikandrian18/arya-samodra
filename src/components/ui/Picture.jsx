import { useEffect, useRef, useState } from 'react';
import { getImage, srcSet, fallbackSrc } from '../../lib/media.js';

const warned = new Set();

// Responsive AVIF/WebP picture from the media manifest. With `reveal`, the
// image opens through the "aperture" once it is decoded and ≥15% in view.
export default function Picture({
  name,
  alt,
  sizes = '100vw',
  eager = false,
  reveal = true,
  fit = 'cover',
  ratio,
  className = '',
  imgClassName = '',
}) {
  const img = getImage(name);
  const wrapRef = useRef(null);
  const [decoded, setDecoded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(!reveal);

  useEffect(() => {
    if (!reveal || !img) return;
    const el = wrapRef.current;
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
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reveal, img]);

  const style = ratio ? { aspectRatio: ratio } : undefined;

  if (!img) {
    if (!warned.has(name)) {
      warned.add(name);
      console.warn(`[Picture] no manifest entry for "${name}"; run npm run images`);
    }
    return <div role="img" aria-label={alt} className={`bg-concrete ${className}`} style={style} />;
  }

  if (failed) {
    return (
      <div role="img" aria-label={alt} data-state="error" className={`relative flex items-center justify-center bg-concrete ${className}`} style={style}>
        {import.meta.env.DEV && (
          <span className="px-3 text-center text-label uppercase text-slate">Image file missing · run npm run images</span>
        )}
      </div>
    );
  }

  const open = !reveal || (decoded && inView);
  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div
      ref={wrapRef}
      className={`aperture relative overflow-hidden ${className}`}
      data-state={open ? 'open' : 'closed'}
      style={{ ...style, backgroundImage: fit === 'cover' && img.lqip ? `url("${img.lqip}")` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet(name, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(name, 'webp')} sizes={sizes} />
        <img
          src={fallbackSrc(name)}
          alt={alt}
          width={img.w}
          height={img.h}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          {...(eager ? { fetchpriority: 'high' } : {})}
          onLoad={() => setDecoded(true)}
          onError={() => {
            if (!warned.has(`file:${name}`)) {
              warned.add(`file:${name}`);
              console.warn(`[Picture] ${name} failed to load; the encoded files are missing. Run npm run images.`);
            }
            setFailed(true);
          }}
          ref={(el) => {
            if (el && el.complete && el.naturalWidth && !decoded) setDecoded(true);
          }}
          className={`block h-full w-full ${fitClass} ${imgClassName}`}
        />
      </picture>
    </div>
  );
}
