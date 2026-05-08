# Task 010: Cleaning Summer Manual

Status: [ ] Not started

## Description

Extract summer manual cleaning details from `cleaning.pdf`: curb cleaning, parking area cleaning, container site cleaning, ditch cleaning, PPE and inventory.

## Acceptance Criteria

- [ ] Work items for summer manual cleaning are represented with frequencies.
- [ ] Open stormwater ditch cleaning is captured with `15 раз в летний период`.
- [ ] Labor, PPE and inventory resources are captured.
- [ ] Controls reconcile to `cleaning-summer-manual` buckets in `estimate-2026`.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [ ] Manual source spot-check against `cleaning.pdf`.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 1 file plus tests.
