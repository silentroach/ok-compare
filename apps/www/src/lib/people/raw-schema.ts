import { z } from 'astro/zod';

import { PERSON_CONTACT_TYPES } from './schema';

const text = (name: string) =>
  z
    .string()
    .min(1, `${name} is required`)
    .refine((value) => value.trim().length > 0, `${name} must not be blank`)
    .refine(
      (value) => value === value.trim(),
      `${name} must not start or end with whitespace`,
    );

const personNameCases = () =>
  z
    .object({
      gen: text('name_cases.gen').optional(),
      dat: text('name_cases.dat').optional(),
      acc: text('name_cases.acc').optional(),
      ins: text('name_cases.ins').optional(),
      prep: text('name_cases.prep').optional(),
    })
    .strict()
    .partial();

const personContact = () =>
  z.object({
    type: z.enum(PERSON_CONTACT_TYPES),
    value: text('contacts[].value'),
  });

export const RawPersonProfileSchema = z.object({
  name: text('name'),
  name_cases: personNameCases().optional(),
  company: text('company').optional(),
  position: text('position').optional(),
  contacts: z.array(personContact()),
});

export type RawPersonProfile = z.output<typeof RawPersonProfileSchema>;
export type RawPersonContact = RawPersonProfile['contacts'][number];
