# T8: Final Migration Verification And Documentation Cleanup

Status: todo

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Выполнить финальный проход по repo-wide references, built output и docs so migration is internally consistent and ready for deploy/review.

## Acceptance Criteria

- [ ] `docs/ideas/compare-as-815-section-migration.md` assumptions are checked off or explicitly documented as external/manual validation gaps.
- [ ] Task statuses in the task files, index and `docs/tasks/compare-as-815-section-handoff.md` are consistent.
- [ ] Remaining `/compare` references are only old-path redirect rules, tests for redirects, historical docs, or explicitly documented exceptions.
- [ ] Built output contains `dist/www/815/compare` and does not require `dist/legacy`.
- [ ] Handoff has final deployment notes, including nginx validation steps and temporary redirect removal date.

## Verification

- [ ] `pnpm build`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `rg "/compare|815/compare|dist/legacy|build:legacy|DEPLOY_COMPARE_PATH"` reviewed.

## Dependencies

- T4.
- T5.
- T6.
- T7.

## Likely Touched Files

- `docs/ideas/compare-as-815-section-migration.md`
- `docs/tasks/compare-as-815-section-migration.md`
- `docs/tasks/compare-as-815-section-handoff.md`
- `docs/tasks/compare-as-815-section-migration/T8-final-verification.md`
- Any docs with stale path/build wording found in final audit.

## Estimated Scope

S.

## Completion

- [ ] Mark this file `Status: done`.
- [ ] Update task index status.
- [ ] Update handoff task registry and task log.
- [ ] Commit this task separately.
