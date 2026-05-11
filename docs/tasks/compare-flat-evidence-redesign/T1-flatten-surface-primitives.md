# T1 - Flatten Compare Surface Primitives

Status: done.

Dependencies: None.

Source: `docs/ideas/ui-ux-critique-2026-05-11/01-compare-flat-evidence-register.md`.

Task index: `docs/tasks/compare-flat-evidence-redesign.md`.

## Required Skills

- `frontend-ui-engineering`
- `tailwind-design-system`

## Goal

Make compare-local surface primitives flat by default so later component work does not have to fight `ui-shell`, `ui-shell-strong`, `ui-chip` and `ui-btn` defaults.

## Scope

In:

- Rework `apps/www/src/compare/styles/global.css` so normal compare shells rely on background, border, spacing and typography rather than default shadow/elevation.
- Keep compare overrides local unless a pattern is clearly reusable outside compare.
- Update `apps/www/src/compare/lib/styles.architecture.test.ts` so it documents and guards the flat surface contract.

Out:

- Do not redesign hero, KPI blocks, map, controls or settlement cards in this task except where they inherit the new primitive defaults.
- Do not change visible content or data behavior.

## Likely Files

- `apps/www/src/compare/styles/global.css`
- `apps/www/src/compare/lib/styles.architecture.test.ts`

## Acceptance Criteria

- [x] `ui-shell` and `ui-shell-strong` no longer encode raised-card elevation as the default compare section treatment.
- [x] Default compare shell radius and shadow choices match `docs/design/design-code-shelkovo.md` Flat First, No Nested Cards and Cards / Containers rules.
- [x] Chip/button overrides stay usable for interactive filters but do not make every control look like a decorative pill.
- [x] Architecture test fails if the old heavy shell vocabulary is reintroduced accidentally.
- [x] Page structure, routes, data loading and user-facing copy remain unchanged.

## Verification

- [x] Run `pnpm --dir apps/www test src/compare/lib/styles.architecture.test.ts`.
- [x] Run `pnpm --dir apps/www typecheck`.
- [x] Run `git diff --check`.

## Handoff Notes

- Record the final primitive contract in `docs/tasks/compare-flat-evidence-redesign-handoff.md` so T2-T4 agents know which classes to reuse or avoid.

## Commit Message Suggestion

`flatten compare surface primitives`
