# Quiet Frame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Arya Samodra one-page site present like the client's references (photo-first, monochrome, one sans family, project viewer) and cut its weight by roughly 10× without changing the section flow.

**Architecture:** Photos go through a build-time pipeline (`sharp`) into AVIF/WebP width ladders plus a JSON manifest. A single `<Picture>` component renders them lazily with the "Aperture" reveal. The 4K HLS hero becomes two MP4 renditions picked at runtime. hls.js and GSAP are removed; motion is CSS + IntersectionObserver. Works becomes an image grid that opens a native-`<dialog>` Project Viewer, with state lifted to `App` and mirrored in `?work=<id>`.

**Tech Stack:** React 18.3, Vite 5.4, Tailwind 3.4, Vitest 3.2 + Testing Library + jsdom, sharp 0.34, ffmpeg (asset step only), @fontsource-variable/archivo, @fontsource/jetbrains-mono.

**Spec:** `docs/superpowers/specs/2026-09-27-quiet-frame-design.md` (read it first). Research behind it: `docs/superpowers/research/2026-09-27-reference-evaluation.md`.

**Kickoff prompt for Claude Code (GitHub):** "Read CLAUDE.md, the spec and this plan. Execute `docs/superpowers/plans/2026-09-27-quiet-frame.md` task by task on branch `feat/quiet-frame`; commit after every task; stop and report if a verification step fails twice."

## Global Constraints

- Node ≥ 20.9. **No major upgrades**: stay on React 18.3, Vite 5.4, Tailwind 3.4.
- Exact new dev deps: `vitest@3.2.7 jsdom@25 @testing-library/react@16 @testing-library/jest-dom@6 @testing-library/user-event@14 sharp@0.34.5`. New deps: `@fontsource-variable/archivo@^5 @fontsource/jetbrains-mono@^5`. Remove: `hls.js`, `gsap`.
- Section flow and order are fixed: Header, Hero, Studio, Works, ProjectFocus, Services, Team, Contact. Every section stays a child of the `App` scroller, uses `.snap-section`, and declares `data-tone`.
- All copy and content live in `src/data.js`. Components never hard-code project names or image paths.
- Colours only from the spec tokens: `ink #231F20`, `paper #FFFFFF`, `concrete #EEEDEA`, `stone #6B6766`, `bone #E9E6E1`, `fog #A29D9B`, `terracotta #9C5338`, `terracotta-light #C97B5C`. No `navy`, `blush`, `tint`, `mist`, `ink-2`. No opacity-derived text colours (`text-ink/45`, `text-white/60`…). Opacity on borders/backgrounds (`border-ink/10`) is fine.
- Two font families only: `"Archivo Variable"` (display + body, via `font-stretch`) and `"JetBrains Mono"` (meta). No Google Fonts request.
- Minimum text size 11px (`text-meta`).
- Every animation is disabled under `prefers-reduced-motion: reduce`, and the hero shows the poster instead of video.
- Eases: `cubic-bezier(0.16,1,0.3,1)` (Tailwind `ease-studio`) and `cubic-bezier(0.22,1,0.36,1)` (`ease-lift`).
- Code touching `IntersectionObserver` or `HTMLMediaElement.play()` must no-op when the API is missing (jsdom has neither).
- Fixed UI copy: "View selected works", "View project", "Menu", "Close", "Previous project", "Next project", "All work", "Client logos".
- Budgets (Task 13 enforces): entry JS ≤ 75 KB gzip, all JS ≤ 90 KB gzip, CSS ≤ 12 KB gzip, each `dist/media/img/*` ≤ 300 KB, `hero-1080.mp4` ≤ 3.0 MB, `hero-720.mp4` ≤ 1.5 MB, `poster.webp` ≤ 80 KB, zero `.png`/`.ts`/`.m3u8` in `dist`.

## Review Focus

1. **Project added to `data.js` before `npm run images` was run**: `<Picture>` gets an unknown key. Expect a neutral concrete frame carrying the alt text, no crash, one console warning. Test in Task 2.
2. **Touch or keyboard only, no hover**: every work must open by tap/Enter; nothing may depend on `mouseenter`. Test in Task 8.
3. **Viewer opened from a filtered grid**: Previous/Next and ←/→ must stay inside the filtered list and wrap at both ends. Test in Task 9.
4. **Shared link with a bad slug** (`?work=old-name#works`): the page loads normally, no dialog opens, the param is removed and the hash is kept. Test in Task 9.
5. **Reduced motion or Save-Data**: no autoplay video (poster only), 720p when Save-Data is on, images appear without the aperture. Tests in Tasks 2 and 3.

---

### Task 0: Repository, test harness, baseline

**Files:**
- Create: `vitest.config.js`, `src/test/setup.js`, `src/test/fsHelpers.js`, `src/__tests__/smoke.test.jsx`, `package-lock.json`
- Modify: `package.json` (scripts, devDeps), `.gitignore`

**Interfaces:**
- Produces:
  - `npm test` (= `vitest run`).
  - A jsdom environment with `HTMLDialogElement.showModal/close` and `window.matchMedia` stubs.
  - `src/test/fsHelpers.js`: `glob(dir: string, exts: string[]) → string[]` (recursive, repo-relative paths) and `read(path: string) → string`. Later guard tests use both.

- [ ] **Step 1: Put the project under git on GitHub.** If `git rev-parse` fails, run `git init -b main`, commit the current tree as `chore: baseline before quiet-frame`, and ask Taufik to create/push the GitHub remote. (The local folder `arya-samodra-raw` was not a git repo on 2026-09-27; README references `~/arya-samodra`. Confirm which one is canonical before pushing.) Then `git checkout -b feat/quiet-frame`.
- [ ] **Step 2: Install test deps.** `npm i -D vitest@3.2.7 jsdom@25 @testing-library/react@16 @testing-library/jest-dom@6 @testing-library/user-event@14 sharp@0.34.5`. Add scripts `"test": "vitest run"` and `"test:watch": "vitest"`.
- [ ] **Step 3: Create `vitest.config.js`** with `plugins: [react()]`, `test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.js'], include: ['src/**/*.test.{js,jsx}', 'scripts/**/*.test.js'] }`.
- [ ] **Step 4: Create `src/test/setup.js`** with exactly these stubs, then `fsHelpers.js`:

