# "Quiet Frame": Arya Samodra site refinement (design spec)

**Revision 2 (2026-09-27, after reading the company profile PDF).** Revision 1 guessed at brand and content from the demo. The profile corrects both, so this revision supersedes it: palette, typeface, hero copy, team, project data and photo sources all changed. What revision 1 got right stays: the reference analysis, the performance architecture, the photo-first layout, the viewer and the section flow.

**Brief:** Refine the existing single-page company profile (React 18 + Vite 5 + Tailwind 3) so it presents like the client's references (KKAA, ABODAY, ArMS, WOHA), speaks in the client's own brand (the company profile), and stays light as the asset count grows (87 project photos today). **Keep the section flow**: Header → Hero → Studio → Works → ProjectFocus → Services → Team → Contact, one snapped viewport each on desktop.

Inputs:
- Research: `docs/superpowers/research/2026-09-27-reference-evaluation.md`
- Content (verbatim, source of truth): `docs/superpowers/specs/2026-09-27-profile-content.md`
- Photo map: `assets-src/profile/profile-map.json`
- Source PDF: `assets-src/profile/company-profile.pdf`

Skills applied:
- ui-ux-pro-max: Swiss minimal style, perf/a11y rules
- my-design-taste: exact hex, ≤ 2 families, custom eases, staggered entrances, video hero
- frontend-design: one signature, restraint

---

## 1. Design decisions

| Decision | Why | Deviates from |
| --- | --- | --- |
| **Brand palette from the profile:** navy `#0A1E3F` is the dark, warm grey `#DAD9D7` the project ground, terracotta `#9D5338` the single accent, white the page | The profile's cover, manifesto, services and back cover are navy; project pages are grey; contact is terracotta. Still "neutral UI + one accent" (reference C2), with navy in the role of black | Demo's `ink` near-black; rev 1's "drop navy" (withdrawn) |
| **One family: Space Grotesk Variable** (300–700). Light 300 for display, 400 body, 500 labels. Fraunces, Archivo and JetBrains Mono are all removed | It is the brand face (PDF embeds `SpaceGrotesk-Light`), a sans like every reference (C3), and one 24 KB woff2 | my-design-taste "serif display + sans" (brand wins; the ≤ 2 families rule holds) |
| **Client copy only.** Hero = "IMAGINE / CREATE / ELEVATE" + manifesto; all project, team, studio and contact text from the profile | The demo's headline, founding year, email, Instagram and team roles were invented or wrong | Demo copy |
| **Photos extracted from the PDF at native resolution** (up to 3,840 px), not the demo's 1000 px page renders | 56 of 87 photos are ≥ 1,600 px | Rev 1 "ask client for originals" (now only for 4 projects + 3 portraits) |
| **No motion library;** CSS + IntersectionObserver. hls.js and GSAP removed | Weight is the client's #1 constraint | my-design-taste framer-motion default |
| **MP4 renditions replace 4K HLS** | Measured: 13.7 MB → 2.38 MB (1080p) / 1.15 MB (720p) | CLAUDE.md "HLS hero" |
| **Workflow (profile p.11) as a 6-step strip inside Services** | Brings back client content without adding a section (flow stays approved) | CLAUDE.md "Workflow left out" |
| **Private clients shown as "Private client"** until approved | Six projects name five private individuals as clients | — |

**Signature: "Aperture."** Every photograph arrives through a horizontal slit that opens to full frame, like light through a window. It fires only once the image is decoded and in view, so lazy loading becomes part of the presentation. Supporting brand motif, taken straight from the profile: the header wordmark `ARYA SAMODRA ARCHITECTS®` followed by a full-width hairline. Everything else stays quiet.

## 2. Type (one family: `"Space Grotesk Variable"`, `@fontsource-variable/space-grotesk`)

| Role | Settings | Use |
| --- | --- | --- |
| Display XL | 300, uppercase, `clamp(44px, min(9vw, 12vh), 144px)`, line-height .9, tracking −0.02em | Hero triad |
| Display | 300, `clamp(28px, 3.6vw, 56px)`, line-height 1.05, tracking −0.02em | Section headings, viewer project name |
| Title | 400, 20–24px, tracking −0.01em | Card names, service names, team names |
| Body | 400, 15px / 1.6 | Paragraphs |
| Label | 500, 11px, uppercase, tracking 0.14em | Eyebrows, meta, filters, status, captions |
| Wordmark | 500, 13px, uppercase, tracking 0.08em, `®` superscript | Header |

Minimum rendered text 11px. Eyebrows keep the `NN · LABEL` pattern (CLAUDE.md) with a leading terracotta rule.

