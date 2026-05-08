# Task 006: Dataset Tests

Status: [ ] Not started

## Description

Add tests that keep the detail dataset structurally valid and protect future resource extraction from silent drift.

## Acceptance Criteria

- [ ] Test verifies every work item and resource has source refs.
- [ ] Test verifies every `estimate_row_id` exists in `estimate-2026`.
- [ ] Test verifies every `service_id` exists in `full-2026` when present.
- [ ] Test verifies resource sums against declared control totals with explicit rounding tolerance.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- estimate-details-2026`

## Dependencies

- Task 002.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.test.ts`
- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 2 files.
