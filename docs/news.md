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
  - используется для инициативной группы и fallback-автора addenda

## First Seed Article

- path: `apps/www/src/data/news/articles/2026/04/river-restriction.md`
- public URL: `/news/2026/04/river-restriction/`
- author: `ok-comfort`
- date: `2026-04-30`
- pinned: `true`
- source_url: `https://okkomfort.domyland.app/news?targetId=109569&entityName=news&t=okkomfort`
- tags: `мост`, `дамба`, `река`, `ограничение`

## Editorial Rules

1. Исходная новость не переписывается задним числом.
   Официальный или исходный текст сохраняется в основном article body. Поздние уточнения, ссылки и комментарии идут только через `addenda` в том же article file.

2. Блок `Дополнено` используется только для фактических поздних добавлений.
   Он не служит скрытым способом переписать original article.

3. `addenda` в v1 хранятся в frontmatter-массиве статьи.
   Marker-синтаксис внутри markdown body не используется.

4. Официальность определяется author entry.
   Канонический признак официального источника - `kind: official`. Дополнительный флаг `is_official: true` допустим как явное дублирование/override. Рендер считает автора официальным, если у него `kind: official` или `is_official: true`; это должно отражаться в карточках, detail page, markdown companions и machine-readable outputs.

5. `cover`, `photos` и `attachments` имеют разные роли.
   `cover` отвечает за карточку, detail hero и social preview. `photos` идут отдельным photo block. `attachments` должны вести на стабильные public URL.

6. `tags` остаются короткими и утилитарными.
   Теги не заменяют `areas`; spelling одного и того же тега должен быть единым по всему разделу.
