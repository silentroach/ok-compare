# Task 03: Пересмотреть `ui-root-compare`

## Цель

Решить, нужен ли `bodyClass="ui-root-compare"` после удаления визуальной изоляции, и привести код к выбранной модели.

## Контекст

Compare pages сейчас передают `bodyClass="ui-root-compare"` в `BaseLayout.astro`. Раньше этот класс был нужен для scoped overrides shared UI. После Task 02 он либо становится лишним, либо остается только как нейтральный hook для compare-specific behavior.

## Что сделать

- Найти все uses `bodyClass="ui-root-compare"` в compare pages.
- Проверить, используется ли `.ui-root-compare` где-то после Task 02.
- Если класс не используется, удалить `bodyClass="ui-root-compare"` со страниц.
- Если класс нужен как semantic hook, оставить его и добавить guard, что через него нельзя переопределять shared `.ui-*` primitives.
- Если класс остается, документировать в ближайшем тесте или комментарии, что он предназначен только для compare-specific selectors.

## Чего не делать

- Не создавать новые `.ui-root-compare .ui-*` rules.
- Не переименовывать compare components ради этой задачи.
- Не менять layout compare pages, кроме удаления или сохранения body class.

## Критерии приемки

- В коде нет неиспользуемого `ui-root-compare`.
- Если `ui-root-compare` остается, его роль ясна и ограничена compare-specific styles.
- Guard из Task 01 покрывает выбранное решение.
- Страницы compare продолжают рендериться через общий `BaseLayout.astro`.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test -- src/compare/lib/styles.architecture.test.ts`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/pages/815/compare/index.astro`
- `apps/www/src/pages/815/compare/rating.astro`
- `apps/www/src/pages/815/compare/404.astro`
- `apps/www/src/pages/815/compare/settlements/[slug]/index.astro`
- `apps/www/src/compare/lib/styles.architecture.test.ts`

## Зависимости

Зависит от Task 02.
