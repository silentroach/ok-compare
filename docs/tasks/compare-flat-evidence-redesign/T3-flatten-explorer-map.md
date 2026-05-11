# T3 - Flatten Explorer Controls And Map Panel

Status: done.

Dependencies: T1.

Source: `docs/ideas/ui-ux-critique-2026-05-11/01-compare-flat-evidence-register.md`.

Task index: `docs/tasks/compare-flat-evidence-redesign.md`.

## Required Skills

- `frontend-ui-engineering`
- `tailwind-design-system`
- `svelte-code-writer`
- `copy-editing` if any visible Russian text changes
- `web-typography` if control labels or map popup text hierarchy changes materially

## Goal

Keep current explorer behavior and map placement, but remove the island panel and glass overlay feel from controls and map UI.

## Scope

In:

- Flatten the filter toolbar, result count, sort control and map toggle in `SettlementsExplorer.svelte`.
- Keep the map exactly in the current page flow: below filters, before count/sort and cards.
- Keep desktop map visible by default and mobile map hidden by default.
- Replace map popup glass/blur with an opaque readable evidence surface in `SettlementMap.svelte`.
- Update tests if class/structure changes affect queries.

Out:

- Do not add search, presets, saved filters or URL state.
- Do not move the map to a tab, collapsed block or lower section.
- Do not change marker data, map loading behavior or Yandex Maps integration.

## Likely Files

- `apps/www/src/compare/components/SettlementsExplorer.svelte`
- `apps/www/src/compare/components/SettlementMap.svelte`
- `apps/www/src/compare/components/SettlementsExplorer.svelte.test.ts`
- `apps/www/src/compare/components/SettlementMap.svelte.test.ts`

## Acceptance Criteria

- [x] Price filters, sort select, result count and map toggle keep their current behavior and accessible labels.
- [x] Map placement and responsive defaults remain covered by existing tests.
- [x] The controls read as one flat tool row/section rather than a floating card island.
- [x] Map popup text panel and arrow use an opaque surface and normal border; decorative `backdrop-blur` is removed.
- [x] No fast narrowing behavior is introduced in this task.

## Verification

- [x] Run Svelte autofixer on touched `.svelte` files.
- [x] Run `pnpm --dir apps/www test src/compare/components/SettlementsExplorer.svelte.test.ts src/compare/components/SettlementMap.svelte.test.ts`.
- [x] Run `pnpm --dir apps/www typecheck`.
- [x] Confirm no decorative map popup blur remains with `rg "backdrop-blur|backdrop-saturate|bg-card/" apps/www/src/compare/components/SettlementMap.svelte` or document any intentional functional exception.
- [x] Run `git diff --check`.

## Handoff Notes

- Record any intentional remaining translucent map treatment and the legibility reason for keeping it.

Completed notes:

- Explorer filters now sit in a flat `border-y` evidence row with explicit radio labels and scoped focus treatment instead of a `ui-shell` island.
- Result count and sort sit on a flat `border-b` row; the active-filter note is a text marker, not a pill.
- `SettlementMap` shell now uses a plain border and opaque surface; popup panel and arrow no longer use `bg-card/`, `backdrop-blur` or `backdrop-saturate`.

## Commit Message Suggestion

`flatten compare explorer map`
