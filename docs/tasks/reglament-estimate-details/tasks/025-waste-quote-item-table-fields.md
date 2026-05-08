# Task 025: Waste Quote Item Table Fields

Status: [ ] Not Started

## Description

Enrich structured `source_refs[].quote_items` in `waste.ts` with source-table columns from `waste.pdf`: unit, quantity, unit price and total. Keep the legacy `quote` strings unchanged.

## Acceptance Criteria

- [ ] Multi-position `quote_items` in `apps/www/src/data/reglament/estimate-details-2026/waste.ts` include `quantity` with source unit where the PDF row has a quantity column.
- [ ] Items include `unit_price_rub` where the PDF row has a unit-price/rate column.
- [ ] Items keep `total_rub` where the PDF row has an amount column.
- [ ] No value is inferred from totals alone when the source row is unclear; ambiguous rows get `note` or remain partial with a reason.
- [ ] Existing `quote` text and `resource_ids` stay compatible with Task 019 output.
- [ ] Tests cover at least one enriched waste resource-statement quote item.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [ ] `pnpm --filter @shelkovo/www test -- detail-markdown`
- [ ] `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 019.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026/waste.ts`
- `apps/www/src/data/reglament/estimate-details-2026.test.ts`
- `docs/tasks/reglament-estimate-details/extra.md`

## Estimated Scope

Small: waste already has several enriched resource-statement quote items, but remaining items should be checked for complete source-table fields.