```js
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
afterEach(() => cleanup());
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
}
if (!window.matchMedia) {
  window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
}
```

- [ ] **Step 5: Write the smoke test** `src/__tests__/smoke.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import Services from '../components/Services.jsx';
test('services renders five service headings', () => {
  render(<Services />);
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5);
});
```

- [ ] **Step 6: Run** `npm test`. Expected: `1 passed`. Run `npm run build` and record the baseline in the commit message (measured 2026-09-27: JS 827 KB / 266 KB gzip).
- [ ] **Step 7: Commit** `chore: add vitest harness and lockfile`.

---

### Task 1: Image pipeline (sharp → AVIF/WebP ladder + manifest)

**Files:**
- Create: `scripts/build-images.mjs`, `scripts/__tests__/build-images.test.js`, `assets-src/images/**` (copied sources), generated `public/media/img/**`, generated `src/media/manifest.json`
- Modify: `package.json` (script `"images": "node scripts/build-images.mjs"`)

**Interfaces:**
- Produces (from `scripts/build-images.mjs`):
  - `export const LADDERS = { default: [480, 960, 1600, 2400], clients: [120, 240] }`
  - `export function widthsFor(srcWidth: number, ladder: number[]): number[]`: ladder steps `<= srcWidth * 0.9`, plus `Math.min(srcWidth, ladder.at(-1))`, deduped, ascending.
  - `export function ladderFor(key: string): number[]`: `LADDERS.clients` for keys starting `clients/`, else `LADDERS.default`.
  - `export async function buildImages({ srcDir, outDir, manifestPath }): Promise<Manifest>`
  - Manifest shape: `{ [key: string]: { w: number, h: number, widths: number[], lqip: string } }`. `key` is the path under `srcDir` without extension (`p47-1`, `clients/client-01`); `w`/`h` are the source pixel size.
  - Output files: `${outDir}/${key}-${width}.avif` and `.webp`. AVIF `quality: 50, effort: 4`; WebP `quality: 72`; LQIP = 24 px wide WebP `quality: 40` as `data:image/webp;base64,…`.
  - Incremental: skip encoding a file whose output exists and is newer than the source.
  - CLI (when run directly): `srcDir = assets-src/images`, `outDir = public/media/img`, `manifestPath = src/media/manifest.json`; prints one line per key.

- [ ] **Step 1: Write the failing tests** `scripts/__tests__/build-images.test.js` (first line `// @vitest-environment node`):

```js
import { widthsFor, ladderFor, LADDERS, buildImages } from '../build-images.mjs';
test('widthsFor caps the ladder at the source width', () => {
  expect(widthsFor(1000, LADDERS.default)).toEqual([480, 1000]);
  expect(widthsFor(636, LADDERS.default)).toEqual([480, 636]);
  expect(widthsFor(4000, LADDERS.default)).toEqual([480, 960, 1600, 2400]);
  expect(widthsFor(400, LADDERS.default)).toEqual([400]);
  expect(widthsFor(360, LADDERS.clients)).toEqual([120, 240]);
});
test('ladderFor routes client logos to the small ladder', () => {
  expect(ladderFor('clients/client-01')).toBe(LADDERS.clients);
  expect(ladderFor('p47-1')).toBe(LADDERS.default);
});
test('buildImages writes both formats per width and a manifest entry', async () => {
  // fixture: sharp-generated 1200x800 PNG at <tmp>/src/sample.png
  const manifest = await buildImages({ srcDir, outDir, manifestPath });
  expect(manifest.sample).toMatchObject({ w: 1200, h: 800, widths: [480, 960, 1200] });
  expect(manifest.sample.lqip.startsWith('data:image/webp;base64,')).toBe(true);
  for (const w of [480, 960, 1200]) for (const f of ['avif', 'webp'])
    expect(fs.existsSync(path.join(outDir, `sample-${w}.${f}`))).toBe(true);
  expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8'))).toEqual(manifest);
});
```

Build the fixture with `sharp({ create: { width: 1200, height: 800, channels: 3, background: '#9C5338' } }).png().toFile(...)` inside `fs.mkdtempSync(path.join(os.tmpdir(), 'img-'))`.

- [ ] **Step 2: Run** `npx vitest run scripts`. Expected: FAIL (`build-images.mjs` not found).
- [ ] **Step 3: Implement `scripts/build-images.mjs`** per the Interfaces block. Walk `srcDir` recursively for `.png .jpg .jpeg .webp .tif .tiff`.
- [ ] **Step 4: Run** `npx vitest run scripts`. Expected: 3 passed.
- [ ] **Step 5: Copy (not move) the sources** so the running site keeps working until Task 2: `mkdir -p assets-src/images/clients && cp public/assets/*.png assets-src/images/ && cp public/assets/clients/*.png assets-src/images/clients/`. Run `npm run images`. Expected: 34 manifest keys; `find public/media/img -size +300k` prints nothing.
- [ ] **Step 6: Commit** `feat(media): sharp image pipeline with avif/webp ladders and manifest` (include generated outputs).

---

### Task 2: `<Picture>`, media helpers, data model, migrate every `<img>`

**Files:**
- Create: `src/lib/media.js`, `src/components/ui/Picture.jsx`, `src/__tests__/media.test.js`, `src/__tests__/Picture.test.jsx`, `src/__tests__/no-legacy-assets.test.js`
- Modify: `src/data.js`, `src/index.css` (aperture CSS), `src/components/{Studio,Works,ProjectFocus,Team,Contact}.jsx`
- Delete: `public/assets/*.png`, `public/assets/clients/`

