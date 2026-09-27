---
name: Inglenook
tagline: Your AI. Your hardware. Your rules.
description: >-
  A desktop app for local model chat and on-device document search. Model
  downloads require a network connection; chats and indexed files stay local.
category: ai-infrastructure
features:
  - Curated GGUF model downloads and local model management
  - Local streaming chat and conversation history
  - 'Explicit, single-document keyword search of locally indexed files'
  - Optional loopback OpenAI-compatible API server
targetUser: People who want local model chat and document search on their own desktop
featured: false
icon: >-
  M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115
  18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18
  0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25
  2.25H5.25A2.25 2.25 0 013 12V5.25
gradientFrom: '#64748b'
gradientTo: '#94a3b8'
repoUrl: 'https://github.com/aylith-labs/inglenook'
order: 7
onboarding:
  access: restricted
  prerequisites:
    - Source access and a supported Tauri build environment
    - A local GGUF model or network access to download one
  limitations:
    - The source repository is private and no public installer has been verified
    - >-
      Native build, inference, and offline behavior have not passed end-to-end
      verification
    - >-
      Document search is keyword-only for one selected file and does not ground
      chat replies
---

## Vision

Inglenook brings local model chat and document search into one desktop interface. The app downloads selected models from Hugging Face, then runs inference on the user's hardware. Indexed document text and conversation history are stored in a local SQLite database.

## The Problem

Cloud AI can require sending prompts and documents to a provider. Inglenook offers local inference and local document storage for users who prefer to keep that material on their machine. Model downloads still make outbound requests, and this repository does not establish a compliance certification.

## Key Differentiators

- **Local chat**: Streaming responses, saved conversations, search, and export.
- **Document search**: Drop a supported file into the desktop window to index it locally, then select one document to search its text.
- **Local API option**: The OpenAI-compatible server binds to loopback when enabled.
