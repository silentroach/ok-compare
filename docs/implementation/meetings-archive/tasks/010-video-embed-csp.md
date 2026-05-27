---
status: blocked
id: 010-video-embed-csp
depends_on:
  - 001-source-contract
  - 004-html-pages
parallel_safe: false
blocker: first real iframe provider is not selected
---

# 010 Video Embed And CSP

## Цель

Безопасно включить iframe-видео для первого реального провайдера записи встречи. До выбора провайдера страница должна показывать обычную ссылку на запись и не расширять CSP заранее.

## Skills

- `security-and-hardening`
- `nginx-expert`
- `astro`
- `frontend-ui-engineering`
- `source-driven-development`
- `code-simplification`
- `code-review-and-quality`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- `docs/decisions/014-meetings-archive-public-surface.md`
- `docs/decisions/005-csp-inline-script-policy.md`
- `ops/nginx/AGENTS.md`
- `ops/nginx/CSP.md`
- `ops/nginx/kpshelkovo-online.conf`
- `apps/www/src/pages/meetings/[date]/[slug]/index.astro`
- `apps/www/src/lib/meetings/raw-schema.ts`

## Blocker

Первый реальный iframe provider неизвестен. Не выполнять задачу как completed, пока нет конкретного provider URL pattern. Не добавлять несколько провайдеров заранее.

## Границы работы

- Add provider allowlist validation for `video_embed_url`.
- Render iframe only for allowlisted embed URLs.
- Keep `video_url` as a regular external link fallback.
- Update CSP in `ops/nginx/*` only for the selected provider.
- Update `ops/nginx/CSP.md` if policy explanation changes.
- Do not add third-party SDK scripts.
- Do not accept arbitrary iframe URLs.

## Security Requirements

- Validate scheme and host exactly or with narrowly scoped patterns.
- Reject userinfo, unexpected ports and unsupported protocols.
- Add iframe `title`.
- Use restrictive `allow` attributes.
- Do not add broad `frame-src *` or wildcard provider rules.
- If provider needs scripts, stop and ask for a separate decision.

## Acceptance Criteria

- Allowed provider embed URL renders iframe.
- Non-allowed embed URL fails validation or is never rendered as iframe.
- CSP allows exactly the selected provider needed for iframe.
- Recording link still works when no embed URL exists.
- Tests cover allowlist accept/reject cases.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/meetings src/pages/meetings`
- `pnpm --filter @shelkovo/www typecheck`
- If nginx config changed, run the repository's existing nginx validation command if present; otherwise document static review only.

## Completion Protocol

- Change status from `blocked` to `in_progress` only after provider is known.
- Run `code-simplification` after tests are green.
- Run `code-review-and-quality` before commit.
- Update this file status to `completed` with provider and CSP notes.
- Update `docs/implementation/meetings-archive/context.md` task checkbox.
- Commit only files touched for this task.
