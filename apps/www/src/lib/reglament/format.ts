import {
  formatNumberRu,
  formatNumberUnitRu,
  parseNumberInputRu,
} from '@shelkovo/format';

const MONEY_OPTIONS = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
} as const;

const INPUT_NUMBER_OPTIONS = {
  maximumFractionDigits: 6,
  minimumFractionDigits: 0,
} as const;

const SIGNED_MONEY_OPTIONS = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  signDisplay: 'exceptZero',
} as const;

export const formatReglamentNumber = (value: number): string =>
  formatNumberRu(value, MONEY_OPTIONS);

export const formatReglamentInputNumber = (value: number): string =>
  formatNumberRu(value, INPUT_NUMBER_OPTIONS);

export const parseReglamentNumberInput = (
  value: number | string,
): number | undefined => parseNumberInputRu(value);

export const formatReglamentSignedNumber = (value: number): string =>
  formatNumberRu(value, SIGNED_MONEY_OPTIONS);

export const formatReglamentMoney = (value: number): string =>
  formatNumberUnitRu(value, '₽', MONEY_OPTIONS);

export const formatReglamentAnnualMoney = (value: number): string =>
  `${formatReglamentMoney(value)}/год`;

export const formatReglamentTariffValue = (value: number): string =>
  formatReglamentMoney(value);

export const formatReglamentTariff = (value: number): string =>
  `${formatReglamentTariffValue(value)}/сотка`;

export const formatReglamentMoneyDelta = (value: number): string =>
  formatNumberUnitRu(value, '₽', SIGNED_MONEY_OPTIONS);
