---
name: Knowmine
tagline: Review and save a record of what you own
description: >-
  A personal inventory where photo, barcode, and receipt scans suggest details
  for review. Save and organize item records yourself.
category: productivity
features:
  - Photo upload on the new-item form suggests item details
  - Barcode lookup for product details
  - Receipt parsing with links to the new-item form
  - Searchable inventory with session-owned items and photo reads
  - Manual value and warranty fields for each item
targetUser: >-
  Homeowners, renters, and collectors who want to reduce typing while keeping a
  personal record of their possessions
featured: false
icon: >-
  m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9
  5.25m0-9v9
gradientFrom: '#ca8a04'
gradientTo: '#facc15'
repoUrl: 'https://github.com/aylith-labs/knowmine'
sourcePublic: false
order: 14
onboarding:
  access: restricted
  prerequisites:
    - >-
      Run the Bun web and API workspaces with a local SQLite database and Google
      OAuth credentials
    - Supply an Anthropic API key for optional photo and receipt suggestions
  limitations:
    - >-
      No public Knowmine host, signup, or supported package install has been
      verified
    - >-
      Scan-page Add to Inventory links do not prefill the new-item form; save
      the item manually
    - >-
      A photo used for a new-item suggestion is not attached to the saved item
      by that action
    - >-
      Category, location, and tag references on item writes do not yet verify
      the requesting user's ownership
    - >-
      ZIP export skips missing or unreadable photo files; verify the archive
      before relying on it
---

## Vision

A personal inventory is useful before a move, loss, or warranty question. Knowmine can suggest item details from photos and parse receipts for review; you decide what to enter and save. A suggestion is not a saved record or proof of value.

## The Problem

Home inventory tools exist, but they all assume you will sit down and type. Almost no one does. So when a flood, a theft, or a move forces the question, the answer is a guess and a shoebox of receipts. The friction of capture is the entire reason the inventory never exists.

## Key Differentiators

- **Camera-assisted entry**: uploading a photo on the new-item form suggests details in place.
- **Receipt review**: parsed line items link to an empty form for manual addition.
- **Record useful details**: add values and warranty dates to the items you save.
- **Searchable records**: search saved items and filter the inventory by category or location.

## Current boundary

This source prototype has session-protected item and photo reads, but item create/update does not verify ownership of referenced categories, locations, and tags. It is not an audited household sharing or insurance-claim system. The scan page does not carry photo/barcode suggestions into the new-item form, and scanning a photo on that form does not persist the image with the item. Export can omit photo files that are missing or unreadable on disk. No public Knowmine deployment has been verified.
