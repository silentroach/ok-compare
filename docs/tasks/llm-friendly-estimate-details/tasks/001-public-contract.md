# Task 001: Public Contract

Status: [ ] Pending

## Description

Define the TypeScript public contract for `estimate-details-agent-2026`. The contract should be optimized for LLM consumption and make `rows[]` the primary entrypoint.

## Acceptance Criteria

- [ ] New schema/types module exists, likely `apps/www/src/lib/reglament/detail-agent-schema.ts`.
- [ ] `rows[]` is the primary public collection and each row dossier is addressable by `estimate_row_id`.
- [ ] The contract separates `components`, `cost_summary`, `issues` and `evidence` instead of exposing raw `work_items`, `resources` and `control_totals` as the main API.
- [ ] The contract avoids `null` in new types and uses optional properties where data can be absent.
- [ ] Existing `estimate-details-2026` schema remains available as the internal/curated source.

## Verification

- [ ] `pnpm --filter @shelkovo/www typecheck`
- [ ] New type-level or unit tests cover at least one complete row dossier fixture.

## Dependencies

None.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-agent-schema.ts`
- `apps/www/src/lib/reglament/detail-agent-schema.test.ts`

## Estimated Scope

Medium: 2-3 files.
