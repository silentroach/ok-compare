import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { SettlementSchema } from './lib/schema';

const settlements = defineCollection({
  loader: glob({
    pattern: '[!_]*.yaml',
    base: './src/data/settlements'
  }),
  schema: SettlementSchema as unknown as Parameters<typeof defineCollection>[0]['schema']
});

export const collections = { settlements };
