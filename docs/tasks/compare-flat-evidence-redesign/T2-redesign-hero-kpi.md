# T2 - Redesign Hero And KPI Summary As Flat Evidence Intro

Status: done.

Dependencies: T1.

Source: `docs/ideas/ui-ux-critique-2026-05-11/01-compare-flat-evidence-register.md`.

Task index: `docs/tasks/compare-flat-evidence-redesign.md`.

## Required Skills

- `frontend-ui-engineering`
- `tailwind-design-system`
- `svelte-code-writer`
- `copy-editing` if any visible Russian text changes
- `web-typography` if text hierarchy, reading width or type scale changes materially

## Goal

Keep the current intro content, but make the hero and KPI summary read as a calm evidence introduction instead of a SaaS hero-metric card.

## Scope

In:

- Redesign `Hero.svelte` as a flat page intro using the post-T1 surface vocabulary.
- Redesign embedded and standalone `KPIStats.svelte` so metrics are not nested raised cards.
- Preserve current facts: title, subtitle, rating link, peer median, all-settlements median and delta text.
- Update component tests when markup or class expectations change.

Out:

- Do not add new metrics.
- Do not change tariff/rating calculations.
- Do not move the map, filters or settlement list.

## Likely Files

- `apps/www/src/compare/components/Hero.svelte`
- `apps/www/src/compare/components/KPIStats.svelte`
- `apps/www/src/compare/components/Hero.svelte.test.ts`
- `apps/www/src/compare/components/KPIStats.svelte.test.ts`

## Acceptance Criteria

- [x] The hero no longer depends on a raised `ui-shell-strong` treatment for its primary visual hierarchy.
- [x] Embedded KPI stats render as flat evidence items or rows, not as nested rounded/shadowed tiles.
- [x] Standalone `KPIStats` remains valid if used outside the hero.
- [x] Existing Russian labels remain understandable and correctly associated with their numbers.
- [x] Existing tests still cover semantic `h1`, subtitle/link rendering and KPI values after the redesign.

## Verification

- [x] Run Svelte autofixer on touched `.svelte` files.
- [x] Run `pnpm --dir apps/www test src/compare/components/Hero.svelte.test.ts src/compare/components/KPIStats.svelte.test.ts`.
- [x] Run `pnpm --dir apps/www typecheck`.
- [x] Run `git diff --check`.

## Handoff Notes

- Record any new reusable intro/KPI class pattern in `docs/tasks/compare-flat-evidence-redesign-handoff.md` for T5 review.

Completed notes:

- Hero now uses a flat `border-y` intro surface with `bg-[color:var(--color-bg-soft)]`, typography and responsive grid hierarchy instead of `ui-shell-strong`.
- KPI metrics now render as flat divided evidence items. Avoid reintroducing inner `rounded`, `shadow`, `bg-card` or `surface-raised` tiles for the embedded or standalone variants.

## Commit Message Suggestion

`flatten compare hero metrics`
