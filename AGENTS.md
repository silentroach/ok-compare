# AGENTS.md

Руководство для AI-агентов на уровне всего workspace.

## Структура репозитория

```text
apps/
  compare/   # compare-приложение: standalone legacy + section build для /compare
  www/       # корневой сайт kpshelkovo.online
packages/    # shared утилиты и UI
docs/        # документация и дизайн-гайды
ops/         # nginx и deploy-инфраструктура
scripts/     # compose/build helper scripts
```

## Локальные инструкции

- Перед работой в `apps/compare` обязательно читать `apps/compare/AGENTS.md`.
- Перед работой в `apps/www` обязательно читать `apps/www/AGENTS.md`.
- Если меняются shared стили, примитивы ссылок или URL-утилиты, проверить оба app-а.
- Не парься с форматированием кода - prettier все отформатирует автоматом при коммите

## Дизайн

- За визуальными решениями, палитрой и UI-правилами идти в `docs/design/design-code-shelkovo.md`.
- За правилами `title` и `description` страниц идти в `docs/page-meta.md`.
- В `AGENTS.md` держать процессные и архитектурные правила, а не подробный дизайн-гайд.

## Упоминания людей

- Людей в материалах упоминать через `@person-id`, а для падежей использовать модификатор `@person-id:case`.
- Поддерживаемые падежи: `nom`, `gen`, `dat`, `acc`, `ins`, `prep`.
- Если падеж не указан, используется `nom`: `@kirill-shchemelinin` → именительный.
- Если в материале нужен другой падеж, сначала добавить соответствующую форму в данные человека, затем использовать ее в тексте: `@kirill-shchemelinin:gen`.
- Формы имени хранить в человеке как источник истины; не полагаться на автосклонение при рендере.
- Build должен проверять все `@person-id:case` в материалах: человек обязан существовать, а запрошенная форма склонения обязана быть заполнена.
- Нельзя молча fallback-ать на `nom`, если явно запрошен другой падеж и формы нет; build должен падать или выдавать явную ошибку.

## Команды workspace

```bash
# dev
pnpm dev
pnpm dev:www
pnpm dev:compare

# typecheck / tests
pnpm typecheck
pnpm test

# builds
pnpm build          # dist/www + dist/legacy
pnpm build:main     # dist/www
pnpm build:legacy   # dist/legacy
```

## Артефакты сборки

- `dist/www` — корневой сайт `kpshelkovo.online`.
- `dist/www/compare` — compare-раздел внутри нового сайта.
- `dist/legacy` — standalone compare для старого домена.

## Local dev ports

- `pnpm dev` поднимает интегрированный dev-стек на `http://localhost:4321`.
- compare в этом режиме живет за прокси по `http://localhost:4321/compare`.
- внутренний compare dev-server слушает `http://localhost:4322/compare`.

## Правила Typescript

- по максимуму используй `readonly` для иммутабельности там, где она уместна
- Для тривиальных helper-ов с единственным `return` предпочитай однострочные `const`-стрелки (`const fn = (): T => expr`) вместо `function fn() { return expr; }`

## Тесты

- Если ожидаемый результат не супермелкий и важна точная строка/структура, предпочитай `toMatchInlineSnapshot()` вместо длинного `toBe(...)`/`toEqual(...)`.
- Если snapshot получается большим, выноси его в обычный snapshot-файл, а не раздувай тест.
- Если в строке важны неразрывные пробелы, в snapshot показывай их видимым символом, например через test-helper, который заменяет `\u00A0` на `·`.

## Правила workspace

- Не дублировать compare-логику в `apps/www`; compare должен приезжать туда как отдельный section build.
- Общие стили и UI-примитивы выносить в `packages/ui`.
- Общие URL/build helper-утилиты выносить в `packages/url` или `scripts/`.
- При изменениях deploy-потока синхронно обновлять `.github/workflows/*` и `ops/nginx/*`.
- Не запускать `pnpm dev` без явной просьбы: использовать точечные `pnpm dev:www` или `pnpm dev:compare`.

## Плавила MCP

- Для походов в интернет через браузер используй скилл `agent-browser`, но не забывай после окончания работы закрывать за собой открытые в нем сессии.
