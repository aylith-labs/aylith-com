---
name: Plainbase
tagline: Ask questions of your PostgreSQL data in plain English
description: >-
  A prototype for asking questions of a connected PostgreSQL database and
  viewing the generated SQL, result table, and suggested charts.
category: data-tools
features:
  - PostgreSQL natural-language to SQL queries with a static read-only guard
  - 'Suggested charts, saved dashboards, and CSV export'
  - Bearer-token dashboard links that let viewers rerun pinned queries
  - Schema exploration and per-session follow-up questions
targetUser: 'Non-technical founders, marketers, and operators at startups and SMBs'
featured: false
icon: >-
  M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5
  0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0
  2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5
  0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12
  18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25
  4.125s-8.25-1.847-8.25-4.125
gradientFrom: '#3b82f6'
gradientTo: '#60a5fa'
repoUrl: 'https://github.com/aylith-labs/plainbase'
order: 6
onboarding:
  access: restricted
  prerequisites:
    - Run the Next.js app with its own PostgreSQL store and an AI provider key
    - 'Use a separate, least-privilege PostgreSQL role for a test data source'
  limitations:
    - >-
      No public Plainbase host, signup, or supported package install has been
      verified
    - >-
      Shared links grant unauthenticated live reruns without row-level scope or
      rate limits
    - >-
      TLS certificate verification is disabled when the connection form's TLS
      option is enabled
    - 'Generated SQL, answer accuracy, and result size require independent review'
---

## Vision

Small teams can struggle to use PostgreSQL data without SQL expertise. Plainbase explores a conversational interface for questions and visual answers. It is a prototype; accuracy, permissions, and deployment readiness have not been established.

## The Problem

Non-technical founders and operators often need help turning data questions into queries and interpretable results.

## Key Differentiators

- **Schema-aware questions**: PostgreSQL schema metadata is sent to the configured model; follow-ups can use conversation history supplied by the current client session.
- **Suggested visualization**: The model suggests a chart type for each query; users can pin queries to dashboards.
- **Read-only execution controls**: A static SQL guard and PostgreSQL read-only transaction limit writes, but are not a substitute for a least-privilege database role. Public dashboard tokens can rerun pinned queries without login; use synthetic data only until permissions and transport are verified.
