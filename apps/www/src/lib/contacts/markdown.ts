import {
  createMarkdownDocument,
  md,
  parseMarkdownFragment,
  serializeMarkdownDocument,
} from '@shelkovo/markdown';
import { count } from '@shelkovo/format';

import { absoluteUrl } from '@/lib/site';

import type {
  Contact,
  ContactCategoryPage,
  ContactsDataset,
  ContactWithDetail,
} from './types';
import {
  CONTACTS_DISCLAIMER,
  type ContactMethod,
  contactExcerpt,
  contactMethods,
  formatContactCategory,
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

const methodLine = (method: ContactMethod): MarkdownListItem =>
  md.listItem([
    md.paragraph(
      method.href
        ? [md.text(`${method.label}: `), md.link(method.href, method.value)]
        : `${method.label}: ${method.value}`,
    ),
  ]);

const contactTitle = (contact: Contact) =>
  contact.hasDetailPage
    ? [md.link(abs(contact.markdownUrl), contact.title)]
    : [md.text(contact.title)];

const contactLine = (contact: Contact): MarkdownListItem => {
  const excerpt = contactExcerpt(contact);
  const children = [
    md.paragraph([
      ...contactTitle(contact),
      ...(excerpt ? [md.text(` — ${excerpt}`)] : []),
    ]),
    md.list(contactMethods(contact.contacts).map(methodLine)),
  ];

  return md.listItem(children);
};

const categoryLine = (category: ContactCategoryPage): MarkdownListItem =>
  md.listItem([
    md.paragraph([
      md.link(
        abs(category.markdownUrl),
        formatContactCategory(category.category),
      ),
      md.text(
        ` — ${count(category.contacts.length, ['контакт', 'контакта', 'контактов'])}`,
      ),
    ]),
  ]);

const contactFrontmatter = (
  contact: ContactWithDetail,
): Readonly<Record<string, unknown>> => ({
  title: contact.title,
  slug: contact.slug,
  category: formatContactCategory(contact.category),
  updated_at: contact.updatedIso,
  summary: contact.summary,
});

export const buildContactsHomeMarkdown = (data: ContactsDataset): string =>
  serialize([
    md.heading(1, 'Сарафан'),
    md.paragraph(CONTACTS_DISCLAIMER),
    md.heading(2, 'Категории'),
    data.categories.length > 0
      ? md.list(data.categories.map(categoryLine))
      : md.paragraph(
          'Пока контакты не опубликованы. Когда появятся первые записи, здесь будет список со способами связи.',
        ),
    ...data.categories.flatMap((category) => [
      md.heading(2, formatContactCategory(category.category)),
      md.list(category.contacts.map(contactLine)),
    ]),
  ]);

export const buildContactsCategoryMarkdown = (
  category: ContactCategoryPage,
): string =>
  serialize([
    md.heading(1, formatContactCategory(category.category)),
    md.heading(2, 'Контакты'),
    md.list(category.contacts.map(contactLine)),
  ]);

export const buildContactMarkdown = (contact: ContactWithDetail): string =>
  serializeMarkdownDocument(
    createMarkdownDocument({
      frontmatter: contactFrontmatter(contact),
      children: [
        md.heading(1, contact.title),
        md.heading(2, 'Способы связи'),
        md.list(contactMethods(contact.contacts).map(methodLine)),
        ...parseMarkdownFragment(contact.body.trim()),
      ],
    }),
  );
