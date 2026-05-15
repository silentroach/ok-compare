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

- [x] `/status/` unused JavaScript warning is reduced materially or resolved.
- [x] Timeline tooltips still work with mouse, keyboard, and touch.
- [x] Initial page rendering remains fully useful without waiting for JS.
- [x] No hydration or console errors are introduced.

## Verification

- [x] Run `apps/www/src/lib/status/timeline.dom.test.ts`.
- [x] Run `apps/www/src/components/status/StatusServiceTimeline.test.ts`.
- [x] Run `pnpm typecheck`.
- [x] Run Lighthouse against `/status/` and compare unused JS.
- [x] Manually test tooltip behavior after a hard reload on mobile and desktop widths.

## Result

- `StatusServiceTimeline.astro` now ships only a small lazy-loader on initial page load.
- `timeline.dom.ts` is loaded as a dynamic chunk on the first timeline segment `pointerover`, `focusin`, or `touchstart`, then hydrates all timelines and replays the initiating interaction.
- `touchstart` now opens the shared tooltip after hydration, matching the existing mouse and keyboard behavior.
- Built output splits the status timeline JavaScript into a `4.0K` initial loader (`1323` bytes gzip) and a separate lazy `timeline.dom` chunk.
- Static Lighthouse CI reported representative `/status/` Performance `0.97`; `unused-javascript` scored `1` with no reported items.
- Browser verification on `astro preview` at `390x844` and `1280x900` confirmed the tooltip opens after hard reload and the heavy chunk is not requested until interaction.
- `agent-browser errors` and `agent-browser console` were empty after the browser checks.

## Files Likely Touched

- `apps/www/src/components/status/StatusServiceTimeline.astro`
- `apps/www/src/lib/status/timeline.dom.ts`
- `apps/www/src/lib/status/timeline.dom.test.ts`

## Risks

- Lazy-loading interaction code can make first hover/focus feel delayed.
- Event delegation must still cover server-rendered timeline segments.
- Splitting code may reduce unused bytes but increase complexity; measure before keeping the split.
