# Implementation Context

Source type: PDD directory.

Source directory: `docs/decisions/012-entity-mention-graph/`.

Original request: implement `docs/decisions/012-entity-mention-graph/` for ADR-012, the unified entity mention graph in Markdown.

## Source Materials

- `docs/decisions/012-entity-mention-graph/context.md`
- `docs/decisions/012-entity-mention-graph/task-01-neutral-mentions.md`
- `docs/decisions/012-entity-mention-graph/task-02-markdown-pipeline.md`
- `docs/decisions/012-entity-mention-graph/task-03-source-ref-adapters.md`
- `docs/decisions/012-entity-mention-graph/task-04-generic-graph.md`
- `docs/decisions/012-entity-mention-graph/task-05-cleanup-docs.md`
- `docs/decisions/012-entity-mention-graph/task-06-final-regression.md`
- `docs/decisions/012-entity-mention-graph.md`
- `docs/decisions/001-markdown-slug-mentions.md`
- `docs/decisions/003-markdown-pipeline-layering.md`
- `AGENTS.md`
- `apps/www/AGENTS.md`

## Repo Patterns

- Main app is `apps/www`, an Astro app.
- App-level mention behavior belongs in `apps/www/src/lib/mentions`, not in `@shelkovo/markdown`.
- Current implementation is people-only: `apps/www/src/lib/people/mentions.ts` owns parser and normalizer, and `apps/www/src/lib/markdown/render.ts` accepts people-specific options.
- News, status, and people loaders currently receive people mention registry data and store mentions in body units.
- Shared TypeScript code should prefer `readonly`, optional properties over `null`, and one-line `const` arrows for trivial helpers.

## Integration Points

- `apps/www/src/lib/people/mentions.ts`
- `apps/www/src/lib/people/mentions.test.ts`
- `apps/www/src/lib/markdown/render.ts`
- `apps/www/src/lib/markdown/render.types.ts`
- Later steps: `apps/www/src/lib/news/load.ts`, `apps/www/src/lib/status/load.ts`, `apps/www/src/lib/people/load.ts`, source ref adapters, and generic graph modules.

## Acceptance Criteria

- Editorial syntax stays short: `@slug`, `@slug:case`, `[visible text](@slug)`.
- No namespace syntax such as `@person:slug`.
- The generic mention layer is app-level and initially supports `person`, while staying extensible.
- Duplicate short slugs across registered targets fail before body processing.
- Explicitly requested missing case forms fail at build-time normalization.
- `[visible text](@slug:case)` remains invalid.
- Mentions are only processed on explicitly mention-enabled Markdown body surfaces.
- People backlinks public shape remains unchanged by the full ADR-012 implementation.
- No public generic `/entities` API or feed is added.

## Constraints

- Planner iteration must not implement code.
- Runtime tasks are the canonical queue; only the current step's wave should be open.
- Step 1 is backed by `docs/decisions/012-entity-mention-graph/task-01-neutral-mentions.md`.
- Builders must run the focused checks from their task file and use required skills listed there.
