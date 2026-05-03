import { beforeAll, describe, expect, it } from 'vitest';

import type { PersonProfileEntry } from './load';

let buildPeopleDataset: typeof import('./load').buildPeopleDataset;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildPeopleDataset } = await import('./load'));
});

const entry = (input: {
  readonly id: string;
  readonly name: string;
  readonly body?: string;
}): PersonProfileEntry => ({
  id: input.id,
  body: input.body ?? '',
  data: {
    name: input.name,
    contacts: [],
  },
});

describe('buildPeopleDataset', () => {
  it('normalizes person body mentions against the shared registry', () => {
    const data = buildPeopleDataset([
      entry({
        id: 'kschemelinin',
        name: 'Кирилл Щемелинин',
        body: 'Профиль Кирилла.',
      }),
      entry({
        id: 'apetrov',
        name: 'Андрей Петров',
        body: 'Работал вместе с @kschemelinin над разбором аварии.',
      }),
    ]);

    expect(data.by_slug.get('apetrov')?.body).toBe(
      'Работал вместе с [Кирилл Щемелинин](/people/kschemelinin/) над разбором аварии.',
    );
  });
});
