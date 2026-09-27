// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkBudget, imageBudget } from '../check-budget.mjs';

function dist(extra = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dist-'));
  const files = {
    'index.html': '<script type="module" crossorigin src="/assets/index-abc.js"></script>',
    'assets/index-abc.js': 'console.log(1)',
    'assets/index-abc.css': 'body{}',
    'media/img/works/x/01-480.avif': Buffer.alloc(1000),
    ...extra,
  };
  for (const [p, c] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true });
    fs.writeFileSync(path.join(dir, p), c);
  }
  return dir;
}

test('a small dist passes', () => expect(checkBudget(dist()).ok).toBe(true));

test('an oversized 2400 image fails and is named', () => {
  const r = checkBudget(dist({ 'media/img/works/x/01-2400.avif': Buffer.alloc(950_000) }));
  expect(r.ok).toBe(false);
  expect(r.failures.join()).toContain('01-2400.avif');
});

test('an oversized 960 image fails', () => {
  expect(checkBudget(dist({ 'media/img/works/x/01-960.webp': Buffer.alloc(250_000) })).ok).toBe(false);
});

test('HLS segments fail', () => {
  expect(checkBudget(dist({ 'assets/hls/x.ts': 'x' })).ok).toBe(false);
});

test('imageBudget by width', () => {
  expect(imageBudget('a-1600.webp')).toBe(450_000);
  expect(imageBudget('a-480.avif')).toBe(200_000);
  expect(imageBudget('a-2400.avif')).toBe(900_000);
});
