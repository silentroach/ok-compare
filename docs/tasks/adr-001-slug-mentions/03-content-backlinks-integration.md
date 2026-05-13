# Задача 3: Проверить интеграцию с контентом и обратными ссылками

## Описание

Проверить, что новый синтаксис проходит через существующие загрузчики контента без отдельной логики в каждом разделе. Новости, статус и профили людей уже используют `normalizePeopleMentions`; задача должна зафиксировать это интеграционными тестами и убедиться, что обратные ссылки строятся одинаково для `@slug`, `@slug:case` и `[текст](@slug)`.

## Критерии приемки

- [x] `buildNewsDataset` нормализует `[текст](@slug)` в Markdown-тексте статьи и дополнения.
- [x] `buildStatusDataset` нормализует `[текст](@slug)` в Markdown-тексте инцидента.
- [x] `buildPeopleDataset` нормализует `[текст](@slug)` в Markdown-тексте профиля человека.
- [x] `buildPeopleGraphDataset` добавляет обратные ссылки из новостей, статуса и профилей, где человек упомянут через `[текст](@slug)`.
- [x] Выдержка для обратных ссылок остается человекочитаемой и не содержит сырой `@slug`.

## Проверка

- [x] `pnpm test -- src/lib/news/load.test.ts` из `apps/www`
- [x] `pnpm test -- src/lib/status/load.test.ts` из `apps/www`
- [x] `pnpm test -- src/lib/people/load.test.ts` из `apps/www`

## Зависимости

- Задача 2.

## Вероятно затронутые файлы

- `apps/www/src/lib/news/load.test.ts`
- `apps/www/src/lib/status/load.test.ts`
- `apps/www/src/lib/people/load.test.ts`
- `apps/www/src/lib/people/mentions.ts`, только если интеграционные тесты покажут проблему в общем нормализаторе.

## Размер

Средняя: 3-4 файла.
