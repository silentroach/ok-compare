# Task: Improve Status Timeline Touch Targets

## Goal

Make interactive status timeline segments large enough for touch users without losing the compact visual timeline design.

## Lighthouse Finding

- Category: Accessibility.
- Affected URL: `/status/`.
- Failing audit: `target-size`.
- Elements: `a.status-service-timeline__segment` around `7px` by `10px`.
- Issue: touch targets do not have sufficient size or spacing.

## Current Code

- `apps/www/src/components/status/StatusServiceTimeline.astro` visually renders event segments as small pills inside a one-rem high track.
- Interactive segments keep a 24px hit area while the visible marker stays compact.
- `/status/` and `/status/[service]/` use the same per-segment tooltip behavior: tooltip opens from the pill, not from empty track space.
- A full month on mobile can still place neighboring daily targets too close together, even when each target is 24px wide.

## Proposed Work

- Keep the visible marker compact.
- Keep the larger invisible hit area on each interactive segment.
- Ensure the focus ring reflects the larger interactive area or is still clearly visible.
- Avoid increasing timeline row height more than necessary.
- Treat any calendar day touched by a problem as a problem day on the visible timeline.
- Collapse same-day incidents into one day-width marker with grouped tooltip data.
- Keep `/status/` monthly on desktop, but render a weekly overview timeline on mobile so neighboring daily targets have enough spacing.

## Acceptance Criteria

- [x] Lighthouse no longer reports `target-size` failures for timeline segments on `/status/`.
- [x] Timeline still visually fits the existing row layout.
- [x] Dense neighboring markers remain individually focusable or the UI provides an accessible grouped fallback.
- [x] Touch, mouse, and keyboard interactions still open the correct tooltip.

## Verification

- [x] Run `apps/www/src/lib/status/timeline.dom.test.ts`.
- [x] Run `apps/www/src/components/status/StatusServiceTimeline.test.ts`.
- [x] Run `pnpm typecheck`.
- [x] Manually inspect `/status/` at mobile width via status visual regression.
- [x] Run Lighthouse against `/status/`.

## Result

- `/status/` service cards render a 7-day timeline below `lg` and a 30-day timeline at `lg` and above.
- `/status/[service]/` remains unchanged at 90 days.
- Tooltips stay bound to the visible per-segment pill controls; no track-level inspector or empty-track tooltip target is used.
- Same-day incidents share one day-width marker and grouped tooltip data.
- If one incident touches multiple calendar days, the marker spans those day slots.
- Verified `target-size` score is `1` in `.lighthouseci/lhr-1778834407810.json`; Lighthouse accessibility is `0.98`.
- The only remaining Lighthouse assertion is the existing best-practices warning at `0.79`.

## Files Likely Touched

- `apps/www/src/components/status/StatusServiceTimeline.astro`
- `apps/www/src/components/status/StatusServiceCard.astro`
- `apps/www/src/pages/status/index.astro`
- `apps/www/src/lib/status/timeline.dom.ts` if hit testing or tooltip positioning changes.

## Risks

- Larger hit areas can overlap and make the wrong event hard to select.
- Increasing visual marker size can make the timeline noisy.
- CSS-only pseudo-element solutions need careful pointer-event behavior.
