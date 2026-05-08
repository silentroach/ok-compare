# Task 001: Detail Schema

Status: [x] Done

## Description

Define the TypeScript schema for the new `estimate-details-2026` dataset: work items, resources, control totals, source refs, status labels and stable IDs.

## Acceptance Criteria

- [x] New schema module exists, likely `apps/www/src/lib/reglament/detail-schema.ts`.
- [x] Schema supports all resource kinds: labor, machinist labor, machines, materials, contractors and other cost lines if needed.
- [x] Schema supports work items linked to `estimate_row_id` and optional `service_ids` from `full-2026`.
- [x] Schema supports control totals by estimate row and cost bucket.
- [x] Source refs point to small PDFs, not only `full`.

## Verification

- [x] `pnpm --filter @shelkovo/www typecheck`
- [x] Existing reglament tests still pass.

## Dependencies

None.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-schema.ts`
- `apps/www/src/lib/reglament/schema.ts`

## Estimated Scope

Medium: 2-3 files.
