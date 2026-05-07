# 070: Спроектировать LLM dataset полного регламента

## Цель

На основе извлеченных markdown-артефактов спроектировать стабильный JSON/Markdown contract для LLM, но еще не реализовывать его в приложении.

## Вход

- Контекст: `docs/reglament/full/000-agent-context.md`.
- `docs/reglament/full/020-common-assets.md`.
- `docs/reglament/full/030-service-catalog.md`.
- `docs/reglament/full/040-village-characteristics.md`.
- `docs/reglament/full/050-service-to-estimate-map.md`.
- `docs/reglament/full/060-calculation-assumptions.md`.

## Выход

Создать файл:

- `docs/reglament/full/070-llm-dataset-contract.md`.

## Что описать

- Корневой объект dataset.
- `villages[]`.
- `common_assets[]`.
- `services[]`.
- `service_to_estimate_map[]`.
- `calculation_assumptions[]`.
- `audit_notes[]`.
- `source_refs[]`.

Для каждого массива указать поля, типы, обязательность и пример 1-2 объектов.

## Acceptance Criteria

- [ ] Есть `docs/reglament/full/070-llm-dataset-contract.md`.
- [ ] Контракт покрывает данные из задач `020-060`.
- [ ] Контракт явно хранит source refs до страницы PDF.
- [ ] Контракт не требует runtime-парсинга PDF.
- [ ] Нет изменений в `apps/www`.

## Зависимости

- Задачи `020`, `030`, `040`, `050`, `060`.
