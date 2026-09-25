---
name: Simherd
tagline: 'Agent fleets, rendered as games'
description: >-
  Game-style frontends for a fleet of coding agents. One protocol carries domain
  facts — subsystems, work items, actors and their status — and several clients
  draw them however their medium wants: a three.js world at a
  first-person-shooter quality bar, an isometric lot, a native mobile view, a
  terminal pane. Several backends serve the same contract, including a seeded
  generator that produces plausible activity for six kinds of software project
  so any client can be built and demoed without a real fleet running.
category: developer-tools
features:
  - 'One protocol, many renderers — the backend never learns what it is drawn as'
  - >-
    A seeded generator with six project profiles, from busy monorepo to
    abandoned
  - 'Backends are interchangeable — synthetic, recorded file, or a live fleet'
  - Built against a named unreachable reference rather than self-graded
  - 'Terminal client first, because sixteen colours find every browser assumption'
targetUser: >-
  Anyone running a fleet of coding agents who cannot tell at a glance what it is
  doing — and anyone who wants to build a viewer for one without owning the
  fleet
featured: false
icon: >-
  M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303
  0-3.182C13.536 12.219 12.768 12 12 12c-.725
  0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006
  0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z
gradientFrom: '#6366f1'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/simherd'
---

## Why

A dozen agents working in parallel produce facts faster than anyone reads them. A tracker records
them and nobody opens it; a dashboard reports them and nobody looks. Rendered as a place, the same
facts are legible at a glance — a room with the lights on is a subsystem with work in it, a crate
gathering dust is a pull request nobody reviewed, an empty house is an honest Sunday.

## How

The backend serves domain facts and nothing else: subsystems with paths, work items with kinds,
actors with a status and a containment, staleness as a number. What those become on screen is the
client's decision, so the same world can be a floorplan, a city, a shooter or sixteen colours of
box-drawing.

Several backends serve the same contract, so a client can be built against a seeded generator and
then pointed at a real fleet without changing a line.
