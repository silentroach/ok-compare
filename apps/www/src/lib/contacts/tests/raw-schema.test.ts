import { describe, expect, it } from 'vitest';

import { RawContactSchema } from '../raw-schema';

describe('RawContactSchema', () => {
  it('accepts the minimal contacts frontmatter', () => {
    expect(
      RawContactSchema.parse({
        title: 'Иван Петров',
        slug: 'ivan-petrov-fence',
        category: 'fence',
        updated_at: '2026-07-06',
        contacts: {
          phone: '+7 900 000-00-00',
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "category": "fence",
        "contacts": {
          "phone": "+7 900 000-00-00",
        },
        "slug": "ivan-petrov-fence",
        "title": "Иван Петров",
        "updated_at": "2026-07-06",
      }
    `);
  });

  it('accepts optional public contact methods and seo description', () => {
    expect(
      RawContactSchema.parse({
        title: 'Заборы и ворота',
        slug: 'fences-and-gates',
        category: 'fence',
        updated_at: '2026-07-06',
        contacts: {
          telegram: 'https://t.me/example',
          whatsapp: 'https://wa.me/79000000000',
          email: 'team@example.com',
          website: 'https://example.com',
          address: 'Ступино',
        },
        seo: {
          description:
            'Контакт по заборам, который может быть полезен жителям Шелково.',
        },
      }).contacts,
    ).toMatchInlineSnapshot(`
      {
        "address": "Ступино",
        "email": "team@example.com",
        "telegram": "https://t.me/example",
        "website": "https://example.com",
        "whatsapp": "https://wa.me/79000000000",
      }
    `);
  });

  it('rejects invalid slugs, impossible dates and unknown categories', () => {
    const base = {
      title: 'Иван Петров',
      slug: 'ivan-petrov-fence',
      category: 'fence',
      updated_at: '2026-07-06',
      contacts: { phone: '+7 900 000-00-00' },
    };

    expect(
      RawContactSchema.safeParse({ ...base, slug: 'Bad Slug' }).success,
    ).toBe(false);
    expect(
      RawContactSchema.safeParse({ ...base, updated_at: '2026-02-30' }).success,
    ).toBe(false);
    expect(
      RawContactSchema.safeParse({ ...base, category: 'gates' }).success,
    ).toBe(false);
  });

  it('rejects blank and missing public contact methods', () => {
    const base = {
      title: 'Иван Петров',
      slug: 'ivan-petrov-fence',
      category: 'fence',
      updated_at: '2026-07-06',
    };

    expect(RawContactSchema.safeParse({ ...base, contacts: {} }).success).toBe(
      false,
    );
    expect(
      RawContactSchema.safeParse({ ...base, contacts: { phone: '   ' } })
        .success,
    ).toBe(false);
  });

  it('rejects non-HTTPS contact URLs', () => {
    const base = {
      title: 'Иван Петров',
      slug: 'ivan-petrov-fence',
      category: 'fence',
      updated_at: '2026-07-06',
    };

    expect(
      RawContactSchema.safeParse({
        ...base,
        contacts: { website: 'http://example.com' },
      }).success,
    ).toBe(false);
    expect(
      RawContactSchema.safeParse({
        ...base,
        contacts: { telegram: 'javascript:alert(1)' },
      }).success,
    ).toBe(false);
  });

  it('rejects fields excluded from the MVP contract', () => {
    const result = RawContactSchema.safeParse({
      title: 'Иван Петров',
      slug: 'ivan-petrov-fence',
      category: 'fence',
      updated_at: '2026-07-06',
      contacts: { phone: '+7 900 000-00-00' },
      status: 'draft',
      reviews: [],
      paid_placement: true,
    });

    expect(result.success).toBe(false);
  });
});
