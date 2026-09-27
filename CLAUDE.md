# Arya Samodra Architects — company profile site

React 18 + Vite + Tailwind CSS 3. Single-page, full-viewport scroll-snapped sections, HLS video hero.

## Commands
- `npm install` then `npm run dev` (http://localhost:5173)
- `npm run build` → `dist/`

## Structure
- `src/App.jsx` — the scroll container (`snap-y snap-mandatory`, `h-screen overflow-y-auto`). Sections must stay children of it for snapping and the header probe to work.
- `src/components/` — one file per section: Header, Hero, Studio, Works, ProjectFocus, Services, Team, Contact. `HlsVideo.jsx` is the looping muted HLS player.
- `src/data.js` — all content (works, services, team, clients, hero video path). Edit copy here, not in components.
- `public/assets/` — photos pulled from the company-profile PDF, `clients/` logo wall, `hls/` hero stream.

## Design rules
- Palette comes from the company profile PDF, defined in `tailwind.config.js`: `ink #231f20`, `navy #0a1f3f`, `terracotta #9c5338` (+ `light #c97b5c` for accent text on dark surfaces, `blush #f0d3bf`), white.
- Accent text on `ink`/`navy` uses `text-terracotta-light` (≥4.5:1). Plain `terracotta` is for light surfaces, fills and rules.
- Type: Fraunces (display, light + italic emphasis), Archivo (UI/body), JetBrains Mono (eyebrows/meta, uppercase, tracked).
- Every section uses `.snap-section` (exactly one viewport). If content overflows, scroll inside the section (`overflow-y-auto thin-scroll`); don't make the section taller, or snapping breaks.
- Every `<section>` needs `data-tone="dark"|"light"` so the fixed header flips its colour.
- Eyebrows: `.eyebrow` + a leading `.eyebrow-rule`, numbered `01 · LABEL`.

## Known gaps
- Team: only the principal has a portrait; the others show a placeholder frame.
- Contact mobile number is masked; the real number is needed.
- Workflow (profile p.11) was left out because its six step names are outlined graphics in the PDF and couldn't be read.
- Mobile: layout collapses to one column below `md`, but it hasn't been tuned for phones yet.
- Hero HLS is a single 4K rendition. For production, add a 1080p/720p ladder to `playlist.m3u8`.
