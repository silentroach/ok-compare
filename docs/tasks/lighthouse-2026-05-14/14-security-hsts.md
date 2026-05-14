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

- [ ] The repository documents whether `includeSubDomains` and `preload` are accepted or rejected.
- [ ] If accepted, nginx emits the updated HSTS header consistently on HTTPS responses.
- [ ] If rejected, Lighthouse's informative warning is treated as a documented non-actionable item.
- [ ] Redirect behavior for HTTP and `www` remains correct.

## Verification

- [ ] Validate nginx config syntax in the deployment environment with `nginx -t`.
- [ ] Check response headers for `https://kpshelkovo.online/` and `https://www.kpshelkovo.online/`.
- [ ] Run Lighthouse and inspect `has-hsts` details.

## Files Likely Touched

- `ops/nginx/kpshelkovo-online.conf`
- `docs/decisions/` if this becomes an ADR-worthy domain policy decision.

## Risks

- `includeSubDomains` can break future or forgotten subdomains that do not support HTTPS.
- HSTS preload is intentionally hard to reverse and should not be enabled casually.
