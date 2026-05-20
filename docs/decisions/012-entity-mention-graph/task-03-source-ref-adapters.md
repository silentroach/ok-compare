# Task 03: Source refs adapters для news, status и people

Статус: реализовано.

## Скилы

- `api-and-interface-design` - для формы `EntityMentionSourceRef`.
- `test-driven-development` - source adapters должны иметь собственные tests.
- `code-simplification` - после реализации перед финальной проверкой.

## Цель

Ввести `EntityMentionSourceRef` и source adapters рядом с разделами `news`, `status` и `people`, чтобы каждый источник сам описывал свои title, URLs, excerpt, дату и `sort_key`.

На этом шаге можно не переключать `buildPeopleGraphDataset` на новые refs, если это увеличивает diff. Главное - создать и протестировать adapters как будущую границу для Task 04.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/people/load.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/news/routes.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/status/routes.ts`
- `apps/www/src/lib/status/view.ts`
- `apps/www/src/lib/people/routes.ts`

## Что сделать

- Добавить neutral type `EntityMentionSourceRef` в `apps/www/src/lib/mentions`.
- Ref должен включать target identity: `target_type` и `target_slug`.
- Ref должен включать source identity: `source_section`, `source_kind`, `source_id`.
- Ref должен включать source presentation: `title`, `html_url`, `markdown_url`, optional `excerpt`, optional `mentioned_at`, optional `sort_key`.
- Если нужен source self-link defense в graph, ref может иметь optional `source_entity`.
- Добавить adapter для news articles, который строит refs из `NewsArticle.mentions`.
- Добавить adapter для status incidents, который строит refs из `StatusIncident.mentions`.
- Добавить adapter для people profiles, который строит refs из `PersonProfile.mentions`.
- Перенести source-specific логику excerpt/URL/sort из будущей зоны `people/load.ts` в эти adapters или продублировать временно, если Task 04 удалит старую копию.
- Убедиться, что один source unit не дает больше одного ref для одной target entity.

## Важно не делать

- Не заставлять общий mention graph импортировать `NewsArticle`, `StatusIncident` или `PersonProfile`.
- Не учитывать additions новостей.
- Не менять public people backlinks shape на этом шаге.
- Не менять sorting behavior backlinks без тестов.

## Ожидаемые файлы

- `apps/www/src/lib/mentions/*.ts`
- `apps/www/src/lib/news/mentions.ts`
- `apps/www/src/lib/news/mentions.test.ts`
- `apps/www/src/lib/status/mentions.ts`
- `apps/www/src/lib/status/mentions.test.ts`
- `apps/www/src/lib/people/mention-refs.ts` или близкое имя без конфликта с adapter `people/mentions.ts`
- `apps/www/src/lib/people/mention-refs.test.ts`

## Acceptance criteria

- [x] News adapter создает ref с section `news`, kind `article`, article URLs, excerpt из body, `mentioned_at` из `published_iso` и `sort_key` из `published_at.valueOf()`.
- [x] Status adapter создает ref с section `status`, kind `incident`, incident URLs, excerpt из incident, `mentioned_at` из `started_iso` и `sort_key` из `sort_last_change_at`.
- [x] People adapter создает ref с section `people`, kind `person`, profile URLs и excerpt из profile body.
- [x] Все adapters пишут target pair из `EntityMentionTarget.type` и `EntityMentionTarget.slug`.
- [x] Повтор одного target в source unit не создает duplicate refs.
- [x] Tests adapters используют маленькие fixtures и не проверяют случайную статику сверх публичного контракта ref.

## Проверка

- [x] `pnpm --filter @shelkovo/www test -- src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts src/lib/mentions`
- [x] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [x] Прочитал обязательные файлы.
- [x] Добавил `EntityMentionSourceRef`.
- [x] Добавил news source adapter и tests.
- [x] Добавил status source adapter и tests.
- [x] Добавил people source adapter и tests.
- [x] Проверил source-level dedupe.
- [x] Запустил проверки.
- [x] Использовал `code-simplification` после реализации.
- [x] Сделал commit.

## Commit message

`Add entity mention source ref adapters`
