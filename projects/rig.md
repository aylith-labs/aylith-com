---
name: Rig
tagline: An agent-aware terminal — every session flies its status
description: >-
  A terminal workspace with an agent-status engine at its core: it knows what
  the AI agent in each tab is doing and shows you, live, which session is
  waiting on you and why.
category: developer-tools
features:
  - Vertical tab rail where each session flies its live status
  - Distinguishes a permission prompt from a question from an idle nudge
  - Coalesces the duplicate event bursts agents emit for one prompt
  - 'Session id, title, and CPU/RAM on every tab'
  - 'Light, dark, and system themes with motion that respects reduced-motion'
  - 'Cross-platform desktop app (Windows, macOS, Linux) with auto-update'
targetUser: >-
  Anyone running several coding agents at once who keeps losing track of which
  session needs them
featured: false
icon: >-
  M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25
  0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25z
gradientFrom: '#2f6bff'
gradientTo: '#00e0ff'
repoUrl: 'https://github.com/aylith-labs/rig'
---

## Vision

Running several coding agents at once, the bottleneck stops being the work and becomes
attention: which of these twelve tabs is blocked on me, and for what? Rig answers that from
the tab rail. Agent status is not a plugin bolted onto a terminal — it is the thing the
terminal is built around, so the answer is always on screen instead of one tab-switch away.

## The Problem

A terminal treats every tab as an anonymous shell. An agent working for four minutes and an
agent that stopped ninety seconds ago to ask permission look identical until you go look.
Existing agent-status add-ons flatten every kind of interruption into one ambiguous "needs
attention" signal, which trains you to ignore it — the one state that actually blocks
progress is indistinguishable from a nudge.

## Key Differentiators

- **Status engine at the core**: a pure, framework-agnostic engine ingests agent hook events
  and owns the status model; the UI is built around it, not the other way round.
- **Interruptions are not interchangeable**: a permission request, a questionnaire, and an
  idle timeout are distinct states, because they demand different things from you.
- **Quiet about bursts**: agents emit several events for a single prompt; the engine coalesces
  them so one prompt is one signal.
- **Session metadata that means something**: session id, title, and live CPU/RAM per tab, so a
  runaway agent is visible before it is expensive.
- **Small and native**: Tauri 2 with a Rust core and the system webview, not a bundled browser.
