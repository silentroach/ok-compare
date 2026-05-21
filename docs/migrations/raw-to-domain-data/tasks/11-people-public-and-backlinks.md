# Task 11: People public surfaces и backlinks

## Описание

Перевести people discovery, llms, backlinks и mention outputs на явные public DTO adapters. Domain people model должна оставаться внутренней и не диктовать public shape напрямую.

## Acceptance criteria

- People public JSON/discovery/llms outputs строятся через public DTO или явный serializer.
- Public DTO использует `camelCase`, если нет осознанного legacy contract для старых имен.
- Backlinks строятся из domain mention graph и domain people profiles через adapter.
- Internal code использует `nameCases`, `markdownUrl`, `htmlUrl`, `sourceId`, `sortKey` в `camelCase`.
- Если public output сохраняет `name_cases`, `html_url` или `markdown_url`, это явно описано в public adapter tests как legacy behavior.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/people`
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 02.
- Task 10.

## Files likely touched

- `apps/www/src/lib/people/discovery.ts`
- `apps/www/src/lib/people/llms.ts`
- `apps/www/src/lib/people/mention-refs.ts`
- `apps/www/src/lib/people/registry.ts`
- `apps/www/src/pages/people/**/*.ts`
- Related people tests

## Notes

Не менять редакционный формат упоминаний людей. Этот task касается data contracts, а не Markdown syntax.
