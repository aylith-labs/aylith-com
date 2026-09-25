---
name: shefrd
tagline: Run several coding agents at once and see which one is stuck
description: >-
  A terminal workspace manager for AI coding agents. It organises terminals into
  workspaces, tabs and panes, recognises the agents running inside them, reports
  what each one is doing, and exposes the whole session over a CLI and a JSON
  socket so an agent can inspect and drive its neighbours.
category: developer-tools
features:
  - 'Every agent''s state at a glance across workspaces, tabs and panes'
  - Hover a match in pane output and a command's result floats beside it
  - 'Named TOML setups that build a whole workspace, agents and prompts included'
  - 'A CLI and JSON socket API, so agents can drive their own neighbours'
  - 'Detection for 19 agent CLIs, updatable without a release'
targetUser: >-
  Developers running several AI coding agents in parallel who keep losing track
  of which one is blocked, which finished, and what any of them changed
featured: false
icon: M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h9
gradientFrom: '#232830'
gradientTo: '#e8a33d'
repoUrl: 'https://github.com/aylith-labs/shefrd'
---

## Vision

Running one coding agent is a conversation. Running six is an operations problem, and terminal
tooling was not built for it. You lose the thread of which agent is waiting on you, which has
been idle for an hour because it finished, and which is quietly burning tokens down a path you
would have stopped.

shefrd treats that as the actual product. Agents are not tabs you remember to check; they have
states, and the interface is built around showing them. Something blocked and something done
look different from across the room, and getting from a status to the pane that explains it is
one movement.

## Where it came from

shefrd is a hard fork of [herdr](https://github.com/herdrdev/herdr), Apache-2.0, maintained as a
thin patch layer on upstream so improvements keep flowing in. Every herdr plugin runs here
unmodified, and that compatibility is a hard requirement rather than a goal: the socket API, the
manifest format, the environment contract and the config directory are all deliberately
untouched.

## Where it is going

Two things distinguish it from upstream.

The first is that features are **built in and reviewed**, not installed. The plugin ecosystem
solved real problems, and it solved them by asking every user to trust a stranger's code with
their terminal, their agents and their repositories. shefrd absorbs those capabilities as
first-class features, each one reviewed by several independent agents before it ships, so
turning one on is a toggle rather than a supply-chain decision. A feature you leave off costs
nothing at all, which is the part that has to be true for this to be the better deal.

The second is the renderer. Every ceiling this fork has hit is the same ceiling: it is a guest
inside somebody else's terminal. Image previews need a graphics protocol the host may not
implement. A real browser view inside a pane needs pixels the multiplexer cannot draw. Owning
the renderer dissolves all of it at once, and that is what the desktop app is for.
