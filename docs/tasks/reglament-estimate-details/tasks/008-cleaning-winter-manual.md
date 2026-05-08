# Task 008: Cleaning Winter Manual

Status: [x] Done

## Description

Extract winter manual cleaning details from `cleaning.pdf`: snow clearing, anti-ice spreading, container site cleaning, PPE and equipment wear.

## Acceptance Criteria

- [x] Work items for winter manual cleaning are represented.
- [x] Labor resources and material resources are captured.
- [x] PPE and inventory items are represented as materials with quantities and annual costs.
- [x] Controls reconcile to `cleaning-winter-manual` buckets in `estimate-2026`.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] Manual spot-check source refs against `cleaning.pdf`.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 1 file plus tests.
