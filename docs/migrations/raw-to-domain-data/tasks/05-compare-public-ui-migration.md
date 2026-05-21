# Task 05: Compare UI и public adapters

## Описание

Перевести compare UI, routes и public outputs на domain model через явные adapters. Этот task закрывает compare как вертикальный срез: internal code получает domain data, public surfaces получают public DTO.

## Acceptance criteria

- Astro routes compare используют domain fields и не обращаются к raw settlement shape.
- Svelte compare components получают props в `camelCase` или explicit component DTO, а не raw settlement shape.
- Public compare JSON строится через отдельный public DTO adapter.
- Compare discovery schemas и `llms`-описания обновлены под фактический public DTO.
- Если public compare JSON меняет field names, tests явно фиксируют новый contract и обновляют agent-facing docs.
- В compare UI и route code не осталось raw `snake_case` обращений, кроме public legacy adapter при осознанном сохранении старого контракта.

## Verification

- `pnpm --filter @shelkovo/www test -- src/compare`
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 04.

## Files likely touched

- `apps/www/src/compare/components/*.svelte`
- `apps/www/src/compare/components/*.test.ts`
- `apps/www/src/pages/815/compare/**/*.ts`
- `apps/www/src/pages/815/compare/**/*.astro`
- `apps/www/src/compare/lib/discovery.ts`
- `apps/www/src/compare/lib/llms.ts`
- `apps/www/src/compare/lib/public-surface.ts`

## Notes

Если редактируются `.svelte` файлы, использовать Svelte-specific workflow и autofixer. Не запускать `pnpm dev` без явной просьбы.
