# Task 015: Security Details

Status: [x] Done

## Description

Extract security and access-control details from `security.pdf`: CHOP, checkpoint work, patrols/rounds and related resources.

## Acceptance Criteria

- [x] Security work items are represented.
- [x] Contractor or labor resources are captured according to the PDF source.
- [x] Patrol/round frequency facts are captured if present in the small PDF.
- [x] Controls reconcile to security rows in `estimate-2026`.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] Manual spot-check against `security.pdf`.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 1 file plus tests.
