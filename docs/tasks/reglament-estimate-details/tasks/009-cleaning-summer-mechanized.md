# Task 009: Cleaning Summer Mechanized

Status: [ ] Not started

## Description

Extract summer mechanized cleaning from `cleaning.pdf`, including the key road watering/dust suppression detail.

## Acceptance Criteria

- [ ] Work item captures `Дороги (асфальт). Полив водой (обеспыливание) - 3 раза в день без дождя`.
- [ ] Work item links to `summer-road-dust-suppression` and `summer-road-watering` where appropriate.
- [ ] Resources include machinist labor, tractor, OPM-5 watering equipment, water and PPE.
- [ ] Controls reconcile to `cleaning-summer-mechanized` buckets in `estimate-2026`.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [ ] LLM markdown can answer how often watering is calculated in the detailed estimate.

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`
- `apps/www/src/lib/reglament/detail-markdown.ts`

## Estimated Scope

Medium: 2 files plus tests.
