# Миграция данных: Raw DTO -> Domain model -> Public DTO

## Короткий смысл

Цель миграции - жестко отделить внешний формат данных от внутреннего языка приложения.

YAML/frontmatter и внешние сервисы читаются как `Raw DTO`, валидируются Zod-схемами и затем проходят через явный `mapper`. Внутренний код работает только с handwritten domain interfaces в `camelCase`. Публичные JSON/agent-facing поверхности строятся отдельными `public DTO` adapters и не используют доменную модель напрямую.

Базовое решение зафиксировано в [ADR-013](../../decisions/013-raw-domain-public-data-boundary.md).

## Правила миграции

- `snake_case` допустим в raw Zod-схемах, mapper-ах, legacy public adapters, fixtures и документации про внешний формат.
- Domain interfaces не импортируют Zod и не выводятся через `z.infer`.
- Domain interfaces пишутся руками, используют `readonly`, `camelCase` и JSDoc для полей с неочевидным смыслом.
- Domain objects после mapper-а считаются immutable snapshot: свойства `readonly`, коллекции `readonly T[]` или `ReadonlyMap`, вложенные объекты тоже через readonly interfaces.
- Runtime `Object.freeze()` не требуется по умолчанию; если нужны изменения, строить новый объект или отдельный DTO.
- Enum/string literal values из YAML тоже проходят через mapper.
- Многочастные внешние значения вроде `rub_per_sotka`, `partial_asphalt`, `checkpoint_only` не должны становиться внутренними значениями автоматически.
- Loaders должны маппить raw-данные как можно ближе к `getCollection()`.
- Public JSON/agent-facing surfaces должны иметь отдельные `public DTO`, отдельные adapters и явные tests.
- Новые public DTO по умолчанию используют `camelCase`, если внешний стандарт не требует другого формата.
- Существующий public contract нельзя менять случайно вместе с внутренней миграцией.

## Как давать task агенту

Перед выполнением конкретного task агент должен прочитать:

- `docs/decisions/013-raw-domain-public-data-boundary.md`;
- этот файл;
- конкретный файл task из `docs/migrations/raw-to-domain-data/tasks/`;
- `apps/www/AGENTS.md`, если работа идет внутри `apps/www`.

Если task затрагивает `.svelte`, агент обязан использовать правила Svelte из проекта и соответствующий skill.

Если task меняет public JSON, discovery, `llms.txt`, `llms-full.txt` или Markdown companions, агент обязан свериться с ADR-011 и обновить связанные public surfaces.

## Task list

- [x] [Task 01: Инвентаризация границ данных](tasks/01-boundary-inventory.md)
- [x] [Task 02: Внутренние mention-контракты без raw-имен](tasks/02-mention-contracts.md)
- [x] [Task 03: Compare raw/domain foundation](tasks/03-compare-raw-domain-foundation.md)
- [x] [Task 04: Compare core migration на domain model](tasks/04-compare-core-domain-migration.md)
- [x] [Task 05: Compare UI и public adapters](tasks/05-compare-public-ui-migration.md)
- [x] [Task 06: News raw/domain foundation](tasks/06-news-raw-domain-foundation.md)
- [x] [Task 07: News articles migration на domain model](tasks/07-news-article-domain-migration.md)
- [x] [Task 08: Status raw/domain foundation](tasks/08-status-raw-domain-foundation.md)
- [x] [Task 09: Status UI и public adapters](tasks/09-status-public-ui-migration.md)
- [x] [Task 10: People raw/domain foundation](tasks/10-people-raw-domain-foundation.md)
- [x] [Task 11: People public surfaces и backlinks](tasks/11-people-public-and-backlinks.md)
- [x] [Task 12: Public DTO contracts across sections](tasks/12-public-dto-contracts.md)
- [x] [Task 13: Финальные guardrails и cleanup](tasks/13-final-guardrails.md)

## Общая проверка после каждого task

- Запустить точечные tests для измененной области.
- Запустить `pnpm typecheck`, если task меняет TypeScript-типы или imports.
- Запустить `pnpm test`, если task меняет shared contracts, public adapters или loader behavior.
- Не запускать `pnpm dev` без явной просьбы.
- После окончания задачи и ее проверки закоммить измененные файлы

## Definition of done всей миграции

- Внутренний код не использует raw `snake_case` свойства как обычную доменную модель.
- Все YAML/frontmatter schemas живут как raw schemas и возвращают raw-типы.
- Все loaders возвращают domain interfaces.
- Domain interfaces readonly по всей вложенности, насколько это практически возможно.
- Public JSON/agent-facing outputs строятся через public adapters.
- Enum/string literal mappings покрыты тестами там, где значения меняются между raw и domain.
- `z.infer` или `z.output` не используются как shortcut для domain interfaces.
- `snake_case` остался только в разрешенных внешних зонах.
