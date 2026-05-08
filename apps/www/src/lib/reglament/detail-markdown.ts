import { estimateDetails2026 } from '@/data/reglament/estimate-details-2026';
import type {
  EstimateDetailControlTotal,
  EstimateDetailDataset,
  EstimateDetailMoneyValue,
  EstimateDetailQuantityValue,
  EstimateDetailResource,
  EstimateDetailResourceKind,
  EstimateDetailSourceRef,
  EstimateDetailWorkItem,
} from '@/lib/reglament/detail-schema';
import { ESTIMATE_DETAIL_RESOURCE_KINDS } from '@/lib/reglament/detail-schema';

import { absoluteUrl } from '../site';
import { formatReglamentMoney, formatReglamentNumber } from './format';
import {
  reglamentEstimateDetailsChecksMarkdownUrl,
  reglamentEstimateDetails2026DataUrl,
  reglamentEstimateDetailsLaborMarkdownUrl,
  reglamentEstimateDetailsMachinesMarkdownUrl,
  reglamentEstimateDetailsMarkdownUrl,
  reglamentEstimateDetailsMaterialsMarkdownUrl,
  reglamentSourcePdfUrl,
} from './routes';

export const ESTIMATE_DETAIL_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

const RESOURCE_KIND_LABELS = {
  labor: 'труд',
  machinist_labor: 'труд машинистов',
  machine: 'машины',
  material: 'материалы',
  contractor: 'подрядчики',
  other_cost: 'прочие затраты',
} as const satisfies Record<EstimateDetailResourceKind, string>;

const EMPTY_LIST_LINE = '- Нет данных в текущей версии dataset.';

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const source = (ref: EstimateDetailSourceRef): string => {
  const fragment = ref.fragment ? `, ${ref.fragment}` : '';
  const quote = ref.quote ? `; цитата: «${ref.quote}»` : '';
  const note = ref.note ? `; примечание: ${ref.note}` : '';

  return `[${ref.pdf}.pdf стр. ${ref.page}${fragment}](${absoluteUrl(reglamentSourcePdfUrl(ref.pdf))})${quote}${note}`;
};

const sources = (refs: readonly EstimateDetailSourceRef[]): string =>
  refs.map(source).join('; ');

const formatMoney = (money: EstimateDetailMoneyValue | undefined): string => {
  if (!money) return '-';

  const value = money.raw
    ? `${money.raw} руб.`
    : money.value === null
      ? 'нет данных'
      : formatReglamentMoney(money.value);
  const note = money.note ? ` (${money.note})` : '';

  return `${value}${note}`;
};

const formatQuantity = (
  quantity: EstimateDetailQuantityValue | undefined,
): string => {
  if (!quantity) return '-';

  const value = quantity.raw
    ? quantity.raw
    : quantity.value === null
      ? 'нет данных'
      : `${formatReglamentNumber(quantity.value)}${quantity.unit ? ` ${quantity.unit}` : ''}`;
  const note = quantity.note ? ` (${quantity.note})` : '';

  return `${value}${note}`;
};

const formatDelta = (value: number | undefined): string => {
  if (value === undefined) return '-';

  const sign = value > 0 ? '+' : '';

  return `${sign}${formatReglamentNumber(value)} ₽`;
};

const linesOrEmpty = <T>(
  items: readonly T[],
  line: (item: T) => string,
): readonly string[] =>
  items.length > 0 ? items.map(line) : [EMPTY_LIST_LINE];

const needsCheckWorkItems = (
  dataset: EstimateDetailDataset,
): readonly EstimateDetailWorkItem[] =>
  dataset.work_items.filter((item) => item.status === 'needs_check');

const needsCheckResources = (
  dataset: EstimateDetailDataset,
): readonly EstimateDetailResource[] =>
  dataset.resources.filter((item) => item.status === 'needs_check');

const needsCheckControlTotals = (
  dataset: EstimateDetailDataset,
): readonly EstimateDetailControlTotal[] =>
  dataset.control_totals.filter((item) => item.status === 'needs_check');

const needsCheckCount = (dataset: EstimateDetailDataset): number =>
  needsCheckWorkItems(dataset).length +
  needsCheckResources(dataset).length +
  needsCheckControlTotals(dataset).length;

const resourcesByKind = (
  dataset: EstimateDetailDataset,
  kinds: readonly EstimateDetailResourceKind[],
): readonly EstimateDetailResource[] =>
  dataset.resources.filter((resource) => kinds.includes(resource.kind));

const topicLine = (title: string, path: string, description: string): string =>
  `- ${title}: ${absoluteUrl(path)}; ${description}`;

