import { beforeAll, describe, expect, it } from 'vitest';

import type { PersonProfile } from './schema';

let buildPersonMarkdown: typeof import('./view').buildPersonMarkdown;
let describePersonProfile: typeof import('./view').describePersonProfile;
let formatPersonContactCompactDisplay: typeof import('./view').formatPersonContactCompactDisplay;
let formatPersonHeadline: typeof import('./view').formatPersonHeadline;
let normalizePersonContact: typeof import('./view').normalizePersonContact;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({
    buildPersonMarkdown,
    describePersonProfile,
    formatPersonContactCompactDisplay,
    formatPersonHeadline,
    normalizePersonContact,
  } = await import('./view'));
});

describe('normalizePersonContact', () => {
  it('normalizes telegram handles with or without @', () => {
    expect(
      normalizePersonContact(
        {
          type: 'telegram',
          value: 'Kirill_ZemlyaMO',
        },
        'people profile "kschemelinin" contact #1',
      ),
    ).toMatchObject({
      display: '@Kirill_ZemlyaMO',
      href: 'https://t.me/Kirill_ZemlyaMO',
    });

    expect(
      normalizePersonContact(
        {
          type: 'telegram',
          value: '@Kirill_ZemlyaMO',
        },
        'people profile "kschemelinin" contact #1',
      ),
    ).toMatchObject({
      display: '@Kirill_ZemlyaMO',
      href: 'https://t.me/Kirill_ZemlyaMO',
    });
  });

  it('builds tel links from formatted phone numbers', () => {
    expect(
      normalizePersonContact(
        {
          type: 'phone',
          value: '+7 (916) 555-12-34',
        },
        'people profile "kschemelinin" contact #1',
      ),
    ).toMatchObject({
      display: '+7 (916) 555-12-34',
      href: 'tel:+79165551234',
    });
  });
});

describe('describePersonProfile', () => {
  it('extracts the first paragraph as a plain-text description', () => {
    expect(
      describePersonProfile({
        name: 'Кирилл Щемелинин',
        body: 'Первый абзац с [ссылкой](https://example.com).\n\nВторой абзац.',
      }),
    ).toBe('Первый абзац с ссылкой.');
  });

  it('keeps person names after mention links are expanded', () => {
    expect(
      describePersonProfile({
        name: 'Андрей Петров',
        body: 'Как отметил [Кирилл Щемелинин](/people/kschemelinin/), проблема редкая.',
      }),
    ).toBe('Как отметил Кирилл Щемелинин, проблема редкая.');
  });

  it('falls back to position and company when body is empty', () => {
    expect(
      describePersonProfile({
        name: 'Кирилл Щемелинин',
        company: 'ОК "Комфорт"',
        position: 'Исполняющий обязанности директора по эксплуатации',
        body: '',
      }),
    ).toBe(
      'Кирилл Щемелинин — Исполняющий обязанности директора по эксплуатации, ОК "Комфорт".',
    );
  });
});

describe('formatPersonHeadline', () => {
  it('joins position and company into a single line', () => {
    expect(
      formatPersonHeadline({
        company: 'ОК "Комфорт"',
        position: 'Исполняющий обязанности директора по эксплуатации',
      }),
    ).toBe('Исполняющий обязанности директора по эксплуатации, ОК "Комфорт"');
  });
});

describe('formatPersonContactCompactDisplay', () => {
  it('omits the at-sign for telegram when the icon already conveys the type', () => {
    expect(
      formatPersonContactCompactDisplay({
        type: 'telegram',
        display: '@Kirill_ZemlyaMO',
      }),
    ).toBe('Kirill_ZemlyaMO');

    expect(
      formatPersonContactCompactDisplay({
        type: 'phone',
        display: '+7 (916) 555-12-34',
      }),
    ).toBe('+7 (916) 555-12-34');
  });
});

