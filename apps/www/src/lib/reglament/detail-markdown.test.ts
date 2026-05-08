import { describe, expect, it } from 'vitest';

import type { EstimateDetailDataset } from './detail-schema';
import {
  buildEstimateDetailChecksMarkdown,
  buildEstimateDetailLaborMarkdown,
  buildEstimateDetailMachinesMarkdown,
  buildEstimateDetailMarkdown,
  buildEstimateDetailMaterialsMarkdown,
} from './detail-markdown';

const fixtureDataset = {
  schema_version: '1',
  dataset_id: 'estimate-details-2026',
  title: 'Тестовая детализация сметы 2026',
  year: 2026,
  source_pdfs: [
    {
      pdf: 'cleaning',
      title: 'Детализация уборки',
      pages_total: 4,
    },
  ],
  curation_notes: ['Тестовая заметка.'],
  work_items: [
    {
      id: 'work-verified',
      title: 'Проверенная работа',
      estimate_row_id: 'cleaning-row',
      service_ids: ['service-cleaning'],
      status: 'verified',
      status_label_ru: 'проверено',
      source_refs: [
        {
          pdf: 'cleaning',
          page: 2,
          fragment: 'Локальная смета / строка 1',
          quote: 'Проверенная работа',
        },
      ],
    },
    {
      id: 'work-needs-check',
      title: 'Работа для сверки',
      estimate_row_id: 'cleaning-row-check',
      status: 'needs_check',
      status_label_ru: 'требует проверки',
      needs_check: {
        reason: 'Неоднозначная строка PDF.',
      },
      source_refs: [
        {
          pdf: 'cleaning',
          page: 3,
          fragment: 'Локальная смета / строка 2',
        },
      ],
    },
  ],
  resources: [
    {
      id: 'material-sand',
      work_item_id: 'work-verified',
      estimate_row_id: 'cleaning-row',
      kind: 'material',
      title: 'Песок',
      cost_bucket: 'materials',
      quantity: {
        value: 12.5,
        unit: 'т',
        raw: '12,5 т',
      },
      unit_price_rub: {
        value: 1000,
        raw: '1 000,00',
      },
      total_rub: {
        value: 12500,
        raw: '12 500,00',
      },
      status: 'verified',
      status_label_ru: 'проверено',
      source_refs: [
        {
          pdf: 'cleaning',
          page: 4,
          fragment: 'Ведомость ресурсов / материалы / строка 1',
          quote: 'Песок 12,5 т 1 000,00 12 500,00',
          quote_items: [
            {
              label: 'Песок',
              resource_ids: ['material-sand'],
              quantity: {
                value: 12.5,
                unit: 'т',
              },
              unit_price_rub: {
                value: 1000,
              },
              total_rub: {
                value: 12500,
              },
            },
          ],
        },
      ],
    },
    {
      id: 'machine-loader',
      work_item_id: 'work-verified',
      estimate_row_id: 'cleaning-row',
      kind: 'machine',
      title: 'Погрузчик',
      cost_bucket: 'machines',
      total_rub: {
        value: 5000,
        raw: '5 000,00',
      },
      status: 'verified',
      status_label_ru: 'проверено',
      source_refs: [
        {
          pdf: 'cleaning',
          page: 4,
          fragment: 'Ведомость ресурсов / машины / строка 2',
        },
      ],
    },
    {
      id: 'labor-worker',
      work_item_id: 'work-verified',
      estimate_row_id: 'cleaning-row',
      kind: 'labor',
      title: 'Рабочий зеленого хозяйства',
      cost_bucket: 'primary_salary',
      quantity: {
        value: 8,
        unit: 'чел.-ч',
        raw: '8 чел.-ч',
      },
      unit_price_rub: {
        value: 2000,
        raw: '2 000,00',
      },
      total_rub: {
        value: 16000,
        raw: '16 000,00',
      },
      status: 'verified',
      status_label_ru: 'проверено',
      source_refs: [
        {
          pdf: 'cleaning',
          page: 4,
          fragment: 'Ведомость ресурсов / труд / строка 3',
        },
      ],
    },
    {
      id: 'machinist-loader',
      work_item_id: 'work-verified',
      estimate_row_id: 'cleaning-row',
      kind: 'machinist_labor',
      title: 'Машинист погрузчика',
      cost_bucket: 'machinist_salary',
      total_rub: {
        value: 3000,
        raw: '3 000,00',
      },
      status: 'needs_check',
      status_label_ru: 'требует проверки',
      needs_check: {
        reason: 'Ставка не выделена отдельной строкой.',
      },
      source_refs: [
        {
          pdf: 'cleaning',
          page: 4,
          fragment: 'Ведомость ресурсов / труд машинистов / строка 4',
        },
      ],
    },
  ],
  control_totals: [
    {
      id: 'cleaning-materials-total',
      estimate_row_id: 'cleaning-row',
      control_source: 'section_pdf',
      cost_bucket: 'materials',
      source_total_rub: {
        value: 12500,
        raw: '12 500,00',
      },
      detail_total_rub: {
        value: 12500,
        raw: '12 500,00',
      },
      aggregate_total_rub: {
        value: 12525,
        raw: '12 525,00',
      },
      delta_rub: -25,
      tolerance_rub: 1,
      resource_ids: ['material-sand'],
      status: 'needs_check',
      status_label_ru: 'требует проверки',
      needs_check: {
        reason: 'Расхождение больше допуска.',
      },
      source_refs: [
        {
          pdf: 'cleaning',
          page: 4,
          fragment: 'Итого материалы',
        },
      ],
    },
  ],
} satisfies EstimateDetailDataset;

