import {
  ESTIMATE_DETAIL_SOURCE_PDFS,
  type EstimateDetailControlTotal,
  type EstimateDetailDataset,
  type EstimateDetailMoneyValue,
  type EstimateDetailQuantityValue,
  type EstimateDetailResource,
  type EstimateDetailSourcePdf,
  type EstimateDetailSourcePdfInfo,
  type EstimateDetailSourceRef,
  type EstimateDetailStatus,
  type EstimateDetailStatusInfo,
  type EstimateDetailWorkItem,
} from '@/lib/reglament/detail-schema';
import type { NonEmptyReadonlyArray } from '@/lib/reglament/schema';

type DetailSourceOptions = Pick<EstimateDetailSourceRef, 'quote' | 'note'>;
type DetailMoneyOptions = Pick<EstimateDetailMoneyValue, 'raw' | 'note'>;
type DetailQuantityOptions = Pick<EstimateDetailQuantityValue, 'raw' | 'note'>;

const detailSourcePdfTitles = {
  final: 'Итоговая смета',
  cleaning: 'Детализация уборки',
  landscaping: 'Детализация озеленения',
  improvement: 'Детализация благоустройства',
  lighting: 'Детализация освещения',
  security: 'Детализация охраны',
  waste: 'Детализация вывоза мусора',
} as const satisfies Record<EstimateDetailSourcePdf, string>;

const detailStatusLabels = {
  verified: 'проверено',
  derived: 'рассчитано',
  needs_check: 'требует проверки',
} as const satisfies Record<EstimateDetailStatus, string>;

const assertFiniteOrNull = (value: number | null, field: string): void => {
  if (value !== null && !Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number or null`);
  }
};

const estimateDetailSourcePdfs = ESTIMATE_DETAIL_SOURCE_PDFS.map(
  (pdf): EstimateDetailSourcePdfInfo => ({
    pdf,
    title: detailSourcePdfTitles[pdf],
  }),
);

export const detailSource = (
  pdf: EstimateDetailSourcePdf,
  page: number,
  fragment: string,
  options: DetailSourceOptions = {},
): EstimateDetailSourceRef => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error('detail source page must be a positive integer');
  }
  if (!fragment.trim()) {
    throw new Error('detail source fragment must not be empty');
  }

  return { pdf, page, fragment, ...options };
};

export const detailSourceRefs = (
  first: EstimateDetailSourceRef,
  ...rest: readonly EstimateDetailSourceRef[]
): NonEmptyReadonlyArray<EstimateDetailSourceRef> => [first, ...rest];

export const detailMoney = (
  value: number | null,
  options: DetailMoneyOptions = {},
): EstimateDetailMoneyValue => {
  assertFiniteOrNull(value, 'detail money value');

  return { value, ...options };
};

export const detailQuantity = (
  value: number | null,
  unit: string | null,
  options: DetailQuantityOptions = {},
): EstimateDetailQuantityValue => {
  assertFiniteOrNull(value, 'detail quantity value');

  if (value !== null && unit === null) {
    throw new Error('detail quantity unit is required when value is known');
  }

  return { value, unit, ...options };
};

export const detailStatus = (
  status: Exclude<EstimateDetailStatus, 'needs_check'>,
): EstimateDetailStatusInfo => ({
  status,
  status_label_ru: detailStatusLabels[status],
});

export const detailNeedsCheckStatus = (
  reason: string,
  source_refs?: readonly EstimateDetailSourceRef[],
): EstimateDetailStatusInfo => ({
  status: 'needs_check',
  status_label_ru: detailStatusLabels.needs_check,
  needs_check: {
    reason,
    ...(source_refs ? { source_refs } : {}),
  },
});

export const detailWorkItem = (
  input: EstimateDetailWorkItem,
): EstimateDetailWorkItem => input;

export const detailResource = (
  input: EstimateDetailResource,
): EstimateDetailResource => input;

export const detailControlTotal = (
  input: EstimateDetailControlTotal,
): EstimateDetailControlTotal => input;

export const estimateDetails2026 = {
  schema_version: '1',
  dataset_id: 'estimate-details-2026',
  title: 'Детальная смета 2026',
  year: 2026,
  source_pdfs: estimateDetailSourcePdfs,
  curation_notes: [
    'Детальные факты извлекаются только из маленьких PDF в apps/www/public/815/regulation/original/; full.pdf для detail-данных не используется.',
    'PDF не парсятся во время runtime или build страницы: этот файл является curated dataset для ручного пополнения.',
    'Каждый будущий work item, resource и control total должен иметь source_refs с PDF, страницей и фрагментом; неоднозначные строки помечаются needs_check.',
  ],
  work_items: [],
  resources: [],
  control_totals: [],
} satisfies EstimateDetailDataset;
