# Task: Decide And Roll Out Stronger HSTS

## Goal

Decide whether `kpshelkovo.online` should use stronger HSTS directives and implement the rollout safely if accepted.

## Lighthouse Finding

- Category: Best Practices informative audit.
- Audit: `has-hsts`.
- Current header: `Strict-Transport-Security: max-age=31536000`.
- Reported missing directives: `includeSubDomains`, `preload`.

## Current Code

- `ops/nginx/kpshelkovo-online.conf` sets HSTS for the main HTTPS server.
- The config also redirects `www.kpshelkovo.online` to the apex domain.

## Proposed Work

- Verify all current and planned subdomains support HTTPS before considering `includeSubDomains`.
- Decide whether HSTS preload is appropriate for the domain.
- If accepted, stage the rollout deliberately and document the rollback implications.
- If rejected, document why the current apex-only HSTS policy is intentional.

## Acceptance Criteria

- [x] The repository documents whether `includeSubDomains` and `preload` are accepted or rejected.
- [x] Rejected path: nginx keeps host-only HSTS and emits it on known HTTPS hosts only.
- [x] If rejected, Lighthouse's informative warning is treated as a documented non-actionable item.
- [x] Redirect behavior for HTTP and `www` remains correct.

## Verification

- [ ] Validate nginx config syntax in the deployment environment with `nginx -t`.
- [ ] After deployment, check response headers for `https://kpshelkovo.online/` and `https://www.kpshelkovo.online/`.
- [ ] After deployment, run Lighthouse and inspect `has-hsts` details.

## Resolution

- `includeSubDomains` is rejected for now because the repository does not contain an authoritative inventory of all current, internal, and planned subdomains.
- `preload` is rejected because it requires `includeSubDomains`, long-term HTTPS coverage for every subdomain, and a slow rollback path.
- The policy is recorded in `docs/decisions/006-hsts-policy.md`.
- `ops/nginx/kpshelkovo-online.conf` keeps `Strict-Transport-Security: max-age=31536000` on the apex HTTPS server and adds the same host-only HSTS header to the HTTPS `www` redirect.
- HTTP and `www` redirect targets are unchanged.
- Deployment-only verification remains to be done in production: the deploy script runs `nginx -t` before reloading nginx, then response headers and Lighthouse `has-hsts` should be checked on the deployed site.

## Files Likely Touched

- `ops/nginx/kpshelkovo-online.conf`
- `docs/decisions/` if this becomes an ADR-worthy domain policy decision.

## Risks

- `includeSubDomains` can break future or forgotten subdomains that do not support HTTPS.
- HSTS preload is intentionally hard to reverse and should not be enabled casually.
