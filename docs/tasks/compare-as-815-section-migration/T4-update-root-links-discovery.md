# T4: Update Root-Site Links And Agent Discovery References

Status: todo

Index: `../compare-as-815-section-migration.md`
Handoff: `../compare-as-815-section-handoff.md`

## Description

Заменить canonical root-site references from `/compare/` to `/815/compare/` in visible links and agent-facing discovery/docs surfaces.

## Acceptance Criteria

- [ ] Home dropdown and any root-site visible compare links point to `/815/compare/`.
- [ ] `apps/www/src/lib/discovery.ts` and `apps/www/src/lib/llms.ts` use `/815/compare/...` for compare paths, feeds, `llms.txt`, API catalog and skills.
- [ ] Agent skill docs under `apps/www/public/.well-known/agent-skills` no longer describe compare as living under `/compare/`.
- [ ] Hardcoded `/compare/` references left in the repo are either intentional redirects/tests for old paths or documented in handoff.

## Verification

- [ ] `pnpm --dir apps/www test`
- [ ] `pnpm --dir apps/www typecheck`
- [ ] `rg "/compare" apps/www packages docs AGENTS.md` reviewed; intentional leftovers documented.

## Dependencies

- T3.

## Likely Touched Files

- `apps/www/src/pages/index.astro`
- `apps/www/src/lib/discovery.ts`
- `apps/www/src/lib/llms.ts`
- `apps/www/public/.well-known/agent-skills/site-sections/SKILL.md`
- `apps/www/src/lib/news/html.test.ts` if expected internal links change
- `docs/tasks/compare-as-815-section-handoff.md`
- `docs/tasks/compare-as-815-section-migration.md`
- `docs/tasks/compare-as-815-section-migration/T4-update-root-links-discovery.md`

## Estimated Scope

M.

## Completion

- [ ] Mark this file `Status: done`.
- [ ] Update task index status.
- [ ] Update handoff task registry and task log.
- [ ] Commit this task separately.
