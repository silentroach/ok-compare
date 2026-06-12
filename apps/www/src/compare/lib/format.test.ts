import { describe, it, expect } from 'vitest';
import {
  formatTariffAuto,
  formatTariffBase,
  getLotCalc,
  getTariffHint,
  getTariffCalc,
} from './format';

describe('Format Module', () => {
  describe('formatTariffAuto', () => {
    it('should keep exact tariffs without tilde', () => {
      expect(
        formatTariffAuto({
          value: 1000,
          unit: 'perSotka',
          period: 'month',
          normalizedPerSotkaMonth: 1000,
          normalizedIsEstimate: false,
        }),
      ).toBe('1\u00A0000 ₽/сотка');
    });

    it('should add tilde for estimated tariffs', () => {
      expect(
        formatTariffAuto({
          value: 12000,
          unit: 'perLot',
          period: 'month',
          normalizedPerSotkaMonth: 1200,
          normalizedIsEstimate: true,
        }),
      ).toBe('~1\u00A0200 ₽/сотка');
    });
  });

  describe('formatTariffBase', () => {
    it('should format tariff per sotka', () => {
      expect(
        formatTariffBase({
          value: 500,
          unit: 'perSotka',
          period: 'month',
          normalizedPerSotkaMonth: 500,
          normalizedIsEstimate: false,
        }),
      ).toBe('500 ₽/сотка');
    });

    it('should format tariff per lot', () => {
      expect(
        formatTariffBase({
          value: 4000,
          unit: 'perLot',
          period: 'month',
          normalizedPerSotkaMonth: 400,
          normalizedIsEstimate: true,
        }),
      ).toBe('4\u00A0000 ₽/участок');
    });

    it('should format fixed tariff as per lot', () => {
      expect(
        formatTariffBase({
          value: 12000,
          unit: 'fixed',
          period: 'year',
          normalizedPerSotkaMonth: 100,
          normalizedIsEstimate: true,
        }),
      ).toBe('12\u00A0000 ₽/участок');
    });

    it('should format multi-part tariff as combined formula', () => {
      expect(
        formatTariffBase({
          value: 5813,
          unit: 'perLot',
          period: 'month',
          normalizedPerSotkaMonth: 681.3,
          normalizedIsEstimate: true,
          parts: [
            {
              value: 5813,
              unit: 'perLot',
              period: 'month',
            },
            {
              value: 100,
              unit: 'perSotka',
              period: 'month',
            },
          ],
        }),
      ).toBe('5\u00A0813 ₽/участок + 100 ₽/сотка');
    });
  });

  describe('getTariffHint', () => {
    it('should return undefined for exact tariffs', () => {
      expect(
        getTariffHint({
          value: 1000,
          unit: 'perSotka',
          period: 'month',
          normalizedPerSotkaMonth: 1000,
          normalizedIsEstimate: false,
        }),
      ).toBe(undefined);
    });

    it('should return generic hint for estimated tariffs', () => {
      const hint = getTariffHint({
        value: 5813,
        unit: 'perLot',
        period: 'month',
        normalizedPerSotkaMonth: 681.3,
        normalizedIsEstimate: true,
        parts: [
          {
            value: 5813,
            unit: 'perLot',
            period: 'month',
          },
          {
            value: 100,
            unit: 'perSotka',
            period: 'month',
          },
        ],
      });

      expect(hint).toBe('Тариф приведен к сотке автоматически.');
    });
  });

  describe('getTariffCalc', () => {
    it('should return undefined for exact single tariff', () => {
      expect(
        getTariffCalc({
          value: 1000,
          unit: 'perSotka',
          period: 'month',
          normalizedPerSotkaMonth: 1000,
          normalizedIsEstimate: false,
        }),
      ).toBe(undefined);
    });

    it('should build detailed calc for estimated single tariff', () => {
      const calc = getTariffCalc({
        value: 9000,
        unit: 'perLot',
        period: 'quarter',
        normalizedPerSotkaMonth: 300,
        normalizedIsEstimate: true,
      });

      expect(calc?.intro).toContain('приведен');
      expect(calc?.assumption).toContain('1 участок = 10 соток');
      expect(calc?.assumption).toContain(
        'Среднюю площадь участка по подтвержденным данным не нашли',
      );
      expect(calc?.rows).toHaveLength(1);
      expect(calc?.rows[0]?.formula).toContain('10 соток');
      expect(calc?.total).toContain('300');
    });

    it('should use known average lot size in tariff breakdown', () => {
      const calc = getTariffCalc(
        {
          value: 1780,
          unit: 'perLot',
          period: 'month',
          normalizedPerSotkaMonth: 100,
          normalizedIsEstimate: true,
        },
        {
          averageSotka: 17.8,
          averageNote:
            'Средняя площадь рассчитана по опубликованным площадям лотов.',
        },
      );

      expect(calc?.assumption).toContain('17,8 сот.');
      expect(calc?.assumption).toContain('опубликованным площадям лотов');
      expect(calc?.rows[0]?.formula).toContain('17,8 сот.');
      expect(calc?.total).toContain('100');
    });

    it('should use short lot-area note in tariff breakdown', () => {
      const calc = getTariffCalc(
        {
          value: 12100,
          unit: 'perLot',
          period: 'month',
          normalizedPerSotkaMonth: 360.58,
          normalizedIsEstimate: true,
        },
        {
          count: 298,
          areaHa: 100,
        },
        {
          roads: 'asphalt',
          sidewalks: 'partial',
          drainage: 'open',
          checkpoints: 'yes',
        },
        {
          playgrounds: 'yes',
          sports: 'yes',
        },
      );

      expect(calc?.assumption).toContain('Площадь участка оценочная.');
    });

    it('should build detailed calc for multi-part tariff', () => {
      const calc = getTariffCalc({
        value: 5813,
        unit: 'perLot',
        period: 'month',
        normalizedPerSotkaMonth: 681.3,
        normalizedIsEstimate: true,
        parts: [
          {
            value: 5813,
            unit: 'perLot',
            period: 'month',
          },
          {
            value: 100,
            unit: 'perSotka',
            period: 'month',
          },
        ],
      });

      expect(calc?.intro).toContain('нескольких частей');
      expect(calc?.rows).toHaveLength(2);
      expect(calc?.rows[0]?.title).toBe('Часть 1');
      expect(calc?.total).toContain('681');
    });
  });

  describe('getLotCalc', () => {
    it('should build lot breakdown for estimated average', () => {
      const calc = getLotCalc(
        {
          count: 298,
          areaHa: 100,
        },
        {
          roads: 'asphalt',
          sidewalks: 'partial',
          drainage: 'open',
          checkpoints: 'yes',
        },
        {
          playgrounds: 'yes',
          sports: 'yes',
        },
      );

      expect(calc?.known).toContain('100 га и 298 участков');
      expect(calc?.factors).toContain('дороги, тротуары, ливневки');
      expect(calc?.total).toContain('33,56 − 1,55 = 32,01');
    });

    it('should build lot breakdown for explicit average', () => {
      const calc = getLotCalc({
        count: 150,
        areaHa: 32,
        averageSotka: 20.4,
        averageNote:
          'Средняя площадь рассчитана по опубликованным площадям лотов.',
      });

      expect(calc?.known).toContain('32 га и 150 участков');
      expect(calc?.factors).toContain('опубликованным площадям лотов');
      expect(calc?.total).toBe('20,4 сот.');
    });
  });
});
