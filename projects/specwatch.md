---
name: Specwatch
tagline: Generate and check JavaScript tests from your terminal
description: >-
  A local-first AI testing CLI for JavaScript and TypeScript projects. Generate
  tests from source files, run them through Jest or Vitest, and inspect coverage
  reports.
category: testing
features:
  - Draft JavaScript and TypeScript tests on demand or when source files change
  - Run generated test files with Jest or Vitest by default
  - 'Report gaps from an existing Istanbul coverage report, when present'
  - Use local Ollama by default; optional cloud AI providers
targetUser: Solo developers and small teams shipping fast with AI coding tools
featured: false
icon: >-
  M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75
  3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0
  .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8
  15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5
  14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112
  21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5
gradientFrom: '#a54f37'
gradientTo: '#d97750'
repoUrl: 'https://github.com/aylith-labs/specwatch'
sourcePublic: false
order: 4
onboarding:
  access: restricted
  prerequisites:
    - >-
      Download the CLI archive and install it in a Node.js 22.12 or newer JS/TS
      project
    - Run Ollama locally or explicitly configure a cloud model provider
    - >-
      Use Jest or Vitest and supply an Istanbul coverage-final.json for coverage
      checks
  limitations:
    - The CLI archive is public; repository source access is separate
    - Runs in your own project; a hosted testing service is not included
    - 'Normal gen, watch, and fix can replace an existing sibling test file'
    - >-
      Coverage checks require a pre-generated Istanbul report; missing or
      malformed reports fail explicitly
    - >-
      A passing generated file does not prove useful assertions or a coverage
      gain
---

## Vision

Specwatch helps developers draft tests alongside source changes and run the generated files through an existing test runner. Generated code still needs developer review.

## The Problem

Writing and maintaining tests can lag behind source changes. A local CLI can reduce the work of drafting tests and point to gaps in an existing coverage report.

## Key Differentiators

- **Local default**: Ollama is the default model provider; cloud providers require an explicit choice and credentials.
- **Execution result**: The runner returns whether a generated test file passed. The number of `test(...)` calls detected in model output is not an executed pass count.
- **Scope**: The current parser and runner cover JavaScript and TypeScript with Jest or Vitest. Coverage reporting reads an existing Istanbul JSON artifact.

## Use it in your project

Download the CLI archive from the public homepage, check its SHA-256 checksum, and install it in your project with `npm install --save-dev ./specwatch-0.1.0.tgz`. Run the installed command with Node.js 22.12 or newer.

`gen --dry-run` preserves files. Normal generation, watch, and fix can replace an existing sibling test file, so keep changes under version control and review the resulting diff. Generate an Istanbul coverage report before using `ci --coverage`: missing or malformed coverage input fails explicitly, while valid measured function locations are accepted. The existing test runner still determines test success. Specwatch runs locally; it does not provide a hosted testing service.
