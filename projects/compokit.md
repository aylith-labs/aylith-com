---
name: Compokit
tagline: AI design-to-code that speaks your component language
description: >-
  A planned design-to-code workflow using your existing component library and
  design tokens. Generated output still needs human review and validation.
category: design-tools
features:
  - Ingests your component library and design tokens
  - Generates code using your actual components
  - Planned incremental diffs when designs update
  - Planned accessibility checks and test assistance; not a compliance guarantee
  - >-
    Component scanning for React, Vue and Svelte; other framework support is
    unverified
targetUser: Design-heavy product teams with established component libraries
featured: false
icon: >-
  M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0
  008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0
  003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995
  0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996
  15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42
gradientFrom: '#ec4899'
gradientTo: '#f472b6'
repoUrl: 'https://github.com/aylith-labs/compokit'
order: 1
onboarding:
  access: restricted
  prerequisites:
    - >-
      Authorized access to the private source repository is required for
      development setup
  limitations:
    - No public installation or hosted-service access route has been verified
    - >-
      Public product notes below describe the direction, not a release or access
      entitlement
---

## Vision

Compokit explores generation constrained by an existing component vocabulary. The goal is code that fits the host design system. First-pass review acceptance and reduced rework have not been established by a reproducible evaluation.

## The Problem

Translating a design into an existing component library can involve manual matching and cleanup. How much work this saves depends on the design, library and task; this entry does not establish a competitor-wide rework rate.

## Intended direction

- **Your components, not generic HTML**: Scan and match existing components and tokens; model training is not established
- **Incremental diffs (planned)**: Explore a diff against existing code when a design changes, rather than promising complete regeneration support
- **Quality checks**: Accessibility checks and test assistance do not establish compliance, correctness or automatic review approval

## Evidence still needed

Use a fixed, versioned set of designs and component libraries. Record generated output, failed cases, manual edits, review acceptance and accessibility checks with a stated rubric. Compare matched baselines and repeated runs before publishing completion percentages or time savings. No such benchmark is supplied by this catalog entry.
