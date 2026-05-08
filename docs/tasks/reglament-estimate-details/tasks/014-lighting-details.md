# Task 014: Lighting Details

Status: [ ] Not started

## Description

Extract lighting service details and resources from `lighting.pdf`: maintenance, repair, lamps/materials, labor and machinery if present.

## Acceptance Criteria

- [ ] Lighting work items are represented.
- [ ] Material resources such as lamps and electrical components are captured.
- [ ] Labor/machine resources are captured if present.
- [ ] Controls reconcile to lighting rows in `estimate-2026`.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [ ] Manual spot-check against `lighting.pdf`.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 1 file plus tests.
