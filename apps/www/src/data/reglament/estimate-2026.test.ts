import { describe, expect, it } from 'vitest';

import { estimate2026 } from '@/data/reglament/estimate-2026';
import { ESTIMATE_SOURCE_PDFS, type EstimateRow } from '@/lib/reglament/schema';

const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

const round2 = (value: number): number => Math.round(value * 100) / 100;

const flattenRows = (rows: readonly EstimateRow[]): readonly EstimateRow[] =>
  rows.flatMap((row) => [row, ...flattenRows(row.children ?? [])]);

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
          "title": "Организация работы с РО по вывозу мусора",
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
});
