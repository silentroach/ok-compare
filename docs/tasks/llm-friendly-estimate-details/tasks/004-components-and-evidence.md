# Task 004: Components and Evidence

Status: [ ] Pending

## Description

Переосмыслить `quote_items`: смысловой состав строки вывести как `components`, а происхождение данных из PDF-таблиц - как `evidence` или `source_rows`.

## Acceptance Criteria

- [ ] Public contract does not expose `quote_items` as the primary semantic name.
- [ ] `components[]` describe what the row includes: labor, machines, materials, contractors, taxes or other meaningful elements.
- [ ] `evidence[]` or `source_rows[]` keep PDF id, page, fragment, quote/table values and linked component/resource ids.
- [ ] The same source row is not repeated excessively inside every public object.
- [ ] Existing source refs remain available enough for manual audit.

## Verification

- [ ] Snapshot for a row with existing `quote_items` shows clear `components` and compact `evidence`.
- [ ] Snapshot for a row without `quote_items` still has useful components from resources/control totals.
- [ ] `pnpm --filter @shelkovo/www test -- detail-agent`

## Dependencies

- Task 001.
- Task 002.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-agent.ts`
- `apps/www/src/lib/reglament/detail-agent-evidence.ts`
- `apps/www/src/lib/reglament/detail-agent.test.ts`

## Estimated Scope

Medium: 3-5 files.
