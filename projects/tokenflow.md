---
name: tokenflow
tagline: One local gateway. Trace chat requests by virtual key.
description: >-
  Route chat through a configured OpenAI-compatible upstream with per-app
  virtual keys. Inspect returned usage by key alongside modeled list-price and
  route-cost estimates.
category: ai-infrastructure
features: []
targetUser: ''
featured: false
icon: >-
  M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303
  0-3.182C13.536 12.219 12.768 12 12 12c-.725
  0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006
  0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z
gradientFrom: '#d4894a'
gradientTo: '#c97a3a'
repoUrl: 'https://github.com/aylith-labs/tokenflow'
---

Give each connected app a virtual key and send its chat requests through one local endpoint. The
gateway forwards them to a configured OpenAI-compatible upstream without forwarding the app's key.
The dashboard groups recorded requests by key, model and app label so you can trace which caller
used which route. It estimates list-price and route-accounted costs from returned usage and known
model rates; it does not read provider invoices. Model listing and audio transcription proxy through
the gateway, but the cost ledger is centered on chat usage.

Subscription routing is optional and disabled by default. Its $0 route-accounted cost is an
assumption, not a verified charge or saving. Unknown model rates and missing usage currently appear
as $0 estimates, so totals may be incomplete. A real upstream deployment and end-to-end browser
acceptance remain open.
