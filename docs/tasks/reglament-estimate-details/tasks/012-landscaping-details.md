# Task 012: Landscaping Details

Status: [ ] Not started

## Description

Extract work items and all resources from `landscaping.pdf`: mowing, lawns, trees/shrubs, watering, materials, machines and labor.

## Acceptance Criteria

- [ ] Landscaping work items are represented with frequencies and bases.
- [ ] Resources include labor, machines, water, fertilizers, PPE and inventory where present.
- [ ] Work items link to matching `full-2026` service IDs where possible.
- [ ] Controls reconcile to landscaping rows in `estimate-2026`.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [ ] Manual spot-check against `landscaping.pdf`.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 1 file plus tests.
