# Task 001: Detail Schema

Status: [ ] Not started

## Description

Define the TypeScript schema for the new `estimate-details-2026` dataset: work items, resources, control totals, source refs, status labels and stable IDs.

## Acceptance Criteria

- [ ] New schema module exists, likely `apps/www/src/lib/reglament/detail-schema.ts`.
- [ ] Schema supports all resource kinds: labor, machinist labor, machines, materials, contractors and other cost lines if needed.
- [ ] Schema supports work items linked to `estimate_row_id` and optional `service_ids` from `full-2026`.
- [ ] Schema supports control totals by estimate row and cost bucket.
- [ ] Source refs point to small PDFs, not only `full`.

## Verification

- [ ] `pnpm --filter @shelkovo/www typecheck`
- [ ] Existing reglament tests still pass.

## Dependencies

None.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-schema.ts`
- `apps/www/src/lib/reglament/schema.ts`

## Estimated Scope

Medium: 2-3 files.
