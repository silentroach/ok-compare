# Task 018: Final Agent Review

Status: [ ] Not started

## Description

Run a final review of the detail layer from an agent/LLM perspective: can it answer practical questions and can it support sum-control work?

## Acceptance Criteria

- [ ] LLM docs explain where to look for aggregated estimate, full-reglament services and detail resources.
- [ ] Sample questions are answerable from markdown/JSON without opening PDFs.
- [ ] All task checkboxes in `index.md` are updated.
- [ ] Remaining `needs_check` items are explicit and actionable.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- reglament`
- [ ] `pnpm --filter @shelkovo/www build`
- [ ] Manual query: road watering frequency from full service and detailed cleaning estimate.

## Dependencies

- Task 017.

## Files Likely Touched

- `docs/tasks/reglament-estimate-details/index.md`
- `apps/www/src/lib/reglament/llms.ts`
- `apps/www/src/lib/reglament/detail-markdown.ts`

## Estimated Scope

Small: 2-3 files.
