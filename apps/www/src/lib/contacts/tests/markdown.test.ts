import { beforeAll, describe, expect, it } from 'vitest';

import type { Contact } from '../types';

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
    address: 'Ступино',
  },
  url: '/contacts/ivan-petrov-fence/',
  markdownUrl: '/contacts/ivan-petrov-fence/index.md',
  canonical: 'https://example.com/contacts/ivan-petrov-fence/',
  body: 'Работает с заборами и воротами. Перед началом работ стоит отдельно согласовать сроки, материалы и гарантию.\n\n## Что уточнить\n\nПеред оплатой уточняйте цену.',
  mentions: [],
} satisfies Contact;

describe('contacts markdown companions', () => {
  it('renders empty launch index without internal paths', () => {
    const markdown = buildContactsHomeMarkdown({
      contacts: [],
      bySlug: new Map(),
    });

    expect(markdown).toMatchInlineSnapshot(`
      "# Полезные контакты

      Редакционный каталог контактов, которые могут быть полезны жителям Шелково.

      Сайт публикует контакт и доступный редакционный контекст, но не гарантирует качество услуги и не подтверждает квалификацию исполнителя. Перед оплатой уточняйте цену, сроки и состав работ.

      ## Контакты

      Пока контакты не опубликованы. Когда появятся первые карточки, здесь будет список контактов и ссылки на подробные страницы.
      "
    `);
    expect(markdown).not.toMatch(/apps\/www|src\/|repo:/u);
  });

  it('renders populated index with contact markdown links', () => {
    const markdown = buildContactsHomeMarkdown({
      contacts: [contact],
      bySlug: new Map([[contact.slug, contact]]),
    });

    expect(markdown).toContain(
      '[Иван Петров](https://example.com/contacts/ivan-petrov-fence/index.md)',
    );
    expect(markdown).toContain('Забор; обновлено 6 июля 2026');
    expect(markdown).not.toContain('+7 900 000-00-00');
  });

  it('renders detail with frontmatter, contact methods, body and disclaimer', () => {
    expect(buildContactMarkdown(contact)).toMatchInlineSnapshot(`
      "---
      title: Иван Петров
      slug: ivan-petrov-fence
      category: Забор
      updated_at: 2026-07-06
      ---

      # Иван Петров

      Забор; обновлено 6 июля 2026.

      ## Способы связи

      - Телефон: [+7 900 000-00-00](tel:+79000000000)
      - Telegram: <https://t.me/example>
      - Email: <team@example.com>
      - Адрес: Ступино

      Работает с заборами и воротами. Перед началом работ стоит отдельно согласовать сроки, материалы и гарантию.

      ## Что уточнить

      Перед оплатой уточняйте цену.

      ## Отказ от ответственности

      Сайт публикует контакт и доступный редакционный контекст, но не гарантирует качество услуги и не подтверждает квалификацию исполнителя. Перед оплатой уточняйте цену, сроки и состав работ.
      "
    `);
  });
});
