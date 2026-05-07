const NBSP = '\u00A0';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const inputNumberFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 6,
  minimumFractionDigits: 0,
});

const signedMoneyFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  signDisplay: 'exceptZero',
});

const normalizeSpaces = (value: string): string => value.replace(/\s/g, NBSP);

export const formatReglamentNumber = (value: number): string =>
  normalizeSpaces(moneyFormatter.format(value));

export const formatReglamentInputNumber = (value: number): string =>
  normalizeSpaces(inputNumberFormatter.format(value));

export const parseReglamentNumberInput = (
  value: number | string,
): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  const normalized = value
    .trim()
    .replace(/[\s\u00A0\u202F]/g, '')
    .replace(',', '.')
    .replace('−', '-');

  if (!normalized) {
    return undefined;
  }

  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

export const formatReglamentSignedNumber = (value: number): string =>
  normalizeSpaces(signedMoneyFormatter.format(value));

export const formatReglamentMoney = (value: number): string =>
  `${formatReglamentNumber(value)}${NBSP}₽`;

export const formatReglamentAnnualMoney = (value: number): string =>
  `${formatReglamentMoney(value)}/год`;

export const formatReglamentTariffValue = (value: number): string =>
  formatReglamentMoney(value);

export const formatReglamentTariff = (value: number): string =>
  `${formatReglamentTariffValue(value)}/сотка`;

export const formatReglamentMoneyDelta = (value: number): string =>
  `${formatReglamentSignedNumber(value)}${NBSP}₽`;
