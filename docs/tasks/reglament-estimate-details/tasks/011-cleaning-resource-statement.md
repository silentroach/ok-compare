# Task 011: Cleaning Resource Statement

Status: [x] Done

## Description

Use the resource statement section of `cleaning.pdf` to cross-check resources extracted from individual work items.

## Acceptance Criteria

- [x] Resource statement totals are represented as control totals or audit facts.
- [x] Extracted resources are reconciled against resource statement quantities and annual sums.
- [x] Any mismatch is recorded in detail checks with `needs_check` or explicit rounding note.
- [x] Markdown checks file exposes the reconciliation result.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] `/815/regulation/details/checks.md` includes cleaning resource statement checks.

## Dependencies

- Task 007.
- Task 008.
- Task 009.
- Task 010.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`
- `apps/www/src/lib/reglament/detail-markdown.ts`

## Estimated Scope

Medium: 2 files plus tests.
