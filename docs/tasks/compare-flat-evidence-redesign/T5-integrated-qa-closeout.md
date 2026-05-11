# T5 - Run Integrated QA And Close Out Redesign Docs

Status: pending.

Dependencies: T2, T3, T4.

Source: `docs/ideas/ui-ux-critique-2026-05-11/01-compare-flat-evidence-register.md`.

Task index: `docs/tasks/compare-flat-evidence-redesign.md`.

## Required Skills

- `frontend-ui-engineering`
- `tailwind-design-system`
- `code-review-and-quality`
- `browser-testing-with-devtools` only if a dev/preview server is explicitly approved or already running

## Goal

Verify the redesigned compare page as one integrated flow, close task docs and capture follow-up risks for the next agent or human reviewer.

## Scope

In:

- Review the combined page after T2-T4 for inconsistent surface vocabulary, accidental nested cards, leftover decorative blur and broken responsive hierarchy.
- Make only small integration fixes needed to align completed tasks.
- Run final tests/build checks.
- Update index and handoff to `done` for all completed tasks and record final validation gaps.

Out:

- Do not start fast narrowing, search, presets or a table-first redesign.
- Do not introduce new shared UI primitives unless a blocking inconsistency cannot be fixed locally.
- Do not run `pnpm dev` without explicit user approval.

## Likely Files

- `docs/tasks/compare-flat-evidence-redesign.md`
- `docs/tasks/compare-flat-evidence-redesign-handoff.md`
- Small integration fixes in `apps/www/src/pages/815/compare/index.astro` or `apps/www/src/compare/components/*` only if needed.

## Acceptance Criteria

- [ ] Compare page keeps current block order and map placement.
- [ ] Normal compare surfaces are flat-first: no default raised shells, no hover-lift result cards, no decorative glass popup.
- [ ] User-facing data and behavior from before the redesign remain available.
- [ ] Handoff records final verification, residual risks and recommended follow-up for `03-compare-fast-narrowing.md`.
- [ ] Task registry and task files are in sync.

## Verification

- [ ] Run `pnpm --dir apps/www test`.
- [ ] Run `pnpm --dir apps/www typecheck`.
- [ ] Run `pnpm build`.
- [ ] Run `git diff --check`.
- [ ] If browser verification is approved, check `/815/compare/` at mobile and desktop widths and record results. If not approved, document the gap.

## Handoff Notes

- Record final command output summary, any intentional leftovers and whether fast narrowing should become the next task package.

## Commit Message Suggestion

`finalize compare flat redesign qa`