## 3. Colour tokens (literal hex, contrast measured)

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| `navy` | `#0A1E3F` | Dark surfaces; **primary text on light** | 16.5:1 on paper, 11.7:1 on concrete |
| `navy-deep` | `#06152C` | Hero/Focus/Viewer ground (profile gradient end) | — |
| `paper` | `#FFFFFF` | Light surface; primary text on dark and on terracotta | 5.63:1 on terracotta |
| `concrete` | `#DAD9D7` | Project ground (Works, team panels) | — |
| `slate` | `#4A5160` | Muted text on light | 7.96:1 paper, 5.65:1 concrete |
| `haze` | `#9AA3B2` | Muted text on navy | 6.5:1 navy, 7.2:1 navy-deep |
| `terracotta` | `#9D5338` | Accent: rules, active filter, status on paper, Contact surface, focus ring | 5.63:1 on paper; **3.99:1 on concrete → only ≥ 24px text there** |
| `terracotta-light` | `#C97B5C` | Accent text on navy | 5.09:1 |
| `blush` | `#F3E3D8` | Muted text on terracotta | 4.5:1 |

Excluded: `ink #231F20`, `#2b2526`, `#f0d3bf`, `#d67456`, `#f1efee`, and opacity-derived text colours (`text-navy/50` etc.). Opacity on borders/backgrounds is fine.

## 4. Sections (flow unchanged)

| # | Section | Surface | data-tone |
| --- | --- | --- | --- |
| — | Hero | video on navy-deep | dark |
| 01 | Studio | paper | light |
| 02 | Works | concrete | light |
| — | ProjectFocus | navy-deep | dark |
| 03 | Services + Workflow | navy | dark |
| 04 | Team | paper | light |
| 05 | Contact | terracotta | dark |

**Header.**
- Wordmark `ARYA SAMODRA ARCHITECTS®`, then a hairline that fills the space to the nav (`flex-1 h-px bg-current opacity-40`), then the links (Studio, Works, Services, Team, Enquire●).
- Below `md`: the hairline is hidden. A 44×44 "Menu" button opens a full-screen navy sheet; the sheet closes on a link click or Esc.
- The ink flips on `data-tone`; the tone probe is rAF-throttled.

**Hero.**
- Poster-first MP4 loop (720p or 1080p picked at runtime).
- Overlay: `linear-gradient(180deg, rgba(6,21,44,.45) 0%, rgba(6,21,44,.05) 40%, rgba(6,21,44,.8) 100%)`.
- h1 = three stacked lines `IMAGINE` / `CREATE` / `ELEVATE` (Display XL, white). The lines rise in sequence: translateY .4em→0 + fade, 800 ms `cubic-bezier(0.16,1,0.3,1)`, 120 ms stagger, 200 ms delay.
- Lead = the manifesto sentence (body, 17px).
- Eyebrow `SINCE 2019 · SURABAYA, EAST JAVA`.
- CTA "View selected works →" (outline, square).
- Optional `hero.caption` (WOHA pattern) shown when set.
- Bottom bar (Label style, `haze`): `7°15′S · 112°45′E` · `12 PROJECTS · 05 SERVICES · 07 MEMBERS` · `IAI · STRA 2.01.0.0004734`.

**Studio (01 · ABOUT US).** Two columns on desktop; scrolls inside the section if needed (`md:overflow-y-auto`).
- Left:
  - Heading "Crafting a Legacy Through Human-Centric Design and Strategic Architecture." in Display, terracotta: allowed, since it is ≥ 24px on paper.
  - The lead, then the story paragraph.
  - Facts list: FOUNDED 2019 · BASE SURABAYA · REGISTRATION IAI · TEAM 07.
  - The studio interior photo (3:2) with caption `HQ OFFICE · SURABAYA`.
- Right, principal card:
  - Portrait `studio/principal` (2:3).
  - "Ar. Arya Samodra, IAI", Principal Architect, the bio.
  - The three-item record list (year right-aligned, hairline rows).
  - The quote, in Title size with a terracotta opening mark.

