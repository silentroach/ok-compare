# T5: Add Compare Breadcrumbs And Breadcrumb JSON-LD

Status: done

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Добавить видимые breadcrumbs через shared `@shelkovo/ui/Breadcrumbs.astro` и привести JSON-LD breadcrumbs к простой иерархии из идеи.

## Acceptance Criteria

- [x] Compare index shows visible breadcrumbs `Главная > Сравнение тарифов`.
- [x] Rating page shows visible breadcrumbs for the same hierarchy, without adding `Методика рейтинга` or `Тариф 815` breadcrumb.
- [x] Settlement pages show `Главная > Сравнение тарифов > [Название поселка]`.
- [x] JSON-LD `BreadcrumbList` uses `Главная` at `https://kpshelkovo.online/`, `Сравнение тарифов` at `https://kpshelkovo.online/815/compare/`, and settlement item only on settlement pages.
- [x] Existing back links can remain if useful, but they must not contradict breadcrumbs.

## Verification

- [x] `pnpm --dir apps/compare test`
- [x] `pnpm --dir apps/compare typecheck`
- [x] `pnpm --dir apps/compare build`
- [x] Sample built HTML for index, rating and one settlement contains visible breadcrumb nav and JSON-LD breadcrumb names/URLs.

## Dependencies

- T2.

## Likely Touched Files

- `apps/compare/src/pages/index.astro`
- `apps/compare/src/pages/rating.astro`
- `apps/compare/src/pages/settlements/[slug]/index.astro`
- Optional helper under `apps/compare/src/lib/` if it reduces duplication.
- `docs/tasks/compare-as-815-section-handoff.md`
- `docs/tasks/compare-as-815-section-migration.md`
- `docs/tasks/compare-as-815-section-migration/T5-add-compare-breadcrumbs.md`

## Estimated Scope

M.

## Completion

- [x] Mark this file `Status: done`.
- [x] Update task index status.
- [x] Update handoff task registry and task log.
- [x] Commit this task separately.
