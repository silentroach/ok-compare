import { dateTimeFromParts, padNumber } from '@shelkovo/format';

const LOCAL_DATE =
  /^(?<day>\d{2})\.(?<month>\d{2})\.(?<year>\d{4})(?: (?<hour>[01]\d|2[0-3]):(?<minute>[0-5]\d))?$/;
const ISO_DATE = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/;

export interface NewsDateParts {
  readonly year: string;
  readonly month: string;
  readonly day: string;
}

export interface NewsTimestamp extends NewsDateParts {
  readonly at: Date;
  readonly iso: string;
  readonly has_time: boolean;
  readonly time?: string;
}

const timeLabel = (hour: number, minute: number): string =>
  `${padNumber(hour, 2)}:${padNumber(minute, 2)}`;

const asIsoDate = (value: Date): string => value.toISOString().slice(0, 10);

function buildTimestamp(input: {
  readonly year: string;
  readonly month: string;
  readonly day: string;
  readonly hour: number;
  readonly minute: number;
  readonly has_time: boolean;
}): NewsTimestamp | undefined {
  const zoned = dateTimeFromParts({
    year: Number(input.year),
    month: Number(input.month),
    day: Number(input.day),
    hour: input.hour,
    minute: input.minute,
  });

  if (!zoned.isValid) {
    return undefined;
  }

  const iso = zoned.toISO({ suppressMilliseconds: true });

  if (!iso) {
    return undefined;
  }

  return {
    year: input.year,
    month: input.month,
    day: input.day,
    at: zoned.toJSDate(),
    iso,
    has_time: input.has_time,
    ...(input.has_time ? { time: timeLabel(input.hour, input.minute) } : {}),
  };
}

export const normalizeNewsTimestampInput = (
  value: unknown,
): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return asIsoDate(value);
  }

  return undefined;
};

export const parseNewsTimestamp = (
  value: string,
): NewsTimestamp | undefined => {
  const local = value.match(LOCAL_DATE);

  if (local?.groups) {
    return buildTimestamp({
      year: local.groups.year,
      month: local.groups.month,
      day: local.groups.day,
      hour: Number(local.groups.hour ?? '0'),
      minute: Number(local.groups.minute ?? '0'),
      has_time: local.groups.hour !== undefined,
    });
  }

  const iso = value.match(ISO_DATE);

  if (iso?.groups) {
    return buildTimestamp({
      year: iso.groups.year,
      month: iso.groups.month,
      day: iso.groups.day,
      hour: 0,
      minute: 0,
      has_time: false,
    });
  }

  return undefined;
};

export const parseNewsTimestampInput = (
  value: unknown,
): NewsTimestamp | undefined => {
  const normalized = normalizeNewsTimestampInput(value);
  return normalized ? parseNewsTimestamp(normalized) : undefined;
};
