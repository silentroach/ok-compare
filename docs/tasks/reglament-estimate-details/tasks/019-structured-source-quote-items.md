# Task 019: Structured Source Quote Items

Status: [x] Completed

## Description

Add a structured representation for source quote fragments that currently pack multiple resource positions into one `quote` string. Keep existing `quote` text for compatibility, but expose machine-readable item arrays for LLM answers and checks.

## Acceptance Criteria

- [x] `EstimateDetailSourceRef` supports optional structured items without breaking current JSON consumers.
- [x] Shared helper API can build structured source refs consistently across detail modules.
- [x] Cleaning, landscaping, improvement, lighting, security and waste detail modules can migrate multi-position quotes incrementally.
- [x] Markdown companions render structured items clearly in Russian when present.
- [x] Tests cover JSON shape and markdown rendering for at least one migrated multi-position source ref.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- estimate-details-2026`
- [x] `pnpm --filter @shelkovo/www test -- detail-markdown`

## Dependencies

- Task 018.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-schema.ts`
- `apps/www/src/data/reglament/estimate-details-2026/shared.ts`
- `apps/www/src/data/reglament/estimate-details-2026/*.ts`
- `apps/www/src/lib/reglament/detail-markdown.ts`
- `apps/www/src/data/reglament/estimate-details-2026.test.ts`
- `apps/www/src/lib/reglament/detail-markdown.test.ts`

## Estimated Scope

Medium: schema additive change plus one or more incremental module migrations.
