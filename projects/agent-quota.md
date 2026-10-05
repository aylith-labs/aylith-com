---
name: Agent Quota
tagline: Read AI coding subscription quota through a typed provider library
description: >-
  A Node library for normalized Anthropic coding subscription quota readings,
  with per-account polling budgets and single-flight coordination.
category: developer-tools
features:
  - >-
    Typed quota readings that distinguish provider-reported values from local
    derivations
  - >-
    Anthropic subscription usage adapter with absent values kept distinct from
    zero
  - Per-account polling budget and single-flight request coordination
targetUser: Developers integrating AI coding subscription usage into their own tools
featured: false
icon: >-
  M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303
  0-3.182C13.536 12.219 12.768 12 12 12c-.725
  0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006
  0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z
gradientFrom: '#6366f1'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/agent-quota'
sourcePublic: false
onboarding:
  access: restricted
  prerequisites:
    - Authorized access to the private source repository and Node 20 or newer
    - A caller-supplied Anthropic credential for live usage reads
  limitations:
    - >-
      Anthropic usage reads require a caller-supplied credential and respect
      polling limits
---

## Quota readings with explicit limits

Agent Quota provides typed Anthropic subscription readings that distinguish a reported quota, an unknown value and a local calculation. Callers supply their own credential. Per-account polling budgets and single-flight coordination reduce duplicate and overly frequent usage requests.
