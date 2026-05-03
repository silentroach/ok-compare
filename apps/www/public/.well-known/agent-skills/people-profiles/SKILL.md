---
name: people-profiles
description: Используй для чтения people-section через people.json и перехода к detail-страницам конкретных людей.
---

# people-profiles

## Когда использовать

- Когда нужно понять, кто такой конкретный публичный человек на сайте Шелково.
- Когда нужно массово обойти профили, контакты, mentions и backlinks без HTML-навигации.
- Когда нужно найти, где человек фигурирует в `news`, `status` и других `people` profiles.

## Что открыть

- Основной JSON feed: `/people/data/people.json`.
- Markdown overview: `/people/index.md`.
- Короткий обзор: `/people/llms.txt`.
- Расширенный обзор: `/people/llms-full.txt`.
- API catalog: `/people/.well-known/api-catalog`.

## Практический паттерн

- Сначала читай `/people/data/people.json`.
- Для одного профиля переходи на `/people/[slug]/` или `/people/[slug]/index.md`.
- Для графовых сценариев используй `mentions` как исходящие связи из body профиля и `backlinks` как входящие ссылки из других sections.

## Что важно помнить

- Публичного HTML-индекса `/people/` нет и в MVP не будет.
- Контакты публикуются открыто, как есть в source data.
- Если нужен массовый обход, не пытайся сканировать HTML detail pages вместо `people.json`.

## Ограничения

- Feed read-only и отражает состояние на момент сборки сайта.
- Один профиль равен одному canonical slug; неизвестные `@slug` не допускаются и должны падать на билде.
