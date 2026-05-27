---
status: completed
id: 011-final-integration-review
depends_on:
  - 001-source-contract
  - 002-domain-loader-public-dto
  - 003-meeting-mentions
  - 004-html-pages
  - 005-markdown-companions
  - 006-json-feed
  - 007-llms-surfaces
  - 008-public-surface-and-nginx
  - 009-sitemap-and-navigation
parallel_safe: false
---

# 011 Final Integration Review

## Цель

Провести финальную интеграционную проверку реализации архива встреч: тесты, build, публичные контракты, docs status, code simplification и review.

## Skills

- `code-simplification`
- `code-review-and-quality`
- `astro`
- `frontend-ui-engineering`
- `tailwind-design-system`
- `security-and-hardening`
- `nginx-expert`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- Все task-файлы в `docs/implementation/meetings-archive/tasks/`
- `docs/decisions/014-meetings-archive-public-surface.md`
- `apps/www/AGENTS.md`
- `ops/nginx/AGENTS.md` if nginx was changed

## Границы работы

- Do not add new feature scope.
- Fix integration regressions found by tests or build.
- Harmonize docs status and task completion notes.
- Confirm blocked video provider status is intentional if task `010` is still blocked.
- Commit only final integration fixes and docs status changes.

## Review Checklist

- `/meetings/` exists and is not in main menu.
- `/meetings/` is excluded from sitemap.
- Meeting detail pages are included in sitemap.
- Detail pages hide absent optional sections.
- Per-meeting Markdown route exists and uses AST generation.
- JSON feed uses public DTO with `camelCase`.
- `llms.txt` and `llms-full.txt` exist for meetings.
- Root llms text references meetings surfaces.
- Public surface registry includes meetings.
- Root API catalog discovers meetings surfaces expected by ADR and plan.
- Mention syntax for meetings works from editorial Markdown.
- Person mentions inside meeting body work.
- No arbitrary iframe rendering exists.
- No fake public meeting was added unless user provided real content.
- No Markdown tables were introduced in public Markdown or llms docs.

## Verification

- `pnpm --filter @shelkovo/www typecheck`
- `pnpm --filter @shelkovo/www test`
- `pnpm build`
- `git status`
- `git diff`
- `git log --oneline -10`

## Completion Protocol

- Run `code-simplification` over the completed feature and simplify only safe complexity.
- Run `code-review-and-quality` and fix high/medium findings or document why they remain.
- Update all completed task statuses and context checkboxes.
- If task `010` remains blocked, leave it clearly blocked and do not mark MVP iframe support complete.
- Make final commit for integration fixes only.

## Completion Note

Completed on 2026-05-27: ran final integration review for the meetings archive MVP. Verified tasks `001-009` are completed, task `010` remains intentionally blocked until the first real iframe provider is selected, and no fake public meeting content exists. Confirmed meetings HTML/Markdown/JSON/llms/public-surface/sitemap/navigation contracts by source and generated artifact review. Verification passed: `pnpm --filter @shelkovo/www typecheck`, `pnpm --filter @shelkovo/www test`, `pnpm build`, and `pnpm audit --prod --audit-level high`. No high/medium code-review findings found; no safe code simplification was needed in this final docs/status-only slice. A final commit was not made because this OpenCode session was not explicitly asked to commit.
