# Inventory: текущие границы raw/domain/public данных

Инвентаризация фиксирует состояние до миграции `Raw DTO -> Domain model -> Public DTO`. Это не список изменений для одного PR, а карта мест, где внешний YAML/frontmatter-формат уже используется как внутренний язык приложения или как публичный контракт.

## Источники YAML и frontmatter

- Compare settlements: `apps/www/src/data/compare/settlements/[slug].yaml`, коллекция `settlements` в `apps/www/src/content.config.ts`, схема `SettlementSchema` в `apps/www/src/compare/lib/schema.ts`.
- News authors: `apps/www/src/data/news/authors/*.yaml`, коллекция `newsAuthors` в `apps/www/src/content.config.ts`.
- News articles: `apps/www/src/data/news/articles/YYYY/MM/[entry].md`, коллекция `newsArticles` в `apps/www/src/content.config.ts`; body markdown читается из Astro collection entry и проходит `preprocessSiteMarkdownContent` в `apps/www/src/lib/news/load.ts`.
- Status incidents: `apps/www/src/data/status/incidents/YYYY/MM/[slug].md`, коллекция `statusIncidents` в `apps/www/src/content.config.ts`; body markdown опционален и влияет на наличие detail page.
- People profiles: `apps/www/src/data/people/[slug].md`, коллекция `peopleProfiles` в `apps/www/src/content.config.ts`; body markdown опционален, canonical slug равен имени файла.

## Compare

### Raw boundary сейчас

- `apps/www/src/content.config.ts` подключает `SettlementSchema` напрямую как collection schema для `settlements`.
- `apps/www/src/compare/lib/schema.ts` одновременно описывает raw YAML, делает Zod transforms, объявляет TypeScript-типы через `z.infer` и содержит доменную логику расчетов.
- `TariffSchema` уже мутирует форму входа: принимает объект или массив частей, добавляет `normalized_per_sotka_month`, `normalized_is_estimate`, `parts` и затем `SettlementSchema.transform()` вызывает `normalizeSettlement()`.
- `loadSettlements()` в `apps/www/src/compare/lib/data.ts` возвращает `entry.data` как `Settlement`, то есть loader не отделяет raw Astro data от доменной модели.

### Internal `snake_case` hotspots

- Типы и поля в `apps/www/src/compare/lib/schema.ts`: `short_name`, `management_company`, `is_baseline`, `address_text`, `map_url`, `normalized_per_sotka_month`, `normalized_is_estimate`, `area_ha`, `average_sotka`, `average_note`, `common_spaces`, `water_in_tariff`, `video_surveillance`, `underground_electricity`, `admin_building`, `retail_or_services`, `service_model`, `garbage_collection`, `snow_removal`, `road_cleaning`, `emergency_service`, `date_checked`.
- Calculations in `apps/www/src/compare/lib/schema.ts`, `apps/www/src/compare/lib/stats.ts`, `apps/www/src/compare/lib/rating.ts`, `apps/www/src/compare/lib/comparisons.ts`, `apps/www/src/compare/lib/format.ts` consume these raw-shaped fields directly.
- UI-facing Svelte components under `apps/www/src/compare/components/*.svelte` receive `Settlement` objects with raw-shaped fields.
- Markdown generation in `apps/www/src/compare/lib/markdown.ts` maps raw enum values and accesses nested `snake_case` fields directly.
- JSON builders in `apps/www/src/compare/lib/full.ts` and `apps/www/src/compare/lib/explorer.ts` use `Settlement` as source and currently preserve many raw-shaped field names.

### Public surfaces at risk

- HTML pages: `/815/compare/`, `/815/compare/rating/`, `/815/compare/settlements/:slug/`.
- JSON feeds: `/815/compare/data/settlements.json`, `/815/compare/data/explorer.json`.
- Schemas and catalog: `/815/compare/schemas/settlements.schema.json`, `/815/compare/openapi/settlements.openapi.json`, `/815/compare/.well-known/api-catalog`, `/815/compare/.well-known/agent-skills/index.json`.
- Markdown companions: `/815/compare/index.md`, `/815/compare/rating/index.md`, `/815/compare/settlements/:slug/index.md`.
- LLM docs: `/815/compare/llms.txt`, `/815/compare/llms-full.txt`.
- Root discovery can reference compare via `apps/www/src/compare/lib/public-surface.ts` and root `.well-known`/`llms` surfaces.

## News

### Raw boundary сейчас

