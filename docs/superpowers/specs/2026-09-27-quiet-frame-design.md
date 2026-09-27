# "Quiet Frame": Arya Samodra site refinement (design spec)

**Brief:** Refine the existing single-page company profile (React 18 + Vite 5 + Tailwind 3) so it presents like the client's references (KKAA, ABODAY, ArMS, WOHA) and stays light as the asset count grows. **Keep the section flow unchanged**: Header → Hero → Studio → Works → ProjectFocus → Services → Team → Contact, one snapped viewport each on desktop. Mood: quiet, photographic, precise. The UI frames the work and stays out of its way.

Research: `docs/superpowers/research/2026-09-27-reference-evaluation.md` (common patterns C1–C8, gaps G1–G8).
Skills applied: ui-ux-pro-max (Minimalism & Swiss Style; perf/a11y rules), my-design-taste (exact hex, two families max, custom eases, staggered entrances, video hero), frontend-design (one signature, remove one accessory).

---

## 1. Design decisions (and where they deviate from defaults)

| Decision | Why | Deviates from |
| --- | --- | --- |
| **Light ground, dark hero.** Most sections sit on white/concrete; hero, ProjectFocus and Contact are ink | References C1/C2. The hero footage itself is a bright white double-height interior, so a heavy dark wash fights it | my-design-taste Mode A (all-dark). The client's references win. |
| **One family: Archivo Variable** (width axis 62–125 %) for display + body, **JetBrains Mono** for meta. Fraunces is removed | References C3: all use one sans. The width axis gives display/body contrast without a second family. The new stack is 2 font files instead of 3 families from Google | my-design-taste "serif display + sans". Still honours its "max two families" rule |
| **Emphasis by width, not italics.** Key words set at `font-stretch:125%` | This is the typographic signature, specific to this build | — |
| **Palette = ink/paper/concrete + terracotta as the only accent.** Navy, blush and tint are removed | C2 + my-design-taste's "one accent" rule | CLAUDE.md palette (**needs client sign-off**, see §7) |
| **No motion library.** CSS + IntersectionObserver only; GSAP and hls.js are removed | Client's #1 constraint is weight. my-design-taste's eases/staggers are kept, its framer-motion default is not | my-design-taste stack |
| **MP4 renditions replace 4K HLS** | Measured: the 13.9 s loop encodes to 2.38 MB at 1080p and 1.15 MB at 720p (CRF 27) vs 13.7 MB now. Removing hls.js cuts about 500 KB of minified JS | CLAUDE.md "HLS hero" |
| **Grain overlay removed** from the hero | A `mix-blend-overlay` layer over playing video recomposites every frame; costly on low-end phones | my-design-taste noise overlay |
| **Works becomes an image grid + project viewer** | C1, C8; hover-only preview fails on touch | Current list layout |

**Signature: "Aperture."** Every photograph arrives through a horizontal slit that opens to full frame, like light entering through a window. It fires only once the image is **decoded and in view**, so visitors never see a half-painted image. That makes the lazy-loading requirement part of the presentation. Everything else stays quiet.

## 2. Fonts

| Role | Family | Settings | Use |
| --- | --- | --- | --- |
| Display | `"Archivo Variable"` (`@fontsource-variable/archivo/wdth.css`) | wght 300, `font-stretch:100%`; emphasis `125%`; tracking −0.025em; line-height 0.98 | Hero h1, section h2 (h2 at wght 350, stretch 112 %) |
| Body/UI | same | wght 400, stretch 100 %, 15px/1.6 | Paragraphs, buttons, names |
| Wordmark | same | wght 400, stretch 125 %, uppercase, tracking 0.28em, 13px | Header logo |
| Meta | `"JetBrains Mono"` (`@fontsource/jetbrains-mono/400.css`) | 11px, uppercase, tracking 0.14em | Eyebrows, captions, filters, coordinates |

Minimum rendered text size: **11px**. No 9/10px text anywhere.

## 3. Colour system (literal hex; contrast measured)

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| `ink` | `#231F20` | Dark surfaces; primary text on light | 13.9:1 on concrete |
| `paper` | `#FFFFFF` | Primary light surface | — |
| `concrete` | `#EEEDEA` | Secondary light surface (Services) | — |
| `stone` | `#6B6766` | Muted text on light | 5.59:1 paper, 4.77:1 concrete |
| `bone` | `#E9E6E1` | Primary text on ink | 13.1:1 |
| `fog` | `#A29D9B` | Muted text on ink | 6.08:1 |
| `terracotta` | `#9C5338` | Accent on light: eyebrow rule, active filter fill (white text 5.66:1), focus ring | 5.66:1 on paper |
| `terracotta-light` | `#C97B5C` | Accent text on ink | 5.02:1 |

**Excluded:** navy `#0a1f3f`, blush `#f0d3bf`, tint `#d67456`, mist `#f1efee`, ink-2 `#2b2526`, and any opacity-derived text colour (`text-ink/45`, `text-white/50`, …) used for meaning. Muted text uses `stone` / `fog`.

## 4. Sections (flow unchanged)

Tone per section (`data-tone` drives the header ink):

| # | Section | Surface | data-tone |
| --- | --- | --- | --- |
| — | Hero | video on ink | dark |
| 01 | Studio | paper | light |
| 02 | Works | paper | light |
| — | ProjectFocus | ink | dark |
| 03 | Services | concrete | light |
| 04 | Team | paper | light |
| 05 | Contact | ink | dark |

**Header.** Wordmark `ARYA SAMODRA` (stretch 125 %) + `ARCHITECTS` in meta style. Desktop links unchanged (Studio, Works, Services, Team, Enquire●). **Below `md`:** a 44×44 "Menu" button opens a full-screen ink sheet with the same links in display type. The sheet closes on link click and on Esc. The tone probe is rAF-throttled.

