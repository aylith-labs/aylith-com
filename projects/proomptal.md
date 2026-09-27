---
name: Proomptal
tagline: 'Draft, organize, and retrieve prompts from a local library'
description: >-
  A local SQLite prompt library with a web UI and CLI for creating, finding, and
  copying reusable prompts. Installation into AI tools is planned.
category: ai-infrastructure
features:
  - Create and edit prompts with detected placeholder names
  - 'Organize prompts with tags, favorites, groups, and API collections'
  - Search prompt fields by substring and copy bodies in the web UI
  - 'Add, list, search, and show prompts with the local CLI'
targetUser: People who reuse prompts in coding tools and want a local place to find them
featured: false
icon: >-
  M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0
  0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0
  0 0 6 20.25Z
gradientFrom: '#0ea5e9'
gradientTo: '#7dd3fc'
repoUrl: 'https://github.com/aylith-labs/proomptal'
order: 24
onboarding:
  access: restricted
  prerequisites:
    - >-
      Run the Bun server and SvelteKit web app from source against a local
      SQLite database
    - >-
      Keep the unauthenticated API on a trusted local machine and review its
      network binding
  limitations:
    - >-
      The public source overview is static; no hosted prompt app, account
      service, or packaged install is available
    - >-
      Prompt CRUD and search routes have no user authentication; CORS is not an
      access control
    - >-
      Placeholder names are detected but not substituted when copying or
      printing a prompt
    - >-
      AI-tool installation, prompt revisions, semantic search, and cross-device
      sync are not implemented
---

## What works today

The [public source overview](https://aylith-labs.github.io/proomptal/) explains the local workflow. It does not host the prompt library, its SQLite store, an account, or AI-tool installation.

Proomptal stores prompts in SQLite and exposes create, read, update, delete, and substring search through a local API. Its web UI can browse, edit, and copy prompt bodies. The CLI can add, list, search, and print a saved prompt body by ID. Tags, favorites, and groups are stored with prompts; collections can be created through the API.

## Current limits

Placeholder names are detected, but variable substitution is not implemented. Prompt IDs are local ULIDs without revision identifiers or version history. Installation into Claude Code, Cursor, or other tools, import from Agentry, semantic search, and cross-device sync are roadmap work. No installation receipt or source provenance is stored.

The local API has no account authentication. Run it only in a trusted environment and verify its network exposure before storing sensitive prompts. CORS only limits participating browsers; it does not protect the API from other clients.
