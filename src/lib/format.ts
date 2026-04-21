import { DateTime } from 'luxon';
import {
  getLotBreakdown,
  getLotAverage,
  type CommonSpaces,
  type Infrastructure,
  type Lots,
  type Tariff,
} from './schema';

type TariffView = Pick<
  Tariff,
  'normalized_per_sotka_month' | 'normalized_is_estimate'
>;
type TariffLike = Tariff | TariffView;

const LOT = 10;

/**
 * Calculate distance between two points on Earth using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format a number as Russian rubles
 * 1234.56 → "1 235 ₽"
 */
export function formatCurrency(value: number): string {
  const rounded = Math.round(value);
  // Use nbsp (U+00A0) which is the Russian standard for thousands separator
  const formatted = rounded.toLocaleString('ru-RU', {
    style: 'decimal',
    maximumFractionDigits: 0,
  });
  return formatted + ' ₽';
}

/**
 * Format distance in kilometers with special formatting rules:
 * - Less than 10 km: show exact integer value (e.g., "5 км")
 * - 10 km or more: round to tens and add tilde prefix (e.g., "~20 км")
 */
export function formatDistance(value: number): string {
  if (value < 10) {
    // Less than 10 km: show exact integer
    return `${Math.round(value)} км`;
  } else {
    // 10 km or more: round to tens with tilde
    const roundedToTens = Math.round(value / 10) * 10;
    return `~${roundedToTens} км`;
  }
}

/**
 * Format a decimal as percentage with sign
 * 0.4567 → "+45.7%"
 * -0.2345 → "−23.5%"
 * Uses U+2212 minus sign for negative values
 */
export function formatPercentage(
  value: number,
  opts?: { signed?: boolean },
): string {
  const percentage = value * 100;
  // Round to 1 decimal place using half-up rounding
  // Multiply by 10, add 0.5 (or subtract for negatives), floor, then divide
  const factor = 10;
  const rounded =
    percentage >= 0
      ? Math.floor(percentage * factor + 0.5) / factor
      : Math.ceil(percentage * factor - 0.5) / factor;

  if (rounded === 0) {
    return '0%';
  }

  const signed = opts?.signed ?? true;
  const sign = rounded > 0 ? '+' : '−';
  const absValue = Math.abs(rounded);

  // Format with one decimal place, but remove trailing .0
  const formatted = Number.isInteger(absValue)
    ? absValue.toString()
    : absValue.toFixed(1);

  return `${signed ? sign : ''}${formatted}%`;
}

/**
 * Format tariff as currency per sotka per month
 * 4500 → "4 500 ₽/сотка"
 */
export function formatTariff(value: number): string {
  const rounded = Math.round(value);
  // Use nbsp (U+00A0) which is the Russian standard for thousands separator
  const formatted = rounded.toLocaleString('ru-RU', {
    style: 'decimal',
    maximumFractionDigits: 0,
  });
  return `${formatted} ₽/сотка`;
}

function months(period: Tariff['period']): number {
  if (period === 'month') return 1;
  if (period === 'quarter') return 3;
  return 12;
}

function num(value: number): string {
  return value.toLocaleString('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function word(value: number, one: string, few: string, many: string): string {
  const n = Math.abs(Math.trunc(value));
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }
  return many;
}

function area(value: number): string {
  const text = num(value);
  if (Number.isInteger(value)) return `${text} соток`;
  return `${text} сот.`;
}

function why(lots: Lots | undefined): string {
  if (lots?.average_sotka) {
    return (
      lots.average_note ??
      'Средняя площадь участка добавлена по подтвержденным данным.'
    );
  }

  if (lots?.count && lots.area_ha) {
    return 'Площадь участка оценочная.';
  }

  return 'Среднюю площадь участка по подтвержденным данным не нашли.';
}

function join(value: string): string {
  return value.endsWith('.') ? ' ' : '. ';
}

/**
 * Format normalized tariff and add '~' for estimated values.
 */
export function formatTariffAuto(tariff: TariffLike): string {
  const text = formatTariff(tariff.normalized_per_sotka_month);
  if (!tariff.normalized_is_estimate) return text;
  return `~${text}`;
}

/**
 * Format original tariff (before normalization).
 */
export function formatTariffBase(tariff: Tariff): string {
  if ('parts' in tariff) {
    return tariff.parts
      .map((item) => {
        const val = formatCurrency(item.value);
        if (item.unit === 'rub_per_sotka') {
          return `${val}/сотка`;
        }
        return `${val}/участок`;
      })
      .join(' + ');
  }

  const val = formatCurrency(tariff.value);
  if (tariff.unit === 'rub_per_sotka') {
    return `${val}/сотка`;
  }
  return `${val}/участок`;
}

function period(value: Tariff['period']): string {
  if (value === 'month') return 'в месяц';
  if (value === 'quarter') return 'в квартал';
  return 'в год';
}

/**
 * Format original tariff with period included (for markdown/long-form display).
 */
