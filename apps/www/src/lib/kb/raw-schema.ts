import { z } from 'astro/zod';

export const RawKbPageSchema = z
  .object({
    title: z.string().trim(),
  })
  .strict();

export type RawKbPage = z.output<typeof RawKbPageSchema>;
