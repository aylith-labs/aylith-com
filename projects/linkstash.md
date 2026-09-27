---
name: Linkstash
tagline: Bookmarks you will find again
description: >-
  A self-hostable bookmarks manager for saving links, searching by title,
  description, or URL, and organizing them with tags and collections.
category: productivity
features:
  - Save links with tags and optional descriptions
  - 'Search titles, descriptions, and URLs'
  - Organize links with named collections
  - Import and export bookmarks as JSON or HTML
targetUser: People who save links constantly and can never find the one they need later
featured: false
icon: >-
  M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0
  1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0
  0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244
gradientFrom: '#16a34a'
gradientTo: '#4ade80'
repoUrl: 'https://github.com/aylith-labs/linkstash'
order: 22
---

## Vision

Linkstash helps a single operator save links and find them again with search, tags, and collections. The current app runs without authentication or per-user access control.

## The Problem

Every browser has bookmarks, and every set of bookmarks becomes a junk drawer. Links pile into folders no one revisits, with no context about why they were saved, so finding the right one means scrolling or giving up and re-googling. Saving without retrieval is just hoarding.

## Key Differentiators

- **Search**: find bookmarks by title, description, or URL.
- **Context attached**: add a description and tags when saving a link.
- **Collections**: group bookmarks in named collections without moving the underlying bookmark.
- **Transfer**: import and export bookmarks as JSON or Netscape HTML.

## How the current app works

Save a URL in the app, optionally add a description and tags, then return to the bookmark list to search its title, description, or URL. Filter the list by status, tag, or collection. Collections group existing bookmarks, so removing a link from one collection leaves the saved bookmark in your library. Export creates a URL-based transfer file in JSON or Netscape HTML.

## Current boundaries

Linkstash is a self-hostable, single-operator prototype. It has no sign-in or per-user access control, so its API should stay on a trusted network. Saving starts in the app; there is no browser extension or share-sheet capture. The main list currently shows only the first 50 matching bookmarks, the add-to-collection picker loads only the first 100, and import skips duplicate URLs rather than restoring distinct bookmark identities. Those limits matter before using Linkstash as a large personal archive or treating export as a full backup.
