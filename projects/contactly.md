---
name: Contactly
tagline: A small CRM for contacts and dated follow-ups
description: >-
  A lightweight personal CRM for the relationships that matter — keep track of
  people, notes, and follow-ups without the weight of a sales platform.
category: productivity
features:
  - 'A simple record per person, not a sales pipeline'
  - Notes and context that travel with each contact
  - Dated follow-ups to review in the app
  - 'Record a call, meeting, email, or note on a contact'
  - 'Search by name, email, or company'
targetUser: People who want to stay in touch intentionally without running a sales CRM
featured: false
icon: >-
  M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125
  0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15
  19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331
  0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12
  6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625
  0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z
gradientFrom: '#0284c7'
gradientTo: '#38bdf8'
repoUrl: 'https://github.com/aylith-labs/contactly'
sourcePublic: false
order: 21
onboarding:
  access: restricted
  prerequisites:
    - >-
      Run the Bun API and SvelteKit web workspaces from source with a local
      SQLite database
    - Keep the unauthenticated API inside a trusted local or deployment boundary
  limitations:
    - No public Contactly host or account service has been verified
    - >-
      The API has no login or per-owner read and write checks; a client-supplied
      user ID does not protect records
    - 'Reminders are dated items to review in the app, not external notifications'
---

## Vision

Contactly keeps a record per person, notes that give it context, and dated follow-ups to review inside the app. It is a small personal CRM for someone who wants a place to remember a conversation and plan the next one.

The [public source overview](https://aylith-labs.github.io/contactly/) is a static explanation of that workflow. It does not host the Contactly application, contacts, sign-in, or reminder delivery.

## The Problem

Real CRMs are built for sales teams and feel like it: pipelines, stages, deal sizes, overhead. For a person who just wants to remember context and follow up, that machinery is friction, so they fall back to memory — and memory quietly drops people.

## Key Differentiators

- **Personal, not sales**: people and context, not pipelines and deals.
- **Small workflow**: add a contact, log an interaction, and set a dated follow-up without a sales pipeline.
- **Dated follow-ups**: review upcoming and overdue reminders in the app.
- **Local storage by default**: a local SQLite file is the default; remote libSQL is optional. The API currently has no authentication or owner scoping, so access must be limited by the deployment boundary.
