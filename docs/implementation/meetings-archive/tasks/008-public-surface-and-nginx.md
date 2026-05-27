---
status: completed
id: 008-public-surface-and-nginx
depends_on:
  - 004-html-pages
  - 005-markdown-companions
  - 006-json-feed
  - 007-llms-surfaces
parallel_safe: false
---

# 008 Public Surface And Nginx

## Цель

Зарегистрировать public surfaces встреч и синхронизировать discovery/cache/nginx expectations для новых HTML, Markdown, JSON и llms routes.

## Skills

- `astro`
- `nginx-expert`
- `source-driven-development`
- `security-and-hardening`
- `code-simplification`
- `code-review-and-quality`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- `docs/decisions/011-public-surface-registry.md`
- `apps/www/src/lib/public-surface/index.ts`
- `apps/www/src/lib/public-surface/types.ts`
- `apps/www/src/lib/news/public-surface.ts`
- `apps/www/src/lib/root-public-surface.ts`
- `apps/www/src/lib/route-cache-coverage.test.ts`
- `ops/nginx/AGENTS.md`
- `ops/nginx/kpshelkovo-online.conf`
- `ops/nginx/CSP.md`

## Границы работы

- Create `apps/www/src/lib/meetings/public-surface.ts`.
- Register meetings slice in `apps/www/src/lib/public-surface/index.ts`.
- Update public surface tests and root discovery coverage.
- Update nginx config only where needed for MIME, cache, Link headers or CSP-related route behavior.
- Do not introduce schema/OpenAPI surfaces unless task `006` was explicitly expanded.
- Do not enable iframe CSP here; iframe provider work belongs to task `010`.

## Public Surface Slice

- Owner id: `meetings`.
- Anchor surface: `/meetings/` HTML.
- Detail route pattern: `/meetings/:date/:slug/`.
- Markdown companion pattern: `/meetings/:date/:slug/index.md`.
- Data feed: `/meetings/data/meetings.json`.
- LLMS files: `/meetings/llms.txt`, `/meetings/llms-full.txt`.
- Cache classes should follow existing HTML, markdown, data and static classes.
- Data and llms surfaces should be discoverable from root catalog where useful.

## Nginx Requirements

- Markdown route has correct `text/markdown` handling and no accidental HTML cache class.
- JSON route has correct `application/json` handling and data cache class.
- `llms*.txt` has correct text handling.
- Existing security headers remain intact.
- No arbitrary iframe source is allowed by this task.

## Acceptance Criteria

- Public surface registry includes meetings slice and tests cover it.
- Root API catalog can discover meetings data and llms surfaces.
- Route cache coverage tests include meetings routes.
- Nginx config remains consistent with registry expectations.
- No main-menu link is added.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/public-surface src/lib/root-discovery-routes.test.ts src/lib/route-cache-coverage.test.ts`
- `pnpm --filter @shelkovo/www typecheck`
- If nginx config changed, run the repository's existing nginx validation command if present; otherwise document that only static review was possible.

## Completion Protocol

- Run `code-simplification` after tests are green.
- Run `code-review-and-quality` before commit.
- Update this file status to `completed` with a short completion note.
- Update `docs/implementation/meetings-archive/context.md` task checkbox.
- Commit only files touched for this task.

## Completion Notes

- Added meetings public-surface slice and registered it in the app registry.
- Covered meetings root catalog discovery, nginx route cache/MIME expectations for meetings data and llms routes, and no iframe/CSP expansion.
- Verification passed: focused public-surface/root-discovery/route-cache tests, `@shelkovo/www` typecheck, and `@shelkovo/www` build. Local `nginx -t` could not run because the nginx binary is unavailable in this environment.
