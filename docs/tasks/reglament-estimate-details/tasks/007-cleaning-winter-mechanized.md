# Task 007: Cleaning Winter Mechanized

Status: [x] Done

## Description

Extract winter mechanized cleaning details from `cleaning.pdf`: work items, labor, machine resources, materials and row-level controls.

## Acceptance Criteria

- [x] Work items for the winter mechanized section are represented.
- [x] Resources include machinist labor, tractor/machinery, anti-ice equipment and materials such as sand where present.
- [x] Controls reconcile to `cleaning-winter-mechanized` buckets in `estimate-2026`.
- [x] Source refs use `cleaning.pdf` page numbers and fragments.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] Manual spot-check against `pdftotext -layout cleaning.pdf` output.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 1 file plus tests.
