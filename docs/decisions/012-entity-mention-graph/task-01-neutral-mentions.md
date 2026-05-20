# Task 01: Нейтральные mention-типы, registry и normalizer

Статус: не начат.

## Скилы

- `api-and-interface-design` - для формы нейтральных contracts.
- `test-driven-development` - сначала зафиксировать поведение parser/registry тестами.
- `code-simplification` - после реализации перед финальной проверкой.

## Цель

Создать общий app-level слой `apps/www/src/lib/mentions` для нейтральной обработки entity mentions и сделать `people/mentions.ts` тонким adapter/re-export поверх него.

На этом шаге не мигрировать backlinks graph и не менять публичные people backlinks.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `docs/decisions/012-entity-mention-graph.md`
- `apps/www/src/lib/people/mentions.ts`
- `apps/www/src/lib/people/mentions.test.ts`
- `apps/www/src/lib/markdown/render.ts`
- `apps/www/src/lib/markdown/render.types.ts`

## Что сделать

- Создать `apps/www/src/lib/mentions`.
- Вынести нейтральные типы: `EntityMentionType`, `EntityMentionTarget`, `SiteMentionRegistry`, `NormalizedEntityMentions`.
- В `EntityMentionType` пока поддержать только `person`, но без people-specific naming в общем слое.
- В `EntityMentionTarget` использовать нейтральные поля `type`, `slug`, `label`, optional `label_cases`, `html_url`, `markdown_url`, optional link title/context.
- Добавить helper сборки `SiteMentionRegistry`, который падает на duplicate short slug между подключенными targets.
- Перенести parser/normalizer из `people/mentions.ts` в общий слой, заменив people-specific формулировки на entity-level контракт.
- Сохранить синтаксис `@slug`, `@slug:case`, `[видимый текст](@slug)`.
- Сохранить ошибку для `[видимый текст](@slug:case)`.
- Сохранить dedupe `mentions[]` внутри одного body.
- Обновить `people/mentions.ts`, чтобы он только создавал person targets и, если нужно, экспортировал совместимые type aliases для текущих call sites.
- Обновить тесты people mentions или добавить новые `lib/mentions` тесты так, чтобы neutral layer был основной тестовой поверхностью.

## Важно не делать

- Не подключать пока `source_entity` и self-link validation. Это Task 02.
- Не менять `buildPeopleGraphDataset`. Это Task 04.
- Не вводить namespace syntax.
- Не добавлять публичный `/entities` API.

## Ожидаемые файлы

- `apps/www/src/lib/mentions/*.ts`
- `apps/www/src/lib/mentions/*.test.ts`
- `apps/www/src/lib/people/mentions.ts`
- `apps/www/src/lib/people/mentions.test.ts`
- Возможно `apps/www/src/lib/markdown/render.test.ts`, если типы тестов нужно обновить.

## Acceptance criteria

- [ ] Общий normalizer не импортирует `people`, `news`, `status` или route helpers доменных разделов.
- [ ] `createPersonMentionTarget` мапит person data в neutral `EntityMentionTarget` с `type: 'person'`.
- [ ] Canonical mentions раскрываются в `label` и `html_url`.
- [ ] `@slug:case` раскрывается через `label_cases` и падает, если формы нет.
- [ ] Labelled mentions сохраняют видимый текст и заменяют destination на `html_url`.
- [ ] Unknown short slug падает на build-time normalization.
- [ ] Duplicate short slug в `SiteMentionRegistry` падает до обработки body.
- [ ] `mentions[]` содержит уникальные targets в порядке первого появления.

## Проверка

- [ ] `pnpm --filter @shelkovo/www test -- src/lib/mentions src/lib/people/mentions.test.ts src/lib/markdown/render.test.ts`
- [ ] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [ ] Прочитал обязательные файлы.
- [ ] Добавил нейтральный mention layer.
- [ ] Сохранил people adapter.
- [ ] Обновил или перенес тесты.
- [ ] Запустил проверки.
- [ ] Использовал `code-simplification` после реализации.
- [ ] Сделал commit.

## Commit message

`Add neutral entity mention normalizer`
