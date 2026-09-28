// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { LADDERS, widthsFor, ladderFor, buildImages } from '../build-images.mjs';

test('widthsFor caps the ladder at the source width', () => {
  expect(widthsFor(1000, LADDERS.default)).toEqual([480, 1000]);
  expect(widthsFor(3840, LADDERS.default)).toEqual([480, 960, 1600, 2400]);
  expect(widthsFor(2560, LADDERS.default)).toEqual([480, 960, 1600, 2400]);
  expect(widthsFor(960, LADDERS.default)).toEqual([480, 960]);
  expect(widthsFor(400, LADDERS.default)).toEqual([400]);
  expect(widthsFor(360, LADDERS.clients)).toEqual([120, 240]);
});

test('ladderFor picks the client ladder for logos', () => {
  expect(ladderFor('clients/client-01')).toBe(LADDERS.clients);
  expect(ladderFor('works/x/01')).toBe(LADDERS.default);
});

test('buildImages writes both formats per width, nested keys, and a manifest entry', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bi-'));
  const srcDir = path.join(tmp, 'src'), outDir = path.join(tmp, 'out'), manifestPath = path.join(tmp, 'manifest.json');
  fs.mkdirSync(path.join(srcDir, 'works/demo'), { recursive: true });
  await sharp({ create: { width: 1200, height: 800, channels: 3, background: '#9D5338' } }).jpeg().toFile(path.join(srcDir, 'works/demo/01.jpg'));
  const manifest = await buildImages({ srcDir, outDir, manifestPath });
  expect(manifest['works/demo/01']).toMatchObject({ w: 1200, h: 800, widths: [480, 960, 1200] });
  expect(manifest['works/demo/01'].lqip.startsWith('data:image/webp;base64,')).toBe(true);
  for (const w of [480, 960, 1200]) for (const f of ['avif', 'webp'])
    expect(fs.existsSync(path.join(outDir, `works/demo/01-${w}.${f}`))).toBe(true);
  expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8'))['works/demo/01'].w).toBe(1200);
});

test('sizeLimit follows the per-width budgets', async () => {
  const { sizeLimit } = await import('../build-images.mjs');
  expect(sizeLimit(480)).toBe(200_000);
  expect(sizeLimit(1600)).toBe(450_000);
  expect(sizeLimit(2400)).toBe(900_000);
});

test('buildImages skips unchanged sources even when their mtime is newer (CI checkout)', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bi-'));
  const srcDir = path.join(tmp, 'src'), outDir = path.join(tmp, 'out'), manifestPath = path.join(tmp, 'manifest.json');
  fs.mkdirSync(srcDir, { recursive: true });
  const src = path.join(srcDir, '01.jpg');
  await sharp({ create: { width: 400, height: 300, channels: 3, background: '#0A1E3F' } }).jpeg().toFile(src);
  const stats = async () => (await buildImages({ srcDir, outDir, manifestPath }))[Symbol.for('stats')];
  expect((await stats()).written).toBe(2);
  const later = new Date(Date.now() + 60_000);
  fs.utimesSync(src, later, later);
  expect(await stats()).toEqual({ written: 0, skipped: 2 });
  await sharp({ create: { width: 400, height: 300, channels: 3, background: '#9D5338' } }).jpeg().toFile(src);
  expect((await stats()).written).toBe(2);
});
