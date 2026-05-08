# Task 026: Quote Item Public Contract Cleanup

Status: [x] Completed

## Description

Review the public `source_refs[].quote_items` contract after table-field enrichment and remove intermediate audit/debug fragments that are not useful for users or LLM consumers. Primary candidates: per-item `quote` and `raw` strings inside structured money/quantity values.

## Acceptance Criteria

- [x] Decide whether `source_refs[].quote_items[].quote` should stay in the schema or be removed after `source_refs[].quote` remains available for source audit.
- [x] Remove `EstimateDetailQuantityValue.raw` and `EstimateDetailMoneyValue.raw` from public JSON/markdown; detail values expose normalized `value`, `unit` and optional `note` only.
- [x] If fields are removed, update `apps/www/src/lib/reglament/detail-schema.ts`, dataset modules, JSON/markdown output and tests consistently.
- [x] LLM markdown keeps useful structured values: label, linked `resource_ids`, unit, numeric quantity, unit price, total and notes.
- [x] No source provenance is lost: PDF id, page, fragment and legacy `source_refs[].quote` remain enough to audit the source row.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] `pnpm --filter @shelkovo/www test -- detail-markdown`
- [x] `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Tasks 020-025, so the cleanup works against the final enriched `quote_items` shape.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-schema.ts`
- `apps/www/src/lib/reglament/detail-markdown.ts`
- `apps/www/src/data/reglament/estimate-details-2026/*.ts`
- `apps/www/src/data/reglament/estimate-details-2026.test.ts`
- `apps/www/src/lib/reglament/detail-markdown.test.ts`

## Estimated Scope

Medium: schema and public output cleanup across all enriched section modules.
