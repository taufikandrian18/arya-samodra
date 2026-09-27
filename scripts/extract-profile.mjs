// Extract project, studio and team photos from the company profile PDF,
// losslessly, using the reviewed map in assets-src/profile/profile-map.json.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import sharp from 'sharp';

const entries = (map) => [
  ...Object.values(map.works || {}).flat(),
  ...(map.studio || []),
  ...Object.values(map.team || {}),
];

export function planCopies(map) {
  return entries(map).map((e) => ({
    from: e.file,
    to: `assets-src/images/${e.key}${path.extname(e.file)}`,
  }));
}

export function reviewList(map) {
  return entries(map).filter((e) => e.review).map((e) => e.key);
}

export async function extractProfile({
  pdf,
  map,
  outRoot = '.',
  tmpDir,
  run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' }),
}) {
  fs.mkdirSync(tmpDir, { recursive: true });
  run('pdfimages', ['-j', '-png', '-p', '-f', '6', '-l', '61', pdf, path.join(tmpDir, 'img')]);

  const byFile = new Map(entries(map).map((e) => [e.file, e]));
  const copies = planCopies(map);
  for (const { from } of copies) {
    const src = path.join(tmpDir, from);
    if (!fs.existsSync(src)) throw new Error(`missing extracted file: ${from}`);
    const { width, height } = await sharp(src).metadata();
    const want = byFile.get(from);
    if (width !== want.w || height !== want.h) {
      throw new Error(`size mismatch for ${from}: got ${width}x${height}, map says ${want.w}x${want.h}`);
    }
  }
  for (const { from, to } of copies) {
    const dest = path.join(outRoot, to);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(tmpDir, from), dest);
  }
  return { copied: copies.length, review: reviewList(map) };
}

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

// Contact sheet: one row per project (plus studio and team), 160px thumbnails,
// each labelled with its key; review items get a red border.
export async function buildReviewSheet({ map, imagesDir, out }) {
  const H = 160, PAD = 12, LABEL = 18, ROWLABEL = 22;
  const rows = [
    ...Object.entries(map.works).map(([id, list]) => [id, list]),
    ['studio', map.studio],
    ['team', Object.values(map.team)],
  ];
  const layers = [];
  let y = PAD, maxW = 0;
  for (const [title, list] of rows) {
    layers.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${ROWLABEL}"><text x="0" y="16" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0A1E3F">${esc(title)}</text></svg>`), left: PAD, top: y });
    y += ROWLABEL;
    let x = PAD;
    for (const e of list) {
      const file = path.join(imagesDir, `${e.key}${path.extname(e.file)}`);
      const w = Math.round((e.w / e.h) * H);
      const border = e.review ? 6 : 0;
      let img = sharp(file).resize(w, H).flatten({ background: '#DAD9D7' });
      if (border) img = img.extend({ top: border, bottom: border, left: border, right: border, background: '#E00000' });
      layers.push({ input: await img.jpeg().toBuffer(), left: x - border, top: y - border });
      const name = e.key.split('/').slice(1).join('/') + (e.review ? '  REVIEW' : '');
      layers.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(w, 60)}" height="${LABEL}"><text x="0" y="13" font-family="sans-serif" font-size="12" fill="${e.review ? '#E00000' : '#333'}">${esc(name)}</text></svg>`), left: x, top: y + H + 4 });
      x += Math.max(w, 60) + PAD + 8;
    }
    maxW = Math.max(maxW, x);
    y += H + LABEL + PAD * 2;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp({ create: { width: maxW + PAD, height: y, channels: 3, background: '#FFFFFF' } })
    .composite(layers)
    .jpeg({ quality: 80 })
    .toFile(out);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const map = JSON.parse(fs.readFileSync('assets-src/profile/profile-map.json', 'utf8'));
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'profile-'));
  const res = await extractProfile({ pdf: map.source, map, tmpDir });
  const clientsDir = 'public/assets/clients';
  if (fs.existsSync(clientsDir)) {
    fs.mkdirSync('assets-src/images/clients', { recursive: true });
    for (const f of fs.readdirSync(clientsDir)) fs.copyFileSync(path.join(clientsDir, f), path.join('assets-src/images/clients', f));
  }
  await buildReviewSheet({ map, imagesDir: 'assets-src/images', out: 'assets-src/profile/review-sheet.jpg' });
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`copied: ${res.copied}`);
  console.log(`review (${res.review.length}):\n  ${res.review.join('\n  ')}`);
}
