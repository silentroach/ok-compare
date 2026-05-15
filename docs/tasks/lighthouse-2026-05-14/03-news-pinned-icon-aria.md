# Task: Fix Prohibited ARIA on Pinned News Icon

## Goal

Remove the accessibility violation on `/news/` caused by `aria-label` on a plain `span` used for the pinned-news marker.

## Lighthouse Finding

- Category: Accessibility.
- Affected URL: `/news/`.
- Failing audit: `aria-prohibited-attr`.
- Element: `span.mt-1` with `aria-label="закреплено сверху"`.
- Explanation: `aria-label` cannot be used on a `span` with no valid role attribute.

## Current Code

- `apps/www/src/components/news/NewsCard.astro` renders the pinned marker.

## Proposed Work

- Replace the invalid accessible-name pattern with a valid one.
- Preferred option: mark the decorative icon `aria-hidden="true"` and add visually hidden text if the pinned state should be announced.
- Alternative option: give the element a valid semantic role only if the marker is meaningful as an image/status indicator.
- Keep visual output unchanged.

## Acceptance Criteria

- [x] `/news/` no longer fails `aria-prohibited-attr` for the pinned marker.
- [x] Screen readers still have access to the pinned state if it is meaningful content.
- [x] The pinned icon remains visually unchanged.
- [x] Existing news card tests continue to pass or are updated to assert the accessible behavior.

## Resolution

- `NewsCard.astro` now keeps the star marker visually unchanged, hides the decorative icon from the accessibility tree with `aria-hidden="true"`, and adds adjacent `sr-only` text: `Закреплено сверху`.
- The news title link is rendered without extra leading text whitespace.
- `NewsCard.test.ts` covers the rendered heading with an inline snapshot so the accessible marker structure is visible in review.

## Verification

- [x] Run the relevant NewsCard test if present, or add a focused render test.
- [x] Run `pnpm typecheck`.
- [x] Run Lighthouse or axe against `/news/` and verify the audit is resolved.

Verification results, 2026-05-15:

- `pnpm exec vitest run src/components/news/NewsCard.test.ts` passed.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `LIGHTHOUSE_SITE_TARGET=static LIGHTHOUSE_DISABLE_ANALYTICS=true pnpm exec lhci autorun` completed; representative `/news/` Accessibility was `100`, `aria-prohibited-attr` score was `1`, and the audit had `0` failing items.
- The same Lighthouse run still reported unrelated existing warnings: global static Best Practices `79 < 90`, `/status/` Accessibility `90 < 95`, and `/815/compare/` Performance `84 < 85`.

## Files Likely Touched

- `apps/www/src/components/news/NewsCard.astro`
- `apps/www/src/components/news/NewsCard.test.ts` if a focused test is added.

## Risks

- Removing the label without replacement may hide the pinned state from assistive technology.
- Adding a visible label could change layout; prefer visually hidden text if announcement is needed.
