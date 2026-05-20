# Task 02: App markdown pipeline и self-link validation

Статус: реализовано.

## Скилы

- `api-and-interface-design` - для изменения `RenderSiteMarkdownOptions`.
- `test-driven-development` - для self-link и pipeline regression tests.
- `astro` - код находится в Astro app `apps/www` и должен уважать app-level Markdown boundary.
- `code-simplification` - после реализации перед финальной проверкой.

## Цель

Подключить neutral mention registry к `preprocessSiteMarkdown` и `renderMarkdown`, заменить people-only option в loaders на общий mention option и добавить build-time ошибку для self-link в body самой сущности.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/AGENTS.md`
- `apps/www/src/lib/markdown/render.ts`
- `apps/www/src/lib/markdown/render.types.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/people/load.ts`

## Что сделать

- Обновить `RenderSiteMarkdownOptions`: вместо people-only options использовать общий mention option, например `mentions: { registry, context, source_entity? }`.
- Обновить `PreprocessedSiteMarkdown.mentions`, чтобы он возвращал `readonly EntityMentionTarget[]`.
- Обновить `preprocessSiteMarkdown` и `renderMarkdown`, чтобы они вызывали neutral normalizer.
- Обновить `news/load.ts`, `status/load.ts` и `people/load.ts`, чтобы они передавали общий `SiteMentionRegistry`.
- Для people profile body передавать `source_entity: { type: 'person', slug: entry.id }`.
- В normalizer добавить проверку self-link: если target совпадает с `source_entity`, бросить ошибку с понятным context.
- Проверить self-link и для canonical mention, и для labelled mention.
- Переименовать local variables/options в loaders так, чтобы они не закрепляли people-only boundary там, где теперь используется `SiteMentionRegistry`.

## Важно не делать

- Не менять публичную структуру `PersonBacklinks`.
- Не мигрировать graph на refs. Это Task 04.
- Не искать mentions в title, summary, frontmatter или generated docs.
- Не оставлять parallel people-only Markdown pipeline.

## Ожидаемые файлы

- `apps/www/src/lib/markdown/render.ts`
- `apps/www/src/lib/markdown/render.types.ts`
- `apps/www/src/lib/mentions/*.ts`
- `apps/www/src/lib/mentions/*.test.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/news/schema.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/status/schema.ts`
- `apps/www/src/lib/people/load.ts`
- `apps/www/src/lib/people/schema.ts`

## Acceptance criteria

- [x] `preprocessSiteMarkdown` больше не зависит от `../people/mentions` напрямую.
- [x] `render.types.ts` больше не импортирует people-only registry/target types.
- [x] News, status и people body проходят через общий mention option.
- [x] `PersonProfile.mentions`, `NewsArticle.mentions` и `StatusIncident.mentions` типизированы generic target type или безопасным domain alias поверх него.
- [x] Self mention в profile body падает на normalization, а не фильтруется позже graph module.
- [x] Empty body по-прежнему возвращает пустой markdown и пустые mentions.
- [x] Старые behavior tests для normal mentions, labelled mentions и case mentions остаются зелеными после обновления типов.

## Проверка

- [x] `pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/mentions src/lib/people/load.test.ts src/lib/news/load.test.ts src/lib/status/load.test.ts`
- [x] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [x] Прочитал обязательные файлы.
- [x] Обновил app-level Markdown options.
- [x] Подключил generic registry в loaders.
- [x] Добавил self-link validation.
- [x] Покрыл canonical и labelled self-link тестами.
- [x] Запустил проверки.
- [x] Использовал `code-simplification` после реализации.
- [x] Сделал commit.

## Commit message

`Wire entity mentions into markdown pipeline`
