import { pickRendition } from '../lib/video.js';

test.each([
  [{ width: 1440, dpr: 2 }, '1080'],
  [{ width: 390, dpr: 3 }, '720'],
  [{ width: 1366, dpr: 1 }, '720'],
  [{ width: 1600, dpr: 1 }, '1080'],
  [{ width: 1920, dpr: 1, saveData: true }, '720'],
])('pickRendition(%o) → %s', (input, out) => {
  expect(pickRendition(input)).toBe(out);
});
