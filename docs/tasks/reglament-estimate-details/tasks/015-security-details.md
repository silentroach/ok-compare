# Task 015: Security Details

Status: [ ] Not started

## Description

Extract security and access-control details from `security.pdf`: CHOP, checkpoint work, patrols/rounds and related resources.

## Acceptance Criteria

- [ ] Security work items are represented.
- [ ] Contractor or labor resources are captured according to the PDF source.
- [ ] Patrol/round frequency facts are captured if present in the small PDF.
- [ ] Controls reconcile to security rows in `estimate-2026`.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [ ] Manual spot-check against `security.pdf`.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 1 file plus tests.