**Interfaces:**
- Consumes: `src/media/manifest.json` (Task 1).
- Produces:
  - `src/lib/media.js`: `MEDIA_BASE = '/media/img'`; `getImage(key: string) → {w,h,widths,lqip} | null`; `srcSet(key: string, format: 'avif'|'webp') → string` (e.g. `"/media/img/p47-1-480.avif 480w, /media/img/p47-1-636.avif 636w"`); `fallbackSrc(key) → string` (largest WebP).
  - `Picture({ name, alt, sizes = '100vw', eager = false, reveal = true, fit = 'cover', ratio, className = '', imgClassName = '' })`: a wrapper `div.aperture` with `data-state="closed"|"open"`, LQIP as `background-image`, optional `style.aspectRatio = ratio`, containing `<picture>` (AVIF source, WebP source, `<img>` with `width`/`height` from the manifest, `loading` lazy unless `eager`, `decoding="async"`, lowercase `fetchpriority="high"` when `eager`, `object-cover|object-contain` by `fit`).
    - Opens when (`reveal === false`) OR (`img.decode()` resolved AND ≥ 15 % in view via IntersectionObserver). With no `IntersectionObserver` global, treat as in view.
    - Unknown `name`: render `<div role="img" aria-label={alt} className="bg-concrete …">` and `console.warn` once per key.
  - `src/data.js` shape:
    - `works[i] = { no, id, name, place, type, cover, gallery: [] }`, with `cover` a manifest key. Ids in current order: `monograph-coffee, smesta-coffee-dining, nooma-resto-jemursari, forenoon-coffee-araya, handall-coffee, bebek-goreng-h-slamet, cluster-buduran-masterplan, arya-samodra-hq, petrokimia-review, six-nine-coffee-retail, araya-resto-kostel, joglo-modern-villa`.
    - `export const workIds = works.map(w => w.id)`
    - `export function getWork(id) → work | undefined`
    - `team[0].photo = 'p7-1'`
    - `clients = [{ key: 'clients/client-01', name: '' }, …20]`
    - `studioFigures = [{ key: 'p8-1', alt: 'HQ Office Arya Samodra Architects, Surabaya', caption: 'HQ OFFICE · SURABAYA' }, { key: 'p7-2', alt: 'Studio at work', caption: 'STUDIO · 07 MEMBERS' }]`

- [ ] **Step 1: Write failing tests.** `media.test.js`:

```js
import { getImage, srcSet, fallbackSrc } from '../lib/media.js';
test('srcSet lists every ladder width for a format', () => {
  const { widths } = getImage('p47-1');
  expect(srcSet('p47-1', 'avif')).toBe(widths.map(w => `/media/img/p47-1-${w}.avif ${w}w`).join(', '));
});
test('fallbackSrc is the widest webp', () => {
  const { widths } = getImage('p18-1');
  expect(fallbackSrc('p18-1')).toBe(`/media/img/p18-1-${Math.max(...widths)}.webp`);
});
test('getImage returns null for unknown keys', () => expect(getImage('nope')).toBeNull());
```

`Picture.test.jsx`:

```jsx
test('renders avif+webp sources, intrinsic size and lazy loading', () => {
  const { container } = render(<Picture name="p47-1" alt="Monograph Coffee" sizes="33vw" />);
  expect(container.querySelector('source[type="image/avif"]').getAttribute('srcset')).toContain('p47-1-480.avif 480w');
  const img = screen.getByAltText('Monograph Coffee');
  expect(img).toHaveAttribute('loading', 'lazy');
  expect(img).toHaveAttribute('width', String(getImage('p47-1').w));
});
test('eager pictures load eagerly with high priority', () => {
  render(<Picture name="p47-1" alt="x" eager />);
  expect(screen.getByAltText('x')).toHaveAttribute('fetchpriority', 'high');
});
test('reveal={false} is open immediately', () => {
  const { container } = render(<Picture name="p47-1" alt="x" reveal={false} />);
  expect(container.querySelector('.aperture')).toHaveAttribute('data-state', 'open');
});
test('unknown key renders a labelled placeholder instead of crashing', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(<Picture name="not-built-yet" alt="New project" />);
  expect(screen.getByRole('img', { name: 'New project' })).toBeInTheDocument();
  expect(warn).toHaveBeenCalledTimes(1);
});
```

`no-legacy-assets.test.js` (node env): for every file from `glob('src', ['.js', '.jsx'])`, expect `read(file)` not to contain `'/assets/'`.
- [ ] **Step 2: Run** `npm test`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement** `media.js`, `Picture.jsx`, and the aperture CSS in `src/index.css` `@layer components`:
  - `.aperture img`: `clip-path: inset(48% 0 48% 0); transform: scale(1.04); opacity: 0;` with transition on those three properties, 900 ms, `cubic-bezier(0.16,1,0.3,1)`.
  - `.aperture[data-state=open] img`: `clip-path: inset(0); transform: none; opacity: 1`.
  - `@media (prefers-reduced-motion: reduce)`: `.aperture img { clip-path: none; transform: none; opacity: 1; transition: none }`.
- [ ] **Step 4: Update `data.js`** to the shape above; drop the `img` fields.
- [ ] **Step 5: Replace every `<img src="/assets/…">`**. Layout changes wait for later tasks.
  - Studio: use `studioFigures`.
  - Works: aside preview becomes `<Picture name={(active || works[0]).cover} reveal={false} …>`; delete the GSAP tween and `imgRef`.
  - ProjectFocus: `p31-1` main; point the two tiles at `<Picture>` (Task 10 replaces them).
  - Team: `photo` key.
  - Contact: `clients[i].key`, `sizes="120px"`.
- [ ] **Step 6: Delete** `public/assets/*.png` and `public/assets/clients/`. Run `npm test` (all pass) and `npm run build`. `npm run dev`: every image appears.
- [ ] **Step 7: Commit** `feat(media): Picture component with aperture reveal; migrate all images`.

---

### Task 3: MP4 hero video (drop HLS)

**Files:**
- Create: `src/lib/video.js`, `src/lib/motion.js`, `src/components/HeroVideo.jsx`, `src/__tests__/video.test.js`, `src/__tests__/HeroVideo.test.jsx`, `public/media/hero/{hero-1080.mp4,hero-720.mp4,poster.webp}`, `assets-src/video/hero-source.mp4`
- Modify: `src/data.js`, `src/components/Hero.jsx`, `package.json`
- Delete: `src/components/HlsVideo.jsx`, `public/assets/hls/`

