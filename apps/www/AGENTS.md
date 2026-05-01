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
