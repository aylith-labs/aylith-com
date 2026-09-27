---
name: Dataferry
tagline: Preview SaaS field mappings before migration
description: >-
  Build migration drafts from a SaaS catalog, generate proposed field mappings,
  and preview deterministic transformations on sample records. Live data
  transfer is not available yet because per-app connectors are unfinished.
category: data-tools
features:
  - Create migration drafts and proposed field mappings from catalog schemas
  - >-
    Generate AI field-mapping suggestions when the worker and model are
    configured
  - >-
    Preview mapped and transformed sample records without writing to destination
    apps
targetUser: >-
  Engineers and operators moving off legacy systems, consolidating databases, or
  onboarding customer data
featured: false
icon: M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5
gradientFrom: '#0891b2'
gradientTo: '#22d3ee'
repoUrl: 'https://github.com/aylith-labs/dataferry'
order: 11
---

## See the crossing before you make it

A migration begins with a question: *where will each field go?* Dataferry's current local workflow lets you draft that answer using SaaS catalog schemas, review proposed field mappings, and preview how sample records would be transformed. The preview is a planning aid; it does not write to either app.

| In the local product | What you can inspect |
| --- | --- |
| Migration draft | The selected source and destination schemas |
| Proposed mappings | How source fields correspond to destination fields |
| Sample preview | Transformed rows and errors for the sample, before any transfer |

AI mapping suggestions require a configured worker and model. The deterministic sample preview works independently of a live app connection. When the caller omits sample rows, the preview may use illustrative records; those records are examples, not extracted customer data.

### The boundary today

Dataferry does **not** yet extract records from a live source or load them into a destination. It cannot verify a destination's row counts or integrity, preserve attachments and relationships, or resume a large migration. The current preview speaks only for its sample rows. Those execution and verification steps remain product work, not a promise attached to this page.
