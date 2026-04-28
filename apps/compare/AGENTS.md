# AGENTS.md

Локальные инструкции для compare-приложения.

## Команды

```bash
# dev
pnpm dev

# section build для нового сайта
pnpm build

# legacy standalone build для старого домена
pnpm build:legacy

# checks
pnpm typecheck
pnpm test
pnpm test:watch
```

## Local dev

- `pnpm dev` внутри app поднимает compare dev-server на `http://localhost:4322/compare`.
- Интегрированный root workflow `pnpm dev` в workspace проксирует этот app на `http://localhost:4321/compare`.
- Если порт `4322` занят, команда должна завершиться ошибкой, а не молча уехать на другой порт.

## Стек

- Astro 6 (static output)
- Svelte 5 с runes
- Tailwind CSS v4
- TypeScript strict
- Vitest + @testing-library/svelte + happy-dom
- Zod
- YAML через Astro content collections

## Локальная структура

```text
src/
  components/
  data/
  layouts/
  lib/
  pages/
  styles/
public/
```

## Build modes

- `pnpm build` использует section mode:
  - deploy path: `/compare`
  - canonical: `https://kpshelkovo.online/compare/...`
- `pnpm build:legacy` использует standalone mode:
  - deploy path: `/`
  - canonical остается новым: `https://kpshelkovo.online/compare/...`
  - sitemap на legacy intentionally отключен

## Path aliases

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@lib/*` → `src/lib/*`
- `@data/*` → `src/data/*`
- `@layouts/*` → `src/layouts/*`
- `@styles/*` → `src/styles/*`

## Стиль кода

- Strict mode
- `undefined` вместо `null`, когда можно
- `interface` для объектов, `type` для union/utility types
- Не передавать ключи со значением `undefined`
- Keep things in one function unless composable or reusable
- Avoid `try`/`catch` where possible
- Avoid `any`
- Prefer single word names where possible
- Prefer functional array methods over loops

## Именование

- Components: PascalCase
- Utils: camelCase
- Types/Interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE
- YAML fields: snake_case
- Variables/functions: single-word names by default

## Svelte и Astro

- Использовать Svelte 5 runes: `$props()`, `$state()` и т.д.
- Для `.svelte` файлов заранее читать skill `svelte-code-writer`.
- Для `.astro` файлов заранее читать skill `astro`.
- `client:load` только для критичных блоков
- `client:idle` для среднего приоритета
- `client:visible` для тяжелых/ниже fold блоков

## Shared UI

- Общий визуальный язык лежит в `@shelkovo/ui/styles.css`.
- Новые общие токены, `ui-*` примитивы и reusable стиль — сначала в `packages/ui`.
- Не тащить compare-specific верстку в shared пакет без явной переиспользуемости.

## Data и discovery

- Explorer payload: `src/pages/data/explorer.json.ts`
- Full feed: `src/pages/data/settlements.json.ts`
- Agent docs / discovery:
  - `src/pages/for-agents.astro`
  - `src/pages/.well-known/api-catalog.ts`
  - `src/pages/openapi/settlements.openapi.json.ts`
  - `src/pages/schemas/settlements.schema.json.ts`
  - `src/lib/discovery.ts`
  - `src/lib/llms.ts`
  - `src/lib/skills.ts`
  - `public/.well-known/agent-skills/*/SKILL.md`

Если меняются canonical URL, `/compare` base, feed routes, rating docs или settlement schema, эти файлы нужно синхронно пересматривать.

## YAML и рейтинг

- Если факт не подтвержден источником, поле нужно опускать.
- `partial` использовать только при реально частичной доступности.
- Правила `location.address_text`, `location.district`, `water_in_tariff`, `club_infrastructure` и др. сохраняются как раньше: не ослаблять их при правках.
- Если меняется схема данных или реальные settlement fields, пересматривать:
  - `src/lib/rating.ts`
  - `docs/rating.md`
  - `src/pages/rating.astro`

## Важные замечания

- Astro content cache лежит в общем workspace-кэше `node_modules/.astro/compare`.
- Не запускать `pnpm dev` из root без явной просьбы.
- Compare публикуется в двух формах; при изменениях URL всегда проверять оба билда.
