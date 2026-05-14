# Task 05: Привести detail, rating и 404 страницы

## Цель

Привести остальные HTML-страницы compare к общей дизайн-системе сайта после home page.

## Контекст

Compare secondary pages используют тот же общий layout, но могут иметь старые локальные ожидания по shell, buttons, chips, prose и spacing. Основные targets: detail page поселка, rating page и compare 404.

## Что сделать

- Проверить `apps/www/src/pages/815/compare/settlements/[slug]/index.astro`.
- Проверить `apps/www/src/pages/815/compare/rating.astro`.
- Проверить `apps/www/src/pages/815/compare/404.astro`.
- Убрать локальные компенсации старой изоляции, если они есть.
- Сохранить доменные компоненты: ranking, tariff tables, infrastructure tables, sources, map.
- Для таблиц и data-viz использовать compare-specific классы или existing component classes, не shared `.ui-*` overrides.

## Чего не делать

- Не менять rating math, settlement schema, comparison logic или content data.
- Не менять Markdown, JSON, llms или OpenAPI outputs.
- Не переписывать Svelte components без необходимости.

## Критерии приемки

- Detail page, rating page и 404 выглядят как часть общего сайта.
- Shared primitives наследуются из `@shelkovo/ui`.
- Локальные стили относятся только к compare-domain surfaces.
- Навигация, breadcrumbs и links согласованы с остальными разделами сайта.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/compare`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.
- При возможности вручную проверить `/815/compare/rating/`, одну страницу `/815/compare/settlements/[slug]/` и compare 404.

## Вероятно затронутые файлы

- `apps/www/src/pages/815/compare/settlements/[slug]/index.astro`
- `apps/www/src/pages/815/compare/rating.astro`
- `apps/www/src/pages/815/compare/404.astro`
- `apps/www/src/compare/components/CommonSpacesTable.svelte`
- `apps/www/src/compare/components/InfrastructureTable.svelte`
- `apps/www/src/compare/components/ServiceTable.svelte`
- `apps/www/src/compare/components/SettlementMap.svelte`
- `apps/www/src/compare/components/SourcesList.svelte`
- `apps/www/src/compare/components/TariffRank.svelte`

## Зависимости

Зависит от Task 04.
