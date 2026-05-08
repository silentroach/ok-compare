# Task 010: Legacy Detail Cleanup Decision

Status: [ ] Pending

## Description

Decide what to do with the old public detail surfaces after the new agent layer is validated.

## Acceptance Criteria

- [ ] Decision is documented: keep, deprecate, replace or redirect old `details/*.md` surfaces.
- [ ] If old surfaces remain, docs clearly label their role as audit/internal detail rather than preferred LLM input.
- [ ] If old surfaces are changed, routes, discovery docs and tests are updated together.
- [ ] No useful source provenance from `estimate-details-2026` is lost.

## Verification

- [ ] Decision note exists in `docs/tasks/llm-friendly-estimate-details/extra.md` or a dedicated ADR/doc.
- [ ] `pnpm --filter @shelkovo/www test -- detail-agent`
- [ ] `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 009.

## Files Likely Touched

- `docs/tasks/llm-friendly-estimate-details/extra.md`
- `apps/www/src/lib/reglament/detail-markdown.ts`
- `apps/www/src/lib/reglament/routes.ts`
- `apps/www/src/lib/reglament/discovery.ts`

## Estimated Scope

Small to Medium: depends on keep/deprecate decision.
