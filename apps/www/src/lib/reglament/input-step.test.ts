import { describe, expect, it } from 'vitest';

import { estimate2026 } from '@/data/reglament/estimate-2026';

import { reglamentNumberInputStep } from './input-step';
import type { EditableFieldKey, EstimateRow } from './schema';

const flattenRows = (rows: readonly EstimateRow[]): readonly EstimateRow[] =>
  rows.flatMap((row) => [row, ...flattenRows(row.children ?? [])]);

const rowById = (id: string): EstimateRow => {
  const row = flattenRows(
    estimate2026.sections.flatMap((section) => section.rows),
  ).find((item) => item.id === id);

  if (!row) {
    throw new Error(`Missing estimate row ${id}`);
  }

  return row;
};

const fieldByKey = (row: EstimateRow, key: EditableFieldKey) => {
  const field = row.editable_fields.find((item) => item.key === key);

  if (!field) {
    throw new Error(`Missing editable field ${key} on ${row.id}`);
  }

  return field;
};

describe('reglamentNumberInputStep', () => {
  it('uses step=1 for integer frequency controls without per-row overrides', () => {
    const row = rowById('lighting-street-maintenance');

    expect(
      reglamentNumberInputStep(
        fieldByKey(row, 'frequency'),
        row.baseline.frequency?.value ?? Number.NaN,
      ),
    ).toBe(1);
  });

  it('keeps a decimal step for fractional count-like controls and rates', () => {
    const fractionalVolumeRow = rowById('waste-transfer-from-homes');
    const fractionalFrequencyRow = rowById('lighting-poles-repair');

    expect(
      reglamentNumberInputStep(
        fieldByKey(fractionalVolumeRow, 'volume'),
        fractionalVolumeRow.baseline.base?.value ?? Number.NaN,
      ),
    ).toBe(0.01);
    expect(
      reglamentNumberInputStep(
        fieldByKey(fractionalFrequencyRow, 'frequency'),
        fractionalFrequencyRow.baseline.frequency?.value ?? Number.NaN,
      ),
    ).toBe(0.01);
    expect(reglamentNumberInputStep({ key: 'rate' }, 100)).toBe(0.01);
    expect(reglamentNumberInputStep({ key: 'vat_rate' }, 1)).toBe(0.01);
  });

  it('respects explicit step overrides from editable field metadata', () => {
    expect(reglamentNumberInputStep({ key: 'fixed_price', step: 1 }, 1.5)).toBe(
      1,
    );
  });
});