**Works (02 · SELECTED WORKS).**
- Concrete ground (as the profile's project pages).
- Filter chips "All work" + one per type; active chip is terracotta with white text.
- Grid: 1 col < 640, 2 cols ≥ 640, 3 cols ≥ 1024; scrolls inside the section on desktop.
- Card = `<button>` containing:
  - 3:2 `<Picture>` of the cover
  - Label line `01 · OFFICE · SURABAYA` in `slate`
  - Name (Title, navy)
  - Status tag `[BUILT]` / `[WORK IN PROGRESS]` / `[DESIGN PROPOSAL]` in terracotta Label style. 11px terracotta on concrete is 3.99:1, so the tag sits on a `paper` chip where it reaches 5.63:1.
- Profile order (HQ first). Counter "12 projects".
- Lift on hover/focus: image scale 1.03, 700 ms `cubic-bezier(0.22,1,0.36,1)`.

**Project Viewer (new).** Native `<dialog>` on navy-deep.
- Large image area (`object-contain`, `sizes="100vw"`) with a thumbnail strip of all of the project's images below it. The profile has 6–10 per project.
- Side panel (below the image on mobile), all copy verbatim from the content file:
  - Name (Display), place
  - Status tag
  - Year · Scope · Client ("Private client" where marked)
  - Description
- Counter `03 / 12`; "Previous project"/"Next project" + ←/→ (wrap within the list it was opened from). Thumbnails also respond to ↑/↓ when focused.
- Close with the button, Esc or a backdrop click; focus returns to the opener.
- `?work=<id>` deep link; an unknown id is ignored and removed.
- Fade 240 ms in / 180 ms out.

**ProjectFocus.**
- Navy-deep. Araya Resto & Kostel, the profile's own hero project (p.3 facade).
- Left: full-height cover. Right panel:
  - `IN FOCUS · 04`
  - Name, `[WORK IN PROGRESS]`
  - Scope line
  - Two gallery tiles from Araya's own images
  - "View project" (opens viewer)

**Services (03 · WHAT WE DO) + Workflow.**
- Navy.
- Top: intro sentence (Title, `terracotta-light`).
- Five rows: `01` · name (Title) · scope line (body, `haze`), hairline dividers.
- Bottom: "Workflow" strip with six steps on a dashed terracotta line, numbered circles `1`–`6`, title (Label, white) and detail (body 13px, `haze`).
  - Desktop: one row of 6.
  - Mobile: vertical list.
- The section scrolls internally if it exceeds the viewport (`md:overflow-y-auto`). Accept that on 768px-tall laptops.

**Team (04 · OUR TEAM).**
- Paper.
- 3×2 grid of the six members. Each card:
  - Portrait on a concrete panel (4:5, `object-cover object-top`)
  - Number, name (Title), role (Label, `slate`)
  - The one-line description (body 13px)
- The principal is in Studio (profile numbers him 01; team is 02–07).

**Contact (05 · GET IN TOUCH).**
- Terracotta surface, white text, `blush` for helper lines.
- Heading "Get in touch" (Display) + "Let's talk about your project & collaborate with us."
- Channels grid, each with its helper line from the profile:
  - Email (`mailto:`)
  - Phone (`tel:`)
  - Mobile (`tel:`)
  - Instagram (`https://instagram.com/arya.architects`)
  - Office (full address, links to Google Maps search)
- Client logo wall (20), each wrapper `role="img"`, rendered white via `invert grayscale mix-blend-screen`, opacity .8 → 1 on hover.
- `data-tone="dark"`.

## 5. Motion (all off under `prefers-reduced-motion: reduce`)

| Name | Where | Spec |
| --- | --- | --- |
| Aperture | every `<Picture>` with `reveal` | `clip-path: inset(48% 0 48% 0)`, `scale(1.04)`, opacity 0 → `inset(0)`, `scale(1)`, 1; 900 ms `cubic-bezier(0.16,1,0.3,1)`; trigger = decoded ∧ ≥ 15 % in view |
| Rise | hero triad lines | above |
| Lift | work cards | above |
| Viewer | dialog | 240 ms in / 180 ms out |

Reduced motion: poster instead of video, no aperture/rise/lift.

## 6. Media & performance budgets (enforced by `npm run budget`)

Pipeline: `npm run extract` (PDF → `assets-src/images/**` via `profile-map.json`) → `npm run images` (sharp → AVIF + WebP ladder `[480, 960, 1600, 2400]` capped at source width + LQIP → `public/media/img/**` + `src/media/manifest.json`).

- Extracted sources and the manifest are committed.
- Generated image files are git-ignored and rebuilt in `prebuild` (incremental; CI caches them).

| Asset | Budget | Measured / today |
| --- | --- | --- |
| Entry JS (gzip) | ≤ 75 KB | 266 KB today; React alone 45.6 KB |
| All JS (gzip) | ≤ 90 KB | 266 KB |
| CSS (gzip) | ≤ 12 KB | 4.9 KB |
| Image files ≤ 960 w | ≤ 200 KB each | AVIF 960 of the heaviest photo: 127 KB |
| Image files 1600 w | ≤ 450 KB each | AVIF 1600 of a 2560×1920 render: 301 KB |
| Image files 2400 w | ≤ 900 KB each | WebP 2400 of that render: 779 KB (loaded only in the viewer on large/retina screens) |
| `hero-1080.mp4` / `hero-720.mp4` / `poster.webp` | ≤ 3.0 MB / ≤ 1.5 MB / ≤ 80 KB | 2.38 MB / 1.15 MB / 41 KB |
| Fonts | one woff2 per used subset | Space Grotesk latin 24 KB |
| PNG/HLS in `dist` | 0 | 34 |

Grid cards use `sizes` so browsers fetch 480/960; the 2400 files load only in the viewer.

## 7. Client inputs & sign-offs

1. Review the 9 photo assignments flagged `review: true` in `profile-map.json` (a contact sheet is generated in plan Task 1).
2. Approve naming private individuals as clients (5 people across 6 projects); default "Private client".
3. Higher-resolution originals for **Smesta, Nooma, Forenoon, Handall** (≤ 1,250 px in the PDF) and portraits of **Gerard, Ahsin, Elvira** (≤ 338 px wide).
4. Logo monogram "A" and wordmark as SVG (favicon, header).
5. Which project the hero video shows (`hero.caption`).
6. Team numbering/order (the PDF repeats 06 and 07).
7. Petrokimia filter type (PUBLIC vs INDUSTRIAL).

## 8. Out of scope

Separate project routes, CMS, i18n, analytics, React/Vite/Tailwind major upgrades, rebuilding the illustrated workflow icons (steps are typographic).
