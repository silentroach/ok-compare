# Task 04: Generic mention graph и миграция people backlinks

Статус: не начат.

## Скилы

- `api-and-interface-design` - graph contract должен быть нейтральным и стабильным внутри app.
- `test-driven-development` - graph behavior является главным публичным поведением реализации ADR.
- `code-simplification` - после миграции удалить старую coupling-логику.

## Цель

Добавить общий `EntityMentionGraph` поверх `EntityMentionSourceRef[]` и перевести `buildPeopleGraphDataset` на него, сохранив публичные `PersonBacklinks`.

После этого `people/load.ts` больше не должен знать, как из новости или инцидента получить title, URLs, excerpt и sort key.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/src/lib/mentions/*.ts`
- `apps/www/src/lib/people/load.ts`
- `apps/www/src/lib/people/schema.ts`
- `apps/www/src/lib/news/mentions.ts`
- `apps/www/src/lib/status/mentions.ts`
- `apps/www/src/lib/people/mention-refs.ts`
- `apps/www/src/lib/people/load.test.ts`

## Что сделать

- Добавить graph module в `apps/www/src/lib/mentions`, например `graph.ts`.
- Graph module принимает `readonly EntityMentionSourceRef[]`.
- Graph module индексирует refs по `target_type + target_slug`.
- Graph module группирует refs по `source_section`.
- Graph module дедуплицирует refs на уровне source unit для одной target entity.
- Graph module сортирует refs внутри группы: `sort_key` desc, потом `title` по `ru`, потом `source_id`; отсутствующий `sort_key` ниже dated refs.
- Graph module имеет защитную ошибку для self-link, если ref явно содержит одинаковые `source_entity` и target pair.
- Обновить `buildPeopleGraphDataset`, чтобы он принимал people dataset и generic refs или graph, а не `NewsDataset`/`StatusDataset`.
- В `buildPeopleDataWithBacklinks` собрать refs через source adapters news/status/people и передать их в people graph attachment.
- Сконвертировать generic refs target `person` обратно в текущую форму `PersonMentionRef` без target fields.
- Сохранить shape `backlinks.news`, `backlinks.status`, `backlinks.people`.
- Удалить старые private helpers `articleBacklink`, `incidentBacklink`, `personBacklink`, `pushBacklink` из `people/load.ts`, если они больше не нужны.

## Важно не делать

- Не добавлять публичный generic graph endpoint или feed.
- Не менять page/UI rendering of people backlinks.
- Не менять source adapters, кроме минимальных доработок для graph.
- Не возвращать молчаливую фильтрацию self-link в people graph.

## Ожидаемые файлы

- `apps/www/src/lib/mentions/graph.ts`
- `apps/www/src/lib/mentions/graph.test.ts`
- `apps/www/src/lib/people/load.ts`
- `apps/www/src/lib/people/load.test.ts`
- `apps/www/src/lib/people/schema.ts`
- Возможно source adapter files из Task 03.

## Acceptance criteria

- [ ] Graph tests не используют реальные формы `NewsArticle`, `StatusIncident` или `PersonProfile`.
- [ ] Graph дедуплицирует повторный ref одного source unit к одной target entity.
- [ ] Graph сортирует refs по правилам ADR-012.
- [ ] Graph группирует refs по `source_section`.
- [ ] Graph падает на self-link ref, если `source_entity` совпадает с target pair.
- [ ] `buildPeopleGraphDataset` больше не принимает `related.news` и `related.status` datasets.
- [ ] `people/load.ts` больше не импортирует `NewsDataset`, `StatusDataset`, `statusIncidentMarkdownUrl` или route helpers чужих source sections для построения backlinks.
- [ ] Existing people backlinks tests проходят с тем же публичным shape.

## Проверка

- [ ] `pnpm --filter @shelkovo/www test -- src/lib/mentions/graph.test.ts src/lib/people/load.test.ts src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts`
- [ ] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [ ] Прочитал обязательные файлы.
- [ ] Добавил generic graph module.
- [ ] Покрыл graph sorting, grouping, dedupe и self-link tests.
- [ ] Перевел people backlinks на graph/source refs.
- [ ] Удалил старую source-specific coupling из `people/load.ts`.
- [ ] Сохранил public people backlinks shape.
- [ ] Запустил проверки.
- [ ] Использовал `code-simplification` после реализации.
- [ ] Сделал commit.

## Commit message

`Use generic entity mention graph for people backlinks`
