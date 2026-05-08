# Task 004: Markdown Companions

Status: [x] Done

## Description

Generate markdown companions for LLM use from the detail dataset: overview, materials, machines, labor and checks.

## Acceptance Criteria

- [x] `/815/regulation/details.md` summarizes the dataset and links topical files.
- [x] `/815/regulation/details/materials.md` lists material resources.
- [x] `/815/regulation/details/machines.md` lists machine resources.
- [x] `/815/regulation/details/labor.md` lists labor resources and rates.
- [x] `/815/regulation/details/checks.md` lists control totals, deltas and `needs_check` items.

## Verification

- [x] `pnpm --filter @shelkovo/www typecheck`
- [x] Markdown files render from dataset without hardcoded duplicate lists.

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
