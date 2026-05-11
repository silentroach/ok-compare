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
| T1  | pending |        | `docs/tasks/compare-flat-evidence-redesign/T1-flatten-surface-primitives.md` |
| T2  | pending |        | `docs/tasks/compare-flat-evidence-redesign/T2-redesign-hero-kpi.md`          |
| T3  | pending |        | `docs/tasks/compare-flat-evidence-redesign/T3-flatten-explorer-map.md`       |
| T4  | pending |        | `docs/tasks/compare-flat-evidence-redesign/T4-flatten-settlement-cards.md`   |
| T5  | pending |        | `docs/tasks/compare-flat-evidence-redesign/T5-integrated-qa-closeout.md`     |

## Current Context Snapshot

Date: 2026-05-11.

- Source idea originally suggested a table-like evidence register, but discussion refined the first implementation to preserving current blocks and flattening their visual treatment.
- Current `/815/compare/` entrypoint is `apps/www/src/pages/815/compare/index.astro`.
- Current interactive compare UI is in Svelte 5 under `apps/www/src/compare/components`.
- Current page order: breadcrumbs, `Hero`, embedded `KPIStats`, `SettlementsExplorer`; static fallback renders `SettlementCard` grid until the explorer is ready.
- `SettlementsExplorer.svelte` currently owns price filters, map toggle, map placement, result count, sort select and rendered card grid.
- `SettlementMap.svelte` currently uses translucent blurred popup surfaces: `bg-card/42`, `backdrop-blur-sm` and `backdrop-saturate`.
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

### T0 - 2026-05-11 - planning docs created

Status: done.

Context:

- Created task index, handoff and one task file per implementation slice.
- Product direction: keep existing blocks and order; flatten visual system; leave fast narrowing for later.

Verification:

- Planning-only change. No code verification run.
