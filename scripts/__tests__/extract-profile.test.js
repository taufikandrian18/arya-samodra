// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import map from '../../assets-src/profile/profile-map.json';
import { planCopies, reviewList, extractProfile } from '../extract-profile.mjs';

test('plans one copy per mapped image with key-based destinations', () => {
  const copies = planCopies(map);
  expect(copies).toHaveLength(96);
  expect(copies).toContainEqual({ from: map.works['araya-resto-kostel'][0].file, to: 'assets-src/images/works/araya-resto-kostel/01.jpg' });
  expect(copies.find((c) => c.to.startsWith('assets-src/images/team/gerard-levinas'))).toBeTruthy();
});

test('review list names the 9 cross-spread photos', () => {
  expect(reviewList(map)).toHaveLength(9);
  expect(reviewList(map)).toContain('works/joglo-modern-villa/07');
});

test('every flagged photo carries a review decision', () => {
  const flagged = [...Object.values(map.works).flat(), ...map.studio].filter((e) => e.review);
  for (const e of flagged) expect(e.reviewed, e.key).toBeTruthy();
});

test('extractProfile rejects a file whose size does not match the map', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ex-'));
  const tmpOut = fs.mkdtempSync(path.join(os.tmpdir(), 'out-'));
  await sharp({ create: { width: 10, height: 10, channels: 3, background: '#000' } }).jpeg().toFile(path.join(tmpDir, map.studio[0].file));
  await expect(
    extractProfile({ pdf: 'x.pdf', map: { works: {}, team: {}, studio: [map.studio[0]] }, outRoot: tmpOut, tmpDir, run: () => {} })
  ).rejects.toThrow(/size mismatch/);
});
