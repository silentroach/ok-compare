import { z } from 'astro/zod';

import {
  isAbsoluteUrl,
  normalizeStatusTimestampInput,
  parseStatusTimestampInput,
  STATUS_AREAS,
  STATUS_KINDS,
  STATUS_SERVICES,
} from './schema';

const text = (name: string) =>
  z
    .string()
    .min(1, `${name} is required`)
    .refine((value) => value.trim().length > 0, `${name} must not be blank`)
    .refine(
      (value) => value === value.trim(),
      `${name} must not start or end with whitespace`,
    );

const absoluteUrl = (name: string) =>
  text(name).refine(
    (value) => isAbsoluteUrl(value),
    `${name} must be an absolute URL`,
  );

const statusDate = (name: string) =>
  z.union([text(name), z.date()]).transform((value, ctx) => {
    const normalized = normalizeStatusTimestampInput(value);

    if (normalized && parseStatusTimestampInput(value)) {
      return normalized;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${name} must use dd.mm.yyyy, dd.mm.yyyy hh:mm, or YYYY-MM-DD`,
    });

    return z.NEVER;
  });

export const RawStatusIncidentSchema = z
  .object({
    title: text('title').optional(),
    service: z.enum(STATUS_SERVICES),
    kind: z.enum(STATUS_KINDS),
    started_at: statusDate('started_at'),
    ended_at: statusDate('ended_at').optional(),
    areas: z.array(z.enum(STATUS_AREAS)).min(1).optional(),
    source_url: absoluteUrl('source_url').optional(),
  })
  .superRefine((data, ctx) => {
    const started = parseStatusTimestampInput(data.started_at);
    const ended = data.ended_at
      ? parseStatusTimestampInput(data.ended_at)
      : undefined;

    if (started && ended && ended.at.valueOf() < started.at.valueOf()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ended_at'],
        message: 'ended_at must be later than or equal to started_at',
      });
    }
  });

export type RawStatusIncident = z.output<typeof RawStatusIncidentSchema>;
