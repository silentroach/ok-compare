# Task 04: Привести compare home к общему дизайну

## Цель

Сделать `/815/compare/` визуально частью сайта после удаления локальной изоляции shared UI.

## Контекст

Home compare page использует Svelte components и static fallback: `Hero.svelte`, `KPIStats.svelte`, `SettlementCard.svelte`, `SettlementsExplorer.svelte`. После удаления локальных overrides общие `.ui-shell`, `.ui-btn`, `.ui-chip` могут изменить визуальный ритм страницы. Нужно принять общий дизайн и убрать старые компенсации, если они остались в компонентах.

## Что сделать

- Проверить `apps/www/src/pages/815/compare/index.astro` после Tasks 01-03.
- Проверить `Hero.svelte`, `KPIStats.svelte`, `SettlementCard.svelte`, `SettlementsExplorer.svelte` на локальные классы, которые имитируют старую плоскую compare-стилистику.
- Сохранить static fallback list и client-only explorer architecture.
- Убедиться, что breadcrumbs, hero, KPI, explorer и fallback cards используют общий визуальный язык сайта.
- Если компоненту нужна плотность или особое поведение, дать ему compare-specific class, а не переопределять `.ui-*`.

## Чего не делать

- Не менять data loading и payload architecture explorer.
- Не передавать большой payload в Svelte island props.
- Не менять публичные routes и URLs.
- Не чинить secondary pages в этой задаче.

## Критерии приемки

- `/815/compare/` использует общие shared primitives без section-level overrides.
- Static fallback list остается для bots и no-JS users.
- `SettlementsExplorer` остается `client:only="svelte"` и получает `dataUrl`.
- Нет новых `.ui-root-compare .ui-*` rules.
- Визуальные различия с сайтом объясняются доменной функцией, а не старой изоляцией.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/compare`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.
- При возможности вручную проверить `/815/compare/` на desktop и mobile.

## Вероятно затронутые файлы

- `apps/www/src/pages/815/compare/index.astro`
- `apps/www/src/compare/components/Hero.svelte`
- `apps/www/src/compare/components/KPIStats.svelte`
- `apps/www/src/compare/components/SettlementCard.svelte`
- `apps/www/src/compare/components/SettlementsExplorer.svelte`
- `apps/www/src/compare/components/ComparisonBadge.svelte`

## Зависимости

Зависит от Tasks 01-03.
