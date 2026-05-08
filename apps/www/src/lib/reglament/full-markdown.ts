import { estimate2026 } from '@/data/reglament/estimate-2026';
import { fullReglamentDataset2026 } from '@/data/reglament/full-2026';
import type {
  FullReglamentAuditNote,
  FullReglamentCalculationAssumption,
  FullReglamentCommonAsset,
  FullReglamentService,
  FullReglamentServiceToEstimateMapItem,
  FullReglamentSourceRef,
} from '@/lib/reglament/full-schema';
import type { EstimateRow, EstimateSourceRef } from '@/lib/reglament/schema';

import { absoluteUrl } from '../site';
import {
  reglamentAssetsUrl,
  reglamentFullAssetsMarkdownUrl,
  reglamentFullChecksMarkdownUrl,
  reglamentFullMarkdownUrl,
  reglamentFullServiceMapMarkdownUrl,
  reglamentFullServicesMarkdownUrl,
  reglamentFull2026DataUrl,
  reglamentFullSourcePdfUrl,
  reglamentServicesUrl,
} from './routes';

export const FULL_REGLAMENT_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const statusCounts = fullReglamentDataset2026.service_to_estimate_map.reduce(
  (count, item) => ({ ...count, [item.status]: count[item.status] + 1 }),
  { explicit_found: 0, partial: 0, not_found: 0, needs_check: 0 },
);

const flattenEstimateRows = (
  rows: readonly EstimateRow[],
): readonly EstimateRow[] =>
  rows.flatMap((row) => [row, ...flattenEstimateRows(row.children ?? [])]);

const requiresManualCheck = (value: string | null | undefined): boolean =>
  Boolean(value && /требует|нужно сверить/u.test(value));

const fullSource = (ref: FullReglamentSourceRef): string =>
  `full.pdf стр. ${ref.page}, ${ref.fragment}`;

const fullSources = (refs: readonly FullReglamentSourceRef[]): string =>
  refs.map(fullSource).join('; ');

const estimateSource = (ref: EstimateSourceRef): string => {
  const fragment = ref.fragment ? `, ${ref.fragment}` : '';
  const note = ref.note ? ` (${ref.note})` : '';

  return `${ref.pdf}.pdf стр. ${ref.page}${fragment}${note}`;
};

const serviceTitleById = new Map(
  fullReglamentDataset2026.services.map((service) => [
    service.id,
    service.title,
  ]),
);

const manualEstimateRows = estimate2026.sections
  .flatMap((section) => flattenEstimateRows(section.rows))
  .filter((row) => row.tags?.includes('требует проверки'));

const manualCommonAssets = fullReglamentDataset2026.common_assets.filter(
  (asset) => requiresManualCheck(asset.verification_note),
);

const manualServiceMappings =
  fullReglamentDataset2026.service_to_estimate_map.filter(
    (item) =>
      item.status === 'needs_check' ||
      requiresManualCheck(item.verification_note),
  );

const manualCalculationAssumptions =
  fullReglamentDataset2026.calculation_assumptions.filter((item) =>
    requiresManualCheck(item.status_label_ru),
  );

const manualAuditNotes = fullReglamentDataset2026.audit_notes.filter(
  (item) => item.severity === 'needs_check',
);

const manualCheckCount =
  manualEstimateRows.length +
  manualCommonAssets.length +
  manualServiceMappings.length +
  manualCalculationAssumptions.length +
  manualAuditNotes.length;

const estimateManualLine = (row: EstimateRow): string =>
  `- estimate_rows:${row.id}: ${row.title}; source: ${row.source_refs.map(estimateSource).join('; ')}; причина: ${row.description ?? row.tags?.join(', ') ?? 'требует проверки'}`;

const assetManualLine = (asset: FullReglamentCommonAsset): string =>
  `- common_assets:${asset.id}: ${asset.title}; source: ${asset.source_refs.map(fullSource).join('; ')}; причина: ${asset.verification_note}`;

const serviceManualLine = (
  item: FullReglamentServiceToEstimateMapItem,
): string => {
  const serviceTitle = serviceTitleById.get(item.service_id) ?? item.service_id;
  const estimateRows = item.estimate_row_ids.join(', ') || '-';

  return `- service_to_estimate_map:${item.service_id}: ${serviceTitle}; статус: ${item.status_label_ru}; строки сметы: ${estimateRows}; source: ${item.source_refs.map(fullSource).join('; ')}; причина: ${item.verification_note ?? item.explanation}`;
};

