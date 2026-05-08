# Shelkovo Workspace

Монорепозиторий для сайтов и shared-пакетов Шелково.

## Состав

```text
apps/
  compare/   # compare-приложение: /815/compare section build
  www/       # корневой сайт kpshelkovo.online
packages/
  ui/        # shared styles / UI primitives
  url/
  format/
  geo/
docs/        # документация и дизайн-гайды
ops/         # nginx и deploy-конфиги
```

## Команды

```bash
# integrated local stack: www on :4321, compare on /815/compare
pnpm dev

# root site only
pnpm dev:www

# compare app
pnpm dev:compare

# проверки
pnpm typecheck
pnpm test

# сборка
pnpm build
pnpm build:main
```

## Выходы сборки

- `dist/www` — основной сайт `kpshelkovo.online`
- `dist/www/815/compare` — compare-раздел на новом домене

## Деплой

- `kpshelkovo.online` получает содержимое `dist/www`
- старый compare-домен обслуживается nginx-редиректами
- nginx-конфиги лежат в `ops/nginx/`

## Где искать детали

- compare-specific правила: `apps/compare/AGENTS.md`
- www-specific правила: `apps/www/AGENTS.md`
- дизайн-гайд и визуальные правила: `docs/design/design-code-shelkovo.md`
