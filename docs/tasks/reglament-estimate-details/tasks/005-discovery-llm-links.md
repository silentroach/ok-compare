# Task 005: Discovery And LLM Links

Status: [x] Done

## Description

Wire detail JSON and markdown files into agent-facing discovery surfaces.

## Acceptance Criteria

- [x] `llms.txt` or reglament-specific LLM text points agents to detail JSON and markdown.
- [x] `llms-full.txt` includes the new detail surfaces.
- [x] API catalog includes detail JSON and markdown links.
- [x] `routes.ts` exposes constants/helpers for all detail paths.

## Verification

- [x] `pnpm --filter @shelkovo/www test -- reglament`
- [x] `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 003.
- Task 004.

## Files Likely Touched

- `apps/www/src/lib/reglament/routes.ts`
- `apps/www/src/lib/reglament/discovery.ts`
- `apps/www/src/lib/reglament/llms.ts`
- `apps/www/src/pages/815/regulation/llms.txt.ts`
- `apps/www/src/pages/815/regulation/llms-full.txt.ts`

## Estimated Scope

Medium: 3-5 files.
