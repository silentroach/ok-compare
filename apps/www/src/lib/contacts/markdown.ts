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
  CONTACTS_CHAT_LABEL,
  CONTACTS_CHAT_URL,
  CONTACTS_EMPTY_LINK_LABEL,
  CONTACTS_EMPTY_LINK_URL,
  CONTACTS_EMPTY_PREFIX,
  CONTACTS_EMPTY_SUFFIX,
  CONTACTS_INTRO_PREFIX,
  CONTACTS_INTRO_SUFFIX,
  type ContactMethod,
  type ContactPlace,
  contactExcerpt,
  contactMethods,
  contactPlace,
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

const chatLink = () => md.link(CONTACTS_CHAT_URL, CONTACTS_CHAT_LABEL);

const contactsIntro = (): MarkdownNode =>
  md.paragraph([
    md.text(CONTACTS_INTRO_PREFIX),
    chatLink(),
    md.text(CONTACTS_INTRO_SUFFIX),
  ]);

const contactsEmpty = (): MarkdownNode =>
  md.paragraph([
    md.text(CONTACTS_EMPTY_PREFIX),
    md.link(CONTACTS_EMPTY_LINK_URL, CONTACTS_EMPTY_LINK_LABEL),
    md.text(CONTACTS_EMPTY_SUFFIX),
  ]);

const methodLine = (method: ContactMethod): MarkdownListItem =>
  md.listItem([
    md.paragraph(
      method.href
        ? [md.text(`${method.label}: `), md.link(method.href, method.value)]
        : `${method.label}: ${method.value}`,
    ),
  ]);

const placeLine = (place: ContactPlace): MarkdownListItem =>
  md.listItem([
    md.paragraph([
      md.text(`${place.label}: `),
      md.link(place.href, place.title),
      ...(place.address ? [md.text(` — ${place.address}`)] : []),
    ]),
  ]);

const contactInfoLines = (contact: Contact): readonly MarkdownListItem[] => {
  const place = contactPlace(contact.location);

  return [
    ...(place ? [placeLine(place)] : []),
    ...contactMethods(contact.contacts).map(methodLine),
  ];
};

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
    md.list(contactInfoLines(contact)),
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
    contactsIntro(),
    md.heading(2, 'Категории'),
    data.categories.length > 0
      ? md.list(data.categories.map(categoryLine))
      : contactsEmpty(),
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
        md.heading(2, contact.location ? 'Контакты и адрес' : 'Способы связи'),
        md.list(contactInfoLines(contact)),
        ...parseMarkdownFragment(contact.body.trim()),
      ],
    }),
  );
