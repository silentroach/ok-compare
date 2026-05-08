# T2: Move Compare Section Base And Canonical To `/815/compare`

Status: todo

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Переключить compare section build и compare dev-server на новый base/canonical, обновить compare-local docs/tests, но не менять root-site compose wiring в этом task-е.

## Acceptance Criteria

- [ ] `apps/compare/package.json` использует `COMPARE_BASE=/815/compare` и `COMPARE_CANONICAL_BASE=/815/compare` для `dev` и `build:section`.
- [ ] Legacy build script не расширяется и не получает новые обязанности; его удаление остается для T7.
- [ ] Compare tests/snapshots обновлены так, чтобы canonical, markdown companions, feeds и generated links ожидали `/815/compare`.
- [ ] `apps/compare/AGENTS.md` отражает новый section path для dev/build и больше не говорит, что canonical section path равен `/compare`.

## Verification

- [ ] `pnpm --dir apps/compare test`
- [ ] `pnpm --dir apps/compare typecheck`
- [ ] `pnpm --dir apps/compare build`
- [ ] Sample built files under `apps/compare/dist/section` contain `/815/compare` canonical/base links where expected.

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

- [ ] Mark this file `Status: done`.
- [ ] Update task index status.
- [ ] Update handoff task registry and task log.
- [ ] Commit this task separately.
