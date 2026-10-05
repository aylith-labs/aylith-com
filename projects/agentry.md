---
name: Agentry
tagline: Save the prompts and agents worth revisiting
description: >-
  A library for reusable prompts and agent definitions, with tags and search for
  prompts and version history for agent definitions.
category: developer-tools
features:
  - One home for reusable prompts and agent definitions
  - Agent definition version history and restore
  - Tags and search to find the right prompt fast
  - Draft and published items with author-aware library lists
  - Fork public prompts into your own library
targetUser: >-
  People who maintain reusable prompts and agent definitions and need to find
  and revise them across projects
featured: false
icon: >-
  M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987
  0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0
  2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6
  2.292m0-14.25v14.25
gradientFrom: '#0d9488'
gradientTo: '#5eead4'
repoUrl: 'https://github.com/aylith-labs/agentry'
sourcePublic: false
order: 17
websiteUrl: 'https://agentry.aylith.com/'
onboarding:
  access: public-app
  url: 'https://agentry.aylith.com/home/'
  prerequisites:
    - Open the hosted app and create an account with email and password
    - >-
      Running the private canonical source locally requires repository
      authorization, Bun and SQLite
  limitations:
    - >-
      Google sign-in requires an operator-configured provider; email/password is
      available directly
    - >-
      Prompt search and agent definition history are distinct; prompts do not
      have saved versions or portable export
---

## Vision

The prompts and agent definitions you want to reuse can get buried in chats and notes. Agentry gives them a library with prompt search and agent definition history, so saved work is easier to find and revise.

## The Problem

Prompts and agent definitions live in scattered chats and files. Agentry collects the ones you choose to save, with tags and search for prompts and version history for agent definitions. It does not import chat history automatically.

## Key Differentiators

- **Saved objects**: prompts and agents have dedicated editor and library views.
- **Agent history**: review and restore earlier agent definitions.
- **Findable prompts**: tags and search turn a pile into a catalog.
- **Author-aware lists**: see your own draft agents and prompts alongside published items in their library views.

## Current boundary

Use the [hosted library](https://agentry.aylith.com/) to save and revise prompts and agent definitions. Email/password sign-in is available; optional Google sign-in depends on operator configuration. Search applies to prompts, while version snapshots and restore apply to agent definitions. Prompts do not have saved versions or portable export.
