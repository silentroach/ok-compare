# Task 09: Status UI и public adapters

## Описание

Перевести status UI, DOM payloads и public surfaces на domain model через явные DTO adapters. Этот task должен убрать raw-style поля из компонентов и browser runtime data structures.

## Acceptance criteria

- Astro/Svelte/status components используют domain fields или component DTO в `camelCase`.
- Timeline DOM JSON payloads имеют отдельный typed DTO и adapter из domain model.
- Public status discovery, llms и Markdown/JSON surfaces используют explicit public DTO.
- Fields вроде `started_iso`, `ended_iso`, `is_active`, `started_has_time`, `source_url`, `sort_last_change_at` не используются как internal component model.
- Tests DOM timeline, service cards и public surfaces обновлены.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/status src/components/status`
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 08.

## Files likely touched

- `apps/www/src/components/status/*.astro`
- `apps/www/src/components/status/*.ts`
- `apps/www/src/lib/status/timeline.dom.ts`
- `apps/www/src/lib/status/view.ts`
- `apps/www/src/lib/status/discovery.ts`
- `apps/www/src/lib/status/llms.ts`
- `apps/www/src/pages/status/**/*.ts`
- Related status tests

## Notes

HTML `data-*` attributes сами по себе остаются внешним браузерным интерфейсом. Важно не использовать raw object shape как внутренний TypeScript contract.
