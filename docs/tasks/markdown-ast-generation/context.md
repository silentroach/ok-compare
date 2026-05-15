# Context

## Source

- Source type: PDD directory.
- Working directory: `docs/tasks/markdown-ast-generation/`.
- Objective: implement the Markdown AST generation migration described in `README.md`, with ADR-008 as the architectural decision and numbered task files as implementation artifacts.

## Original Request Summary

- Migrate public Markdown and Markdown-compatible generated text to mdast-based generation.
- Use `@shelkovo/markdown` as the shared package API for building, parsing, and serializing Markdown documents.
- Execute tasks sequentially and commit after each completed implementation task.

## Source Materials

- `docs/decisions/008-markdown-ast-generation.md`
- `docs/tasks/markdown-ast-generation/README.md`
- `docs/tasks/markdown-ast-generation/01-package-markdown-ast-api.md`
- `docs/tasks/markdown-ast-generation/02-migrate-news-markdown.md`
- `docs/tasks/markdown-ast-generation/03-migrate-status-markdown.md`
- `docs/tasks/markdown-ast-generation/04-migrate-people-markdown.md`
- `docs/tasks/markdown-ast-generation/05-migrate-reglament-overview-full.md`
- `docs/tasks/markdown-ast-generation/06-migrate-reglament-detail.md`
- `docs/tasks/markdown-ast-generation/07-migrate-compare-markdown.md`
- `docs/tasks/markdown-ast-generation/08-migrate-section-llms.md`
- `docs/tasks/markdown-ast-generation/09-migrate-root-reglament-compare-llms.md`
- `docs/tasks/markdown-ast-generation/10-cleanup-and-final-verification.md`

## Repo Patterns And Constraints

- Root app is in `apps/www`; read `apps/www/AGENTS.md` before changing that app.
- Do not run `pnpm dev` unless explicitly requested.
- Do not intentionally change visible/public text during migration; stop and ask if text changes become necessary.
- Do not rewrite ADR-003 Markdown-to-HTML rendering. This migration is only about generated Markdown strings.
- Do not add import restrictions, lint rules, or architecture tests against manual string generation unless a task explicitly asks for that.
- When each numbered task is implemented, update its `## Статус` to `Выполнено` and add a short deviation note if needed.
- Use the task-specific required skills listed in each task file before implementation.
- After each completed implementation task, make an atomic commit that captures the why.

## Integration Points

- Shared package API: `packages/markdown`.
- Website Markdown generators: `apps/www/src/lib/**/markdown.ts`, `apps/www/src/compare/lib/markdown.ts`.
- Agent-facing `llms.txt` generators: `apps/www/src/lib/**/llms.ts`, `apps/www/src/compare/lib/llms.ts`.
- Old app frontmatter helper: `apps/www/src/lib/markdown/frontmatter.ts`.

## Acceptance Criteria

- All public Markdown and Markdown-compatible generated documents use the package AST API instead of local document string serializers.
- Existing public URLs, document headings, frontmatter meaning, JSON/discovery contracts, and agent-facing structure remain semantically intact.
- Markdown output may change in serializer-owned formatting: escaping, YAML quoting, list indentation, and blank lines.
- `llms.txt` remains `.txt`, but is generated through the same AST approach.
- Final verification runs package tests, website tests/typecheck, and build or records a clear reason if unavailable.
