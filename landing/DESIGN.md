---
name: Aylith
description: The Editorial Atelier — a portfolio lab's marketing site in warm stone and tally copper.
colors:
  tally-copper-50:    "oklch(0.97 0.015 50)"
  tally-copper-100:   "oklch(0.94 0.030 50)"
  tally-copper-200:   "oklch(0.88 0.060 50)"
  tally-copper-300:   "oklch(0.80 0.090 50)"
  tally-copper-400:   "oklch(0.73 0.115 50)"
  tally-copper-500:   "oklch(0.66 0.13 50)"
  tally-copper-600:   "oklch(0.56 0.13 50)"
  tally-copper-700:   "oklch(0.46 0.115 50)"
  tally-copper-800:   "oklch(0.36 0.090 50)"
  tally-copper-900:   "oklch(0.28 0.070 50)"
  workshop-stone-50:  "#f8f7f4"
  workshop-stone-100: "#f0eee9"
  workshop-stone-200: "#e1ddd3"
  workshop-stone-300: "#c9c3b3"
  workshop-stone-400: "#90897a"
  workshop-stone-500: "#615b50"
  workshop-stone-600: "#46423a"
  workshop-stone-700: "#332f29"
  workshop-stone-800: "#1c1a16"
  workshop-stone-900: "#131110"
  workshop-stone-950: "#0a0907"
  warm-50:            "#faf8f5"
  warm-100:           "#f3efe8"
  warm-200:           "#e8e0d4"
  warm-300:           "#d4c8b8"
  warm-400:           "#b0a08a"
typography:
  wordmark:
    fontFamily: "Newsreader, 'Iowan Old Style', Georgia, serif"
    fontWeight: 500
    letterSpacing: "-0.01em"
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  "2xl": "24px"
  full: "9999px"
spacing:
  xs:  "0.5rem"
  sm:  "0.75rem"
  md:  "1rem"
  lg:  "1.5rem"
  xl:  "2rem"
  "2xl": "3rem"
  "3xl": "5rem"
components:
  button-primary:
    backgroundColor: "{colors.tally-copper-500}"
    textColor: "{colors.workshop-stone-50}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.tally-copper-600}"
    textColor: "{colors.workshop-stone-50}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.workshop-stone-700}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.875rem"
  button-ghost-hover:
    backgroundColor: "{colors.workshop-stone-100}"
    textColor: "{colors.workshop-stone-900}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.875rem"
  card:
    backgroundColor: "{colors.workshop-stone-50}"
    textColor: "{colors.workshop-stone-900}"
    rounded: "{rounded.2xl}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.workshop-stone-50}"
    textColor: "{colors.workshop-stone-900}"
    rounded: "{rounded.md}"
    padding: "0.625rem 0.875rem"
---

# Design System: Aylith

## 1. Overview

**Creative North Star: "The Editorial Atelier"**

Aylith.com is laid out like a small-press monograph that happens to be a portfolio. The wordmark is set in Newsreader the way a magazine masthead is set; the work below it sits on a warm-stone canvas the way letterpress sits on cotton; the single accent — copper, drawn from the tally-mark's diagonal — appears the way an editor's pencil-mark appears: rarely, with weight. The page is not engineered to convert. It is composed to be read.

The system rejects four neighboring lanes by name, lifted directly from the strategic brief: **generic SaaS gradient hell** (Stripe/Linear/Vercel glassmorphism, hero-metric cards, gradient mesh backgrounds), **AI-startup neon-on-black** (OpenAI-adjacent terminals, electric-blue glow), **enterprise B2B navy-and-gray** (logo walls, corporate stock photography), and **Web3 / crypto neon-and-gradient** (saturated purples, animated orbs, $TOKEN energy). The first reflex for any AI/tools site in 2026 is one of these four. None of them are here.

**Key Characteristics:**

- Warm-stone neutrals across both light and dark themes; no cool/violet tinting anywhere.
- One accent (Tally Copper) used as a true accent: ≤10% of any given screen.
- Three-family typography pairing: Newsreader for the wordmark, Space Grotesk for headlines, DM Sans for body. Each font has one job; the families don't bleed across roles.
- Flat-by-default surfaces. Depth is conveyed by motion (subtle hover-lift), not by shadows.
- No future-tense copy. No animations that exist only to delight. No equal-card grids.

