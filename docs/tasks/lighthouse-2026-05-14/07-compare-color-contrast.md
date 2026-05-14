# Task: Fix Compare Page Badge And Count Contrast

## Goal

Raise low-contrast compare UI tokens above WCAG thresholds without changing the established visual language.

## Lighthouse Finding

- Category: Accessibility.
- Affected URL: `/815/compare/`.
- Failing audit: `color-contrast`.
- Elements include `price-cheaper-count` and the `рабство` badge.
- Reported examples: green count contrast around `4.33:1`; danger badge contrast around `4.48:1`.

## Current Code

- `apps/www/src/compare/components/SettlementsExplorer.svelte` renders `price-cheaper-count`.
- `apps/www/src/compare/components/SettlementCard.svelte` renders the `rabstvo-badge`.
- Color tokens come from `packages/ui/styles.css`.

## Proposed Work

- Adjust the specific foreground/background pair or token usage so normal text contrast is at least `4.5:1`.
- Prefer token-level fixes if the same success/danger combinations are reused elsewhere.
- Avoid using opacity on text color when it drops contrast below threshold.
- Keep hover/focus states accessible too.

## Acceptance Criteria

- [ ] `/815/compare/` no longer fails `color-contrast` for the count and badge elements.
- [ ] Success and danger badge styles still visually read as success/danger.
- [ ] Existing component tests continue to pass or are updated only for stable semantic behavior, not Tailwind class snapshots.
- [ ] No new contrast regressions appear on `/815/compare/rating/`, `/status/`, or `/news/`.

## Verification

- [ ] Run tests for `SettlementsExplorer.svelte` and `SettlementCard.svelte` if touched.
- [ ] Run `pnpm typecheck`.
- [ ] Run Lighthouse or axe against `/815/compare/`.
- [ ] Manually inspect light and dark themes if dark theme is supported for these tokens.

## Files Likely Touched

- `apps/www/src/compare/components/SettlementsExplorer.svelte`
- `apps/www/src/compare/components/SettlementCard.svelte`
- `packages/ui/styles.css`

## Risks

- Token changes can affect many pages; inspect shared UI surfaces if editing `packages/ui/styles.css`.
- Tiny numeric badges are especially sensitive because smaller text has stricter contrast requirements.
