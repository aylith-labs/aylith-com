---
name: Selfbloom
tagline: 'Private mood notes, guided reflection, and AI wellness coaching'
description: >-
  A wellness app for recording moods and journal entries, taking self-reflection
  assessments, and trying guided CBT exercises and AI coaching.
category: wellness
features:
  - 'Big Five, attachment, stress, PHQ-9, and GAD-7 self-reflection flows'
  - Mood logging with a 30-day trend chart
  - Guided CBT exercises and private journal entries
  - AI coaching and on-demand weekly reflections
targetUser: >-
  People seeking self-reflection tools and wellness routines alongside, not in
  place of, professional care.
featured: false
icon: >-
  M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312
  2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9
  12s9-4.78 9-12z
gradientFrom: '#e11d48'
gradientTo: '#fb7185'
repoUrl: 'https://github.com/aylith-labs/selfbloom'
sourcePublic: false
order: 9
onboarding:
  access: restricted
  prerequisites:
    - >-
      An account and a configured AI provider are needed for coaching and
      generated reflections.
  limitations:
    - No public hosted signup or billing is verified.
    - >-
      Journal and coaching content is stored in SQLite and may be sent to the
      configured AI provider for generation.
    - >-
      Data export, account erasure, and zero-knowledge encryption are not
      implemented.
    - >-
      Deleting a journal entry does not remove earlier AI-generated weekly
      reflections that may contain its details.
    - >-
      Selfbloom's assessments, exercises, and AI coaching have not been
      clinically validated; crisis-language matching is not reliable crisis
      detection.
---

## Vision

Selfbloom supports private self-reflection through mood notes, journaling, assessments, guided exercises, and AI coaching. It is a wellness tool, not a substitute for professional care.

## The Problem

People may want a place to record how they feel, revisit their entries, and work through structured exercises. Selfbloom brings those actions together in one account.

## Key Differentiators

- **Reflection history**: Mood entries, journals, assessment results, and coaching sessions are stored per user.
- **Guided exercises**: CBT-style exercises offer step-by-step prompts.
- **Bounded insight**: A mood chart and on-demand weekly AI summary help revisit recent entries; they do not diagnose or establish clinical improvement.