**Hero.** Poster-first MP4 loop (720p or 1080p picked at runtime). Overlay lightened to `linear-gradient(180deg, rgba(35,31,32,.35) 0%, rgba(35,31,32,0) 35%, rgba(35,31,32,.7) 100%)`. Copy unchanged: "Architecture measured in *standing light*." with "standing light" at stretch 125 % (not italic). Words rise in sequence: translateY .4em→0 + fade, 800 ms, `cubic-bezier(0.16,1,0.3,1)`, 80 ms stagger, 200 ms initial delay. CTA: "View selected works →" (outline, square) + optional project caption bottom-left (`hero.caption`, WOHA pattern), shown only when set. The coordinate bar stays, in meta style.

**Studio.** Layout unchanged. The two figures use `<Picture>` with aperture. The statement h2 uses display h2 settings.

**Works.** Filter chips stay (typology entry, C5). Chips show "All work" plus one per type; the active chip is filled `terracotta`. The list becomes a grid: 1 col < 640px, 2 cols ≥ 640, 3 cols ≥ 1024. It scrolls inside the section on desktop. Card = `<button>`: 3:2 `<Picture>` + meta line `01 · F&B · TULUNGAGUNG` + name (20px, wght 450). Hover/focus: image scale 1.03 over 700 ms. Click/Enter opens the Project Viewer. The counter "12 projects" stays.

**Project Viewer (new).** Native `<dialog>` on ink. It shows the large image (`object-contain`, `sizes="100vw"`), name (display h2), meta (type · place), counter `03 / 12`, prev/next buttons plus ←/→ keys (wrapping, within the list it was opened from), and a thumbnail strip when the project has >1 image. Close with the button, Esc or a backdrop click; focus returns to the opening card. URL reflects `?work=<id>` (shareable); an unknown id is ignored and removed. Fade in 240 ms, out 180 ms.

**ProjectFocus.** Surface navy → ink. Left: Araya full-height `<Picture>`. Right: panel with eyebrow `IN FOCUS · 11`, name, meta, one line of description, and a "View project" button that opens the viewer at `araya-resto-kostel`. Tiles show only images from Araya's own `gallery`. With an empty gallery the panel takes the space. **The Smesta/Petrokimia photos are no longer labelled as Araya** (G5).

**Services.** Grid unchanged; surface concrete. Hover fill is terracotta at 300 ms (kept). Type moves to the new scale.

**Team.** The principal keeps the portrait (`<Picture>`). The other six render as a **text roster** (name + role rows, hairline dividers, KKAA staff-list style) instead of "PORTRAIT 3:4" placeholder frames. When a member gains a `photo`, they render as a portrait card automatically.

**Contact.** Surface ink, tone dark. Channels unchanged. The mobile number renders as a `tel:` link only when `contact.mobile` contains digits and no `·`; otherwise it shows as plain text. The client logo wall uses `<Picture>` with the `clients` ladder (120/240 px) at `opacity .7`, full on hover. Logos are inverted for ink via `filter: invert(1) grayscale(1)` + `mix-blend-screen`. The group is labelled "Client logos".

## 5. Motion (all disabled under `prefers-reduced-motion: reduce`)

| Name | Where | Spec |
| --- | --- | --- |
| Aperture | every `<Picture>` with `reveal` | from `clip-path: inset(48% 0 48% 0)`, `scale(1.04)`, opacity 0 → `inset(0)`, `scale(1)`, 1; 900 ms `cubic-bezier(0.16,1,0.3,1)`; trigger = decoded ∧ ≥15 % in view |
| Rise | hero h1 words | above |
| Lift | work cards | img `scale(1.03)` 700 ms `cubic-bezier(0.22,1,0.36,1)` on hover/focus-visible |
| Viewer | dialog | opacity 240 ms in / 180 ms out |

Reduced motion: no hero video (poster only), no aperture/rise (final state immediately), no lift.

## 6. Performance budgets (enforced by `npm run budget`)

| Asset | Budget | Today |
| --- | --- | --- |
| Entry JS (gzip) | ≤ 75 KB | 266 KB |
| All JS (gzip) | ≤ 90 KB | 266 KB |
| CSS (gzip) | ≤ 12 KB | 4.9 KB |
| Any file in `dist/media/img` | ≤ 300 KB | PNGs up to 1.45 MB |
| `hero-1080.mp4` / `hero-720.mp4` / `poster.webp` | ≤ 3.0 MB / ≤ 1.5 MB / ≤ 80 KB | 13.7 MB HLS |
| PNG/HLS files in `dist` | 0 | 34 |

Images: AVIF + WebP `srcset`, explicit `width`/`height`, `loading="lazy"` except the hero poster, blurred 24 px LQIP as the frame background. Width ladder `[480, 960, 1600, 2400]` capped at the source width, so higher-resolution originals improve the site with no code change.

## 7. Client inputs & sign-offs (blocking only where noted)

1. **Original photographs ≥ 2400 px on the long edge**: the single biggest visual upgrade (G8). Drop into `assets-src/images/` and run `npm run images`.
2. Approve removal of navy + Fraunces from the site (§1).
3. Real mobile number (`contact.mobile`).
4. Which project the hero video shows (`hero.caption`).
5. Team portraits, or approval of the text roster.
6. Extra photos per project for viewer galleries (`works[i].gallery`).
7. Client names for logo alt text (optional).

## 8. Out of scope

Separate project pages/routes, CMS, i18n, the Workflow section (profile p.11), analytics, upgrading React/Vite/Tailwind majors.
