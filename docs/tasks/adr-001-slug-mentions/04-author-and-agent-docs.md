# Задача 4: Обновить авторские и агентные инструкции

## Описание

Синхронизировать правила для авторов, агентов и публичных поверхностей для агентов с принятым ADR. Документация должна объяснять, когда использовать `@slug`, когда `@slug:case`, а когда `[видимый текст](@slug)`.

## Критерии приемки

- [x] Корневой `AGENTS.md` описывает оба синтаксиса упоминаний людей.
- [x] `apps/www/AGENTS.md` описывает оба синтаксиса и запрещает `[текст](@slug:case)`.
- [x] Инструкции в `apps/www/src/data/people/AGENTS.md` обновлены для авторов профилей.
- [x] `.agents/product-marketing-context.md` не противоречит новому ADR.
- [x] `/people` описания для агентов говорят, что `mentions` учитывают оба синтаксиса.
- [x] Публичный навык `people-profiles` обновлен для агентов.

## Проверка

- [x] `pnpm test -- apps/www/src/lib/people/discovery.test.ts`, если менялись тексты discovery/schema.
- [x] `pnpm build`, если менялись публичные сгенерированные страницы для агентов или файлы навыков.
- [x] Ручная проверка grep-ом: нет старых инструкций, где людям разрешен только `@slug` / `@slug:case` без упоминания `[текст](@slug)`.

## Зависимости

- Задача 2.

## Вероятно затронутые файлы

- `AGENTS.md`
- `apps/www/AGENTS.md`
- `apps/www/src/data/people/AGENTS.md`
- `.agents/product-marketing-context.md`
- `apps/www/src/lib/people/llms.ts`
- `apps/www/src/lib/people/discovery.ts`
- `apps/www/public/.well-known/agent-skills/people-profiles/SKILL.md`

## Размер

Средняя: 6-7 файлов, в основном документация и описания.
