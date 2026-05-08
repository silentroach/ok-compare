# Task 022: Improvement Quote Item Table Fields

Status: [x] Completed

## Description

Enrich structured `source_refs[].quote_items` in `improvement.ts` with source-table columns from `improvement.pdf`: unit, quantity, unit price and total. Keep the legacy `quote` strings unchanged.

## Acceptance Criteria

- [x] Multi-position `quote_items` in `apps/www/src/data/reglament/estimate-details-2026/improvement.ts` include `quantity` with source unit where the PDF row has a quantity column.
- [x] Items include `unit_price_rub` where the PDF row has a unit-price/rate column.
- [x] Items keep `total_rub` where the PDF row has an amount column.
- [x] No value is inferred from totals alone when the source row is unclear; ambiguous rows get `note` or remain partial with a reason.
- [x] Existing `quote` text and `resource_ids` stay compatible with Task 019 output.
- [x] Tests cover at least one enriched improvement PPE/tool quote item.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] `pnpm --filter @shelkovo/www test -- detail-markdown`
- [x] `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 019.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026/improvement.ts`
- `apps/www/src/data/reglament/estimate-details-2026.test.ts`
- `docs/tasks/reglament-estimate-details/extra.md`

## Estimated Scope

Medium: improvement has PPE and tool quote items whose source rows need unit/price verification.
