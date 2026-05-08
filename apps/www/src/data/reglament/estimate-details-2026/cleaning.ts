import type {
  EstimateDetailControlTotal,
  EstimateDetailResource,
  EstimateDetailWorkItem,
} from '@/lib/reglament/detail-schema';

import {
  detailControlTotal,
  detailMoney,
  detailNeedsCheckStatus,
  detailQuantity,
  detailResource,
  detailSource,
  detailSourceRefs,
  detailStatus,
  detailWorkItem,
} from './shared';

const cleaningWinterMechanizedSnow2cmMachinistResourceId =
  'cleaning-winter-mechanized-snow-2cm-machinist-labor';
const cleaningWinterMechanizedHeavySnowMachinistResourceId =
  'cleaning-winter-mechanized-heavy-snow-machinist-labor';
const cleaningWinterMechanizedSandMachinistResourceId =
  'cleaning-winter-mechanized-sand-machinist-labor';
const cleaningWinterMechanizedSnow2cmTractorResourceId =
  'cleaning-winter-mechanized-snow-2cm-tractor-machine';
const cleaningWinterMechanizedHeavySnowTractorResourceId =
  'cleaning-winter-mechanized-heavy-snow-tractor-machine';
const cleaningWinterMechanizedSandTractorResourceId =
  'cleaning-winter-mechanized-sand-tractor-machine';
const cleaningWinterMechanizedSandSpreaderResourceId =
  'cleaning-winter-mechanized-sand-spreader-machine';
const cleaningWinterMechanizedSandResourceId =
  'cleaning-winter-mechanized-sand';
const cleaningWinterMechanizedPpeCottonSuitResourceId =
  'cleaning-winter-mechanized-ppe-cotton-suit';
const cleaningWinterMechanizedPpeInsulatedJacketResourceId =
  'cleaning-winter-mechanized-ppe-insulated-jacket';
const cleaningWinterMechanizedPpeSignalVestResourceId =
  'cleaning-winter-mechanized-ppe-signal-vest';
const cleaningWinterMechanizedPpeInsulatedBootsResourceId =
  'cleaning-winter-mechanized-ppe-insulated-boots';
const cleaningWinterMechanizedPpePolymerGlovesResourceId =
  'cleaning-winter-mechanized-ppe-polymer-gloves';
const cleaningWinterMechanizedPpeInsulatedMittensResourceId =
  'cleaning-winter-mechanized-ppe-insulated-mittens';
const cleaningWinterMechanizedPpeRubberBootsResourceId =
  'cleaning-winter-mechanized-ppe-rubber-boots';
const cleaningWinterMechanizedPpeSoapResourceId =
  'cleaning-winter-mechanized-ppe-soap';
const cleaningWinterMechanizedInsuranceResourceId =
  'cleaning-winter-mechanized-insurance';
const cleaningWinterMechanizedOverheadResourceId =
  'cleaning-winter-mechanized-overhead';
const cleaningWinterMechanizedProfitResourceId =
  'cleaning-winter-mechanized-profit';
const cleaningWinterMechanizedUsnResourceId =
  'cleaning-winter-mechanized-usn-derived';
const cleaningWinterMechanizedVatResourceId =
  'cleaning-winter-mechanized-vat-derived';

const cleaningWinterManualSnowSweepingWorkerResourceId =
  'cleaning-winter-manual-snow-sweeping-worker-labor';
const cleaningWinterManualAntiIceWorkerResourceId =
  'cleaning-winter-manual-anti-ice-worker-labor';
const cleaningWinterManualRoadSnowIceWorkerResourceId =
  'cleaning-winter-manual-road-snow-ice-worker-labor';
const cleaningWinterManualContainerSiteWorkerResourceId =
  'cleaning-winter-manual-container-site-worker-labor';
const cleaningWinterManualSandResourceId = 'cleaning-winter-manual-sand';
const cleaningWinterManualPpeCottonSuitResourceId =
  'cleaning-winter-manual-ppe-cotton-suit';
const cleaningWinterManualPpeInsulatedJacketResourceId =
  'cleaning-winter-manual-ppe-insulated-jacket';
const cleaningWinterManualPpeSignalVestResourceId =
  'cleaning-winter-manual-ppe-signal-vest';
const cleaningWinterManualPpeInsulatedBootsResourceId =
  'cleaning-winter-manual-ppe-insulated-boots';
const cleaningWinterManualPpePolymerGlovesResourceId =
  'cleaning-winter-manual-ppe-polymer-gloves';
const cleaningWinterManualPpeInsulatedMittensResourceId =
  'cleaning-winter-manual-ppe-insulated-mittens';
const cleaningWinterManualPpeRubberBootsResourceId =
  'cleaning-winter-manual-ppe-rubber-boots';
const cleaningWinterManualPpeSoapResourceId = 'cleaning-winter-manual-ppe-soap';
const cleaningWinterManualInventoryIceAxeResourceId =
  'cleaning-winter-manual-inventory-ice-axe';
const cleaningWinterManualInventoryPolypropyleneBroomResourceId =
  'cleaning-winter-manual-inventory-polypropylene-broom';
const cleaningWinterManualInventoryRakeResourceId =
  'cleaning-winter-manual-inventory-rake';
const cleaningWinterManualInventorySnowShovelResourceId =
  'cleaning-winter-manual-inventory-snow-shovel';
const cleaningWinterManualInventoryScoopShovelResourceId =
  'cleaning-winter-manual-inventory-scoop-shovel';
const cleaningWinterManualInventoryWheelbarrowResourceId =
  'cleaning-winter-manual-inventory-wheelbarrow';
const cleaningWinterManualInventoryBucketResourceId =
  'cleaning-winter-manual-inventory-bucket-12l';
const cleaningWinterManualInsuranceResourceId =
  'cleaning-winter-manual-insurance';
const cleaningWinterManualOverheadResourceId =
  'cleaning-winter-manual-overhead';
const cleaningWinterManualProfitResourceId = 'cleaning-winter-manual-profit';
const cleaningWinterManualUsnResourceId = 'cleaning-winter-manual-usn-derived';
const cleaningWinterManualVatResourceId = 'cleaning-winter-manual-vat-derived';

const cleaningWinterMechanizedProductionSnowSource = detailSource(
  'cleaning',
  1,
  'производственная программа / зимняя механизированная уборка / подметание снега',
  {
    quote:
      'Подметание свежевыпавшего снега толщиной слоя 2 см; кратность 70; объем 81 778; Трактор МТЗ 80 ... 2160; Подметание ... свыше 2 см; кратность 92; Трактор МТЗ 80 ... 2980',
  },
);

