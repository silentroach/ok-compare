# Compare Flat Evidence Redesign Handoff

This file is the shared context log for agents working through `docs/tasks/compare-flat-evidence-redesign.md` and task files in `docs/tasks/compare-flat-evidence-redesign/`.

Use it to pass forward facts that are not obvious from the current task diff: command results, UI decisions, discovered gotchas, intentional leftovers and validation gaps.

## Update Protocol

1. Before starting a task, add a short note under `Task Log` with task ID, date and status `in_progress`.
2. During the task, append only context that another agent would need. Avoid narrating routine edits.
3. Before committing, update task status, verification results, intentional leftovers and commit hash/message if known.
4. Keep `Task Registry` in sync with `docs/tasks/compare-flat-evidence-redesign.md`.
5. Do not use this file as a substitute for code comments or tests.

## Task Registry

| ID  | Status  | Commit | Notes                                                                        |
| --- | ------- | ------ | ---------------------------------------------------------------------------- |
| T1  | done    |        | `docs/tasks/compare-flat-evidence-redesign/T1-flatten-surface-primitives.md` |
| T2  | done    |        | `docs/tasks/compare-flat-evidence-redesign/T2-redesign-hero-kpi.md`          |
| T3  | done    |        | `docs/tasks/compare-flat-evidence-redesign/T3-flatten-explorer-map.md`       |
| T4  | pending |        | `docs/tasks/compare-flat-evidence-redesign/T4-flatten-settlement-cards.md`   |
| T5  | pending |        | `docs/tasks/compare-flat-evidence-redesign/T5-integrated-qa-closeout.md`     |

## Current Context Snapshot

Date: 2026-05-11.

- Source idea originally suggested a table-like evidence register, but discussion refined the first implementation to preserving current blocks and flattening their visual treatment.
- Current `/815/compare/` entrypoint is `apps/www/src/pages/815/compare/index.astro`.
- Current interactive compare UI is in Svelte 5 under `apps/www/src/compare/components`.
- Current page order: breadcrumbs, `Hero`, embedded `KPIStats`, `SettlementsExplorer`; static fallback renders `SettlementCard` grid until the explorer is ready.
- `SettlementsExplorer.svelte` currently owns price filters, map toggle, map placement, result count, sort select and rendered card grid.
- `SettlementMap.svelte` popup now uses an opaque bordered surface; old `bg-card/42`, `backdrop-blur-sm` and `backdrop-saturate` treatment was removed in T3.
- `SettlementCard.svelte` currently uses `ui-shell`, hover translate and hover shadow.
- Compare-local shell overrides live in `apps/www/src/compare/styles/global.css` and are guarded by `apps/www/src/compare/lib/styles.architecture.test.ts`.

## Intentional Scope Boundaries

- Do not rebuild the page as a table-first UI in this task package.
- Do not move the map.
- Do not add search, presets, saved filters, URL state or fast narrowing.
- Do not change rating math, tariff normalization or settlement data schema.
- Do not change compare routes, breadcrumbs, canonicals, sitemap or nginx config.

## Validation Gaps To Track

- Real browser visual review may need explicit approval to run a dev server.
- Yandex Maps visual behavior may need manual review because unit tests use mocks.
- If visual diffs are large, capture before/after notes in task logs because no compare-specific visual snapshot suite exists yet.

## Task Log

### T3 - 2026-05-11 - flatten explorer controls and map panel

Status: done.

Context:

- Scope is limited to `SettlementsExplorer.svelte`, `SettlementMap.svelte`, related tests if needed and this task documentation.
- Preserve filter behavior, count/sort behavior, map placement and desktop/mobile map defaults.
- Explorer controls now use a flat `border-y` evidence row, with filter radio labels, count/sort row and map toggle kept in the same page flow.
- Active filters are marked by a text marker with a divider, not a pill.
- `SettlementMap` shell now uses a plain border and opaque surface; map popup panel and arrow use `bg-[color:var(--color-surface)]` with `border-border`, without blur/saturate/glass classes.

Verification:

- Svelte autofixer passed for `SettlementsExplorer.svelte` and `SettlementMap.svelte` with no issues; remaining suggestions were pre-existing state/effect and bind:this patterns outside T3 scope.
- `pnpm --dir apps/www test src/compare/components/SettlementsExplorer.svelte.test.ts src/compare/components/SettlementMap.svelte.test.ts` passed.
- `pnpm --dir apps/www typecheck` passed.
- `rg "backdrop-blur|backdrop-saturate|bg-card/" apps/www/src/compare/components/SettlementMap.svelte` produced no matches.
- `git diff --check` passed.

Intentional leftovers:

- No browser visual review was run because the workflow forbids `pnpm dev` without explicit approval.
- Settlement result cards remain for T4.

### T2 - 2026-05-11 - redesign hero and KPI summary as flat evidence intro

Status: done.

Context:

- Scope is limited to `Hero.svelte`, `KPIStats.svelte`, related component tests and this task documentation.
- Preserve current title, subtitle, rating link, peer median, all-settlements median and delta text; redesign only the visual hierarchy and surface treatment.
- Hero now uses a flat `border-y` intro surface, `bg-[color:var(--color-bg-soft)]`, typography and a desktop grid instead of `ui-shell-strong`.
- Embedded `KPIStats` now sits as divided evidence items inside the hero, not as nested rounded/shadowed tiles.
- Standalone `KPIStats` keeps the flat compare `ui-shell` wrapper and uses inner dividers rather than raised cards.
- Component tests now guard subtitle link rendering and reject `rounded`, `shadow`, `bg-card` and `surface-raised` inner KPI tile vocabulary.

Verification:

- Svelte autofixer passed for `Hero.svelte` and `KPIStats.svelte` with no issues.
- `pnpm --dir apps/www test src/compare/components/Hero.svelte.test.ts src/compare/components/KPIStats.svelte.test.ts` passed.
- `pnpm --dir apps/www typecheck` passed.
- `git diff --check` passed.

Intentional leftovers:

- No browser visual review was run because the workflow forbids `pnpm dev` without explicit approval.
- Explorer controls, map popup and settlement cards remain for T3-T4.

### T1 - 2026-05-11 - flatten compare surface primitives

Status: done.

Context:

- Compare-local `ui-shell` now uses a transparent surface, top divider, zero radius and no shadow.
- Compare-local `ui-shell-strong` now differs only by a stronger top divider, not by elevation.
- Compare-local `ui-chip` is text-like by default: no background, border, radius or pill padding.
- Compare-local `ui-btn` explicitly keeps square corners so filters remain usable without making every control a decorative pill.
- Architecture test snapshots guard these four primitive rules and reject the old raised shell vocabulary: `var(--shadow-1)`, `var(--shadow-2)`, `border-radius: 1rem`, `background: var(--color-card)` and `background: var(--color-elevated)` inside shell rules.

Verification:

- `pnpm --dir apps/www test src/compare/lib/styles.architecture.test.ts` passed.
- `pnpm --dir apps/www typecheck` passed.
- `git diff --check` passed.

Intentional leftovers:

- Hero, KPI, explorer, map popup and settlement-card layout remain for T2-T4.
- No browser visual review was run because T1 only changes local primitives and the workflow forbids `pnpm dev` without explicit approval.

### T0 - 2026-05-11 - planning docs created

Status: done.

Context:

- Created task index, handoff and one task file per implementation slice.
- Product direction: keep existing blocks and order; flatten visual system; leave fast narrowing for later.

Verification:

- Planning-only change. No code verification run.
