---
name: aylith-brand-mark
description: >-
  Change the Aylith logo/mark or the name backstory and roll it out consistently across the
  repo. Use when the user wants to update the avatar/favicon/inline mark, regenerate the PNG
  raster variants, re-upload the GitHub org avatar, or edit the four name-origin "readings".
  Triggers: "change the logo", "update the mark", "new avatar", "regenerate the icons",
  "update the favicon", "tweak the stars", "edit the name origin / backstory", "fix the brand
  mark". Owns the locked mark geometry, the two color treatments, the asset-sync graph, the
  Chromium PNG-regen recipe, the live HTML-picker workflow, the name readings, and the
  org-avatar upload steps.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Aylith brand mark

The mark is a **parabolic-progress** bar chart: bars climb from the bottom edge, a copper
parabola sweeps past them to the top-right, a copper sparkle cluster fills the upper-left.
Square icon. Two color treatments share one geometry.

## Locked geometry (single source of truth)

viewBox `0 0 256 256`, **transparent** (no background rect). Palette only: ink `#1c1a16` ⇄
`#f3efe7`, copper `#c97a3a`, bronze `#9a6432`; theme bg cream `#f8f7f4` / dark `#16140f`.

- Bars: `x = 40 76 112 148 184 220`, tops `228 212 188 156 112 60`, **baseline `y=256`** (grounded on the bottom edge), stroke 15, `linecap butt`.
- Curve: `M0 256 Q 209 219 256 0`, copper, width 17, `linecap butt`, flush to the square corners (clipped by viewBox).
- Sparkles (A1) — `star(cx,cy,R,r)` 4-point paths:
  - big `(70,80) R72 r16` → `M70 8 L86 64 L142 80 L86 96 L70 152 L54 96 L-2 80 L54 64 Z`
  - medium `(150,36) R30 r7` → `M150 6 L157 29 L180 36 L157 43 L150 66 L143 43 L120 36 L143 29 Z`
  - small `(120,122) R22 r5` → `M120 100 L125 117 L142 122 L125 127 L120 144 L115 127 L98 122 L115 117 Z`

`star = (cx,cy,R,r) => "M{cx} {cy-R} L{cx+r} {cy-r} L{cx+R} {cy} L{cx+r} {cy+r} L{cx} {cy+R} L{cx-r} {cy+r} L{cx-R} {cy} L{cx-r} {cy-r} Z"`

### Treatment 1 — theme-aware (site SVGs)
Bars flip via `prefers-color-scheme` in an embedded `<style>` (`.ink` ink↔cream); the curve gets a
**knockout casing** (`.knock`, stroke = theme bg, width 25, drawn under the copper 17) so it stays
crisp where it crosses the bars. Used for `avatar.svg`, `favicon.svg`, `brand/avatar.svg`. Canonical
copy lives in those files — read one before editing.

### Treatment 2 — bronze duotone (single-asset / GitHub)
Bronze bars `#9a6432` + copper curve + copper stars, no casing, transparent. A PNG can't be
theme-aware, so this is what every raster asset bakes (og:image, apple-touch, GitHub avatar). It
reads on light and dark.

## Asset-sync graph — change these together
- `landing/static/avatar.svg` — theme-aware master + `/design` download.
- `landing/static/favicon.svg` — same theme-aware mark (referenced in `landing/src/app.html`).
- `landing/static/brand/avatar.svg` — brand-kit copy (theme-aware).
- `landing/src/lib/components/brand/Mark.svelte` — inline animated mark, same geometry (currentColor bars + `stroke-accent-500` curve/stars; `BARS`, `CURVE`, `STARS` consts). Keep the build-in animation; no bounce easing (the repo's impeccable gate flags it).
- Raster (bronze): `landing/static/avatar.png` (1024), `avatar-512.png` (512, feeds `Seo.svelte` og:image + `app.html` apple-touch), `brand/avatar.png` (1000), plus a **500×500** for the GitHub avatar.

## Regenerate the PNGs (Chromium — NOT ImageMagick)
ImageMagick mis-renders `clip-path`/SVG strokes. Always rasterize/verify with headless snap
Chromium under `~/.cache/...` (snap confinement blocks `/tmp`). Transparent output:
```bash
# wrap.html = <body style="margin:0;background:transparent"><svg width=SIZE height=SIZE viewBox="0 0 256 256">…bronze…</svg></body>
/snap/bin/chromium --headless --no-sandbox --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --default-background-color=00000000 \
  --window-size=SIZE,SIZE --screenshot=out.png "file://$HOME/.cache/.../wrap.html"
```
Sizes: 1024 (avatar.png), 512 (avatar-512.png), 1000 (brand/avatar.png), 500 (GitHub).

## Iterate visually — the HTML-picker workflow
For any design change, build a self-contained `/tmp/*.html` picker that generates the SVG from JS
params (bars/curve/stars), shows it on light + dark tiles with a 16/24/32/48 favicon ladder and
PNG/SVG download, render-verify it with Chromium, then `Start-Process` it in the Windows browser
for the user to pick. The 16px tile is the legibility gate.

## GitHub org avatar (no API exists)
Generate the 500×500 bronze PNG, then open the folder with it selected so the owner uploads + crops
in their authenticated session:
```bash
explorer.exe /select,"$(wslpath -w ~/.cache/pr-uploads/aylith-org-avatar-500.png)"
```
Target: `github.com/organizations/aylith-labs/settings/profile` (PNG/GIF/JPG only).

## The name backstory — four readings
Aylith carries four readings at once (mirror the `/design` `markReadings` pattern). Voice rules
(see `landing/PRODUCT.md` + `landing/DESIGN.md`): short declaratives, heavy periods, **no
em-dashes**, present/past tense, one copper accent.
1. **AI, in stone** — Ay = AI; ·lith = líthos (Greek, stone), the root in monolith/megalith. Aylith turns AI into liths: small, solid tools you own.
2. **A field, not a monolith** — many sharp tools, each its own standing stone, under one umbrella.
3. **Six letters, one promise** — Agents. Yours. Lasting. Indexed. Tools. Hub.
4. **Roots and branches** — the infrastructure is the roots, the products the branches; set in stone and still growing.
Homes: `landing/DESIGN.md` (`## 1a. The Name`), `landing/src/routes/design/+page.svelte` (a
`nameReadings` array in the wordmark card), `landing/src/routes/about/+page.svelte` ("About the
name" block).

## Verify
`cd landing && npm run build` (static prerender, must be clean). For visual checks, `npm run
preview -- --port <p>` then screenshot with `--virtual-time-budget=4000` so the Mark's build-in
animation settles before capture. Solo repo → commit straight to `main`.