export function formatTariffOriginal(tariff: Tariff): string {
  const list = 'parts' in tariff ? tariff.parts : [tariff];
  return list
    .map((item) => {
      const val = formatCurrency(item.value);
      const base =
        item.unit === 'rub_per_sotka' ? `${val}/сотка` : `${val}/участок`;
      return `${base} ${period(item.period)}`;
    })
    .join(' + ');
}

/**
 * True when any part of the tariff is not expressed in ₽/сотка.
 */
export function hasNonSotkaUnit(tariff: Tariff): boolean {
  const list = 'parts' in tariff ? tariff.parts : [tariff];
  return list.some((item) => item.unit !== 'rub_per_sotka');
}

export interface TariffCalcRow {
  title: string;
  source: string;
  formula: string;
}

export interface TariffCalc {
  intro: string;
  assumption?: string;
  rows: TariffCalcRow[];
  total: string;
}

export interface LotCalc {
  known: string;
  factors?: string;
  total: string;
}

/**
 * Generic tooltip for compact cards.
 */
export function getTariffHint(tariff: TariffLike): string | undefined {
  if (!tariff.normalized_is_estimate) return;
  return 'Тариф приведен к сотке автоматически.';
}

export function getLotCalc(
  lots?: Lots,
  infra?: Infrastructure,
  common?: CommonSpaces,
): LotCalc | undefined {
  const item = getLotBreakdown(lots, infra, common);
  if (!item) return;

  if (item.exact) {
    return {
      known:
        item.area_ha && item.count
          ? `${num(item.area_ha)} га и ${num(item.count)} участков.`
          : 'Подтвержденные данные.',
      ...(item.note ? { factors: item.note } : {}),
      total: area(item.size),
    };
  }

  const list = item.rows.map((row) => row.title.toLowerCase());
  const head = list.slice(0, 3).join(', ');
  const more = list.length - 3;
  const factors =
    list.length === 0
      ? 'нет подтвержденных вычетов.'
      : more > 0
        ? `${head} и еще ${more} ${word(more, 'фактор', 'фактора', 'факторов')}.`
        : `${head}.`;

  return {
    known: `${num(item.area_ha)} га и ${num(item.count)} участков.`,
    factors: item.cap
      ? `${factors} Вычет ограничен 2,5 сот. на участок.`
      : factors,
    total: `${num(item.gross)} − ${num(item.shared)} = ${num(item.size)} сот.`,
  };
}

/**
 * Detailed normalization breakdown for settlement page.
 */
export function getTariffCalc(
  tariff: Tariff,
  lots?: Lots,
  infra?: Infrastructure,
  common?: CommonSpaces,
): TariffCalc | undefined {
  const size = getLotAverage(lots, infra, common) ?? LOT;
  const list = 'parts' in tariff ? tariff.parts : [tariff];
  const multi = list.length > 1;
  const lot = list.some((item) => item.unit !== 'rub_per_sotka');

  if (!multi && !lot) return;

  const rows = list.map((item, i) => {
    const m = months(item.period);
    const mons = word(m, 'месяц', 'месяца', 'месяцев');
    const monthly = item.value / m;
    const normalized = item.unit === 'rub_per_sotka' ? monthly : monthly / size;
    const title = multi ? `Часть ${i + 1}` : 'Тариф';
    const source =
      item.unit === 'rub_per_sotka'
        ? 'Указан за сотку.'
        : item.unit === 'rub_per_lot'
          ? 'Указан за участок.'
          : 'Указан фиксированной суммой за участок.';
    const formula =
      item.unit === 'rub_per_sotka'
        ? `${num(item.value)} ₽ / ${m} ${mons} = ${num(normalized)} ₽/сотка в месяц`
        : `(${num(item.value)} ₽ / ${m} ${mons}) / ${area(size)} = ${num(normalized)} ₽/сотка в месяц`;

    return { title, source, formula };
  });

  const total = list.reduce((sum, item) => {
    const monthly = item.value / months(item.period);
    if (item.unit === 'rub_per_sotka') return sum + monthly;
    return sum + monthly / size;
  }, 0);

  return {
    intro: multi
      ? 'Тариф состоит из нескольких частей. Для сравнения каждая часть приведена к ₽/сотка в месяц, затем значения суммированы.'
      : 'Тариф приведен к ₽/сотка в месяц для корректного сравнения.',
    ...(lot
      ? {
          assumption: `Допущение: 1 участок = ${area(size)}${join(area(size))}${why(lots)}`,
        }
      : {}),
    rows,
    total: `${num(total)} ₽/сотка в месяц`,
  };
}

/**
 * Format ISO date (YYYY-MM-DD) to Russian format using Luxon
 * "2026-04-03" → "03 апреля 2026"
 */
export function formatDate(isoDate: string): string {
  const dt = DateTime.fromISO(isoDate, { locale: 'ru' });
  return dt.toFormat('d MMMM yyyy');
}
