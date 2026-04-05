import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { SettlementSchema } from './lib/schema';

const settlements = defineCollection({
  loader: glob({
    pattern: '[!_]*.yaml',
    base: './src/data/settlements',
  }),
  schema: SettlementSchema,
});

export const collections = { settlements };
