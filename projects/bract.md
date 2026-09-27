---
name: Bract
tagline: 'Agent operations, explored through local prototypes'
description: >-
  A local exploration of agent deployment lifecycles, persistent memory and
  observability. Production compute, hosted access, pricing and capacity are not
  established.
category: ai-infrastructure
features:
  - Local deployment-lifecycle prototype; no production compute backend
  - Prototype persistent memory storage; semantic search not yet connected
  - Prototype trace ingestion and waterfall visualization
  - Provider-neutral product direction; no hosted access route verified
targetUser: AI engineers and indie hackers building autonomous agents
featured: false
icon: >-
  M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0
  00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z
gradientFrom: '#3f3f46'
gradientTo: '#71717a'
repoUrl: 'https://github.com/aylith-labs/bract'
order: 0
onboarding:
  access: restricted
  prerequisites:
    - >-
      Authorized access to the private source repository is required for
      development setup
  limitations:
    - No public installation or hosted-service access route has been verified
    - >-
      Public product notes below describe the direction, not a release or access
      entitlement
---

## A place for agents to take root

Bract explores one connected workflow for agent operations. The local source brings deployment lifecycle records, PostgreSQL memory and trace views together, but the seams between them are still being built. No public hosted agent is available here.

| Current local component | What it establishes |
| --- | --- |
| Deployment runner | Records lifecycle transitions and an endpoint string; it does not start compute. |
| Agent memory | Stores and retrieves agent-scoped key/value entries in PostgreSQL. |
| Trace surfaces | Ingest and display recorded agent activity. |

### The boundary today

Semantic memory search needs a provider-neutral embedding path. Production compute, scale-to-zero, scheduled work, secrets isolation and a hosted access route remain future work or unverified. Pricing, cold-start time, capacity and savings have not been measured in a repeatable public benchmark. A recorded endpoint is not evidence of a running deployment.

The product direction is to connect these pieces without privileging one model provider. Each capability needs a working runtime, access path and evidence before Bract can offer it as a service.
