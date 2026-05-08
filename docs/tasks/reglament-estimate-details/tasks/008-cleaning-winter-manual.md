# Task 008: Cleaning Winter Manual

Status: [ ] Not started

## Description

Extract winter manual cleaning details from `cleaning.pdf`: snow clearing, anti-ice spreading, container site cleaning, PPE and equipment wear.

## Acceptance Criteria

- [ ] Work items for winter manual cleaning are represented.
- [ ] Labor resources and material resources are captured.
- [ ] PPE and inventory items are represented as materials with quantities and annual costs.
- [ ] Controls reconcile to `cleaning-winter-manual` buckets in `estimate-2026`.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [ ] Manual spot-check source refs against `cleaning.pdf`.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 1 file plus tests.
