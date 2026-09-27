---
name: Pintle
tagline: Route local development domains through one HTTPS reverse proxy
description: >-
  A Go reverse proxy for local development with Docker and file routes, TLS
  termination, SNI passthrough and an embedded dashboard. Its optional
  static-only mode serves loopback routes without Docker discovery.
category: developer-tools
features:
  - 'Docker route discovery from Pintle, Traefik and Caddy labels'
  - 'File-defined routes, SNI passthrough and TLS termination for local services'
  - Embedded dashboard and runtime self-description for local route inspection
targetUser: Developers running several local services behind HTTPS domains
featured: false
icon: >-
  M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303
  0-3.182C13.536 12.219 12.768 12 12 12c-.725
  0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006
  0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z
gradientFrom: '#6366f1'
gradientTo: '#818cf8'
repoUrl: 'https://github.com/aylith-labs/pintle'
onboarding:
  access: public-source
  url: 'https://github.com/aylith-labs/pintle#setup'
  prerequisites:
    - Local TLS certificates from mkcert and route configuration
    - >-
      Docker for the recommended mode, or a locally built Go binary for
      host-native use
  limitations:
    - Host-native port redirection requires administrator privileges
    - >-
      Static-only mode serves loopback HTTP routes without Docker discovery or
      TCP routing
---

## A local proxy that reads existing labels

Pintle routes local HTTPS domains to development services. Its source accepts Pintle, Traefik and Caddy label formats, reads static route files, and can pass an SNI domain through to another proxy. The embedded dashboard and `GET /api/self` describe the running local configuration.

The [setup guide](https://github.com/aylith-labs/pintle#setup) covers certificates, route files, build and Docker use. The optional static-only mode serves loopback HTTP routes and omits Docker discovery, TCP listeners and SNI passthrough.
