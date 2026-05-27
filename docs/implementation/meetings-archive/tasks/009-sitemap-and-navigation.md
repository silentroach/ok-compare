---
status: completed
id: 009-sitemap-and-navigation
depends_on:
  - 002-domain-loader-public-dto
  - 004-html-pages
parallel_safe: true
---

# 009 Sitemap And Navigation

## Цель

Зафиксировать публичность встреч без продвижения в навигации: `/meetings/` не попадает в sitemap и главное меню, а detail-страницы встреч попадают в sitemap как источники.

## Skills

- `astro`
- `source-driven-development`
- `code-simplification`
- `code-review-and-quality`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- `docs/decisions/014-meetings-archive-public-surface.md`
- `apps/www/astro.config.ts`
- `apps/www/src/lib/sitemap.ts`
- `apps/www/src/lib/sitemap-data.ts`
- `apps/www/src/lib/sitemap.test.ts`
- `apps/www/src/layouts/BaseLayout.astro`

## Границы работы

- Update sitemap filtering or metadata so `/meetings/` is excluded.
- Add meeting detail pages to sitemap metadata source.
- Add tests proving root exclusion and detail inclusion.
- Verify no main navigation item points to `/meetings/`.
- Do not block direct links, robots crawling of detail pages or public catalog discovery.

## Sitemap Rules

- `/meetings/` excluded from sitemap.
- `/meetings/YYYY-MM-DD/[slug]/` included.
- Detail lastmod comes from meeting date or updated timestamp if a future field exists.
- Detail changefreq should be conservative, likely yearly or monthly.
- Markdown companions, JSON and llms files should not become sitemap pages.

## Acceptance Criteria

- Tests fail if `/meetings/` appears in sitemap output.
- Tests fail if a meeting detail page is missing from sitemap metadata.
- Header/main menu still omits meetings.
- Direct `/meetings/` page remains buildable and linkable.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/sitemap src/lib/sitemap-data`
- `pnpm --filter @shelkovo/www typecheck`

## Completion Protocol

- Run `code-simplification` after tests are green.
- Run `code-review-and-quality` before commit.
- Update this file status to `completed` with a short completion note.
- Update `docs/implementation/meetings-archive/context.md` task checkbox.
- Commit only files touched for this task.

## Completion Note

Completed on 2026-05-27: added focused sitemap tests for `/meetings/` exclusion, meeting detail metadata inclusion, non-page meetings surface exclusion, and main navigation omission; wired the Astro sitemap filter through a tested helper; added meetings detail metadata to the sitemap data source. Verification passed with focused sitemap tests, `@shelkovo/www` typecheck, and build. Empty meetings collection warning remains expected.
