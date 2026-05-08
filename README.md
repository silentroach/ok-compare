# Shelkovo Workspace

Монорепозиторий для сайтов и shared-пакетов Шелково.

## Состав

```text
apps/
  www/       # единое Astro-приложение kpshelkovo.online, включая /815/compare
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
# локальный сайт на :4321, включая /815/compare
pnpm dev

# то же самое, явно через app
pnpm dev:www

# проверки
pnpm typecheck
pnpm test

# сборка
pnpm build
pnpm build:main
```

## Выходы сборки

- `dist/www` — основной сайт `kpshelkovo.online`
- `dist/www/815/compare` — compare-раздел внутри основного сайта

## Деплой

- `kpshelkovo.online` получает содержимое `dist/www`
- старый compare-домен обслуживается nginx-редиректами
- nginx-конфиги лежат в `ops/nginx/`

## Где искать детали

- www-specific правила: `apps/www/AGENTS.md`
- дизайн-гайд и визуальные правила: `docs/design/design-code-shelkovo.md`
