// @vitest-environment node
import { read } from '../test/fsHelpers.js';

test('snapping is desktop-only on the scroller', () => {
  const app = read('src/App.jsx');
  expect(app).toContain('md:snap-mandatory');
  expect(app).not.toMatch(/(?<!md:)snap-mandatory/);
});

test.each(['Hero', 'Studio', 'Works', 'ProjectFocus', 'Services', 'Team', 'Contact'])('%s scrolls internally only from md up', (name) => {
  expect(read(`src/components/${name}.jsx`)).not.toMatch(/(?<!md:)overflow-y-auto/);
});
