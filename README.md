# Aylith

**A lab that turns demand signals into shipped AI tools. Read the signal. Build the tool. Ship in days, not quarters.**

`aylith.com` is the public face of Aylith — a portfolio lab. The site does not sell any single tool; each tool has its own product surface elsewhere. It is the connective tissue that makes the portfolio legible as one coherent practice: read the signal, build the tool, ship in days. It shows the method, the receipts, and lets every tool stand on its own from the catalog.

The site is a fully prerendered, static SvelteKit app — intentionally lightweight, durable, and deployed automatically to GitHub Pages.

## What & Why

Founders, technical builders, and practitioners land here to answer one question: *is this lab real, or theater?* The site answers it with evidence, not adjectives — 138+ launches analyzed, every tool public from day one, and the **complete 26-tool studio catalog** laid out in one index. The brand is quietly confident: warm-stone palette, Newsreader-class serif wordmark, copy that refuses superlatives and future-tense marketing. Restraint is the brand.

## Features & Sections

| Surface | What it does |
| --- | --- |
| **Hero** | Animated tally-mark + "A Y L I T H" wordmark lockup that builds itself on load (twelve monthly animation variants). Fluid type, viewport-aware. |
| **The loop** | The three-step method — Listen → Pattern → Ship — with scroll-reveal. |
| **Portfolio** | Featured tools as large cards plus a compact list of the rest, accent-coloured per tool. |
| **Projects catalog** (`/projects`) | The complete catalog — all 26 studio tools as cards (name, tagline, one-line description, link to its detail page), with a status-mix overview and client-side category filtering (each category tab carries its count) across seven categories. Responsive, light + dark, no layout shift. |
| **Project detail** (`/projects/[slug]`) | Per-tool page rendered from Markdown: tagline, description, features, target user, long-form body. |
| **About** (`/about`) | The lab's posture in three short paragraphs. |
| **Design system** (`/design`) | Live brand reference — mark readings, wordmark variants, palette, motion controls, copy-to-clipboard tokens. |
| **SEO & social** | Per-page `<title>`/description, canonical URLs, Open Graph + Twitter cards, `og:image`, `apple-touch-icon`, `theme-color`, a generated `sitemap.xml` (static routes + all 26 project slugs), and `robots.txt`. |
| **404 / error** | On-brand error page. |
| **Settings menu** | Theme (system / light / dark) and motion (system / reduced / full) preferences, persisted. |

