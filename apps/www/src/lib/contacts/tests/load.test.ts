import { beforeAll, describe, expect, it } from 'vitest';

import { createSiteMentionRegistry } from '@/lib/mentions';
import { createPersonMentionTarget } from '@/lib/people/mentions';

import type { ContactEntry } from '../load';

let buildContactsDataset: typeof import('../load').buildContactsDataset;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildContactsDataset } = await import('../load'));
});

const entry = (input: {
  readonly id: string;
  readonly body?: string;
  readonly data?: Partial<ContactEntry['data']>;
}): ContactEntry => ({
  id: input.id,
  body: input.body ?? 'Работает с заборами и воротами.',
  data: {
    title: 'Иван Петров',
    slug: input.id,
    category: 'fence',
    updated_at: '2026-07-06',
    contacts: {
      phone: '+7 900 000-00-00',
    },
    ...input.data,
  },
});

describe('buildContactsDataset', () => {
  it('accepts an empty launch dataset', () => {
    const data = buildContactsDataset([]);

    expect(data.contacts).toEqual([]);
    expect(data.bySlug.size).toBe(0);
  });

  it('maps raw contacts to readonly camelCase domain contacts sorted by title', () => {
    const data = buildContactsDataset([
      entry({ id: 'second-fence', data: { title: 'Яков' } }),
      entry({
        id: 'first-fence',
        body: 'Перед началом работ стоит согласовать сроки с @kschemelinin.',
        data: {
          title: 'Анна',
          seo: {
            description: 'Контакт по заборам для жителей Шелково.',
          },
        },
      }),
    ]);

    expect(data.contacts.map((item) => item.slug)).toEqual([
      'first-fence',
      'second-fence',
    ]);
    expect(data.bySlug.get('first-fence')).toMatchInlineSnapshot(`
      {
        "body": "Перед началом работ стоит согласовать сроки с @kschemelinin.",
        "canonical": "https://kpshelkovo.online/contacts/first-fence/",
        "category": "fence",
        "contacts": {
          "address": undefined,
          "email": undefined,
          "phone": "+7 900 000-00-00",
          "telegram": undefined,
          "website": undefined,
          "whatsapp": undefined,
        },
        "markdownUrl": "/contacts/first-fence/index.md",
        "mentions": [],
        "seo": {
          "description": "Контакт по заборам для жителей Шелково.",
        },
        "slug": "first-fence",
        "title": "Анна",
        "updatedAt": 2026-07-06T00:00:00.000Z,
        "updatedIso": "2026-07-06",
        "url": "/contacts/first-fence/",
      }
    `);
  });

  it('preprocesses body mentions with the app-level registry when provided', () => {
    const registry = createSiteMentionRegistry([
      createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин'),
    ]);
    const data = buildContactsDataset(
      [
        entry({
          id: 'with-mention',
          body: 'Работал у @kschemelinin на участке.',
        }),
      ],
      { mentionRegistry: registry },
    );

    expect(data.contacts[0]).toMatchObject({
      body: 'Работал у [Кирилл Щемелинин](/people/kschemelinin/) на участке.',
      mentions: [expect.objectContaining({ slug: 'kschemelinin' })],
    });
  });

  it('fails when entry id does not match frontmatter slug', () => {
    expect(() =>
      buildContactsDataset([
        entry({ id: 'wrong-id', data: { slug: 'real-slug' } }),
      ]),
    ).toThrow('contact "wrong-id" id must equal slug "real-slug"');
  });

  it('fails on duplicate slugs and blank markdown body', () => {
    expect(() =>
      buildContactsDataset([
        entry({ id: 'same-slug' }),
        entry({ id: 'same-slug', data: { title: 'Другой контакт' } }),
      ]),
    ).toThrow('duplicate contact slug "same-slug"');

    expect(() =>
      buildContactsDataset([entry({ id: 'blank-body', body: '   ' })]),
    ).toThrow('contact "blank-body" body is required');
  });
});