**Interfaces:**
- Produces:
  - `pickRendition({ width, dpr = 1, saveData = false }) → '720' | '1080'`: `'720'` if `saveData` or `width * dpr <= 1400`, else `'1080'`.
  - `usePrefersReducedMotion() → boolean`: subscribes to `(prefers-reduced-motion: reduce)` changes.
  - `data.js`: `export const hero = { poster: '/media/hero/poster.webp', sources: { 720: '/media/hero/hero-720.mp4', 1080: '/media/hero/hero-1080.mp4' }, caption: null }` (replaces `HERO_VIDEO`).
  - `HeroVideo({ className })`
    - Reduced motion: `<img src={hero.poster} alt="" className={className}>` and no `<video>`.
    - Otherwise: `<video muted loop playsInline autoPlay preload="auto" poster={hero.poster} src={hero.sources[pickRendition(...)]}>`, reading `window.innerWidth`, `window.devicePixelRatio`, `navigator.connection?.saveData`.
    - Pauses while < 10 % in view (IntersectionObserver) and resumes when visible; skips this entirely when `IntersectionObserver` is undefined.

- [ ] **Step 1: Encode the assets** (needs ffmpeg: `which ffmpeg || sudo apt-get install -y ffmpeg`; if install is impossible, stop and ask Taufik to run these commands locally and push):

```bash
mkdir -p assets-src/video public/media/hero
ffmpeg -allowed_extensions ALL -i public/assets/hls/playlist.m3u8 -c copy assets-src/video/hero-source.mp4
for h in 1080 720; do ffmpeg -y -i assets-src/video/hero-source.mp4 -an -vf "scale=-2:$h" -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p -movflags +faststart public/media/hero/hero-$h.mp4; done
ffmpeg -y -ss 1 -i assets-src/video/hero-source.mp4 -frames:v 1 -vf scale=1920:-2 /tmp/poster.png && node -e "require('sharp')('/tmp/poster.png').webp({quality:70}).toFile('public/media/hero/poster.webp')"
```

Expected sizes (measured 2026-09-27): 1080p ≈ 2.4 MB, 720p ≈ 1.2 MB, poster ≈ 41 KB.
- [ ] **Step 2: Write failing tests.** `video.test.js`:

```js
test.each([
  [{ width: 1440, dpr: 2 }, '1080'], [{ width: 390, dpr: 3 }, '720'], [{ width: 1366, dpr: 1 }, '720'],
  [{ width: 1600, dpr: 1 }, '1080'], [{ width: 1920, dpr: 1, saveData: true }, '720'],
])('pickRendition(%o) → %s', (input, out) => expect(pickRendition(input)).toBe(out));
```

`HeroVideo.test.jsx`:

```jsx
test('reduced motion shows the poster and no video', () => {
  window.matchMedia = (q) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} });
  const { container } = render(<HeroVideo />);
  expect(container.querySelector('video')).toBeNull();
  expect(container.querySelector('img')).toHaveAttribute('src', '/media/hero/poster.webp');
});
test('narrow viewport gets the 720p rendition', () => {
  window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
  window.innerWidth = 390;
  const { container } = render(<HeroVideo />);
  expect(container.querySelector('video').getAttribute('src')).toBe('/media/hero/hero-720.mp4');
});
```

- [ ] **Step 3: Run** `npm test`. Expected: the new tests FAIL.
- [ ] **Step 4: Implement** `video.js`, `motion.js`, `HeroVideo.jsx`. In `Hero.jsx`, swap in `HeroVideo` and delete the grain layer (`grain` const + its div).
- [ ] **Step 5: Remove HLS:** `npm uninstall hls.js`, delete `HlsVideo.jsx` and `public/assets/hls/`, delete `HERO_VIDEO`.
- [ ] **Step 6: Run** `npm test` (pass) and `npm run build`. Expected: the JS chunk falls to roughly 70–80 KB gzip (GSAP still present). In `npm run dev` the video loops without a visible cut.
- [ ] **Step 7: Commit** `perf(hero): replace 4K HLS with 720p/1080p MP4 renditions; drop hls.js`.

---

### Task 4: Design tokens, fonts, global CSS, token guard

**Files:**
- Create: `src/__tests__/tokens.test.js`
- Modify: `tailwind.config.js`, `src/index.css`, `src/main.jsx`, `index.html`, `package.json`, all of `src/components/*.jsx` (class names only)

**Interfaces:**
- Consumes: `glob`, `read` (Task 0).
- Produces Tailwind names that later tasks use:
  - Colours: `ink paper concrete stone bone fog terracotta terracotta-light`
  - `font-sans` / `font-display` = `"Archivo Variable"`; `font-mono` = `"JetBrains Mono"`
  - `text-meta` = `['11px', { lineHeight: '1.5', letterSpacing: '0.14em' }]`
  - `ease-studio` = `cubic-bezier(0.16,1,0.3,1)`; `ease-lift` = `cubic-bezier(0.22,1,0.36,1)`
  - Utilities `.stretch-100 .stretch-112 .stretch-125` (set `font-stretch`)
  - `.eyebrow` = `font-mono text-meta uppercase text-stone`; `.eyebrow-dark` = `text-fog`
  - Global `:focus-visible { outline: 2px solid #9C5338; outline-offset: 3px }`

- [ ] **Step 1: Write the failing guard** `tokens.test.js` (node env):

```js
import config from '../../tailwind.config.js';
import { glob, read } from '../test/fsHelpers.js';
test('palette is exactly the spec tokens', () => {
  expect(config.theme.extend.colors).toEqual({
    ink: '#231F20', paper: '#FFFFFF', concrete: '#EEEDEA', stone: '#6B6766', bone: '#E9E6E1', fog: '#A29D9B',
    terracotta: { DEFAULT: '#9C5338', light: '#C97B5C' },
  });
});
test('components use no legacy tokens, sub-11px text or opacity text colours', () => {
  const banned = /\bnavy\b|blush|terracotta-tint|\bmist\b|ink-2|text-\[(9|10)px\]|text-(ink|white)\/\d+|Fraunces/;
  for (const file of glob('src/components', ['.jsx'])) expect(read(file)).not.toMatch(banned);
});
test('no Google Fonts request', () => expect(read('index.html')).not.toMatch(/fonts\.googleapis/));
```