const cleaningWinterMechanizedProductionSandSource = detailSource(
  'cleaning',
  2,
  'производственная программа / зимняя механизированная уборка / посыпка песком и СИЗ',
  {
    quote:
      'Посыпка дорог песком - в дни с гололедом и гололедицей; кратность 30; Трактор МТЗ 80 ... 210; Навесной разбрасыватель песка РПМ-01 210; Песок для посыпки дорог 73,6 т.; СИЗ 2,7 чел.',
  },
);

const cleaningStaffSource = detailSource(
  'cleaning',
  8,
  'нормативное штатное расписание по уборке территории',
  {
    quote:
      'Рабочий по уборке территории (средний разряд 3.0); 13,4; тарифная ставка 664,15; всего 8 899,55; Машинист; 14,1; тарифная ставка 934,32; всего 13 173,91',
  },
);

const cleaningWinterMechanizedSnow2cmSource = detailSource(
  'cleaning',
  10,
  'позиция 1.1 / подметание снега толщиной 2 см',
  {
    quote:
      'Подметание свежевыпавшего снега толщиной слоя 2 см ... 5 206 753,87; Машинист 2160 934,32 2 018 293,38; Трактор МТЗ 80 ... 3 188 460,49; ИТОГО ПО ПОЗИЦИИ 8 036 401,19',
  },
);

const cleaningWinterMechanizedHeavySnowSource = detailSource(
  'cleaning',
  10,
  'позиция 1.2 / подметание снега толщиной свыше 2 см',
  {
    quote:
      'Подметание свежевыпавшего снега толщиной слоя свыше 2 см ... 7 181 932,63; Машинист 2980 934,32 2 783 931,69; Трактор МТЗ 80 ... 4 398 000,94',
  },
);

const cleaningWinterMechanizedHeavySnowTotalSource = detailSource(
  'cleaning',
  11,
  'позиция 1.2 / начисления и итог подметания снега свыше 2 см',
  {
    quote:
      'Расходы на страховые взносы 840 747,37; общеэксплуатационные расходы 1 948 752,19; прибыль 1 113 572,68; ИТОГО ПО ПОЗИЦИИ 11 085 004,86',
  },
);

const cleaningWinterMechanizedSandSource = detailSource(
  'cleaning',
  11,
  'позиция 1.3 / посыпка дорог песком',
  {
    quote:
      'Посыпка дорог песком ... 648 097,51; Машинист 210 934,32 196 544,88; Трактор МТЗ 80 ... 310 497,76; Навесной разбрасыватель песка РПМ-01 8 574,51; Песок 74 т. 1800,00 132 480,36',
  },
);

const cleaningWinterMechanizedSandTotalSource = detailSource(
  'cleaning',
  12,
  'позиция 1.3 / начисления и итог посыпки песком',
  {
    quote:
      'Расходы на страховые взносы 59 356,55; общеэксплуатационные расходы 137 581,41; прибыль 78 617,95; ИТОГО ПО ПОЗИЦИИ 923 653,42',
  },
);

const cleaningWinterMechanizedPpeSource = detailSource(
  'cleaning',
  12,
  'позиция 1.4 / средства охраны труда для зимней механизированной уборки',
  {
    quote:
      'Костюм 14 850,00; Куртка 6 480,00; Жилет 3 240,00; Сапоги утепленные 3 780,00; Перчатки 3 780,00; Рукавицы 7 560,00; Сапоги резиновые 5 400,00; Мыло 3 758,40; ИТОГО 48 848,40',
  },
);

const cleaningWinterMechanizedTotalsSource = detailSource(
  'cleaning',
  13,
  'итого по разделу зимней механизированной уборки территории',
  {
    quote:
      'Прямые затраты 13 085 632,41; страховые взносы 1 509 628,52; общеэксплуатационные расходы 3 499 138,97; прибыль 1 999 507,98; Итого 20 093 907,88; Машины 7 905 533,70; Зарплата машинистов 4 998 769,96; Материальные затраты 181 328,76',
  },
);

const cleaningWinterManualProductionSnowSource = detailSource(
  'cleaning',
  2,
  'производственная программа / зимняя ручная уборка / подметание снега',
  {
    quote:
      'Зимняя ручная уборка территории; трудозатраты 1 825,3; Подметание свежевыпавшего снега ... кратность 70; объем 449; трудозатраты 73,3',
  },
);

const cleaningWinterManualProductionWorksSource = detailSource(
  'cleaning',
  3,
  'производственная программа / зимняя ручная уборка / подсыпка, дороги и контейнерная площадка',
  {
    quote:
      'Подсыпка территории противогололедным материалом ... кратность 30; объем 449; трудозатраты 29,2; Песок 2,7 т.; Очистка участков территорий от снега и наледи ... кратность 116; объем 8 178; трудозатраты 1264,8; Очистка контейнерной площадки ... кратность 212; объем 36,0; трудозатраты 457,9',
  },
);

const cleaningWinterManualProductionInventorySource = detailSource(
  'cleaning',
  4,
  'производственная программа / зимняя ручная уборка / СИЗ и инвентарь',
  {
    quote:
      'Сапоги резиновые 0,9; Мыло туалетное 10,8; Износ оборудования, инструментов: Ледоруб-топор 0,2; Метла 4,5; Грабли 0,3; Лопата снегоуборочная 0,5; Лопата совковая 0,5; Тачка садовая 0,5; Ведро п\\э 12л 0,3',
  },
);

const cleaningWinterManualSnowSweepingSource = detailSource(
  'cleaning',
  13,
  'позиция 2.1 / подметание свежевыпавшего снега вручную',
  {
    quote:
      'Подметание свежевыпавшего снега ... 48 706,24; Затраты труда Рабочий по уборке территории 73 664,15 48 706,24',
  },
);

const cleaningWinterManualAntiIceSource = detailSource(
  'cleaning',
  14,
  'позиция 2.2 / подсыпка противогололедным материалом',
  {
    quote:
      'Подсыпка территории противогололедным материалом ... 24 232,30; Рабочий по уборке территории 29 664,15 19 383,10; Песок для посыпки дорог 3 т. 1800,00 4 849,20; ИТОГО ПО ПОЗИЦИИ 51 407,39',
  },
);

