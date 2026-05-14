# Task: Harden CSP Inline Script Policy

## Goal

Evaluate and reduce CSP weaknesses reported by Lighthouse informative audits, especially `script-src 'unsafe-inline'` and broad host allowlists.

## Lighthouse Finding

- Category: Best Practices informative audit.
- Audit: `csp-xss`.
- Current score display mode: informative, so it does not directly lower the Best Practices score.
- Reported issues: `script-src` host allowlists can be bypassed; `'unsafe-inline'` allows unsafe in-page scripts and event handlers.

## Current Code

- `ops/nginx/kpshelkovo-online.conf` sets a global CSP with `script-src 'self' 'unsafe-inline' ...`.
- `apps/www/src/layouts/BaseLayout.astro` emits inline scripts for navigation progress, Metrika bootstrap, Metrika transitions, and JSON-LD.
- Astro and page transitions may require careful handling if moving away from inline scripts.

## Proposed Work

- Inventory all inline scripts emitted in production HTML.
- Decide whether to use CSP hashes, nonces, external script files, or a hybrid.
- Prefer moving stable inline scripts into bundled external assets when practical.
- Keep JSON-LD working with the chosen CSP approach.
- Update CSP in nginx and verify no browser console CSP violations.

## Acceptance Criteria

- [ ] CSP no longer needs broad `'unsafe-inline'` for executable scripts, or an explicit documented exception explains why it remains.
- [ ] Navigation progress, Astro transitions, Metrika, and JSON-LD still work.
- [ ] Nginx CSP remains aligned with all external resources used by the site.
- [ ] Lighthouse `csp-xss` output improves or the remaining findings are documented.

## Verification

- [ ] Run `pnpm build`.
- [ ] Serve a production-like build with the nginx CSP or equivalent headers.
- [ ] Check browser console for CSP violations on `/`, `/status/`, `/815/compare/`, and `/815/regulation/`.
- [ ] Run Lighthouse and inspect `csp-xss` details.

## Files Likely Touched

- `ops/nginx/kpshelkovo-online.conf`
- `apps/www/src/layouts/BaseLayout.astro`
- Shared script modules if inline code is externalized.

## Risks

- CSP changes can silently break analytics, page transitions, maps, or structured data.
- Nonce-based CSP is harder on static output unless the serving layer injects nonces.
- Hash-based CSP requires stable inline script content and careful build integration.
