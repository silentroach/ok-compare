# Task 003: JSON Endpoint

Status: [x] Done

## Description

Expose the detail dataset as a public JSON endpoint for agents and external checks.

## Acceptance Criteria

- [x] New route exists: `/815/regulation/data/estimate-details-2026.json`.
- [x] Route returns the curated dataset with JSON content type.
- [x] Route path is added to reglament public paths.
- [x] Dataset URL helper exists in `routes.ts`.

## Verification

- [x] `pnpm --filter @shelkovo/www typecheck`
- [x] Build output contains the JSON route after `pnpm --filter @shelkovo/www build`.

## Dependencies

- Task 002.

## Files Likely Touched

- `apps/www/src/pages/815/regulation/data/estimate-details-2026.json.ts`
- `apps/www/src/lib/reglament/routes.ts`

## Estimated Scope

Small: 2 files.
