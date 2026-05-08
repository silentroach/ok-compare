# Task 021: Landscaping Quote Item Table Fields

Status: [ ] Not Started

## Description

Enrich structured `source_refs[].quote_items` in `landscaping.ts` with source-table columns from `landscaping.pdf`: unit, quantity, unit price and total. Keep the legacy `quote` strings unchanged.

## Acceptance Criteria

- [ ] Multi-position `quote_items` in `apps/www/src/data/reglament/estimate-details-2026/landscaping.ts` include `quantity` with source unit where the PDF row has a quantity column.
- [ ] Items include `unit_price_rub` where the PDF row has a unit-price/rate column.
- [ ] Items keep `total_rub` where the PDF row has an amount column.
- [ ] No value is inferred from totals alone when the source row is unclear; ambiguous rows get `note` or remain partial with a reason.
- [ ] Existing `quote` text and `resource_ids` stay compatible with Task 019 output.
- [ ] Tests cover at least one enriched landscaping PPE/resource-statement quote item.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [ ] `pnpm --filter @shelkovo/www test -- detail-markdown`
- [ ] `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 019.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026/landscaping.ts`
- `apps/www/src/data/reglament/estimate-details-2026.test.ts`
- `docs/tasks/reglament-estimate-details/extra.md`

## Estimated Scope

Medium: landscaping has mixed production-program, PPE and resource-statement quote items.
