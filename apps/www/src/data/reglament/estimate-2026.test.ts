import { describe, expect, it } from 'vitest';

import { estimate2026 } from '@/data/reglament/estimate-2026';
import { ESTIMATE_SOURCE_PDFS, type EstimateRow } from '@/lib/reglament/schema';

const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

const round2 = (value: number): number => Math.round(value * 100) / 100;

const flattenRows = (rows: readonly EstimateRow[]): readonly EstimateRow[] =>
  rows.flatMap((row) => [row, ...flattenRows(row.children ?? [])]);

const findRow = (id: string): EstimateRow => {
  const row = flattenRows(
    estimate2026.sections.flatMap((section) => section.rows),
  ).find((item) => item.id === id);

  if (!row) {
    throw new Error(`Estimate row not found: ${id}`);
  }

  return row;
};

describe('estimate2026 baseline data', () => {
  it('keeps the official total and tariff from final.pdf', () => {
    expect(estimate2026.baseline).toEqual({
      annual_gross: 221_264_198,
      tariff_per_sotka_month: 902.07,
    });
  });

  it('keeps section totals from final.pdf', () => {
    const sections = estimate2026.sections.map((section) => ({
      id: section.id,
      title: section.title,
      annual_gross: section.baseline.annual_gross,
      tariff_per_sotka_month: section.baseline.tariff_per_sotka_month,
    }));

    expect(sections).toMatchInlineSnapshot(`
      [
        {
          "annual_gross": 12851178,
          "id": "waste-transfer",
          "tariff_per_sotka_month": 52.39,
          "title": "Перемещение мусора от участков собственников на площадку временного размещения",
        },
        {
          "annual_gross": 159011858,
          "id": "cleaning",
          "tariff_per_sotka_month": 648.27,
          "title": "Уборка территории",
        },
        {
          "annual_gross": 10218079,
          "id": "landscaping",
          "tariff_per_sotka_month": 41.66,
          "title": "Озеленение территории",
        },
        {
          "annual_gross": 4687181,
          "id": "improvement",
          "tariff_per_sotka_month": 19.11,
          "title": "Благоустройство территории",
        },
        {
          "annual_gross": 14752949,
          "id": "security",
          "tariff_per_sotka_month": 60.15,
          "title": "Охрана и техническое обслуживание средств охраны",
        },
        {
          "annual_gross": 8004368,
          "id": "waste-operator",
          "tariff_per_sotka_month": 32.63,
          "title": "Организация работы с региональным оператором по вывозу мусора",
        },
        {
          "annual_gross": 11738585,
          "id": "lighting-power",
          "tariff_per_sotka_month": 47.86,
          "title": "Техническое обслуживание уличного освещения и системы электроснабжения",
        },
      ]
    `);

    expect(sum(sections.map((section) => section.annual_gross))).toBe(
      estimate2026.baseline.annual_gross,
    );
    expect(
      round2(sum(sections.map((section) => section.tariff_per_sotka_month))),
    ).toBe(estimate2026.baseline.tariff_per_sotka_month);
  });

  it('keeps PDF source references on every section and row', () => {
    const sourcePdfs = new Set(ESTIMATE_SOURCE_PDFS);

    for (const section of estimate2026.sections) {
      expect(section.source_refs.length).toBeGreaterThan(0);

      for (const row of flattenRows(section.rows)) {
        expect(row.source_refs.length).toBeGreaterThan(0);
        expect(row.baseline.annual_gross).toBeGreaterThanOrEqual(0);
        expect(
          row.source_refs.every((source) => sourcePdfs.has(source.pdf)),
        ).toBe(true);
      }
    }
  });

  it('keeps fixed annual price outside basic main-table controls', () => {
    const rows = flattenRows(
      estimate2026.sections.flatMap((section) => section.rows),
    );
    const fixedPriceFields = rows.flatMap((row) =>
      row.editable_fields.filter((field) => field.key === 'fixed_price'),
    );

    expect(fixedPriceFields.length).toBeGreaterThan(0);
    expect(fixedPriceFields.every((field) => field.level === 'expert')).toBe(
      true,
    );
  });

  it('keeps the disputed improvement repair source caveat explicit', () => {
    const row = findRow('improvement-road-surface-repair');

    expect({
      title: row.title,
      annual_gross: row.baseline.annual_gross,
      materials: row.baseline.breakdown.materials,
      description: row.description,
      tags: row.tags,
      source_refs: row.source_refs.map((ref) => ({
        pdf: ref.pdf,
        page: ref.page,
        fragment: ref.fragment,
        ...(ref.note ? { note: ref.note } : {}),
      })),
    }).toMatchInlineSnapshot(`
      {
        "annual_gross": 320424,
        "description": "Сопоставление с детализацией не подтверждено: в итоговой смете указано покрытие дорог и площадок, а в детализации благоустройства найдена только близкая по сумме строка ремонта периметрального ограждения. Официальная сумма сохранена по итоговой смете; строку нужно проверить по рабочей книге или у составителя сметы.",
        "materials": 298320,
        "source_refs": [
          {
            "fragment": "строка 4.2",
            "page": 2,
            "pdf": "final",
          },
          {
            "fragment": "производственная программа, ремонт периметрального ограждения",
            "note": "В детализации благоустройства не найдена строка ремонта покрытия дорог или площадок; сопоставление с этой строкой не подтверждено.",
            "page": 2,
            "pdf": "improvement",
          },
          {
            "fragment": "локальный расчет, замена поврежденных элементов периметрального ограждения",
            "note": "Материалы 298 320 ₽ близки к строке 4.2 после налоговых начислений, но название работ отличается от итоговой сметы.",
            "page": 11,
            "pdf": "improvement",
          },
          {
            "fragment": "локальный расчет, материалы профнастила и итог 298 320 ₽",
            "note": "Страница продолжает строку ремонта периметрального ограждения и подтверждает материальную сумму, использованную в расчете строки.",
            "page": 12,
            "pdf": "improvement",
          },
        ],
        "tags": [
          "материалы",
          "требует проверки",
        ],
        "title": "Текущий ремонт покрытия дорог и площадок",
      }
    `);
  });
});