const cleaningWinterManualRoadSnowIceSource = detailSource(
  'cleaning',
  15,
  'позиция 2.3 / очистка участков территорий от снега и наледи',
  {
    quote:
      'Рабочий по уборке территории 1265 664,15 840 033,57; страховые взносы 253 690,14; общеэксплуатационные расходы 588 023,50; прибыль 336 013,43; ИТОГО ПО ПОЗИЦИИ 2 017 760,64',
  },
);

const cleaningWinterManualContainerSiteSource = detailSource(
  'cleaning',
  15,
  'позиция 2.4 / очистка контейнерной площадки в холодный период',
  {
    quote:
      'Очистка контейнерной площадки в холодный период - ежедневно ... 304 125,64; Рабочий по уборке территории 458 664,15 304 125,64; ИТОГО ПО ПОЗИЦИИ 730 509,79',
  },
);

const cleaningWinterManualPpeSource = detailSource(
  'cleaning',
  16,
  'позиция 2.5 / средства охраны труда для зимней ручной уборки',
  {
    quote:
      'Костюм 4 950,00; Куртка 2 160,00; Жилет 1 080,00; Сапоги утепленные 1 260,00; Перчатки 1 260,00; Рукавицы 2 520,00; Сапоги резиновые 1 800,00; Мыло 1 252,80; ИТОГО 16 282,80',
  },
);

const cleaningWinterManualInventorySource = detailSource(
  'cleaning',
  17,
  'позиция 2.7 / износ оборудования и инструментов для зимней ручной уборки',
  {
    quote:
      'Ледоруб-топор 126,00; Метла полипропиленовая 1 665,00; Грабли 148,50; Лопата снегоуборочная 1 125,00; Лопата совковая 465,30; Тачка садовая 1 125,00; Ведро п\\э 12л 59,40; ИТОГО 4 714,20',
  },
);

const cleaningWinterManualTotalsSource = detailSource(
  'cleaning',
  17,
  'итого по разделу зимней ручной уборки территории',
  {
    quote:
      'Прямые затраты 1 238 094,75; страховые взносы 366 099,05; общеэксплуатационные расходы 848 573,98; прибыль 484 899,42; Итого 2 937 667,20; Основная зарплата 1 212 248,55; Материальные затраты 25 846,20',
  },
);

const cleaningDocumentVatSource = detailSource(
  'cleaning',
  25,
  'итоги локального ресурсного сметного расчета по уборке территории',
  {
    quote: 'ВСЕГО по документу 148 826 305,16; НДС 5% 7 441 315,26',
  },
);

const cleaningCalculationSource = detailSource(
  'cleaning',
  27,
  'калькуляция себестоимости услуг по уборке территории',
  {
    quote:
      'ИТОГО расходов 131 402 572; налог по УСН 2 613 560; прибыль 17 423 732; Доходов - всего 151 439 865',
  },
);

const cleaningRoundedQuantityNote =
  'количество в PDF округлено; итог сохранен по исходной строке';
const cleaningVatNeedsCheckNote =
  'Прямой НДС 7 441 315,26 в локальном расчете равен 5% от 148 826 305,16 до УСН; агрегированная смета уборки сходится с НДС 5% от калькуляционных доходов 151 439 865.';
const cleaningDerivedVatNeedsCheckReason =
  'cleaning.pdf показывает НДС 5% двумя несовпадающими способами: прямой НДС в локальном расчете и расчетный НДС от калькуляционных доходов; строковая доля выведена для сверки с estimate-2026.';
const cleaningDerivedVatNeedsCheckRefs = detailSourceRefs(
  cleaningWinterMechanizedTotalsSource,
  cleaningDocumentVatSource,
  cleaningCalculationSource,
);
const cleaningWinterManualDerivedVatNeedsCheckRefs = detailSourceRefs(
  cleaningWinterManualTotalsSource,
  cleaningDocumentVatSource,
  cleaningCalculationSource,
);

const cleaningWinterMechanizedMachinistResourceIds = [
  cleaningWinterMechanizedSnow2cmMachinistResourceId,
  cleaningWinterMechanizedHeavySnowMachinistResourceId,
  cleaningWinterMechanizedSandMachinistResourceId,
] as const;
const cleaningWinterMechanizedMachineResourceIds = [
  cleaningWinterMechanizedSnow2cmTractorResourceId,
  cleaningWinterMechanizedHeavySnowTractorResourceId,
  cleaningWinterMechanizedSandTractorResourceId,
  cleaningWinterMechanizedSandSpreaderResourceId,
] as const;
const cleaningWinterMechanizedMaterialResourceIds = [
  cleaningWinterMechanizedSandResourceId,
  cleaningWinterMechanizedPpeCottonSuitResourceId,
  cleaningWinterMechanizedPpeInsulatedJacketResourceId,
  cleaningWinterMechanizedPpeSignalVestResourceId,
  cleaningWinterMechanizedPpeInsulatedBootsResourceId,
  cleaningWinterMechanizedPpePolymerGlovesResourceId,
  cleaningWinterMechanizedPpeInsulatedMittensResourceId,
  cleaningWinterMechanizedPpeRubberBootsResourceId,
  cleaningWinterMechanizedPpeSoapResourceId,
] as const;
const cleaningWinterMechanizedGrossResourceIds = [
  ...cleaningWinterMechanizedMachinistResourceIds,
  ...cleaningWinterMechanizedMachineResourceIds,
  ...cleaningWinterMechanizedMaterialResourceIds,
  cleaningWinterMechanizedInsuranceResourceId,
  cleaningWinterMechanizedOverheadResourceId,
  cleaningWinterMechanizedProfitResourceId,
  cleaningWinterMechanizedUsnResourceId,
  cleaningWinterMechanizedVatResourceId,
] as const;

