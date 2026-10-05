---
name: Dictaro
tagline: Speak messy. Clean up locally.
description: >-
  Local-first voice dictation with on-device transcription and deterministic
  text cleanup across a browser extension, desktop daemon, and mobile
  prototypes.
category: productivity
features:
  - Local Whisper transcription in the browser extension and desktop pipeline
  - 'Rule-based cleanup, vocabulary correction, and snippets'
  - Desktop local export API for the latest successful dictation
  - Five-surface parity catalog that records current gaps
targetUser: >-
  People who dictate messages and documents and want local speech processing,
  including knowledge workers and users reducing repetitive typing
featured: false
icon: >-
  M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12
  15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z
gradientFrom: '#f59e0b'
gradientTo: '#fbbf24'
repoUrl: 'https://github.com/aylith-labs/dictaro'
sourcePublic: false
order: 3
onboarding:
  access: restricted
  prerequisites:
    - >-
      Build the browser extension from source or run the Windows desktop daemon
      with its local speech server
  limitations:
    - >-
      No verified public dictation app or browser-store package; the public
      product page is a static source overview
    - >-
      The desktop transcript export is an explicit loopback API request, not a
      graphical download or automatic archive
    - >-
      Web settings have no microphone; terminal and phone coverage differs from
      the desktop pipeline
---

## Current product

The [public Dictaro product page](https://aylith-labs.github.io/dictaro/) explains the source-run workflow and coverage boundaries. It is a static landing, **not** a hosted dictation app, account, or browser-store install.

Dictaro provides local speech-to-text and deterministic cleanup. The browser extension runs Whisper in the browser, while the Windows desktop daemon uses a resident local faster-whisper server and injects the cleaned result into the focused application. The Android and iOS apps have platform-specific input flows with documented gaps; the web settings host has no microphone or daemon.

The desktop daemon now exposes an explicit local JSON export of the latest successfully injected transcript. It holds that result in memory for the daemon session. The export includes the raw and injected text, capture time, source application, and `permissionToShare: false`. There is no automatic archive, upload, graph sync, or sharing permission. The graphical download control and terminal/mobile export flows are still unbuilt.

## Intended users

People who draft messages or documents by voice and want local processing, vocabulary correction, and less repetitive typing. The five-surface parity catalog records what is fully available, partial, unavailable, and structurally inapplicable on each platform.
