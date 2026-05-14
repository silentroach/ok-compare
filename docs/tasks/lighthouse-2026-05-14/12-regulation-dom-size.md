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

- [ ] Initial DOM size is materially reduced from the current representative run.
- [ ] Calculator totals and editable controls still work after progressive reveal.
- [ ] LCP and Speed Index improve or remain stable.
- [ ] No accessibility regressions are introduced for inputs, labels, or details controls.

## Verification

- [ ] Run tests for regulation helpers or calculator behavior if present.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm build`.
- [ ] Run Lighthouse against `/815/regulation/` and compare DOM size, LCP, Speed Index, and TBT.
- [ ] Manually test editing quantities, frequencies, rates, and section expansion on mobile.

## Files Likely Touched

- `apps/www/src/pages/815/regulation/index.astro`
- Regulation-specific tests if they exist or are added.

## Risks

- Deferring inputs can break total calculation if scripts assume all fields exist at load.
- Native `details` behavior must remain accessible.
- Over-optimizing DOM size can make the calculator less transparent.
