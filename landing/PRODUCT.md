# Aylith

## Register

brand

## Users

Founders and technical builders who already know what they want to build, and want to see whether the lab behind these tools is the kind of place they'd take seriously. Also adjacent practitioners — designers evaluating Compokit, analysts evaluating Plainbase, engineers evaluating GitHerald — who land here from a specific product page and need the umbrella story to make sense in 30 seconds without insulting their intelligence.

Context: usually a focused session on a desktop browser, not a casual scroll. Visitors arrive with a hypothesis about whether aylith is real or theater. The site has one job: answer that.

## Product Purpose

Aylith.com is the public face of a portfolio lab. It explains how the lab works (read the signal → build the tool → ship in days), shows the receipts (138+ launches analyzed, ten products built, public from day one), and lets each tool stand on its own from the index.

The page is not a brochure for any single tool — each tool has its own product surface elsewhere. It's the connective tissue: it makes the portfolio legible as a coherent practice instead of a random list of side projects.

Success looks like a visitor who reaches the footer with one of two reactions: "I want to try one of these" (clicks a product) or "I want to talk to the people behind this" (no current CTA — that gap may be intentional). Failure is "this is just another founder's personal site."

## Brand Personality

**Quietly confident.** Lab-as-craft. The work speaks; the page just gets out of the way. Three-word capture: *quietly confident, considered.* Not loud, not staccato-aggressive — the warm-stone palette, Newsreader wordmark, and the way the copy refuses superlatives all serve a calm conviction. The aesthetic equivalent of a workshop with hand tools laid out in order: tools that have been used.

Voice: short sentences, declarative. Heavy periods. No em dashes — commas and periods do the work. Never "join us," "contact sales," or any aspirational verb in the future tense. Past-and-present, evidence-based: *built, ships, survived, analyzed*.

## Anti-references

This is explicitly NOT:

- **Generic SaaS gradient hell.** The Stripe/Linear/Vercel mid-2020s aesthetic of subtle gradients, glassmorphic cards, animated mesh backgrounds, hero-metric blocks ("10M+ users, 99.99% uptime"). Equal-card-grid product showcases. Gradient text on headlines. Already implicit in the warm-stone palette but worth ruling out by name.
- **AI-startup neon-on-black.** OpenAI / Anthropic / xAI-adjacent: dark canvas with lime-green or electric-blue glow, monospace tech vibes, terminal-shaped hero sections. Aylith builds AI tools but is not styled as one — the lab posture is craft, not lab-coat science-fiction.
- **Enterprise B2B navy-and-gray.** Stock photography executives, navy headers, IBM-style corporate confidence, "Trusted by" logo walls. Antithesis of the "ship in days" velocity story.
- **Web3 / crypto neon-and-gradient.** Saturated purples, generative-art heroes, animated orbs, $TOKEN energy.

These four lanes cover the great majority of AI/tools sites in 2026. The default reflex for any of them is wrong here.

## Design Principles

1. **Receipts over claims.** Every assertion on the page should be testable. "138+ launches analyzed" beats "extensively researched." "Ten products built" beats "robust portfolio." If a sentence could be on any startup's about page, cut it.

2. **Restraint is the brand.** The site signals confidence by refusing to oversell. No animations that exist only to delight; motion conveys state or hierarchy or nothing. No background image unless it's load-bearing. Whitespace is a feature.

3. **Each tool earns its own listing.** The portfolio grid is not a uniform card array — each tool gets enough room to communicate its actual character (icon, one-line, status). Resist the urge to make them look identical for visual consistency; consistency lives in the chrome, not the contents.

4. **The wordmark and the tally-mark are sacred.** Newsreader serif for the wordmark, never substituted. The four-bars-plus-copper-diagonal mark is a tally, not a logo to be jazzed up. Don't animate the mark itself. Don't recolor it for theming beyond light/dark stroke inversion.

5. **Anti-aspirational copy.** Past and present tense, never future. "Built" not "will build." "Ships in days" not "promises rapid delivery." Future-tense marketing language is the tell that someone hasn't done the work yet; aylith has, and the copy needs to feel that way.

## Accessibility & Inclusion

- WCAG 2.2 AA as the floor; the copper-on-warm-stone palette should clear contrast on all body copy and interactive elements in both light and dark. Verify before shipping any new section.
- `prefers-reduced-motion: reduce` already collapses the reveal / tilt / draw / countup actions globally (`src/app.css:113`). Any new animated component MUST honor the same. No motion-without-fallback.
- The tally-mark logo conveys identity through stroke pattern + color contrast, not color alone — readable to color-blind users.
- Avoid color-only state encoding (no "green = good, red = bad" without an icon or label).
- Keyboard nav must be a first-class path through the page. Every interactive element has a visible focus state in the copper accent.
- Body line length capped at 65–75ch (per shared design laws); reading copy should not stretch wall-to-wall on wide viewports.

---

*Inferences I made without an interview round and that you should sanity-check on the next pass:*
- The "no future-tense copy" rule is my reading of the existing copy, not a stated principle.
- The "no CTA in the footer" gap may or may not be intentional — flagged in Product Purpose so the next design pass can decide.
- Positive references (aesthetic lane) are deliberately not listed here. Candidates that fit the warm-stone + Newsreader + restrained-confidence read: *Are.na, Pentagram, Studio Feixen, Tom Sachs Studios, Frank Chimero's site, The Browser Company's marketing pages.* Run `/impeccable teach` again or update this file once you confirm or replace these.
