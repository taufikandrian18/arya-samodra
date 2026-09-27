// @vitest-environment node
import { glob, read } from '../test/fsHelpers.js';

test('no source file references the legacy /assets/ folder', () => {
  for (const f of glob('src', ['.js', '.jsx'])) {
    if (f.includes('__tests__')) continue;
    expect(read(f), f).not.toContain('/assets/');
  }
});