## 2. Colors

A two-anchor palette: a single warm-neutral surface ramp and a single copper accent. The whole site is built from these two scales plus a thin auxiliary warm ramp for dark-mode body text. There is no secondary color, no tertiary color, no semantic blue-for-info or green-for-success. The system commits to restraint.

### Primary

- **Tally Copper** (`oklch(0.66 0.13 50)` / token `tally-copper-500`): The single accent. Named for the diagonal stroke in the tally-mark logo. Used for primary buttons, focus rings, link hover, list-row reveal accents, and the wordmark's diagonal. Light-mode buttons use 500; the deeper 600 (`oklch(0.56 0.13 50)`) is the hover state — *patinated copper* as a tactile cue, never lighter.
- **Tally Copper ramp** (50 → 900): The full ramp is defined so tints (50, 100) can soften callouts and shades (700–900) can render copper-on-light text. Avoid the 200–400 range in product chrome; those tones drift toward sand and weaken the accent.

### Neutral

- **Workshop Stone** (`#f8f7f4` → `#0a0907`): The 11-step neutral ramp. Surface 50 is the light-mode canvas; 800 is the dark-mode card; 950 is the dark-mode canvas. Borders sit at 200 (light) and 800 with 60% alpha (dark). Body text is 900 in light, 200 (via the warm ramp) in dark.
- **Warm** (`#faf8f5` → `#b0a08a`): A four-step auxiliary scale used only for dark-mode body text and secondary labels. Warmer than the corresponding workshop-stone steps would be, to keep dark text feeling like ink-on-cream rather than gray-on-charcoal.

### Named Rules

**The One Accent Rule.** Tally Copper appears on ≤10% of any given screen. Primary button, focus ring, the wordmark's diagonal, the list-row hover reveal: that's the working set. If a new design instinct is "let's add a second accent for variety," the answer is no. The rarity is the point.

**The No-Cool-Tint Rule.** Every neutral is warm. Workshop Stone runs through warm beige/taupe; Warm runs through ivory. There is no cool gray in the system. Pure `#fff` and pure `#000` are prohibited; the white in `body` is the bare keyword only because it pairs with `workshop-stone-900` text — it should not propagate into other surfaces.

**The Patinated-on-Hover Rule.** Copper deepens on hover (`tally-copper-500` → `tally-copper-600`), never lightens. Lighter-on-hover reads as a state weakening; deeper-on-hover reads as commitment.

## 3. Typography

**Wordmark Font:** Newsreader (with Iowan Old Style, Georgia fallback)
**Display / Headline Font:** Space Grotesk (with system-ui fallback)
**Body Font:** DM Sans (with system-ui fallback)

**Character:** A three-family system in which each face has exactly one job. Newsreader sets the wordmark and only the wordmark — a serif with the cadence of a literary review, mid-weight, slightly tightened tracking. Space Grotesk handles every other headline; it carries the precision the lab voice requires without slipping into tech-monospace cliché. DM Sans handles all body copy; it's warm enough to sit on cream paper, geometric enough to disappear into the read.

### Hierarchy

- **Wordmark** (`Newsreader`, 500, tracking -0.01em): The name "aylith." Appears in the navbar and footer. Never substituted, never reset to display weight, never animated. The closest thing the system has to a sacred element.
- **Display** (`Space Grotesk`, 700, `clamp(2.5rem, 6vw, 4.5rem)`, line-height 1.05, tracking -0.02em): Hero headline only. One per page maximum.
- **Headline** (`Space Grotesk`, 700, 1.5rem, line-height 1.2): Section starts. Card titles. The "h2-class" of the page.
- **Title** (`Space Grotesk`, 700, 1rem): Subsection labels, project names inside cards.
- **Body** (`DM Sans`, 400, 1rem, line-height 1.6): All running prose. **Cap at 65–75ch** — reading copy should not stretch wall-to-wall on wide viewports.
- **Body-sm** (`DM Sans`, 400, 0.875rem): Card descriptions, footer copy, secondary annotations.
- **Label** (`DM Sans`, 500, 0.75rem, tracking 0.02em): Category tags, status indicators, metadata.

### Named Rules

**The One-Face-One-Job Rule.** Newsreader is for the wordmark. Space Grotesk is for headings. DM Sans is for body. Crossing the lanes — Newsreader on a heading, Space Grotesk in body copy — looks like a mistake even when it isn't. Don't.

