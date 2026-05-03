import { extractFirstMarkdownText } from '../markdown/plain-text';
import { MARKDOWN_ROBOTS } from '../news/seo';
import { NEWS_PROSE } from '../news/view';
import type { PersonContact, PersonContactType, PersonProfile } from './schema';

const TELEGRAM_HANDLE = /^@?([A-Za-z0-9_]+)$/u;

const CONTACT_LABELS: Record<PersonContactType, string> = {
  phone: 'Телефон',
  telegram: 'Telegram',
};

export const PEOPLE_PROSE = NEWS_PROSE;

export const PEOPLE_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': MARKDOWN_ROBOTS,
} as const;

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const section = (title: string, rows: readonly string[]): readonly string[] => [
  `## ${title}`,
  ...(rows.length > 0 ? rows : ['- Нет данных.']),
  '',
];

const escapeMarkdown = (value: string): string =>
  value.replace(/([\\\[\]])/gu, '\\$1');

const contactLine = (contact: PersonContact): string =>
  `- ${formatPersonContactType(contact.type)}: [${escapeMarkdown(contact.display)}](${contact.href})`;

const phoneHref = (value: string, context: string): string => {
  const display = value.trim();
  const digits = display.replace(/\D/gu, '');

  if (!digits) {
    throw new Error(`${context} phone must contain digits`);
  }

  return display.startsWith('+') ? `tel:+${digits}` : `tel:${digits}`;
};

const telegramParts = (
  value: string,
  context: string,
): {
  readonly display: string;
  readonly href: string;
} => {
  const match = value.trim().match(TELEGRAM_HANDLE);

  if (!match) {
    throw new Error(
      `${context} telegram must use a handle like @username or username`,
    );
  }

  const handle = match[1];

  return {
    display: `@${handle}`,
    href: `https://t.me/${handle}`,
  };
};

export const formatPersonContactType = (type: PersonContactType): string =>
  CONTACT_LABELS[type];

export const normalizePersonContact = (
  input: {
    readonly type: PersonContactType;
    readonly value: string;
  },
  context: string,
): PersonContact => {
  const value = input.value.trim();

  if (!value) {
    throw new Error(`${context} value is required`);
  }

  if (input.type === 'phone') {
    return {
      type: input.type,
      value,
      display: value,
      href: phoneHref(value, context),
    };
  }

  const telegram = telegramParts(value, context);

  return {
    type: input.type,
    value,
    display: telegram.display,
    href: telegram.href,
  };
};

export const describePersonProfile = (
  profile: Pick<PersonProfile, 'body' | 'name'>,
): string => {
  const first = extractFirstMarkdownText(profile.body);

  return (
    first ??
    `${profile.name} — публичный профиль человека из раздела people на сайте Шелково Онлайн.`
  );
};

export const buildPersonMarkdown = (profile: PersonProfile): string =>
  join([
    `# ${profile.name}`,
    '',
    ...section(
      'Контакты',
      profile.contacts.length > 0
        ? profile.contacts.map(contactLine)
        : ['- Контакты пока не опубликованы.'],
    ),
    ...(profile.body ? ['## Профиль', '', profile.body.trim(), ''] : []),
  ]);
