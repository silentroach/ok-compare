# Task 06: Финальная регрессия и hardening

Статус: не начат.

## Скилы

- `code-review-and-quality` - финальная проверка рисков и регрессий.
- `diagnose` - если падает test/typecheck/build.
- `code-simplification` - если в ходе проверки найден лишний complexity.

## Цель

Проверить реализацию ADR-012 end-to-end, закрыть мелкие регрессии и убедиться, что task-чеклисты соответствуют фактическому состоянию кода.

## Обязательное чтение

- `docs/decisions/012-entity-mention-graph/context.md`
- Все `docs/decisions/012-entity-mention-graph/task-*.md`
- `docs/decisions/012-entity-mention-graph.md`
- `apps/www/AGENTS.md`

## Что сделать

- Проверить, что все предыдущие task-файлы имеют отмеченные чекбоксы и отдельные commits.
- Прочитать итоговый diff относительно ветки до Task 01 или хотя бы последние commits по этой папке работ.
- Проверить архитектурные инварианты ADR-012 через кодовый обзор и targeted grep.
- Запустить полный набор проверок workspace.
- Если падают проверки, диагностировать и исправить минимально.
- Если все зелено, отметить этот task как выполненный.

## Targeted grep

- `PeopleMentionRegistry` - не должен протекать в generic markdown pipeline или source loaders, кроме осознанных people aliases.
- `PersonMentionTarget` - не должен быть generic contract для news/status body mentions, кроме осознанных people aliases.
- `statusIncidentMarkdownUrl` в `people/load.ts` - не должно остаться.
- `NewsDataset` или `StatusDataset` в `people/load.ts` - не должно остаться ради backlinks graph.
- `render` из `@shelkovo/markdown` внутри app body rendering - не должно появиться вне разрешенных low-level places.

## Acceptance criteria

- [ ] Все task-файлы в этой папке обновлены по факту выполнения.
- [ ] Generic mention layer живет в `apps/www/src/lib/mentions`.
- [ ] App Markdown pipeline использует generic mention layer.
- [ ] Self-link падает на normalization Markdown body.
- [ ] Source adapters создают refs для news, status и people.
- [ ] Generic graph тестируется без реальных domain dataset shapes.
- [ ] People backlinks shape сохранился.
- [ ] Нет публичного generic entities API/feed.
- [ ] Full tests, typecheck и build проходят или documented blocker явно записан.

## Проверка

- [ ] `pnpm test`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`

## Чеклист агента

- [ ] Прочитал обязательные файлы.
- [ ] Выполнил targeted grep.
- [ ] Провел code review итоговой реализации.
- [ ] Исправил найденные регрессии минимальными изменениями.
- [ ] Запустил полный набор проверок.
- [ ] Использовал `code-review-and-quality`.
- [ ] Использовал `diagnose`, если были падения.
- [ ] Использовал `code-simplification`, если были code changes.
- [ ] Сделал commit.

## Commit message

`Verify entity mention graph implementation`