const calculationManualLine = (
  item: FullReglamentCalculationAssumption,
): string =>
  `- calculation_assumptions:${item.id}: ${item.title}; статус: ${item.status_label_ru}; source: ${item.source_refs.map(fullSource).join('; ')}; как проверить: ${item.how_to_verify}`;

const auditManualLine = (item: FullReglamentAuditNote): string =>
  `- audit_notes:${item.id}: ${item.title}; ${item.public_wording}; source: ${fullSources(item.source_refs)}; следующий шаг: ${item.next_step}`;

const assetLine = (asset: FullReglamentCommonAsset): string =>
  `- ${asset.id}: ${asset.title}; единица: ${asset.unit ?? '-'}; итог: ${asset.total.raw}; source: ${fullSources(asset.source_refs)}`;

const serviceLine = (service: FullReglamentService): string => {
  const note = service.frequency_note
    ? `; примечание: ${service.frequency_note}`
    : '';

  return `- ${service.id}: ${service.title}; группа: ${service.group}; периодичность: ${service.frequency_raw}${note}; source: ${fullSources(service.source_refs)}`;
};

const mappingLine = (item: FullReglamentServiceToEstimateMapItem): string =>
  `- ${item.service_id}: ${item.status} (${item.status_label_ru}); строки сметы: ${item.estimate_row_ids.join(', ') || '-'}; ${item.explanation}`;

const calculationLine = (item: FullReglamentCalculationAssumption): string =>
  `- ${item.id}: ${item.title}; статус: ${item.status_label_ru}; ${item.summary}; source: ${fullSources(item.source_refs)}`;

const auditLine = (item: FullReglamentAuditNote): string =>
  `- ${item.id}: ${item.severity}; ${item.title}; ${item.public_wording}; следующий шаг: ${item.next_step}; source: ${fullSources(item.source_refs)}`;

const topicLine = (title: string, url: string, description: string): string =>
  `- ${title}: ${absoluteUrl(url)}; ${description}`;

export const buildFullReglamentMarkdown = (): string =>
  join([
    '# Полный регламент содержания Шелково',
    '',
    'Курируемый слой фактов из полного регламента для LLM и публичных справочных страниц. PDF не парсится во время запроса.',
    'Этот файл оставлен как обзор и индекс тематических файлов; подробные списки вынесены ниже по ссылкам.',
    '',
    '## Главные URL',
    `- JSON-набор данных: ${absoluteUrl(reglamentFull2026DataUrl())}`,
    `- PDF полного регламента: ${absoluteUrl(reglamentFullSourcePdfUrl())}`,
    `- Общее имущество: ${absoluteUrl(reglamentAssetsUrl())}`,
    `- Услуги регламента: ${absoluteUrl(reglamentServicesUrl())}`,
    '',
    '## Тематические файлы',
    topicLine(
      'Общее имущество',
      reglamentFullAssetsMarkdownUrl(),
      'перечень объектов, единицы измерения, итоги и ссылки на PDF',
    ),
    topicLine(
      'Услуги регламента',
      reglamentFullServicesMarkdownUrl(),
      'перечень услуг, группы и периодичность из приложения №4',
    ),
    topicLine(
      'Сопоставление услуг со сметой',
      reglamentFullServiceMapMarkdownUrl(),
      'статусы explicit_found, partial, not_found и needs_check',
    ),
    topicLine(
      'Проверки и допущения',
      reglamentFullChecksMarkdownUrl(),
      'ручная перепроверка, расчетные допущения и audit notes',
    ),
    '',
    '## Контрольные числа',
    `- Тарифицируемая площадь: ${fullReglamentDataset2026.tariff_summary.tariff_area_sotka} сотки`,
    `- Годовой итог: ${fullReglamentDataset2026.tariff_summary.total_annual_cost_rub} руб.`,
    `- Тариф: ${fullReglamentDataset2026.tariff_summary.tariff_rub_per_sotka_month} руб./сотка/мес.`,
    '',
    '## Покрытие набора данных',
    `- Поселки: ${fullReglamentDataset2026.villages.length}`,
    `- Общее имущество: ${fullReglamentDataset2026.common_assets.length}`,
    `- Услуги: ${fullReglamentDataset2026.services.length}`,
    `- Сопоставления услуг со сметой: ${fullReglamentDataset2026.service_to_estimate_map.length}`,
    `- Заметки аудита: ${fullReglamentDataset2026.audit_notes.length}`,
    '',
    '## Статусы сопоставления услуг',
    `- explicit_found: ${statusCounts.explicit_found}`,
    `- partial: ${statusCounts.partial}`,
    `- not_found: ${statusCounts.not_found}`,
    `- needs_check: ${statusCounts.needs_check}`,
    '',
    '## Ручная перепроверка',
    `- Всего позиций: ${manualCheckCount}`,
    `- Подробности: ${absoluteUrl(reglamentFullChecksMarkdownUrl())}`,
    '',
    '## Поселки',
    ...fullReglamentDataset2026.villages.map(
      (village) =>
        `- ${village.id}: ${village.title}; участков: ${village.households_count}; площадь: ${village.land_area_sotka} сотки; доля: ${village.land_area_share_percent}%`,
    ),
  ]);

