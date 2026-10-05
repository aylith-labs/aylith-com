---
name: Augur
tagline: Test an AI task with your model
description: >-
  Analyze a website or described task with a selected AI model. Get a
  feasibility verdict, implementation plans, and an analysis cost estimate when
  usage and model pricing are available.
category: developer-tools
features:
  - Feasibility verdict from a selected AI model
  - Implementation plans with estimated monthly cost ranges
  - >-
    Provider-reported analysis tokens and estimated list-price cost when
    available
  - Select from configured providers or connect a custom endpoint
targetUser: Builders exploring whether a selected AI model could help with a task
featured: false
icon: >-
  M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0
  8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12
  19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z
gradientFrom: '#7c3aed'
gradientTo: '#c4b5fd'
repoUrl: 'https://github.com/aylith-labs/augur'
sourcePublic: false
order: 16
onboarding:
  access: restricted
  prerequisites:
    - >-
      Build and run the source with Node.js 22 or newer and a trusted local file
      store
    - >-
      Set VITE_SKIP_AUTH=true at build time for local access, then configure one
      provider
  limitations:
    - No hosted Augur origin or public install path has been verified
    - Sign-in does not scope the analysis and feedback API to a user
    - Do not submit sensitive tasks to a shared public deployment
---

## Vision

Describe a task or enter a website URL, choose a configured model, and get a feasibility verdict with implementation options. Augur shows provider-reported token usage when available and calculates an estimated analysis cost from configured model prices. Plan cost ranges are estimates for hypothetical monthly use.

## The Problem

It can be hard to decide whether an AI workflow is plausible before building it. Augur gives an initial verdict and concrete plans for a task supplied by the user.

## Current capabilities

- **Selectable provider**: runs an analysis on one configured model at a time.
- **Usage provenance**: separates provider-reported tokens from a cost estimate based on maintained prices. Missing usage is shown as unavailable.
- **Actionable plans**: presents generated implementation steps and estimated monthly cost ranges.

## Current boundaries

- One selected model runs per analysis; Augur does not compare providers side by side or recommend the best model across them.
- Cost is an estimate from configured prices, not a provider bill. If usage or model price is unavailable, no analysis cost is shown.
- Results and feedback live in a global single-user store. Analysis routes are not scoped to an authenticated owner; use a trusted local deployment, not a shared public service, for sensitive tasks.
- The default store is file-backed. The PostgreSQL schema exists, but the runtime adapter is not connected.
