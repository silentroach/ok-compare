# Унификация дизайна compare

## Статус

План работ. Это не ADR и не реализация.

## Цель

Раздел `/815/compare/` должен выглядеть и вести себя как обычная часть `kpshelkovo.online`, а не как бывшее отдельное приложение внутри сайта.

Базовые визуальные примитивы должны приходить из `@shelkovo/ui` и общего `BaseLayout.astro`. Compare может держать локально только доменные компоненты и layout-правила для explorer, рейтинга, карт, таблиц и data-viz.

## Главный инвариант

Site design changes should intentionally affect compare unless compare has a documented domain-specific exception.

Практически это означает:

- compare не переопределяет shared-примитивы через `.ui-root-compare .ui-*`;
- compare не импортирует `@shelkovo/ui/styles.css` повторно, если страница уже рендерится через `BaseLayout.astro`;
- если общий `ui-shell`, `ui-btn`, `ui-chip`, `ui-copy` или link style плохо работают для compare, чинить нужно общий примитив или создать явно названный reusable primitive;
- локальные классы compare должны описывать доменную поверхность, например `.compare-explorer`, `.compare-rating`, `.compare-map`, `.compare-tariff-table`.

## Не цели

- Не переписывать доменную логику compare.
- Не менять публичные JSON, Markdown, OpenAPI, llms или discovery-контракты compare без отдельной причины.
- Не выносить весь compare в пакет.
- Не делать визуальный редизайн ради редизайна.
- Не трогать news, status, people и reglament, кроме проверки регрессий shared UI.

## Порядок выполнения

Выполнять последовательно. Каждая задача должна оставлять проект в рабочем состоянии.

1. [Task 01: Обновить архитектурный guard стилей](01-update-style-architecture-guard.md)
2. [Task 02: Убрать CSS-изоляцию compare](02-remove-compare-css-isolation.md)
3. [Task 03: Пересмотреть `ui-root-compare`](03-review-ui-root-compare.md)
4. [Task 04: Привести compare home к общему дизайну](04-align-compare-home.md)
5. [Task 05: Привести detail, rating и 404 страницы](05-align-compare-secondary-pages.md)
6. [Task 06: Чинить shared UI вместо локальных override](06-fix-shared-ui-primitives.md)
7. [Task 07: Поднять reusable compare-паттерны в `packages/ui`](07-extract-reusable-patterns.md)
8. [Task 08: Обновить тесты и визуальные снапшоты](08-update-tests-and-visual-snapshots.md)
9. [Task 09: Финальная проверка унификации](09-final-verification.md)

## Чекпоинты

После задач 1-3:

- старый guard на изоляцию compare удален или заменен;
- локальные overrides shared `.ui-*` примитивов отсутствуют;
- решение по `ui-root-compare` явно отражено в коде и тестах.

После задач 4-5:

- основные compare-страницы используют общий визуальный язык сайта;
- локальные стили остались только у доменных compare-поверхностей;
- вручную проверены `/815/compare/`, `/815/compare/rating/`, одна detail-страница поселка и `/815/compare/404/` или соответствующий 404 route.

После задач 6-8:

- если shared-примитивы менялись, проверены другие разделы сайта;
- reusable-паттерны вынесены только при реальной повторяемости;
- тесты больше не фиксируют старую визуальную автономию compare.

После задачи 9:

- `pnpm --filter @shelkovo/www test` проходит;
- `pnpm --filter @shelkovo/www typecheck` проходит;
- `pnpm build` проходит или причина сбоя явно задокументирована;
- нет локальных compare overrides shared `.ui-*` примитивов.

## Общие правила для агентов

- Перед работой читать `AGENTS.md` и `apps/www/AGENTS.md`.
- Не запускать `pnpm dev` без явной просьбы.
- Не менять данные compare и публичные feeds, если задача явно про визуальный слой.
- Не делать соседние задачи без отдельного согласования.
- Если обнаружен конфликт с изменениями пользователя или другого агента, остановиться и спросить.
- Если нужно менять `packages/ui/styles.css`, проверить затронутые разделы `apps/www`.
- Если task приводит к изменению видимого текста, отдельно применить правила copy и типографики проекта.
- Если task правит `.svelte` компоненты, использовать `svelte-code-writer` и соответствующие Svelte-проверки.

## Исходные точки кода

- `apps/www/src/compare/styles/global.css` сейчас содержит локальные overrides shared UI.
- `apps/www/src/compare/lib/styles.architecture.test.ts` сейчас охраняет старую модель изоляции.
- `apps/www/src/layouts/BaseLayout.astro` подключает общий `@shelkovo/ui/styles.css`.
- Compare pages используют `bodyClass="ui-root-compare"`.
- Основные compare-компоненты живут в `apps/www/src/compare/components`.
