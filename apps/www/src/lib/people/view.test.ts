import { beforeAll, describe, expect, it } from 'vitest';

import type { PersonProfile } from './schema';

let buildPersonMarkdown: typeof import('./view').buildPersonMarkdown;
let describePersonProfile: typeof import('./view').describePersonProfile;
let normalizePersonContact: typeof import('./view').normalizePersonContact;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildPersonMarkdown, describePersonProfile, normalizePersonContact } =
    await import('./view'));
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
});

describe('buildPersonMarkdown', () => {
  it('renders contacts and body into the markdown companion', () => {
    const profile: PersonProfile = {
      id: 'kschemelinin',
      slug: 'kschemelinin',
      name: 'Кирилл Щемелинин',
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
    };

    expect(buildPersonMarkdown(profile)).toContain(
      '- Telegram: [@Kirill_ZemlyaMO](https://t.me/Kirill_ZemlyaMO)',
    );
    expect(buildPersonMarkdown(profile)).toContain('## Профиль');
    expect(buildPersonMarkdown(profile)).toContain(
      'Публичный профиль с контекстом.',
    );
  });
});
