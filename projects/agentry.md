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
onboarding:
  access: restricted
  prerequisites:
    - Run the Bun web and API workspaces with a local SQLite database
    - Create an account with email and password
  limitations:
    - No hosted Agentry origin or public install path has been verified
    - >-
      Google OAuth exists in the API but has no verified web sign-in path;
      email/password is the current page flow
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

Agentry runs from source with local database setup; no hosted app deployment has been verified. Email/password sign-in works in source. Google OAuth is optional at the API, but the former web button targeted an unmatched route and was withdrawn until its navigation can be repaired and checked. Search is implemented for prompts, while version snapshots and restore apply to agent definitions. Collection references need additional item-visibility checks before the app can make a blanket privacy claim about all cross-linked drafts.
