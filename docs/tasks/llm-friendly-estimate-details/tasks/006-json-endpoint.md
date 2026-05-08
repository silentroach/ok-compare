# Task 006: JSON Endpoint

Status: [ ] Pending

## Description

Expose `estimate-details-agent-2026` through a new public JSON endpoint while keeping the old detail JSON available during transition.

## Acceptance Criteria

- [ ] New endpoint exists at `/815/regulation/data/estimate-details-agent-2026.json`.
- [ ] Response uses the public agent contract, not the internal curated dataset shape.
- [ ] JSON includes metadata that tells agents this is the preferred detail surface.
- [ ] Existing `/815/regulation/data/estimate-details-2026.json` continues to work unless Task 010 decides otherwise.

## Verification

- [ ] Route test or integration test covers the new endpoint body and content type.
- [ ] `pnpm --filter @shelkovo/www test -- detail-agent`
- [ ] `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 005.

## Files Likely Touched

- `apps/www/src/pages/815/regulation/data/estimate-details-agent-2026.json.ts`
- `apps/www/src/lib/reglament/detail-agent-json.ts`
- `apps/www/src/lib/reglament/routes.ts`

## Estimated Scope

Small: 2-3 files.
