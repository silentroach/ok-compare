---
name: site-sections
description: Используй для навигации по корневому сайту и выбора между новостями, статусом, людьми и сравнением тарифов поселков.
---

# site-sections

## Когда использовать

- Когда агент начинает с корня `kpshelkovo.online` и еще не знает, какой раздел ему нужен.
- Когда нужно быстро найти правильный entrypoint для новостей, статуса, профилей людей или сравнения тарифов поселков.
- Когда нужен обзор разделов и discovery-ссылок, а не детальное чтение одного конкретного feed.

## Что открыть

- Корневой `llms.txt`: `/llms.txt`.
- Расширенный обзор: `/llms-full.txt`.
- Markdown home: `/index.md`.
- API catalog сайта: `/.well-known/api-catalog`.

## Как выбирать раздел

- `/news/` — новости, объявления, addenda, optional события и архивы; основной feed: `/news/data/articles.json`, календарь события: `/news/YYYY/MM/[entry]/[event-slug].ics`.
- `/status/` — текущее состояние сервисов, инциденты и плановые работы; основной feed: `/status/data/status.json`.
- `/people/index.md` — markdown overview профилей людей без публичного HTML-индекса; основной feed: `/people/data/people.json`.
- `/815/compare/` — сравнение тарифов поселков и рейтинга; основной feed: `/815/compare/data/settlements.json`.

## Ограничения

- JSON feeds read-only и отражают состояние на момент сборки сайта.
- Public skills на корне покрывают навигацию, новости, статус и профили людей. У compare-раздела есть свой отдельный skill index.
