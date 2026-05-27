---
status: completed
id: 007-llms-surfaces
depends_on:
  - 005-markdown-companions
  - 006-json-feed
parallel_safe: true
---

# 007 LLMS Surfaces

## Цель

Добавить `/meetings/llms.txt`, `/meetings/llms-full.txt` и обновить корневые AI-тексты, чтобы агенты понимали, где брать встречи, Markdown, JSON и transcript context.

## Skills

- `astro`
- `source-driven-development`
- `copy-editing`
- `code-simplification`
- `code-review-and-quality`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- `docs/decisions/008-markdown-ast-generation.md`
- `apps/www/src/lib/llms.ts`
- `apps/www/src/lib/news/llms.ts`
- `apps/www/src/pages/news/llms.txt.ts`
- `apps/www/src/pages/news/llms-full.txt.ts`
- `apps/www/src/lib/markdown/llms-document.ts`

## Границы работы

- Create `apps/www/src/lib/meetings/llms.ts`.
- Create `apps/www/src/pages/meetings/llms.txt.ts`.
- Create `apps/www/src/pages/meetings/llms-full.txt.ts`.
- Update root `apps/www/src/lib/llms.ts` to mention meetings and their data surfaces.
- Use AST-compatible llms helpers, not manual document string assembly.

## LLMS Content Requirements

- Short file explains what the meetings archive is and gives primary URLs.
- Full file documents URL patterns, JSON fields, Markdown companion, transcript limitations and recommended reading order.
- Recommended reading order: JSON list for discovery, HTML or Markdown for one meeting, transcript segments for verification.
- Explicitly state that `/meetings/` is public but not a main-menu section.
- Explicitly state that transcript can be absent and absence is not an error.
- Do not claim iframe support unless task `010` is completed.

## Acceptance Criteria

- Both routes return `Content-Type: text/plain; charset=utf-8`.
- Root `llms.txt` or `llms-full.txt` links to meetings surfaces through registered or stable route helpers.
- Tests verify key URLs are present and no internal filesystem paths leak.
- Text remains concise and does not duplicate the full ADR.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/llms src/lib/meetings`
- `pnpm --filter @shelkovo/www typecheck`

## Completion Protocol

- Run `code-simplification` after tests are green.
- Run `code-review-and-quality` before commit.
- Update this file status to `completed` with a short completion note.
- Update `docs/implementation/meetings-archive/context.md` task checkbox.
- Commit only files touched for this task.

## Completion Note

Implemented `/meetings/llms.txt`, `/meetings/llms-full.txt`, root AI-text references, route header tests, focused no-internal-path checks, and verified with the required focused tests plus typecheck.
