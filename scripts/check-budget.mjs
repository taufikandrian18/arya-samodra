// Weight budgets for dist/. Exits 1 and names the offenders on failure.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

export const BUDGETS = {
  entryJsGzip: 75_000,
  allJsGzip: 90_000,
  cssGzip: 12_000,
  img960: 200_000,
  img1600: 450_000,
  img2400: 900_000,
  hero1080: 3_000_000,
  hero720: 1_500_000,
  poster: 80_000,
};

export function imageBudget(filename) {
  const m = /-(\d+)\.(avif|webp)$/.exec(filename);
  if (!m) return null;
  const w = Number(m[1]);
  return w <= 960 ? BUDGETS.img960 : w <= 1600 ? BUDGETS.img1600 : BUDGETS.img2400;
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const gz = (file) => zlib.gzipSync(fs.readFileSync(file)).length;
const kb = (n) => `${(n / 1000).toFixed(1)} KB`;

export function checkBudget(distDir) {
  const failures = [];
  const rows = [];
  const check = (label, size, limit) => {
    rows.push([label, kb(size), kb(limit), size <= limit ? 'ok' : 'OVER']);
    if (size > limit) failures.push(`${label}: ${kb(size)} > ${kb(limit)}`);
  };

  const files = walk(distDir);
  const rel = (f) => path.relative(distDir, f).replace(/\\/g, '/');

  const html = fs.existsSync(path.join(distDir, 'index.html')) ? fs.readFileSync(path.join(distDir, 'index.html'), 'utf8') : '';
  const entry = /<script[^>]+type="module"[^>]+src="\/?([^"]+)"/.exec(html)?.[1];
  const js = files.filter((f) => f.endsWith('.js'));
  if (entry && fs.existsSync(path.join(distDir, entry))) check(`entry JS (gzip) ${entry}`, gz(path.join(distDir, entry)), BUDGETS.entryJsGzip);
  check('all JS (gzip)', js.reduce((s, f) => s + gz(f), 0), BUDGETS.allJsGzip);
  check('CSS (gzip)', files.filter((f) => f.endsWith('.css')).reduce((s, f) => s + gz(f), 0), BUDGETS.cssGzip);

  let images = 0, imagesOver = 0;
  for (const f of files) {
    const r = rel(f);
    if (/\.(png|ts|m3u8)$/.test(r)) failures.push(`forbidden file in dist: ${r}`);
    const limit = imageBudget(r);
    if (limit != null) {
      images++;
      const size = fs.statSync(f).size;
      if (size > limit) {
        imagesOver++;
        failures.push(`${r}: ${kb(size)} > ${kb(limit)}`);
      }
    }
  }
  rows.push([`images (${images} files)`, '', '', imagesOver ? `${imagesOver} OVER` : 'ok']);

  for (const [name, limit] of [['hero-1080.mp4', BUDGETS.hero1080], ['hero-720.mp4', BUDGETS.hero720], ['poster.webp', BUDGETS.poster]]) {
    const f = path.join(distDir, 'media/hero', name);
    if (fs.existsSync(f)) check(name, fs.statSync(f).size, limit);
  }

  return { ok: failures.length === 0, failures, rows };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { ok, failures, rows } = checkBudget(process.argv[2] || 'dist');
  const widths = [0, 1, 2, 3].map((i) => Math.max(...rows.map((r) => r[i].length)));
  for (const r of rows) console.log(r.map((c, i) => c.padEnd(widths[i])).join('  '));
  if (!ok) {
    console.error(`\nbudget: ${failures.length} failure(s)\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }
  console.log('\nbudget: ok');
}
