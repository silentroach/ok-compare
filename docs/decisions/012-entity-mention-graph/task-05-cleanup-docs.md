# Task 05: Cleanup доменных границ и документации

Статус: не начат.

## Скилы

- `code-review-and-quality` - проверить архитектурные границы после миграции.
- `code-simplification` - убрать лишние aliases, dead code и временные bridges.
- `documentation-and-adrs` - обновить agent-facing docs, если правила устарели.

## Цель

После миграции убрать остатки people-only coupling там, где ADR-012 требует общий mention layer, и обновить документацию для будущих агентов.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- `apps/www/AGENTS.md`
- `docs/decisions/012-entity-mention-graph.md`
- `apps/www/src/lib/markdown/render.ts`
- `apps/www/src/lib/mentions`
- `apps/www/src/lib/people/mentions.ts`
- `apps/www/src/lib/people/load.ts`
- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/status/load.ts`

## Что сделать

- Проверить, что `apps/www/src/lib/markdown/render.ts` импортирует только generic mention layer.
- Проверить, что `news` и `status` не импортируют `PeopleMentionRegistry` и people-only target types для generic body mentions.
- Проверить, что `people/mentions.ts` является adapter/thin re-export, а не владельцем всего parser.
- Проверить, что `people/load.ts` не строит source-specific refs для news/status своими private helpers.
- Удалить временные compatibility aliases, если они больше не нужны и не являются публичным контрактом.
- Обновить `apps/www/AGENTS.md` раздел People Mentions так, чтобы он говорил о текущем generic app-level mention layer, но сохранял редакционные правила для людей.
- Если добавлены новые файлы или naming conventions, коротко указать их в agent-facing docs.
- Не менять ADR-012, если решение не менялось. Если обнаружилось расхождение с ADR, остановиться и описать его.

## Важно не делать

- Не переписывать документацию ради стиля.
- Не добавлять Markdown-таблицы.
- Не менять пользовательский текст сайта.
- Не создавать новый ADR без явного изменения решения.

## Ожидаемые файлы

- `apps/www/AGENTS.md`
- `apps/www/src/lib/mentions/*.ts`
- `apps/www/src/lib/people/mentions.ts`
- `apps/www/src/lib/news/*.ts`
- `apps/www/src/lib/status/*.ts`
- Возможно tests, если cleanup меняет names/imports.

## Acceptance criteria

- [ ] Поиск `PeopleMentionRegistry` показывает только people adapter или полностью исчезает, если alias больше не нужен.
- [ ] Поиск `PersonMentionTarget` показывает только people adapter/domain aliases или полностью исчезает из generic loaders.
- [ ] `render.ts` не импортирует `people/mentions`.
- [ ] `people/load.ts` не импортирует чужие source schema/route helpers для backlinks.
- [ ] `apps/www/AGENTS.md` не противоречит ADR-012 и текущему коду.
- [ ] Документация не содержит Markdown-таблиц.

## Проверка

- [ ] `pnpm --filter @shelkovo/www test`
- [ ] `pnpm --filter @shelkovo/www typecheck`

## Чеклист агента

- [ ] Прочитал обязательные файлы.
- [ ] Проверил imports и grep по people-only names.
- [ ] Удалил dead code и временные bridges.
- [ ] Обновил agent-facing docs, если они устарели.
- [ ] Запустил проверки.
- [ ] Использовал `code-review-and-quality`.
- [ ] Использовал `code-simplification` после cleanup.
- [ ] Сделал commit.

## Commit message

`Clean up entity mention boundaries`
