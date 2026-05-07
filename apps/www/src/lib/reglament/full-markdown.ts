import { fullReglamentDataset2026 } from '@/data/reglament/full-2026';
import type {
  FullReglamentCommonAsset,
  FullReglamentServiceToEstimateMapItem,
} from '@/lib/reglament/full-schema';

import { absoluteUrl } from '../site';
import {
  reglamentAssetsUrl,
  reglamentFull2026DataUrl,
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

const assetLine = (asset: FullReglamentCommonAsset): string =>
  `- ${asset.id}: ${asset.title}; единица: ${asset.unit ?? '-'}; итог: ${asset.total.raw}; source: ${asset.source_refs.map((ref) => `full.pdf стр. ${ref.page}, ${ref.fragment}`).join('; ')}`;

const mappingLine = (item: FullReglamentServiceToEstimateMapItem): string =>
  `- ${item.service_id}: ${item.status} (${item.status_label_ru}); строки сметы: ${item.estimate_row_ids.join(', ') || '-'}; ${item.explanation}`;

export const buildFullReglamentMarkdown = (): string =>
  join([
    '# Полный регламент содержания SHELKOVO',
    '',
    'Курируемый слой фактов из полного регламента для LLM и публичных справочных страниц. Runtime-парсинга PDF нет.',
    '',
    '## Главные URL',
    `- JSON dataset: ${absoluteUrl(reglamentFull2026DataUrl())}`,
    `- Общее имущество: ${absoluteUrl(reglamentAssetsUrl())}`,
    `- Услуги регламента: ${absoluteUrl(reglamentServicesUrl())}`,
    '',
    '## Контрольные числа',
    `- Тарифицируемая площадь: ${fullReglamentDataset2026.tariff_summary.tariff_area_sotka} сотки`,
    `- Годовой итог: ${fullReglamentDataset2026.tariff_summary.total_annual_cost_rub} руб.`,
    `- Тариф: ${fullReglamentDataset2026.tariff_summary.tariff_rub_per_sotka_month} руб./сотка/мес.`,
    '',
    '## Покрытие dataset',
    `- Поселки: ${fullReglamentDataset2026.villages.length}`,
    `- Общее имущество: ${fullReglamentDataset2026.common_assets.length}`,
    `- Услуги: ${fullReglamentDataset2026.services.length}`,
    `- Сопоставления услуг со сметой: ${fullReglamentDataset2026.service_to_estimate_map.length}`,
    `- Audit notes: ${fullReglamentDataset2026.audit_notes.length}`,
    '',
    '## Статусы сопоставления услуг',
    `- explicit_found: ${statusCounts.explicit_found}`,
    `- partial: ${statusCounts.partial}`,
    `- not_found: ${statusCounts.not_found}`,
    `- needs_check: ${statusCounts.needs_check}`,
    '',
    '## Общее имущество',
    ...fullReglamentDataset2026.common_assets.map(assetLine),
    '',
    '## Сопоставление услуг со сметой',
    ...fullReglamentDataset2026.service_to_estimate_map.map(mappingLine),
    '',
    '## Осторожные проверки',
    ...fullReglamentDataset2026.audit_notes.map(
      (item) => `- ${item.id}: ${item.public_wording}; ${item.next_step}`,
    ),
  ]);
