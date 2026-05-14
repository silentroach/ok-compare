# Task 07: Поднять reusable compare-паттерны в `packages/ui`

## Цель

Вынести из compare только те UI-паттерны, которые после унификации явно стали полезны другим разделам сайта.

## Контекст

Не все compare components должны становиться shared UI. Settlement card, tariff rank и comparison badge доменные. Но compact stat row, table shell, source/action link pattern или neutral data panel могут оказаться reusable.

## Что сделать

- После Tasks 04-06 просмотреть compare components и page markup на повторяемые UI-паттерны.
- Для каждого кандидата проверить, есть ли похожий сценарий в news/status/reglament.
- Если паттерн реально reusable, вынести минимальный primitive в `packages/ui`.
- Добавить export в `packages/ui/package.json` только для публичного reusable primitive.
- Обновить imports в compare и при необходимости в другом разделе, где primitive сразу используется.

## Чего не делать

- Не выносить доменные compare-компоненты.
- Не создавать абстракции на один use case.
- Не менять публичный API `packages/ui` без понятного имени и минимального props contract.
- Не делать package extraction ради чистоты, если локальный компонент проще.

## Критерии приемки

- Каждый вынесенный primitive имеет минимум два убедительных сценария или очевидный cross-section смысл.
- `packages/ui` не знает про settlement, tariff, rating, compare routes или compare data.
- Compare imports shared primitive из `@shelkovo/ui`, а не копирует local pattern.
- Если reusable кандидатов нет, task может быть закрыт как no-op с коротким объяснением.

## Проверка

- Запустить `pnpm --filter @shelkovo/ui test`.
- Запустить `pnpm --filter @shelkovo/www test`.
- Запустить `pnpm --filter @shelkovo/www typecheck`.
- Если добавлен Astro/Svelte primitive, проверить exports package и affected imports.

## Вероятно затронутые файлы

- `packages/ui/src/*`
- `packages/ui/package.json`
- `packages/ui/styles.css`
- `apps/www/src/compare/components/*`
- `apps/www/src/pages/815/compare/**`

## Зависимости

Зависит от Task 06.
