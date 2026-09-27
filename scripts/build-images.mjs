// Encode assets-src/images/** into AVIF + WebP width ladders under
// public/media/img/** and write src/media/manifest.json.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export const LADDERS = { default: [480, 960, 1600, 2400], clients: [120, 240] };

export function widthsFor(srcWidth, ladder) {
  const steps = ladder.filter((w) => w <= srcWidth * 0.9);
  steps.push(Math.min(srcWidth, ladder.at(-1)));
  return [...new Set(steps)].sort((a, b) => a - b);
}

export const ladderFor = (key) => (key.startsWith('clients/') ? LADDERS.clients : LADDERS.default);

// Per-file byte ceilings (mirrors scripts/check-budget.mjs). An encode that
// exceeds its ceiling is retried at lower quality.
export const sizeLimit = (width) => (width <= 960 ? 200_000 : width <= 1600 ? 450_000 : 900_000);

async function encode(file, width, fmt, opts, out) {
  let q = opts.quality;
  for (;;) {
    const buf = await sharp(file).rotate().resize({ width, withoutEnlargement: true })[fmt]({ ...opts, quality: q }).toBuffer();
    if (buf.length <= sizeLimit(width) || q <= 40) {
      fs.writeFileSync(out, buf);
      return;
    }
    q -= 6;
  }
}

const SRC_EXT = /\.(jpe?g|png|webp|tiff?)$/i;

function listSources(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return listSources(p, base);
    return SRC_EXT.test(e.name) ? [p] : [];
  });
}

const fresh = (out, srcMtime) => fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcMtime;

export async function buildImages({ srcDir, outDir, manifestPath }) {
  const manifest = {};
  let written = 0, skipped = 0;
  for (const file of listSources(srcDir)) {
    const key = path.relative(srcDir, file).replace(/\\/g, '/').replace(SRC_EXT, '');
    const srcMtime = fs.statSync(file).mtimeMs;
    const meta = await sharp(file).rotate().metadata();
    const w = meta.autoOrient?.width ?? meta.width;
    const h = meta.autoOrient?.height ?? meta.height;
    const widths = widthsFor(w, ladderFor(key));
    fs.mkdirSync(path.dirname(path.join(outDir, key)), { recursive: true });
    for (const width of widths) {
      for (const [fmt, opts] of [['avif', { quality: 50, effort: 4 }], ['webp', { quality: 72 }]]) {
        const out = path.join(outDir, `${key}-${width}.${fmt}`);
        if (fresh(out, srcMtime)) { skipped++; continue; }
        await encode(file, width, fmt, opts, out);
        written++;
      }
    }
    // LQIP ships inside the JS bundle, so keep it tiny. Logos and cut-outs
    // (transparent) never use one: it would show through the transparency.
    const entry = { w, h, widths };
    if (!key.startsWith('clients/') && !key.startsWith('team-cutout/')) {
      const lqip = await sharp(file).rotate().resize({ width: 16 }).webp({ quality: 30 }).toBuffer();
      entry.lqip = `data:image/webp;base64,${lqip.toString('base64')}`;
    }
    manifest[key] = entry;
  }
  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 1) + '\n');
  Object.defineProperty(sorted, Symbol.for('stats'), { value: { written, skipped } });
  return sorted;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const t = Date.now();
  const m = await buildImages({ srcDir: 'assets-src/images', outDir: 'public/media/img', manifestPath: 'src/media/manifest.json' });
  const { written, skipped } = m[Symbol.for('stats')];
  console.log(`images: ${Object.keys(m).length} keys, ${written} written, ${skipped} up to date (${((Date.now() - t) / 1000).toFixed(1)}s)`);
}
