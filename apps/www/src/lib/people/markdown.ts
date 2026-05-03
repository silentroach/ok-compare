import { pluralizeRu } from '@shelkovo/format';

import { absoluteUrl } from '../site';
import type { PersonBacklinks, PersonProfile } from './schema';
import {
  buildPersonMarkdown,
  describePersonProfile,
  formatPersonContactType,
} from './view';

export const PEOPLE_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const count = (value: number, forms: [string, string, string]): string =>
  `${value} ${pluralizeRu(value, forms)}`;

const inline = (value: string): string => value.replace(/\s+/gu, ' ').trim();

const backlinksCount = (backlinks: PersonBacklinks): number =>
  backlinks.news.length + backlinks.status.length + backlinks.people.length;

const profileLine = (profile: PersonProfile): string => {
  const summary = inline(describePersonProfile(profile));
  const meta = [
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
  ];

  return `- [${profile.name}](${absoluteUrl(profile.markdown_url)}) — ${meta.join('; ')}${summary ? `\n  ${summary}` : ''}`;
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

  return join([
    '# Люди Шелково',
    '',
    'Текстовый обзор публичных people-профилей и их mention/backlink-графа.',
    'Публичного HTML-индекса `/people/` нет: для массового обхода используйте `people.json`, а для чтения одного профиля переходите на detail page или ее markdown companion.',
    '',
    '## Сводка',
    `- Опубликовано ${count(profiles.length, ['профиль', 'профиля', 'профилей'])}.`,
    `- В source body сейчас ${count(mentionCount, ['исходящее упоминание', 'исходящих упоминания', 'исходящих упоминаний'])}.`,
    `- В публичном графе сейчас ${count(backlinkCount, ['обратная ссылка', 'обратные ссылки', 'обратных ссылок'])}.`,
    '',
    '## Профили',
    ...(profiles.length > 0
      ? profiles.map(profileLine)
      : ['- Публичные профили пока не опубликованы.']),
    '',
  ]);
};

export { buildPersonMarkdown };
