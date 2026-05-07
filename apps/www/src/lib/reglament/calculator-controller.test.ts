import { describe, expect, it } from 'vitest';

import { buildReglamentCalculatorChanges } from './calculator-controller';

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

  it('groups changed basic fields by estimate row', () => {
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
});
