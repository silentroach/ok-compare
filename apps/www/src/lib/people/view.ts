import {
  createMarkdownDocument,
  extractFirstMarkdownText,
  md,
  parseMarkdownFragment,
  serializeMarkdownDocument,
  type MarkdownPhrasingInput,
} from '@shelkovo/markdown';

import { MARKDOWN_ROBOTS } from '../news/seo';
import { formatNewsDate, NEWS_PROSE } from '../news/view';
import { absoluteUrl } from '../site';
import { formatStatusDate } from '../status/view';
import {
  PERSON_MENTION_SECTIONS,
  type PersonBacklinks,
  type PersonBacklinkKind,
  type PersonContact,
  type PersonContactType,
  type PersonMentionRef,
  type PersonMentionSection,
  type PersonProfile,
} from './schema';

const TELEGRAM_HANDLE = /^@?([A-Za-z0-9_]+)$/u;

const CONTACT_LABELS: Record<PersonContactType, string> = {
  phone: 'Телефон',
  telegram: 'Telegram',
};

const BACKLINK_SECTION_LABELS: Record<PersonMentionSection, string> = {
  news: 'Новости',
  status: 'Статус',
  people: 'Люди',
};

const BACKLINK_KIND_LABELS: Record<PersonBacklinkKind, string> = {
  article: 'Новость',
  addendum: 'Обновление',
  incident: 'Инцидент',
  person: 'Профиль',
};

export const PEOPLE_PROSE = NEWS_PROSE;

export const PEOPLE_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': MARKDOWN_ROBOTS,
} as const;

type MarkdownNode = ReturnType<typeof parseMarkdownFragment>[number];
type MarkdownListItem = ReturnType<typeof md.listItem>;
type MarkdownPhrasingNodes = Exclude<MarkdownPhrasingInput, string>;
type MarkdownPhrasingNode = MarkdownPhrasingNodes[number];

const serialize = (children: readonly MarkdownNode[]): string =>
  serializeMarkdownDocument(createMarkdownDocument({ children }));

const inline = (value: string): string => value.replace(/\s+/gu, ' ').trim();

const section = (
  title: string,
  rows: readonly MarkdownListItem[],
): readonly MarkdownNode[] => [
  md.heading(2, title),
  md.list(rows.length > 0 ? rows : [md.listItem('Нет данных.')]),
];

const contactLine = (contact: PersonContact): MarkdownListItem =>
  md.listItem([
    md.paragraph([
      md.text(`${formatPersonContactType(contact.type)}: `),
      md.link(contact.href, contact.display),
    ]),
  ]);

const backlinkDate = (backlink: PersonMentionRef): string | undefined => {
  if (!backlink.mentioned_at) {
    return undefined;
  }

  return backlink.section === 'status'
    ? formatStatusDate(backlink.mentioned_at)
    : formatNewsDate(backlink.mentioned_at);
};

const backlinkLine = (backlink: PersonMentionRef): MarkdownListItem => {
  const meta = [
    formatPersonBacklinkKind(backlink.kind),
    backlinkDate(backlink),
  ].filter(Boolean);
  const details = meta.length > 0 ? ` — ${meta.join('; ')}` : '';
  const summary = backlink.excerpt ? inline(backlink.excerpt) : undefined;
  const titleLine: MarkdownPhrasingNode[] = [
    md.link(absoluteUrl(backlink.markdown_url), backlink.title),
    ...(details ? [md.text(details)] : []),
  ];

  return md.listItem([
    md.paragraph(titleLine),
    ...(summary ? [md.paragraph(summary)] : []),
  ]);
};

const backlinksSection = (
  backlinks: PersonBacklinks,
): readonly MarkdownNode[] => {
  const groups = personBacklinkGroups(backlinks);

  if (groups.length === 0) {
    return [
      md.heading(2, 'Где упоминается'),
      md.list([md.listItem('Пока публичных упоминаний не найдено.')]),
    ];
  }

  return [
    md.heading(2, 'Где упоминается'),
    ...groups.flatMap((group) => [
      md.heading(3, group.label),
      md.list(group.items.map(backlinkLine)),
    ]),
  ];
};

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

export const formatPersonContactCompactDisplay = (
  contact: Pick<PersonContact, 'type' | 'display'>,
): string =>
  contact.type === 'telegram'
    ? contact.display.replace(/^@/u, '')
    : contact.display;

export const formatPersonHeadline = (
  profile: Pick<PersonProfile, 'company' | 'position'>,
): string | undefined => {
  const parts = [profile.position, profile.company].filter(
    (value): value is string => Boolean(value),
  );

  return parts.length > 0 ? parts.join(', ') : undefined;
};

export const formatPersonBacklinkSection = (
  section: PersonMentionSection,
): string => BACKLINK_SECTION_LABELS[section];

export const formatPersonBacklinkKind = (kind: PersonBacklinkKind): string =>
  BACKLINK_KIND_LABELS[kind];

export const personBacklinkGroups = (
  backlinks: PersonBacklinks,
): readonly {
  readonly section: PersonMentionSection;
  readonly label: string;
  readonly items: readonly PersonMentionRef[];
}[] =>
  PERSON_MENTION_SECTIONS.map((section) => ({
    section,
    label: formatPersonBacklinkSection(section),
    items: backlinks[section],
  })).filter((group) => group.items.length > 0);

export const formatPersonBacklinkDate = (
  backlink: PersonMentionRef,
): string | undefined => backlinkDate(backlink);

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
  profile: Pick<PersonProfile, 'body' | 'company' | 'name' | 'position'>,
): string => {
  const first = extractFirstMarkdownText(profile.body);
  const headline = formatPersonHeadline(profile);

  return (
    first ??
    (headline ? `${profile.name} — ${headline}.` : undefined) ??
    `${profile.name} — публичный профиль человека из раздела профилей на сайте Шелково Онлайн.`
  );
};

export const buildPersonMarkdown = (profile: PersonProfile): string => {
  const headline = formatPersonHeadline(profile);

  return serialize([
    md.heading(1, profile.name),
    ...(headline ? [md.paragraph(headline)] : []),
    ...section(
      'Контакты',
      profile.contacts.length > 0
        ? profile.contacts.map(contactLine)
        : [md.listItem('Контакты пока не опубликованы.')],
    ),
    ...(profile.body
      ? [
          md.heading(2, 'Профиль'),
          ...parseMarkdownFragment(profile.body.trim()),
        ]
      : []),
    ...backlinksSection(profile.backlinks),
  ]);
};
