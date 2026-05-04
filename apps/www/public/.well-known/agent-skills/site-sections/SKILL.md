---
name: site-sections
description: Используй для навигации по корневому сайту и выбора между news, status, people и compare section.
---

# site-sections

## Когда использовать

- Когда агент начинает с корня `kpshelkovo.online` и еще не знает, какой раздел ему нужен.
- Когда нужно быстро найти правильный entrypoint для новостей, статуса, people-профилей или compare.
- Когда нужен обзор section-level discovery, а не детальное чтение одного конкретного feed.

## Что открыть

- Корневой `llms.txt`: `/llms.txt`.
- Расширенный обзор: `/llms-full.txt`.
- Markdown home: `/index.md`.
- API catalog сайта: `/.well-known/api-catalog`.

## Как выбирать раздел

- `/news/` — новости, объявления, addenda, optional события и архивы; основной feed: `/news/data/articles.json`, календарь одного события: `/news/YYYY/MM/[entry]/event.ics`.
- `/status/` — текущее состояние сервисов, инциденты и плановые работы; основной feed: `/status/data/status.json`.
- `/people/index.md` — markdown overview people-section без публичного HTML-индекса; основной feed: `/people/data/people.json`.
- `/compare/` — сравнение поселков, тарифов и рейтинга; основной feed: `/compare/data/settlements.json`.

## Ограничения

- Корневой сайт не дублирует compare-логику у себя; compare живет отдельным section build под `/compare/`.
- Public skills на корне сейчас покрывают navigation, news, status и people. У compare есть свой собственный отдельный skill index.