- `apps/www/src/content.config.ts` defines `newsAuthors` and `newsArticles` schemas inline.
- `NewsAuthorEntry` and `NewsArticleEntry` in `apps/www/src/lib/news/load.ts` are `CollectionEntry` picks; raw collection data is mapped in `authorData()` and `normalizeArticle()` but resulting domain interfaces in `apps/www/src/lib/news/schema.ts` still use many raw-shaped names.
- `content.config.ts` performs source validation and small normalizations for dates, events, tags and media before `load.ts` builds the dataset.
- Mention preprocessing is part of load-time normalization: article body goes through `preprocessSiteMarkdownContent()` with `loadPeopleMentionRegistry()`.

### Internal `snake_case` hotspots

- Domain-like interfaces in `apps/www/src/lib/news/schema.ts`: `short_name`, `markdown_url`, `published_at`, `published_iso`, `applies_to_all_areas`, `source_url`, `cover_url`, `cover_alt`, `cover_width`, `cover_height`, `starts_at`, `starts_iso`, `starts_time`, `ends_at`, `ends_iso`, `ends_time`, `ics_url`, `by_id`, `by_tag`, `by_year`, `by_month`.
- Loader normalization in `apps/www/src/lib/news/load.ts`: `pinned_until`, `source_url`, `cover_alt`, `starts_at`, `ends_at`, `applies_to_all_areas`, `published_iso`, `markdown_url`, `cover_url`, `cover_width`, `cover_height`.
- Views/routes/pages consume raw-shaped article fields: `apps/www/src/pages/news/**`, `apps/www/src/lib/news/view.ts`, `apps/www/src/lib/news/markdown.ts`, `apps/www/src/lib/news/discovery.ts`, `apps/www/src/lib/news/mentions.ts`, `apps/www/src/lib/news/tags.ts`, `apps/www/src/lib/news/sort.ts`, RSS in `apps/www/src/pages/news/feed.xml.ts`.
- Tests snapshot public or internal raw-shaped fields across `apps/www/src/lib/news/*.test.ts`.

### Public surfaces at risk

- HTML pages: `/news/`, `/news/:year/`, `/news/:year/:month/`, `/news/:year/:month/:entry/`, `/news/tags/`, `/news/tags/:tag/`.
- JSON feed: `/news/data/articles.json`.
- RSS and calendar: `/news/feed.xml`, `/news/:year/:month/:entry/:event.ics`.
- Schemas and catalog: `/news/schemas/articles.schema.json`, `/news/openapi/articles.openapi.json`, `/news/.well-known/api-catalog`.
- Markdown companions: `/news/index.md`, `/news/:year/index.md`, `/news/:year/:month/index.md`, `/news/:year/:month/:entry/index.md`, `/news/tags/index.md`, `/news/tags/:tag/index.md`.
- LLM docs: `/news/llms.txt`, `/news/llms-full.txt`, plus root `llms.txt` and `llms-full.txt` references.

## Status

### Raw boundary сейчас

- `apps/www/src/content.config.ts` defines `statusIncidents` inline and validates file path, date ordering and optional markdown body.
- `apps/www/src/lib/status/load.ts` maps `CollectionEntry<'statusIncidents'>` into `StatusIncident`, but `StatusIncident` in `apps/www/src/lib/status/schema.ts` still uses raw-shaped `snake_case` names.
- Status reuses `NEWS_AREAS` and news timestamp helpers as status aliases in `apps/www/src/lib/status/schema.ts`.
- Mention preprocessing is load-time: incident body goes through `preprocessSiteMarkdownContent()` with `loadPeopleMentionRegistry()`.

### Internal `snake_case` hotspots

- Interfaces in `apps/www/src/lib/status/schema.ts`: `total_minutes`, `started_at`, `started_iso`, `started_has_time`, `ended_at`, `ended_iso`, `ended_has_time`, `is_active`, `applies_to_all_areas`, `source_url`, `has_page`, `sort_started_at`, `sort_last_change_at`, `last_ended_iso`, `service_status`, `active_incidents`, `active_maintenance`, `days_without_incidents`, `by_id`, `by_service`.
- Loader logic in `apps/www/src/lib/status/load.ts`: raw date fields, `source_url`, active flags, sorting keys and service summary names.
- Public adapter and Markdown generation in `apps/www/src/lib/status/discovery.ts` and `apps/www/src/lib/status/markdown.ts` publish or mirror these names.
- Pages and mention refs consume the current shape: `apps/www/src/pages/status/**`, `apps/www/src/lib/status/mentions.ts`, `apps/www/src/pages/status/feed.xml.ts`.

### Public surfaces at risk

