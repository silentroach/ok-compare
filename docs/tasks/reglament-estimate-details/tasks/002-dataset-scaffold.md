# Task 002: Dataset Scaffold

Status: [x] Done

## Description

Add the initial curated dataset file and helper constructors for `estimate-details-2026`, with metadata and empty arrays ready for incremental PDF extraction.

## Acceptance Criteria

- [x] Dataset exists, likely `apps/www/src/data/reglament/estimate-details-2026.ts`.
- [x] Dataset has `schema_version`, `dataset_id`, source PDFs, curation notes and empty or minimal collections.
- [x] Helper constructors keep source refs, money values and quantities consistent.
- [x] Dataset exports typed value using the schema from Task 001.

## Verification

- [x] `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 001.

## Files Likely Touched

- `apps/www/src/data/reglament/estimate-details-2026.ts`
- `apps/www/src/lib/reglament/detail-schema.ts`

## Estimated Scope

Small: 1-2 files.
