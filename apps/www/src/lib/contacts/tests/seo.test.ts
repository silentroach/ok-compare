import { beforeAll, describe, expect, it } from 'vitest';

import type { Contact } from '../types';

let contactPageSchema: typeof import('../seo').contactPageSchema;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ contactPageSchema } = await import('../seo'));
});

const contact = {
  slug: 'ivan-petrov-fence',
  title: 'Иван Петров',
  category: 'fence',
  updatedAt: new Date('2026-07-06T00:00:00.000Z'),
  updatedIso: '2026-07-06',
  contacts: {
    phone: '+7 900 000-00-00',
  },
  url: '/contacts/ivan-petrov-fence/',
  markdownUrl: '/contacts/ivan-petrov-fence/index.md',
  canonical: 'https://example.com/contacts/ivan-petrov-fence/',
  body: 'Работает с заборами и воротами.',
  mentions: [],
} satisfies Contact;

describe('contactPageSchema', () => {
  it('publishes a generic WebPage without ratings or review claims', () => {
    const schema = contactPageSchema({
      contact,
      description: 'Контакт из раздела «Полезные контакты»: Забор.',
      breadcrumbs: [],
    });

    expect(schema).toMatchInlineSnapshot(`
      [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "about": {
            "@type": "Thing",
            "description": "Работает с заборами и воротами.",
            "name": "Забор",
          },
          "dateModified": "2026-07-06",
          "description": "Контакт из раздела «Полезные контакты»: Забор.",
          "inLanguage": "ru-RU",
          "name": "Иван Петров",
          "url": "https://example.com/contacts/ivan-petrov-fence/",
        },
      ]
    `);
    expect(JSON.stringify(schema)).not.toMatch(
      /Review|Rating|AggregateRating/u,
    );
  });
});
