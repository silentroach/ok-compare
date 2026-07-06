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

export const CONTACTS_DISCLAIMER =
  'Сайт публикует контакты и доступный редакционный контекст, но не гарантирует качество услуги и не подтверждает квалификацию исполнителя. Перед оплатой уточняйте цену, сроки и состав работ.';

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