Brand details: a Konami-code easter egg and a styled console signature live in the root layout.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | SvelteKit 2 (Svelte 5 runes) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@theme` tokens via `@tailwindcss/vite`) + `@tailwindcss/typography` |
| Build | Vite 8 |
| Adapter | `@sveltejs/adapter-static` (full SSG — every route prerendered) |
| Content | Markdown via `gray-matter` (frontmatter) + `marked` (rendering), parsed at build |
| Fonts | Space Grotesk (display) + DM Sans (body), via Google Fonts |
| Quality | `svelte-check` (TypeScript + Svelte diagnostics) |
| Hosting | GitHub Pages (Actions → Pages) on the custom domain `aylith.com` |

## Architecture

- **Static-first.** Every route is prerendered (`adapter-static`, `prerender = true` in the root layout). There is no runtime server; the build emits a folder of HTML and assets.
- **Content as data.** Tool copy lives in `src/content/projects/*.md`. Frontmatter (`name`, `tagline`, `description`, `category`, `status`, `features`, `targetUser`) is typed as `Project`; the Markdown body is rendered to HTML at build time by `src/lib/server/markdown.ts`. Visual metadata (icon path, accent gradient, featured flag, display order) lives alongside in `src/lib/data/projects.ts` and is merged by slug. Adding a tool = one Markdown file + one metadata entry.
- **SEO is centralized.** A single `Seo.svelte` component sets per-page head tags (title, description, canonical, Open Graph, Twitter) on the home, about, design, projects, and project-detail pages. The `sitemap.xml` endpoint enumerates the static routes plus every project slug derived from the same content source, so it stays complete and in sync automatically.
- **Theme & motion before paint.** A tiny inline script in `app.html` resolves theme and motion preferences from `localStorage` + system queries before first paint, so nothing flashes. Reactive stores (`theme.svelte.ts`, `motion.svelte.ts`) keep them current after hydration.
- **Motion is gated.** Reveal / tilt / draw / count-up actions (`src/lib/actions/`) all honour `prefers-reduced-motion` and the user's motion preference via `html[data-motion]`.
- **Brand as code.** The tally-mark and wordmark are Svelte components with a monthly-rotating wordmark variant; the design system route renders them live.

## Quick Start

The app lives in the `landing/` subdirectory. Node 22+ is recommended (CI pins Node 22).

```bash
cd landing
npm install          # or: bun install
npm run dev          # dev server on http://localhost:5847
```

Build and preview the production (static) output:

```bash
npm run build        # outputs to landing/build
npm run preview      # serves the build on http://localhost:5848
```

No environment variables are required — the site is fully static and has no backend.

## Scripts

Run from `landing/`:

| Script | Command | Purpose |
| --- | --- | --- |
| `npm run dev` | `vite dev` | Start the Vite dev server (port 5847). |
| `npm run build` | `vite build` | Produce the prerendered static site in `build/`. |
| `npm run preview` | `vite preview` | Preview the production build (port 5848). |
| `npm run check` | `svelte-kit sync && svelte-check` | Sync SvelteKit types and type-check the project. |
| `npm run prepare` | `svelte-kit sync` | Generate SvelteKit types (runs on install). |

## Project Structure

```
aylith.com/
├── .github/workflows/deploy.yml   # GitHub Pages deploy (Actions → Pages)
└── landing/
    ├── src/
    │   ├── app.html          # Shell + pre-paint theme/motion script, base meta
    │   ├── app.css           # Tailwind v4 @theme tokens, keyframes, motion gating
    │   ├── content/
    │   │   └── projects/      # One Markdown file per tool (source of truth for copy)
    │   ├── lib/
    │   │   ├── actions/        # reveal, tilt, draw, countup (motion-gated)
    │   │   ├── brand/          # Wordmark variant rotation
    │   │   ├── components/
    │   │   │   ├── Seo.svelte   # Reusable per-page SEO / OG / Twitter head
    │   │   │   ├── brand/       # Mark, Wordmark, MotionControl
    │   │   │   ├── home/        # ProjectCard
    │   │   │   └── layout/      # Navbar, Footer, SettingsMenu
    │   │   ├── data/projects.ts   # Per-tool visual metadata + display order
    │   │   ├── server/markdown.ts # Frontmatter + body loader
    │   │   ├── stores/         # theme.svelte.ts, motion.svelte.ts (runes-based)
    │   │   └── types/project.ts # Project / category / status types
    │   └── routes/
    │       ├── +layout.svelte  # Navbar, Footer, easter eggs
    │       ├── +page.svelte    # Home (hero, method, portfolio)
    │       ├── about/
    │       ├── design/         # Live design system
    │       ├── projects/
    │       │   ├── +page.svelte        # Catalog + category filter (26 tools)
    │       │   └── [slug]/+page.svelte # Detail (rendered from Markdown)
    │       └── sitemap.xml/    # Prerendered sitemap endpoint
    ├── static/                 # CNAME, favicons, brand avatars, robots.txt
    ├── svelte.config.js        # adapter-static
    └── vite.config.ts          # Tailwind + SvelteKit plugins, dev/preview ports
```

## Environment Variables

None. The site is fully static with no backend or third-party API calls at runtime.

## Deployment

Deployed to **GitHub Pages** at the custom domain **aylith.com** (`static/CNAME`), automatically via **GitHub Actions → Pages** (`.github/workflows/deploy.yml`):

1. On every push to `main`, the workflow checks out the repo and sets up Node 22 (with npm cache).
2. Runs `npm ci` and `npm run build` inside the `landing/` directory.
3. Uploads `landing/build/` as a Pages artifact (`actions/upload-pages-artifact`) and deploys it (`actions/deploy-pages`).

Details:

- **Custom domain:** `aylith.com`, configured via `landing/static/CNAME` (copied into the build root).
- **Mechanism:** native GitHub Pages deployment (not a `gh-pages` branch or a `docs/` folder).
- **Concurrency:** deploys are serialized to the `pages` group with in-progress runs cancelled.
- **Permissions:** the workflow uses `pages: write` and `id-token: write`.

Because the adapter is static and every route is prerendered, the artifact is a plain folder of HTML/CSS/JS — no server runtime. To deploy: merge to `main`. To preview locally first: `npm run build && npm run preview`.

## Roadmap

Larger gaps intentionally left for a future pass:

- **Contact path.** No current CTA for "I want to talk to the people behind this." A contact route or email CTA is the obvious next addition once the lab decides how it wants inbound.
- **Live / repo links per project.** Surface a "Visit" or "Source" link on project pages as products ship, so the "what shipped" narrative has destinations.
- **Per-project `og:image`.** Render a branded social card per tool instead of the shared studio avatar.
- **JSON-LD structured data.** Add `Organization` / `WebSite` schema for richer search results, building on the existing sitemap + canonical tags.
- **Per-tool status accuracy.** Statuses (`research` → `live`) are authored per Markdown file; keeping them in sync with each tool's real shipping state is an ongoing editorial task.
- **Live receipts.** The "138+ launches analyzed" figure is static copy; wiring it to the lab's actual analysis pipeline would make the headline self-updating.
- **Lint/format config.** Add ESLint/Prettier and a CI `check` step alongside the build.
