# Website availability review — local, not released

## Current delivery authority —8 September 2026

Steve now authorizes routine reviewed/tested main pushes and their existing
deployments. Older blanket release-approval statements below are historical.
Settings2cd8475 is deployed and browser verified; wider catalog edits remain
local until individually reviewed and committed. Coordinate canonical manifests
with compatible collection, preserve every included entry and verify actual
served content. Never call the offline fallback the corrected collected projection.
No new commercial, security, account, spending or outreach authority is implied.

## D074 bounded delta — local0.10.2

Optional canonical `onboarding.releasesUrl` supplies an authoritative package
version/date destination independently of studio notes. Bract's prototype claims
are qualified at the feature list; its old claim-bearing hero/caption is withdrawn
from public-page rendering while original media and historical dates are retained.
No runtime, package publication, production deployment or new release is implied.

After the existing collection/overlay/build workflow below, run
`node scripts/website-delta-acceptance.mjs <existing-playwright-package> <saved-baseline-directory>`.
The baseline directory contains a pre-collection `projects/` copy. The proof
compares every prior slug, checks the built pages in light/desktop and dark/narrow
contexts, follows the actual public registry link and records source/build hashes,
screenshots, raw interaction and cleanup. D074's final40-check receipt is
`C:/Users/steve/AppData/Local/Temp/website-delta-cCWM76/receipt.json`.
Venture's existing `reviews/I17/website-adversarial.md` owns disposition and gates.
Do not replay the whole settings matrix or publish from this local pass.

The website and five source manifests have coordinated corrections. Catalog authority remains each product's `.aylith/project.md`. Do not hand-edit the fallback snapshot to make these corrections; ordinary CI collection must see the source changes after a separately approved release.

## Reproduce this local preview

From `landing/`, using the already authenticated GitHub CLI (no credential extraction):

```powershell
npm ci --ignore-scripts --no-audit --no-fund
node scripts/collect.mjs --gh
node scripts/preview-catalog.mjs --collected tickets=../../tickets/.aylith/project.md videx=../../videx/.aylith/project.md inspekt=../../inspekt/.aylith/project.md bract=../../bract/.aylith/project.md compokit=../../compokit/.aylith/project.md
npm run check
npm test
npm run build
npm run check:links
npm run preview -- --host 127.0.0.1
```

The projection preserves every collected entry and records SHA256 identities for the five explicit source overlays in `.generated/preview-receipt.json`. The committed offline snapshot is older and is not accepted source/deployment parity. No product has been deleted. Do not deploy that snapshot as this repair.

For the task-scoped browser check, pass an existing Playwright package directory to `node scripts/website-acceptance.mjs <absolute-playwright-directory>`. It serves the production build on a fresh loopback port, creates its own browser, records raw verification footage/screenshots/receipt in a temporary directory, then closes both. This is regression capture, not a narrated milestone video.

## Release gates

No push or release is authorized in this lane. The five source corrections and the website's compatible collector/schema must be coordinated; a website-only deployment against unchanged remote manifests can restore the old claims. A release decision must specify repositories/commits, public content review, rollout order and rollback; then re-collect and verify the actual deployed pages and external destinations.

Before claiming clean-install acceptance, verify Tickets' selected release artifact and Inspekt's published package in isolated environments. Source availability is not installation proof. Videx remains restricted; do not substitute a local address, private repository link or invented access-grant flow.

The original adversarial review's delta retest is coordinated in its existing chat, not a new review team. Venture owns ADV-001–005 dispositions, internal case-study evidence, remaining gates and the delivery receipt.
# D063 settings and refined-review delta

Local version0.10.1 adds semantic white-on-copper actions, accessible settings,
live/persistent theme and motion preferences, cancellable reveals/tilt, and honest
empty studio release notes. The same five-source preview procedure below applies;
Bract and Compokit now declare restricted source access in their own manifests.

After building, run the task-scoped actual-browser regression with an existing
Playwright installation (no additional install required):

```powershell
node scripts/settings-acceptance.mjs C:/Users/steve/projects/aylith-labs/dashcam/node_modules/playwright
```

Receipts distinguish baseline, interaction-only and full runs, computed/composited
colors, source/build hashes, route/state captures and actual native-zoom detection.
The CSS200% stress check is not evidence of browser chrome zoom. All browser
preferences live only in fresh task contexts; no owner profile is changed.
No push, deployment, product installation or public release is included.
