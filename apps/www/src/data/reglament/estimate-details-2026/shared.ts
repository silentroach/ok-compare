import {
  ESTIMATE_DETAIL_SOURCE_PDFS,
  type EstimateDetailControlTotal,
  type EstimateDetailControlTotalInput,
  type EstimateDetailMoneyValue,
  type EstimateDetailQuantityValue,
  type EstimateDetailResource,
  type EstimateDetailSourcePdf,
  type EstimateDetailSourcePdfInfo,
  type EstimateDetailSourceQuoteItem,
  type EstimateDetailSourceRef,
  type EstimateDetailStatus,
  type EstimateDetailStatusInfo,
  type EstimateDetailWorkItem,
} from '@/lib/reglament/detail-schema';
import type { NonEmptyReadonlyArray } from '@/lib/reglament/schema';

type DetailSourceOptions = Pick<
  EstimateDetailSourceRef,
  'quote' | 'quote_items' | 'note'
>;
type DetailMoneyOptions = Pick<EstimateDetailMoneyValue, 'note'>;
type DetailQuantityOptions = Pick<EstimateDetailQuantityValue, 'note'>;

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

const detailSourcePdfPagesTotal: Partial<
  Record<EstimateDetailSourcePdf, number>
> = {
  final: 2,
  cleaning: 27,
  landscaping: 22,
  improvement: 18,
  lighting: 14,
  security: 13,
  waste: 13,
};

const assertFiniteOrNull = (value: number | null, field: string): void => {
  if (value !== null && !Number.isFinite(value)) {
    throw new Error(`${field}: ожидается конечное число или null`);
  }
};

export const estimateDetailSourcePdfs = ESTIMATE_DETAIL_SOURCE_PDFS.map(
  (pdf): EstimateDetailSourcePdfInfo => {
    const pagesTotal = detailSourcePdfPagesTotal[pdf];

    return {
      pdf,
      title: detailSourcePdfTitles[pdf],
      ...(pagesTotal ? { pages_total: pagesTotal } : {}),
    };
  },
);

export const detailSource = (
  pdf: EstimateDetailSourcePdf,
  page: number,
  fragment: string,
  options: DetailSourceOptions = {},
): EstimateDetailSourceRef => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(
      'страница источника детализации должна быть положительным целым числом',
    );
  }
  if (!fragment.trim()) {
    throw new Error('фрагмент источника детализации не должен быть пустым');
  }
  if (options.quote_items?.length === 0) {
    throw new Error(
      'позиции цитаты источника детализации не должны быть пустыми',
    );
  }

  return { pdf, page, fragment, ...options };
};

export const detailSourceQuoteItem = (
  input: EstimateDetailSourceQuoteItem,
): EstimateDetailSourceQuoteItem => {
  if (!input.label.trim()) {
    throw new Error(
      'название позиции цитаты источника детализации не должно быть пустым',
    );
  }
  if (input.resource_ids?.some((resourceId) => !resourceId.trim())) {
    throw new Error(
      'ID ресурсов позиции цитаты источника детализации не должны быть пустыми',
    );
  }

  return input;
};

export const detailSourceQuoteItems = (
  first: EstimateDetailSourceQuoteItem,
  ...rest: readonly EstimateDetailSourceQuoteItem[]
): NonEmptyReadonlyArray<EstimateDetailSourceQuoteItem> => [first, ...rest];

export const detailSourceRefs = (
  first: EstimateDetailSourceRef,
  ...rest: readonly EstimateDetailSourceRef[]
): NonEmptyReadonlyArray<EstimateDetailSourceRef> => [first, ...rest];

export const detailMoney = (
  value: number | null,
  options: DetailMoneyOptions = {},
): EstimateDetailMoneyValue => {
  assertFiniteOrNull(value, 'денежное значение детализации');

  return { value, ...options };
};

export const detailQuantity = (
  value: number | null,
  unit: string | null,
  options: DetailQuantityOptions = {},
): EstimateDetailQuantityValue => {
  assertFiniteOrNull(value, 'количество детализации');

  if (value !== null && unit === null) {
    throw new Error(
      'единица измерения детализации обязательна, если значение известно',
    );
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
  input: EstimateDetailControlTotalInput,
): EstimateDetailControlTotal => {
  const { control_source, ...rest } = input;

  return { ...rest, control_source: control_source ?? 'section_pdf' };
};
