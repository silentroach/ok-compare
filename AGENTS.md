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

## Дизайн

- За визуальными решениями, палитрой и UI-правилами идти в `docs/design/design-code-shelkovo.md`.
- В `AGENTS.md` держать процессные и архитектурные правила, а не подробный дизайн-гайд.

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

## Turborepo cache policy

- Для задач `build*` в `turbo.json` используем `inputs` с исключениями для `docs/**`, `**/*.md`, `dist/**` и `**/.astro/**`, чтобы документация и артефакты не инвалидировали build-кэш.
- Для `test` и `typecheck` в `turbo.json` исключаем `dist/**` и `**/.astro/**` из `inputs`.
- `$schema` в `turbo.json` оставляем version-pinned (как генерирует Turborepo для текущей версии), если нет явной причины менять формат.

## Правила workspace

- Не дублировать compare-логику в `apps/www`; compare должен приезжать туда как отдельный section build.
- Общие стили и UI-примитивы выносить в `packages/ui`.
- Общие URL/build helper-утилиты выносить в `packages/url` или `scripts/`.
- При изменениях deploy-потока синхронно обновлять `.github/workflows/*` и `ops/nginx/*`.
- Не запускать `pnpm dev` без явной просьбы: использовать точечные `pnpm dev:www` или `pnpm dev:compare`.
