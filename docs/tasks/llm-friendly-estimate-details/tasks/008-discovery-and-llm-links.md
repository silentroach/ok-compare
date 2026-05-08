# Task 008: Discovery and LLM Links

Status: [ ] Pending

## Description

Update agent discovery surfaces so LLMs find the new row dossier layer first.

## Acceptance Criteria

- [ ] `llms.txt`, regulation index markdown and discovery/catalog surfaces mention the new agent dataset.
- [ ] Existing detail surfaces are labeled as legacy/internal/audit-oriented if they remain linked.
- [ ] Link descriptions clearly tell agents when to use the new layer versus the original curated dataset.
- [ ] No stale URLs or duplicate contradictory guidance remain.

## Verification

- [ ] `pnpm --filter @shelkovo/www test -- detail-agent`
- [ ] `pnpm --filter @shelkovo/www typecheck`
- [ ] Manual read of `/815/regulation/llms.txt` confirms the new layer is discoverable.

## Dependencies

- Task 006.
- Task 007.

## Files Likely Touched

- `apps/www/src/lib/reglament/discovery.ts`
- `apps/www/src/lib/reglament/llms.ts`
- `apps/www/src/lib/reglament/routes.ts`
- `apps/www/src/pages/815/regulation/llms.txt.ts`

## Estimated Scope

Small: 2-4 files.
