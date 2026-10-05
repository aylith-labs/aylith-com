---
name: Compokit
tagline: Generate a starting point from your component library
description: >-
  A local component-aware CLI that scans your library and design tokens, matches
  a request by keywords, and emits code for review in your project.
category: design-tools
features:
  - 'Scan local React, Vue and Svelte components and CSS custom properties'
  - Match requests by keywords and generate framework-specific component imports
  - Require explicit values for required string props before writing output
targetUser: Design-heavy product teams with established component libraries
featured: false
icon: >-
  M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0
  008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0
  003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995
  0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996
  15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42
gradientFrom: '#ec4899'
gradientTo: '#f472b6'
repoUrl: 'https://github.com/aylith-labs/compokit'
sourcePublic: false
order: 1
websiteUrl: 'https://compokit.aylith.com/'
onboarding:
  access: public-download
  url: 'https://compokit.aylith.com/home/#install'
  prerequisites:
    - Node.js 22 or newer and npm
    - A local component library to scan
    - >-
      The public CLI archive does not require repository access; building the
      private canonical source requires authorization
  limitations:
    - >-
      Generated imports and code must be reviewed and typechecked in the target
      project
    - >-
      Required string props need one explicit quoted value; unsupported required
      prop types need manual completion
---

## Scan your existing vocabulary

Scan a local component directory and CSS custom properties, then inspect the resulting design-system JSON. Matching uses keywords and returns a reviewable starting point using your component names.

## Install and generate locally

The [public homepage and CLI download](https://compokit.aylith.com/home/#install) provide a bundled npm archive and checksum. Install the downloaded archive with npm, scan your library, and provide explicit required string values in a generation request. No provider key is required for this local CLI flow.

## Review in the target project

Generated output must be checked against your actual library and project configuration. Missing or conflicting required string values fail before output is written. This CLI flow does not establish automatic design fidelity, accessibility compliance or a benchmarked reduction in review work.
