---
name: Apiflip
tagline: Turn webpages into structured JSON
description: >-
  Describe data on a webpage and extract typed JSON with a reusable schema.
  Selector changes can trigger a reviewed or automatic remap.
category: developer-tools
features:
  - Natural-language schema generation from rendered webpages
  - Typed JSON with confidence and schema-version metadata
  - Selector remapping with confidence-based review
  - API-key quotas and rate limiting
  - On-demand reruns with change-only signed webhooks
targetUser: Developers building data pipelines and integrations without official APIs
featured: false
icon: M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5
gradientFrom: '#0ea5e9'
gradientTo: '#38bdf8'
repoUrl: 'https://github.com/aylith-labs/apiflip'
sourcePublic: false
order: 5
---

## Vision

Many sites lack a public API. Apiflip aims to reduce the work of extracting structured data from them: describe the data, save the generated schema, and rerun it through the API.

## The Problem

Selectors can stop matching when a page changes. Apiflip records extraction confidence and can propose a selector remap for review; confident remaps can be applied automatically unless a schema is frozen.

## Key Differentiators

- **Natural-language setup**: Generate a reusable field schema from a description and rendered page.
- **Reviewable changes**: Inspect proposed selector changes when confidence is low or the schema is frozen.
- **Traceable results**: Results and change webhooks carry the audit ID and schema version used for the run.