const cleaningWinterManualLaborResourceIds = [
  cleaningWinterManualSnowSweepingWorkerResourceId,
  cleaningWinterManualAntiIceWorkerResourceId,
  cleaningWinterManualRoadSnowIceWorkerResourceId,
  cleaningWinterManualContainerSiteWorkerResourceId,
] as const;
const cleaningWinterManualPpeResourceIds = [
  cleaningWinterManualPpeCottonSuitResourceId,
  cleaningWinterManualPpeInsulatedJacketResourceId,
  cleaningWinterManualPpeSignalVestResourceId,
  cleaningWinterManualPpeInsulatedBootsResourceId,
  cleaningWinterManualPpePolymerGlovesResourceId,
  cleaningWinterManualPpeInsulatedMittensResourceId,
  cleaningWinterManualPpeRubberBootsResourceId,
  cleaningWinterManualPpeSoapResourceId,
] as const;
const cleaningWinterManualInventoryResourceIds = [
  cleaningWinterManualInventoryIceAxeResourceId,
  cleaningWinterManualInventoryPolypropyleneBroomResourceId,
  cleaningWinterManualInventoryRakeResourceId,
  cleaningWinterManualInventorySnowShovelResourceId,
  cleaningWinterManualInventoryScoopShovelResourceId,
  cleaningWinterManualInventoryWheelbarrowResourceId,
  cleaningWinterManualInventoryBucketResourceId,
] as const;
const cleaningWinterManualMaterialResourceIds = [
  cleaningWinterManualSandResourceId,
  ...cleaningWinterManualPpeResourceIds,
  ...cleaningWinterManualInventoryResourceIds,
] as const;
const cleaningWinterManualGrossResourceIds = [
  ...cleaningWinterManualLaborResourceIds,
  ...cleaningWinterManualMaterialResourceIds,
  cleaningWinterManualInsuranceResourceId,
  cleaningWinterManualOverheadResourceId,
  cleaningWinterManualProfitResourceId,
  cleaningWinterManualUsnResourceId,
  cleaningWinterManualVatResourceId,
] as const;

export const cleaningWorkItems = [
  detailWorkItem({
    id: 'cleaning-winter-mechanized',
    title: 'Зимняя механизированная уборка территории',
    estimate_row_id: 'cleaning-winter-mechanized',
    service_ids: [
      'winter-road-snow-ice-clearing',
      'winter-heavy-snowfall-road-clearing',
      'winter-anti-ice-spreading',
    ],
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSnowSource,
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedTotalsSource,
    ),
    note: 'Внутри агрегированной строки сохранены позиции 1.1-1.4: обычное подметание снега, подметание при обильном снегопаде, посыпка песком и СИЗ.',
    ...detailStatus('verified'),
  }),
  detailWorkItem({
    id: 'cleaning-winter-manual',
    title: 'Зимняя ручная уборка территории',
    estimate_row_id: 'cleaning-winter-manual',
    service_ids: [
      'winter-paths-playgrounds-clearing',
      'winter-anti-ice-spreading',
    ],
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionSnowSource,
      cleaningWinterManualProductionWorksSource,
      cleaningWinterManualProductionInventorySource,
      cleaningWinterManualTotalsSource,
    ),
    note: 'Внутри агрегированной строки сохранены позиции 2.1-2.7: ручное подметание снега, подсыпка песком, очистка участков дорог от снега и наледи, контейнерная площадка, СИЗ и инвентарь. В PDF нет позиции 2.6.',
    ...detailStatus('verified'),
  }),
] satisfies readonly EstimateDetailWorkItem[];