const sourcePdfLine = (
  pdf: EstimateDetailDataset['source_pdfs'][number],
): string => {
  const pages = pdf.pages_total ? `; страниц: ${pdf.pages_total}` : '';

  return `- ${pdf.pdf}.pdf: ${pdf.title}${pages}; URL: ${absoluteUrl(reglamentSourcePdfUrl(pdf.pdf))}`;
};

const resourceLine = (
  resource: EstimateDetailResource,
  priceLabel: 'цена' | 'ставка' = 'цена',
): string => {
  const note = resource.note ? `; примечание: ${resource.note}` : '';

  return `- ${resource.id}: ${resource.title}; работа: ${resource.work_item_id}; строка сметы: ${resource.estimate_row_id}; вид: ${RESOURCE_KIND_LABELS[resource.kind]}; bucket: ${resource.cost_bucket}; кол-во: ${formatQuantity(resource.quantity)}; ${priceLabel}: ${formatMoney(resource.unit_price_rub)}; итог: ${formatMoney(resource.total_rub)}; статус: ${resource.status_label_ru}; source: ${sources(resource.source_refs)}${note}`;
};

const controlTotalLine = (control: EstimateDetailControlTotal): string => {
  const detail = `detail: ${formatMoney(control.detail_total_rub)}`;
  const aggregate = `aggregate: ${formatMoney(control.aggregate_total_rub)}`;
  const tolerance =
    control.tolerance_rub === undefined
      ? '-'
      : `${formatReglamentNumber(control.tolerance_rub)} ₽`;
  const resources = control.resource_ids?.join(', ') ?? '-';
  const note = control.note ? `; примечание: ${control.note}` : '';

  return `- ${control.id}: ${control.cost_bucket}; строка сметы: ${control.estimate_row_id}; source total: ${formatMoney(control.source_total_rub)}; ${detail}; ${aggregate}; дельта: ${formatDelta(control.delta_rub)}; допуск: ${tolerance}; ресурсы: ${resources}; статус: ${control.status_label_ru}; source: ${sources(control.source_refs)}${note}`;
};

const workItemNeedsCheckLine = (item: EstimateDetailWorkItem): string => {
  if (item.status !== 'needs_check') return '';

  const checkSources = item.needs_check.source_refs ?? item.source_refs;

  return `- work_items:${item.id}: ${item.title}; строка сметы: ${item.estimate_row_id}; причина: ${item.needs_check.reason}; source: ${sources(checkSources)}`;
};

const resourceNeedsCheckLine = (item: EstimateDetailResource): string => {
  if (item.status !== 'needs_check') return '';

  const checkSources = item.needs_check.source_refs ?? item.source_refs;

  return `- resources:${item.id}: ${item.title}; работа: ${item.work_item_id}; bucket: ${item.cost_bucket}; причина: ${item.needs_check.reason}; source: ${sources(checkSources)}`;
};

const controlNeedsCheckLine = (item: EstimateDetailControlTotal): string => {
  if (item.status !== 'needs_check') return '';

  const checkSources = item.needs_check.source_refs ?? item.source_refs;

  return `- control_totals:${item.id}: ${item.cost_bucket}; строка сметы: ${item.estimate_row_id}; причина: ${item.needs_check.reason}; source: ${sources(checkSources)}`;
};

export const buildEstimateDetailMarkdown = (
  dataset: EstimateDetailDataset = estimateDetails2026,
): string =>
  join([
    '# Детальная смета 2026',
    '',
    'Машиночитаемый markdown-индекс curated dataset `estimate-details-2026` для маленьких PDF сметы. PDF не парсятся во время runtime или build страницы.',
    '',
    '## Главные URL',
    `- JSON-набор данных: ${absoluteUrl(reglamentEstimateDetails2026DataUrl())}`,
    `- Этот индекс: ${absoluteUrl(reglamentEstimateDetailsMarkdownUrl())}`,
    '',
    '## Тематические файлы',
    topicLine(
      'Материалы',
      reglamentEstimateDetailsMaterialsMarkdownUrl(),
      'ресурсы kind=material, количество, цена и итог',
    ),
    topicLine(
      'Машины',
      reglamentEstimateDetailsMachinesMarkdownUrl(),
      'ресурсы kind=machine и машинные затраты',
    ),
    topicLine(
      'Труд',
      reglamentEstimateDetailsLaborMarkdownUrl(),
      'ресурсы kind=labor и kind=machinist_labor, ставки и итоги',
    ),
    topicLine(
      'Проверки',
      reglamentEstimateDetailsChecksMarkdownUrl(),
      'control totals, дельты и все позиции needs_check',
    ),
    '',
    '## Сводка',
    `- Dataset: ${dataset.dataset_id}; schema_version: ${dataset.schema_version}; год: ${dataset.year}`,
    `- PDF-источники: ${dataset.source_pdfs.length}`,
    `- Работы: ${dataset.work_items.length}`,
    `- Ресурсы: ${dataset.resources.length}`,
    `- Контрольные итоги: ${dataset.control_totals.length}`,
    `- needs_check: ${needsCheckCount(dataset)}`,
    '',
    '## Ресурсы по видам',
    ...ESTIMATE_DETAIL_RESOURCE_KINDS.map(
      (kind) =>
        `- ${kind}: ${resourcesByKind(dataset, [kind]).length} (${RESOURCE_KIND_LABELS[kind]})`,
    ),
    '',
    '## PDF-источники',
    ...linesOrEmpty(dataset.source_pdfs, sourcePdfLine),
    '',
    '## Curation notes',
    ...linesOrEmpty(dataset.curation_notes, (note) => `- ${note}`),
  ]);

