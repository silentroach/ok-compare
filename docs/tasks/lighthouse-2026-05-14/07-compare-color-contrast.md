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

- [x] `/815/compare/` no longer fails `color-contrast` for the count and badge elements.
- [x] Success and danger badge styles still visually read as success/danger.
- [x] Existing component tests continue to pass or are updated only for stable semantic behavior, not Tailwind class snapshots.
- [x] No new contrast regressions appear on `/815/compare/rating/`, `/status/`, or `/news/`.

## Resolution

- `packages/ui/styles.css` now uses dedicated light-theme `success-text` and `danger-text` foreground tokens for soft state surfaces.
- `success-text` changed from base `success` to `oklch(51% 0.12 145)`, raising contrast on `success-soft` from about `4.33:1` to `4.706:1`.
- `danger-text` changed from base `danger` to `oklch(52% 0.145 28)`, raising contrast on `danger-soft` to `4.922:1`.
- `docs/design/design-code-shelkovo.md` documents the new foreground tokens and the badge text-color contract.

## Verification

- [x] Run tests for `SettlementsExplorer.svelte` and `SettlementCard.svelte` if touched.
- [x] Run `pnpm typecheck`.
- [x] Run Lighthouse or axe against `/815/compare/`.
- [x] Confirm light-theme output; dark mode has no public switch and its scoped token overrides were not changed.

Verification results, 2026-05-15:

- `pnpm exec vitest run src/compare/components/SettlementsExplorer.svelte.test.ts src/compare/components/SettlementCard.svelte.test.ts` passed.
- Svelte autofixer found no blocking issues in `SettlementsExplorer.svelte` or `SettlementCard.svelte`; existing unrelated `$effect` suggestions in `SettlementsExplorer.svelte` were left untouched.
- Local OKLCH contrast check: `success-text` on `success-soft` is `4.706:1`; `danger-text` on `danger-soft` is `4.922:1`.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `LIGHTHOUSE_SITE_TARGET=static LIGHTHOUSE_DISABLE_ANALYTICS=true pnpm exec lhci autorun` completed. Representative `/815/compare/` reported Accessibility `100`, `color-contrast` score `1`, and `0` failing color-contrast items.
- The same Lighthouse run reported `color-contrast` score `1` with `0` items for `/news/` and `/status/`. `/815/compare/rating/` still has the pre-existing task `08` contrast findings for `text-success-text/80` and `text-danger-text/80`.
- The same Lighthouse run still reported unrelated existing warnings: static Best Practices `79 < 90` and `/815/compare/` Performance `84 < 85`.

## Files Likely Touched

- `apps/www/src/compare/components/SettlementsExplorer.svelte`
- `apps/www/src/compare/components/SettlementCard.svelte`
- `packages/ui/styles.css`

## Risks

- Token changes can affect many pages; inspect shared UI surfaces if editing `packages/ui/styles.css`.
- Tiny numeric badges are especially sensitive because smaller text has stricter contrast requirements.