- HTML pages: `/status/`, `/status/:service/`, `/status/incidents/:year/:month/:entry/`.
- JSON feed: `/status/data/status.json`.
- RSS feed: `/status/feed.xml`.
- Schemas and catalog: `/status/schemas/status.schema.json`, `/status/openapi/status.openapi.json`, `/status/.well-known/api-catalog`.
- Markdown companions: `/status/index.md`, `/status/:service/index.md`, `/status/incidents/:year/:month/:entry/index.md`.
- LLM docs: `/status/llms.txt`, `/status/llms-full.txt`, plus root `llms.txt` and `llms-full.txt` references.

## People

### Raw boundary сейчас

- `apps/www/src/content.config.ts` defines `peopleProfiles` inline and validates file placement and slug format.
- `apps/www/src/lib/people/registry.ts` maps `CollectionEntry<'peopleProfiles'>` into `PersonProfile`, but `PersonProfile` and backlinks in `apps/www/src/lib/people/schema.ts` still use raw/public-shaped field names.
- Contacts are normalized in `apps/www/src/lib/people/view.ts` from raw `{ type, value }` into `{ type, value, display, href }`.
- People profile bodies are mention-aware markdown and can produce self-mention errors during preprocessing.

### Internal `snake_case` hotspots

- Interfaces in `apps/www/src/lib/people/schema.ts`: `name_cases`, `markdown_url`, `source_id`, `html_url`, `mentioned_at`, `sort_key`, `by_slug`, `mention_registry`.
- Loader and mention registry in `apps/www/src/lib/people/registry.ts`: `entry.data.name_cases`, `mention_registry`, `markdown_url`.
- Backlink/mention adapters in `apps/www/src/lib/people/mention-refs.ts`, `apps/www/src/lib/people/mentions.ts`, `apps/www/src/lib/people/discovery.ts`, `apps/www/src/lib/people/view.ts` mirror public-shaped fields.
- Tests under `apps/www/src/lib/people/*.test.ts` snapshot `html_url`, `markdown_url`, `name_cases`, `label_cases` and backlink shapes.

### Public surfaces at risk

- HTML page: `/people/:slug/`. There is no public HTML index, but section discovery exposes the collection through Markdown and JSON.
- JSON feed: `/people/data/people.json`.
- Schemas and catalog: `/people/schemas/people.schema.json`, `/people/openapi/people.openapi.json`, `/people/.well-known/api-catalog`.
- Markdown companions: `/people/index.md`, `/people/:slug/index.md`.
- LLM docs: `/people/llms.txt`, `/people/llms-full.txt`, plus root `llms.txt` and `llms-full.txt` references.

## Mentions

### Raw boundary сейчас

- Mention syntax in editorial markdown is an external text format: `@slug`, `@slug:case`, `[visible text](@slug)`.
- Generic mention contracts live in `apps/www/src/lib/mentions/types.ts` and currently use public/raw-shaped field names: `label_cases`, `html_url`, `markdown_url`, `link_title`, `link_context`, `target_type`, `target_slug`, `source_section`, `source_kind`, `source_id`, `source_entity`.
- Normalization in `apps/www/src/lib/mentions/normalize.ts` parses raw markdown and validates explicit case requests, but returns `NormalizedEntityMentions` with public-shaped target objects.
- Section adapters for mention source refs live in `apps/www/src/lib/news/mentions.ts`, `apps/www/src/lib/status/mentions.ts`, `apps/www/src/lib/people/mention-refs.ts`.

### Internal `snake_case` hotspots

- Mention target fields: `label_cases`, `html_url`, `markdown_url`, `link_title`, `link_context`.
- Source ref fields: `target_type`, `target_slug`, `source_section`, `source_kind`, `source_id`, `source_entity`, `mentioned_at`, `sort_key`.
- People-specific aliases: `name_cases` in profile raw data maps to generic `label_cases`, but both names are still exposed internally.

### Public surfaces at risk

- Mention-derived backlinks in `/people/data/people.json`, `/people/index.md`, `/people/:slug/index.md`, `/people/llms*.txt`.
- Mention refs embedded or derived from news/status/person markdown companions.
- Tests for `news/mentions`, `status/mentions`, `people/mentions`, `people/mention-refs` act as contract canaries.

## Enum и string literal values для явного маппинга

### Compare values

- Availability status: `yes`, `no`, `partial`.
- Tariff units: `rub_per_sotka`, `rub_per_lot`, `rub_fixed`.
- Tariff periods: `month`, `quarter`, `year`.
- Source types: `official`, `community`, `media`, `personal`.
- Road types: `asphalt`, `partial_asphalt`, `gravel`, `dirt`.
- Drainage types: `closed`, `open`, `none`.
- Video surveillance: `full`, `checkpoint_only`, `none`.
- Underground electricity: `full`, `partial`, `none`.

