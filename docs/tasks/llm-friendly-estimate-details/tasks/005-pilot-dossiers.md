# Task 005: Pilot Dossiers

Status: [ ] Pending

## Description

Select and validate a representative pilot set of row dossiers before exposing the whole dataset as the recommended agent surface.

## Acceptance Criteria

- [ ] Pilot covers 3-5 rows from different complexity classes: cleaning, lighting, security or waste, and one row with `needs_check`.
- [ ] Each pilot dossier can answer: what is included, how much it costs, what is derived, what needs checking and where sources are.
- [ ] Any missing context needed for these rows is captured in `extra.md` or follow-up tasks.
- [ ] Pilot rows are selected by stable `estimate_row_id`, not by array position.

## Verification

- [ ] Snapshot test contains the full pilot dataset.
- [ ] Manual read of generated pilot JSON confirms it is understandable without opening PDF.
- [ ] `pnpm --filter @shelkovo/www test -- detail-agent`

## Dependencies

- Task 002.
- Task 003.
- Task 004.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-agent.ts`
- `apps/www/src/lib/reglament/detail-agent.test.ts`
- `docs/tasks/llm-friendly-estimate-details/extra.md`

## Estimated Scope

Medium: 2-4 files.
