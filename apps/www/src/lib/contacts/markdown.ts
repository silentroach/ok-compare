import {
  createMarkdownDocument,
  md,
  parseMarkdownFragment,
  serializeMarkdownDocument,
} from '@shelkovo/markdown';

import { absoluteUrl } from '@/lib/site';

import type { Contact, ContactsDataset } from './types';
import {
  CONTACTS_DISCLAIMER,
  type ContactMethod,
  contactExcerpt,
  contactMethods,
  formatContactCategory,
  formatContactUpdatedDate,
} from './view';

export const CONTACTS_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

type MarkdownNode = ReturnType<typeof parseMarkdownFragment>[number];
type MarkdownListItem = ReturnType<typeof md.listItem>;

const serialize = (children: readonly MarkdownNode[]): string =>
  serializeMarkdownDocument(createMarkdownDocument({ children }));

const abs = (path: string): string => absoluteUrl(path);

const contactLine = (contact: Contact): MarkdownListItem =>
  md.listItem([
    md.paragraph([
      md.link(abs(contact.markdownUrl), contact.title),
      md.text(
        ` — ${formatContactCategory(contact.category)}; обновлено ${formatContactUpdatedDate(contact)}. ${contactExcerpt(contact)}`,
      ),
    ]),
  ]);

const methodLine = (method: ContactMethod): MarkdownListItem =>
  md.listItem([
    md.paragraph(
      method.href
        ? [md.text(`${method.label}: `), md.link(method.href, method.value)]
        : `${method.label}: ${method.value}`,
    ),
  ]);

const contactFrontmatter = (
  contact: Contact,
): Readonly<Record<string, unknown>> => ({
  title: contact.title,
  slug: contact.slug,
  category: formatContactCategory(contact.category),
  updated_at: contact.updatedIso,
});

export const buildContactsHomeMarkdown = (data: ContactsDataset): string =>
  serialize([
    md.heading(1, 'Полезные контакты'),
    md.paragraph(
      'Редакционный каталог контактов, которые могут быть полезны жителям Шелково.',
    ),
    md.paragraph(CONTACTS_DISCLAIMER),
    md.heading(2, 'Контакты'),
    data.contacts.length > 0
      ? md.list(data.contacts.map(contactLine))
      : md.paragraph(
          'Пока контакты не опубликованы. Когда появятся первые карточки, здесь будет список контактов и ссылки на подробные страницы.',
        ),
  ]);

export const buildContactMarkdown = (contact: Contact): string =>
  serializeMarkdownDocument(
    createMarkdownDocument({
      frontmatter: contactFrontmatter(contact),
      children: [
        md.heading(1, contact.title),
        md.paragraph(
          `${formatContactCategory(contact.category)}; обновлено ${formatContactUpdatedDate(contact)}.`,
        ),
        md.heading(2, 'Способы связи'),
        md.list(contactMethods(contact.contacts).map(methodLine)),
        ...parseMarkdownFragment(contact.body.trim()),
        md.heading(2, 'Отказ от ответственности'),
        md.paragraph(CONTACTS_DISCLAIMER),
      ],
    }),
  );
