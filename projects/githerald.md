---
name: GitHerald
tagline: GitHub activity into reviewable release drafts
description: >-
  Drafts changelog, blog, and social copy from GitHub commits and merged pull
  requests. Source receipts stay beside new drafts; publishing the changelog is
  a separate action.
category: developer-tools
features:
  - 'Generates changelog, blog, and social drafts from GitHub activity'
  - >-
    Preserves commit and PR source identities, with verified links when
    available
  - 'Exports drafts as Markdown, HTML, or JSON'
  - >-
    Publishes changelogs to the configured app's public page with RSS and an
    embed view
targetUser: Developer founders and small teams shipping fast but lagging on communication
featured: false
icon: >-
  M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0
  1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463
  1.511l-.657.38a.75.75 0 01-1.021-.27 18.634 18.634 0 01-1.014-2.238.823.823 0
  01.55-1.06c.53-.152 1.05-.328 1.57-.527m0-9.18a8.344 8.344 0
  00-.985-2.783.75.75 0 01.464-1.511l.656-.38a.75.75 0 011.022.27 18.634 18.634
  0 011.014 2.238.823.823 0 01-.55 1.06 12.11 12.11 0 00-1.571.527M12 18.75v.008
gradientFrom: '#6366f1'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/githerald'
sourcePublic: false
order: 2
---

## Vision

Developers ship fast but lag on communicating what they shipped. GitHerald reads GitHub commits and merged PRs for a selected UTC date range and generates changelog, blog, and social drafts. The signed-in dashboard retains source identities, with verified links when available, for new drafts so users can inspect the underlying work. The reader pages through GitHub activity and refuses a partial draft when its 1,000-record scan limit or a provider page failure prevents a complete result.

The [public GitHerald overview](https://aylith-labs.github.io/githerald/) explains this source-run workflow. It is a static product page, not a hosted GitHub connection, AI generation service, account, or published changelog instance.

## The Problem

Communication debt is real. Writing changelogs is tedious, blog posts about releases rarely happen, and social media is an afterthought. Existing tools are fragmented — git-cliff for changelogs, Typefully for social scheduling, Beamer for widgets. No tool bridges the full pipeline.

## Key Differentiators

- **GitHub context**: Sends commit messages and merged PR descriptions to the configured AI provider; new generations retain commit and PR identities, with verified links when available.
- **One generation flow**: Creates changelog, blog, and social drafts together, with tone presets and export options.
- **Changelog publishing**: A separate user action publishes a changelog to the configured app's public page. Blog and social outputs remain copy/export drafts; in-app editing, scheduling, direct posting, and brand-voice learning are not implemented. No public hosted signup or pricing is announced here.
