# 090: Реализовать dataset и страницы полного регламента

## Цель

Только после завершения задач извлечения и проектирования перенести проверенные данные в приложение.

## Вход

- Контекст: `docs/reglament/full/000-agent-context.md`.
- Dataset contract: `docs/reglament/full/070-llm-dataset-contract.md`.
- Решение по страницам: `docs/reglament/full/080-public-pages-decision.md`.
- Извлеченные источники: `020-060`.

## Возможный выход

Финальные имена файлов уточнить по contract, но ориентировочно:

- `apps/www/src/data/reglament/full-2026.ts`.
- `apps/www/src/data/reglament/full-2026.test.ts`.
- `/reglament/data/full-2026.json`.
- `/reglament/full.md`.
- дополнительные публичные страницы, если они утверждены в `080`.
- обновление `/reglament/` короткими ссылками на новые страницы.
- обновление `llms.txt`, `llms-full.txt`, `api-catalog`, root discovery при необходимости.

## Ограничения

- Не менять расчетный движок калькулятора без отдельной задачи.
- Не смешивать dataset полного регламента с `estimate-2026.ts`, если это не требуется contract-ом.
- Не добавлять карты поселков.
- Не парсить PDF на клиенте.

## Acceptance Criteria

- [x] Код реализует contract из `070`.
- [x] Публичные страницы соответствуют решению из `080`.
- [x] `/reglament/` остается калькулятором и получает только короткие ссылки на новый слой.
- [x] LLM endpoints ссылаются на новый dataset.
- [x] Есть тесты на контрольные числа и наличие source refs.
- [x] Проходят релевантные проверки `pnpm --dir apps/www test` и `pnpm --dir apps/www build`.

## Зависимости

- Все задачи `010-080`.

## Выполнено

- 2026-05-07: добавлен `apps/www/src/data/reglament/full-2026.ts` с dataset `full-reglament-2026`.
- 2026-05-07: добавлены `/reglament/data/full-2026.json`, `/reglament/full.md`, `/reglament/assets/`, `/reglament/services/`.
- 2026-05-07: обновлены `/reglament/`, `llms.txt`, `llms-full.txt`, section/root discovery surfaces.
- 2026-05-07: проверки прошли: `pnpm --dir apps/www test`, `pnpm --dir apps/www typecheck`, `pnpm --dir apps/www build`.
