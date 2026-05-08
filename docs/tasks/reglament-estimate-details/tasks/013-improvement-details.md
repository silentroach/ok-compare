# Task 013: Improvement Details

Status: [x] Done

## Description

Extract details from `improvement.pdf`, with special attention to the mismatch between road-surface repair in `final.pdf` and fence-repair resources in the detailed PDF.

## Acceptance Criteria

- [x] Improvement work items and resources are represented.
- [x] The disputed repair line is captured with `needs_check` status and explicit source refs.
- [x] Resources explain why the detailed source looks like perimeter fence repair, not road-surface repair.
- [x] Controls reconcile where possible and expose deltas where not possible.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] `/815/regulation/details/checks.md` mentions the improvement mismatch.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`
- `apps/www/src/data/reglament/full-2026.ts`

## Estimated Scope

Medium: 2 files plus tests.
