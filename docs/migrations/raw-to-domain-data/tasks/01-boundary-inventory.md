# Task 01: Инвентаризация границ данных

## Описание

Собрать текущую карту мест, где внешний формат данных уже протек во внутренний код. Этот task не меняет runtime-поведение и нужен как стартовая точка для параллельной работы агентов.

## Acceptance criteria

- Создан или обновлен `docs/migrations/raw-to-domain-data/inventory.md`.
- Inventory перечисляет все текущие YAML/frontmatter источники: compare settlements, news authors, news articles, status incidents, people profiles.
- Inventory перечисляет основные internal hot spots со `snake_case` для compare, news, status, people и mentions.
- Inventory перечисляет public surfaces, которые могут измениться при migration: JSON feeds, discovery, `llms.txt`, `llms-full.txt`, Markdown companions.
- Inventory отдельно фиксирует enum/string literal values, которые нужно явно маппить.

## Verification

- Проверить diff только документации.
- Кодовые tests не обязательны, если task не менял код.

## Dependencies

Нет.

## Files likely touched

- `docs/migrations/raw-to-domain-data/inventory.md`
- `docs/migrations/raw-to-domain-data/CONTEXT.md`, если task list нужно уточнить после inventory

## Notes

Не пытаться исправить все найденные места в этом task. Его результат - карта миграции, а не implementation.
