---
name: Stith
tagline: The control plane for every coding agent on your machine
description: >-
  A always-on operator console for AI coding agents. It ingests the full
  lifecycle-hook stream from every session across every config root and both
  host environments, so it can say what each agent is doing, which account it is
  spending, and which repository it holds — then act on that: switch accounts
  before a quota runs out, queue two sessions off the same repo instead of
  letting them collide, and reach a session from a browser, a terminal, or a
  Stream Deck key.
category: developer-tools
features:
  - 'Live fleet view fed by 29 real lifecycle hook events, not screen-scraping'
  - >-
    Multi-harness — a curated registry of coding agents, detected by binary
    rather than assumed
  - >-
    Account and quota management with auto-switching before a session hits its
    limit
  - Per-repository claim queue that stops two agents writing the same tree
  - >-
    Two surfaces over one daemon — web app and Rust TUI — plus a Stream Deck
    plugin shipped separately as aylith-labs/stith-deck
  - Full-text search across every transcript in every config root
targetUser: >-
  Anyone running many coding-agent sessions at once across several accounts and
  machines, who has lost track of which one needs them
featured: false
icon: >-
  M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303
  0-3.182C13.536 12.219 12.768 12 12 12c-.725
  0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006
  0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z
gradientFrom: '#6366f1'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/stith'
---

## Why

One agent is easy to watch. A dozen, spread across config roots, accounts and two host environments,
is not — and the failure is quiet: a session sits waiting on a question nobody sees, an account burns
its weekly quota on a background job, two agents rewrite the same file.

Stith is the layer above them. It never runs the agent and never becomes the terminal it lives in;
it watches, governs and coordinates whatever is already running, including the sessions it did not
start. That is deliberate — a control plane that only governed what it launched would cover strictly
less than one that reads the hooks every session emits anyway.
