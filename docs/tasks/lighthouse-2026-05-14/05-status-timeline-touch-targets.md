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
- The interactive hit area matches the tiny visual marker.

## Proposed Work

- Keep the visible marker compact.
- Add a larger invisible hit area for interactive segments using padding, pseudo-elements, or a wrapper.
- Ensure the focus ring reflects the larger interactive area or is still clearly visible.
- Avoid increasing timeline row height more than necessary.
- Confirm overlapping incidents remain reachable when markers are dense.

## Acceptance Criteria

- [ ] Lighthouse no longer reports `target-size` failures for timeline segments on `/status/`.
- [ ] Timeline still visually fits the existing row layout.
- [ ] Dense neighboring markers remain individually focusable or the UI provides an accessible grouped fallback.
- [ ] Touch, mouse, and keyboard interactions still open the correct tooltip.

## Verification

- [ ] Run `apps/www/src/lib/status/timeline.dom.test.ts`.
- [ ] Run `apps/www/src/components/status/StatusServiceTimeline.test.ts`.
- [ ] Run `pnpm typecheck`.
- [ ] Manually inspect `/status/` at mobile width.
- [ ] Run Lighthouse against `/status/`.

## Files Likely Touched

- `apps/www/src/components/status/StatusServiceTimeline.astro`
- `apps/www/src/lib/status/timeline.dom.ts` if hit testing or tooltip positioning changes.

## Risks

- Larger hit areas can overlap and make the wrong event hard to select.
- Increasing visual marker size can make the timeline noisy.
- CSS-only pseudo-element solutions need careful pointer-event behavior.