describe('buildPersonMarkdown', () => {
  it('renders contacts, body, and backlinks into the markdown companion', () => {
    const profile: PersonProfile = {
      id: 'kschemelinin',
      slug: 'kschemelinin',
      name: 'Кирилл Щемелинин',
      company: 'ОК "Комфорт"',
      position: 'Исполняющий обязанности директора по эксплуатации',
      url: '/people/kschemelinin/',
      markdown_url: '/people/kschemelinin/index.md',
      canonical: 'https://example.com/people/kschemelinin/',
      contacts: [
        {
          type: 'telegram',
          value: '@Kirill_ZemlyaMO',
          display: '@Kirill_ZemlyaMO',
          href: 'https://t.me/Kirill_ZemlyaMO',
        },
      ],
      body: 'Публичный профиль с контекстом.',
      mentions: [],
      backlinks: {
        news: [
          {
            section: 'news',
            kind: 'article',
            source_id: '2026/05/electricity',
            title: 'Авария на линии',
            html_url: '/news/2026/05/electricity/',
            markdown_url: '/news/2026/05/electricity/index.md',
            excerpt: 'Основной текст про Кирилла Щемелинина.',
            mentioned_at: '2026-05-03T09:00:00+03:00',
            sort_key: 1,
          },
        ],
        status: [
          {
            section: 'status',
            kind: 'incident',
            source_id: '2026/04/electricity-river-10kv-line-damage',
            title: 'Отключение электричества в Шелково Ривер',
            html_url:
              '/status/incidents/2026/04/electricity-river-10kv-line-damage/',
            markdown_url:
              '/status/incidents/2026/04/electricity-river-10kv-line-damage/index.md',
            excerpt: 'Как отметил Кирилл Щемелинин, повреждение было редким.',
            mentioned_at: '2026-04-22T11:30:00+03:00',
            sort_key: 2,
          },
        ],
        people: [],
      },
    };

    const markdown = buildPersonMarkdown(profile);

    expect(markdown).toContain(
      'Исполняющий обязанности директора по эксплуатации, ОК "Комфорт"',
    );
    expect(markdown).toContain(
      String.raw`- Telegram: [@Kirill\_ZemlyaMO](https://t.me/Kirill_ZemlyaMO)`,
    );
    expect(markdown).toContain('## Профиль');
    expect(markdown).toContain('Публичный профиль с контекстом.');
    expect(markdown).toContain('## Где упоминается');
    expect(markdown).toContain('### Новости');
    expect(markdown).toContain('### Статус');
    expect(markdown).toContain(
      '[Авария на линии](https://example.com/news/2026/05/electricity/index.md) — Новость; 3 мая 2026',
    );
    expect(markdown).toContain(
      '[Отключение электричества в Шелково Ривер](https://example.com/status/incidents/2026/04/electricity-river-10kv-line-damage/index.md) — Инцидент; 22 апреля',
    );
  });

  it('parses profile body as Markdown fragment without nested frontmatter', () => {
    const profile: PersonProfile = {
      id: 'kschemelinin',
      slug: 'kschemelinin',
      name: 'Кирилл Щемелинин',
      company: 'ОК "Комфорт"',
      position: 'Исполняющий обязанности директора по эксплуатации',
      url: '/people/kschemelinin/',
      markdown_url: '/people/kschemelinin/index.md',
      canonical: 'https://example.com/people/kschemelinin/',
      contacts: [],
      body: [
        '---',
        'internal: true',
        '---',
        '',
        '### Роль',
        '',
        'Помогает с [инцидентами](/status/index.md).',
      ].join('\n'),
      mentions: [],
      backlinks: {
        news: [],
        status: [],
        people: [],
      },
    };

    const markdown = buildPersonMarkdown(profile);

    expect(markdown).toMatchInlineSnapshot(`
      "# Кирилл Щемелинин

      Исполняющий обязанности директора по эксплуатации, ОК "Комфорт"

      ## Контакты

      - Контакты пока не опубликованы.

      ## Профиль

      ### Роль

      Помогает с [инцидентами](/status/index.md).

      ## Где упоминается

      - Пока публичных упоминаний не найдено.
      "
    `);
  });

  it('omits profile section when markdown body is empty', () => {
    const profile: PersonProfile = {
      id: 'kschemelinin',
      slug: 'kschemelinin',
      name: 'Кирилл Щемелинин',
      company: 'ОК "Комфорт"',
      position: 'Исполняющий обязанности директора по эксплуатации',
      url: '/people/kschemelinin/',
      markdown_url: '/people/kschemelinin/index.md',
      canonical: 'https://example.com/people/kschemelinin/',
      contacts: [
        {
          type: 'phone',
          value: '+7 (967) 246-37-49',
          display: '+7 (967) 246-37-49',
          href: 'tel:+79672463749',
        },
      ],
      body: '',
      mentions: [],
      backlinks: {
        news: [],
        status: [],
        people: [],
      },
    };

    expect(buildPersonMarkdown(profile)).toContain(
      'Исполняющий обязанности директора по эксплуатации, ОК "Комфорт"',
    );
    expect(buildPersonMarkdown(profile)).not.toContain('## Профиль');
  });
});
