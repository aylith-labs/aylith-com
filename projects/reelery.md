---
name: Reelery
tagline: Inspect local footage before a video workflow
description: >-
  Early local video preparation project. Its working CLI inspects source-video
  metadata, provenance and three sampled frames in a self-contained offline
  review page.
category: design-tools
features:
  - Local video stream and duration inspection with ffprobe
  - Three sampled PNG frames for human review
  - SHA-256 source hash and media-tool versions in a JSON report
  - Offline light/dark HTML review sheet with the real frames and source facts
targetUser: Creators preparing recorded footage for a video workflow
featured: false
icon: >-
  M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0
  01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0
  00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z
gradientFrom: '#c2410c'
gradientTo: '#f59e0b'
repoUrl: 'https://github.com/aylith-labs/reelery'
sourcePublic: false
order: 4
---

## Start with the source

Before editing a recording, a creator needs to see what is actually there. Reelery's
local `python -m reelery inspect` command accepts a video and a new or empty
output directory. It writes three real sample PNGs, source and stream facts in
`report.json`, and an offline `report.html` that puts those facts beside the
frames. The page follows the system light or dark theme and makes no network
requests. The README documents the command and prerequisites.

## Review, then decide

The samples offer a first look near the beginning, middle and end. Watch and
listen to the whole source before deciding whether to use it. The report
records an absolute local path and can reveal sensitive imagery, so inspect
it before sharing. Nothing in the report grants usage rights or scores quality.

## Current limits

The frames require human review. Reelery does not yet make a finished video, generate a voice or presenter, create captions, enforce consent, verify publish quality, or publish media. No local-versus-hosted cost or performance benchmark has been measured here.
