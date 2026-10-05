---
name: Shiptron
tagline: 'Plan, build, and review in an isolated worktree'
description: >-
  A source-run Bun and Claude CLI framework for drafting a spec, planning work,
  building in an isolated Git worktree, and reviewing the result before an
  explicit merge or discard. Its local dashboard shows the saved artifacts.
category: ai-infrastructure
features:
  - Six-phase spec pipeline and sequential agent build in an isolated worktree
  - Reviewer and fixer QA loop with an optional approval checkpoint
  - 'CLI and dashboard for inspecting specs, plans, QA reports, and diffs'
  - Stable spec artifact IDs for local dashboard review of pipeline records
targetUser: Developers evaluating a local agent workflow in a repository they control
featured: false
icon: >-
  M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25
  12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09
  3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18
  9.75l-.259-1.035a3.375 3.375 0 0 0-2.456-2.456L14.25 6l1.035-.259a3.375 3.375
  0 0 0 2.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75
  6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z
gradientFrom: '#4338ca'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/shiptron'
sourcePublic: false
order: 15
onboarding:
  access: restricted
  prerequisites:
    - Obtain source access and install Bun and an authenticated Claude CLI
    - Run the CLI or local dashboard against a Git project you control
    - Review the generated diff and choose merge or discard explicitly
  limitations:
    - >-
      No public package, hosted account, or standalone installation has been
      verified
    - 'No release agent, tracker integration, or CI plugin is implemented'
    - >-
      Agent builds invoke Claude CLI and may incur third-party usage; they edit
      a worktree
    - >-
      The dashboard has no built-in authentication and defaults to a 0.0.0.0
      bind; bind to loopback or isolate a trusted network before exposing
      project files or terminals
    - Saved spec artifacts are not durable per-attempt build-run records
---

## Vision

Shiptron coordinates a local spec, plan, build, QA, and review workflow. It writes spec state to the target repository's `.shiptron/` directory and builds in an isolated Git worktree. A human can inspect the artifacts and explicitly merge or discard the worktree. It does not publish or deploy a release.

## The Problem

Planning, implementation, and QA produce different artifacts. Shiptron keeps them together under a spec ID so a developer can review progress and the resulting changes in one place.

## Key Differentiators

- **Local workflow**: agents create a spec and plan, build in a worktree, and run a reviewer and fixer QA loop.
- **Reviewable artifacts**: the dashboard can read saved spec, plan, metadata, QA, project index, requirements, and context files by spec-scoped artifact ID.
- **Explicit handoff**: an optional approval gate and separate merge or discard commands keep the final change reviewable.
