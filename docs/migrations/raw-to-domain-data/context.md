# Context

This directory tracks the raw DTO -> domain model -> public DTO migration for `apps/www` data boundaries.

Canonical migration rules live in `CONTEXT.md`. Keep this lowercase file as the planner-required shared context entry point; do not duplicate the full migration guide here.

## Source

- Source type: rough objective continued across Ralph iterations.
- Original request summary: continue `docs/migrations/raw-to-domain-data/`.
- Current plan source: `plan.md` plus task artifacts in `tasks/*.md`.

## Integration Points

- ADR: `docs/decisions/013-raw-domain-public-data-boundary.md`.
- App-local rules: `apps/www/AGENTS.md` for work inside `apps/www`.
- Compare task specs: `docs/migrations/raw-to-domain-data/tasks/03-compare-raw-domain-foundation.md` through `tasks/05-compare-public-ui-migration.md`.

## Acceptance Criteria

- Runtime queue exposes only the current step's task wave.
- Each runtime task points to its task artifact and includes focused verification commands.
- Builders keep raw `snake_case` at explicit raw/public/test boundaries only.

## Constraints

- Do not implement in planner mode.
- Do not change public JSON or agent-facing contracts accidentally while migrating internals.
- If `.svelte` files are edited by a builder, use the Svelte-specific workflow and autofixer.
