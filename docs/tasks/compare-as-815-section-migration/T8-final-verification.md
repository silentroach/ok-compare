# T8: Final Migration Verification And Documentation Cleanup

Status: done

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Выполнить финальный проход по repo-wide references, built output и docs so migration is internally consistent and ready for deploy/review.

## Acceptance Criteria

- [x] `docs/ideas/compare-as-815-section-migration.md` assumptions are checked off or explicitly documented as external/manual validation gaps.
- [x] Task statuses in the task files, index and `docs/tasks/compare-as-815-section-handoff.md` are consistent.
- [x] Remaining `/compare` references are only old-path redirect rules, tests for redirects, historical docs, or explicitly documented exceptions.
- [x] Built output contains `dist/www/815/compare` and does not require `dist/legacy`.
- [x] Handoff has final deployment notes, including nginx validation steps and temporary redirect removal date.

## Verification

- [x] `pnpm build`
- [x] `pnpm typecheck`
- [x] `pnpm test`
- [x] `rg "/compare|815/compare|dist/legacy|build:legacy|DEPLOY_COMPARE_PATH"` reviewed.

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

- [x] Mark this file `Status: done`.
- [x] Update task index status.
- [x] Update handoff task registry and task log.
- [x] Commit this task separately.