describe('estimate detail markdown companions', () => {
  it('serves every detail markdown endpoint', async () => {
    const cases = [
      {
        name: 'overview',
        load: () => import('../../pages/815/regulation/details.md'),
        marker: '# Детальная смета 2026',
      },
      {
        name: 'materials',
        load: () => import('../../pages/815/regulation/details/materials.md'),
        marker: '# Детальная смета 2026: материалы',
      },
      {
        name: 'machines',
        load: () => import('../../pages/815/regulation/details/machines.md'),
        marker: '# Детальная смета 2026: машины',
      },
      {
        name: 'labor',
        load: () => import('../../pages/815/regulation/details/labor.md'),
        marker: '# Детальная смета 2026: труд',
      },
      {
        name: 'checks',
        load: () => import('../../pages/815/regulation/details/checks.md'),
        marker: '# Детальная смета 2026: проверки',
      },
    ];

    for (const item of cases) {
      const route = await item.load();
      const response = await route.GET({} as never);
      const body = await response.text();

      expect(response.headers.get('Content-Type'), item.name).toContain(
        'text/markdown',
      );
      expect(body, item.name).toContain(item.marker);
      expect(body, item.name).toContain(
        '/815/regulation/data/estimate-details-2026.json',
      );
    }
  });

  it('builds an overview from dataset counts and links topical files', () => {
    const markdown = buildEstimateDetailMarkdown(fixtureDataset);

    expect(markdown).toContain('# Детальная смета 2026');
    expect(markdown).toContain(
      '/815/regulation/data/estimate-details-2026.json',
    );
    expect(markdown).toContain('/815/regulation/details/materials.md');
    expect(markdown).toContain('/815/regulation/data/estimate-2026.json');
    expect(markdown).toContain('/815/regulation/data/full-2026.json');
    expect(markdown).toContain('/815/regulation/full/services.md');
    expect(markdown).toContain('## Как соединять слои');
    expect(markdown).toContain('`estimate_row_id` связывает work items');
    expect(markdown).toContain('Какова периодичность полива дорог');
    expect(markdown).toContain('- Работы: 2');
    expect(markdown).toContain('- Ресурсы: 4');
    expect(markdown).toContain('- needs_check: 3');
  });

  it('filters resource topical files from the dataset', () => {
    const materials = buildEstimateDetailMaterialsMarkdown(fixtureDataset);
    const machines = buildEstimateDetailMachinesMarkdown(fixtureDataset);
    const labor = buildEstimateDetailLaborMarkdown(fixtureDataset);

    expect(materials).toContain('material-sand: Песок');
    expect(materials).not.toContain('machine-loader: Погрузчик');
    expect(machines).toContain('machine-loader: Погрузчик');
    expect(machines).not.toContain('material-sand: Песок');
    expect(labor).toContain('labor-worker: Рабочий зеленого хозяйства');
    expect(labor).toContain('machinist-loader: Машинист погрузчика');
    expect(labor).toContain('ставка: 2 000,00 руб.');
  });

  it('renders structured source quote items in Russian when present', () => {
    const materials = buildEstimateDetailMaterialsMarkdown(fixtureDataset);

    expect(materials).toContain(
      'позиции цитаты: 1) Песок; ресурсы: material-sand; кол-во: 12,5 т; цена: 1 000 ₽; итог: 12 500 ₽',
    );
  });

  it('lists control totals, deltas and needs_check items', () => {
    const checks = buildEstimateDetailChecksMarkdown(fixtureDataset);

    expect(checks).toContain('cleaning-materials-total: materials');
    expect(checks).toContain('источник контроля: секционный PDF');
    expect(checks).toContain('дельта: -25 ₽');
    expect(checks).toContain('Работа для сверки');
    expect(checks).toContain('machinist-loader: Машинист погрузчика');
    expect(checks).toContain('Расхождение больше допуска.');
  });

  it('mentions the improvement road/fence mismatch in real checks markdown', () => {
    const checks = buildEstimateDetailChecksMarkdown();

    expect(checks).toContain('Текущий ремонт покрытия дорог и площадок');
    expect(checks).toContain('ремонт периметрального ограждения');
    expect(checks).toContain('Профнастил оцинкованный');
  });

  it('keeps summer road watering frequency answerable in real markdown', () => {
    const markdown = [
      buildEstimateDetailMaterialsMarkdown(),
      buildEstimateDetailMachinesMarkdown(),
      buildEstimateDetailLaborMarkdown(),
    ].join('\n');

    expect(markdown).toContain(
      'Дороги (асфальт). Полив водой (обеспыливание) - 3 раза в день без дождя',
    );
    expect(markdown).toContain(
      'почему расчетный полив чаще и почему эти частоты отличаются, в cleaning.pdf не поясняется',
    );
    expect(markdown).toContain('cleaning-summer-mechanized-water');
  });

  it('exposes cleaning resource statement reconciliation in real checks markdown', () => {
    const checks = buildEstimateDetailChecksMarkdown();

    expect(checks).toContain('cleaning-resource-statement-materials');
    expect(checks).toContain(
      'ресурсная ведомость по локальному ресурсному сметному расчету',
    );
    expect(checks).toContain('Песок для посыпки дорог');
  });

  it('exposes final PDF controls in real checks markdown', () => {
    const checks = buildEstimateDetailChecksMarkdown();

    expect(checks).toContain('final-estimate-gross: gross');
    expect(checks).toContain('источник контроля: итоговый PDF');
    expect(checks).toContain('final-cleaning-gross');
    expect(checks).toContain('Сумма дочерних строк отличается');
  });
});
