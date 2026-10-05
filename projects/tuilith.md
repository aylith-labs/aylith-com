---
name: tuilith
tagline: Reusable terminal UI components with declared provenance
description: >-
  Reusable ratatui components for Rust terminal applications, with a generated
  provenance record and dependency checks in CI. Optional features isolate
  components that bring extra dependencies.
category: developer-tools
features:
  - Provenance declarations rendered into a diff-checked component record
  - 'Picker, tabs, scroll area, overlays and other reusable terminal UI pieces'
  - Optional background detection and JSON document tree features
  - CI checks with cargo-vet and cargo-deny
targetUser: >-
  Rust developers building terminal applications who want reusable components
  with stated origins
featured: false
icon: >-
  M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303
  0-3.182C13.536 12.219 12.768 12 12 12c-.725
  0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006
  0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z
gradientFrom: '#6366f1'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/tuilith'
sourcePublic: true
websiteUrl: 'https://tuilith.aylith.com/'
---

## Why

Rust terminal applications often need the same small interaction and layout pieces. Tuilith gathers
these pieces behind a ratatui API and records the stated origin of each component.

## What it is for

Use it as a dependency in a Rust terminal application. Read `PROVENANCE.md` for each component's
declared origin and lineage. The repository's tests check the record against the declarations and
the repository's dependency metadata; they do not establish a complete external audit.
