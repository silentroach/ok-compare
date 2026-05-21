# Task 13: Финальные guardrails и cleanup

## Описание

Закрыть миграцию: удалить временные compatibility exports, добавить guardrails и проверить, что `snake_case` остался только во внешних зонах, разрешенных ADR-013.

## Acceptance criteria

- Временные compatibility exports, добавленные во время миграции, удалены.
- Добавлен architecture test или иной автоматический guardrail, который запрещает raw `snake_case` в domain/internal files и имеет allowlist для raw schemas, mapper-ов, public legacy adapters, fixtures и документации.
- Проверка отдельно ловит `z.infer` или `z.output`, если они используются как domain interface shortcut.
- Guardrail или review checklist проверяет, что domain interfaces не вводят mutable arrays/maps и новые mutable nested shapes без причины.
- `docs/migrations/raw-to-domain-data/CONTEXT.md` обновлен: все завершенные tasks отмечены или явно оставлены открытыми.
- `apps/www/AGENTS.md` или другой rules file обновлен коротким правилом про Raw DTO, domain model и public DTO, если команда хочет закрепить convention для будущих агентов.
- Full test/typecheck/build проходят или failures явно задокументированы как unrelated.

## Verification

- `pnpm --filter @shelkovo/www test`
- `pnpm --filter @shelkovo/www typecheck`
- `pnpm build`

## Dependencies

- Task 12.

## Files likely touched

- `apps/www/src/**/*.architecture.test.ts`
- `apps/www/AGENTS.md`
- `docs/migrations/raw-to-domain-data/CONTEXT.md`
- Files with temporary compatibility exports

## Notes

Guardrail не должен запрещать внешний формат в raw schemas, mapper-ах и public legacy adapters. Цель - защита domain/internal кода, а не запрет слов `snake_case` в документации.
