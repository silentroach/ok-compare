# Task 003: Cost Taxonomy

Status: [ ] Pending

## Description

Map internal `cost_bucket` values into an LLM-friendly cost taxonomy that explains direct costs, indirect costs, taxes and gross totals.

## Acceptance Criteria

- [ ] Public taxonomy groups costs into at least `direct_costs`, `indirect_costs`, `taxes`, `gross` and `other` or a better documented equivalent.
- [ ] Mapping covers every value in `ESTIMATE_DETAIL_COST_BUCKETS`.
- [ ] Row dossiers expose both normalized cost groups and original bucket ids where useful for audit.
- [ ] Derived taxes and allocation notes are visible as explanations, not hidden implementation details.

## Verification

- [ ] Unit test fails if a new internal `cost_bucket` is not mapped.
- [ ] Snapshot for a row with taxes shows readable `cost_summary`.
- [ ] `pnpm --filter @shelkovo/www test -- detail-agent`

## Dependencies

- Task 001.
- Task 002.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-agent-costs.ts`
- `apps/www/src/lib/reglament/detail-agent.ts`
- `apps/www/src/lib/reglament/detail-agent.test.ts`

## Estimated Scope

Medium: 2-4 files.
