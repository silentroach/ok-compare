// @vitest-environment happy-dom

import { afterEach } from 'vitest';
import { describe, expect, it } from 'vitest';

import {
  buildReglamentCalculatorChanges,
  calculateReglamentCalculatorState,
  hydrateReglamentCalculator,
} from './calculator-controller';
import type { CalculatedEstimate, CalculatedEstimateRow } from './calculate';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const formatMoney = (value: number): string =>
  `${moneyFormatter.format(value)} ₽`;
const formatAnnualMoney = (value: number): string =>
  `${formatMoney(value)}/год`;

const findCalculatedRow = (
  result: CalculatedEstimate,
  rowId: string,
): CalculatedEstimateRow => {
  const rows = result.sections.flatMap((section) => section.rows);
  const row = rows.find((item) => item.id === rowId);

  if (!row) {
    throw new Error(`Missing calculated row ${rowId}`);
  }

  return row;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('buildReglamentCalculatorChanges', () => {
  it('omits unchanged baseline fields', () => {
    expect(
      buildReglamentCalculatorChanges([
        {
          rowId: 'lighting-electricity',
          key: 'enabled',
          baseline: true,
          value: true,
        },
        {
          rowId: 'lighting-electricity',
          key: 'frequency',
          baseline: 12,
          value: '12',
        },
      ]),
    ).toEqual({});
  });

  it('groups changed editable fields by estimate row', () => {
    expect(
      buildReglamentCalculatorChanges([
        {
          rowId: 'lighting-electricity',
          key: 'enabled',
          baseline: true,
          value: false,
        },
        {
          rowId: 'lighting-electricity',
          key: 'volume',
          baseline: 218_457.5,
          value: '200000',
        },
        {
          rowId: 'lighting-electricity',
          key: 'rate',
          baseline: 6.29,
          value: '7.1',
        },
        {
          rowId: 'security-access-control',
          key: 'fixed_price',
          baseline: 10_199_356,
          value: '9000000',
        },
      ]),
    ).toEqual({
      rows: {
        'lighting-electricity': {
          enabled: false,
          volume: 200_000,
          rate: 7.1,
        },
        'security-access-control': {
          fixed_price: 9_000_000,
        },
      },
    });
  });

  it('keeps zero numeric changes and skips incomplete number input', () => {
    expect(
      buildReglamentCalculatorChanges([
        {
          rowId: 'lighting-electricity',
          key: 'frequency',
          baseline: 12,
          value: '0',
        },
        {
          rowId: 'lighting-electricity',
          key: 'fixed_price',
          baseline: 1_473_084,
          value: '',
        },
      ]),
    ).toEqual({
      rows: {
        'lighting-electricity': {
          frequency: 0,
        },
      },
    });
  });

  it('renders expert field changes into row annual total and breakdown details', () => {
    const rowId = 'waste-transfer-from-homes';
    document.body.innerHTML = `
      <div data-reglament-calculator>
        <input
          type="number"
          data-reglament-field="primary_salary"
          data-reglament-row-id="${rowId}"
          data-reglament-baseline="3418555.1"
          value="3418555.1"
        />
        <span data-reglament-row-annual="${rowId}"></span>
        <span
          data-reglament-row-breakdown="${rowId}"
          data-reglament-breakdown-field="primary_salary"
        ></span>
        <span
          data-reglament-row-breakdown="${rowId}"
          data-reglament-breakdown-field="gross"
        ></span>
      </div>
    `;
    const root = document.querySelector('[data-reglament-calculator]');
    const input = document.querySelector('input');

    if (
      !(root instanceof HTMLElement) ||
      !(input instanceof HTMLInputElement)
    ) {
      throw new Error('Missing calculator fixture nodes');
    }

    hydrateReglamentCalculator(root);
    input.value = '3000000';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const expectedRow = findCalculatedRow(
      calculateReglamentCalculatorState([
        {
          rowId,
          key: 'primary_salary',
          baseline: 3_418_555.1,
          value: '3000000',
        },
      ]),
      rowId,
    );

    expect(
      document.querySelector('[data-reglament-row-annual]')?.textContent,
    ).toBe(formatAnnualMoney(expectedRow.annual_gross));
    expect(
      document.querySelector(
        '[data-reglament-breakdown-field="primary_salary"]',
      )?.textContent,
    ).toBe(formatMoney(expectedRow.breakdown.primary_salary));
    expect(
      document.querySelector('[data-reglament-breakdown-field="gross"]')
        ?.textContent,
    ).toBe(formatMoney(expectedRow.breakdown.gross));
  });

  it('renders fixed annual price changes from row details with short sotka unit', () => {
    document.body.innerHTML = `
      <div data-reglament-calculator>
        <details open>
          <summary>Детали расчета и источники</summary>
          <input
            type="number"
            data-reglament-field="fixed_price"
            data-reglament-row-id="lighting-electricity"
            data-reglament-baseline="1473084"
            value="1573084"
          />
        </details>
        <span data-reglament-current-tariff></span>
        <span data-reglament-section-tariff="lighting-power"></span>
      </div>
    `;
    const root = document.querySelector('[data-reglament-calculator]');

    if (!(root instanceof HTMLElement)) {
      throw new Error('Missing calculator fixture root');
    }

    hydrateReglamentCalculator(root);

    expect(
      document.querySelector('[data-reglament-current-tariff]')?.textContent,
    ).toMatchInlineSnapshot(`"902,48 ₽/сотка"`);
    expect(
      document.querySelector('[data-reglament-section-tariff]')?.textContent,
    ).toMatchInlineSnapshot(`"48,27 ₽/сотка"`);
  });
});
