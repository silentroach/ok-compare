# T7: Remove Standalone Legacy Build And Deploy Path

Status: todo

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Удалить legacy artifact/build/deploy path because old domain is redirect-only and no longer needs `dist/legacy`.

## Acceptance Criteria

- [ ] Root `pnpm build` no longer runs `build:legacy` and no longer produces required `dist/legacy` artifact.
- [ ] `scripts/compose-legacy.mjs` is deleted if unused.
- [ ] `apps/compare/package.json` and `turbo.json` no longer expose unused legacy build task unless another concrete consumer remains.
- [ ] `.github/workflows/ci.yml` no longer validates or rsyncs `DEPLOY_COMPARE_PATH`, but still deploys both nginx configs.
- [ ] Workspace docs no longer describe `dist/legacy` as a current build artifact.

## Verification

- [ ] `pnpm build`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `rg "build:legacy|compose-legacy|dist/legacy|DEPLOY_COMPARE_PATH"` reviewed; intentional leftovers documented.

## Dependencies

- T6.

## Likely Touched Files

- `package.json`
- `apps/compare/package.json`
- `turbo.json`
- `.github/workflows/ci.yml`
- `scripts/compose-legacy.mjs`
- `AGENTS.md`
- `apps/compare/AGENTS.md`
- `docs/tasks/compare-as-815-section-handoff.md`
- `docs/tasks/compare-as-815-section-migration.md`
- `docs/tasks/compare-as-815-section-migration/T7-remove-legacy-build.md`

## Estimated Scope

M.

## Completion

- [ ] Mark this file `Status: done`.
- [ ] Update task index status.
- [ ] Update handoff task registry and task log.
- [ ] Commit this task separately.
