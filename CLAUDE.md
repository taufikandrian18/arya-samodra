# Arya Samodra Architects — company profile site

React 18 + Vite 7 + Tailwind CSS 3 (Node ≥ 20.19). Never run `npm audit fix --force`: it jumps to Vite 8, which @vitejs/plugin-react 4 does not support, and breaks `npm ci`. Single-page, full-viewport scroll-snapped sections (desktop), MP4 video hero, photo-first Works grid with a Project Viewer dialog.

## Commands
- `npm ci` then `npm run dev` (http://localhost:5173). `predev` runs `npm run images` first: ~20 min the first time on a fresh clone, ~1 s after that.
- `npm test` (Vitest + Testing Library, jsdom)
- `npm run build` → `dist/` (runs `prebuild` → `npm run images` first)
- `npm run budget` after a build: fails on JS/CSS/image/video weight over budget or any `.png`/`.ts`/`.m3u8` in `dist`
- `npm run extract`: re-extract photos from the profile PDF (needs `pdfimages`, poppler-utils)
- `npm run images`: encode `assets-src/images/**` → `public/media/img/**` (AVIF + WebP ladders) and `src/media/manifest.json`. Incremental; the first full run takes ~30 min on 4 cores.

## Structure
- `src/App.jsx` — the scroll container (`md:snap-y md:snap-mandatory`, `h-svh overflow-y-auto`) plus the `ProjectViewer` outside it. Holds viewer state, mirrored in `?work=<id>`.
- `src/components/` — one file per section, in this order (tones alternate dark/light; a test enforces it): Hero (dark), Studio (white), Works (navy; numbered list + preview that follows hover/focus; the preview or a row opens the viewer), Services (white; five columns with architectural line drawings that turn terracotta on hover/focus, + Workflow), ProjectFocus (navy-deep), Team (white; cut-out portraits in one bust framing, card turns terracotta on hover/focus), Contact (navy; client logos roll on hover). `Preloader.jsx` is the white 0→100 loading screen. `ProjectViewer.jsx` is the native `<dialog>` pop-up (photo ring + details sheet); `ui/Odometer.jsx` rolls the year; `HeroVideo.jsx` is the poster-first MP4 loop; `ui/Picture.jsx` renders every photo.
- `src/data.js` — all content. Edit copy here, never in components.
- `src/lib/` — `media.js` (manifest lookups), `video.js`, `motion.js`, `tone.js`, `workParam.js`.
- `assets-src/` — sources: `profile/company-profile.pdf`, `profile/profile-map.json`, `images/**` (extracted, committed), `video/hero-source.mp4`.
- `public/media/hero/` — committed hero renditions + poster. `public/media/img/` is generated and git-ignored.

## Content and media
- Copy source of truth: `docs/superpowers/specs/2026-09-27-profile-content.md`. Copy it verbatim into `src/data.js`. Private individuals render as "Private client" until the client approves naming them (a test enforces this).
- Photo source of truth: `assets-src/profile/profile-map.json`. Never put photos in `public/` by hand: add to the map (or `assets-src/images/**`) and run `npm run images`.
- Project galleries are every manifest key under `works/<id>/`; `01` is the cover.
- Team portraits: `assets-src/images/team-cutout/*.png` (transparent, 4:5, same head size) are made from `team/*.png` by `scripts/team-cutouts.py` (rembg BiRefNet cut-out + face-scaled crop; run by hand, see its docstring). Cut-outs get no LQIP.

## Design rules
- Tokens only (`tailwind.config.js`): `navy #0A1E3F`, `navy-deep #06152C`, `paper #FFFFFF`, `concrete #DAD9D7`, `slate #4A5160` (muted on light), `haze #9AA3B2` (muted on navy), `terracotta #9D5338`, `terracotta-light #C97B5C` (accent text on navy), `blush #F3E3D8` (muted on terracotta). No opacity-derived text colours; opacity on borders/backgrounds is fine. Terracotta text on `concrete` only at ≥ 24px.
- One family: Space Grotesk Variable (`@fontsource-variable/space-grotesk`), 300 display, 400 body, 500 labels. Minimum text 11px (`text-label`).
- Every section uses `.snap-section` (one viewport from `md` up, free height below). If content overflows on desktop, scroll inside the section with `md:overflow-y-auto thin-scroll` — never a bare `overflow-y-auto`.
- Every `<section>` needs `data-tone="dark"|"light"` so the fixed header flips its colour.
- Eyebrows: `.eyebrow` (+ `.eyebrow-dark` on navy) with a leading `.eyebrow-rule`, numbered `01 · LABEL`.
- Motion: CSS + IntersectionObserver only (no GSAP/framer). Aperture reveal on photos, Rise on the hero triad, Lift on work cards, Services line drawings that draw in per column, and the project pop-up after the "People & Process" ring on kononenkogroup.com (the site dims and blurs behind; the project's photos swirl up along the lower rim of a very large circle, each tilted with the curve; wheel/↑↓/click turns the ring; closing swirls them back down). A preloader after kononenkogroup.com (white screen, hairline + a large light counter bottom-left following real loading of fonts/poster/hero video, ≥ 2.2 s, ≤ 7 s; at 100 the number slides up, the line retracts right, the screen fades; `html.preloading` holds the hero's entrance until then). Everything is off under `prefers-reduced-motion`, and the hero shows the poster. Eases: `ease-studio` `cubic-bezier(0.16,1,0.3,1)`, `ease-lift` `cubic-bezier(0.22,1,0.36,1)`.
- Code using `IntersectionObserver` or `video.play()` must no-op when the API is missing (jsdom).

## Known gaps (client inputs, spec §7)
1. Photo reassignments made on 2026-09-27 (see `reviewed` fields in `profile-map.json`): two Joglo photos had been filed under Bebek H. Slamet, and the Forenoon ceiling under the Buduran masterplan. Confirm with the client.
2. Approval to name private individuals as clients (5 people across 6 projects).
3. Higher-resolution originals for Smesta, Nooma, Forenoon, Handall (≤ 1,250 px in the PDF) and portraits of Gerard, Ahsin, Elvira (≤ 338 px wide).
4. Logo monogram "A" and wordmark as SVG (favicon, header).
5. Which project the hero video shows (`hero.caption`).
6. Team numbering/order (the PDF repeats 06 and 07).
7. Petrokimia filter type (PUBLIC vs INDUSTRIAL). HQ client name "Handal Natsa Kedathon" is marked [verify].
8. Client logo names (alt text) — `clients[i].name` is empty.
