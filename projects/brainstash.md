---
name: Brainstash
tagline: Find the note you meant to keep
description: >-
  A locally run knowledge base for notes and references. Capture an entry with
  categories, tags, and a source URL, then retrieve it through title and content
  search or revisit an earlier entry snapshot.
category: productivity
features:
  - Capture notes and references with source URLs
  - Organize entries with categories and tags
  - Search entry titles and content with SQLite FTS5
  - Review and restore earlier entry content
targetUser: 'Developers who want to retrieve their own notes, TILs, and references'
featured: false
icon: >-
  M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0
  1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3
  0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493
  1.509 1.333 1.509 2.316V18
gradientFrom: '#db2777'
gradientTo: '#f9a8d4'
repoUrl: 'https://github.com/aylith-labs/brainstash'
order: 18
onboarding:
  access: restricted
  prerequisites:
    - Run the Bun API and SvelteKit web workspaces from source with local SQLite
    - Set an AUTH_SECRET and create an account on that instance
  limitations:
    - No hosted Brainstash origin or public account service has been verified
    - >-
      Media files are currently served by ID without authentication; do not
      treat uploads as private
    - >-
      Search filters are applied after FTS pagination, so filtered counts and
      pages can be incomplete
---

## Vision

Brainstash stores notes and references as entries with source URLs, categories, tags, and version history. Its SQLite FTS5 search retrieves matching titles and content; filtered result counts and pages have a known pagination limit.

The [public source overview](https://aylith-labs.github.io/brainstash/) introduces the workflow. It is a static page, not a hosted knowledge base or sign-in service.

## The Problem

Most note tools are excellent at swallowing information and terrible at returning it. Entries go in, structure never emerges, and the search that would surface the right note never quite works. The knowledge exists; the ability to use it does not.

## Key Differentiators

- **Retrieval-first**: use title and content search to find saved entries.
- **Structured capture**: entries can carry categories, tags, and source URLs.
- **Edit history**: earlier title and content snapshots can be browsed and restored.

## Current boundaries

- Entry and category routes use an authenticated account, including an owner check for newly selected categories. Older cross-account category associations are not repaired by that guard.
- Uploaded media is served by a public-by-ID route, and deleting an entry can leave its media available. Uploaded files should not be described as private.
- Source URLs are stored and shown, but the current editor cannot clear an existing source URL by emptying the field.
