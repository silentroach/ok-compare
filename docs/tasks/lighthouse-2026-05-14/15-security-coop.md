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

- [ ] COOP is either implemented safely or explicitly documented as not appropriate right now.
- [ ] Yandex Maps, external links, Metrika, and page transitions still work.
- [ ] No new browser console warnings or broken popup behavior appear.

## Verification

- [ ] Validate nginx config syntax in the deployment environment with `nginx -t` if headers change.
- [ ] Check response headers on representative pages.
- [ ] Manually test pages with external integrations.
- [ ] Run Lighthouse and inspect `origin-isolation` details.

## Files Likely Touched

- `ops/nginx/kpshelkovo-online.conf`
- `docs/decisions/` if the decision needs a lasting record.

## Risks

- COOP can affect popup/window relationships and cross-origin integrations.
- Adding the header globally may be too broad if only some routes are safe.
