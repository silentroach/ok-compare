# Task 004: Markdown Companions

Status: [ ] Not started

## Description

Generate markdown companions for LLM use from the detail dataset: overview, materials, machines, labor and checks.

## Acceptance Criteria

- [ ] `/815/regulation/details.md` summarizes the dataset and links topical files.
- [ ] `/815/regulation/details/materials.md` lists material resources.
- [ ] `/815/regulation/details/machines.md` lists machine resources.
- [ ] `/815/regulation/details/labor.md` lists labor resources and rates.
- [ ] `/815/regulation/details/checks.md` lists control totals, deltas and `needs_check` items.

## Verification

- [ ] `pnpm --filter @shelkovo/www typecheck`
- [ ] Markdown files render from dataset without hardcoded duplicate lists.

## Dependencies

- Task 002.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-markdown.ts`
- `apps/www/src/pages/815/regulation/details.md.ts`
- `apps/www/src/pages/815/regulation/details/materials.md.ts`
- `apps/www/src/pages/815/regulation/details/machines.md.ts`
- `apps/www/src/pages/815/regulation/details/labor.md.ts`
- `apps/www/src/pages/815/regulation/details/checks.md.ts`

## Estimated Scope

Medium: 5-6 files.
