# Progress

## 2026-05-20 Task 01

Active task: `task-1779290934-3710` / `code-assist:012-entity-mention-graph:step-01:neutral-mentions`.

Implemented neutral app-level mention layer in `apps/www/src/lib/mentions`:

- `EntityMentionType`, `EntityMentionTarget`, `SiteMentionRegistry`, `NormalizedEntityMentions`.
- `createSiteMentionRegistry` with duplicate short slug rejection.
- `normalizeEntityMentions` preserving `@slug`, `@slug:case`, `[visible text](@slug)`, unsupported labelled case errors, unknown slug errors, and per-body dedupe.
- `people/mentions.ts` is now a thin adapter around the neutral layer while keeping compatible person fields.

Verification:

- RED: `pnpm --filter @shelkovo/www test -- src/lib/mentions` failed because `./index` did not exist yet.
- GREEN: `pnpm --filter @shelkovo/www test -- src/lib/mentions src/lib/people/mentions.test.ts src/lib/markdown/render.test.ts` passed, 85 files / 519 tests.
- `pnpm --filter @shelkovo/www typecheck` passed.

Notes:

- Existing people-facing tests that asserted old people-specific error text were updated to generic entity-level wording.
