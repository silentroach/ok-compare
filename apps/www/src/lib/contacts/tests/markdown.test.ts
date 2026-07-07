import { beforeAll, describe, expect, it } from 'vitest';

import type { Contact, ContactCategoryPage, ContactWithDetail } from '../types';

let buildContactMarkdown: typeof import('../markdown').buildContactMarkdown;
let buildContactsHomeMarkdown: typeof import('../markdown').buildContactsHomeMarkdown;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildContactMarkdown, buildContactsHomeMarkdown } =
    await import('../markdown'));
});

const contact = {
  slug: 'ivan-petrov-fence',
  title: 'Иван Петров',
  category: 'fence',
  updatedAt: new Date('2026-07-06T00:00:00.000Z'),
  updatedIso: '2026-07-06',
  contacts: {
    phone: '+7 900 000-00-00',
    telegram: 'https://t.me/example',
    email: 'team@example.com',
  },
  location: {
    title: 'Золото Сибири',
    url: 'https://yandex.ru/maps/-/CTq-BEOk',
    address: 'Пионерская ул., 21, пгт Малино',
  },
  hasDetailPage: true,
  url: '/sarafan/fence/ivan-petrov-fence/',
  markdownUrl: '/sarafan/fence/ivan-petrov-fence/index.md',
  canonical: 'https://example.com/sarafan/fence/ivan-petrov-fence/',
  body: 'Работает с заборами и воротами. Перед началом работ стоит отдельно согласовать сроки, материалы и гарантию.\n\n## Что уточнить\n\nПеред оплатой уточняйте цену.',
  mentions: [],
} satisfies ContactWithDetail;

const listOnlyContact = {
  slug: 'sergey',
  title: 'Сергей',
  category: 'fence',
  updatedAt: new Date('2026-07-06T00:00:00.000Z'),
  updatedIso: '2026-07-06',
  contacts: {
    phone: '+7 985 774-75-04',
  },
  hasDetailPage: false,
  body: '',
  mentions: [],
} satisfies Contact;

const category = {
  category: 'fence',
  contacts: [contact, listOnlyContact],
  url: '/sarafan/fence/',
  markdownUrl: '/sarafan/fence/index.md',
} satisfies ContactCategoryPage;

describe('contacts markdown companions', () => {
  it('renders empty launch index without internal paths', () => {
    const markdown = buildContactsHomeMarkdown({
      contacts: [],
      categories: [],
      byRoute: new Map(),
      byCategory: new Map(),
    });

    expect(markdown).toMatchInlineSnapshot(`
      "# Сарафан

      Сарафан собирается из опыта соседей в [чате жителей Шелково](https://t.me/shelkovoecoclub): кого позвали, как прошла работа, к кому готовы обратиться снова. Лучше меньше контактов, зато с понятным живым контекстом.

      ## Категории

      Пока здесь ничего нет. Если ищете подрядчика сейчас, можно посмотреть [таблицу контактов из соседнего чата Гринвуда](https://docs.google.com/spreadsheets/d/1ckmDY1B54Mx9UB1chbybwdbPTF87R--uv2li7VhCfg8/edit?usp=drivesdk).
      "
    `);
    expect(markdown).not.toMatch(/apps\/www|src\/|repo:/u);
  });

  it('renders populated index with contact markdown links', () => {
    const markdown = buildContactsHomeMarkdown({
      contacts: [contact, listOnlyContact],
      categories: [category],
      byRoute: new Map<string, Contact>([
        ['fence/ivan-petrov-fence', contact],
        ['fence/sergey', listOnlyContact],
      ]),
      byCategory: new Map([['fence', category]]),
    });

    expect(markdown).toContain(
      '[Иван Петров](https://example.com/sarafan/fence/ivan-petrov-fence/index.md)',
    );
    expect(markdown).toContain(
      '[Забор](https://example.com/sarafan/fence/index.md)',
    );
    expect(markdown).toContain('Телефон: [+7 900 000-00-00](tel:+79000000000)');
    expect(markdown).toContain(
      'Адрес: [Золото Сибири](https://yandex.ru/maps/-/CTq-BEOk) — Пионерская ул., 21, пгт Малино',
    );
    expect(markdown).toContain(
      '- Сергей\n  - Телефон: [+7 985 774-75-04](tel:+79857747504)',
    );
  });

  it('renders detail with frontmatter, contact methods and body', () => {
    expect(buildContactMarkdown(contact)).toMatchInlineSnapshot(`
      "---
      title: Иван Петров
      slug: ivan-petrov-fence
      category: Забор
      updated_at: 2026-07-06
      ---

      # Иван Петров

      ## Контакты и адрес

      - Адрес: [Золото Сибири](https://yandex.ru/maps/-/CTq-BEOk) — Пионерская ул., 21, пгт Малино
      - Телефон: [+7 900 000-00-00](tel:+79000000000)
      - Telegram: <https://t.me/example>
      - Email: <team@example.com>

      Работает с заборами и воротами. Перед началом работ стоит отдельно согласовать сроки, материалы и гарантию.

      ## Что уточнить

      Перед оплатой уточняйте цену.
      "
    `);
  });
});
