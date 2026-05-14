# Task 06: Чинить shared UI вместо локальных override

## Цель

Если после унификации compare показывает проблемы общего `@shelkovo/ui`, исправить shared primitives так, чтобы они работали для всего сайта.

## Контекст

Удаление compare overrides может показать, что `ui-shell`, `ui-btn`, `ui-chip`, `ui-copy` или link styles слишком декоративны, слишком плотны или недостаточно универсальны. Новая модель запрещает лечить это через `.ui-root-compare .ui-*`.

## Что сделать

- Собрать конкретные проблемы shared primitives после Tasks 04-05.
- Для каждой проблемы решить, это общий дефект дизайна или доменная потребность compare.
- Если дефект общий, править `packages/ui/styles.css`.
- Если это доменная потребность compare, использовать compare-specific class на доменном компоненте.
- После правок shared UI проверить news/status/reglament/people surfaces, которые используют те же primitives.

## Чего не делать

- Не добавлять section-specific overrides shared primitives.
- Не ухудшать читаемость news/status ради compare.
- Не вводить новый shared primitive без реального повторного сценария.
- Не делать большой редизайн всего сайта.

## Критерии приемки

- Все изменения shared primitives полезны не только для compare или явно безопасны для всего сайта.
- Compare не получает специальных `.ui-root-compare .ui-*` правил.
- News/status/reglament не имеют очевидных визуальных регрессий от изменения shared UI.
- Если правки shared UI не нужны, task может быть закрыт с явной пометкой no-op.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.
- При изменении `packages/ui` запустить релевантные package tests, например `pnpm --filter @shelkovo/ui test`.
- При возможности вручную проверить compare, news, status и regulation pages.

## Вероятно затронутые файлы

- `packages/ui/styles.css`
- `packages/ui/src/*.astro`
- `packages/ui/src/*.svelte`
- `apps/www/src/pages/815/compare/**`
- `apps/www/src/components/news/**`
- `apps/www/src/components/status/**`

## Зависимости

Зависит от Tasks 04-05.