- [ ] **Step 2: Run** `npx vitest run src/__tests__/tokens.test.js`. Expected: FAIL on all three.
- [ ] **Step 3: Fonts.** `npm i @fontsource-variable/archivo@^5 @fontsource/jetbrains-mono@^5`. In `main.jsx` import `@fontsource-variable/archivo/wdth.css` and `@fontsource/jetbrains-mono/400.css`. Remove the Google Fonts `<link>` and both preconnect tags from `index.html`.
- [ ] **Step 4: Tokens + CSS** per the Interfaces block. Body base becomes `bg-paper text-ink font-sans`.
- [ ] **Step 5: Mechanical migration across components:**
  - `bg-navy` → `bg-ink`
  - `text-terracotta-blush` → remove (Task 6 restyles the hero `<em>`)
  - `bg-ink-2` → `bg-ink`
  - `text-[9px]`, `text-[10px]` → `text-meta`
  - `text-ink/45|50|70` → `text-stone`
  - `text-white/50|55|65|70|80|85` → `text-fog`
  - `text-white` on ink → `text-bone`
  - `.eyebrow` on dark sections gets `eyebrow-dark`
- [ ] **Step 6: Run** `npm test` (all pass) and `npm run dev`. Check visually that no text is invisible and no layout broke.
- [ ] **Step 7: Commit** `style: quiet-frame tokens, self-hosted Archivo width axis, token guard test`.

---

### Task 5: Header: wordmark, mobile menu, throttled tone probe

**Files:**
- Create: `src/lib/tone.js`, `src/__tests__/Header.test.jsx`, `src/__tests__/tone.test.js`
- Modify: `src/components/Header.jsx`

**Interfaces:**
- Consumes: tokens (Task 4).
- Produces: `toneAt(sections: {top:number,bottom:number,tone:'dark'|'light'}[], y = 30) → 'dark'|'light'` (defaults to `'dark'` when no section spans `y`). `Header({ scrollerRef })` signature unchanged.

- [ ] **Step 1: Write failing tests.**

```js
test('toneAt picks the section spanning y', () => {
  expect(toneAt([{ top: -900, bottom: 10, tone: 'dark' }, { top: 10, bottom: 910, tone: 'light' }])).toBe('light');
  expect(toneAt([])).toBe('dark');
});
```

