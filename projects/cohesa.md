---
name: Cohesa
tagline: 'Chat, issues, documents, and connected project context in one workspace'
description: >-
  A self-hosted workplace application for team chat, issues, documents, and
  search. An opt-in native suite mode also shows selected project context from
  explicitly configured source adapters.
category: productivity
features:
  - 'Team chat, issue tracking, documents, and workspace search'
  - >-
    Selected project context from configured source adapters in native suite
    mode
  - Self-hosted local development stack
targetUser: >-
  Engineering teams evaluating a self-hosted home for communication and project
  work
featured: false
icon: >-
  M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75
  12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25
  6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0
  0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z
gradientFrom: '#0d9488'
gradientTo: '#5eead4'
repoUrl: 'https://github.com/aylith-labs/cohesa'
sourcePublic: false
order: 12
onboarding:
  access: restricted
  prerequisites:
    - 'Local infrastructure, database migrations, and OIDC configuration'
    - >-
      Explicit BFF and source-grant configuration for native suite project
      context
  limitations:
    - >-
      Native suite mode currently exposes the selected-project surface; legacy
      chat, issues, and documents use a separate session path
    - >-
      Local fixtures and automated tests do not establish a ready owner
      installation or full source coverage
---

## Vision

Engineering teams move between conversations, issues, documents, and project decisions. Cohesa brings chat, issues, documents, and search into one self-hosted application. An opt-in native suite view can display the selected project and its source-owned context when its session and source grants are configured.

## The Problem

Moving among separate tools makes it harder to keep a project's conversation and source decisions together. Cohesa's current implementation offers a common workspace application and a bounded selected-project context path.

## Key Differentiators

- **Workspace tools together**: chat, issues, documents, and search have application surfaces backed by Cohesa's services.
- **Explicit selected-project context**: the native suite path resolves a configured binding under the current session and displays source-owned projections. A binding is a selector, not an access grant.
- **Current limit**: native suite mode does not yet make every legacy surface available under the same session. A package mapping alone does not establish an active cross-app entity graph.
