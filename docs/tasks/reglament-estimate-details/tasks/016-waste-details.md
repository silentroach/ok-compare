# Task 016: Waste Details

Status: [x] Done

## Description

Extract waste-service details from `waste.pdf`: TKO/KGO handling, container sites, contractor costs and any labor/material resources.

## Acceptance Criteria

- [x] Waste work items are represented.
- [x] Contractor, labor and material resources are captured according to the PDF.
- [x] Work items link to `full-2026` services where possible.
- [x] Controls reconcile to waste rows in `estimate-2026`.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] Manual spot-check against `waste.pdf`.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`

## Estimated Scope

Medium: 1 file plus tests.
