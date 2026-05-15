# Task: Fix Rating Page Adjustment Label Contrast

## Goal

Raise contrast for success/danger uppercase labels on `/815/compare/rating/`.

## Lighthouse Finding

- Category: Accessibility.
- Affected URL: `/815/compare/rating/`.
- Failing audit: `color-contrast`.
- Elements: labels using `text-success-text/80` and `text-danger-text/80`.
- Reported examples: success label around `3.43:1`; danger label around `3.74:1`.

## Current Code

- `apps/www/src/pages/815/compare/rating.astro` uses opacity-modified success and danger text classes for adjustment labels.

## Proposed Work

- Remove or reduce text opacity where it causes insufficient contrast.
- Use stronger semantic tokens for uppercase labels.
- If token-level changes are needed, coordinate with `07-compare-color-contrast.md` so success/danger colors remain consistent.

## Acceptance Criteria

- [x] `/815/compare/rating/` no longer fails `color-contrast` for adjustment labels.
- [x] Labels retain their success/danger visual meaning.
- [x] The rating page layout and hierarchy are unchanged.

## Resolution

- `apps/www/src/pages/815/compare/rating.astro` now uses full-strength `text-success-text` and `text-danger-text` for the two adjustment labels instead of `/80` alpha-modified text.
- The shared state tokens stayed unchanged; the fix uses the AA foreground tokens introduced for task `07` without changing page layout or hierarchy.

## Verification

- [x] Run `pnpm typecheck`.
- [x] Run Lighthouse or axe against `/815/compare/rating/`.
- [x] Manually inspect the adjustment cards at mobile width, where Lighthouse reported the issue.

Verification results, 2026-05-15:

- Local OKLCH contrast sanity-check: `success-text` on `surface` is `5.456:1`; `danger-text` on `surface` is `5.921:1`.
- `pnpm typecheck` passed.
- `LIGHTHOUSE_DISABLE_ANALYTICS=true pnpm build` passed.
- `LIGHTHOUSE_SITE_TARGET=static LIGHTHOUSE_DISABLE_ANALYTICS=true pnpm exec lhci autorun` completed. Representative `/815/compare/rating/` reported Accessibility `100`, `color-contrast` score `1`, and `0` failing color-contrast items.
- The same Lighthouse run still reported unrelated existing `/815/compare/` Performance `84 < 85`.
- Mobile browser inspection at `390x844` confirmed both adjustment labels render visibly with full-strength state colors on `surface`; screenshot saved to `/var/folders/sb/82f4cg9n6z182c5q0k6dn3hr0000gn/T/opencode/rating-adjustments-mobile.png`.

## Files Likely Touched

- `apps/www/src/pages/815/compare/rating.astro`
- `packages/ui/styles.css` if shared tokens are adjusted.

## Risks

- Fixing only opacity in one page can leave the same contrast issue in other surfaces.
- Over-darkening semantic colors can make the design feel heavier; prefer measured token adjustments.
