import { describe, expect, it } from 'vitest';

import {
  formatReglamentAnnualMoney,
  formatReglamentMoney,
  formatReglamentMoneyDelta,
  formatReglamentTariff,
  formatReglamentTariffValue,
} from './format';

const visibleNbsp = (value: string): string => value.replaceAll('\u00A0', '·');

describe('reglament money formatting', () => {
  it('keeps money, tariff units and deltas together with non-breaking spaces', () => {
    expect(
      visibleNbsp(formatReglamentMoney(221_264_198)),
    ).toMatchInlineSnapshot(`"221·264·198·₽"`);
    expect(
      visibleNbsp(formatReglamentAnnualMoney(221_264_198)),
    ).toMatchInlineSnapshot(`"221·264·198·₽/год"`);
    expect(visibleNbsp(formatReglamentTariff(902.07))).toMatchInlineSnapshot(
      `"902,07·₽/сотка"`,
    );
    expect(
      visibleNbsp(formatReglamentTariffValue(52.39)),
    ).toMatchInlineSnapshot(`"52,39·₽"`);
    expect(
      visibleNbsp(formatReglamentMoneyDelta(-40.87)),
    ).toMatchInlineSnapshot(`"-40,87·₽"`);
    expect(visibleNbsp(formatReglamentMoneyDelta(40.87))).toMatchInlineSnapshot(
      `"+40,87·₽"`,
    );
  });
});
