import { toneAt } from '../lib/tone.js';

test('picks the section spanning the baseline', () => {
  const s = [
    { top: -800, bottom: 0, tone: 'dark' },
    { top: 0, bottom: 800, tone: 'light' },
  ];
  expect(toneAt(s)).toBe('light');
  expect(toneAt(s, -10)).toBe('dark');
});

test('defaults to dark', () => expect(toneAt([])).toBe('dark'));
