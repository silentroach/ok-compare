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

- [ ] `/news/` no longer fails `aria-prohibited-attr` for the pinned marker.
- [ ] Screen readers still have access to the pinned state if it is meaningful content.
- [ ] The pinned icon remains visually unchanged.
- [ ] Existing news card tests continue to pass or are updated to assert the accessible behavior.

## Verification

- [ ] Run the relevant NewsCard test if present, or add a focused render test.
- [ ] Run `pnpm typecheck`.
- [ ] Run Lighthouse or axe against `/news/` and verify the audit is resolved.

## Files Likely Touched

- `apps/www/src/components/news/NewsCard.astro`
- `apps/www/src/components/news/NewsCard.test.ts` if a focused test is added.

## Risks

- Removing the label without replacement may hide the pinned state from assistive technology.
- Adding a visible label could change layout; prefer visually hidden text if announcement is needed.
