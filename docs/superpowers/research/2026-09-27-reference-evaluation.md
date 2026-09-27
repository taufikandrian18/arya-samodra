# Reference Evaluation: KKAA, ABODAY, ArMS, WOHA

Method: `scientific-thinking-scholar-evaluation`, **comparative** scope. The scholarly rubric is adapted to websites; each dimension keeps its original intent (mapping in brackets). Scores 1–5.

- **Evidence base:** each site's homepage plus one inner page (WOHA project page, ABODAY works page, KKAA project page), rendered in a desktop browser on 2026-09-27, plus DOM/network probes (fonts, colours, image sizes, transfer). ArMS transfer measured at 1,295 KB for the homepage.
- **Confidence: medium.** KKAA images did not paint in the test browser (its loader only renders images in view), so KKAA's visual layout is inferred from DOM + metadata, not from pixels. No mobile or Lighthouse runs were done on the references.

## Overall assessment

The four references disagree on almost everything except one thing: **the photograph is the interface.** Every site pushes UI chrome to the edges (small wordmark, thin nav, captions) and lets full-bleed media carry the page. None of them uses a brand accent colour in the UI, a serif display face, or heavy motion. They are also lighter than the current Arya build: WOHA streams 720p MP4 heroes, KKAA serves 600×400 thumbnails with `srcset`, and ArMS's four hero images are 180–250 KB JPEGs.

## Dimension scores

| Dimension [rubric origin] | KKAA | ABODAY | ArMS | WOHA | Evidence |
| --- | ---: | ---: | ---: | ---: | --- |
| Purpose clarity [Problem & question] | 5 | 4 | 3 | 5 | KKAA/WOHA lead with projects; ABODAY leads with three studio quotes; ArMS home has no statement, only images |
| Fit for Arya [Literature & context] | 3 | 5 | 4 | 4 | ABODAY/ArMS are Indonesian practices of similar scale and typologies; KKAA's scale (news, books, map, 3 offices) is far bigger than Arya's |
| Information architecture [Methodology] | 5 | 4 | 3 | 5 | ABODAY splits works into 7 typologies (commercial, hospitality, institution, multiresidential, private villas, urban house, competition); WOHA/KKAA: projects → project page |
| Media quality [Data & evidence] | 5 | 4 | 4 | 5 | KKAA credits photographers on every image; WOHA uses a video per featured project; ArMS 733×1100 portrait JPEGs |
| Wayfinding [Analysis] | 4 | 3 | 4 | 4 | ABODAY hides everything behind a hamburger; WOHA hero captions link straight to the project |
| Presentation [Results] | 5 | 3 | 4 | 5 | WOHA project page: large image + thumbnail strip + text + film |
| Weaknesses [Limitations] | 3 | 2 | 3 | 3 | KKAA sets `user-scalable=no` (blocks zoom); ABODAY shows mojibake (`â€œ`) in its hero quotes and uses JPG social icons; ArMS text sits directly on photos |
| Typography & copy [Writing] | 4 | 3 | 3 | 4 | KKAA: system sans, weight 300 only, `#2a2a2a` on white; ArMS: Inter 400; WOHA: spaced-caps wordmark + light geometric sans |
| Attribution [Citations] | 5 | 2 | 2 | 4 | KKAA: country · year · name · photographer; WOHA: project, city |

## What they have in common (the brief behind the brief)

| # | Pattern | Seen in | Confidence |
| --- | --- | --- | --- |
| C1 | Full-bleed photography/video is the hero; UI is a thin frame around it | 4/4 | Certain |
| C2 | Monochrome UI (white / near-black / grey). Colour comes only from the photographs | 4/4 | Certain |
| C3 | One sans family at light/regular weights; wordmarks in spaced capitals or thin line | 3/4 measured, ABODAY uses a display face for quotes | Certain |
| C4 | Media is captioned with **project name + place**, not marketing taglines | WOHA, KKAA, ABODAY | Certain |
| C5 | Typology is the way into the work (categories / sectors / filters) | ABODAY, WOHA, KKAA | Certain |
| C6 | Media is sized for the screen, not the archive: 720p video, 600×400 thumbs, ~200 KB JPEGs | WOHA, KKAA, ArMS | Certain |
| C7 | Motion is slow fades (ArMS: 0.6 s transitions), images appear when in view | ArMS, KKAA | Likely |
| C8 | Each project opens into a larger view (hero image + thumbnails + text) | WOHA, KKAA | Certain |

## Do not copy

- KKAA's `user-scalable=no` (fails WCAG 1.4.4 resize text).
- ABODAY's execution (encoding bug, raster icons, dated PHP templates). Copy its **content strategy** (typology split, studio-voice quotes), not its build.
- Text laid directly on busy photos without a scrim (ArMS).

## Gap analysis: current Arya build vs. C1–C8

| Gap | Current state (measured) | Pattern violated |
| --- | --- | --- |
| G1 | Works is a text list; images appear only on mouse hover (unusable on touch) | C1, C8 |
| G2 | Fraunces serif + terracotta + blush italic + navy section: reads as a template look, not like the references | C2, C3 |
| G3 | Hero is a 4K HLS stream: 13.7 MB of `.ts` segments. 14 PNG photos at 350 KB–1.45 MB each, all loaded eagerly. JS bundle 827 KB (266 KB gzip), mostly hls.js; GSAP ships for one hover tween | C6 |
| G4 | No project view: every work links to `#project` (the Araya section) | C8 |
| G5 | ProjectFocus labels photos from other projects as Araya details (`p47-2` = Smesta, `p26-1` = Petrokimia per `data.js`) | C4 (attribution) |
| G6 | No navigation below `md` (links are `hidden md:flex`, no menu button) | — |
| G7 | Meta text at 9–10 px; eyebrow `text-ink/45` on white ≈ 2.9:1 contrast (fails AA) | — |
| G8 | Source photos top out at 1000 px wide (pulled from the PDF). Full-bleed on a 1440 px retina screen needs ~2400–2900 px | C1, C6 |

G8 is not a code problem. The references look expensive mostly because of their photography; code can only stop the site from making weak photos look worse.

## Evidence checks still needed

- Mobile rendering of all four references (not tested).
- KKAA home slideshow behaviour (images did not paint in the test browser).
- Which project the hero video shows (it looks like a double-height villa interior; unconfirmed).
