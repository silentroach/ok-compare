# Task 010: Cleaning Summer Manual

Status: [x] Done

## Description

Extract summer manual cleaning details from `cleaning.pdf`: curb cleaning, parking area cleaning, container site cleaning, ditch cleaning, PPE and inventory.

## Acceptance Criteria

- [x] Work items for summer manual cleaning are represented with frequencies.
- [x] Open stormwater ditch cleaning is captured with `15 раз в летний период`.
- [x] Labor, PPE and inventory resources are captured.
- [x] Controls reconcile to `cleaning-summer-manual` buckets in `estimate-2026`.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] Manual source spot-check against `cleaning.pdf`.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 1 file plus tests.
