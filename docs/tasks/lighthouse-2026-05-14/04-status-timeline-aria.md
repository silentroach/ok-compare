# Task: Fix Prohibited ARIA on Status Timeline Segments

## Goal

Remove invalid `aria-label` usage from non-link timeline segments on `/status/` while preserving keyboard access and tooltip behavior.

## Lighthouse Finding

- Category: Accessibility.
- Affected URL: `/status/`.
- Failing audit: `aria-prohibited-attr`.
- Elements: `span.status-service-timeline__segment` with `tabindex="0"` and `aria-label`.
- Explanation: `aria-label` cannot be used on a `span` with no valid role attribute.

## Current Code

- `apps/www/src/components/status/StatusServiceTimeline.astro` uses `a` for segments with a detail page and `span` for segments without a link.
- Non-link segments receive `tabindex="0"`, `title`, and `aria-label` so keyboard users can focus them and read the tooltip label.
- `apps/www/src/lib/status/timeline.dom.ts` likely depends on these segment classes and data attributes for tooltip behavior.

## Proposed Work

- Keep link segments as `<a>`.
- For non-link interactive segments, use a valid semantic element or role.
- Preferred option: render non-link segments as `<button type="button">` with the existing `aria-label`, reset button styling in CSS, and keep data attributes unchanged.
- Alternative option: keep `<span>` but add a valid role such as `role="button"`; this is less semantic than a real button and should only be used if button behavior conflicts with layout.
- Ensure keyboard behavior works for focus and tooltip activation.

## Acceptance Criteria

- [ ] `/status/` no longer fails `aria-prohibited-attr` for timeline segments.
- [ ] Non-link timeline segments remain keyboard focusable.
- [ ] Tooltip behavior still works for mouse, touch, and keyboard focus.
- [ ] Link segments still navigate to incident detail pages.

## Verification

- [ ] Run `apps/www/src/components/status/StatusServiceTimeline.test.ts`.
- [ ] Run `apps/www/src/lib/status/timeline.dom.test.ts`.
- [ ] Run `pnpm typecheck`.
- [ ] Run Lighthouse or axe against `/status/`.

## Files Likely Touched

- `apps/www/src/components/status/StatusServiceTimeline.astro`
- `apps/www/src/lib/status/timeline.dom.ts`
- `apps/www/src/components/status/StatusServiceTimeline.test.ts`
- `apps/www/src/lib/status/timeline.dom.test.ts`

## Risks

- Replacing `span` with `button` can introduce default browser styles unless fully reset.
- Tooltip event delegation may assume tag names or focus behavior.
- Buttons inside links would be invalid, so keep the `a` and non-link cases separate.