**The Sacred Wordmark Rule.** The wordmark is set in Newsreader 500 with tracking -0.01em. Never recolor it for theming beyond a stroke inversion. Never animate it. Don't pair it with an icon graphic that competes for the same visual weight; the tally-mark is its own ID and lives separately.

**The No-Aspirational-Copy Rule.** Past and present tense, never future. "Built" not "will build." "Ships" not "will ship." A future-tense heading is the tell that the work isn't done yet; the typography spec carries the strategic line.

## 4. Elevation

**Flat by default. Depth is motion, not shadow.**

The system has no resting shadow vocabulary. Cards sit flat on the canvas, distinguished by border (1px workshop-stone-200 in light, 1px workshop-stone-800 with 60% alpha in dark) and contained background (workshop-stone-50 light, workshop-stone-900 with 50% alpha dark). What signals depth is the *response to interaction*: the `btn-press` hover lifts buttons 2px on a 150ms ease-out-quint curve, then drops 1px and accelerates on `:active`. ProjectCard adds a radial cursor-glow that follows the pointer at 12% opacity in the tally-copper hue, plus a `tilt` action that scales 1.01 with a max 4° rotation on mouseover. Both effects are subtractive at rest — they don't exist until you reach for them.

### Motion vocabulary (the elevation analog)

- **`btn-press`**: `transform: translateY(-2px)` on hover, `translateY(1px)` on active. Easing `cubic-bezier(0.16, 1, 0.3, 1)` for 150ms hover, 80ms active.
- **`tilt`**: 3D rotation up to 4°, scale 1.01, applied to ProjectCard.
- **Radial cursor glow**: 400px circle, 12% tally-copper, follows pointer.
- **`list-row::before`**: 3px copper bar that scaleY(0→1) on hover only, 250ms. Hover-revealed, never persistent. (See Named Rule below.)

### Named Rules

**The Flat-by-Default Rule.** Surfaces are flat at rest. No `box-shadow` on cards or containers in their default state. If you find yourself reaching for `shadow-lg`, ask whether the design instead needs a stronger border, more spacing, or a hover-only treatment.

**The Side-Stripe Caveat.** The `list-row::before` accent bar is a 3px vertical stripe revealed on hover. It exists, it works, and it's the ONLY place in the system where a side-stripe pattern is permitted — because it's hover-only and the alternative (a full bottom border, a fill-tint) would weaken the editorial restraint elsewhere on the page. Do NOT replicate this pattern on cards, callouts, alerts, blockquotes, or any element where the bar would be permanent. The shared design laws ban permanent side-stripes; we honor that with this single hover-only exception.

## 5. Components

### Buttons

- **Shape:** `rounded-md` (8px). Never pill-shaped except for icon-only utility buttons.
- **Primary** (`button-primary`): Tally-copper-500 background, workshop-stone-50 text. Padding `0.625rem 1.25rem`. Hover: deepens to tally-copper-600 + `btn-press` translateY(-2px).
- **Ghost** (`button-ghost`): Transparent background, workshop-stone-700 text. Hover: workshop-stone-100 background, workshop-stone-900 text. No border at rest.
- **Focus state:** 2px copper outline (`outline: 2px solid var(--color-tally-copper-500); outline-offset: 2px`). Browser default replaced everywhere; the same ring across buttons, inputs, links, theme toggle.
- **Active state:** translateY(1px), 80ms easing. Reads as "pressed."

### Cards

- **Shape:** `rounded-2xl` (24px). Generously rounded; this is the only place radii go large.
- **Background:** workshop-stone-50 in light, workshop-stone-900 with 50% alpha in dark.
- **Border:** 1px workshop-stone-200/60 in light, workshop-stone-800/60 in dark. Hover deepens to workshop-stone-300 / workshop-stone-700.
- **Internal padding:** `p-6` (1.5rem). Cards have room to breathe.
- **Shadow strategy:** None at rest. ProjectCard adds the radial cursor glow + tilt as hover-only depth. See Elevation.
- **Nested cards:** Prohibited. (Shared design law.)

### Inputs

