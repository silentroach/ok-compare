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

- [ ] `/815/compare/rating/` no longer fails `color-contrast` for adjustment labels.
- [ ] Labels retain their success/danger visual meaning.
- [ ] The rating page layout and hierarchy are unchanged.

## Verification

- [ ] Run `pnpm typecheck`.
- [ ] Run Lighthouse or axe against `/815/compare/rating/`.
- [ ] Manually inspect the adjustment cards at mobile width, where Lighthouse reported the issue.

## Files Likely Touched

- `apps/www/src/pages/815/compare/rating.astro`
- `packages/ui/styles.css` if shared tokens are adjusted.

## Risks

- Fixing only opacity in one page can leave the same contrast issue in other surfaces.
- Over-darkening semantic colors can make the design feel heavier; prefer measured token adjustments.
