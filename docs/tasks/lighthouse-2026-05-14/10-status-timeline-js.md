# Task: Reduce Unused Status Timeline JavaScript

## Goal

Reduce unused JavaScript on `/status/` by loading status timeline behavior only when needed or trimming the timeline client script.

## Lighthouse Finding

- Category: Performance.
- Affected URL: `/status/`.
- Audit: `unused-javascript`.
- Reported asset: `StatusServiceTimeline.astro_astro_type_script_index_0_lang...js`.
- Estimated unused bytes: about `48 KiB`.

## Current Code

- `apps/www/src/components/status/StatusServiceTimeline.astro` renders timeline markup and likely includes client behavior for tooltips.
- `apps/www/src/lib/status/timeline.dom.ts` contains DOM behavior for timeline interaction.

## Proposed Work

- Profile which parts of `timeline.dom.ts` are actually needed on initial load.
- Move non-critical tooltip hydration to idle, first pointer interaction, or first focus event.
- Split static timeline rendering from interactive tooltip behavior if practical.
- Avoid adding a framework island if a small DOM script remains enough.

## Acceptance Criteria

- [ ] `/status/` unused JavaScript warning is reduced materially or resolved.
- [ ] Timeline tooltips still work with mouse, keyboard, and touch.
- [ ] Initial page rendering remains fully useful without waiting for JS.
- [ ] No hydration or console errors are introduced.

## Verification

- [ ] Run `apps/www/src/lib/status/timeline.dom.test.ts`.
- [ ] Run `apps/www/src/components/status/StatusServiceTimeline.test.ts`.
- [ ] Run `pnpm typecheck`.
- [ ] Run Lighthouse against `/status/` and compare unused JS.
- [ ] Manually test tooltip behavior after a hard reload on mobile and desktop widths.

## Files Likely Touched

- `apps/www/src/components/status/StatusServiceTimeline.astro`
- `apps/www/src/lib/status/timeline.dom.ts`
- `apps/www/src/lib/status/timeline.dom.test.ts`

## Risks

- Lazy-loading interaction code can make first hover/focus feel delayed.
- Event delegation must still cover server-rendered timeline segments.
- Splitting code may reduce unused bytes but increase complexity; measure before keeping the split.
