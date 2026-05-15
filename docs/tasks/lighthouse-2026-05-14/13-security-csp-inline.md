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

- [x] CSP no longer needs broad `'unsafe-inline'` for executable scripts, or an explicit documented exception explains why it remains.
- [x] Navigation progress, Astro transitions, Metrika, and JSON-LD still work.
- [x] Nginx CSP remains aligned with all external resources used by the site.
- [x] Lighthouse `csp-xss` output improves or the remaining findings are documented.

## Verification

- [x] Run `pnpm build`.
- [x] Serve a production-like build with the nginx CSP or equivalent headers.
- [x] Check browser console for CSP violations on `/`, `/status/`, `/815/compare/`, and `/815/regulation/`.
- [x] Run Lighthouse and inspect `csp-xss` details.

## Resolution

- Executable inline scripts were moved into `apps/www/src/scripts/site-runtime.ts` and loaded through Astro's processed client script pipeline.
- `vite.build.assetsInlineLimit` is set to `0` so Astro does not inline small processed scripts into HTML.
- The remaining executable inline scripts are Astro-generated Svelte island bootstrap snippets and are allowed by SHA-256 hashes in `script-src`.
- `/815/compare/` static fallback hiding now lives in the shared runtime instead of an inline page script.
- `ops/nginx/kpshelkovo-online.conf` removes `script-src 'unsafe-inline'`, adds the Astro bootstrap hashes, and adds `script-src-attr 'none'`.
- Remaining Yandex script host allowlists are documented in `docs/decisions/005-csp-inline-script-policy.md` as accepted production integration exceptions.
- A production-like local server using the nginx CSP produced no browser CSP violations on `/`, `/status/`, `/815/compare/`, or `/815/regulation/`.
- The local `/815/compare/` check still logs a Yandex Maps setup error because the remote Maps script does not complete under the localhost origin; the request is attempted and is not blocked by CSP.
- Targeted LHCI `csp-xss` on `/815/compare/` returned score `1`; remaining Lighthouse notes are the documented Yandex host allowlists and the backward-compatibility suggestion to add ignored `unsafe-inline` alongside hashes.

## Files Likely Touched

- `ops/nginx/kpshelkovo-online.conf`
- `apps/www/src/layouts/BaseLayout.astro`
- Shared script modules if inline code is externalized.

## Risks

- CSP changes can silently break analytics, page transitions, maps, or structured data.
- Nonce-based CSP is harder on static output unless the serving layer injects nonces.
- Hash-based CSP requires stable inline script content and careful build integration.
