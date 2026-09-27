// Pull the published content from WordPress into src/content/site.json and
// download any new photos into assets-src/images/cms/ (npm run images then
// encodes them). Run in CI before the build:
//
//   CMS_URL=https://website.taufikandrian.my.id/arya-samodra node scripts/fetch-cms.mjs
//
// Photos imported from this repo carry their original key and are reused as
// is; anything the client uploads becomes cms/<attachment id>. If WordPress
// can't be reached or returns something unusable, the script fails and the
// committed snapshot stays in place.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'assets-src/images';
const OUT = 'src/content/site.json';

export function validate(c) {
  const errors = [];
  const need = (cond, msg) => cond || errors.push(msg);
  need(c && c.version === 1, 'version must be 1');
  need(Array.isArray(c?.works) && c.works.length > 0, 'at least one project');
  for (const w of c?.works ?? []) {
    need(/^[a-z0-9-]+$/.test(w.id || ''), `project "${w.name}": bad slug "${w.id}"`);
    need(w.name, `project ${w.id}: missing name`);
    need(Array.isArray(w.images) && w.images.length > 0, `project "${w.name}": needs at least one photo`);
  }
  need(c?.hero?.lines?.length > 0, 'hero headline lines');
  need(Array.isArray(c?.team), 'team list');
  need(Array.isArray(c?.contact?.channels), 'contact channels');
  return errors;
}

const exists = (key) => ['jpg', 'jpeg', 'png', 'webp'].some((e) => fs.existsSync(path.join(SRC, `${key}.${e}`)));

async function download(img) {
  const ext = (path.extname(new URL(img.url).pathname).slice(1) || 'jpg').toLowerCase().replace('jpeg', 'jpg');
  const key = `cms/${img.id}`;
  const file = path.join(SRC, `${key}.${ext}`);
  const stamp = `${file}.modified`;
  const fresh = fs.existsSync(file) && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === String(img.modified);
  if (!fresh) {
    const res = await fetch(img.url);
    if (!res.ok) throw new Error(`download ${img.url}: HTTP ${res.status}`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    fs.writeFileSync(stamp, String(img.modified));
    console.log(`  downloaded ${key}.${ext}`);
  }
  return key;
}

// Replace every image object with a key the site's media pipeline knows.
export async function resolveImages(c, dl = download) {
  const toKey = async (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img; // already a key
    if (img.key && exists(img.key)) return img.key;
    return dl(img);
  };
  for (const w of c.works) w.images = (await Promise.all(w.images.map(toKey))).filter(Boolean);
  c.studio.figure.image = await toKey(c.studio.figure.image);
  c.studio.principal.photo = await toKey(c.studio.principal.photo);
  for (const m of c.team) m.photo = await toKey(m.photo);
  for (const cl of c.clients) cl.image = await toKey(cl.image);
  return c;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const base = (process.env.CMS_URL || '').replace(/\/$/, '');
  if (!base) {
    console.error('CMS_URL is not set.');
    process.exit(1);
  }
  const url = `${base}/index.php?rest_route=/arya/v1/content`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    console.error(`CMS: ${url} → HTTP ${res.status}`);
    process.exit(1);
  }
  const content = await res.json();
  const errors = validate(content);
  if (errors.length) {
    console.error('CMS content is incomplete, keeping the committed snapshot:\n  ' + errors.join('\n  '));
    process.exit(1);
  }
  await resolveImages(content);
  fs.writeFileSync(OUT, JSON.stringify(content, null, 1) + '\n');
  console.log(`CMS: ${content.works.length} projects, ${content.team.length} team, ${content.clients.length} clients → ${OUT}`);
}
