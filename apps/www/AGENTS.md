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
- `/815/compare` живет в этом же Astro-приложении, без отдельного compare dev-server.
- Если порт `4321` занят, команда должна завершиться ошибкой, а не тихо перейти на другой порт.

## Стек

- Astro 6 (static output)
- Svelte 5 с runes для интерактивных compare-компонентов
- Tailwind CSS v4
- Shared styles from `@shelkovo/ui/styles.css`

## Дизайн

- За визуальными решениями, палитрой и компонентными правилами идти в `../../docs/design/design-code-shelkovo.md`.
- За правилами `title` и `description` страниц идти в `../../docs/page-meta.md`.
- Этот `AGENTS.md` держать про workflow, архитектуру и ограничения app-а.

## Правила

- Compare source живет в `src/compare`, routes — в `src/pages/815/compare`.
- Compare URL/base задается в `src/compare/lib/url.ts`; не завязывать его на Astro `base`.
- Любой reusable дизайн, токены и примитивы поднимать в `packages/ui`.
- Для imports внутри `apps/www/src` предпочитать alias `@/…` вместо длинных relative-путей; относительные imports оставлять только для соседних файлов и путей вне `src`.
- Любые UI-подписи с количеством на русском языке обязательно склонять корректно (`1 новость`, `2 новости`, `5 новостей`).
- Динамические текстовые блоки, которые рендерятся в HTML из markdown, CMS или других данных, прогонять через типограф на этапе рендера.
- Типограф применять точечно к самому динамическому контенту, а не к целому layout или полной HTML-странице.
- Если нужна ссылка на compare, вести на `/815/compare/`, а не на legacy домен.
- Если меняется deploy/base/root behavior, синхронно обновлять `ops/nginx/kpshelkovo-online.conf`.

## People Mentions

- В `src/data/people/*.md` живут профили людей для раздела `/people/`; canonical slug человека равен имени файла без `.md`, например `kschemelinin`.
- Если человек из `people` упоминается в `news`, `status` или другом people body, в source markdown нужно писать `@slug` или `@slug:case`, а не plain text имя и не ручную ссылку на `/people/.../`.
- Поддерживаемые падежи mention: `nom`, `gen`, `dat`, `acc`, `ins`, `prep`; без модификатора используется `nom`.
- Если нужен не `nom`, сначала добавь форму в `name_cases` профиля человека, например `name_cases.gen`, затем используй `@kschemelinin:gen`.
- При рендере mention автоматически раскрывается в имя нужного падежа и ссылку на профиль; неизвестный `@slug` или отсутствующий `name_cases.case` должен падать на билде и исправляться до merge.
- Если у профиля есть `position` и/или `company`, они должны попадать в title markdown-ссылки mention как контекст человека.
- Для атрибуции к внешнему источнику ссылку ставь на вводную фразу, например `[По словам](https://t.me/...) @kschemelinin, ...`.

## Agent-Facing Surfaces

Если меняются section routes, markdown companions, JSON feeds, `llms.txt`, skills или discovery docs для разделов, связанные agent-facing поверхности нужно синхронно пересматривать.
