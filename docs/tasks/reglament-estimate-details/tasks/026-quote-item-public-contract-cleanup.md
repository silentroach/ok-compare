# Task 026: Quote Item Public Contract Cleanup

Status: [ ] Not Started

## Description

Review the public `source_refs[].quote_items` contract after table-field enrichment and remove intermediate audit/debug fragments that are not useful for users or LLM consumers. Primary candidates: per-item `quote` and `raw` strings inside structured money/quantity values.

## Acceptance Criteria

- [ ] Decide whether `source_refs[].quote_items[].quote` should stay in the schema or be removed after `source_refs[].quote` remains available for source audit.
- [ ] Decide whether `EstimateDetailQuantityValue.raw` and `EstimateDetailMoneyValue.raw` should stay in public JSON/markdown or be removed/kept only in a non-public curation layer.
- [ ] If fields are removed, update `apps/www/src/lib/reglament/detail-schema.ts`, dataset modules, JSON/markdown output and tests consistently.
- [ ] LLM markdown keeps useful structured values: label, linked `resource_ids`, unit, numeric quantity, unit price, total and notes.
- [ ] No source provenance is lost: PDF id, page, fragment and legacy `source_refs[].quote` remain enough to audit the source row.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [ ] `pnpm --filter @shelkovo/www test -- detail-markdown`
- [ ] `pnpm --filter @shelkovo/www typecheck`

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
