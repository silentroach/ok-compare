import { z } from 'astro/zod';

import { PERSON_CONTACT_TYPES } from './schema';

const text = z.string().trim();

const personNameCases = () =>
  z
    .object({
      gen: text.optional(),
      dat: text.optional(),
      acc: text.optional(),
      ins: text.optional(),
      prep: text.optional(),
    })
    .strict();

const personContact = () =>
  z.object({
    type: z.enum(PERSON_CONTACT_TYPES),
    value: text,
  });

const personSeo = () =>
  z
    .object({
      description: text.optional(),
    })
    .strict();

export const RawPersonProfileSchema = z.object({
  name: text,
  seo: personSeo().optional(),
  name_cases: personNameCases().optional(),
  company: text.optional(),
  position: text.optional(),
  contacts: z.array(personContact()),
});

export type RawPersonProfile = z.output<typeof RawPersonProfileSchema>;
export type RawPersonContact = RawPersonProfile['contacts'][number];
