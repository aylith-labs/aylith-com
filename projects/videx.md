---
name: Videx
tagline: Find the exact moment in your YouTube research library
description: >-
  Videx brings indexed YouTube channels, available transcripts, search and
  timestamped notes into one local research workspace. Choose a domain to tune
  the topics and suggestions you see.
category: developer-tools
features:
  - 'Choose a domain to tune suggested searches, topics and discovery'
  - Index YouTube channels and available transcripts as timestamped segments
  - >-
    Search indexed videos by text, with semantic search when embeddings are
    available
  - >-
    Save transcript selections as notes, with a source timestamp when timing is
    available
  - Ask questions against a video's transcript and review timestamp citations
  - >-
    Organize videos in groups; optional YouTube OAuth can sync personal
    playlists
targetUser: >-
  Developers and researchers who learn from video and need it searchable,
  quotable and organised around the field they actually work in.
featured: false
icon: >-
  M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0
  01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0
  0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z
gradientFrom: '#8b5cf6'
gradientTo: '#ec4899'
repoUrl: 'https://github.com/aylith-labs/videx'
sourcePublic: false
order: 20
onboarding:
  access: restricted
  prerequisites:
    - Authorized private-repository access
    - 'Docker with Linux containers, PostgreSQL with pgvector and Redis'
    - >-
      Configured local routing and database setup; direct development also uses
      Bun
  limitations:
    - No public self-service installer or hosted application is verified
    - >-
      Tracked direct-host setup instructions have unresolved database-port and
      routing gaps
    - AI and semantic features require model-provider access
    - >-
      Personal YouTube playlist sync requires separate OAuth configuration and
      account consent
---

## From a question to the original moment

The useful line in a long technical talk is easy to lose. Videx is built around a short research
loop: index a YouTube channel, find a passage in its available transcript, and return to the video
at the right time. The timestamp matters as much as the summary: it lets you check the speaker's
words and context for yourself.

## The problem

Video knowledge sits in long timelines and across channels that use different vocabulary. A title
or thumbnail rarely tells you where an idea appears. Videx keeps available captions as segments:
search can find a matching video, then its timestamped transcript can help locate the passage.

## How it works

- **Collect** — index a YouTube channel and the captions Videx can retrieve. Missing captions and
  unavailable sources remain gaps in the library, not invented transcript text.
- **Find** — search the indexed material by phrase. Semantic search and AI suggestions depend on
  configured model access and completed enrichment.
- **Verify** — open a video, read its timestamped transcript, and save a passage as a note. Chat
  can answer from transcript context with clickable times, but its citations still need human review.
- **Shape the workspace** — choose a knowledge domain to tune suggested queries, focus topics and
  discovery. This changes the research lens; it does not rewrite the underlying source material.

## Access and setup

Videx is in a private repository, not a public self-service service. Its local development addresses
do not provide application access to visitors. Authorized installation prerequisites and unresolved
setup gaps are listed above; no waitlist or automatic access grant is implied.
