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

- [x] `/status/` no longer fails `aria-prohibited-attr` for timeline segments.
- [x] Non-link timeline segments remain keyboard focusable.
- [x] Tooltip behavior still works for mouse, touch, and keyboard focus.
- [x] Link segments still navigate to incident detail pages.

## Resolution

- `StatusServiceTimeline.astro` now renders timeline segments with detail pages as `<a>` and tooltip-only segments as `<button type="button">`.
- The segment styling, data attributes, `aria-label`, and shared tooltip binding remain unchanged.
- Component snapshots cover the anchor/button SSR contract; DOM tests cover tooltip focus behavior on button segments.

## Verification

- [x] Run `apps/www/src/components/status/StatusServiceTimeline.test.ts`.
- [x] Run `apps/www/src/lib/status/timeline.dom.test.ts`.
- [x] Run `pnpm typecheck`.
- [x] Run Lighthouse or axe against `/status/`.

Verification results, 2026-05-15:

- `pnpm exec vitest run src/components/status/StatusServiceTimeline.test.ts` passed.
- `pnpm exec vitest run src/lib/status/timeline.dom.test.ts` passed.
- `pnpm typecheck` passed.
- `LIGHTHOUSE_DISABLE_ANALYTICS=true pnpm build` passed.
- `LIGHTHOUSE_SITE_TARGET=static LIGHTHOUSE_DISABLE_ANALYTICS=true pnpm exec lhci autorun` completed; representative `/status/` `aria-prohibited-attr` audit was `score=1` with `0` failing items.
- The same Lighthouse run still reported existing unrelated warnings: `/status/` Accessibility `94 < 95` due remaining `target-size` and `heading-order` audits, and `/815/compare/` Performance `84 < 85`.

## Files Likely Touched

- `apps/www/src/components/status/StatusServiceTimeline.astro`
- `apps/www/src/lib/status/timeline.dom.ts`
- `apps/www/src/components/status/StatusServiceTimeline.test.ts`
- `apps/www/src/lib/status/timeline.dom.test.ts`

## Risks

- Replacing `span` with `button` can introduce default browser styles unless fully reset.
- Tooltip event delegation may assume tag names or focus behavior.
- Buttons inside links would be invalid, so keep the `a` and non-link cases separate.
