# News Section Content Rules

Этот файл фиксирует стартовые редакционные правила и seed-контент news-section в `apps/www`.

## Data Location

- authors: `apps/www/src/data/news/authors/*.yaml`
- articles: `apps/www/src/data/news/articles/**`

## Seed Authors

- `ok-comfort`
  - `kind: official`
  - отображается как официальный источник новостей ОК Комфорт
- `ig`
  - `kind: community`
  - используется для инициативной группы

## First Seed Article

- path: `apps/www/src/data/news/articles/2026/04/river-restriction.md`
- public URL: `/news/2026/04/river-restriction/`
- author: `ok-comfort`
- date: `2026-04-30`
- pinned: `true`
- source_url: `https://okkomfort.domyland.app/news?targetId=109569&entityName=news&t=okkomfort`
- tags: `мост`, `дамба`, `река`, `ограничение`

## Editorial Rules

1. Исходная новость не переписывается задним числом без явной причины.
   Если появляются поздние подтвержденные факты, добавить их в основной article body отдельным абзацем с понятной атрибуцией, датой или ссылкой на источник.

2. Тип источника определяется author entry.
   Канонический признак официального источника - `kind: official`. Отдельный boolean `is_official` не используется: если нужен официальный источник, автор должен иметь `kind: official`.

3. `cover`, `photos` и `attachments` имеют разные роли.
   `cover` отвечает за карточку, detail hero и social preview. `photos` идут отдельным photo block. `attachments` должны вести на стабильные public URL.

4. `tags` остаются короткими и утилитарными.
   Теги не заменяют `areas`; spelling одного и того же тега должен быть единым по всему разделу.
