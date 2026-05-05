# AGENTS.md

Локальные инструкции для корневого сайта `kpshelkovo.online`.

## Команды

```bash
pnpm dev
pnpm build
pnpm typecheck
```

## Local dev

- `pnpm dev` внутри app поднимает root-site на `http://localhost:4321`.
- Интегрированный root workflow workspace тоже использует `4321`, а `/compare` приходит туда проксием из `apps/compare`.
- Если порт `4321` занят, команда должна завершиться ошибкой, а не тихо перейти на другой порт.

## Стек

- Astro 6 (static output)
- Tailwind CSS v4
- Shared styles from `@shelkovo/ui/styles.css`

## Дизайн

- За визуальными решениями, палитрой и компонентными правилами идти в `../../docs/design/design-code-shelkovo.md`.
- За правилами `title` и `description` страниц идти в `../../docs/page-meta.md`.
- Этот `AGENTS.md` держать про workflow, архитектуру и ограничения app-а.

## Правила

- Не копировать compare-страницы в `apps/www`.
- Compare должен подключаться как готовый section build по пути `/compare`.
- Любой reusable дизайн, токены и примитивы поднимать в `packages/ui`.
- Для imports внутри `apps/www/src` предпочитать alias `@/…` вместо длинных relative-путей; относительные imports оставлять только для соседних файлов и путей вне `src`.
- Любые UI-подписи с количеством на русском языке обязательно склонять корректно (`1 новость`, `2 новости`, `5 новостей`).
- Динамические текстовые блоки, которые рендерятся в HTML из markdown, CMS или других данных, прогонять через типограф на этапе рендера.
- Типограф применять точечно к самому динамическому контенту, а не к целому layout или полной HTML-странице.
- Если нужна ссылка на compare, вести на `/compare/`, а не на legacy домен.
- Если меняется deploy/base/root behavior, синхронно обновлять `ops/nginx/kpshelkovo-online.conf` и compose scripts.

## People Mentions

- В `src/data/people/*.md` живут профили людей для раздела `/people/`; canonical slug человека равен имени файла без `.md`, например `kschemelinin`.
- Если человек из `people` упоминается в `news`, `status` или другом people body, в source markdown нужно писать `@slug`, а не plain text имя и не ручную ссылку на `/people/.../`.
- При рендере `@slug` автоматически раскрывается в каноническое имя и ссылку на профиль; неизвестный `@slug` должен падать на билде и исправляться до merge.
- Для атрибуции к внешнему источнику ссылку ставь на вводную фразу, например `[По словам](https://t.me/...) @kschemelinin, ...`.

## Agent-Facing Surfaces

- Root discovery:
  - `src/pages/index.md.ts`
  - `src/pages/llms.txt.ts`
  - `src/pages/llms-full.txt.ts`
  - `src/pages/.well-known/api-catalog.ts`
  - `src/pages/.well-known/agent-skills/index.json.ts`
  - `public/.well-known/agent-skills/*/SKILL.md`
- News discovery:
  - `src/pages/news/index.md.ts`
  - `src/pages/news/llms.txt.ts`
  - `src/pages/news/llms-full.txt.ts`
  - `src/pages/news/feed.xml.ts`
  - `src/pages/news/data/articles.json.ts`
  - `src/pages/news/.well-known/api-catalog.ts`
  - `src/pages/news/schemas/articles.schema.json.ts`
  - `src/pages/news/openapi/articles.openapi.json.ts`
- Status discovery:
  - `src/pages/status/index.md.ts`
  - `src/pages/status/llms.txt.ts`
  - `src/pages/status/llms-full.txt.ts`
  - `src/pages/status/feed.xml.ts`
  - `src/pages/status/data/status.json.ts`
  - `src/pages/status/.well-known/api-catalog.ts`
  - `src/pages/status/schemas/status.schema.json.ts`
  - `src/pages/status/openapi/status.openapi.json.ts`
- People discovery:
  - `src/pages/people/[slug]/index.md.ts`
  - `src/pages/people/index.md.ts`
  - `src/pages/people/llms.txt.ts`
  - `src/pages/people/llms-full.txt.ts`
  - `src/pages/people/data/people.json.ts`
  - `src/pages/people/.well-known/api-catalog.ts`
  - `src/pages/people/schemas/people.schema.json.ts`
  - `src/pages/people/openapi/people.openapi.json.ts`
  - `public/.well-known/agent-skills/people-profiles/SKILL.md`

Если меняются section routes, markdown companions, JSON feeds, `llms.txt`, skills или discovery docs для `news`/`status`/`people`, эти поверхности нужно синхронно пересматривать.