```jsx
test('menu button toggles the mobile sheet and Esc closes it', async () => {
  const user = userEvent.setup();
  render(<Header scrollerRef={{ current: document.createElement('div') }} />);
  const btn = screen.getByRole('button', { name: 'Menu' });
  expect(btn).toHaveAttribute('aria-expanded', 'false');
  await user.click(btn);
  expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
  await user.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
});
test('choosing a link closes the sheet', async () => {
  const user = userEvent.setup();
  render(<Header scrollerRef={{ current: document.createElement('div') }} />);
  await user.click(screen.getByRole('button', { name: 'Menu' }));
  await user.click(within(screen.getByRole('navigation', { name: 'Mobile' })).getByRole('link', { name: 'Works' }));
  expect(screen.queryByRole('navigation', { name: 'Mobile' })).toBeNull();
});
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Wordmark `ARYA SAMODRA` (`stretch-125 text-[13px] tracking-[0.28em] uppercase`) + `ARCHITECTS` (`font-mono text-meta`).
  - Menu button: `md:hidden`, `h-11 w-11`, label "Menu"/"Close", `aria-controls="mobile-nav"`.
  - Sheet (rendered only when open): `<nav id="mobile-nav" aria-label="Mobile">`, `fixed inset-0 bg-ink text-bone`, links at `stretch-112 text-4xl font-light`.
  - Tone probe: one `requestAnimationFrame` per scroll burst, computing via `toneAt`.
- [ ] **Step 4: Run** `npm test`. Expected: pass.
- [ ] **Step 5: Commit** `feat(header): spaced wordmark, mobile menu, rAF tone probe`.

---

### Task 6: Hero restyle

**Files:**
- Modify: `src/components/Hero.jsx`, `src/index.css` (`rise` keyframes), `src/data.js` (`heroCopy`)
- Test: `src/__tests__/Hero.test.jsx`

**Interfaces:**
- Consumes: `hero` (Task 3), `HeroVideo`.
- Produces: `data.js` `heroCopy = { lead: 'Architecture measured in', emphasis: 'standing light', eyebrow: 'Est. 2018 · Surabaya, East Java', body: <current Hero paragraph verbatim>, cta: 'View selected works' }`.

- [ ] **Step 1: Write failing tests.**

```jsx
test('headline reads as one sentence with the width-emphasised phrase', () => {
  const { container } = render(<Hero />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Architecture measured in standing light.');
  const em = container.querySelector('h1 em');
  expect(em).toHaveClass('stretch-125');
  expect(em).toHaveTextContent('standing light');
});
test('primary CTA goes to works', () => {
  render(<Hero />);
  expect(screen.getByRole('link', { name: /View selected works/ })).toHaveAttribute('href', '#works');
});
test('project caption only renders when hero.caption is set', () => {
  render(<Hero />);
  expect(screen.queryByTestId('hero-caption')).toBeNull();
});
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** per spec §4 Hero:
  - Overlay gradient exactly as in the spec.
  - `h1`: `font-display font-light stretch-100 text-bone leading-[0.98] tracking-[-0.025em] text-[clamp(40px,min(7.2vw,9.5vh),116px)]`.
  - Each word is a `<span class="rise" style="--i:n">` with a real space between spans. Keyframes: translateY(.4em)→0 plus opacity, 800 ms `ease-studio`, `animation-delay: calc(var(--i) * 80ms + 200ms)`, `animation-fill-mode: both`; none under reduced motion.
  - `<em className="not-italic stretch-125">`.
  - Remove the "In focus · Araya ▶" link (its job moves to ProjectFocus).
  - Coordinate bar in `font-mono text-meta text-fog`.
  - Caption `<p data-testid="hero-caption">` only when `hero.caption`.
- [ ] **Step 4: Run** `npm test`. Expected: pass.
- [ ] **Step 5: Commit** `feat(hero): quiet overlay, width-emphasis headline, word rise`.

---

### Task 7: Light sections: Studio, Services, Team roster

**Files:**
- Modify: `src/components/Studio.jsx`, `src/components/Services.jsx`, `src/components/Team.jsx`
- Test: `src/__tests__/Team.test.jsx`

**Interfaces:**
- Consumes: `Picture`, `studioFigures`, `team` (Task 2).

- [ ] **Step 1: Write failing tests.**

```jsx
test('members with photos render as portraits, the rest as a roster', () => {
  render(<Team />);
  expect(screen.getByAltText('Ar. Arya Samodra, IAI')).toBeInTheDocument();
  expect(within(screen.getByRole('list', { name: 'Team' })).getAllByRole('listitem')).toHaveLength(6);
  expect(screen.queryByText(/PORTRAIT 3:4/)).toBeNull();
});
test('team section is light toned', () => {
  const { container } = render(<Team />);
  expect(container.querySelector('section')).toHaveAttribute('data-tone', 'light');
});
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** per spec §4.
  - Studio (paper): h2 `stretch-112 font-[350]`.
  - Services: `bg-concrete`, h3 `text-[22px] font-[450]`.
  - Team (`bg-paper`, `data-tone="light"`): photo members as portrait cards (`<Picture ratio="3 / 4">`), the rest in `<ul aria-label="Team">` name/role rows with `border-b border-ink/10`.
- [ ] **Step 4: Run** `npm test`. Expected: pass.
- [ ] **Step 5: Commit** `feat(sections): studio/services type pass, team text roster`.

---

### Task 8: Works image grid (drop GSAP)

**Files:**
- Modify: `src/components/Works.jsx`, `package.json`
- Test: `src/__tests__/Works.test.jsx`

**Interfaces:**
- Consumes: `works`, `Picture`, `read` (Task 0).
- Produces: `Works({ onOpenWork })`, where `onOpenWork(id: string, ids: string[])` receives the clicked id and the ids of the currently visible (filtered) cards in display order.

- [ ] **Step 1: Write failing tests.**

```jsx
test('filter narrows the grid and the counter', async () => {
  const user = userEvent.setup();
  render(<Works onOpenWork={() => {}} />);
  expect(screen.getAllByRole('button', { name: /^Open project:/ })).toHaveLength(12);
  await user.click(screen.getByRole('button', { name: 'F&B' }));
  expect(screen.getAllByRole('button', { name: /^Open project:/ })).toHaveLength(6);
  expect(screen.getByTestId('works-count')).toHaveTextContent('06');
});
test('click and Enter open the project with the filtered list', async () => {
  const user = userEvent.setup(); const onOpenWork = vi.fn();
  render(<Works onOpenWork={onOpenWork} />);
  await user.click(screen.getByRole('button', { name: 'F&B' }));
  await user.click(screen.getByRole('button', { name: 'Open project: Monograph Coffee' }));
  expect(onOpenWork).toHaveBeenCalledWith('monograph-coffee', works.filter(w => w.type === 'F&B').map(w => w.id));
  screen.getByRole('button', { name: 'Open project: Handall Coffee' }).focus();
  await user.keyboard('{Enter}');
  expect(onOpenWork).toHaveBeenLastCalledWith('handall-coffee', expect.any(Array));
});
test('no hover-dependent handlers remain', () => {
  expect(read('src/components/Works.jsx')).not.toMatch(/onMouseEnter|gsap/);
});
test('works sits on paper and flips the header to dark ink', () => {
  const { container } = render(<Works onOpenWork={() => {}} />);
  expect(container.querySelector('section')).toHaveAttribute('data-tone', 'light');
  expect(container.querySelector('section')).toHaveClass('bg-paper');
});
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** per spec §4 Works.
  - Section: `bg-paper text-ink`, `data-tone="light"`; eyebrow and meta use `text-stone`, hairlines `border-ink/15`.
  - Chips: `aria-pressed`, label "All work" for ALL; idle `border-ink/20 text-ink`, active `bg-terracotta border-terracotta text-paper`.
  - Count: `<span data-testid="works-count">`.
  - Grid: `grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3` inside the section's internal scroller.
  - Card: `<button aria-label={`Open project: ${w.name}`} className="group text-left">`, `<Picture name={w.cover} alt={w.name} ratio="3 / 2" sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw">`, meta as a single text node `` `${w.no} · ${w.type} · ${w.place}` ``, then the name.
  - Lift on `group-hover`/`group-focus-visible`.
  - Delete the aside preview.
  - `npm uninstall gsap`.
- [ ] **Step 4: Run** `npm test` and `npm run build`. Expected: pass; JS ≈ 55–65 KB gzip (React alone measures 45.6 KB).
- [ ] **Step 5: Commit** `feat(works): image-first grid, tap/keyboard open, remove gsap`.

---

### Task 9: Project Viewer + App state + `?work=` deep link

**Files:**
- Create: `src/components/ProjectViewer.jsx`, `src/lib/workParam.js`, `src/__tests__/ProjectViewer.test.jsx`, `src/__tests__/App.test.jsx`, `src/__tests__/workParam.test.js`
- Modify: `src/App.jsx`, `src/index.css` (dialog fade)

**Interfaces:**
- Consumes: `Works({ onOpenWork })` (Task 8), `getWork`, `workIds` (Task 2), `Picture`.
- Produces:
  - `readWorkParam(search: string) → string | null`
  - `writeWorkParam(id: string | null) → void`: `history.replaceState` to `pathname + (id ? '?work=' + id : '') + hash`.
  - `ProjectViewer({ openId: string | null, ids: string[], onChange(id), onClose() })`:
    - Returns `null` when `openId` is null. Otherwise renders `<dialog aria-labelledby>` and `showModal()`s it in an effect.
    - Contents: h2 name; meta `type · place`; counter `NN / NN` (1-based index within `ids`, zero-padded); buttons "Previous project", "Next project", "Close"; ←/→ keydown on the dialog wraps within `ids`.
    - Escape keydown and the dialog `cancel` event both call `onClose` after `preventDefault()`. A backdrop click (event target === dialog) closes.
    - On unmount/close, focus returns to the element that was focused when it opened.
    - Thumbnails render only when `1 + gallery.length > 1`.
  - `App` holds `viewer: { id, ids } | null`.
    - `openWork(id, ids = workIds)` ignores unknown ids.
    - On mount, `readWorkParam(location.search)` opens a valid id or clears an invalid one.
    - `ProjectViewer` renders **outside** the scroller div (fragment sibling); `Works` and (Task 10) `ProjectFocus` receive `onOpenWork={openWork}`.

- [ ] **Step 1: Write failing tests.**

```js
test('readWorkParam', () => {
  expect(readWorkParam('?work=monograph-coffee')).toBe('monograph-coffee');
  expect(readWorkParam('')).toBeNull();
});
```

```jsx
const ids = ['monograph-coffee', 'smesta-coffee-dining', 'nooma-resto-jemursari'];
test('shows the project and a position counter', () => {
  render(<ProjectViewer openId="smesta-coffee-dining" ids={ids} onChange={vi.fn()} onClose={vi.fn()} />);
  expect(screen.getByRole('heading', { level: 2, name: 'Smesta Coffee & Dining' })).toBeInTheDocument();
  expect(screen.getByText('02 / 03')).toBeInTheDocument();
});
test('arrow keys wrap inside the given list', () => {
  const onChange = vi.fn();
  render(<ProjectViewer openId="nooma-resto-jemursari" ids={ids} onChange={onChange} onClose={vi.fn()} />);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
  expect(onChange).toHaveBeenLastCalledWith('monograph-coffee');
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' });
  expect(onChange).toHaveBeenLastCalledWith('smesta-coffee-dining');
});
test('Escape and the Close button both close', async () => {
  const onClose = vi.fn();
  render(<ProjectViewer openId="monograph-coffee" ids={ids} onChange={vi.fn()} onClose={onClose} />);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalledTimes(2);
});
```

`App.test.jsx`:

```jsx
test('a valid ?work= opens the viewer on load', () => {
  history.replaceState(null, '', '/?work=joglo-modern-villa');
  render(<App />);
  expect(screen.getByRole('heading', { level: 2, name: 'Joglo Modern Villa Resort' })).toBeInTheDocument();
});
test('an unknown ?work= is ignored and removed', () => {
  history.replaceState(null, '', '/?work=old-name#works');
  render(<App />);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(location.search).toBe('');
  expect(location.hash).toBe('#works');
});
test('opening from the grid then closing restores focus to the card', async () => {
  history.replaceState(null, '', '/');
  const user = userEvent.setup(); render(<App />);
  const card = screen.getByRole('button', { name: 'Open project: Handall Coffee' });
  await user.click(card);
  expect(location.search).toBe('?work=handall-coffee');
  await user.click(screen.getByRole('button', { name: 'Close' }));
  expect(card).toHaveFocus();
  expect(location.search).toBe('');
});
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** per the Interfaces block and spec §4 Project Viewer:
  - Dialog: `bg-ink text-bone`, full viewport, `::backdrop { background: rgb(35 31 32 / .85) }`.
  - Image: `<Picture fit="contain" sizes="100vw" reveal={false}>`.
  - Fade: 240 ms in (`@starting-style` + transition on `opacity`); 180 ms out.
- [ ] **Step 4: Run** `npm test`. Expected: pass.
- [ ] **Step 5: Commit** `feat(viewer): project viewer dialog with keyboard nav and shareable ?work= links`.

---

### Task 10: ProjectFocus: ink surface, honest attribution, opens viewer

**Files:**
- Modify: `src/components/ProjectFocus.jsx`, `src/App.jsx` (pass `onOpenWork`), `src/data.js` (`focus = { id: 'araya-resto-kostel', note: 'Timber screen · courtyard' }`)
- Test: `src/__tests__/ProjectFocus.test.jsx`

**Interfaces:**
- Consumes: `getWork`, `workIds`, `focus`, `Picture`, `openWork` from App.
- Produces: `ProjectFocus({ onOpenWork })`.

- [ ] **Step 1: Write failing tests.**

```jsx
test('opens Araya in the viewer', async () => {
  const onOpenWork = vi.fn(); render(<ProjectFocus onOpenWork={onOpenWork} />);
  expect(screen.getByRole('heading', { level: 2, name: 'Araya Resto & Kostel' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'View project' }));
  expect(onOpenWork).toHaveBeenCalledWith('araya-resto-kostel', workIds);
});
test('only shows photos from the focused project', () => {
  const { container } = render(<ProjectFocus onOpenWork={() => {}} />);
  expect(container.innerHTML).not.toMatch(/p47-2|p26-1/);
  expect(container.querySelectorAll('[data-testid="focus-tile"]')).toHaveLength(getWork('araya-resto-kostel').gallery.slice(0, 2).length);
});
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** per spec §4 ProjectFocus:
  - `bg-ink`, `data-tone="dark"`, `md:grid-cols-[3fr_2fr]`.
  - Main `<Picture name={work.cover} alt={work.name}>` fills the left.
  - Right panel: `eyebrow eyebrow-dark` "IN FOCUS · 11", h2 `stretch-112 font-light text-bone`, meta, `focus.note`, outline button "View project".
  - Tiles: `work.gallery.slice(0, 2)`, each wrapper `data-testid="focus-tile"`.
- [ ] **Step 4: Run** `npm test`. Expected: pass.
- [ ] **Step 5: Commit** `fix(focus): stop attributing other projects' photos to Araya; open in viewer`.

---

### Task 11: Contact: ink surface, safe phone link, logo wall

**Files:**
- Create: `src/lib/contact.js`, `src/__tests__/Contact.test.jsx`
- Modify: `src/components/Contact.jsx`, `src/data.js` (`contact = { email: 'studio@aryasamodra.co.id', mobile: '+62 ··· ···· ····', office: 'Surabaya, East Java', instagram: '@aryasamodra.architects' }`)

**Interfaces:**
- Produces: `isDialable(mobile: string) → boolean`: true only when it contains ≥ 8 digits and no `·`.

- [ ] **Step 1: Write failing tests.**

```jsx
test('isDialable', () => {
  expect(isDialable('+62 ··· ···· ····')).toBe(false);
  expect(isDialable('+62 812 3456 7890')).toBe(true);
});
test('masked mobile is plain text, email is a mailto link, logos are grouped', () => {
  render(<Contact />);
  expect(screen.queryByRole('link', { name: /\+62/ })).toBeNull();
  expect(screen.getByRole('link', { name: 'studio@aryasamodra.co.id' })).toHaveAttribute('href', 'mailto:studio@aryasamodra.co.id');
  expect(within(screen.getByRole('group', { name: 'Client logos' })).getAllByRole('img')).toHaveLength(20);
});
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** per spec §4 Contact:
  - `bg-ink text-bone`, `data-tone="dark"`.
  - Instagram links to `https://instagram.com/aryasamodra.architects`.
  - Each logo sits in a wrapper `<div role="img" aria-label={name || `Client logo ${n}`}>` containing `<Picture alt="" reveal={false} sizes="120px" imgClassName="invert grayscale mix-blend-screen opacity-70 hover:opacity-100">`.
- [ ] **Step 4: Run** `npm test`. Expected: pass.
- [ ] **Step 5: Commit** `feat(contact): dark close, dialable-only phone link, labelled logo wall`.

---

### Task 12: Mobile: release snapping below `md`

**Files:**
- Modify: `src/App.jsx`, `src/index.css` (`.snap-section`), section components with internal scroll (`Studio`, `Works`, `Team`, `Contact`)
- Test: `src/__tests__/layout.test.jsx`

**Interfaces:**
- Produces:
  - `.snap-section` = `relative min-h-svh md:h-svh md:min-h-0 md:snap-start md:overflow-hidden`, with `scroll-snap-stop: always` inside `@media (min-width: 768px)`.
  - Scroller = `thin-scroll relative h-svh overflow-y-auto overflow-x-hidden md:snap-y md:snap-mandatory`.

- [ ] **Step 1: Write the failing tests.**

```jsx
const SECTIONS = ['Hero', 'Studio', 'Works', 'ProjectFocus', 'Services', 'Team', 'Contact'];
test('snapping only applies from md up', () => {
  const { container } = render(<App />);
  const scroller = container.firstChild;
  expect(scroller.className).toMatch(/md:snap-mandatory/);
  expect(scroller.className.split(' ')).not.toContain('snap-mandatory');
});
test('sections only scroll internally from md up', () => {
  for (const s of SECTIONS) expect(read(`src/components/${s}.jsx`)).not.toMatch(/(?<!md:)overflow-y-auto/);
});
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the classes above. Prefix internal `overflow-y-auto` / `min-h-0` / `flex-1` scroll regions with `md:`. Section side padding becomes `px-5 md:px-10`.
- [ ] **Step 4: Verify in a browser** at 375×812 and 1440×900 (`npm run dev`).
  - At 375: no horizontal scroll; the menu opens; every section is readable without nested scroll; Works cards are single column; the viewer image fits the screen.
  - At 1440: every section snaps to exactly one viewport.
- [ ] **Step 5: Run** `npm test`, then **commit** `feat(mobile): free scrolling below md, snap sections from md up`.

---

### Task 13: Budget gate, CI, docs, final verification

**Files:**
- Create: `scripts/check-budget.mjs`, `scripts/__tests__/check-budget.test.js`, `.github/workflows/ci.yml`
- Modify: `package.json` (`"budget": "node scripts/check-budget.mjs"`), `CLAUDE.md`, `README.md`

**Interfaces:**
- Produces:
  - `export const BUDGETS = { entryJsGzip: 75_000, allJsGzip: 90_000, cssGzip: 12_000, imgFile: 300_000, hero1080: 3_000_000, hero720: 1_500_000, poster: 80_000 }`
  - `export function checkBudget(distDir: string) → { ok: boolean, failures: string[] }`
    - Entry JS = the `<script type="module" src>` referenced by `dist/index.html`; gzip sizes via `zlib.gzipSync`.
    - Any `.png`, `.ts` or `.m3u8` file anywhere in `dist` is a failure.
  - CLI prints a table and exits 1 when `!ok`.

- [ ] **Step 1: Write failing tests** (node env) against a temp `dist` fixture:
  - Fixture: `index.html` referencing `assets/app.js` (1 KB) plus `media/img/a-480.avif` (10 KB).

```js
test('passes a small dist', () => expect(checkBudget(dir).ok).toBe(true));
test('flags oversized images and legacy formats', () => {
  fs.writeFileSync(path.join(dir, 'media/img/big-2400.avif'), Buffer.alloc(400_000));
  fs.mkdirSync(path.join(dir, 'assets/hls'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'assets/hls/x.ts'), 'x');
  const r = checkBudget(dir);
  expect(r.ok).toBe(false);
  expect(r.failures.join('\n')).toMatch(/big-2400\.avif/);
  expect(r.failures.join('\n')).toMatch(/x\.ts/);
});
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** `check-budget.mjs` per the Interfaces block.
- [ ] **Step 4: Run.** Expected: pass.
- [ ] **Step 5: CI.** `.github/workflows/ci.yml`: on `pull_request` and `push` to `main`; `ubuntu-latest`, Node 20, then `npm ci`, `npm test`, `npm run build`, `npm run budget`.
- [ ] **Step 6: Docs.**
  - CLAUDE.md "Design rules": rewrite to the spec tokens, type and motion.
  - CLAUDE.md media: replace the HLS notes with the MP4 + `npm run images` pipeline (sources live in `assets-src/`; never put photos in `public/` by hand).
  - CLAUDE.md "Known gaps": update to spec §7.
  - README: add `npm test`, `npm run images`, `npm run budget`.
- [ ] **Step 7: Final verification.**
  - `npm test`: all pass.
  - `npm run build && npm run budget`: `ok`; paste the table into the PR description.
  - `npm run preview`, then in Chrome DevTools:
    - Network, "Fast 4G", desktop 1440: first-load transfer excluding the video stream ≤ 400 KB.
    - Rendering → emulate `prefers-reduced-motion: reduce`: poster, no animation.
    - Keyboard-only pass: Menu → Works chip → card → viewer ←/→ → Esc (focus back on card).
    - Lighthouse (mobile) Performance and Accessibility ≥ 90.
- [ ] **Step 8: Commit** `chore: budget gate, CI, docs for quiet-frame`, then open the PR `feat: quiet frame` against `main`.
