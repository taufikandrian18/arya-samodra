# Arya Samodra Architects

Company profile website — React + Vite + Tailwind CSS.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + component tests
npm run build      # encodes images (incremental), then builds dist/
npm run budget     # weight gate on dist/
```

Media pipeline: `npm run extract` (profile PDF → `assets-src/images/**`, needs poppler-utils) and `npm run images` (→ AVIF/WebP ladders in `public/media/img/` + `src/media/manifest.json`).

See `CLAUDE.md` for structure, design rules and open items.
