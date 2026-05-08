# Task 005: Discovery And LLM Links

Status: [ ] Not started

## Description

Wire detail JSON and markdown files into agent-facing discovery surfaces.

## Acceptance Criteria

- [ ] `llms.txt` or reglament-specific LLM text points agents to detail JSON and markdown.
- [ ] `llms-full.txt` includes the new detail surfaces.
- [ ] API catalog includes detail JSON and markdown links.
- [ ] `routes.ts` exposes constants/helpers for all detail paths.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- reglament`
- [ ] `pnpm --filter @shelkovo/www typecheck`

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
