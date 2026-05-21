# Task 08: Status raw/domain foundation

## Описание

Разделить raw frontmatter status incidents от domain status model. Сейчас `StatusIncident` и related types содержат raw-style поля вроде `started_iso`, `source_url`, `is_active`, `by_service`.

## Acceptance criteria

- Status incident raw schema вынесена из `content.config.ts` или обернута как reusable `RawStatusIncidentSchema`.
- Domain status types живут отдельно от raw schema и не импортируют Zod.
- `StatusIncident`, `StatusServiceSummary`, `StatusDataset` и related interfaces используют `camelCase`.
- Status domain interfaces являются readonly snapshot: nested objects readonly, arrays `readonly T[]`, maps `ReadonlyMap` при наличии.
- Loader или mapper явно переводит raw `started_at`, `ended_at`, `source_url` в domain fields.
- Status service/kind/area string values проходят через явный mapper, даже если часть значений совпадает с raw.
- Existing status load tests обновлены на domain names.

## Verification

- `pnpm --filter @shelkovo/www test -- src/lib/status/load.test.ts src/lib/status/schema.test.ts`
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 01.
- Task 02, если status mentions уже используют общий mention layer.

## Files likely touched

- `apps/www/src/content.config.ts`
- `apps/www/src/lib/status/schema.ts`
- `apps/www/src/lib/status/types.ts`
- `apps/www/src/lib/status/raw-schema.ts`
- `apps/www/src/lib/status/load.ts`
- `apps/www/src/lib/status/view.ts`
- Related status tests

## Notes

DOM payloads и timeline tooltip JSON считать отдельным DTO boundary. Не смешивать их с domain `StatusIncident`.
