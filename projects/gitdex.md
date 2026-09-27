---
name: Gitdex
tagline: See the repositories your GitHub token can reach
description: >-
  A local GitHub repository inventory with source filtering, automatic
  categories, health scores, and optional commit and release history across
  discovered accounts.
category: developer-tools
features:
  - Inventory of repositories from discovered user and organization sources
  - Filter the inventory to one source account
  - Automatic naming and topic categories; optional stack detection
  - Configurable health and staleness scoring per repository
  - Optional commit and release history after deep analysis
targetUser: >-
  Engineers managing repositories across a GitHub user and organizations who
  need a source-scoped local inventory.
featured: false
icon: M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5
gradientFrom: '#475569'
gradientTo: '#94a3b8'
repoUrl: 'https://github.com/aylith-labs/gitdex'
order: 19
onboarding:
  access: restricted
  prerequisites:
    - Run the Encore API and SolidJS frontend locally with PostgreSQL
    - >-
      Provide a GitHub classic personal access token with repo and read:org
      scopes
  limitations:
    - >-
      Inventory covers repositories visible to the supplied token after source
      discovery and sync
    - Deep stack and commit history require an optional per-repository analysis
    - >-
      The token is stored in the local browser storage; use a trusted browser
      and machine
    - There is no hosted Gitdex account or verified public app deployment
---

## Vision

Once you cross a few dozen repositories, it becomes harder to see what needs attention. Gitdex gathers repositories visible to a supplied GitHub token from a discovered user and its organizations. The local inventory supports source filtering, categories, health scoring, and manual triage. Commit and release history requires optional deep analysis.

## The Problem

Repositories accumulate across a personal account and organizations. Gitdex brings the sources the token can access into one local view, then adds configurable signals for triage. A source filter is not a guarantee of complete GitHub estate coverage; the result depends on token access, discovery and successful sync.

## Key Differentiators

- **Source view**: browse all synchronized repositories or one discovered source account.
- **Scored, not just listed**: configurable health and staleness signals.
- **Categorized automatically**: names and topics provide categories; deep analysis can detect stacks.
- **History on demand**: deep analysis can collect commits and releases for a repository.

## Current boundary

Gitdex runs locally from a restricted source checkout and does not provide a hosted account. The browser validates a GitHub token, stores it in local storage, and sends it to the local API as a bearer credential. The API uses that token for GitHub requests. Source selection in the inventory is available in current source; it has not been verified as a separately deployed public app. Repository identity across renames/transfers and incomplete metadata on sync failures remain product gaps.
