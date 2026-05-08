# T1: Audit URL Surface And Migration Assumptions

Status: todo

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Зафиксировать текущие `/compare` surfaces в коде и конфиге, подтвердить, что task-и миграции покрывают все известные места, и отдельно отметить недоступные внешние проверки вроде nginx logs/Search Console.

## Acceptance Criteria

- [ ] В `docs/tasks/compare-as-815-section-handoff.md` добавлен audit note со списком найденных URL surfaces и выводом по каждому.
- [ ] Подтверждено, что public page redirects ограничены page URL из идеи, а machine-readable/API/assets surfaces не входят в scope.
- [ ] Если nginx logs/Search Console недоступны локально, это явно записано как external validation gap.

## Verification

- [ ] `rg "/compare|COMPARE_BASE|COMPARE_CANONICAL_BASE|dist/www/compare|dist/legacy|build:legacy|compose-legacy"` просмотрен и важные результаты перенесены в handoff.

## Dependencies

None.

## Likely Touched Files

- `docs/tasks/compare-as-815-section-handoff.md`
- `docs/tasks/compare-as-815-section-migration.md`
- `docs/tasks/compare-as-815-section-migration/T1-audit-url-surface.md`

## Estimated Scope

S.

## Completion

- [ ] Mark this file `Status: done`.
- [ ] Update task index status.
- [ ] Update handoff task registry and task log.
- [ ] Commit this task separately.
