# Task 04: Compare core migration на domain model

## Описание

Перевести core compare logic на domain `Settlement`, который приходит из mapper-а. Цель - убрать raw-поля из вычислений, рейтинга, статистики, форматирования и внутренних представлений compare.

## Acceptance criteria

- `loadSettlements()` возвращает domain `Settlement[]`, а не raw collection data.
- Compare core modules используют `shortName`, `isBaseline`, `managementCompany`, `commonSpaces`, `serviceModel` и другие domain fields.
- Compare tariff calculations используют domain tariff fields и domain enum values.
- Core tests обновлены так, чтобы fixtures создавали domain objects или проходили через mapper.
- В `apps/www/src/compare/lib` не осталось обычных обращений к raw `snake_case`, кроме raw schemas, mapper, public adapters, tests fixtures и migration comments.

## Verification

- `pnpm --filter @shelkovo/www test -- src/compare/lib`
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 03.

## Files likely touched

- `apps/www/src/compare/lib/data.ts`
- `apps/www/src/compare/lib/stats.ts`
- `apps/www/src/compare/lib/rating.ts`
- `apps/www/src/compare/lib/comparisons.ts`
- `apps/www/src/compare/lib/format.ts`
- `apps/www/src/compare/lib/full.ts`
- `apps/www/src/compare/lib/explorer.ts`
- `apps/www/src/compare/lib/markdown.ts`
- Related compare tests

## Notes

Не менять public JSON shape в этом task, если это не нужно для core migration. Public output должен быть отдельным adapter step.
