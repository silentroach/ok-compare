import { isAbsoluteUrl } from '@shelkovo/url';
import { z } from 'astro/zod';

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_CODE = /^\d{2}:[0-5]\d:[0-5]\d$/;

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

const sourceUrl = (name: string) =>
  text(name).refine(
    (value) => isAbsoluteUrl(value) || value.startsWith('/'),
    `${name} must be an absolute URL or a root-relative path`,
  );

const date = (name: string) =>
  z
    .union([text(name), z.date()])
    .refine((value) => normalizeMeetingDate(value) !== undefined, {
      message: `${name} must use YYYY-MM-DD`,
    })
    .transform((value) => normalizeMeetingDate(value) ?? z.NEVER);

const textList = (name: string) => z.array(text(`${name}[]`)).min(1);

const document = () =>
  z
    .object({
      title: text('documents[].title'),
      url: sourceUrl('documents[].url'),
    })
    .strict();

const timecode = (name: string) =>
  text(name).refine(
    (value) => TIME_CODE.test(value),
    `${name} must use HH:MM:SS`,
  );

const speaker = () =>
  z
    .object({
      id: text('speakers[].id'),
      name: text('speakers[].name'),
      role: text('speakers[].role').optional(),
    })
    .strict();

const segment = () =>
  z
    .object({
      start: timecode('segments[].start'),
      end: timecode('segments[].end').optional(),
      speaker: text('segments[].speaker').optional(),
      text: text('segments[].text'),
    })
    .strict();

export const normalizeMeetingDate = (
  value: string | Date,
): string | undefined => {
  if (value instanceof Date) {
    if (Number.isNaN(value.valueOf())) {
      return undefined;
    }

    const iso = value.toISOString().slice(0, 10);

    return normalizeMeetingDate(iso);
  }

  const match = DATE.exec(value);

  if (!match) {
    return undefined;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
    ? value
    : undefined;
};

export const RawMeetingFrontmatterSchema = z
  .object({
    title: text('title'),
    date: date('date'),
    summary: text('summary'),
    slug: text('slug'),
    format: text('format').optional(),
    source_url: absoluteUrl('source_url').optional(),
    video_url: absoluteUrl('video_url').optional(),
    video_embed_url: absoluteUrl('video_embed_url').optional(),
    transcript: text('transcript').optional(),
    highlights: textList('highlights').optional(),
    agenda: textList('agenda').optional(),
    decisions: textList('decisions').optional(),
    action_items: textList('action_items').optional(),
    questions: textList('questions').optional(),
    participants: textList('participants').optional(),
    documents: z.array(document()).min(1).optional(),
  })
  .strict();

export type RawMeetingFrontmatter = z.output<
  typeof RawMeetingFrontmatterSchema
>;

export const RawMeetingTranscriptSchema = z
  .object({
    speakers: z.array(speaker()).min(1).optional(),
    segments: z.array(segment()).min(1),
  })
  .strict();

export type RawMeetingTranscript = z.output<typeof RawMeetingTranscriptSchema>;
