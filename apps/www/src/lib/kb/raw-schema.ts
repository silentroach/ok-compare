import { z } from 'astro/zod';
import type { KbPageFlag } from './types';

const KB_PAGE_FLAGS = ['noindex'] as const satisfies readonly KbPageFlag[];

const RawKbPageFlagsSchema = z
  .array(z.enum(KB_PAGE_FLAGS))
  .default([])
  .refine((flags) => new Set(flags).size === flags.length, {
    message: 'flags must not contain duplicates',
  });

export const RawKbPageSchema = z
  .object({
    title: z.string().trim(),
    flags: RawKbPageFlagsSchema,
  })
  .strict();

export type RawKbPage = z.output<typeof RawKbPageSchema>;
