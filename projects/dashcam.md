---
name: Dashcam
tagline: Review recorded Claude Code sessions on a local timeline
description: >-
  A local flight recorder for Claude Code sessions. It collects hook and
  transcript events, shows them on a timeline, and can capture screenshots when
  a reachable development server and Playwright are available.
category: developer-tools
features:
  - Browse recorded sessions and inspect their event timelines
  - >-
    Capture screenshots after configured tool events when a dev server is
    reachable
  - Inspect captured files and retrieve a capture by session and ID
  - Import decisions from Stith with an explicit local session binding
  - Export session data as JSON or a text-only HTML report
targetUser: Developers using Claude Code who need to inspect a recorded local session
featured: false
icon: >-
  m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0
  1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0
  0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z
gradientFrom: '#dc2626'
gradientTo: '#f87171'
repoUrl: 'https://github.com/aylith-labs/dashcam'
order: 25
---

## Vision

Dashcam collects Claude Code hooks and JSONL transcript events into a local SQLite database. Its dashboard shows recorded sessions and their event timelines. Screenshot capture depends on Playwright and a reachable development server. Decision import from Stith requires an explicit local session binding. Video recording is deferred.

## The Problem

Developers running unattended sessions need a way to inspect recorded events and available screenshots when they return. A git diff alone does not show the sequence of agent activity.

## Key Differentiators

- **Local event timeline**: inspect captured session activity in order.
- **Conditional screenshots**: review images saved when capture prerequisites are met.
- **Exact capture reference**: retrieve a capture record within its owning session by ID.
- **Opt-in Stith decisions**: import a verified source snapshot and save a review backlink.
