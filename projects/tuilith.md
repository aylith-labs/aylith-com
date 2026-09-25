---
name: tuilith
tagline: Audited terminal-UI components for Rust
description: >-
  A curated component library for ratatui where every component records where it
  came from — a re-exported wrapper, a tracked fork that can still take
  upstream's fixes, a rewrite that owes an idea to a project it shares no code
  with, or something first written here. The dependency set is audited per
  version-delta with cargo-vet rather than merely pinned, reviewed weekly, so an
  upgrade is a reviewed change rather than a version bump nobody read.
category: developer-tools
features:
  - >-
    Provenance declared beside each component and published as a generated,
    diff-checked record
  - >-
    Five tests holding a lineage claim to its promises, including that vendored
    code keeps its licence
  - Weekly dependency upgrade gated on cargo-vet certification of every delta
  - 'Licence allowlist built from the real graph, with copyleft absent by design'
targetUser: >-
  Rust developers building terminal applications who want components they can
  audit
featured: false
icon: >-
  M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303
  0-3.182C13.536 12.219 12.768 12 12 12c-.725
  0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006
  0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z
gradientFrom: '#6366f1'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/tuilith'
---

## Why

Two of the lab's Rust TUIs wanted the same components, and a third would have wanted them again. The
generic widgets already exist on crates.io and are better maintained there than they would be here —
what does not exist is a curated set you can *audit*, with each piece honest about whose code it is.

## What it is for

Depend on it from any terminal app. Read `PROVENANCE.md` to see, per component, whether you are looking
at someone else's code, someone else's code with ours on top, or an independent implementation — and
therefore whether an upstream fix can reach you.
