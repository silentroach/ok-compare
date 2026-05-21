# Task 06: News raw/domain foundation

## Описание

Разделить news author и article frontmatter schemas от domain types. News сейчас уже имеет domain interfaces, но часть полей остается в raw-стиле и схемы живут в `content.config.ts`.

## Acceptance criteria

- News author raw schema вынесена из `content.config.ts` или обернута как reusable `RawNewsAuthorSchema`.
- News article frontmatter raw schema вынесена из `content.config.ts` или обернута как reusable `RawNewsArticleSchema`.
- `content.config.ts` импортирует raw schemas или thin schema builders, а не хранит весь news raw contract inline.
- News domain interfaces перенесены или подготовлены к переносу в `types.ts`; текущий `schema.ts` не должен оставаться смешением validators и domain types.
- News domain interfaces являются readonly snapshot: nested objects readonly, arrays `readonly T[]`, maps `ReadonlyMap` при наличии.
- `NewsAuthor` получает domain field `shortName` вместо `short_name`.
- Author mapper явно переводит `RawNewsAuthor -> NewsAuthor`.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/news`
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 01.

## Files likely touched

- `apps/www/src/content.config.ts`
- `apps/www/src/lib/news/schema.ts`
- `apps/www/src/lib/news/types.ts`
- `apps/www/src/lib/news/raw-schema.ts`
- `apps/www/src/lib/news/mapper.ts`
- `apps/www/src/lib/news/load.ts`
- Related news tests

## Notes

Не менять article public output в этом task, если это не требуется для author migration.
