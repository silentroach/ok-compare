# AGENTS.md

Локальные правила для встреч в `apps/www/src/data/meetings`.

- Одна встреча живет в `YYYY-MM-DD/slug/index.md`.
- Рядом может лежать `transcript.yaml` с полной расшифровкой.
- `date` во frontmatter должен совпадать с директорией `YYYY-MM-DD`.
- `slug` во frontmatter должен совпадать с директорией `slug`.
- Обязательные поля: `title`, `date`, `summary`, `slug`.
- Optional поля первой версии: `format`, `source_url`, `video_url`, `video_embed_url`, `transcript`, `highlights`, `agenda`, `decisions`, `action_items`, `questions`, `participants`, `documents`.
- Не добавлять `audio_url`, `related_news`, `timestamps` без отдельного изменения контракта.
- Не публиковать фиктивные встречи ради тестов; optional-модель проверять unit fixtures.
- Ссылки на людей в body писать через общий mention-формат `@slug`, `@slug:case` или `[видимый текст](@slug)`.