export const buildEstimateDetailMaterialsMarkdown = (
  dataset: EstimateDetailDataset = estimateDetails2026,
): string => {
  const materials = resourcesByKind(dataset, ['material']);

  return join([
    '# Детальная смета 2026: материалы',
    '',
    `- Индекс: ${absoluteUrl(reglamentEstimateDetailsMarkdownUrl())}`,
    `- JSON-набор данных: ${absoluteUrl(reglamentEstimateDetails2026DataUrl())}`,
    '',
    '## Сводка',
    `- Материальных ресурсов: ${materials.length}`,
    '',
    '## Материалы',
    ...linesOrEmpty(materials, (resource) => resourceLine(resource)),
  ]);
};

export const buildEstimateDetailMachinesMarkdown = (
  dataset: EstimateDetailDataset = estimateDetails2026,
): string => {
  const machines = resourcesByKind(dataset, ['machine']);

  return join([
    '# Детальная смета 2026: машины',
    '',
    `- Индекс: ${absoluteUrl(reglamentEstimateDetailsMarkdownUrl())}`,
    `- JSON-набор данных: ${absoluteUrl(reglamentEstimateDetails2026DataUrl())}`,
    '',
    '## Сводка',
    `- Машинных ресурсов: ${machines.length}`,
    '',
    '## Машины',
    ...linesOrEmpty(machines, (resource) => resourceLine(resource)),
  ]);
};

export const buildEstimateDetailLaborMarkdown = (
  dataset: EstimateDetailDataset = estimateDetails2026,
): string => {
  const labor = resourcesByKind(dataset, ['labor', 'machinist_labor']);

  return join([
    '# Детальная смета 2026: труд',
    '',
    `- Индекс: ${absoluteUrl(reglamentEstimateDetailsMarkdownUrl())}`,
    `- JSON-набор данных: ${absoluteUrl(reglamentEstimateDetails2026DataUrl())}`,
    '',
    '## Сводка',
    `- Трудовых ресурсов: ${labor.length}`,
    '',
    '## Труд и ставки',
    ...linesOrEmpty(labor, (resource) => resourceLine(resource, 'ставка')),
  ]);
};

export const buildEstimateDetailChecksMarkdown = (
  dataset: EstimateDetailDataset = estimateDetails2026,
): string => {
  const workItems = needsCheckWorkItems(dataset);
  const resources = needsCheckResources(dataset);
  const controlTotals = needsCheckControlTotals(dataset);

  return join([
    '# Детальная смета 2026: проверки',
    '',
    `- Индекс: ${absoluteUrl(reglamentEstimateDetailsMarkdownUrl())}`,
    `- JSON-набор данных: ${absoluteUrl(reglamentEstimateDetails2026DataUrl())}`,
    '',
    '## Сводка',
    `- Контрольные итоги: ${dataset.control_totals.length}`,
    `- needs_check всего: ${needsCheckCount(dataset)}`,
    `- Работы needs_check: ${workItems.length}`,
    `- Ресурсы needs_check: ${resources.length}`,
    `- Контрольные итоги needs_check: ${controlTotals.length}`,
    '',
    '## Контрольные итоги',
    ...linesOrEmpty(dataset.control_totals, controlTotalLine),
    '',
    '## needs_check',
    '',
    '### Работы',
    ...linesOrEmpty(workItems, workItemNeedsCheckLine),
    '',
    '### Ресурсы',
    ...linesOrEmpty(resources, resourceNeedsCheckLine),
    '',
    '### Контрольные итоги',
    ...linesOrEmpty(controlTotals, controlNeedsCheckLine),
  ]);
};
