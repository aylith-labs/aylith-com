---
name: Stith Deck
tagline: Show coding-agent fleet status and quota meters on Stream Deck keys
description: >-
  A Stream Deck plugin with standalone AI coding usage meters and agent-fleet
  tiles connected to a local Stith daemon.
category: developer-tools
features:
  - Provider quota meters designed to run without the Stith daemon
  - Agent-session tiles and controls when a local Stith daemon is available
  - Stream Deck profiles for moving between usage and fleet views
targetUser: Stream Deck users who monitor AI coding usage or a local coding-agent fleet
featured: false
icon: >-
  M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303
  0-3.182C13.536 12.219 12.768 12 12 12c-.725
  0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006
  0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z
gradientFrom: '#6366f1'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/stith-deck'
sourcePublic: false
onboarding:
  access: restricted
  prerequisites:
    - >-
      Stream Deck 6.6 or later on Windows 10 or later, as declared by the
      shipped plugin manifest
    - >-
      A local Stith daemon only for agent-fleet tiles; usage meters do not
      require it
  limitations:
    - >-
      Agent controls and live fleet status require a separately running local
      Stith daemon
---

## Usage on the keys, fleet control when connected

Stith Deck puts AI coding usage and local agent-fleet status on hardware keys. Usage meters call provider APIs from the plugin process. Agent tiles use a local Stith daemon for live sessions, prompts and controls.
