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

- [x] `/status/` has a sequential heading outline from `h1` to `h2` to lower levels.
- [x] Lighthouse no longer reports `heading-order` on `/status/`.
- [x] Visual design is unchanged unless a visible section heading is intentionally added.
- [x] Service detail pages still have correct heading hierarchy.

## Resolution

- `/status/` now labels the service overview section with a visually hidden `h2`: `Сводка по сервисам`.
- The section uses `aria-labelledby="status-services-title"`, so the heading is part of the semantic outline without adding visible UI.
- `StatusServiceCard.astro` remains unchanged; cards still render service names as `h3`, preserving their semantics under the new overview `h2`.
- `src/lib/status/status-page-heading.test.ts` locks the first heading sequence as `h1` -> hidden overview `h2` -> service-card `h3`.

## Verification

- [x] Run relevant Astro render tests if present.
- [x] Run `pnpm typecheck`.
- [x] Run Lighthouse or axe against `/status/`.
- [x] Inspect headings manually with browser accessibility tools or rendered HTML.

Verification results, 2026-05-15:

- `pnpm exec vitest run src/lib/status/status-page-heading.test.ts` passed.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `LIGHTHOUSE_SITE_TARGET=static LIGHTHOUSE_DISABLE_ANALYTICS=true pnpm exec lhci autorun` completed; representative `/status/` Accessibility was `100`, `heading-order` score was `1`, and the audit had `0` failing items.
- Generated `dist/www/status/index.html` starts with this heading outline: `h1: Статус КП Шелково`, `h2: Сводка по сервисам`, then service-card `h3` headings.
- The same Lighthouse run still reported existing unrelated warnings: global static Best Practices `79 < 90` and `/815/compare/` Performance `84 < 85`.

## Files Likely Touched

- `apps/www/src/pages/status/index.astro`
- `apps/www/src/components/status/StatusServiceCard.astro` if heading level becomes configurable.

## Risks

- Changing `h3` to `h2` globally may break hierarchy on pages where cards are already nested under an `h2`.
- A hidden heading must use the project's existing visually hidden utility or a consistent accessible pattern.
