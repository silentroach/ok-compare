import { pluralizeRu } from '@shelkovo/format';
import {
  createMarkdownDocument,
  md,
  parseMarkdownFragment,
  serializeMarkdownDocument,
} from '@shelkovo/markdown';

import { absoluteUrl } from '../site';
import type { PersonBacklinks, PersonProfile } from './schema';
import {
  buildPersonMarkdown,
  describePersonProfile,
  formatPersonContactType,
  formatPersonHeadline,
} from './view';

export const PEOPLE_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

type MarkdownNode = ReturnType<typeof parseMarkdownFragment>[number];
type MarkdownListItem = ReturnType<typeof md.listItem>;

const serialize = (children: readonly MarkdownNode[]): string =>
  serializeMarkdownDocument(createMarkdownDocument({ children }));

const count = (value: number, forms: [string, string, string]): string =>
  `${value} ${pluralizeRu(value, forms)}`;

const inline = (value: string): string => value.replace(/\s+/gu, ' ').trim();

const backlinksCount = (backlinks: PersonBacklinks): number =>
  backlinks.news.length + backlinks.status.length + backlinks.people.length;

const profileLine = (profile: PersonProfile): MarkdownListItem => {
  const summary = profile.body
    ? inline(describePersonProfile(profile))
    : undefined;
  const meta = [
    formatPersonHeadline(profile),
    profile.contacts.length > 0
      ? profile.contacts
          .map(
            (contact) =>
              `${formatPersonContactType(contact.type)}: ${contact.display}`,
          )
          .join(', ')
      : 'контакты не опубликованы',
    count(profile.mentions.length, [
      'исходящее упоминание',
      'исходящих упоминания',
      'исходящих упоминаний',
    ]),
    count(backlinksCount(profile.backlinks), [
      'обратная ссылка',
      'обратные ссылки',
      'обратных ссылок',
    ]),
  ].filter((value): value is string => Boolean(value));

  return md.listItem([
    md.paragraph([
      md.link(absoluteUrl(profile.markdown_url), profile.name),
      md.text(` — ${meta.join('; ')}`),
    ]),
    ...(summary ? [md.paragraph(summary)] : []),
  ]);
};

export const buildPeopleHomeMarkdown = (
  profiles: readonly PersonProfile[],
): string => {
  const mentionCount = profiles.reduce(
    (total, profile) => total + profile.mentions.length,
    0,
  );
  const backlinkCount = profiles.reduce(
    (total, profile) => total + backlinksCount(profile.backlinks),
    0,
  );

  return serialize([
    md.heading(1, 'Люди Шелково'),
    md.paragraph(
      'Текстовый обзор публичных профилей людей и графа упоминаний с обратными ссылками.',
    ),
    md.paragraph(
      'Публичного HTML-индекса `/people/` нет: для массового обхода используйте `people.json`, а для чтения одного профиля переходите на страницу профиля или ее Markdown-файл.',
    ),
    md.heading(2, 'Сводка'),
    md.list([
      md.listItem(
        `Опубликовано ${count(profiles.length, ['профиль', 'профиля', 'профилей'])}.`,
      ),
      md.listItem(
        `В тексте профилей сейчас ${count(mentionCount, ['исходящее упоминание', 'исходящих упоминания', 'исходящих упоминаний'])}. Пустой текст допустим для профилей, где контекст уже есть в служебных метаданных.`,
      ),
      md.listItem(
        `В публичном графе сейчас ${count(backlinkCount, ['обратная ссылка', 'обратные ссылки', 'обратных ссылок'])}.`,
      ),
    ]),
    md.heading(2, 'Профили'),
    md.list(
      profiles.length > 0
        ? profiles.map(profileLine)
        : [md.listItem('Публичные профили пока не опубликованы.')],
    ),
  ]);
};

export { buildPersonMarkdown };
