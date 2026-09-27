import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');

// Recursive file list under `dir` (repo-relative), filtered by extension.
export function glob(dir, exts) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
      const rel = path.posix.join(d, e.name);
      if (e.isDirectory()) walk(rel);
      else if (exts.some((x) => e.name.endsWith(x))) out.push(rel);
    }
  };
  walk(dir);
  return out.sort();
}

export function read(p) {
  return fs.readFileSync(path.join(root, p), 'utf8');
}
