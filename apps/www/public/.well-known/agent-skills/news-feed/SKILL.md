---
name: news-feed
description: Используй для чтения статического news-section через articles.json, событийных metadata и перехода к detail-страницам новостей.
---

# news-feed

## Когда использовать

- Когда нужен основной structured feed новостей, объявлений и addenda по Шелково.
- Когда нужно пройтись по архивам, тегам и detail pages без обхода полной HTML-навигации.
- Когда нужен machine-readable body новости и поздних уточнений.
- Когда нужно найти календарное событие в новости и скачать его article-local `.ics`.

## Что открыть

- Основной JSON feed: `/news/data/articles.json`.
- Короткий обзор: `/news/llms.txt`.
- Расширенный обзор: `/news/llms-full.txt`.
- API catalog: `/news/.well-known/api-catalog`.

## Практический паттерн

- Сначала читай `/news/data/articles.json`.
- Для одной записи переходи на `/news/YYYY/MM/[entry]/` или `/news/YYYY/MM/[entry]/index.md`.
- Если у записи есть `event`, используй `event.ics_url` или шаблон `/news/YYYY/MM/[entry]/event.ics` для скачивания календаря.
- Для списков по времени и тегам используй `archives` и `tags` из feed или соответствующие HTML/Markdown pages.

## Ограничения

- Полный machine-readable контент живет в `articles.json`; RSS остается summary-first surface.
- HTML detail page остается каноническим представлением для людей.
- `articles[].event` есть только у новостей, которые объявляют календарное событие; глобального events calendar feed нет.
