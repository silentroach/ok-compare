# Task 10: People raw/domain foundation

## Описание

Разделить people profile frontmatter от domain model. Сейчас people domain содержит поля вроде `name_cases`, `markdown_url`, `by_slug`, `mention_registry`.

## Acceptance criteria

- People raw schema вынесена из `content.config.ts` или обернута как reusable `RawPersonProfileSchema`.
- Domain interfaces для person profile, contacts, backlinks и dataset используют `camelCase`.
- People domain interfaces являются readonly snapshot: nested objects readonly, arrays `readonly T[]`, maps `ReadonlyMap` при наличии.
- `name_cases` переводится в domain `nameCases` через mapper.
- `markdown_url`, `by_slug`, `mention_registry` заменены на `markdownUrl`, `bySlug`, `mentionRegistry` во внутреннем коде.
- Contact normalization работает от domain/raw boundary явно и не смешивает raw input с domain contact.
- People load tests обновлены на domain names.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/people/load.test.ts src/lib/people/schema.test.ts`
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 02.

## Files likely touched

- `apps/www/src/content.config.ts`
- `apps/www/src/lib/people/schema.ts`
- `apps/www/src/lib/people/types.ts`
- `apps/www/src/lib/people/raw-schema.ts`
- `apps/www/src/lib/people/registry.ts`
- `apps/www/src/lib/people/view.ts`
- Related people tests

## Notes

Формы падежей `gen`, `dat`, `acc`, `ins`, `prep` не являются `snake_case`; их не нужно переименовывать.
