# Task 03: Compare raw/domain foundation

## Описание

Разделить compare settlement data на raw Zod-схемы, handwritten domain types и mapper. Это foundation task: он создает новый контракт и tests, но не обязан сразу переписать весь compare-код на новые поля.

## Acceptance criteria

- Compare raw schemas вынесены в отдельный файл или папку и названы как `Raw*Schema`.
- Raw-типы выводятся из Zod через `z.output<typeof Raw*Schema>` и не называются domain names.
- Domain interfaces для settlement, location, tariff, lots, infrastructure, common spaces, service model, source и management company написаны руками в отдельном `types.ts`.
- Domain interfaces используют `camelCase`, `readonly` и JSDoc для важных полей.
- Domain interfaces являются readonly snapshot: nested objects readonly, arrays `readonly T[]`, maps `ReadonlyMap` при наличии.
- Mapper `RawSettlement -> Settlement` явно переводит поля и enum/string literal values.
- Multi-word raw enum values вроде `rub_per_sotka`, `partial_asphalt`, `checkpoint_only` не остаются domain values.
- Existing compare schema tests либо перенесены на raw schemas, либо дополнены mapper tests.

## Verification

- `pnpm --filter @shelkovo/www test -- src/compare/lib/schema.test.ts`
- Добавить или обновить mapper tests и запустить их точечно.
- `pnpm --filter @shelkovo/www typecheck`

## Dependencies

- Task 01.

## Files likely touched

- `apps/www/src/compare/lib/schema.ts`
- `apps/www/src/compare/lib/settlement/schema.ts` или выбранный equivalent
- `apps/www/src/compare/lib/settlement/types.ts` или выбранный equivalent
- `apps/www/src/compare/lib/settlement/mapper.ts` или выбранный equivalent
- `apps/www/src/content.config.ts`
- `apps/www/src/compare/lib/schema.test.ts`

## Notes

Допустим временный compatibility export внутри compare, если он нужен для маленького diff. Он должен быть явно временным и удаляться в Task 13.
