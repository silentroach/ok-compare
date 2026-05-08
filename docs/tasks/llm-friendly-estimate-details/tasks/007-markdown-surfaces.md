# Task 007: Markdown Surfaces

Status: [ ] Pending

## Description

Create markdown companions for the agent dataset. These files should read like an agent briefing, not a dump of internal rows.

## Acceptance Criteria

- [ ] New markdown index exists at `/815/regulation/details/agent.md`.
- [ ] New rows overview exists at `/815/regulation/details/rows.md`.
- [ ] Markdown explains how to answer common agent questions using row dossiers.
- [ ] Markdown uses concise source labels instead of repeating full provenance on every line.
- [ ] If per-row markdown is added, routes are generated from stable `estimate_row_id` values.

## Verification

- [ ] Snapshot tests cover generated markdown.
- [ ] Markdown can answer the pilot questions from Task 009 without requiring old `materials.md`, `machines.md` or `labor.md`.
- [ ] `pnpm --filter @shelkovo/www test -- detail-agent`

## Dependencies

- Task 006.

## Files Likely Touched

- `apps/www/src/lib/reglament/detail-agent-markdown.ts`
- `apps/www/src/pages/815/regulation/details/agent.md.ts`
- `apps/www/src/pages/815/regulation/details/rows.md.ts`
- `apps/www/src/lib/reglament/routes.ts`

## Estimated Scope

Medium: 3-5 files.
