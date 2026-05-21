# Task 07: News articles migration на domain model

## Описание

Перевести news article loading, events, media и archive/list structures на domain model в `camelCase`. Сохранить raw frontmatter как внешний input и public outputs как отдельный contract.

## Acceptance criteria

- `NewsArticle`, `NewsListArticle`, `NewsEvent`, `NewsDataset` и related interfaces используют `camelCase` для внутренних полей.
- Fields вроде `markdown_url`, `published_at`, `published_iso`, `source_url`, `cover_url`, `cover_alt`, `starts_at`, `starts_iso`, `ics_url`, `by_id`, `by_tag` заменены на domain names.
- Article mapper или loader boundary явно строит domain article из raw frontmatter, body, author и assets.
- News public feeds, RSS, Markdown companions, discovery и llms используют explicit public adapters там, где output shape отличается от domain.
- Tests обновлены так, чтобы проверять domain behavior и public DTO отдельно.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/news`
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 02, если news mentions уже используют общий mention layer.
- Task 06.

## Files likely touched

- `apps/www/src/lib/news/load.ts`
- `apps/www/src/lib/news/schema.ts`
- `apps/www/src/lib/news/types.ts`
- `apps/www/src/lib/news/mentions.ts`
- `apps/www/src/lib/news/discovery.ts`
- `apps/www/src/lib/news/llms.ts`
- `apps/www/src/pages/news/**/*.ts`
- `apps/www/src/pages/news/**/*.astro`
- Related news tests

## Notes

Если public shape меняется, обновить соответствующие public schema/discovery/llms tests в том же task.
