# Task 08: Вынести shared content helper и защитить empty mention registry

Статус: не реализовано.

## Скилы

- `code-simplification` — устранение дублирования.
- `test-driven-development` — defensive тест на immutability empty registry.

## Цель

Устранить дублирование `content` helper в loaders и защитить shared `EMPTY_MENTION_REGISTRY` от accidental mutation.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/markdown/render.ts`
- `apps/www/src/lib/markdown/render.types.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/people/load.ts`

## Что сделать

- Вынести `content` helper из `news/load.ts`, `status/load.ts` и `people/load.ts` в `apps/www/src/lib/markdown/render.ts`.
- Новый helper должен принимать `(markdown: string, context: string, registry: SiteMentionRegistry, sourceEntity?)` и возвращать `PreprocessedSiteMarkdown`.
- Экспортировать helper из `apps/www/src/lib/markdown/render.ts` (или через `render.types.ts` если это чище).
- Обновить все три loaders, чтобы они использовали вынесенный helper.
- Заменить shared mutable `EMPTY_MENTION_REGISTRY` на `Object.freeze(new Map())` или создавать новый `new Map()` локально в `build*Dataset`, когда registry не передан.
- Добавить defensive тест, который доказывает, что попытка мутировать `EMPTY_MENTION_REGISTRY` (если остался singleton) не влияет на последующие вызовы, или что она бросает ошибку (freeze).

## Важно не делать

- Не менять публичные типы schema (`NewsArticle`, `StatusIncident`, `PersonProfile`).
- Не менять публичные dataset shapes.
- Не убирать optional `mention_registry` из opts loaders.

## Ожидаемые файлы

- `apps/www/src/lib/markdown/render.ts`
- `apps/www/src/lib/markdown/render.types.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/people/load.ts`
- `apps/www/src/lib/news/load.test.ts` (или `mentions.test.ts`)
- `apps/www/src/lib/status/load.test.ts`

## Acceptance criteria

- [ ] `content` helper живет в одном месте (`markdown/render.ts` или рядом).
- [ ] `news/load.ts`, `status/load.ts`, `people/load.ts` используют вынесенный helper.
- [ ] `EMPTY_MENTION_REGISTRY` не мутируем или не является shared mutable singleton.
- [ ] Тест на immutability/fresh instance проходит.
- [ ] `pnpm test` и `typecheck` проходят.

## Проверка

- [ ] `pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts`
- [ ] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [ ] Прочитал обязательные файлы.
- [ ] Вынес shared helper.
- [ ] Заменил mutable empty registry на frozen/fresh.
- [ ] Добавил/обновил тесты.
- [ ] Запустил проверки.
- [ ] Использовал `code-simplification` после реализации.
- [ ] Сделал commit.

## Commit message

`Extract shared content helper and harden empty registry`
