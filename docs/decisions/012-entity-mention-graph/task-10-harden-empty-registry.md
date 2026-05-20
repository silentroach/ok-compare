# Task 10: Защитить EMPTY_MENTION_REGISTRY от мутации

Статус: реализовано.

## Скилы

- `security-and-hardening` — защита shared mutable singleton.

## Цель

Защитить shared `EMPTY_MENTION_REGISTRY` от accidental mutation.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`

## Что сделать

- Заменить shared mutable `EMPTY_MENTION_REGISTRY: SiteMentionRegistry = new Map()` на `Object.freeze(new Map())` или создавать fresh `new Map()` локально внутри `build*Dataset`, когда registry не передан.
- Если выбирается `Object.freeze`, убедиться, что вызовы `.set()` на fallback registry бросают ошибку в dev, а не тихо мутируют shared state.
- Если выбирается fresh instance, убедиться, что это не ломает performance (Map allocation на каждый вызов без registry — это тривиальная стоимость).

## Важно не делать

- Не менять публичные API loaders.
- Не менять тип `SiteMentionRegistry`.

## Ожидаемые файлы

- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`

## Acceptance criteria

- [x] `EMPTY_MENTION_REGISTRY` не мутируем или не является shared mutable singleton.
- [x] Старые tests проходят.
- [x] `pnpm test` и `typecheck` проходят.

## Проверка

- [x] `pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts`
- [x] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [x] Прочитал обязательные файлы.
- [x] Заменил mutable empty registry на frozen/fresh.
- [x] Запустил проверки.
- [x] Использовал `code-simplification` после реализации.
- [ ] Сделал commit.

Commit оставлен на отдельный оркестраторский шаг: текущий агент не коммитит без явной команды пользователя.

## Commit message

`Freeze empty mention registry to prevent accidental mutation`
