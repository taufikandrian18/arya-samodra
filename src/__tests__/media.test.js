import { getImage, srcSet, keysWithPrefix, fallbackSrc } from '../lib/media.js';

test('srcSet lists every ladder width', () => {
  const k = 'works/araya-resto-kostel/01';
  const { widths } = getImage(k);
  expect(srcSet(k, 'avif')).toBe(widths.map((w) => `/media/img/${k}-${w}.avif ${w}w`).join(', '));
  expect(fallbackSrc(k)).toBe(`/media/img/${k}-${widths.at(-1)}.webp`);
});

test('keysWithPrefix returns a project gallery in order', () => {
  const keys = keysWithPrefix('works/araya-resto-kostel/');
  expect(keys[0]).toBe('works/araya-resto-kostel/01');
  expect(keys.length).toBeGreaterThan(1);
});

test('getImage(null-ish/unknown) is null', () => {
  expect(getImage('nope')).toBeNull();
  expect(getImage(undefined)).toBeNull();
});
