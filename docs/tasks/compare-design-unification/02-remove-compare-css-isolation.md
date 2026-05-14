# Task 02: Убрать CSS-изоляцию compare

## Цель

Удалить локальную CSS-защиту compare от общей дизайн-системы сайта.

## Контекст

`apps/www/src/compare/styles/global.css` сейчас повторно импортирует `@shelkovo/ui/styles.css` и переопределяет shared primitives под `.ui-root-compare`. После смены продуктовой модели это становится техническим долгом.

## Что сделать

- Удалить `@import '@shelkovo/ui/styles.css';` из `apps/www/src/compare/styles/global.css`.
- Удалить overrides `.ui-root-compare .ui-shell`, `.ui-root-compare .ui-shell-strong`, `.ui-root-compare .ui-chip`, `.ui-root-compare .ui-btn`.
- Если файл становится пустым, решить, удалить его или оставить с коротким комментарием только при наличии будущих compare-specific правил.
- Если файл удаляется, убрать imports `@/compare/styles/global.css` со всех compare pages.
- Если файл остается, в нем должны быть только `.compare-*` или другие явно доменные классы, не `.ui-*` overrides.

## Чего не делать

- Не компенсировать удаление overrides точечными inline-классами на каждом компоненте.
- Не менять shared `packages/ui/styles.css` в этой задаче, кроме случая, когда без этого проект не собирается.
- Не менять DOM-структуру страниц без необходимости.

## Критерии приемки

- Compare CSS не импортирует общий UI повторно.
- Compare CSS не переопределяет shared `.ui-*` primitives через `.ui-root-compare`.
- Если `global.css` удален, не осталось битых imports.
- Task 01 guard проходит.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/compare/lib/styles.architecture.test.ts`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/compare/styles/global.css`
- `apps/www/src/pages/815/compare/index.astro`
- `apps/www/src/pages/815/compare/rating.astro`
- `apps/www/src/pages/815/compare/404.astro`
- `apps/www/src/pages/815/compare/settlements/[slug]/index.astro`

## Зависимости

Зависит от Task 01.
