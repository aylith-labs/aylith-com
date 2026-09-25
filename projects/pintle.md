---
name: Pintle
tagline: >-
  The pin a gate turns on — a Go HTTPS reverse proxy for local development that
  reads Traefik and Caddy labels natively, so services keep the labels they
  already have.
description: >-
  The pin a gate turns on — a Go HTTPS reverse proxy for local development that
  reads Traefik and Caddy labels natively, so services keep the labels they
  already have.
category: uncategorized
features: []
targetUser: ''
featured: false
icon: >-
  M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303
  0-3.182C13.536 12.219 12.768 12 12 12c-.725
  0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006
  0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z
gradientFrom: '#6366f1'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/pintle'
---

The pin a gate turns on. A Go HTTPS reverse proxy that replaces Traefik and Caddy — it reads **their** labels and **their** config files, so services keep the labels they already have and the proxy underneath them changes. Single static binary (~9 MB) with an embedded React dashboard. Routes domains via SNI with HTTP/2, auto-discovers Docker containers through three label dialects, terminates TLS for database connections, and passes any domain it does not own through to another proxy untouched.
