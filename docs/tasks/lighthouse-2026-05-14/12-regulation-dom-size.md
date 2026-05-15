# Task: Reduce Initial DOM Size On Regulation Calculator

## Goal

Reduce the initial DOM size and render delay of `/815/regulation/` without removing the detailed calculator functionality.

## Lighthouse Finding

- Category: Performance diagnostic.
- Affected URL: `/815/regulation/`.
- Current Performance score: `81`.
- LCP: about `3.5s`.
- DOM size: about `2,419` elements.
- Large nodes include detailed calculator rows, nested `details`, `dl`, labels, and inputs.

## Current Code

- `apps/www/src/pages/815/regulation/index.astro` renders a large interactive calculator/table.
- Many rows include multiple controls even when details are not immediately needed.

## Proposed Work

- Identify which calculator controls are needed above the fold.
- Keep summary totals and primary controls immediately available.
- Defer rendering secondary row details until a section or row is expanded.
- Consider server-rendering compact summaries and hydrating detailed inputs on demand.
- Preserve form semantics and keyboard navigation.

## Acceptance Criteria

- [x] Skipped: the DOM reduction is not worth the calculator complexity and accessibility tradeoff.

## Verification

- [x] No code verification needed because no production code changed for this task.

## Resolution

- This task is intentionally skipped.
- The current initial DOM is heavy, but reducing it would add lazy-rendering complexity to a transparent calculator with many editable controls.
- Keeping the calculator fully server-rendered is the safer tradeoff for maintainability, accessibility, and no-JavaScript transparency.

## Files Likely Touched

- `apps/www/src/pages/815/regulation/index.astro`
- Regulation-specific tests if they exist or are added.

## Risks

- Deferring inputs can break total calculation if scripts assume all fields exist at load.
- Native `details` behavior must remain accessible.
- Over-optimizing DOM size can make the calculator less transparent.
