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

const detailSourcePdfPagesTotal: Partial<
  Record<EstimateDetailSourcePdf, number>
> = {
  lighting: 14,
  security: 13,
  waste: 13,
};

const assertFiniteOrNull = (value: number | null, field: string): void => {
  if (value !== null && !Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number or null`);
  }
};

const estimateDetailSourcePdfs = ESTIMATE_DETAIL_SOURCE_PDFS.map(
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

const lightingStreetFixtureLaborResourceId = 'lighting-street-fixture-labor';
const lightingStreetCableLaborResourceId = 'lighting-street-cable-labor';
const lightingStreetFixtureMaterialResourceId =
  'lighting-street-fixture-material';
const lightingStreetInsuranceResourceId = 'lighting-street-insurance';
const lightingStreetOverheadResourceId = 'lighting-street-overhead';
const lightingStreetProfitResourceId = 'lighting-street-profit';
const lightingStreetUsnResourceId = 'lighting-street-usn-derived';
const lightingStreetVatResourceId = 'lighting-street-vat-derived';
const lightingElectricityMaterialResourceId = 'lighting-electricity-material';
const lightingElectricityUsnResourceId = 'lighting-electricity-usn-derived';
const lightingElectricityVatResourceId = 'lighting-electricity-vat-derived';
const lightingPolesPaintLaborResourceId = 'lighting-poles-paint-labor';
const lightingPolesPaintMaterialResourceId = 'lighting-poles-paint-material';
const lightingPolesInsuranceResourceId = 'lighting-poles-insurance';
const lightingPolesOverheadResourceId = 'lighting-poles-overhead';
const lightingPolesProfitResourceId = 'lighting-poles-profit';
const lightingPolesUsnResourceId = 'lighting-poles-usn-derived';
const lightingPolesVatResourceId = 'lighting-poles-vat-derived';
const lightingPowerSystemKtpKrnLaborResourceId =
  'lighting-power-system-ktp-krn-labor';
const lightingPowerSystemTransformerLaborResourceId =
  'lighting-power-system-transformer-labor';
const lightingPowerSystemInsuranceResourceId =
  'lighting-power-system-insurance';
const lightingPowerSystemOverheadResourceId = 'lighting-power-system-overhead';
const lightingPowerSystemProfitResourceId = 'lighting-power-system-profit';
const lightingPowerSystemUsnResourceId = 'lighting-power-system-usn-derived';
const lightingPowerSystemVatResourceId = 'lighting-power-system-vat-derived';

const lightingProductionStreetSource = detailSource(
  'lighting',
  1,
  'производственная программа / техническое обслуживание уличного освещения',
  {
    quote:
      'Техническое обслуживание уличного освещения 3 839,4; обслуживание светильников ... 3776,8; уличный светильник ЖКУ 16-100-001 ... 146,0; обслуживание кабельных сетей ... 62,6',
  },
);

const lightingProductionPolesSource = detailSource(
  'lighting',
  2,
  'производственная программа / текущий ремонт опор уличного освещения',
  {
    quote:
      'Текущий ремонт опор уличного освещения (1 раз в 5 лет); окраска металлических поверхностей в 2 слоя; 0,20; 2 833,60; 334,4; краска ... 453,4',
  },
);

const lightingProductionPowerKtpSource = detailSource(
  'lighting',
  2,
  'производственная программа / техническое обслуживание КТП и КРН',
  {
    quote:
      'Техническое обслуживание КТП, КРН; шт.; 3; 1 466,6; осмотр и уборка помещения ТП; очистка от снега КТП',
  },
);

const lightingProductionPowerTransformerSource = detailSource(
  'lighting',
  5,
  'производственная программа / техническое обслуживание трансформаторов 10кВ',
  {
    quote:
      'Техническое обслуживание трансформаторов 10кВ; 2; 126,8; замер нагрузок; осмотр трансформатора; очистка трансформатора',
  },
);

const lightingNormativeElectricitySource = detailSource(
  'lighting',
  6,
  'нормативный расчет электроэнергии для уличного освещения',
  {
    quote:
      'Уличный светильник ЖКУ 16-100-001; 506; 0,10; 218 457; продолжительность работы освещения 4 317,3 часов в год',
  },
);

const lightingNormativeMaterialsSource = detailSource(
  'lighting',
  6,
  'нормативный расчет материалов для уличного освещения',
  {
    quote:
      'Уличный светильник ЖКУ 16-100-001; срок службы 15 000; время работы за 1 год 4 317; износ за год 28,8%; кол-во ламп для замены 146',
  },
);

const lightingStreetFixturePositionSource = detailSource(
  'lighting',
  7,
  'позиция 1.1 / обслуживание светильников наружного освещения',
  {
    quote:
      'Затраты труда Электромонтажник ... 3776,8; 664,15; 2 508 335,23; ИТОГО ПО ПОЗИЦИИ 6 122 841,22',
  },
);

const lightingStreetFixtureMaterialSource = detailSource(
  'lighting',
  8,
  'позиция 1.1 / материал и начисления по обслуживанию светильников',
  {
    quote:
      'Уличный светильник ЖКУ 16-100-001; шт; 146,0; 670,00; 97 820,00; страховые взносы 757 517,24; общеэксплуатационные расходы 1 755 834,66; прибыль 1 003 334,09',
  },
);

const lightingStreetCablePositionSource = detailSource(
  'lighting',
  8,
  'позиция 1.2 / обслуживание кабельных сетей',
  {
    quote:
      'Обслуживание кабельных сетей ... 62,6; 664,15; 41 578,18; страховые взносы 12 556,61; общеэксплуатационные расходы 29 104,73; прибыль 16 631,27; ИТОГО ПО ПОЗИЦИИ 99 870,79',
  },
);

const lightingElectricityPositionSource = detailSource(
  'lighting',
  9,
  'позиция 2.1 / электроэнергия на уличное освещение',
  {
    quote:
      'Электроэнергия; кВт*час; 218457,5; 6,29; 1 374 097,60; ИТОГО ПО ПОЗИЦИИ 1 374 097,60',
  },
);

const lightingPolesPositionSource = detailSource(
  'lighting',
  9,
  'позиция 3.1 / окраска металлических поверхностей опор',
  {
    quote:
      'Затраты труда Электромонтажник ... 334,4; 664,15; 222 066,98; краска по металлу ... 453,4; 612,50; 277 692,80',
  },
);

const lightingPolesTotalsSource = detailSource(
  'lighting',
  10,
  'позиция 3.1 / начисления и итог ремонта опор',
  {
    quote:
      'Расходы на страховые взносы 67 064,23; общеэксплуатационные расходы 155 446,88; прибыль 88 826,79; ИТОГО ПО ПОЗИЦИИ 811 097,69',
  },
);

const lightingPowerKtpPositionSource = detailSource(
  'lighting',
  10,
  'позиция 4.1 / техническое обслуживание КТП и КРН',
  {
    quote:
      'Техническое обслуживание КТП, КРН; 3,00; затраты труда 1466,6; 664,15; 974 022,95; страховые взносы 294 154,93; общеэксплуатационные расходы 681 816,06; прибыль 389 609,18; ИТОГО ПО ПОЗИЦИИ 2 339 603,12',
  },
);

const lightingPowerTransformerPositionSource = detailSource(
  'lighting',
  10,
  'позиция 4.2 / техническое обслуживание трансформаторов 10кВ',
  {
    quote:
      'Техническое обслуживание трансформаторов 10кВ; 2,00; затраты труда 126,8; 664,15; 84 213,69; страховые взносы 25 432,53; общеэксплуатационные расходы 58 949,58; прибыль 33 685,47; ИТОГО ПО ПОЗИЦИИ 202 281,28',
  },
);

const lightingDocumentTotalsSource = detailSource(
  'lighting',
  11,
  'итоги локального ресурсного сметного расчета по освещению',
  {
    quote:
      'Итого по разделу ... 10 949 791,70; основная зарплата 3 830 217,03; материальные затраты 1 749 610,40; страховые взносы 1 156 725,54; общеэксплуатационные расходы 2 681 151,92; прибыль 1 532 086,81',
  },
);

const lightingDocumentVatSource = detailSource(
  'lighting',
  12,
  'НДС в локальном ресурсном сметном расчете по освещению',
  {
    quote: 'ВСЕГО по документу 10 949 791,70; НДС 5% 547 489,58',
  },
);

const lightingResourceStatementSource = detailSource(
  'lighting',
  13,
  'ресурсная ведомость по локальному ресурсному сметному расчету',
  {
    quote:
      'Электромонтажник 5767,1 664,15 3 830 217,03; Уличный светильник ЖКУ 16-100-001 146 670,00 97 820,00; Краска ... 453 612,50 277 692,80; Электроэнергия 218457 6,29 1 374 097,60',
  },
);

const lightingCalculationSource = detailSource(
  'lighting',
  14,
  'калькуляция себестоимости услуг по освещению и электроснабжению',
  {
    quote:
      'ИТОГО расходов 9 417 705; налог по УСН 229 813; прибыль ... 1 532 087; Доходов - всего 11 179 605',
  },
);

const lightingDerivedAllocationNeedsCheckReason =
  'lighting.pdf показывает УСН и НДС только на уровне всей услуги; распределение по четырем строкам выведено из итоговых сумм estimate-2026 и общей калькуляции доходов.';
const lightingDerivedAllocationRefs = detailSourceRefs(
  lightingDocumentTotalsSource,
  lightingDocumentVatSource,
  lightingCalculationSource,
);
const lightingVatNeedsCheckNote =
  'Прямой НДС 547 489,58 в локальном расчете равен 5% от 10 949 791,70 до УСН; агрегированная смета 11 738 585 сходится с НДС 5% от доходов 11 179 605 из калькуляции.';

const lightingStreetPrimarySalaryResourceIds = [
  lightingStreetFixtureLaborResourceId,
  lightingStreetCableLaborResourceId,
] as const;
const lightingStreetMaterialResourceIds = [
  lightingStreetFixtureMaterialResourceId,
] as const;
const lightingStreetGrossResourceIds = [
  ...lightingStreetPrimarySalaryResourceIds,
  lightingStreetFixtureMaterialResourceId,
  lightingStreetInsuranceResourceId,
  lightingStreetOverheadResourceId,
  lightingStreetProfitResourceId,
  lightingStreetUsnResourceId,
  lightingStreetVatResourceId,
] as const;
const lightingElectricityGrossResourceIds = [
  lightingElectricityMaterialResourceId,
  lightingElectricityUsnResourceId,
  lightingElectricityVatResourceId,
] as const;
const lightingPolesGrossResourceIds = [
  lightingPolesPaintLaborResourceId,
  lightingPolesPaintMaterialResourceId,
  lightingPolesInsuranceResourceId,
  lightingPolesOverheadResourceId,
  lightingPolesProfitResourceId,
  lightingPolesUsnResourceId,
  lightingPolesVatResourceId,
] as const;
const lightingPowerSystemPrimarySalaryResourceIds = [
  lightingPowerSystemKtpKrnLaborResourceId,
  lightingPowerSystemTransformerLaborResourceId,
] as const;
const lightingPowerSystemGrossResourceIds = [
  ...lightingPowerSystemPrimarySalaryResourceIds,
  lightingPowerSystemInsuranceResourceId,
  lightingPowerSystemOverheadResourceId,
  lightingPowerSystemProfitResourceId,
  lightingPowerSystemUsnResourceId,
  lightingPowerSystemVatResourceId,
] as const;

const lightingWorkItems = [
  detailWorkItem({
    id: 'lighting-street-maintenance',
    title: 'Техническое обслуживание уличного освещения',
    estimate_row_id: 'lighting-street-maintenance',
    service_ids: ['year-round-power-lines-maintenance'],
    source_refs: detailSourceRefs(
      lightingProductionStreetSource,
      lightingStreetFixturePositionSource,
      lightingStreetCablePositionSource,
    ),
    ...detailStatus('verified'),
  }),
  detailWorkItem({
    id: 'lighting-electricity',
    title: 'Оплата электроэнергии на уличное освещение',
    estimate_row_id: 'lighting-electricity',
    source_refs: detailSourceRefs(
      lightingNormativeElectricitySource,
      lightingElectricityPositionSource,
    ),
    ...detailStatus('verified'),
  }),
  detailWorkItem({
    id: 'lighting-poles-repair',
    title: 'Текущий ремонт опор уличного освещения',
    estimate_row_id: 'lighting-poles-repair',
    source_refs: detailSourceRefs(
      lightingProductionPolesSource,
      lightingPolesPositionSource,
      lightingPolesTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailWorkItem({
    id: 'lighting-power-system-repair',
    title: 'Текущий ремонт системы электроснабжения',
    estimate_row_id: 'lighting-power-system-repair',
    service_ids: ['year-round-power-lines-maintenance'],
    source_refs: detailSourceRefs(
      lightingProductionPowerKtpSource,
      lightingProductionPowerTransformerSource,
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
    ),
    ...detailStatus('verified'),
  }),
] satisfies readonly EstimateDetailWorkItem[];

const lightingResources = [
  detailResource({
    id: lightingStreetFixtureLaborResourceId,
    work_item_id: 'lighting-street-maintenance',
    estimate_row_id: 'lighting-street-maintenance',
    kind: 'labor',
    title: 'Электромонтажник: обслуживание светильников наружного освещения',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(3_776.8, 'чел-час', { raw: '3776,8' }),
    unit_price_rub: detailMoney(664.15, { raw: '664,15' }),
    total_rub: detailMoney(2_508_335.23, { raw: '2 508 335,23' }),
    source_refs: detailSourceRefs(
      lightingProductionStreetSource,
      lightingStreetFixturePositionSource,
      lightingResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingStreetCableLaborResourceId,
    work_item_id: 'lighting-street-maintenance',
    estimate_row_id: 'lighting-street-maintenance',
    kind: 'labor',
    title: 'Электромонтажник: обслуживание кабельных сетей',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(62.6, 'чел-час', { raw: '62,6' }),
    unit_price_rub: detailMoney(664.15, { raw: '664,15' }),
    total_rub: detailMoney(41_578.18, { raw: '41 578,18' }),
    source_refs: detailSourceRefs(
      lightingProductionStreetSource,
      lightingStreetCablePositionSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingStreetFixtureMaterialResourceId,
    work_item_id: 'lighting-street-maintenance',
    estimate_row_id: 'lighting-street-maintenance',
    kind: 'material',
    title: 'Уличный светильник ЖКУ 16-100-001 для замены',
    cost_bucket: 'materials',
    quantity: detailQuantity(146, 'шт.', { raw: '146,0' }),
    unit_price_rub: detailMoney(670, { raw: '670,00' }),
    total_rub: detailMoney(97_820, { raw: '97 820,00' }),
    source_refs: detailSourceRefs(
      lightingProductionStreetSource,
      lightingNormativeMaterialsSource,
      lightingStreetFixtureMaterialSource,
      lightingResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingStreetInsuranceResourceId,
    work_item_id: 'lighting-street-maintenance',
    estimate_row_id: 'lighting-street-maintenance',
    kind: 'other_cost',
    title: 'Страховые взносы по обслуживанию светильников и кабельных сетей',
    cost_bucket: 'insurance',
    total_rub: detailMoney(770_073.85, {
      raw: '757 517,24 + 12 556,61',
    }),
    source_refs: detailSourceRefs(
      lightingStreetFixtureMaterialSource,
      lightingStreetCablePositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingStreetOverheadResourceId,
    work_item_id: 'lighting-street-maintenance',
    estimate_row_id: 'lighting-street-maintenance',
    kind: 'other_cost',
    title:
      'Общеэксплуатационные расходы по обслуживанию светильников и кабельных сетей',
    cost_bucket: 'overhead',
    total_rub: detailMoney(1_784_939.39, {
      raw: '1 755 834,66 + 29 104,73',
    }),
    source_refs: detailSourceRefs(
      lightingStreetFixtureMaterialSource,
      lightingStreetCablePositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingStreetProfitResourceId,
    work_item_id: 'lighting-street-maintenance',
    estimate_row_id: 'lighting-street-maintenance',
    kind: 'other_cost',
    title: 'Прибыль по обслуживанию светильников и кабельных сетей',
    cost_bucket: 'profit',
    total_rub: detailMoney(1_019_965.36, {
      raw: '1 003 334,09 + 16 631,27',
    }),
    source_refs: detailSourceRefs(
      lightingStreetFixtureMaterialSource,
      lightingStreetCablePositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingStreetUsnResourceId,
    work_item_id: 'lighting-street-maintenance',
    estimate_row_id: 'lighting-street-maintenance',
    kind: 'other_cost',
    title: 'Расчетная доля УСН по обслуживанию уличного освещения',
    cost_bucket: 'usn',
    total_rub: detailMoney(130_601.32, {
      raw: '6 353 313,33 - 6 222 712,01',
      note: 'выведено из строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      lightingStreetFixturePositionSource,
      lightingStreetCablePositionSource,
      lightingCalculationSource,
    ),
    note: 'В lighting.pdf УСН показан только общей суммой по услуге, без распределения по строкам.',
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: lightingStreetVatResourceId,
    work_item_id: 'lighting-street-maintenance',
    estimate_row_id: 'lighting-street-maintenance',
    kind: 'other_cost',
    title: 'Расчетный НДС 5% по обслуживанию уличного освещения',
    cost_bucket: 'vat',
    total_rub: detailMoney(317_665.67, {
      raw: '6 670 979 - 6 353 313,33',
      note: 'выведено из строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: lightingElectricityMaterialResourceId,
    work_item_id: 'lighting-electricity',
    estimate_row_id: 'lighting-electricity',
    kind: 'material',
    title: 'Электроэнергия на уличное освещение',
    cost_bucket: 'materials',
    quantity: detailQuantity(218_457.5, 'кВт*час', { raw: '218457,5' }),
    unit_price_rub: detailMoney(6.29, { raw: '6,29' }),
    total_rub: detailMoney(1_374_097.6, { raw: '1 374 097,60' }),
    source_refs: detailSourceRefs(
      lightingNormativeElectricitySource,
      lightingElectricityPositionSource,
      lightingResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingElectricityUsnResourceId,
    work_item_id: 'lighting-electricity',
    estimate_row_id: 'lighting-electricity',
    kind: 'other_cost',
    title: 'Расчетная доля УСН по электроэнергии уличного освещения',
    cost_bucket: 'usn',
    total_rub: detailMoney(28_839.54, {
      raw: '1 402 937,14 - 1 374 097,60',
      note: 'выведено из строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      lightingElectricityPositionSource,
      lightingCalculationSource,
    ),
    note: 'В lighting.pdf УСН показан только общей суммой по услуге, без распределения по строкам.',
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: lightingElectricityVatResourceId,
    work_item_id: 'lighting-electricity',
    estimate_row_id: 'lighting-electricity',
    kind: 'other_cost',
    title: 'Расчетный НДС 5% по электроэнергии уличного освещения',
    cost_bucket: 'vat',
    total_rub: detailMoney(70_146.86, {
      raw: '1 473 084 - 1 402 937,14',
      note: 'выведено из строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: lightingPolesPaintLaborResourceId,
    work_item_id: 'lighting-poles-repair',
    estimate_row_id: 'lighting-poles-repair',
    kind: 'labor',
    title: 'Электромонтажник: окраска металлических поверхностей опор',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(334.4, 'чел-час', { raw: '334,4' }),
    unit_price_rub: detailMoney(664.15, { raw: '664,15' }),
    total_rub: detailMoney(222_066.98, { raw: '222 066,98' }),
    source_refs: detailSourceRefs(
      lightingProductionPolesSource,
      lightingPolesPositionSource,
      lightingResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingPolesPaintMaterialResourceId,
    work_item_id: 'lighting-poles-repair',
    estimate_row_id: 'lighting-poles-repair',
    kind: 'material',
    title: 'Краска по металлу кузнечная «Церта» черная матовая',
    cost_bucket: 'materials',
    quantity: detailQuantity(453.4, 'кг.', {
      raw: '453,4',
      note: 'количество показано с одним десятичным знаком; сумма взята из строки локального расчета',
    }),
    unit_price_rub: detailMoney(612.5, { raw: '612,50' }),
    total_rub: detailMoney(277_692.8, { raw: '277 692,80' }),
    source_refs: detailSourceRefs(
      lightingProductionPolesSource,
      lightingPolesPositionSource,
      lightingResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingPolesInsuranceResourceId,
    work_item_id: 'lighting-poles-repair',
    estimate_row_id: 'lighting-poles-repair',
    kind: 'other_cost',
    title: 'Страховые взносы по ремонту опор уличного освещения',
    cost_bucket: 'insurance',
    total_rub: detailMoney(67_064.23, { raw: '67 064,23' }),
    source_refs: detailSourceRefs(lightingPolesTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingPolesOverheadResourceId,
    work_item_id: 'lighting-poles-repair',
    estimate_row_id: 'lighting-poles-repair',
    kind: 'other_cost',
    title: 'Общеэксплуатационные расходы по ремонту опор уличного освещения',
    cost_bucket: 'overhead',
    total_rub: detailMoney(155_446.88, { raw: '155 446,88' }),
    source_refs: detailSourceRefs(lightingPolesTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingPolesProfitResourceId,
    work_item_id: 'lighting-poles-repair',
    estimate_row_id: 'lighting-poles-repair',
    kind: 'other_cost',
    title: 'Прибыль по ремонту опор уличного освещения',
    cost_bucket: 'profit',
    total_rub: detailMoney(88_826.79, { raw: '88 826,79' }),
    source_refs: detailSourceRefs(lightingPolesTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingPolesUsnResourceId,
    work_item_id: 'lighting-poles-repair',
    estimate_row_id: 'lighting-poles-repair',
    kind: 'other_cost',
    title: 'Расчетная доля УСН по ремонту опор уличного освещения',
    cost_bucket: 'usn',
    total_rub: detailMoney(17_023.27, {
      raw: '828 120,95 - 811 097,68',
      note: 'выведено из строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      lightingPolesTotalsSource,
      lightingCalculationSource,
    ),
    note: 'В lighting.pdf УСН показан только общей суммой по услуге, без распределения по строкам.',
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: lightingPolesVatResourceId,
    work_item_id: 'lighting-poles-repair',
    estimate_row_id: 'lighting-poles-repair',
    kind: 'other_cost',
    title: 'Расчетный НДС 5% по ремонту опор уличного освещения',
    cost_bucket: 'vat',
    total_rub: detailMoney(41_406.05, {
      raw: '869 527 - 828 120,95',
      note: 'выведено из строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: lightingPowerSystemKtpKrnLaborResourceId,
    work_item_id: 'lighting-power-system-repair',
    estimate_row_id: 'lighting-power-system-repair',
    kind: 'labor',
    title: 'Электромонтажник: техническое обслуживание КТП и КРН',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(1_466.6, 'чел-час', { raw: '1466,6' }),
    unit_price_rub: detailMoney(664.15, { raw: '664,15' }),
    total_rub: detailMoney(974_022.95, { raw: '974 022,95' }),
    source_refs: detailSourceRefs(
      lightingProductionPowerKtpSource,
      lightingPowerKtpPositionSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingPowerSystemTransformerLaborResourceId,
    work_item_id: 'lighting-power-system-repair',
    estimate_row_id: 'lighting-power-system-repair',
    kind: 'labor',
    title: 'Электромонтажник: техническое обслуживание трансформаторов 10кВ',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(126.8, 'чел-час', { raw: '126,8' }),
    unit_price_rub: detailMoney(664.15, { raw: '664,15' }),
    total_rub: detailMoney(84_213.69, { raw: '84 213,69' }),
    source_refs: detailSourceRefs(
      lightingProductionPowerTransformerSource,
      lightingPowerTransformerPositionSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingPowerSystemInsuranceResourceId,
    work_item_id: 'lighting-power-system-repair',
    estimate_row_id: 'lighting-power-system-repair',
    kind: 'other_cost',
    title: 'Страховые взносы по ремонту системы электроснабжения',
    cost_bucket: 'insurance',
    total_rub: detailMoney(319_587.46, {
      raw: '294 154,93 + 25 432,53',
    }),
    source_refs: detailSourceRefs(
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingPowerSystemOverheadResourceId,
    work_item_id: 'lighting-power-system-repair',
    estimate_row_id: 'lighting-power-system-repair',
    kind: 'other_cost',
    title: 'Общеэксплуатационные расходы по ремонту системы электроснабжения',
    cost_bucket: 'overhead',
    total_rub: detailMoney(740_765.64, {
      raw: '681 816,06 + 58 949,58',
    }),
    source_refs: detailSourceRefs(
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingPowerSystemProfitResourceId,
    work_item_id: 'lighting-power-system-repair',
    estimate_row_id: 'lighting-power-system-repair',
    kind: 'other_cost',
    title: 'Прибыль по ремонту системы электроснабжения',
    cost_bucket: 'profit',
    total_rub: detailMoney(423_294.65, {
      raw: '389 609,18 + 33 685,47',
    }),
    source_refs: detailSourceRefs(
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: lightingPowerSystemUsnResourceId,
    work_item_id: 'lighting-power-system-repair',
    estimate_row_id: 'lighting-power-system-repair',
    kind: 'other_cost',
    title: 'Расчетная доля УСН по ремонту системы электроснабжения',
    cost_bucket: 'usn',
    total_rub: detailMoney(53_348.94, {
      raw: '2 595 233,33 - 2 541 884,39',
      note: 'выведено из строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
      lightingCalculationSource,
    ),
    note: 'В lighting.pdf УСН показан только общей суммой по услуге, без распределения по строкам.',
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: lightingPowerSystemVatResourceId,
    work_item_id: 'lighting-power-system-repair',
    estimate_row_id: 'lighting-power-system-repair',
    kind: 'other_cost',
    title: 'Расчетный НДС 5% по ремонту системы электроснабжения',
    cost_bucket: 'vat',
    total_rub: detailMoney(129_761.67, {
      raw: '2 724 995 - 2 595 233,33',
      note: 'выведено из строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
] satisfies readonly EstimateDetailResource[];

const lightingControlTotals = [
  detailControlTotal({
    id: 'lighting-street-primary-salary',
    estimate_row_id: 'lighting-street-maintenance',
    cost_bucket: 'primary_salary',
    source_total_rub: detailMoney(2_549_913.41, {
      raw: '2 508 335,23 + 41 578,18',
    }),
    detail_total_rub: detailMoney(2_549_913.41),
    aggregate_total_rub: detailMoney(2_549_913.41),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: lightingStreetPrimarySalaryResourceIds,
    source_refs: detailSourceRefs(
      lightingStreetFixturePositionSource,
      lightingStreetCablePositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-street-materials',
    estimate_row_id: 'lighting-street-maintenance',
    cost_bucket: 'materials',
    source_total_rub: detailMoney(97_820, { raw: '97 820,00' }),
    detail_total_rub: detailMoney(97_820, { raw: '97 820,00' }),
    aggregate_total_rub: detailMoney(97_820),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: lightingStreetMaterialResourceIds,
    source_refs: detailSourceRefs(
      lightingStreetFixtureMaterialSource,
      lightingResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-street-insurance',
    estimate_row_id: 'lighting-street-maintenance',
    cost_bucket: 'insurance',
    source_total_rub: detailMoney(770_073.85, {
      raw: '757 517,24 + 12 556,61',
    }),
    detail_total_rub: detailMoney(770_073.85),
    aggregate_total_rub: detailMoney(770_073.85),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingStreetInsuranceResourceId],
    source_refs: detailSourceRefs(
      lightingStreetFixtureMaterialSource,
      lightingStreetCablePositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-street-overhead',
    estimate_row_id: 'lighting-street-maintenance',
    cost_bucket: 'overhead',
    source_total_rub: detailMoney(1_784_939.39, {
      raw: '1 755 834,66 + 29 104,73',
    }),
    detail_total_rub: detailMoney(1_784_939.39),
    aggregate_total_rub: detailMoney(1_784_939.39),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingStreetOverheadResourceId],
    source_refs: detailSourceRefs(
      lightingStreetFixtureMaterialSource,
      lightingStreetCablePositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-street-profit',
    estimate_row_id: 'lighting-street-maintenance',
    cost_bucket: 'profit',
    source_total_rub: detailMoney(1_019_965.36, {
      raw: '1 003 334,09 + 16 631,27',
    }),
    detail_total_rub: detailMoney(1_019_965.36),
    aggregate_total_rub: detailMoney(1_019_965.36),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingStreetProfitResourceId],
    source_refs: detailSourceRefs(
      lightingStreetFixtureMaterialSource,
      lightingStreetCablePositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-street-usn',
    estimate_row_id: 'lighting-street-maintenance',
    cost_bucket: 'usn',
    source_total_rub: detailMoney(130_601.32, {
      raw: '6 353 313,33 - 6 222 712,01',
    }),
    detail_total_rub: detailMoney(130_601.32),
    aggregate_total_rub: detailMoney(130_601.32),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingStreetUsnResourceId],
    source_refs: detailSourceRefs(
      lightingDocumentTotalsSource,
      lightingCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-street-vat',
    estimate_row_id: 'lighting-street-maintenance',
    cost_bucket: 'vat',
    source_total_rub: detailMoney(317_665.67, {
      raw: '6 670 979 - 6 353 313,33',
    }),
    detail_total_rub: detailMoney(317_665.67),
    aggregate_total_rub: detailMoney(317_665.67),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingStreetVatResourceId],
    source_refs: detailSourceRefs(
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-street-gross',
    estimate_row_id: 'lighting-street-maintenance',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(6_670_979, {
      raw: '6 222 712,01 + 130 601,32 + 317 665,67',
    }),
    detail_total_rub: detailMoney(6_670_979),
    aggregate_total_rub: detailMoney(6_670_979),
    delta_rub: 0,
    tolerance_rub: 1,
    resource_ids: lightingStreetGrossResourceIds,
    source_refs: detailSourceRefs(
      lightingDocumentTotalsSource,
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-electricity-materials',
    estimate_row_id: 'lighting-electricity',
    cost_bucket: 'materials',
    source_total_rub: detailMoney(1_374_097.6, { raw: '1 374 097,60' }),
    detail_total_rub: detailMoney(1_374_097.6, { raw: '1 374 097,60' }),
    aggregate_total_rub: detailMoney(1_374_097.6),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingElectricityMaterialResourceId],
    source_refs: detailSourceRefs(
      lightingElectricityPositionSource,
      lightingResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-electricity-usn',
    estimate_row_id: 'lighting-electricity',
    cost_bucket: 'usn',
    source_total_rub: detailMoney(28_839.54, {
      raw: '1 402 937,14 - 1 374 097,60',
    }),
    detail_total_rub: detailMoney(28_839.54),
    aggregate_total_rub: detailMoney(28_839.54),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingElectricityUsnResourceId],
    source_refs: detailSourceRefs(
      lightingElectricityPositionSource,
      lightingCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-electricity-vat',
    estimate_row_id: 'lighting-electricity',
    cost_bucket: 'vat',
    source_total_rub: detailMoney(70_146.86, {
      raw: '1 473 084 - 1 402 937,14',
    }),
    detail_total_rub: detailMoney(70_146.86),
    aggregate_total_rub: detailMoney(70_146.86),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingElectricityVatResourceId],
    source_refs: detailSourceRefs(
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-electricity-gross',
    estimate_row_id: 'lighting-electricity',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(1_473_084, {
      raw: '1 374 097,60 + 28 839,54 + 70 146,86',
    }),
    detail_total_rub: detailMoney(1_473_084),
    aggregate_total_rub: detailMoney(1_473_084),
    delta_rub: 0,
    tolerance_rub: 1,
    resource_ids: lightingElectricityGrossResourceIds,
    source_refs: detailSourceRefs(
      lightingElectricityPositionSource,
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-poles-primary-salary',
    estimate_row_id: 'lighting-poles-repair',
    cost_bucket: 'primary_salary',
    source_total_rub: detailMoney(222_066.98, { raw: '222 066,98' }),
    detail_total_rub: detailMoney(222_066.98, { raw: '222 066,98' }),
    aggregate_total_rub: detailMoney(222_066.98),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPolesPaintLaborResourceId],
    source_refs: detailSourceRefs(
      lightingPolesPositionSource,
      lightingResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-poles-materials',
    estimate_row_id: 'lighting-poles-repair',
    cost_bucket: 'materials',
    source_total_rub: detailMoney(277_692.8, { raw: '277 692,80' }),
    detail_total_rub: detailMoney(277_692.8, { raw: '277 692,80' }),
    aggregate_total_rub: detailMoney(277_692.8),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPolesPaintMaterialResourceId],
    source_refs: detailSourceRefs(
      lightingPolesPositionSource,
      lightingResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-poles-insurance',
    estimate_row_id: 'lighting-poles-repair',
    cost_bucket: 'insurance',
    source_total_rub: detailMoney(67_064.23, { raw: '67 064,23' }),
    detail_total_rub: detailMoney(67_064.23, { raw: '67 064,23' }),
    aggregate_total_rub: detailMoney(67_064.23),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPolesInsuranceResourceId],
    source_refs: detailSourceRefs(lightingPolesTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-poles-overhead',
    estimate_row_id: 'lighting-poles-repair',
    cost_bucket: 'overhead',
    source_total_rub: detailMoney(155_446.88, { raw: '155 446,88' }),
    detail_total_rub: detailMoney(155_446.88, { raw: '155 446,88' }),
    aggregate_total_rub: detailMoney(155_446.88),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPolesOverheadResourceId],
    source_refs: detailSourceRefs(lightingPolesTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-poles-profit',
    estimate_row_id: 'lighting-poles-repair',
    cost_bucket: 'profit',
    source_total_rub: detailMoney(88_826.79, { raw: '88 826,79' }),
    detail_total_rub: detailMoney(88_826.79, { raw: '88 826,79' }),
    aggregate_total_rub: detailMoney(88_826.79),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPolesProfitResourceId],
    source_refs: detailSourceRefs(lightingPolesTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-poles-usn',
    estimate_row_id: 'lighting-poles-repair',
    cost_bucket: 'usn',
    source_total_rub: detailMoney(17_023.27, {
      raw: '828 120,95 - 811 097,68',
    }),
    detail_total_rub: detailMoney(17_023.27),
    aggregate_total_rub: detailMoney(17_023.27),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPolesUsnResourceId],
    source_refs: detailSourceRefs(
      lightingPolesTotalsSource,
      lightingCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-poles-vat',
    estimate_row_id: 'lighting-poles-repair',
    cost_bucket: 'vat',
    source_total_rub: detailMoney(41_406.05, {
      raw: '869 527 - 828 120,95',
    }),
    detail_total_rub: detailMoney(41_406.05),
    aggregate_total_rub: detailMoney(41_406.05),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPolesVatResourceId],
    source_refs: detailSourceRefs(
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-poles-gross',
    estimate_row_id: 'lighting-poles-repair',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(869_527, {
      raw: '811 097,68 + 17 023,27 + 41 406,05',
    }),
    detail_total_rub: detailMoney(869_527),
    aggregate_total_rub: detailMoney(869_527),
    delta_rub: 0,
    tolerance_rub: 1,
    resource_ids: lightingPolesGrossResourceIds,
    source_refs: detailSourceRefs(
      lightingPolesTotalsSource,
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-power-system-primary-salary',
    estimate_row_id: 'lighting-power-system-repair',
    cost_bucket: 'primary_salary',
    source_total_rub: detailMoney(1_058_236.64, {
      raw: '974 022,95 + 84 213,69',
    }),
    detail_total_rub: detailMoney(1_058_236.64),
    aggregate_total_rub: detailMoney(1_058_236.64),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: lightingPowerSystemPrimarySalaryResourceIds,
    source_refs: detailSourceRefs(
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-power-system-insurance',
    estimate_row_id: 'lighting-power-system-repair',
    cost_bucket: 'insurance',
    source_total_rub: detailMoney(319_587.46, {
      raw: '294 154,93 + 25 432,53',
    }),
    detail_total_rub: detailMoney(319_587.46),
    aggregate_total_rub: detailMoney(319_587.46),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPowerSystemInsuranceResourceId],
    source_refs: detailSourceRefs(
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-power-system-overhead',
    estimate_row_id: 'lighting-power-system-repair',
    cost_bucket: 'overhead',
    source_total_rub: detailMoney(740_765.64, {
      raw: '681 816,06 + 58 949,58',
    }),
    detail_total_rub: detailMoney(740_765.64),
    aggregate_total_rub: detailMoney(740_765.64),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPowerSystemOverheadResourceId],
    source_refs: detailSourceRefs(
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-power-system-profit',
    estimate_row_id: 'lighting-power-system-repair',
    cost_bucket: 'profit',
    source_total_rub: detailMoney(423_294.65, {
      raw: '389 609,18 + 33 685,47',
    }),
    detail_total_rub: detailMoney(423_294.65),
    aggregate_total_rub: detailMoney(423_294.65),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPowerSystemProfitResourceId],
    source_refs: detailSourceRefs(
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
      lightingDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'lighting-power-system-usn',
    estimate_row_id: 'lighting-power-system-repair',
    cost_bucket: 'usn',
    source_total_rub: detailMoney(53_348.94, {
      raw: '2 595 233,33 - 2 541 884,39',
    }),
    detail_total_rub: detailMoney(53_348.94),
    aggregate_total_rub: detailMoney(53_348.94),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPowerSystemUsnResourceId],
    source_refs: detailSourceRefs(
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
      lightingCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-power-system-vat',
    estimate_row_id: 'lighting-power-system-repair',
    cost_bucket: 'vat',
    source_total_rub: detailMoney(129_761.67, {
      raw: '2 724 995 - 2 595 233,33',
    }),
    detail_total_rub: detailMoney(129_761.67),
    aggregate_total_rub: detailMoney(129_761.67),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [lightingPowerSystemVatResourceId],
    source_refs: detailSourceRefs(
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'lighting-power-system-gross',
    estimate_row_id: 'lighting-power-system-repair',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(2_724_995, {
      raw: '2 541 884,39 + 53 348,94 + 129 761,67',
    }),
    detail_total_rub: detailMoney(2_724_995),
    aggregate_total_rub: detailMoney(2_724_995),
    delta_rub: 0,
    tolerance_rub: 1,
    resource_ids: lightingPowerSystemGrossResourceIds,
    source_refs: detailSourceRefs(
      lightingPowerKtpPositionSource,
      lightingPowerTransformerPositionSource,
      lightingDocumentVatSource,
      lightingCalculationSource,
    ),
    note: lightingVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      lightingDerivedAllocationNeedsCheckReason,
      lightingDerivedAllocationRefs,
    ),
  }),
] satisfies readonly EstimateDetailControlTotal[];

const securityAccessControlChopResourceId =
  'security-access-control-chop-service';
const securityAccessControlKppMaterialsResourceId =
  'security-access-control-kpp-materials';
const securityAccessControlUsnResourceId = 'security-access-control-usn';
const securityAccessControlVatResourceId =
  'security-access-control-vat-derived';
const securityEquipmentVideoLaborResourceId = 'security-equipment-video-labor';
const securityEquipmentVideoCamerasResourceId =
  'security-equipment-video-cameras';
const securityEquipmentMonitorLaborResourceId =
  'security-equipment-monitor-labor';
const securityEquipmentServerPowerLaborResourceId =
  'security-equipment-server-power-labor';
const securityEquipmentSkudLaborResourceId = 'security-equipment-skud-labor';
const securityEquipmentBarrierContractorResourceId =
  'security-equipment-barrier-contractor';
const securityEquipmentDomilendContractorResourceId =
  'security-equipment-domilend-contractor';
const securityEquipmentInsuranceResourceId = 'security-equipment-insurance';
const securityEquipmentOverheadResourceId = 'security-equipment-overhead';
const securityEquipmentProfitResourceId = 'security-equipment-profit';
const securityEquipmentUsnResourceId = 'security-equipment-usn';
const securityEquipmentVatResourceId = 'security-equipment-vat-derived';
const securityDispatchLaborResourceId = 'security-dispatch-labor';
const securityDispatchInsuranceResourceId = 'security-dispatch-insurance';
const securityDispatchOverheadResourceId = 'security-dispatch-overhead';
const securityDispatchProfitResourceId = 'security-dispatch-profit';
const securityDispatchUsnResourceId = 'security-dispatch-usn';
const securityDispatchVatResourceId = 'security-dispatch-vat-derived';

const securityProductionAccessSource = detailSource(
  'security',
  1,
  'производственная программа / круглосуточный пропускной режим',
  {
    quote:
      'Услуги по круглосуточной охране поселка стационарными постами ... периодический обход/объезд территории поселка - 4 стационарных круглосуточных поста; пост; I-XII; 365; 4,0',
  },
);

const securityProductionEquipmentSource = detailSource(
  'security',
  2,
  'производственная программа / техническое обслуживание средств охраны',
  {
    quote:
      'видеокамеры 34,0; трудозатраты 584,1; мониторы 3,0; блок питания сервера 3,0; СКУД TRASSIR 5,0; шлагбаум 3,0',
  },
);

const securityProductionDomilendDispatchSource = detailSource(
  'security',
  3,
  'производственная программа / Домиленд и диспетчерское обслуживание',
  {
    quote:
      'Обслуживание СРМ "Домиленд" ... 1,0 ... 11215; Оказание круглосуточных услуг по приему заявок ... 365; 1,4; 2826,5',
  },
);

const securityStaffSource = detailSource(
  'security',
  4,
  'нормативное штатное расписание по охране',
  {
    quote:
      'Техник по обслуживанию слаботочных систем ... 3,2 ... 749,01; Диспетчер ... 1,4 ... 559,81',
  },
);

const securityAccessChopSource = detailSource(
  'security',
  5,
  'позиция 1.1 / услуги сторонней организации по охране',
  {
    quote: 'Договорная цена; плата в месяц; 12,0; 720000,00; 8 640 000,00',
  },
);

const securityAccessMaterialsSource = detailSource(
  'security',
  6,
  'позиция 1.1 / материальные затраты на содержание КПП',
  {
    quote:
      'Материальные затраты на содержание КПП ... пост; 4,0; 252000,00; 1 008 000,00',
  },
);

const securityAccessTotalsSource = detailSource(
  'security',
  6,
  'итого по разделу круглосуточного пропускного режима',
  {
    quote:
      'Итого по разделу ... 9 648 000,00; 0,00; 0,00; 0,00; 8 640 000,00; 1 008 000,00',
  },
);

const securityEquipmentVideoSource = detailSource(
  'security',
  7,
  'позиция 2.1 / обслуживание видеонаблюдения и замена видеокамер',
  {
    quote:
      '584,1; 749,01; 437 513,59; Видеокамера; шт.; 2,0; 5000,00; 10 000,00; ИТОГО ПО ПОЗИЦИИ 1 060 907,64',
  },
);

const securityEquipmentMonitorSource = detailSource(
  'security',
  8,
  'позиция 2.2 / обслуживание монитора',
  {
    quote:
      'Затраты труда ... 38,6; 749,01; 28 919,40; ИТОГО ПО ПОЗИЦИИ 69 464,40',
  },
);

const securityEquipmentServerPowerSource = detailSource(
  'security',
  8,
  'позиция 2.3 / обслуживание блока питания сервера',
  {
    quote:
      'Затраты труда ... 14,0; 749,01; 10 516,15; ИТОГО ПО ПОЗИЦИИ 25 259,79',
  },
);

const securityEquipmentSkudSource = detailSource(
  'security',
  9,
  'позиция 3.1 / обслуживание системы СКУД TRASSIR',
  {
    quote:
      'Затраты труда ... 35,1; 749,01; 26 252,91; ИТОГО ПО ПОЗИЦИИ 63 059,49',
  },
);

const securityEquipmentBarrierSource = detailSource(
  'security',
  9,
  'позиция 4.1 / обслуживание автоматического гидравлического шлагбаума',
  {
    quote: 'Договорная цена; мес; 12,0; 30000,00; 360 000,00',
  },
);

const securityEquipmentDomilendSource = detailSource(
  'security',
  10,
  'позиция 5.1 / обслуживание CRM Домиленд',
  {
    quote: 'Договорная цена; мес; 12,0; 11215,38; 134 584,56',
  },
);

const securityEquipmentTotalsSource = detailSource(
  'security',
  10,
  'итого по разделу технического обслуживания средств охраны',
  {
    quote:
      'Итого по разделу ... 1 713 275,88; 503 202,05; 0,00; 0,00; 494 584,56; 10 000,00',
  },
);

const securityDispatchPositionSource = detailSource(
  'security',
  11,
  'позиция 6.1 / диспетчерское обслуживание',
  {
    quote:
      'Затраты труда Диспетчер ... 2826,5; 382,09; 1 080 000,00; Итого по разделу ... 2 594 160,00',
  },
);

const securityDocumentTotalsSource = detailSource(
  'security',
  12,
  'итого по услуге охраны в локальном ресурсном сметном расчете',
  {
    quote:
      'Итого по услуге ... 13 955 435,88; Основная зарплата 1 583 202,05; Услуги сторонних организаций 9 134 584,56; Материальные затраты 1 018 000,00; НДС 5% 697 771,79',
  },
);

const securityCalculationSource = detailSource(
  'security',
  13,
  'калькуляция себестоимости услуг по охране',
  {
    quote:
      'ИТОГО расходов 13 322 155; налог по УСН 94 992; прибыль ... 633 281; Доходов - всего 14 050 428',
  },
);

const securityDerivedAllocationNeedsCheckReason =
  'security.pdf не показывает распределение УСН и НДС по трем строкам охраны; значения выведены из gross-строк estimate-2026 и общей калькуляции доходов.';
const securityDerivedAllocationRefs = detailSourceRefs(
  securityDocumentTotalsSource,
  securityCalculationSource,
);

const wasteOperatorRegionalOperatorResourceId =
  'waste-operator-regional-operator-service';
const wasteOperatorMaterialsCalculationResourceId =
  'waste-operator-materials-calculation-row';
const wasteOperatorVatResourceId = 'waste-operator-vat';
const wasteTransferWorkerLaborResourceId = 'waste-transfer-worker-labor';
const wasteTransferMachinistLaborResourceId = 'waste-transfer-machinist-labor';
const wasteTransferGazelMachineResourceId = 'waste-transfer-gazel-machine';
const wasteTransferWorkerInsuranceResourceId =
  'waste-transfer-worker-insurance';
const wasteTransferMachinistInsuranceResourceId =
  'waste-transfer-machinist-insurance';
const wasteTransferWorkerOverheadResourceId = 'waste-transfer-worker-overhead';
const wasteTransferMachinistOverheadResourceId =
  'waste-transfer-machinist-overhead';
const wasteTransferWorkerProfitResourceId = 'waste-transfer-worker-profit';
const wasteTransferMachinistProfitResourceId =
  'waste-transfer-machinist-profit';
const wasteTransferUsnResourceId = 'waste-transfer-usn';
const wasteTransferVatDocumentResourceId = 'waste-transfer-vat-document';
const wasteTransferVatDerivedResourceId = 'waste-transfer-vat-derived';

const wasteOperatorProductionProgramSource = detailSource(
  'waste',
  1,
  'производственная программа по услуге организации работы с РО',
  {
    quote:
      'Организация сбора ТКО и их передача Региональному оператору; м³; I-XII; 365; 6201,6; руб./м³ 1229,2',
  },
);

const wasteOperatorNormativeVolumeSource = detailSource(
  'waste',
  2,
  'нормативный расчет накопления ТКО для ИЖД',
  {
    quote:
      'Индивидуальные жилые дома; 120; 1 968; 0,1000; 0,5252; 12 403; 0,50; 6 202',
  },
);

const wasteOperatorContractorSource = detailSource(
  'waste',
  3,
  'локальный ресурсный сметный расчет / услуги сторонних организаций',
  {
    quote: 'Договорная цена; м³; 6201,6; 1229,24; 7 623 207,58',
  },
);

const wasteOperatorDocumentTotalsSource = detailSource(
  'waste',
  4,
  'итоги локального ресурсного сметного расчета по работе с РО',
  {
    quote:
      'Услуги сторонних организаций 7 623 207,58; ВСЕГО по документу 7 623 207,58; НДС 5% 381 160,38',
  },
);

const wasteOperatorCalculationSource = detailSource(
  'waste',
  5,
  'калькуляция стоимости услуг по работе с РО',
  {
    quote:
      'Организация работы с РО по вывозу мусора - всего 7 623 208; расходы на материальные ресурсы 7 623 208; расходы на оплату услуг сторонних организаций 0; Доходов - всего 7 623 208',
  },
);

const wasteTransferProductionProgramSource = detailSource(
  'waste',
  6,
  'производственная программа по перемещению мусора',
  {
    quote:
      'Погрузка грунта вручную ... 100 м³; 365; 62,0; 5147,3; Перевозка грузов ... Газель (GAZ 330232); 1460',
  },
);

const wasteTransferNormativeVolumeSource = detailSource(
  'waste',
  7,
  'нормативный расчет накопления ТКО для перемещения мусора',
  {
    quote:
      'Индивидуальные жилые дома; 120; 1 968; 0,1000; 0,5252; 12 403; 0,5; 6 202',
  },
);

const wasteTransferStaffSource = detailSource(
  'waste',
  8,
  'нормативное штатное расписание для перемещения мусора',
  {
    quote:
      'Рабочий по уборке территории ... 2,6 ... 664,15; Машинист 0,7 ... 934,32',
  },
);

const wasteTransferWorkerPositionSource = detailSource(
  'waste',
  9,
  'позиция 1.1 локального ресурсного сметного расчета',
  {
    quote:
      'Погрузка грунта вручную ... 62,02; 3 418 555,10; Трудозатраты рабочих 5147',
  },
);

const wasteTransferMachinePositionSource = detailSource(
  'waste',
  10,
  'позиция 1.2 локального ресурсного сметного расчета',
  {
    quote:
      'Перевозка грузов ... 365,00; 1 828 410,62; машины 464303,42; зарплата машинистов 1364107,20; 1460',
  },
);

const wasteTransferDocumentTotalsSource = detailSource(
  'waste',
  11,
  'итоги локального ресурсного сметного расчета по перемещению мусора',
  {
    quote:
      'Прямые затраты 5 246 965,72; страховые взносы 1 444 364,01; общеэксплуатационные расходы 3 347 863,61; прибыль 1 913 064,92; ВСЕГО 11 952 258,27; НДС 5% 597 612,91',
  },
);

const wasteTransferResourceStatementSource = detailSource(
  'waste',
  12,
  'ресурсная ведомость по локальному ресурсному сметному расчету',
  {
    quote:
      'Рабочий ... 5147,3 664,15 3 418 555,10; Машинист 1460,0 934,32 1 364 107,20; Газель (GAZ 330232) 1460,0 318,02 464 303,42',
  },
);

const wasteTransferCalculationSource = detailSource(
  'waste',
  13,
  'калькуляция стоимости услуг по перемещению мусора',
  {
    quote:
      'ИТОГО расходов 10 039 193; налог по УСН 286 960; прибыль 1 913 065; Доходов - всего 12 239 217',
  },
);

const wasteOperatorContractorNeedsCheckRefs = detailSourceRefs(
  wasteOperatorContractorSource,
  wasteOperatorDocumentTotalsSource,
  wasteOperatorCalculationSource,
);

const wasteOperatorGrossResourceIds = [
  wasteOperatorRegionalOperatorResourceId,
  wasteOperatorVatResourceId,
] as const;

const wasteTransferPrimarySalaryResourceIds = [
  wasteTransferWorkerLaborResourceId,
] as const;
const wasteTransferMachinistSalaryResourceIds = [
  wasteTransferMachinistLaborResourceId,
] as const;
const wasteTransferMachineResourceIds = [
  wasteTransferGazelMachineResourceId,
] as const;
const wasteTransferInsuranceResourceIds = [
  wasteTransferWorkerInsuranceResourceId,
  wasteTransferMachinistInsuranceResourceId,
] as const;
const wasteTransferOverheadResourceIds = [
  wasteTransferWorkerOverheadResourceId,
  wasteTransferMachinistOverheadResourceId,
] as const;
const wasteTransferProfitResourceIds = [
  wasteTransferWorkerProfitResourceId,
  wasteTransferMachinistProfitResourceId,
] as const;
const wasteTransferGrossResourceIds = [
  wasteTransferWorkerLaborResourceId,
  wasteTransferMachinistLaborResourceId,
  wasteTransferGazelMachineResourceId,
  wasteTransferWorkerInsuranceResourceId,
  wasteTransferMachinistInsuranceResourceId,
  wasteTransferWorkerOverheadResourceId,
  wasteTransferMachinistOverheadResourceId,
  wasteTransferWorkerProfitResourceId,
  wasteTransferMachinistProfitResourceId,
  wasteTransferUsnResourceId,
  wasteTransferVatDerivedResourceId,
] as const;

const securityAccessControlContractorResourceIds = [
  securityAccessControlChopResourceId,
] as const;
const securityAccessControlMaterialResourceIds = [
  securityAccessControlKppMaterialsResourceId,
] as const;
const securityAccessControlGrossResourceIds = [
  securityAccessControlChopResourceId,
  securityAccessControlKppMaterialsResourceId,
  securityAccessControlUsnResourceId,
  securityAccessControlVatResourceId,
] as const;
const securityEquipmentPrimarySalaryResourceIds = [
  securityEquipmentVideoLaborResourceId,
  securityEquipmentMonitorLaborResourceId,
  securityEquipmentServerPowerLaborResourceId,
  securityEquipmentSkudLaborResourceId,
] as const;
const securityEquipmentMaterialResourceIds = [
  securityEquipmentVideoCamerasResourceId,
] as const;
const securityEquipmentContractorResourceIds = [
  securityEquipmentBarrierContractorResourceId,
  securityEquipmentDomilendContractorResourceId,
] as const;
const securityEquipmentGrossResourceIds = [
  ...securityEquipmentPrimarySalaryResourceIds,
  securityEquipmentVideoCamerasResourceId,
  ...securityEquipmentContractorResourceIds,
  securityEquipmentInsuranceResourceId,
  securityEquipmentOverheadResourceId,
  securityEquipmentProfitResourceId,
  securityEquipmentUsnResourceId,
  securityEquipmentVatResourceId,
] as const;
const securityDispatchGrossResourceIds = [
  securityDispatchLaborResourceId,
  securityDispatchInsuranceResourceId,
  securityDispatchOverheadResourceId,
  securityDispatchProfitResourceId,
  securityDispatchUsnResourceId,
  securityDispatchVatResourceId,
] as const;

const securityWorkItems = [
  detailWorkItem({
    id: 'security-access-control',
    title:
      'Круглосуточный пропускной режим и поддержание внутриобъектного порядка',
    estimate_row_id: 'security-access-control',
    service_ids: ['year-round-access-control'],
    source_refs: detailSourceRefs(
      securityProductionAccessSource,
      securityAccessTotalsSource,
    ),
    note: 'security.pdf подтверждает периодический обход/объезд как часть услуги ЧОП, но не содержит километраж маршрута или кратность обходов в сутки. Эти показатели есть в слое полного регламента по имуществу, но они не перенесены в детальный слой, потому что их источник: full.pdf.',
    ...detailStatus('verified'),
  }),
  detailWorkItem({
    id: 'security-equipment-maintenance',
    title: 'Техническое обслуживание средств охраны',
    estimate_row_id: 'security-equipment-maintenance',
    source_refs: detailSourceRefs(
      securityProductionEquipmentSource,
      securityProductionDomilendDispatchSource,
      securityEquipmentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailWorkItem({
    id: 'security-dispatch',
    title: 'Диспетчерское обслуживание пропускного режима',
    estimate_row_id: 'security-dispatch',
    source_refs: detailSourceRefs(
      securityProductionDomilendDispatchSource,
      securityDispatchPositionSource,
    ),
    ...detailStatus('verified'),
  }),
] satisfies readonly EstimateDetailWorkItem[];

const securityResources = [
  detailResource({
    id: securityAccessControlChopResourceId,
    work_item_id: 'security-access-control',
    estimate_row_id: 'security-access-control',
    kind: 'contractor',
    title:
      'Услуги ЧОП: четыре круглосуточных стационарных поста с периодическим обходом/объездом',
    cost_bucket: 'contractors',
    quantity: detailQuantity(12, 'мес', { raw: '12,0' }),
    unit_price_rub: detailMoney(720_000, { raw: '720000,00' }),
    total_rub: detailMoney(8_640_000, { raw: '8 640 000,00' }),
    source_refs: detailSourceRefs(
      securityProductionAccessSource,
      securityAccessChopSource,
      securityAccessTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityAccessControlKppMaterialsResourceId,
    work_item_id: 'security-access-control',
    estimate_row_id: 'security-access-control',
    kind: 'material',
    title: 'Материальные затраты на содержание КПП',
    cost_bucket: 'materials',
    quantity: detailQuantity(4, 'поста', { raw: '4,0' }),
    unit_price_rub: detailMoney(252_000, { raw: '252000,00' }),
    total_rub: detailMoney(1_008_000, { raw: '1 008 000,00' }),
    source_refs: detailSourceRefs(
      securityProductionAccessSource,
      securityAccessMaterialsSource,
      securityAccessTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityAccessControlUsnResourceId,
    work_item_id: 'security-access-control',
    estimate_row_id: 'security-access-control',
    kind: 'other_cost',
    title: 'Расчетная доля УСН по пропускному режиму',
    cost_bucket: 'usn',
    total_rub: detailMoney(65_672.38, {
      raw: '9 713 672,38 - 9 648 000,00',
      note: 'выведено из gross строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      securityAccessTotalsSource,
      securityCalculationSource,
    ),
    note: 'В security.pdf УСН показан только общей суммой по услуге, без распределения по строкам.',
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: securityAccessControlVatResourceId,
    work_item_id: 'security-access-control',
    estimate_row_id: 'security-access-control',
    kind: 'other_cost',
    title: 'Расчетный НДС 5% по пропускному режиму',
    cost_bucket: 'vat',
    total_rub: detailMoney(485_683.62, {
      raw: '10 199 356 - 9 713 672,38',
      note: 'выведено из gross строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      securityDocumentTotalsSource,
      securityCalculationSource,
    ),
    note: 'Прямой НДС в security.pdf дан только по всему локальному расчету; агрегированная смета сходится с НДС от калькуляционных доходов.',
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: securityEquipmentVideoLaborResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'labor',
    title: 'Труд по обслуживанию охранного видеонаблюдения',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(584.1, 'чел-час', { raw: '584,1' }),
    unit_price_rub: detailMoney(749.01, { raw: '749,01' }),
    total_rub: detailMoney(437_513.59, { raw: '437 513,59' }),
    source_refs: detailSourceRefs(
      securityProductionEquipmentSource,
      securityStaffSource,
      securityEquipmentVideoSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityEquipmentVideoCamerasResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'material',
    title: 'Замена 5% видеокамер',
    cost_bucket: 'materials',
    quantity: detailQuantity(2, 'шт.', { raw: '2,0' }),
    unit_price_rub: detailMoney(5_000, { raw: '5000,00' }),
    total_rub: detailMoney(10_000, { raw: '10 000,00' }),
    source_refs: detailSourceRefs(
      securityProductionEquipmentSource,
      securityEquipmentVideoSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityEquipmentMonitorLaborResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'labor',
    title: 'Труд по обслуживанию монитора',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(38.6, 'чел-час', { raw: '38,6' }),
    unit_price_rub: detailMoney(749.01, { raw: '749,01' }),
    total_rub: detailMoney(28_919.4, { raw: '28 919,40' }),
    source_refs: detailSourceRefs(securityEquipmentMonitorSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityEquipmentServerPowerLaborResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'labor',
    title: 'Труд по обслуживанию блока питания сервера',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(14, 'чел-час', { raw: '14,0' }),
    unit_price_rub: detailMoney(749.01, { raw: '749,01' }),
    total_rub: detailMoney(10_516.15, { raw: '10 516,15' }),
    source_refs: detailSourceRefs(securityEquipmentServerPowerSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityEquipmentSkudLaborResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'labor',
    title: 'Труд по обслуживанию системы СКУД TRASSIR',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(35.1, 'чел-час', { raw: '35,1' }),
    unit_price_rub: detailMoney(749.01, { raw: '749,01' }),
    total_rub: detailMoney(26_252.91, { raw: '26 252,91' }),
    source_refs: detailSourceRefs(securityEquipmentSkudSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityEquipmentBarrierContractorResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'contractor',
    title: 'Услуги сторонней организации по обслуживанию шлагбаумов',
    cost_bucket: 'contractors',
    quantity: detailQuantity(12, 'мес', { raw: '12,0' }),
    unit_price_rub: detailMoney(30_000, { raw: '30000,00' }),
    total_rub: detailMoney(360_000, { raw: '360 000,00' }),
    source_refs: detailSourceRefs(
      securityProductionEquipmentSource,
      securityEquipmentBarrierSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityEquipmentDomilendContractorResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'contractor',
    title: 'Услуги сторонней организации по обслуживанию CRM Домиленд',
    cost_bucket: 'contractors',
    quantity: detailQuantity(12, 'мес', { raw: '12,0' }),
    unit_price_rub: detailMoney(11_215.38, { raw: '11215,38' }),
    total_rub: detailMoney(134_584.56, { raw: '134 584,56' }),
    source_refs: detailSourceRefs(
      securityProductionDomilendDispatchSource,
      securityEquipmentDomilendSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityEquipmentInsuranceResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'other_cost',
    title: 'Страховые взносы по техническому обслуживанию средств охраны',
    cost_bucket: 'insurance',
    total_rub: detailMoney(151_967.02, { raw: '151 967,02' }),
    source_refs: detailSourceRefs(securityEquipmentTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityEquipmentOverheadResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'other_cost',
    title:
      'Общеэксплуатационные расходы по техническому обслуживанию средств охраны',
    cost_bucket: 'overhead',
    total_rub: detailMoney(352_241.43, { raw: '352 241,43' }),
    source_refs: detailSourceRefs(securityEquipmentTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityEquipmentProfitResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'other_cost',
    title: 'Прибыль по техническому обслуживанию средств охраны',
    cost_bucket: 'profit',
    total_rub: detailMoney(201_280.82, { raw: '201 280,82' }),
    source_refs: detailSourceRefs(securityEquipmentTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityEquipmentUsnResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'other_cost',
    title: 'Расчетная доля УСН по техническому обслуживанию средств охраны',
    cost_bucket: 'usn',
    total_rub: detailMoney(11_662.22, {
      raw: '1 724 938,10 - 1 713 275,88',
      note: 'выведено из gross строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      securityEquipmentTotalsSource,
      securityCalculationSource,
    ),
    note: 'В security.pdf УСН показан только общей суммой по услуге, без распределения по строкам.',
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: securityEquipmentVatResourceId,
    work_item_id: 'security-equipment-maintenance',
    estimate_row_id: 'security-equipment-maintenance',
    kind: 'other_cost',
    title: 'Расчетный НДС 5% по техническому обслуживанию средств охраны',
    cost_bucket: 'vat',
    total_rub: detailMoney(86_246.9, {
      raw: '1 811 185 - 1 724 938,10',
      note: 'выведено из gross строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      securityDocumentTotalsSource,
      securityCalculationSource,
    ),
    note: 'Прямой НДС в security.pdf дан только по всему локальному расчету; агрегированная смета сходится с НДС от калькуляционных доходов.',
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: securityDispatchLaborResourceId,
    work_item_id: 'security-dispatch',
    estimate_row_id: 'security-dispatch',
    kind: 'labor',
    title: 'Труд диспетчера по приему заявок собственников',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(2_826.5, 'чел-час', { raw: '2826,5' }),
    unit_price_rub: detailMoney(382.09, { raw: '382,09' }),
    total_rub: detailMoney(1_080_000, { raw: '1 080 000,00' }),
    source_refs: detailSourceRefs(
      securityProductionDomilendDispatchSource,
      securityStaffSource,
      securityDispatchPositionSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityDispatchInsuranceResourceId,
    work_item_id: 'security-dispatch',
    estimate_row_id: 'security-dispatch',
    kind: 'other_cost',
    title: 'Страховые взносы по диспетчерскому обслуживанию',
    cost_bucket: 'insurance',
    total_rub: detailMoney(326_160, { raw: '326 160,00' }),
    source_refs: detailSourceRefs(securityDispatchPositionSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityDispatchOverheadResourceId,
    work_item_id: 'security-dispatch',
    estimate_row_id: 'security-dispatch',
    kind: 'other_cost',
    title: 'Общеэксплуатационные расходы по диспетчерскому обслуживанию',
    cost_bucket: 'overhead',
    total_rub: detailMoney(756_000, { raw: '756 000,00' }),
    source_refs: detailSourceRefs(securityDispatchPositionSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityDispatchProfitResourceId,
    work_item_id: 'security-dispatch',
    estimate_row_id: 'security-dispatch',
    kind: 'other_cost',
    title: 'Прибыль по диспетчерскому обслуживанию',
    cost_bucket: 'profit',
    total_rub: detailMoney(432_000, { raw: '432 000,00' }),
    source_refs: detailSourceRefs(securityDispatchPositionSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: securityDispatchUsnResourceId,
    work_item_id: 'security-dispatch',
    estimate_row_id: 'security-dispatch',
    kind: 'other_cost',
    title: 'Расчетная доля УСН по диспетчерскому обслуживанию',
    cost_bucket: 'usn',
    total_rub: detailMoney(17_658.1, {
      raw: '2 611 818,10 - 2 594 160,00',
      note: 'выведено из gross строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      securityDispatchPositionSource,
      securityCalculationSource,
    ),
    note: 'В security.pdf УСН показан только общей суммой по услуге, без распределения по строкам.',
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailResource({
    id: securityDispatchVatResourceId,
    work_item_id: 'security-dispatch',
    estimate_row_id: 'security-dispatch',
    kind: 'other_cost',
    title: 'Расчетный НДС 5% по диспетчерскому обслуживанию',
    cost_bucket: 'vat',
    total_rub: detailMoney(130_590.9, {
      raw: '2 742 409 - 2 611 818,10',
      note: 'выведено из gross строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      securityDocumentTotalsSource,
      securityCalculationSource,
    ),
    note: 'Прямой НДС в security.pdf дан только по всему локальному расчету; агрегированная смета сходится с НДС от калькуляционных доходов.',
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
] satisfies readonly EstimateDetailResource[];

const securityControlTotals = [
  detailControlTotal({
    id: 'security-access-control-contractors',
    estimate_row_id: 'security-access-control',
    cost_bucket: 'contractors',
    source_total_rub: detailMoney(8_640_000, { raw: '8 640 000,00' }),
    detail_total_rub: detailMoney(8_640_000, { raw: '8 640 000,00' }),
    aggregate_total_rub: detailMoney(8_640_000),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: securityAccessControlContractorResourceIds,
    source_refs: detailSourceRefs(
      securityAccessChopSource,
      securityAccessTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-access-control-materials',
    estimate_row_id: 'security-access-control',
    cost_bucket: 'materials',
    source_total_rub: detailMoney(1_008_000, { raw: '1 008 000,00' }),
    detail_total_rub: detailMoney(1_008_000, { raw: '1 008 000,00' }),
    aggregate_total_rub: detailMoney(1_008_000),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: securityAccessControlMaterialResourceIds,
    source_refs: detailSourceRefs(
      securityAccessMaterialsSource,
      securityAccessTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-access-control-usn',
    estimate_row_id: 'security-access-control',
    cost_bucket: 'usn',
    source_total_rub: detailMoney(65_672.38, {
      raw: '9 713 672,38 - 9 648 000,00',
    }),
    detail_total_rub: detailMoney(65_672.38),
    aggregate_total_rub: detailMoney(65_672.38),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityAccessControlUsnResourceId],
    source_refs: detailSourceRefs(
      securityAccessTotalsSource,
      securityCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'security-access-control-vat',
    estimate_row_id: 'security-access-control',
    cost_bucket: 'vat',
    source_total_rub: detailMoney(485_683.62, {
      raw: '10 199 356 - 9 713 672,38',
    }),
    detail_total_rub: detailMoney(485_683.62),
    aggregate_total_rub: detailMoney(485_683.62),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityAccessControlVatResourceId],
    source_refs: detailSourceRefs(
      securityDocumentTotalsSource,
      securityCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'security-access-control-gross',
    estimate_row_id: 'security-access-control',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(10_199_356, {
      raw: '9 648 000 + 65 672,38 + 485 683,62',
    }),
    detail_total_rub: detailMoney(10_199_356),
    aggregate_total_rub: detailMoney(10_199_356),
    delta_rub: 0,
    tolerance_rub: 1,
    resource_ids: securityAccessControlGrossResourceIds,
    source_refs: detailSourceRefs(
      securityAccessTotalsSource,
      securityDocumentTotalsSource,
      securityCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'security-equipment-primary-salary',
    estimate_row_id: 'security-equipment-maintenance',
    cost_bucket: 'primary_salary',
    source_total_rub: detailMoney(503_202.05, { raw: '503 202,05' }),
    detail_total_rub: detailMoney(503_202.05, { raw: '503 202,05' }),
    aggregate_total_rub: detailMoney(503_202.05),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: securityEquipmentPrimarySalaryResourceIds,
    source_refs: detailSourceRefs(
      securityEquipmentVideoSource,
      securityEquipmentMonitorSource,
      securityEquipmentServerPowerSource,
      securityEquipmentSkudSource,
      securityEquipmentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-equipment-materials',
    estimate_row_id: 'security-equipment-maintenance',
    cost_bucket: 'materials',
    source_total_rub: detailMoney(10_000, { raw: '10 000,00' }),
    detail_total_rub: detailMoney(10_000, { raw: '10 000,00' }),
    aggregate_total_rub: detailMoney(10_000),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: securityEquipmentMaterialResourceIds,
    source_refs: detailSourceRefs(
      securityEquipmentVideoSource,
      securityEquipmentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-equipment-contractors',
    estimate_row_id: 'security-equipment-maintenance',
    cost_bucket: 'contractors',
    source_total_rub: detailMoney(494_584.56, { raw: '494 584,56' }),
    detail_total_rub: detailMoney(494_584.56, { raw: '494 584,56' }),
    aggregate_total_rub: detailMoney(494_584.56),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: securityEquipmentContractorResourceIds,
    source_refs: detailSourceRefs(
      securityEquipmentBarrierSource,
      securityEquipmentDomilendSource,
      securityEquipmentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-equipment-insurance',
    estimate_row_id: 'security-equipment-maintenance',
    cost_bucket: 'insurance',
    source_total_rub: detailMoney(151_967.02, { raw: '151 967,02' }),
    detail_total_rub: detailMoney(151_967.02, { raw: '151 967,02' }),
    aggregate_total_rub: detailMoney(151_967.02),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityEquipmentInsuranceResourceId],
    source_refs: detailSourceRefs(securityEquipmentTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-equipment-overhead',
    estimate_row_id: 'security-equipment-maintenance',
    cost_bucket: 'overhead',
    source_total_rub: detailMoney(352_241.43, { raw: '352 241,43' }),
    detail_total_rub: detailMoney(352_241.43, { raw: '352 241,43' }),
    aggregate_total_rub: detailMoney(352_241.43),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityEquipmentOverheadResourceId],
    source_refs: detailSourceRefs(securityEquipmentTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-equipment-profit',
    estimate_row_id: 'security-equipment-maintenance',
    cost_bucket: 'profit',
    source_total_rub: detailMoney(201_280.82, { raw: '201 280,82' }),
    detail_total_rub: detailMoney(201_280.82, { raw: '201 280,82' }),
    aggregate_total_rub: detailMoney(201_280.82),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityEquipmentProfitResourceId],
    source_refs: detailSourceRefs(securityEquipmentTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-equipment-usn',
    estimate_row_id: 'security-equipment-maintenance',
    cost_bucket: 'usn',
    source_total_rub: detailMoney(11_662.22, {
      raw: '1 724 938,10 - 1 713 275,88',
    }),
    detail_total_rub: detailMoney(11_662.22),
    aggregate_total_rub: detailMoney(11_662.22),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityEquipmentUsnResourceId],
    source_refs: detailSourceRefs(
      securityEquipmentTotalsSource,
      securityCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'security-equipment-vat',
    estimate_row_id: 'security-equipment-maintenance',
    cost_bucket: 'vat',
    source_total_rub: detailMoney(86_246.9, {
      raw: '1 811 185 - 1 724 938,10',
    }),
    detail_total_rub: detailMoney(86_246.9),
    aggregate_total_rub: detailMoney(86_246.9),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityEquipmentVatResourceId],
    source_refs: detailSourceRefs(
      securityDocumentTotalsSource,
      securityCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'security-equipment-gross',
    estimate_row_id: 'security-equipment-maintenance',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(1_811_185, {
      raw: '1 713 275,88 + 11 662,22 + 86 246,90',
    }),
    detail_total_rub: detailMoney(1_811_185),
    aggregate_total_rub: detailMoney(1_811_185),
    delta_rub: 0,
    tolerance_rub: 1,
    resource_ids: securityEquipmentGrossResourceIds,
    source_refs: detailSourceRefs(
      securityEquipmentTotalsSource,
      securityDocumentTotalsSource,
      securityCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'security-dispatch-primary-salary',
    estimate_row_id: 'security-dispatch',
    cost_bucket: 'primary_salary',
    source_total_rub: detailMoney(1_080_000, { raw: '1 080 000,00' }),
    detail_total_rub: detailMoney(1_080_000, { raw: '1 080 000,00' }),
    aggregate_total_rub: detailMoney(1_080_000),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityDispatchLaborResourceId],
    source_refs: detailSourceRefs(securityDispatchPositionSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-dispatch-insurance',
    estimate_row_id: 'security-dispatch',
    cost_bucket: 'insurance',
    source_total_rub: detailMoney(326_160, { raw: '326 160,00' }),
    detail_total_rub: detailMoney(326_160, { raw: '326 160,00' }),
    aggregate_total_rub: detailMoney(326_160),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityDispatchInsuranceResourceId],
    source_refs: detailSourceRefs(securityDispatchPositionSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-dispatch-overhead',
    estimate_row_id: 'security-dispatch',
    cost_bucket: 'overhead',
    source_total_rub: detailMoney(756_000, { raw: '756 000,00' }),
    detail_total_rub: detailMoney(756_000, { raw: '756 000,00' }),
    aggregate_total_rub: detailMoney(756_000),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityDispatchOverheadResourceId],
    source_refs: detailSourceRefs(securityDispatchPositionSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-dispatch-profit',
    estimate_row_id: 'security-dispatch',
    cost_bucket: 'profit',
    source_total_rub: detailMoney(432_000, { raw: '432 000,00' }),
    detail_total_rub: detailMoney(432_000, { raw: '432 000,00' }),
    aggregate_total_rub: detailMoney(432_000),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityDispatchProfitResourceId],
    source_refs: detailSourceRefs(securityDispatchPositionSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'security-dispatch-usn',
    estimate_row_id: 'security-dispatch',
    cost_bucket: 'usn',
    source_total_rub: detailMoney(17_658.1, {
      raw: '2 611 818,10 - 2 594 160,00',
    }),
    detail_total_rub: detailMoney(17_658.1),
    aggregate_total_rub: detailMoney(17_658.1),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityDispatchUsnResourceId],
    source_refs: detailSourceRefs(
      securityDispatchPositionSource,
      securityCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'security-dispatch-vat',
    estimate_row_id: 'security-dispatch',
    cost_bucket: 'vat',
    source_total_rub: detailMoney(130_590.9, {
      raw: '2 742 409 - 2 611 818,10',
    }),
    detail_total_rub: detailMoney(130_590.9),
    aggregate_total_rub: detailMoney(130_590.9),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [securityDispatchVatResourceId],
    source_refs: detailSourceRefs(
      securityDocumentTotalsSource,
      securityCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
  detailControlTotal({
    id: 'security-dispatch-gross',
    estimate_row_id: 'security-dispatch',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(2_742_409, {
      raw: '2 594 160 + 17 658,10 + 130 590,90',
    }),
    detail_total_rub: detailMoney(2_742_409),
    aggregate_total_rub: detailMoney(2_742_409),
    delta_rub: 0,
    tolerance_rub: 1,
    resource_ids: securityDispatchGrossResourceIds,
    source_refs: detailSourceRefs(
      securityDispatchPositionSource,
      securityDocumentTotalsSource,
      securityCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      securityDerivedAllocationNeedsCheckReason,
      securityDerivedAllocationRefs,
    ),
  }),
] satisfies readonly EstimateDetailControlTotal[];

const wasteWorkItems = [
  detailWorkItem({
    id: 'waste-operator-service',
    title: 'Организация сбора ТКО и передача региональному оператору',
    estimate_row_id: 'waste-operator-service',
    service_ids: ['year-round-solid-waste-removal'],
    source_refs: detailSourceRefs(
      wasteOperatorProductionProgramSource,
      wasteOperatorNormativeVolumeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailWorkItem({
    id: 'waste-transfer-from-homes',
    title:
      'Перемещение мусора из мест временного накопления от домовладений на мусорную площадку',
    estimate_row_id: 'waste-transfer-from-homes',
    service_ids: [
      'year-round-private-bins-cleaning',
      'year-round-solid-waste-removal',
    ],
    source_refs: detailSourceRefs(
      wasteTransferProductionProgramSource,
      wasteTransferNormativeVolumeSource,
    ),
    ...detailStatus('verified'),
  }),
] satisfies readonly EstimateDetailWorkItem[];

const wasteResources = [
  detailResource({
    id: wasteOperatorRegionalOperatorResourceId,
    work_item_id: 'waste-operator-service',
    estimate_row_id: 'waste-operator-service',
    kind: 'contractor',
    title: 'Услуга регионального оператора по вывозу и утилизации ТКО',
    cost_bucket: 'contractors',
    quantity: detailQuantity(6_201.6, 'м³/год', { raw: '6201,6' }),
    unit_price_rub: detailMoney(1_229.24, { raw: '1229,24' }),
    total_rub: detailMoney(7_623_207.58, { raw: '7 623 207,58' }),
    source_refs: wasteOperatorContractorNeedsCheckRefs,
    note: 'Локальный ресурсный сметный расчет относит сумму к сторонним организациям; калькуляция на стр. 5 относит округленную сумму к материальным ресурсам.',
    ...detailNeedsCheckStatus(
      'Внутри waste.pdf один и тот же итог 7 623 208 показан как сторонние организации в локальном расчете и как материальные ресурсы в калькуляции.',
      wasteOperatorContractorNeedsCheckRefs,
    ),
  }),
  detailResource({
    id: wasteOperatorMaterialsCalculationResourceId,
    work_item_id: 'waste-operator-service',
    estimate_row_id: 'waste-operator-service',
    kind: 'material',
    title:
      'Калькуляционная строка материальных ресурсов по работе с региональным оператором',
    cost_bucket: 'materials',
    total_rub: detailMoney(7_623_208, { raw: '7 623 208' }),
    source_refs: detailSourceRefs(wasteOperatorCalculationSource),
    note: 'Строка сохранена отдельно от contractor-ресурса, потому что калькуляция конфликтует с локальным ресурсным расчетом.',
    ...detailNeedsCheckStatus(
      'Калькуляция относит 7 623 208 к материальным ресурсам, но локальный ресурсный расчет относит эту сумму к услугам сторонних организаций.',
      detailSourceRefs(
        wasteOperatorCalculationSource,
        wasteOperatorContractorSource,
      ),
    ),
  }),
  detailResource({
    id: wasteOperatorVatResourceId,
    work_item_id: 'waste-operator-service',
    estimate_row_id: 'waste-operator-service',
    kind: 'other_cost',
    title: 'НДС 5% по услуге регионального оператора',
    cost_bucket: 'vat',
    total_rub: detailMoney(381_160.38, { raw: '381 160,38' }),
    source_refs: detailSourceRefs(wasteOperatorDocumentTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferWorkerLaborResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'labor',
    title: 'Рабочий по уборке территории (средний разряд 3.0)',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(5_147.3, 'чел-час', { raw: '5147,3' }),
    unit_price_rub: detailMoney(664.15, { raw: '664,15' }),
    total_rub: detailMoney(3_418_555.1, { raw: '3 418 555,10' }),
    source_refs: detailSourceRefs(
      wasteTransferStaffSource,
      wasteTransferResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferMachinistLaborResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'machinist_labor',
    title: 'Машинист',
    cost_bucket: 'machinist_salary',
    quantity: detailQuantity(1_460, 'чел-час', { raw: '1460,0' }),
    unit_price_rub: detailMoney(934.32, { raw: '934,32' }),
    total_rub: detailMoney(1_364_107.2, { raw: '1 364 107,20' }),
    source_refs: detailSourceRefs(
      wasteTransferStaffSource,
      wasteTransferResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferGazelMachineResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'machine',
    title: 'Газель (GAZ 330232)',
    cost_bucket: 'machines',
    quantity: detailQuantity(1_460, 'маш.-час', { raw: '1460,0' }),
    unit_price_rub: detailMoney(318.02, { raw: '318,02' }),
    total_rub: detailMoney(464_303.42, { raw: '464 303,42' }),
    source_refs: detailSourceRefs(
      wasteTransferProductionProgramSource,
      wasteTransferResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferWorkerInsuranceResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'other_cost',
    title: 'Страховые взносы по труду рабочего',
    cost_bucket: 'insurance',
    total_rub: detailMoney(1_032_403.64, { raw: '1 032 403,64' }),
    source_refs: detailSourceRefs(wasteTransferWorkerPositionSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferMachinistInsuranceResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'other_cost',
    title: 'Страховые взносы по труду машиниста',
    cost_bucket: 'insurance',
    total_rub: detailMoney(411_960.37, { raw: '411 960,37' }),
    source_refs: detailSourceRefs(wasteTransferMachinePositionSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferWorkerOverheadResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'other_cost',
    title: 'Общеэксплуатационные расходы по труду рабочего',
    cost_bucket: 'overhead',
    total_rub: detailMoney(2_392_988.57, { raw: '2 392 988,57' }),
    source_refs: detailSourceRefs(wasteTransferWorkerPositionSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferMachinistOverheadResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'other_cost',
    title: 'Общеэксплуатационные расходы по труду машиниста',
    cost_bucket: 'overhead',
    total_rub: detailMoney(954_875.04, { raw: '954 875,04' }),
    source_refs: detailSourceRefs(wasteTransferMachinePositionSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferWorkerProfitResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'other_cost',
    title: 'Прибыль по труду рабочего',
    cost_bucket: 'profit',
    total_rub: detailMoney(1_367_422.04, { raw: '1 367 422,04' }),
    source_refs: detailSourceRefs(wasteTransferWorkerPositionSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferMachinistProfitResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'other_cost',
    title: 'Прибыль по труду машиниста',
    cost_bucket: 'profit',
    total_rub: detailMoney(545_642.88, { raw: '545 642,88' }),
    source_refs: detailSourceRefs(wasteTransferMachinePositionSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferUsnResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'other_cost',
    title: 'Налог по УСН',
    cost_bucket: 'usn',
    total_rub: detailMoney(286_960, { raw: '286 960' }),
    source_refs: detailSourceRefs(wasteTransferCalculationSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: wasteTransferVatDocumentResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'other_cost',
    title: 'НДС 5% по локальному ресурсному расчету перемещения мусора',
    cost_bucket: 'vat',
    total_rub: detailMoney(597_612.91, { raw: '597 612,91' }),
    source_refs: detailSourceRefs(wasteTransferDocumentTotalsSource),
    note: 'Прямой НДС из локального ресурсного расчета не используется в gross-сверке с estimate-2026, потому что итог агрегированной сметы сходится с НДС от калькуляционных доходов.',
    ...detailNeedsCheckStatus(
      'Прямой НДС 597 612,91 не сходится с annual_gross estimate-2026; проверить, какой НДС должен быть источником итоговой строки.',
      detailSourceRefs(
        wasteTransferDocumentTotalsSource,
        wasteTransferCalculationSource,
      ),
    ),
  }),
  detailResource({
    id: wasteTransferVatDerivedResourceId,
    work_item_id: 'waste-transfer-from-homes',
    estimate_row_id: 'waste-transfer-from-homes',
    kind: 'other_cost',
    title: 'Расчетный НДС 5% для сверки с агрегированной сметой',
    cost_bucket: 'vat',
    total_rub: detailMoney(611_960.85, {
      raw: '12 239 217 × 5%',
      note: 'рассчитано от строки «Доходов - всего» в калькуляции',
    }),
    source_refs: detailSourceRefs(
      wasteTransferDocumentTotalsSource,
      wasteTransferCalculationSource,
    ),
    note: 'Локальный ресурсный сметный расчет показывает НДС 597 612,91, но агрегированная строка 12 851 178 сходится с 5% от доходов 12 239 217.',
    ...detailNeedsCheckStatus(
      'В waste.pdf есть прямой НДС 597 612,91 в локальном расчете и расчетная величина 611 960,85, которая нужна для сверки с estimate-2026.',
      detailSourceRefs(
        wasteTransferDocumentTotalsSource,
        wasteTransferCalculationSource,
      ),
    ),
  }),
] satisfies readonly EstimateDetailResource[];

const wasteControlTotals = [
  detailControlTotal({
    id: 'waste-operator-contractors',
    estimate_row_id: 'waste-operator-service',
    cost_bucket: 'contractors',
    source_total_rub: detailMoney(7_623_207.58, { raw: '7 623 207,58' }),
    detail_total_rub: detailMoney(7_623_207.58, { raw: '7 623 207,58' }),
    aggregate_total_rub: detailMoney(7_623_207.58),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [wasteOperatorRegionalOperatorResourceId],
    source_refs: detailSourceRefs(
      wasteOperatorContractorSource,
      wasteOperatorDocumentTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'waste-operator-income',
    estimate_row_id: 'waste-operator-service',
    cost_bucket: 'income',
    source_total_rub: detailMoney(7_623_208, { raw: '7 623 208' }),
    detail_total_rub: detailMoney(7_623_207.58, {
      raw: '7 623 207,58',
      note: 'точное значение из локального ресурсного расчета',
    }),
    aggregate_total_rub: detailMoney(7_623_207.58),
    delta_rub: -0.42,
    tolerance_rub: 1,
    resource_ids: [wasteOperatorRegionalOperatorResourceId],
    source_refs: detailSourceRefs(wasteOperatorCalculationSource),
    note: 'Калькуляция округляет доход до рублей.',
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'waste-operator-gross',
    estimate_row_id: 'waste-operator-service',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(8_004_367.96, {
      raw: '7 623 207,58 + 381 160,38',
    }),
    detail_total_rub: detailMoney(8_004_367.96),
    aggregate_total_rub: detailMoney(8_004_368),
    delta_rub: -0.04,
    tolerance_rub: 1,
    resource_ids: wasteOperatorGrossResourceIds,
    source_refs: detailSourceRefs(
      wasteOperatorDocumentTotalsSource,
      wasteOperatorCalculationSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'waste-operator-materials-calculation-conflict',
    estimate_row_id: 'waste-operator-service',
    cost_bucket: 'materials',
    source_total_rub: detailMoney(7_623_208, { raw: '7 623 208' }),
    detail_total_rub: detailMoney(7_623_208, { raw: '7 623 208' }),
    aggregate_total_rub: detailMoney(0),
    delta_rub: 7_623_208,
    tolerance_rub: 0.01,
    resource_ids: [wasteOperatorMaterialsCalculationResourceId],
    source_refs: detailSourceRefs(
      wasteOperatorContractorSource,
      wasteOperatorCalculationSource,
    ),
    ...detailNeedsCheckStatus(
      'Калькуляция относит 7 623 208 к материальным ресурсам, а локальный ресурсный расчет и estimate-2026 относят сумму к сторонним организациям/подрядчикам.',
      detailSourceRefs(
        wasteOperatorContractorSource,
        wasteOperatorCalculationSource,
      ),
    ),
  }),
  detailControlTotal({
    id: 'waste-transfer-primary-salary',
    estimate_row_id: 'waste-transfer-from-homes',
    cost_bucket: 'primary_salary',
    source_total_rub: detailMoney(3_418_555.1, { raw: '3 418 555,10' }),
    detail_total_rub: detailMoney(3_418_555.1, { raw: '3 418 555,10' }),
    aggregate_total_rub: detailMoney(3_418_555.1),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: wasteTransferPrimarySalaryResourceIds,
    source_refs: detailSourceRefs(
      wasteTransferWorkerPositionSource,
      wasteTransferResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'waste-transfer-machinist-salary',
    estimate_row_id: 'waste-transfer-from-homes',
    cost_bucket: 'machinist_salary',
    source_total_rub: detailMoney(1_364_107.2, { raw: '1 364 107,20' }),
    detail_total_rub: detailMoney(1_364_107.2, { raw: '1 364 107,20' }),
    aggregate_total_rub: detailMoney(1_364_107.2),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: wasteTransferMachinistSalaryResourceIds,
    source_refs: detailSourceRefs(
      wasteTransferMachinePositionSource,
      wasteTransferResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'waste-transfer-machines',
    estimate_row_id: 'waste-transfer-from-homes',
    cost_bucket: 'machines',
    source_total_rub: detailMoney(464_303.42, { raw: '464 303,42' }),
    detail_total_rub: detailMoney(464_303.42, { raw: '464 303,42' }),
    aggregate_total_rub: detailMoney(464_303.42),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: wasteTransferMachineResourceIds,
    source_refs: detailSourceRefs(
      wasteTransferMachinePositionSource,
      wasteTransferResourceStatementSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'waste-transfer-insurance',
    estimate_row_id: 'waste-transfer-from-homes',
    cost_bucket: 'insurance',
    source_total_rub: detailMoney(1_444_364.01, { raw: '1 444 364,01' }),
    detail_total_rub: detailMoney(1_444_364.01, { raw: '1 444 364,01' }),
    aggregate_total_rub: detailMoney(1_444_364.01),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: wasteTransferInsuranceResourceIds,
    source_refs: detailSourceRefs(wasteTransferDocumentTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'waste-transfer-overhead',
    estimate_row_id: 'waste-transfer-from-homes',
    cost_bucket: 'overhead',
    source_total_rub: detailMoney(3_347_863.61, { raw: '3 347 863,61' }),
    detail_total_rub: detailMoney(3_347_863.61, { raw: '3 347 863,61' }),
    aggregate_total_rub: detailMoney(3_347_863.61),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: wasteTransferOverheadResourceIds,
    source_refs: detailSourceRefs(wasteTransferDocumentTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'waste-transfer-profit',
    estimate_row_id: 'waste-transfer-from-homes',
    cost_bucket: 'profit',
    source_total_rub: detailMoney(1_913_064.92, { raw: '1 913 064,92' }),
    detail_total_rub: detailMoney(1_913_064.92, { raw: '1 913 064,92' }),
    aggregate_total_rub: detailMoney(1_913_064.92),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: wasteTransferProfitResourceIds,
    source_refs: detailSourceRefs(wasteTransferDocumentTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'waste-transfer-usn',
    estimate_row_id: 'waste-transfer-from-homes',
    cost_bucket: 'usn',
    source_total_rub: detailMoney(286_960, { raw: '286 960' }),
    detail_total_rub: detailMoney(286_960, { raw: '286 960' }),
    aggregate_total_rub: detailMoney(null, {
      note: 'в breakdown строки estimate-2026 отдельного bucket usn нет',
    }),
    tolerance_rub: 0.01,
    resource_ids: [wasteTransferUsnResourceId],
    source_refs: detailSourceRefs(wasteTransferCalculationSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'waste-transfer-gross',
    estimate_row_id: 'waste-transfer-from-homes',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(12_851_177.85, {
      raw: '12 239 217 + 12 239 217 × 5%',
    }),
    detail_total_rub: detailMoney(12_851_177.85, {
      note: 'калькуляционный доход плюс расчетный НДС 5%',
    }),
    aggregate_total_rub: detailMoney(12_851_178),
    delta_rub: -0.15,
    tolerance_rub: 2,
    resource_ids: wasteTransferGrossResourceIds,
    source_refs: detailSourceRefs(
      wasteTransferDocumentTotalsSource,
      wasteTransferCalculationSource,
    ),
    note: 'Сверка с annual_gross estimate-2026 требует расчетного НДС от калькуляционных доходов; прямой НДС в локальном расчете меньше.',
    ...detailNeedsCheckStatus(
      'Прямой НДС 597 612,91 из локального расчета не сходится с агрегированной строкой 12 851 178; сходится расчетный НДС 5% от доходов 12 239 217.',
      detailSourceRefs(
        wasteTransferDocumentTotalsSource,
        wasteTransferCalculationSource,
      ),
    ),
  }),
] satisfies readonly EstimateDetailControlTotal[];

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
  work_items: [...wasteWorkItems, ...securityWorkItems, ...lightingWorkItems],
  resources: [...wasteResources, ...securityResources, ...lightingResources],
  control_totals: [
    ...wasteControlTotals,
    ...securityControlTotals,
    ...lightingControlTotals,
  ],
} satisfies EstimateDetailDataset;
