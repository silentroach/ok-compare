# T2: Move Compare Section Base And Canonical To `/815/compare`

Status: done

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Переключить compare section build и compare dev-server на новый base/canonical, обновить compare-local docs/tests, но не менять root-site compose wiring в этом task-е.

## Acceptance Criteria

- [x] `apps/compare/package.json` использует `COMPARE_BASE=/815/compare` и `COMPARE_CANONICAL_BASE=/815/compare` для `dev` и `build:section`.
- [x] Legacy build script не расширяется и не получает новые обязанности; его удаление остается для T7.
- [x] Compare tests/snapshots обновлены так, чтобы canonical, markdown companions, feeds и generated links ожидали `/815/compare`.
- [x] `apps/compare/AGENTS.md` отражает новый section path для dev/build и больше не говорит, что canonical section path равен `/compare`.

## Verification

- [x] `pnpm --dir=apps/compare test`
- [x] `pnpm --dir=apps/compare typecheck`
- [x] `pnpm --dir=apps/compare build`
- [x] Sample built files under `apps/compare/dist/section` contain `/815/compare` canonical/base links where expected.

## Dependencies

- T1.

## Likely Touched Files

- `apps/compare/package.json`
- `apps/compare/AGENTS.md`
- `apps/compare/src/lib/*.test.ts`
- `apps/compare/src/pages/**/*.test.ts` if tests exist for generated docs
- `docs/tasks/compare-as-815-section-handoff.md`
- `docs/tasks/compare-as-815-section-migration.md`
- `docs/tasks/compare-as-815-section-migration/T2-move-compare-base.md`

## Estimated Scope

M.

## Completion

- [x] Mark this file `Status: done`.
- [x] Update task index status.
- [x] Update handoff task registry and task log.
- [x] Commit this task separately.
