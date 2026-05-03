import { pluralizeRu } from '@shelkovo/format';

import { absoluteUrl } from '../site';
import { loadStatusData } from './load';
import {
  statusApiCatalogUrl,
  statusDataUrl,
  statusFeedUrl,
  statusIncidentMarkdownUrl,
  statusIncidentUrl,
  statusLlmsFullUrl,
  statusLlmsUrl,
  statusMarkdownUrl,
  statusOpenApiUrl,
  statusSchemaUrl,
  statusServiceMarkdownUrl,
  statusServiceUrl,
  statusUrl,
} from './routes';
import { STATUS_KINDS, STATUS_SERVICE_STATES, STATUS_SERVICES } from './schema';
import { formatStatusService } from './view';

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const count = (value: number, forms: [string, string, string]): string =>
  `${value} ${pluralizeRu(value, forms)}`;

export async function build(kind: 'short' | 'full'): Promise<string> {
  const data = await loadStatusData();
  const activeIncidents = data.active.filter(
    (item) => item.kind === 'incident',
  );
  const activeMaintenance = data.active.filter(
    (item) => item.kind === 'maintenance',
  );
  const service = data.services[0];
  const incident = data.incidents[0];

  const home = absoluteUrl(statusUrl());
  const homeMarkdown = absoluteUrl(statusMarkdownUrl());
  const feed = absoluteUrl(statusDataUrl());
  const rss = absoluteUrl(statusFeedUrl());
  const short = absoluteUrl(statusLlmsUrl());
  const full = absoluteUrl(statusLlmsFullUrl());
  const catalog = absoluteUrl(statusApiCatalogUrl());
  const schema = absoluteUrl(statusSchemaUrl());
  const openapi = absoluteUrl(statusOpenApiUrl());
  const serviceHtml = service
    ? absoluteUrl(statusServiceUrl(service.service))
    : '/status/[service]/';
  const serviceMarkdown = service
    ? absoluteUrl(statusServiceMarkdownUrl(service.service))
    : '/status/[service]/index.md';
  const serviceLabel = service
    ? formatStatusService(service.service)
    : 'Страница сервиса';
  const incidentHtml = incident
    ? absoluteUrl(statusIncidentUrl(incident))
    : '/status/incidents/YYYY/MM/[entry]/';
  const incidentMarkdown = incident
    ? absoluteUrl(statusIncidentMarkdownUrl(incident))
    : '/status/incidents/YYYY/MM/[entry]/index.md';

  return kind === 'short'
    ? join([
        'Статус Шелково',
        'Файл: llms.txt',
        'Язык: русский',
        '',
        'Описание',
        '- Это статический status-section внутри kpshelkovo.online про текущие проблемы, плановые работы и историю по сервисам поселка.',
        `- Сейчас в разделе ${count(data.incidents.length, ['запись', 'записи', 'записей'])}, ${count(activeIncidents.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])} и ${count(activeMaintenance.length, ['активная работа', 'активные работы', 'активных работ'])}.`,
        `- Раздел покрывает ${count(data.services.length, ['сервис', 'сервиса', 'сервисов'])}: ${STATUS_SERVICES.join(', ')}.`,
        '- HTML pages остаются каноническим представлением для людей, а status.json служит основным structured feed для агентов.',
        '',
        'Главные URL',
        `- Главная status-section: ${home}`,
        `- Основной JSON feed: ${feed}`,
        `- RSS: ${rss}`,
        `- API catalog: ${catalog}`,
        `- JSON Schema: ${schema}`,
        `- OpenAPI: ${openapi}`,
        `- Расширенная версия этого текста: ${full}`,
        '',
        'Как читать раздел',
        `- Markdown home: ${homeMarkdown}`,
        `- Пример service HTML (${serviceLabel}): ${serviceHtml}`,
        `- Пример service Markdown: ${serviceMarkdown}`,
        `- Пример incident HTML: ${incidentHtml}`,
        `- Пример incident Markdown: ${incidentMarkdown}`,
        '- В status.json сервисные сводки derive-ятся из массива incidents.',
        '- Сервисы: `electricity`, `water`, `dam`.',
        '- Типы записей: `incident`, `maintenance`.',
        '- Текущий статус сервиса derive-ится как `red`, `amber` или `green`.',
      ])
    : join([
        'Статус Шелково',
        'Файл: llms-full.txt',
        'Язык: русский',
        '',
        'Проект',
        '- Это статический status-section внутри kpshelkovo.online под `/status/...`.',
        '- Он нужен для публикации текущего состояния сервисов поселка, активных инцидентов, плановых работ и истории отключений/ограничений без SSR и mutation endpoints.',
        `- Сейчас в разделе ${count(data.incidents.length, ['запись', 'записи', 'записей'])}, ${count(activeIncidents.length, ['активный инцидент', 'активных инцидента', 'активных инцидентов'])} и ${count(activeMaintenance.length, ['активная работа', 'активные работы', 'активных работ'])}.`,
        '',
        'Канонические URL',
        `- Главная status-section: ${home}`,
        `- Markdown home: ${homeMarkdown}`,
        `- Короткий агентный обзор: ${short}`,
        `- Расширенный агентный обзор: ${full}`,
        `- Основной JSON feed: ${feed}`,
        `- RSS: ${rss}`,
        `- API catalog: ${catalog}`,
        `- JSON Schema: ${schema}`,
        `- OpenAPI: ${openapi}`,
        `- Пример service HTML (${serviceLabel}): ${serviceHtml}`,
        `- Пример service Markdown: ${serviceMarkdown}`,
        `- Пример incident HTML: ${incidentHtml}`,
        `- Пример incident Markdown: ${incidentMarkdown}`,
        '',
        'Описание status.json',
        '- Это основной read-only structured feed для агентов и машинного обхода status-section.',
        '- Корневой объект содержит `stats`, `active`, `incidents` и `services`.',
        '- `incidents[]` включает `id`, `title`, `service`, `kind`, `year`, `month`, `slug`, опциональные `html_url` и `markdown_url` только для записей с опубликованной detail page, `started_at`, опциональный `ended_at`, флаг `is_active`, фазы `phase`, затронутые `areas`, опциональный `source_url`, `excerpt`, полный `body_markdown` и опциональную `duration`.',
        '- `active[]` содержит только активные на момент сборки incidents/maintenance записи в том же формате, что и `incidents[]`.',
        '- `services[]` содержит derive-сводки по сервисам с `service_status`, URL сервиса, массивами `incident_ids`, `active_incident_ids`, `active_maintenance_ids`, а также `days_without_incidents` и опциональной `latest_incident`.',
        '- `stats` дает агрегированные counts по сервисам, активным инцидентам и активным работам.',
        '',
        'HTML и Markdown surfaces',
        '- HTML home `/status/` остается каноническим человекочитаемым представлением сводки по поселку.',
        '- Markdown companion `/status/index.md` дает text-first слой для терминалов и агентов.',
        '- Страницы сервисов `/status/[service]/` и их companions `/status/[service]/index.md` удобны для фокусного чтения одной линии: электричество, вода или дамба.',
        '- Страницы incidents `/status/incidents/YYYY/MM/[entry]/` и их companions `/status/incidents/.../index.md` публикуются только для записей с body и тогда же появляются в `html_url`/`markdown_url`.',
        '',
        'RSS',
        '- `/status/feed.xml` остается summary-first RSS.',
        '- В RSS description сериализуются текущий статус записи, период, зоны воздействия и короткий excerpt, если он есть.',
        '- Источником правды для полного machine-readable контента остается status.json.',
        '',
        'Семантика полей',
        `- ` +
          'Сервисы сериализуются как: ' +
          `\`${STATUS_SERVICES.join('`, `')}\`.`,
        `- ` +
          'Типы записей сериализуются как: ' +
          `\`${STATUS_KINDS.join('`, `')}\`.`,
        `- ` +
          'Статусы сервисов сериализуются как: ' +
          `\`${STATUS_SERVICE_STATES.join('`, `')}\`.`,
        '- `service_status` derive-ится из активных записей: активный incident дает `red`, только активные maintenance дают `amber`, иначе `green`.',
        '- `phase` для отдельной записи показывает ее жизненный цикл: `active`, `resolved` или `scheduled`.',
        '- Если `areas` не указаны в source file, feed нормализует запись как `applies_to_all_areas: true` и подставляет все части поселка.',
        '',
        'Ограничения',
        '- Все routes status-section генерируются статически; mutation endpoints и auth в этой поверхности отсутствуют.',
        '- Feed описывает состояние на момент сборки. Для чтения в терминах редакционного контекста или ссылок на первоисточник переходите на detail page инцидента.',
        '- Markdown companions и JSON feed повторяют одно и то же содержание в разных формах; для массового анализа используйте JSON feed.',
      ]);
}
