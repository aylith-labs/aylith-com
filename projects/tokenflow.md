---
name: tokenflow
tagline: Personal LLM gateway with usage accounting
description: >-
  OpenAI-compatible LLM gateway with virtual keys per app, a per-request usage
  ledger, and notional-vs-billed cost accounting that prices subscription-served
  calls at list price while billing them $0.
category: ai-infrastructure
features: []
targetUser: ''
featured: false
icon: git-branch
gradientFrom: '#d4894a'
gradientTo: '#c97a3a'
repoUrl: 'https://github.com/aylith-labs/tokenflow'
---

tokenflow is a personal OpenAI-compatible LLM gateway. One base URL for every model, virtual keys per
app, and a per-request usage ledger with notional-vs-billed cost accounting — subscription-served
requests are priced against the model but billed $0, so you see the savings. Sits in front of Bifrost
(or any OpenAI-compatible upstream) and adds the keys, ledger, and dashboard.
