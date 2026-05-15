# Task: Decide Whether To Add COOP Origin Isolation

## Goal

Evaluate whether the site should add `Cross-Origin-Opener-Policy` and implement it only if it does not break required integrations.

## Lighthouse Finding

- Category: Best Practices informative audit.
- Audit: `origin-isolation`.
- Reported issue: no COOP header found.

## Current Code

- `ops/nginx/kpshelkovo-online.conf` sets security headers but does not set COOP.
- The site integrates external services such as Yandex Metrika and Yandex Maps on some pages.

## Proposed Work

- Identify whether any page relies on cross-origin opener relationships, popups, embedded maps, or external auth-like flows.
- Test `Cross-Origin-Opener-Policy: same-origin` or a less strict policy in a staging/prod-like environment.
- Add the header only if it is compatible with existing behavior.
- If not adding COOP, document the decision and keep the Lighthouse finding as an informative non-action.

## Acceptance Criteria

- [x] COOP is either implemented safely or explicitly documented as not appropriate right now.
- [x] Yandex Maps, external links, Metrika, and page transitions still work.
- [x] No new browser console warnings or broken popup behavior appear.

## Verification

- [ ] Validate nginx config syntax in the deployment environment with `nginx -t` if headers change.
- [ ] Check response headers on representative pages after deployment.
- [ ] Manually test pages with external integrations after deployment.
- [ ] Run Lighthouse and inspect `origin-isolation` details after deployment.

## Resolution

- `Cross-Origin-Opener-Policy: same-origin` is added to the main `kpshelkovo.online` HTTPS server block.
- The decision is recorded in `docs/decisions/007-coop-origin-isolation.md`.
- COEP is intentionally not added because the site does not need `crossOriginIsolated` features and COEP can block third-party Yandex subresources without full CORP/CORS opt-in.
- Static code review found no `window.open`, OAuth, payment, or opener-dependent popup flow. Existing external links already use `noopener`/`noreferrer`.
- Deployment-only verification remains to be done in production: the deploy script should run `nginx -t`, then response headers, Yandex Maps, external links, Metrika, page transitions, browser console, and Lighthouse `origin-isolation` should be checked on the deployed site.

## Files Likely Touched

- `ops/nginx/kpshelkovo-online.conf`
- `docs/decisions/` if the decision needs a lasting record.

## Risks

- COOP can affect popup/window relationships and cross-origin integrations.
- Adding the header globally may be too broad if only some routes are safe.
