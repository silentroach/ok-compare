---
status: completed
id: 005-markdown-companions
depends_on:
  - 002-domain-loader-public-dto
parallel_safe: true
---

# 005 Markdown Companions

## Цель

Добавить Markdown-версию каждой встречи: `/meetings/YYYY-MM-DD/[slug]/index.md`. Это чистая текстовая версия для ссылок, терминалов, поисковых роботов и AI-агентов.

## Skills

- `astro`
- `source-driven-development`
- `copy-editing`
- `code-simplification`
- `code-review-and-quality`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- `docs/decisions/008-markdown-ast-generation.md`
- `apps/www/src/lib/news/markdown.ts`
- `apps/www/src/pages/news/[year]/[month]/[entry]/index.md.ts`
- `apps/www/src/lib/markdown/llms-document.ts`

## Границы работы

- Create `apps/www/src/lib/meetings/markdown.ts`.
- Create `apps/www/src/pages/meetings/[date]/[slug]/index.md.ts`.
- Use `@shelkovo/markdown` AST helpers.
- Do not add `/meetings/index.md` unless ADR is updated.
- Do not use Markdown tables.
- Do not use whole-document `lines.join('\n')` string assembly.

## Markdown Structure

- H1 meeting title.
- Frontmatter with stable public metadata and URLs.
- Summary section first.
- Protocol section only when protocol fields exist.
- Recording and transcript section only when recording or transcript exists.
- Documents and sources section only when links exist.
- Transcript segments include stable anchors and timecodes.
- Include source URL and HTML URL when available.

## Acceptance Criteria

- Minimal meeting Markdown has title, date, summary and canonical links without empty sections.
- Full meeting Markdown includes decisions, action items, questions, documents and transcript segments.
- Markdown route returns `Content-Type: text/markdown; charset=utf-8` and `X-Robots-Tag: noindex, follow`.
- Tests assert stable URL, anchor and section behavior without snapshotting incidental prose.
- Grep shows no manual whole-document `lines.join('\n')` in meeting Markdown generation.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/meetings src/pages/meetings`
- `pnpm --filter @shelkovo/www typecheck`

## Completion Protocol

- Run `code-simplification` after tests are green.
- Run `code-review-and-quality` before commit.
- Update this file status to `completed` with a short completion note.
- Update `docs/implementation/meetings-archive/context.md` task checkbox.
- Commit only files touched for this task.

## Completion Note

Completed 2026-05-27: added per-meeting Markdown AST generator, `/meetings/YYYY-MM-DD/[slug]/index.md` endpoint headers/static paths, focused generator/route tests, and nginx markdown MIME/cache coverage for meeting companions.
