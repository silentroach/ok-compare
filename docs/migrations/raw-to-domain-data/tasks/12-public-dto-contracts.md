# Task 12: Public DTO contracts across sections

## Описание

Сделать consistency pass по всем public JSON/agent-facing surfaces после миграции внутренних моделей. Цель - убедиться, что наружу публикуются явные public DTO, а не случайная domain model и не raw YAML shape.

## Acceptance criteria

- Для compare, news, status и people есть явные public DTO или serializer functions рядом с public surface implementation.
- Public JSON fields используют `camelCase`, если внешний стандарт или legacy decision явно не требуют другого.
- Discovery schemas описывают фактические public DTO, а не internal domain interfaces.
- `llms.txt`, `llms-full.txt` и section llms docs не обещают старые поля после изменения public shape.
- Tests проверяют стабильные public fields, URL и schemas без зависимости от raw/domain internals.
- Все intentional legacy public fields перечислены в одном месте в inventory или context notes.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/root-discovery-routes.test.ts src/lib/news src/lib/status src/lib/people src/compare/lib`
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 05.
- Task 07.
- Task 09.
- Task 11.

## Files likely touched

- `apps/www/src/lib/*/discovery.ts`
- `apps/www/src/lib/*/llms.ts`
- `apps/www/src/pages/**/data/**/*.ts`
- `apps/www/src/lib/root-discovery-routes.test.ts`
- Section public surface tests

## Notes

Не использовать Markdown-таблицы в public Markdown/llms docs. Если нужно структурировать изменения, использовать списки.
