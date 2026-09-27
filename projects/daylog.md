---
name: Daylog
tagline: A day worth keeping
description: >-
  A daily journal with one entry per date, optional writing prompts, mood and
  energy ratings, habit check-ins, and a month calendar. Its API and SQLite
  database are intended for a trusted local setup.
category: wellness
features:
  - One journal entry per date with an optional title and tags
  - Habit check-ins with current and longest streaks
  - Month calendar showing days with entries
  - Gentle prompts when you want a starting point
  - Local SQLite storage by default
targetUser: People who want to keep a journal and have always struggled to keep it going
featured: false
icon: >-
  M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25
  0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21
  18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5
gradientFrom: '#0d9488'
gradientTo: '#5eead4'
repoUrl: 'https://github.com/aylith-labs/daylog'
order: 20
onboarding:
  access: restricted
  prerequisites:
    - Run the API and web app locally with Bun and a SQLite database
  limitations:
    - >-
      The API has no authentication or owner isolation; use it only in a trusted
      local environment
    - >-
      The API listens on all network interfaces by default; restrict network
      access before storing personal entries
---

## Vision

Daylog makes the daily entry and the return visit visible. Write about a date, add mood, energy or focus ratings when useful, and check in on a habit. The calendar and streak history help you look back; neither measures the quality of a day.

## The Problem

The blank page can be hard to start, and a long history can be hard to browse. Daylog offers optional writing prompts without inserting text, while entries, tags, search, metrics and a calendar provide ways back to what was recorded.

## Key Differentiators

- **One date at a time**: save an entry with an optional title and tags; view a prompt when you want a starting point.
- **Visible check-ins**: habit cards show current and longest runs; the month calendar marks recorded days.
- **Separate reflection signals**: mood, energy, focus and notes can be saved independently from journal text.
- **Local access boundary**: SQLite is the default store, but the separate API has no authentication or owner isolation and listens on all interfaces by default. Restrict network access before storing personal entries.

## Current boundary

This is a single-user local setup, not a hosted private account. The public light/dark gallery shows a recorded editor before optional prompts were added; it is product footage, not a current live session or a promise of deployed access. A safe internet-facing deployment needs an authority model and owner-scoped data access first.
