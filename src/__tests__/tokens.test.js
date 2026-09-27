// @vitest-environment node
import config from '../../tailwind.config.js';
import { glob, read } from '../test/fsHelpers.js';

test('palette is exactly the brand tokens', () => {
  expect(config.theme.extend.colors).toEqual({
    navy: { DEFAULT: '#0A1E3F', deep: '#06152C' }, paper: '#FFFFFF', concrete: '#DAD9D7', slate: '#4A5160', haze: '#9AA3B2',
    terracotta: { DEFAULT: '#9D5338', light: '#C97B5C' }, blush: '#F3E3D8',
  });
});

test('one font family', () => {
  expect(config.theme.extend.fontFamily.sans[0]).toBe('"Space Grotesk Variable"');
  expect(config.theme.extend.fontFamily.mono).toBeUndefined();
});

test('components use no legacy tokens, fonts, sub-11px text or opacity text colours', () => {
  const banned = /\bink\b|ink-2|\bmist\b|terracotta-(blush|tint)|text-\[(9|10)px\]|text-(navy|white|paper)\/\d+|font-mono|Fraunces|Archivo|JetBrains/;
  for (const f of glob('src/components', ['.jsx'])) expect(read(f), f).not.toMatch(banned);
});

test('no Google Fonts request', () => expect(read('index.html')).not.toMatch(/fonts\.googleapis/));
