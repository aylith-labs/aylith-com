---
name: Ourobuild
tagline: Scaffold agent workflows and preview PRD issues from a project
description: >-
  A TypeScript CLI that scaffolds agent workflow files, MCP configuration and
  skills, and previews or creates GitHub issues from PRD roadmap items.
category: developer-tools
features:
  - 'Scaffold configuration, MCP settings, skills and GitHub workflow templates'
  - Preview PRD roadmap items as issue proposals without a GitHub write
  - Create issues from PRD roadmap items with configured GitHub credentials
targetUser: >-
  Developers who want a starting point for agent workflow configuration in an
  existing repository.
featured: false
icon: >-
  M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181
  3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181
  3.182m0-4.991v4.99
gradientFrom: '#7c3aed'
gradientTo: '#a78bfa'
repoUrl: 'https://github.com/aylith-labs/ourobuild'
order: 10
---

## Current scope

`ourobuild init` writes starter files into a target repository. `ourobuild run --layer 2 --dry-run` parses checklist items in the configured PRD and previews issue proposals. Without `--dry-run`, Layer 2 uses GitHub credentials to create issues. Other `run` layers currently print guidance about scaffolded workflows; they do not execute a local autonomous loop. Generated workflow files need engine credentials, configuration and external execution before they can produce a build or changelog event. No completed workflow run or graph sync is implied by the presence of those files.

## From source checkout to issue preview

Install the repository dependencies with Bun, then run `bun /path/to/ourobuild/packages/cli/src/index.ts init --engine codex` from a separate target repository. Review the generated configuration, MCP settings, skills, and workflow templates before using them. Layer 2 is designed to preview PRD roadmap issue proposals with `--dry-run`, without a GitHub write. In a disposable source-checkout evaluation, `init` wrote the files but the immediate dry run could not load its generated config: the target did not have the bare `ourobuild` package imported by that config. `doctor` reported 6/9 checks. This documented quick-start path is therefore not yet verified end to end. `doctor` checks setup; it does not certify an external workflow run.

## Current boundary

Ourobuild is a scaffold and PRD-issue CLI prototype. It does not run the full market-signal-to-merge loop locally, enforce configured budgets, or prove that generated workflows compile or ship changes. Re-running issue creation can produce duplicate issues, so dry-run and review remain important before any write. The seven-stage ring on the standalone landing is a design map, not an execution trace.