- **Shape:** `rounded-md` (8px) to match buttons.
- **Background:** workshop-stone-50 in light, workshop-stone-800 in dark.
- **Border:** 1px workshop-stone-300 light, workshop-stone-700 dark.
- **Focus:** Border switches to tally-copper-500, plus the 2px copper outline-offset ring.
- **Error:** Border switches to a dedicated `--color-warn` (not yet defined — fold into spec when error states are needed).

### Navigation

- **Style:** Sticky top navbar. Wordmark left-aligned. Nav links use DM Sans body weight. Active state: tally-copper-100 background + tally-copper-700 text (light), tally-copper-900/40 + tally-copper-300 (dark).
- **Mobile:** Hamburger collapse; menu slides over the canvas with the same warm-stone background, no scrim.
- **Theme toggle:** A standalone button with a 180° rotation on `:active` for the sun/moon swap. 400ms ease-out-quint.

### ProjectCard (signature component)

The portfolio grid is built from `ProjectCard` — a hover-active surface that bridges editorial restraint with tactile feedback. Each card carries a project icon (SVG path, stroked at 1.5px in the project's signature hue), a wordmark-style name, a tagline in the project's color, a 2-line clamped description, and a category label with a directional arrow that translates 4px on hover. The cursor-glow lives behind the content layer and uses the project's gradient color at 12% alpha. The tilt action gives a 4° max parallax. Together they produce depth from *interaction*, not decoration.

### List Row

A horizontal list-item with the hover-revealed 3px copper accent bar (`list-row::before`). The bar is set as `--row-accent` so individual rows can tint their accent to match a project color while staying within the copper hue family. See the side-stripe caveat in Elevation.

## 6. Do's and Don'ts

### Do:

- **Do** use Tally Copper for primary buttons, focus rings, the wordmark diagonal, and the list-row hover accent. Nothing else.
- **Do** keep neutrals warm. Every gray-feeling color in the system is workshop-stone or warm, never a true-gray.
- **Do** use Newsreader for the wordmark only. Set in 500 weight, tracking -0.01em.
- **Do** cap body line length at 65–75ch. Reading copy on wide viewports gets a `max-width`, not a stretch.
- **Do** use motion to convey state. `btn-press` for buttons, cursor-glow + tilt for ProjectCard. 150–250ms with `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-quint).
- **Do** honor `prefers-reduced-motion: reduce`. The global rule in `app.css:113` collapses everything; any new animation must work inside that rule, not against it.
- **Do** write copy in past or present tense. "Built." "Ships." "Survived." Never "will build" or "soon to launch."

### Don't:

- **Don't** build it like generic SaaS gradient hell. No subtle gradients on backgrounds. No glassmorphic cards. No animated mesh backgrounds. No hero-metric blocks ("10M+ users, 99.99% uptime"). No equal-card-grid product showcases.
- **Don't** make it AI-startup neon-on-black. No dark canvas with electric-blue or lime-green glow. No terminal-styled hero. No monospace as a vibe choice. Aylith builds AI tools; it is not styled as one.
- **Don't** make it enterprise B2B navy-and-gray. No navy headers. No stock-photo executives. No "Trusted by" logo walls. No corporate-confidence-by-default.
- **Don't** make it Web3 / crypto. No saturated purples. No generative-art heroes. No animated orbs. No $TOKEN energy.
- **Don't** use `border-left` or `border-right` greater than 1px as a permanent colored accent. The list-row hover-stripe is the SINGLE exception; replicating it anywhere else (cards, callouts, alerts, blockquotes) is prohibited.
- **Don't** apply `background-clip: text` with a gradient. Headlines are solid color. Emphasis comes from weight and size, not gradient text.
- **Don't** nest cards. Surfaces with rounded corners don't go inside other surfaces with rounded corners.
- **Don't** ship a button without explicit `:hover`, `:focus-visible`, and `:active` states. Half-finished interactive components are how the system loses its quiet confidence.
- **Don't** add a second accent color "for variety." The One Accent Rule is load-bearing — adding a second color collapses the whole system into generic-SaaS territory.
- **Don't** write headings in future tense. "Coming soon." "Get started today." Both are the tell that the work isn't done.
- **Don't** animate the tally-mark logo. It has one job: be recognizable. Animating it dilutes that job.
- **Don't** use em dashes in any user-facing copy. Aylith's voice uses commas, periods, semicolons, parentheses. Em dashes are out of brand by decree.
