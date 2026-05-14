# Task 08: Обновить тесты и визуальные снапшоты

## Цель

Привести тестовый слой к новой архитектуре единого дизайна и убрать ожидания старой compare-изоляции.

## Контекст

Часть тестов может фиксировать старые CSS/markup assumptions. Visual snapshots могут измениться после удаления compare overrides или изменения shared UI. Их нужно обновлять только после содержательного просмотра результата.

## Что сделать

- Проверить tests в `apps/www/src/compare/**/*.test.ts` на старые ожидания изоляции.
- Проверить `apps/www/src/compare/lib/index.architecture.test.ts`, чтобы не сломать explorer architecture.
- Проверить visual configs и snapshots, если затронутые компоненты имеют визуальные тесты.
- Обновить snapshots только после проверки, что новый вид соответствует единому сайту.
- Добавить или сохранить guard на отсутствие compare-level shared primitive overrides.

## Чего не делать

- Не ослаблять тесты, которые защищают payload architecture compare.
- Не обновлять visual snapshots автоматически без просмотра результата.
- Не добавлять тесты на случайную статику или Tailwind-классы, если это не архитектурный контракт.

## Критерии приемки

- Тесты больше не защищают старую визуальную автономию compare.
- Guard на отсутствие `.ui-root-compare .ui-*` overrides есть и проходит.
- Explorer architecture guard продолжает защищать client-only dataUrl model.
- Visual snapshots, если обновлены, отражают принятую новую модель.

## Проверка

- Запустить `pnpm --filter @shelkovo/www test`.
- Запустить relevant visual tests только если менялись covered visual surfaces.
- Запустить `pnpm --filter @shelkovo/www typecheck`.

## Вероятно затронутые файлы

- `apps/www/src/compare/lib/*.test.ts`
- `apps/www/src/compare/components/*.test.ts`
- `apps/www/playwright*.config.ts`
- visual snapshot directories, если они есть и реально затронуты

## Зависимости

Зависит от Tasks 04-07.