export const cleaningResources = [
  detailResource({
    id: cleaningWinterMechanizedSnow2cmMachinistResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'machinist_labor',
    title: 'Машинист: подметание свежевыпавшего снега толщиной 2 см',
    cost_bucket: 'machinist_salary',
    quantity: detailQuantity(2_160, 'чел-час', {
      raw: '2160',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(934.32, { raw: '934,32' }),
    total_rub: detailMoney(2_018_293.38, { raw: '2 018 293,38' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSnowSource,
      cleaningStaffSource,
      cleaningWinterMechanizedSnow2cmSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedHeavySnowMachinistResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'machinist_labor',
    title: 'Машинист: подметание снега толщиной свыше 2 см',
    cost_bucket: 'machinist_salary',
    quantity: detailQuantity(2_980, 'чел-час', {
      raw: '2980',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(934.32, { raw: '934,32' }),
    total_rub: detailMoney(2_783_931.69, { raw: '2 783 931,69' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSnowSource,
      cleaningStaffSource,
      cleaningWinterMechanizedHeavySnowSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedSandMachinistResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'machinist_labor',
    title: 'Машинист: посыпка дорог песком',
    cost_bucket: 'machinist_salary',
    quantity: detailQuantity(210, 'чел-час', {
      raw: '210',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(934.32, { raw: '934,32' }),
    total_rub: detailMoney(196_544.88, { raw: '196 544,88' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningStaffSource,
      cleaningWinterMechanizedSandSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedSnow2cmTractorResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'machine',
    title: 'Трактор МТЗ 80 с навесным оборудованием: подметание снега 2 см',
    cost_bucket: 'machines',
    quantity: detailQuantity(2_160, 'маш-час', {
      raw: '2160',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(1_476.02, { raw: '1476,02' }),
    total_rub: detailMoney(3_188_460.49, { raw: '3 188 460,49' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSnowSource,
      cleaningWinterMechanizedSnow2cmSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedHeavySnowTractorResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'machine',
    title:
      'Трактор МТЗ 80 с навесным оборудованием: подметание снега свыше 2 см',
    cost_bucket: 'machines',
    quantity: detailQuantity(2_980, 'маш-час', {
      raw: '2980',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(1_476.02, { raw: '1476,02' }),
    total_rub: detailMoney(4_398_000.94, { raw: '4 398 000,94' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSnowSource,
      cleaningWinterMechanizedHeavySnowSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedSandTractorResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'machine',
    title: 'Трактор МТЗ 80 с навесным оборудованием: посыпка дорог песком',
    cost_bucket: 'machines',
    quantity: detailQuantity(210, 'маш-час', {
      raw: '210',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(1_476.02, { raw: '1476,02' }),
    total_rub: detailMoney(310_497.76, { raw: '310 497,76' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedSandSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedSandSpreaderResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'machine',
    title: 'Навесной разбрасыватель песка РПМ-01',
    cost_bucket: 'machines',
    quantity: detailQuantity(210, 'маш-час', {
      raw: '210',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(40.76, { raw: '40,76' }),
    total_rub: detailMoney(8_574.51, { raw: '8 574,51' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedSandSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedSandResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'material',
    title: 'Песок для посыпки дорог',
    cost_bucket: 'materials',
    quantity: detailQuantity(73.6, 'т.', {
      raw: '73,6',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(1_800, { raw: '1800,00' }),
    total_rub: detailMoney(132_480.36, { raw: '132 480,36' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedSandSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedPpeCottonSuitResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'material',
    title: 'Костюм хлопчатобумажный',
    cost_bucket: 'materials',
    quantity: detailQuantity(2.7, 'шт.', { raw: '2,7' }),
    unit_price_rub: detailMoney(5_500, { raw: '5500,00' }),
    total_rub: detailMoney(14_850, { raw: '14 850,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedPpeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedPpeInsulatedJacketResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'material',
    title: 'Куртка на утепляющей прокладке',
    cost_bucket: 'materials',
    quantity: detailQuantity(1.1, 'шт.', {
      raw: '1,1',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(6_000, { raw: '6000,00' }),
    total_rub: detailMoney(6_480, { raw: '6 480,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedPpeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedPpeSignalVestResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'material',
    title: 'Жилет сигнальный',
    cost_bucket: 'materials',
    quantity: detailQuantity(2.7, 'шт.', { raw: '2,7' }),
    unit_price_rub: detailMoney(1_200, { raw: '1200,00' }),
    total_rub: detailMoney(3_240, { raw: '3 240,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedPpeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedPpeInsulatedBootsResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'material',
    title: 'Сапоги утепленные',
    cost_bucket: 'materials',
    quantity: detailQuantity(1.1, 'шт.', {
      raw: '1,1',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(3_500, { raw: '3500,00' }),
    total_rub: detailMoney(3_780, { raw: '3 780,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedPpeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedPpePolymerGlovesResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'material',
    title: 'Перчатки с полимерным покрытием',
    cost_bucket: 'materials',
    quantity: detailQuantity(10.8, 'шт.', { raw: '10,8' }),
    unit_price_rub: detailMoney(350, { raw: '350,00' }),
    total_rub: detailMoney(3_780, { raw: '3 780,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedPpeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedPpeInsulatedMittensResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'material',
    title: 'Рукавицы утепленные',
    cost_bucket: 'materials',
    quantity: detailQuantity(10.8, 'шт.', { raw: '10,8' }),
    unit_price_rub: detailMoney(700, { raw: '700,00' }),
    total_rub: detailMoney(7_560, { raw: '7 560,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedPpeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedPpeRubberBootsResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'material',
    title: 'Сапоги резиновые',
    cost_bucket: 'materials',
    quantity: detailQuantity(2.7, 'шт.', { raw: '2,7' }),
    unit_price_rub: detailMoney(2_000, { raw: '2000,00' }),
    total_rub: detailMoney(5_400, { raw: '5 400,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedPpeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedPpeSoapResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'material',
    title: 'Мыло туалетное',
    cost_bucket: 'materials',
    quantity: detailQuantity(32.4, 'шт.', { raw: '32,4' }),
    unit_price_rub: detailMoney(116, { raw: '116,00' }),
    total_rub: detailMoney(3_758.4, { raw: '3 758,40' }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedProductionSandSource,
      cleaningWinterMechanizedPpeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedInsuranceResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'other_cost',
    title: 'Страховые взносы по зимней механизированной уборке',
    cost_bucket: 'insurance',
    total_rub: detailMoney(1_509_628.52, { raw: '1 509 628,52' }),
    source_refs: detailSourceRefs(cleaningWinterMechanizedTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedOverheadResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'other_cost',
    title: 'Общеэксплуатационные расходы по зимней механизированной уборке',
    cost_bucket: 'overhead',
    total_rub: detailMoney(3_499_138.97, { raw: '3 499 138,97' }),
    source_refs: detailSourceRefs(cleaningWinterMechanizedTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedProfitResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'other_cost',
    title: 'Прибыль по зимней механизированной уборке',
    cost_bucket: 'profit',
    total_rub: detailMoney(1_999_507.98, { raw: '1 999 507,98' }),
    source_refs: detailSourceRefs(cleaningWinterMechanizedTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterMechanizedUsnResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'other_cost',
    title: 'Расчетная доля УСН по зимней механизированной уборке',
    cost_bucket: 'usn',
    total_rub: detailMoney(352_872.12, {
      raw: '20 446 780,00 - 20 093 907,88',
      note: 'выведено из строки estimate-2026 и итога раздела cleaning.pdf',
    }),
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedTotalsSource,
      cleaningCalculationSource,
    ),
    note: 'В cleaning.pdf УСН показан только общей суммой по услуге, без распределения по строкам.',
    ...detailStatus('derived'),
  }),
  detailResource({
    id: cleaningWinterMechanizedVatResourceId,
    work_item_id: 'cleaning-winter-mechanized',
    estimate_row_id: 'cleaning-winter-mechanized',
    kind: 'other_cost',
    title: 'Расчетный НДС 5% по зимней механизированной уборке',
    cost_bucket: 'vat',
    total_rub: detailMoney(1_022_339, {
      raw: '21 469 119 - 20 446 780,00',
      note: 'выведено из строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      cleaningDocumentVatSource,
      cleaningCalculationSource,
    ),
    note: cleaningVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      cleaningDerivedVatNeedsCheckReason,
      cleaningDerivedVatNeedsCheckRefs,
    ),
  }),
  detailResource({
    id: cleaningWinterManualSnowSweepingWorkerResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'labor',
    title:
      'Рабочий по уборке территории: подметание свежевыпавшего снега вручную',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(73.3, 'чел-час', {
      raw: '73,3',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(664.15, { raw: '664,15' }),
    total_rub: detailMoney(48_706.24, { raw: '48 706,24' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionSnowSource,
      cleaningStaffSource,
      cleaningWinterManualSnowSweepingSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualAntiIceWorkerResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'labor',
    title:
      'Рабочий по уборке территории: подсыпка противогололедным материалом',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(29.2, 'чел-час', {
      raw: '29,2',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(664.15, { raw: '664,15' }),
    total_rub: detailMoney(19_383.1, { raw: '19 383,10' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionWorksSource,
      cleaningStaffSource,
      cleaningWinterManualAntiIceSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualRoadSnowIceWorkerResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'labor',
    title:
      'Рабочий по уборке территории: очистка участков от снега и наледи при механизированной уборке',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(1_264.8, 'чел-час', {
      raw: '1264,8',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(664.15, { raw: '664,15' }),
    total_rub: detailMoney(840_033.57, { raw: '840 033,57' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionWorksSource,
      cleaningStaffSource,
      cleaningWinterManualRoadSnowIceSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualContainerSiteWorkerResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'labor',
    title:
      'Рабочий по уборке территории: очистка контейнерной площадки в холодный период',
    cost_bucket: 'primary_salary',
    quantity: detailQuantity(457.9, 'чел-час', {
      raw: '457,9',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(664.15, { raw: '664,15' }),
    total_rub: detailMoney(304_125.64, { raw: '304 125,64' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionWorksSource,
      cleaningStaffSource,
      cleaningWinterManualContainerSiteSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualSandResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Песок для посыпки дорог',
    cost_bucket: 'materials',
    quantity: detailQuantity(2.7, 'т.', {
      raw: '2,7',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(1_800, { raw: '1800,00' }),
    total_rub: detailMoney(4_849.2, { raw: '4 849,20' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionWorksSource,
      cleaningWinterManualAntiIceSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualPpeCottonSuitResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Костюм хлопчатобумажный',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.9, 'шт.', { raw: '0,9' }),
    unit_price_rub: detailMoney(5_500, { raw: '5500,00' }),
    total_rub: detailMoney(4_950, { raw: '4 950,00' }),
    source_refs: detailSourceRefs(cleaningWinterManualPpeSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualPpeInsulatedJacketResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Куртка на утепляющей прокладке',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.4, 'шт.', {
      raw: '0,4',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(6_000, { raw: '6000,00' }),
    total_rub: detailMoney(2_160, { raw: '2 160,00' }),
    source_refs: detailSourceRefs(cleaningWinterManualPpeSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualPpeSignalVestResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Жилет сигнальный',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.9, 'шт.', { raw: '0,9' }),
    unit_price_rub: detailMoney(1_200, { raw: '1200,00' }),
    total_rub: detailMoney(1_080, { raw: '1 080,00' }),
    source_refs: detailSourceRefs(cleaningWinterManualPpeSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualPpeInsulatedBootsResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Сапоги утепленные',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.4, 'шт.', {
      raw: '0,4',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(3_500, { raw: '3500,00' }),
    total_rub: detailMoney(1_260, { raw: '1 260,00' }),
    source_refs: detailSourceRefs(cleaningWinterManualPpeSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualPpePolymerGlovesResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Перчатки с полимерным покрытием',
    cost_bucket: 'materials',
    quantity: detailQuantity(3.6, 'шт.', { raw: '3,6' }),
    unit_price_rub: detailMoney(350, { raw: '350,00' }),
    total_rub: detailMoney(1_260, { raw: '1 260,00' }),
    source_refs: detailSourceRefs(cleaningWinterManualPpeSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualPpeInsulatedMittensResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Рукавицы утепленные',
    cost_bucket: 'materials',
    quantity: detailQuantity(3.6, 'шт.', { raw: '3,6' }),
    unit_price_rub: detailMoney(700, { raw: '700,00' }),
    total_rub: detailMoney(2_520, { raw: '2 520,00' }),
    source_refs: detailSourceRefs(cleaningWinterManualPpeSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualPpeRubberBootsResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Сапоги резиновые',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.9, 'шт.', { raw: '0,9' }),
    unit_price_rub: detailMoney(2_000, { raw: '2000,00' }),
    total_rub: detailMoney(1_800, { raw: '1 800,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionInventorySource,
      cleaningWinterManualPpeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualPpeSoapResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Мыло туалетное',
    cost_bucket: 'materials',
    quantity: detailQuantity(10.8, 'шт.', { raw: '10,8' }),
    unit_price_rub: detailMoney(116, { raw: '116,00' }),
    total_rub: detailMoney(1_252.8, { raw: '1 252,80' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionInventorySource,
      cleaningWinterManualPpeSource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualInventoryIceAxeResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Ледоруб-топор с металлической ручкой',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.2, 'шт.', {
      raw: '0,2',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(700, { raw: '700,00' }),
    total_rub: detailMoney(126, { raw: '126,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionInventorySource,
      cleaningWinterManualInventorySource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualInventoryPolypropyleneBroomResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Метла полипропиленовая с черенком',
    cost_bucket: 'materials',
    quantity: detailQuantity(4.5, 'шт.', { raw: '4,5' }),
    unit_price_rub: detailMoney(370, { raw: '370,00' }),
    total_rub: detailMoney(1_665, { raw: '1 665,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionInventorySource,
      cleaningWinterManualInventorySource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualInventoryRakeResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Грабли с черенком',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.3, 'шт.', {
      raw: '0,3',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(500, { raw: '500,00' }),
    total_rub: detailMoney(148.5, { raw: '148,50' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionInventorySource,
      cleaningWinterManualInventorySource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualInventorySnowShovelResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Лопата снегоуборочная оцинкованная',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.5, 'шт.', {
      raw: '0,5',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(2_500, { raw: '2500,00' }),
    total_rub: detailMoney(1_125, { raw: '1 125,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionInventorySource,
      cleaningWinterManualInventorySource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualInventoryScoopShovelResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Лопата совковая',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.5, 'шт.', {
      raw: '0,5',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(1_034, { raw: '1034,00' }),
    total_rub: detailMoney(465.3, { raw: '465,30' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionInventorySource,
      cleaningWinterManualInventorySource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualInventoryWheelbarrowResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Тачка садовая',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.5, 'шт.', {
      raw: '0,5',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(2_500, { raw: '2500,00' }),
    total_rub: detailMoney(1_125, { raw: '1 125,00' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionInventorySource,
      cleaningWinterManualInventorySource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualInventoryBucketResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'material',
    title: 'Ведро п\\э 12 л',
    cost_bucket: 'materials',
    quantity: detailQuantity(0.3, 'шт.', {
      raw: '0,3',
      note: cleaningRoundedQuantityNote,
    }),
    unit_price_rub: detailMoney(200, { raw: '200,00' }),
    total_rub: detailMoney(59.4, { raw: '59,40' }),
    source_refs: detailSourceRefs(
      cleaningWinterManualProductionInventorySource,
      cleaningWinterManualInventorySource,
    ),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualInsuranceResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'other_cost',
    title: 'Страховые взносы по зимней ручной уборке',
    cost_bucket: 'insurance',
    total_rub: detailMoney(366_099.05, { raw: '366 099,05' }),
    source_refs: detailSourceRefs(cleaningWinterManualTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualOverheadResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'other_cost',
    title: 'Общеэксплуатационные расходы по зимней ручной уборке',
    cost_bucket: 'overhead',
    total_rub: detailMoney(848_573.98, { raw: '848 573,98' }),
    source_refs: detailSourceRefs(cleaningWinterManualTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualProfitResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'other_cost',
    title: 'Прибыль по зимней ручной уборке',
    cost_bucket: 'profit',
    total_rub: detailMoney(484_899.42, { raw: '484 899,42' }),
    source_refs: detailSourceRefs(cleaningWinterManualTotalsSource),
    ...detailStatus('verified'),
  }),
  detailResource({
    id: cleaningWinterManualUsnResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'other_cost',
    title: 'Расчетная доля УСН по зимней ручной уборке',
    cost_bucket: 'usn',
    total_rub: detailMoney(51_588.99, {
      raw: '2 989 256,19 - 2 937 667,20',
      note: 'выведено из строки estimate-2026 и итога раздела cleaning.pdf',
    }),
    source_refs: detailSourceRefs(
      cleaningWinterManualTotalsSource,
      cleaningCalculationSource,
    ),
    note: 'В cleaning.pdf УСН показан только общей суммой по услуге, без распределения по строкам.',
    ...detailStatus('derived'),
  }),
  detailResource({
    id: cleaningWinterManualVatResourceId,
    work_item_id: 'cleaning-winter-manual',
    estimate_row_id: 'cleaning-winter-manual',
    kind: 'other_cost',
    title: 'Расчетный НДС 5% по зимней ручной уборке',
    cost_bucket: 'vat',
    total_rub: detailMoney(149_462.81, {
      raw: '3 138 719 - 2 989 256,19',
      note: 'выведено из строки estimate-2026',
    }),
    source_refs: detailSourceRefs(
      cleaningDocumentVatSource,
      cleaningCalculationSource,
    ),
    note: cleaningVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      cleaningDerivedVatNeedsCheckReason,
      cleaningWinterManualDerivedVatNeedsCheckRefs,
    ),
  }),
] satisfies readonly EstimateDetailResource[];

export const cleaningControlTotals = [
  detailControlTotal({
    id: 'cleaning-winter-mechanized-machinist-salary',
    estimate_row_id: 'cleaning-winter-mechanized',
    cost_bucket: 'machinist_salary',
    source_total_rub: detailMoney(4_998_769.96, { raw: '4 998 769,96' }),
    detail_total_rub: detailMoney(4_998_769.96, {
      raw: '4 998 769,96',
      note: 'разделовый итог из PDF; сумма округленных позиций дает 4 998 769,95',
    }),
    aggregate_total_rub: detailMoney(4_998_769.96),
    delta_rub: 0,
    tolerance_rub: 0.02,
    resource_ids: cleaningWinterMechanizedMachinistResourceIds,
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedSnow2cmSource,
      cleaningWinterMechanizedHeavySnowSource,
      cleaningWinterMechanizedHeavySnowTotalSource,
      cleaningWinterMechanizedSandSource,
      cleaningWinterMechanizedSandTotalSource,
      cleaningWinterMechanizedTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-mechanized-machines',
    estimate_row_id: 'cleaning-winter-mechanized',
    cost_bucket: 'machines',
    source_total_rub: detailMoney(7_905_533.7, { raw: '7 905 533,70' }),
    detail_total_rub: detailMoney(7_905_533.7, { raw: '7 905 533,70' }),
    aggregate_total_rub: detailMoney(7_905_533.7),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: cleaningWinterMechanizedMachineResourceIds,
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedSnow2cmSource,
      cleaningWinterMechanizedHeavySnowSource,
      cleaningWinterMechanizedHeavySnowTotalSource,
      cleaningWinterMechanizedSandSource,
      cleaningWinterMechanizedSandTotalSource,
      cleaningWinterMechanizedTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-mechanized-materials',
    estimate_row_id: 'cleaning-winter-mechanized',
    cost_bucket: 'materials',
    source_total_rub: detailMoney(181_328.76, { raw: '181 328,76' }),
    detail_total_rub: detailMoney(181_328.76, { raw: '181 328,76' }),
    aggregate_total_rub: detailMoney(181_328.76),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: cleaningWinterMechanizedMaterialResourceIds,
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedSandSource,
      cleaningWinterMechanizedSandTotalSource,
      cleaningWinterMechanizedPpeSource,
      cleaningWinterMechanizedTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-mechanized-insurance',
    estimate_row_id: 'cleaning-winter-mechanized',
    cost_bucket: 'insurance',
    source_total_rub: detailMoney(1_509_628.52, { raw: '1 509 628,52' }),
    detail_total_rub: detailMoney(1_509_628.52, { raw: '1 509 628,52' }),
    aggregate_total_rub: detailMoney(1_509_628.52),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [cleaningWinterMechanizedInsuranceResourceId],
    source_refs: detailSourceRefs(cleaningWinterMechanizedTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-mechanized-overhead',
    estimate_row_id: 'cleaning-winter-mechanized',
    cost_bucket: 'overhead',
    source_total_rub: detailMoney(3_499_138.97, { raw: '3 499 138,97' }),
    detail_total_rub: detailMoney(3_499_138.97, { raw: '3 499 138,97' }),
    aggregate_total_rub: detailMoney(3_499_138.97),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [cleaningWinterMechanizedOverheadResourceId],
    source_refs: detailSourceRefs(cleaningWinterMechanizedTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-mechanized-profit',
    estimate_row_id: 'cleaning-winter-mechanized',
    cost_bucket: 'profit',
    source_total_rub: detailMoney(1_999_507.98, { raw: '1 999 507,98' }),
    detail_total_rub: detailMoney(1_999_507.98, { raw: '1 999 507,98' }),
    aggregate_total_rub: detailMoney(1_999_507.98),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [cleaningWinterMechanizedProfitResourceId],
    source_refs: detailSourceRefs(cleaningWinterMechanizedTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-mechanized-usn',
    estimate_row_id: 'cleaning-winter-mechanized',
    cost_bucket: 'usn',
    source_total_rub: detailMoney(352_872.12, {
      raw: '20 446 780,00 - 20 093 907,88',
    }),
    detail_total_rub: detailMoney(352_872.12),
    aggregate_total_rub: detailMoney(352_872.12),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [cleaningWinterMechanizedUsnResourceId],
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedTotalsSource,
      cleaningCalculationSource,
    ),
    note: 'УСН выведен для строки, потому что cleaning.pdf показывает УСН только общей суммой по услуге.',
    ...detailStatus('derived'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-mechanized-vat',
    estimate_row_id: 'cleaning-winter-mechanized',
    cost_bucket: 'vat',
    source_total_rub: detailMoney(1_022_339, {
      raw: '21 469 119 - 20 446 780,00',
    }),
    detail_total_rub: detailMoney(1_022_339),
    aggregate_total_rub: detailMoney(1_022_339),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [cleaningWinterMechanizedVatResourceId],
    source_refs: detailSourceRefs(
      cleaningDocumentVatSource,
      cleaningCalculationSource,
    ),
    note: cleaningVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      cleaningDerivedVatNeedsCheckReason,
      cleaningDerivedVatNeedsCheckRefs,
    ),
  }),
  detailControlTotal({
    id: 'cleaning-winter-mechanized-gross',
    estimate_row_id: 'cleaning-winter-mechanized',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(21_469_119, {
      raw: '20 093 907,88 + 352 872,12 + 1 022 339,00',
    }),
    detail_total_rub: detailMoney(21_469_119),
    aggregate_total_rub: detailMoney(21_469_119),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: cleaningWinterMechanizedGrossResourceIds,
    source_refs: detailSourceRefs(
      cleaningWinterMechanizedTotalsSource,
      cleaningDocumentVatSource,
      cleaningCalculationSource,
    ),
    note: cleaningVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      cleaningDerivedVatNeedsCheckReason,
      cleaningDerivedVatNeedsCheckRefs,
    ),
  }),
  detailControlTotal({
    id: 'cleaning-winter-manual-primary-salary',
    estimate_row_id: 'cleaning-winter-manual',
    cost_bucket: 'primary_salary',
    source_total_rub: detailMoney(1_212_248.55, { raw: '1 212 248,55' }),
    detail_total_rub: detailMoney(1_212_248.55, { raw: '1 212 248,55' }),
    aggregate_total_rub: detailMoney(1_212_248.55),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: cleaningWinterManualLaborResourceIds,
    source_refs: detailSourceRefs(
      cleaningWinterManualSnowSweepingSource,
      cleaningWinterManualAntiIceSource,
      cleaningWinterManualRoadSnowIceSource,
      cleaningWinterManualContainerSiteSource,
      cleaningWinterManualTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-manual-materials',
    estimate_row_id: 'cleaning-winter-manual',
    cost_bucket: 'materials',
    source_total_rub: detailMoney(25_846.2, { raw: '25 846,20' }),
    detail_total_rub: detailMoney(25_846.2, { raw: '25 846,20' }),
    aggregate_total_rub: detailMoney(25_846.2),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: cleaningWinterManualMaterialResourceIds,
    source_refs: detailSourceRefs(
      cleaningWinterManualAntiIceSource,
      cleaningWinterManualPpeSource,
      cleaningWinterManualInventorySource,
      cleaningWinterManualTotalsSource,
    ),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-manual-insurance',
    estimate_row_id: 'cleaning-winter-manual',
    cost_bucket: 'insurance',
    source_total_rub: detailMoney(366_099.05, { raw: '366 099,05' }),
    detail_total_rub: detailMoney(366_099.05, { raw: '366 099,05' }),
    aggregate_total_rub: detailMoney(366_099.05),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [cleaningWinterManualInsuranceResourceId],
    source_refs: detailSourceRefs(cleaningWinterManualTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-manual-overhead',
    estimate_row_id: 'cleaning-winter-manual',
    cost_bucket: 'overhead',
    source_total_rub: detailMoney(848_573.98, { raw: '848 573,98' }),
    detail_total_rub: detailMoney(848_573.98, { raw: '848 573,98' }),
    aggregate_total_rub: detailMoney(848_573.98),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [cleaningWinterManualOverheadResourceId],
    source_refs: detailSourceRefs(cleaningWinterManualTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-manual-profit',
    estimate_row_id: 'cleaning-winter-manual',
    cost_bucket: 'profit',
    source_total_rub: detailMoney(484_899.42, { raw: '484 899,42' }),
    detail_total_rub: detailMoney(484_899.42, { raw: '484 899,42' }),
    aggregate_total_rub: detailMoney(484_899.42),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [cleaningWinterManualProfitResourceId],
    source_refs: detailSourceRefs(cleaningWinterManualTotalsSource),
    ...detailStatus('verified'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-manual-usn',
    estimate_row_id: 'cleaning-winter-manual',
    cost_bucket: 'usn',
    source_total_rub: detailMoney(51_588.99, {
      raw: '2 989 256,19 - 2 937 667,20',
    }),
    detail_total_rub: detailMoney(51_588.99),
    aggregate_total_rub: detailMoney(51_588.99),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [cleaningWinterManualUsnResourceId],
    source_refs: detailSourceRefs(
      cleaningWinterManualTotalsSource,
      cleaningCalculationSource,
    ),
    note: 'УСН выведен для строки, потому что cleaning.pdf показывает УСН только общей суммой по услуге.',
    ...detailStatus('derived'),
  }),
  detailControlTotal({
    id: 'cleaning-winter-manual-vat',
    estimate_row_id: 'cleaning-winter-manual',
    cost_bucket: 'vat',
    source_total_rub: detailMoney(149_462.81, {
      raw: '3 138 719 - 2 989 256,19',
    }),
    detail_total_rub: detailMoney(149_462.81),
    aggregate_total_rub: detailMoney(149_462.81),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: [cleaningWinterManualVatResourceId],
    source_refs: detailSourceRefs(
      cleaningDocumentVatSource,
      cleaningCalculationSource,
    ),
    note: cleaningVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      cleaningDerivedVatNeedsCheckReason,
      cleaningWinterManualDerivedVatNeedsCheckRefs,
    ),
  }),
  detailControlTotal({
    id: 'cleaning-winter-manual-gross',
    estimate_row_id: 'cleaning-winter-manual',
    cost_bucket: 'gross',
    source_total_rub: detailMoney(3_138_719, {
      raw: '2 937 667,20 + 51 588,99 + 149 462,81',
    }),
    detail_total_rub: detailMoney(3_138_719),
    aggregate_total_rub: detailMoney(3_138_719),
    delta_rub: 0,
    tolerance_rub: 0.01,
    resource_ids: cleaningWinterManualGrossResourceIds,
    source_refs: detailSourceRefs(
      cleaningWinterManualTotalsSource,
      cleaningDocumentVatSource,
      cleaningCalculationSource,
    ),
    note: cleaningVatNeedsCheckNote,
    ...detailNeedsCheckStatus(
      cleaningDerivedVatNeedsCheckReason,
      cleaningWinterManualDerivedVatNeedsCheckRefs,
    ),
  }),
] satisfies readonly EstimateDetailControlTotal[];