export const buildFullReglamentAssetsMarkdown = (): string =>
  join([
    '# Полный регламент: общее имущество',
    '',
    `- Индекс: ${absoluteUrl(reglamentFullMarkdownUrl())}`,
    `- JSON-набор данных: ${absoluteUrl(reglamentFull2026DataUrl())}`,
    `- HTML-страница: ${absoluteUrl(reglamentAssetsUrl())}`,
    '',
    '## Сводка',
    `- Позиций: ${fullReglamentDataset2026.common_assets.length}`,
    `- Позиции с открытой проверкой: ${manualCommonAssets.length}`,
    '',
    '## Общее имущество',
    ...fullReglamentDataset2026.common_assets.map(assetLine),
  ]);

export const buildFullReglamentServicesMarkdown = (): string =>
  join([
    '# Полный регламент: услуги',
    '',
    `- Индекс: ${absoluteUrl(reglamentFullMarkdownUrl())}`,
    `- JSON-набор данных: ${absoluteUrl(reglamentFull2026DataUrl())}`,
    `- HTML-страница: ${absoluteUrl(reglamentServicesUrl())}`,
    '',
    '## Сводка',
    `- Услуг: ${fullReglamentDataset2026.services.length}`,
    '',
    '## Услуги',
    ...fullReglamentDataset2026.services.map(serviceLine),
  ]);

export const buildFullReglamentServiceMapMarkdown = (): string =>
  join([
    '# Полный регламент: сопоставление услуг со сметой',
    '',
    `- Индекс: ${absoluteUrl(reglamentFullMarkdownUrl())}`,
    `- JSON-набор данных: ${absoluteUrl(reglamentFull2026DataUrl())}`,
    '',
    '## Статусы сопоставления услуг',
    `- explicit_found: ${statusCounts.explicit_found}`,
    `- partial: ${statusCounts.partial}`,
    `- not_found: ${statusCounts.not_found}`,
    `- needs_check: ${statusCounts.needs_check}`,
    '',
    '## Сопоставления',
    ...fullReglamentDataset2026.service_to_estimate_map.map(mappingLine),
  ]);

export const buildFullReglamentChecksMarkdown = (): string =>
  join([
    '# Полный регламент: проверки и допущения',
    '',
    `- Индекс: ${absoluteUrl(reglamentFullMarkdownUrl())}`,
    `- JSON-набор данных: ${absoluteUrl(reglamentFull2026DataUrl())}`,
    '',
    '## Сводка',
    `- Всего позиций ручной перепроверки: ${manualCheckCount}`,
    `- Строк сметы с тегом «требует проверки»: ${manualEstimateRows.length}`,
    `- Объектов общего имущества с открытой проверкой: ${manualCommonAssets.length}`,
    `- Сопоставлений услуг, где нужна сверка: ${manualServiceMappings.length}`,
    `- Расчетных допущений, требующих проверки: ${manualCalculationAssumptions.length}`,
    `- Audit notes с severity=needs_check: ${manualAuditNotes.length}`,
    '',
    '## Ручная перепроверка',
    '',
    '### Строки сметы с тегом «требует проверки»',
    ...manualEstimateRows.map(estimateManualLine),
    '',
    '### Общее имущество с открытой проверкой',
    ...manualCommonAssets.map(assetManualLine),
    '',
    '### Услуги, где нужно сверить первичку или конфликт сопоставления',
    ...manualServiceMappings.map(serviceManualLine),
    '',
    '### Расчетные допущения, требующие проверки',
    ...manualCalculationAssumptions.map(calculationManualLine),
    '',
    '### Audit notes с severity=needs_check',
    ...manualAuditNotes.map(auditManualLine),
    '',
    '## Расчетные допущения',
    ...fullReglamentDataset2026.calculation_assumptions.map(calculationLine),
    '',
    '## Audit notes',
    ...fullReglamentDataset2026.audit_notes.map(auditLine),
  ]);
