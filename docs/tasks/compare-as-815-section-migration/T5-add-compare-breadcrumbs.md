# T5: Add Compare Breadcrumbs And Breadcrumb JSON-LD

Status: todo

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Добавить видимые breadcrumbs через shared `@shelkovo/ui/Breadcrumbs.astro` и привести JSON-LD breadcrumbs к простой иерархии из идеи.

## Acceptance Criteria

- [ ] Compare index shows visible breadcrumbs `Главная > Сравнение тарифов`.
- [ ] Rating page shows visible breadcrumbs for the same hierarchy, without adding `Методика рейтинга` or `Тариф 815` breadcrumb.
- [ ] Settlement pages show `Главная > Сравнение тарифов > [Название поселка]`.
- [ ] JSON-LD `BreadcrumbList` uses `Главная` at `https://kpshelkovo.online/`, `Сравнение тарифов` at `https://kpshelkovo.online/815/compare/`, and settlement item only on settlement pages.
- [ ] Existing back links can remain if useful, but they must not contradict breadcrumbs.

## Verification

- [ ] `pnpm --dir apps/compare test`
- [ ] `pnpm --dir apps/compare typecheck`
- [ ] `pnpm --dir apps/compare build`
- [ ] Sample built HTML for index, rating and one settlement contains visible breadcrumb nav and JSON-LD breadcrumb names/URLs.

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

- [ ] Mark this file `Status: done`.
- [ ] Update task index status.
- [ ] Update handoff task registry and task log.
- [ ] Commit this task separately.
