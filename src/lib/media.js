import manifest from '../media/manifest.json';

// Everything in public/ is served under Vite's base (e.g. /arya-samodra/).
const BASE = import.meta.env?.BASE_URL ?? '/';
export const asset = (path) => `${BASE}${path.replace(/^\//, '')}`;

export const MEDIA_BASE = asset('media/img');

export const getImage = (key) => (key && Object.hasOwn(manifest, key) ? manifest[key] : null);

export function srcSet(key, fmt) {
  const img = getImage(key);
  if (!img) return '';
  return img.widths.map((w) => `${MEDIA_BASE}/${key}-${w}.${fmt} ${w}w`).join(', ');
}

export function fallbackSrc(key) {
  const img = getImage(key);
  return img ? `${MEDIA_BASE}/${key}-${img.widths.at(-1)}.webp` : '';
}

export const keysWithPrefix = (prefix) => Object.keys(manifest).filter((k) => k.startsWith(prefix)).sort();