### News values

- Areas: `river`, `forest`, `park`, `village`.
- Author kinds: `official`, `community`, `editorial`, `other`.
- Event actor types: `organization`, `person`.
- Tags are free editorial strings but normalize into stable tag keys via `normalizeTagKey()`.

### Status values

- Services: `electricity`, `water`, `internet`, `dam`.
- Kinds: `incident`, `maintenance`.
- Service states: `green`, `amber`, `red`.
- Status days-without modes: `count`, `active_incident`, `no_incidents`.
- Derived public phases: `active`, `resolved`, `scheduled`.
- Areas reuse news area values: `river`, `forest`, `park`, `village`.

### People and mentions values

- Contact types: `phone`, `telegram`.
- Person mention sections: `news`, `status`, `people`.
- Backlink kinds: `article`, `incident`, `person`.
- Entity mention type: `person`.
- Mention label cases: `nom`, `gen`, `dat`, `acc`, `ins`, `prep`; raw profile data stores only alternate forms in `name_cases`.

## Intentional legacy public fields

These field names remain public contracts during the raw/domain migration. They are allowed only inside explicit public DTO adapters, JSON Schema/OpenAPI descriptions, fixtures, public Markdown frontmatter, llms documentation, and tests that assert those external contracts.

- Compare full JSON feed `/815/compare/data/settlements.json`: `short_name`, `management_company`, `is_baseline`, `address_text`, `map_url`, `normalized_per_sotka_month`, `normalized_is_estimate`, `area_ha`, `average_sotka`, `average_note`, `water_in_tariff`, `common_spaces`, `service_model`, `video_surveillance`, `underground_electricity`, `admin_building`, `retail_or_services`, `garbage_collection`, `snow_removal`, `road_cleaning`, `emergency_service`, `moscow_km`, `mkad_km`, `shelkovo_km`.
- Compare full JSON enum/string values that intentionally preserve the legacy external vocabulary: `rub_per_sotka`, `rub_per_lot`, `rub_fixed`, `partial_asphalt`, `checkpoint_only`.
- News JSON feed `/news/data/articles.json`: `schema_version`, `generated_at`, `updated_at`, `total_count`, `published_at`, `html_url`, `markdown_url`, `source_url`, `body_markdown`, `starts_at`, `ends_at`, `map_url`, `ics_url`.
- News archive/tag JSON objects: `markdown_url`.
- Status JSON feed `/status/data/status.json`: `total_minutes`, `last_ended_iso`, `html_url`, `markdown_url`, `phase_label`, `service_label`, `kind_label`, `started_at`, `started_has_time`, `ended_at`, `ended_has_time`, `is_active`, `applies_to_all_areas`, `source_url`, `body_markdown`, `service_status`, `service_status_label`, `incident_ids`, `active_incident_ids`, `active_maintenance_ids`, `days_without_incidents`, `incident_count`, `active_count`, `active_incident_count`, `active_maintenance_count`, `service_count`, `updated_at`.
- People JSON feed `/people/data/people.json`: `profile_count`, `mention_count`, `backlink_count`, `name_cases`, `html_url`, `markdown_url`, `body_markdown`, `source_id`, `mentioned_at`.
- Public Markdown companion frontmatter may keep section-specific public metadata such as `published_at`, `source_url`, `started_at`, `started_has_time`, `ended_at`, `ended_has_time`, `html_url`, `markdown_url`, and `body_markdown` when those keys are part of the documented external text contract.

## Cross-cutting migration risks

- Existing public JSON schemas intentionally document many `snake_case` names. Internal migration must not silently change those public fields.
- Markdown companions include YAML frontmatter with `snake_case` keys such as `published_at`, `source_url`, `started_at`, `started_has_time`, `ended_at`, `ended_has_time`; these are public text contracts too.
- `llms.txt`, `llms-full.txt`, `.well-known/api-catalog`, OpenAPI and JSON Schema files describe field names and URLs; any public DTO shape change needs synchronized updates.
- `z.infer` currently produces several internal types directly from raw Zod schemas, especially compare. Those inferred types should become raw-only types, not domain interfaces.
- Date and timestamp helpers normalize input strings before domain mapping. Future raw mappers need to preserve validation errors while moving domain naming to `camelCase`.
- Mention syntax is an external markdown contract even though mention result objects are internal. Do not rename editorial mention syntax while renaming internal mention models.
