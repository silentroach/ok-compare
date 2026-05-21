# Task 02: Внутренние mention-контракты без raw-имен

## Описание

Перевести общий internal mention layer на `camelCase`, чтобы следующие миграции news, status и people не тащили старые поля вроде `label_cases`, `html_url`, `source_id`, `sort_key` как внутренний контракт.

## Acceptance criteria

- `EntityMentionTarget` и связанные internal types используют `camelCase`: например `labelCases`, `htmlUrl`, `markdownUrl`, `linkTitle`, `linkContext`.
- `EntityMentionSourceRef` и graph/source-ref helpers используют `camelCase`: например `targetType`, `targetSlug`, `sourceSection`, `sourceKind`, `sourceId`, `mentionedAt`, `sortKey`, `sourceEntity`.
- Все source adapters для news, status и people обновлены на новый internal contract.
- Если public people/backlink output пока сохраняет старые имена, они живут только в явном public adapter или legacy DTO, а не в generic mention types.
- Tests mention layer и source adapters обновлены.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/mentions src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mentions.test.ts`
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 01 желательно выполнить первым, но task можно делать независимо при понятном scope.

## Files likely touched

- `apps/www/src/lib/mentions/types.ts`
- `apps/www/src/lib/mentions/normalize.ts`
- `apps/www/src/lib/mentions/source-refs.ts`
- `apps/www/src/lib/mentions/graph.ts`
- `apps/www/src/lib/news/mentions.ts`
- `apps/www/src/lib/status/mentions.ts`
- `apps/www/src/lib/people/mentions.ts`
- Related tests рядом с этими файлами

## Notes

Это internal shared contract. Не менять редакционный Markdown-синтаксис `@slug`, `@slug:case`, `[видимый текст](@slug)`.
