import { extractFirstMarkdownText } from '@shelkovo/markdown';

import type { ContactCategory } from './schema';
import type { Contact, ContactContacts } from './types';

export interface ContactMethod {
  readonly type: keyof ContactContacts;
  readonly label: string;
  readonly value: string;
  readonly href?: string;
}

const CONTACT_CATEGORY_LABELS: Record<ContactCategory, string> = {
  fence: 'Забор',
};

const CONTACT_CATEGORY_EMOJI: Record<ContactCategory, string> = {
  fence: '🚧',
};

export const CONTACTS_PROSE = 'ui-prose max-w-[65ch]';

export const CONTACTS_CHAT_LABEL = 'чате жителей Шелково';
export const CONTACTS_CHAT_URL = 'https://t.me/shelkovoecoclub';

export const CONTACTS_INTRO_PREFIX = 'Сарафан собирается из опыта соседей в ';
export const CONTACTS_INTRO_SUFFIX =
  ': кого позвали, как прошла работа, к кому готовы обратиться снова. Лучше меньше контактов, зато с понятным живым контекстом.';

export const CONTACTS_EMPTY_PREFIX =
  'Пока здесь ничего нет. Если ищете подрядчика сейчас, можно посмотреть ';
export const CONTACTS_EMPTY_LINK_LABEL =
  'таблицу контактов из соседнего чата Гринвуда';
export const CONTACTS_EMPTY_LINK_URL =
  'https://docs.google.com/spreadsheets/d/1ckmDY1B54Mx9UB1chbybwdbPTF87R--uv2li7VhCfg8/edit?usp=drivesdk';
export const CONTACTS_EMPTY_SUFFIX = '.';

const phoneHref = (phone: string): string =>
  `tel:${phone.replace(/[^+\d]/gu, '')}`;

const method = (
  type: keyof ContactContacts,
  label: string,
  value: string | undefined,
  href?: string,
): ContactMethod | undefined =>
  value
    ? {
        type,
        label,
        value,
        href,
      }
    : undefined;

export const formatContactCategory = (category: ContactCategory): string =>
  CONTACT_CATEGORY_LABELS[category];

export const formatContactCategoryEmoji = (category: ContactCategory): string =>
  CONTACT_CATEGORY_EMOJI[category];

export const contactExcerpt = (
  contact: Pick<Contact, 'body' | 'summary'>,
): string => {
  if (contact.summary) {
    return contact.summary;
  }

  if (!contact.body.trim()) {
    return '';
  }

  const text = (extractFirstMarkdownText(contact.body) ?? '')
    .replace(/\s+/gu, ' ')
    .trim();

  return text;
};

export const contactMethods = (
  contacts: ContactContacts,
): readonly ContactMethod[] =>
  [
    method(
      'phone',
      'Телефон',
      contacts.phone,
      contacts.phone ? phoneHref(contacts.phone) : undefined,
    ),
    method('telegram', 'Telegram', contacts.telegram, contacts.telegram),
    method('whatsapp', 'WhatsApp', contacts.whatsapp, contacts.whatsapp),
    method(
      'email',
      'Email',
      contacts.email,
      contacts.email ? `mailto:${contacts.email}` : undefined,
    ),
    method('website', 'Сайт', contacts.website, contacts.website),
  ].filter((item): item is ContactMethod => Boolean(item));
