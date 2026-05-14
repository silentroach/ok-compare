# Task: Restore Sequential Heading Order on Status Page

## Goal

Fix the heading hierarchy on `/status/` so service cards do not jump from the page `h1` directly to `h3`.

## Lighthouse Finding

- Category: Accessibility.
- Affected URL: `/status/`.
- Failing audit: `heading-order`.
- Element: service card heading such as `Электричество` rendered as `h3`.

## Current Code

- `apps/www/src/pages/status/index.astro` renders the page `h1` and then the service summary list.
- `apps/www/src/components/status/StatusServiceCard.astro` renders service names as `h3`.
- The first `h2` may appear later in conditional sections, so Lighthouse sees an invalid jump.

## Proposed Work

- Add an `h2` heading for the service overview section, possibly visually hidden if the UI does not need a visible label.
- Alternatively, allow `StatusServiceCard` to receive a heading level and render `h2` on the overview page.
- Prefer the smallest change that preserves reusable component semantics across pages.

## Acceptance Criteria

- [ ] `/status/` has a sequential heading outline from `h1` to `h2` to lower levels.
- [ ] Lighthouse no longer reports `heading-order` on `/status/`.
- [ ] Visual design is unchanged unless a visible section heading is intentionally added.
- [ ] Service detail pages still have correct heading hierarchy.

## Verification

- [ ] Run relevant Astro render tests if present.
- [ ] Run `pnpm typecheck`.
- [ ] Run Lighthouse or axe against `/status/`.
- [ ] Inspect headings manually with browser accessibility tools or rendered HTML.

## Files Likely Touched

- `apps/www/src/pages/status/index.astro`
- `apps/www/src/components/status/StatusServiceCard.astro` if heading level becomes configurable.

## Risks

- Changing `h3` to `h2` globally may break hierarchy on pages where cards are already nested under an `h2`.
- A hidden heading must use the project's existing visually hidden utility or a consistent accessible pattern.
