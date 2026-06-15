import { z } from 'astro/zod';

const text = (name: string) =>
  z.string().trim().min(1, `${name} must not be blank`);

export const RawKbPageSchema = z
  .object({
    title: text('title'),
    description: text('description'),
    tags: z.array(text('tags[]')).optional(),
  })
  .strict();

export type RawKbPage = z.output<typeof RawKbPageSchema>;
