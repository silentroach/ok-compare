# Task 006: Dataset Tests

Status: [x] Done

## Description

Add tests that keep the detail dataset structurally valid and protect future resource extraction from silent drift.

## Acceptance Criteria

- [x] Test verifies every work item and resource has source refs.
- [x] Test verifies every `estimate_row_id` exists in `estimate-2026`.
- [x] Test verifies every `service_id` exists in `full-2026` when present.
- [x] Test verifies resource sums against declared control totals with explicit rounding tolerance.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`

## Dependencies

- Task 002.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.test.ts`
- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 2 files.
