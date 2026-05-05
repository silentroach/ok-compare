import { pluralizeRu } from '@shelkovo/format';

import { absoluteUrl } from '../site';
import { loadPeopleDataWithBacklinks } from './load';
import type { PersonBacklinks } from './schema';
import {
  peopleApiCatalogUrl,
  peopleDataUrl,
  peopleLlmsFullUrl,
  peopleLlmsUrl,
  peopleMarkdownUrl,
  peopleOpenApiUrl,
  peopleSchemaUrl,
} from './routes';

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const count = (value: number, forms: [string, string, string]): string =>
  `${value} ${pluralizeRu(value, forms)}`;

const backlinksCount = (backlinks: PersonBacklinks): number =>
  backlinks.news.length + backlinks.status.length + backlinks.people.length;

export async function build(kind: 'short' | 'full'): Promise<string> {
  const data = await loadPeopleDataWithBacklinks();
  const profile = data.profiles[0];
  const mentionCount = data.profiles.reduce(
    (total, item) => total + item.mentions.length,
    0,
  );
  const backlinkCount = data.profiles.reduce(
    (total, item) => total + backlinksCount(item.backlinks),
    0,
  );

  const overview = absoluteUrl(peopleMarkdownUrl());
  const feed = absoluteUrl(peopleDataUrl());
  const short = absoluteUrl(peopleLlmsUrl());
  const full = absoluteUrl(peopleLlmsFullUrl());
  const catalog = absoluteUrl(peopleApiCatalogUrl());
  const schema = absoluteUrl(peopleSchemaUrl());
  const openapi = absoluteUrl(peopleOpenApiUrl());
  const detailHtml = profile?.canonical ?? '/people/[slug]/';
  const detailMarkdown = profile
    ? absoluteUrl(profile.markdown_url)
    : '/people/[slug]/index.md';

  return kind === 'short'
    ? join([
        'Люди Шелково',
        'Файл: llms.txt',
        'Язык: русский',
        '',
        'Описание',
        '- Это статический people-section внутри kpshelkovo.online с публичными профилями людей, контактами и графом упоминаний между `news`, `status` и `people`.',
        `- Сейчас в разделе ${count(data.profiles.length, ['профиль', 'профиля', 'профилей'])}, ${count(mentionCount, ['исходящее упоминание', 'исходящих упоминания', 'исходящих упоминаний'])} и ${count(backlinkCount, ['обратная ссылка', 'обратные ссылки', 'обратных ссылок'])}.`,
        '- Публичного HTML-индекса `/people/` нет: для массового обхода используйте people.json и markdown overview.',
        '- У профиля могут быть `company`, `position` и `name_cases` для склонения mention; `body_markdown` может быть пустым, если базовый контекст уже есть во frontmatter.',
        '',
        'Главные URL',
        `- Markdown overview people-section: ${overview}`,
        `- Основной JSON feed: ${feed}`,
        `- API catalog: ${catalog}`,
        `- JSON Schema: ${schema}`,
        `- OpenAPI: ${openapi}`,
        `- Расширенная версия этого текста: ${full}`,
        '',
        'Как читать раздел',
        `- Для массового обхода начинайте с ${feed}.`,
        `- Для одной персоны переходите на ${detailHtml} или ${detailMarkdown}.`,
        '- В `mentions` лежат исходящие упоминания из body профиля, если body заполнен; в `backlinks` - входящие ссылки из news, status и других people profiles.',
        '- Контакты публикуются открыто и не маскируются в feed или markdown companions.',
      ])
    : join([
        'Люди Шелково',
        'Файл: llms-full.txt',
        'Язык: русский',
        '',
        'Проект',
        '- Это статический people-section внутри kpshelkovo.online под namespace `/people/...`.',
        '- Он нужен для публикации detail pages людей, их markdown companions, публичных контактов и mention/backlink-графа без HTML-индекса раздела.',
        `- Сейчас в разделе ${count(data.profiles.length, ['профиль', 'профиля', 'профилей'])}, ${count(mentionCount, ['исходящее упоминание', 'исходящих упоминания', 'исходящих упоминаний'])} и ${count(backlinkCount, ['обратная ссылка', 'обратные ссылки', 'обратных ссылок'])}.`,
        '',
        'Канонические URL',
        `- Markdown overview people-section: ${overview}`,
        `- Короткий агентный обзор: ${short}`,
        `- Расширенный агентный обзор: ${full}`,
        `- Основной JSON feed: ${feed}`,
        `- API catalog: ${catalog}`,
        `- JSON Schema: ${schema}`,
        `- OpenAPI: ${openapi}`,
        `- Пример detail HTML: ${detailHtml}`,
        `- Пример detail Markdown: ${detailMarkdown}`,
        '',
        'Описание people.json',
        '- Это основной read-only structured feed для массового обхода people-section.',
        '- Корневой объект содержит `stats` и `profiles`.',
        '- `stats` дает агрегированные counts по профилям, исходящим mentions и публичным backlinks.',
        '- `profiles[]` включает `id`, `slug`, `name`, опциональные `name_cases`, `company` и `position`, `html_url`, `markdown_url`, `contacts`, `body_markdown`, `mentions`, `mention_count`, `backlinks` и `backlink_count`.',
        '- `mentions[]` раскрывают `@slug` и `@slug:case` из body профиля в имя нужного падежа и ссылки на detail surfaces; если body пустой, массив будет пустым.',
        '- `backlinks` группируются по `news`, `status` и `people`, чтобы отвечать на вопрос, где человек уже фигурирует на сайте.',
        '',
        'HTML и Markdown surfaces',
        '- Публичного HTML-home route `/people/` нет и в MVP не будет.',
        '- HTML detail pages `/people/[slug]/` остаются каноническим человекочитаемым представлением одной персоны.',
        '- Markdown companions `/people/[slug]/index.md` дают text-first слой для терминалов и агентов.',
        '- `/people/index.md` работает как section overview для агентов и терминалов, а не как список-страница для обычной навигации.',
        '',
        'Ограничения',
        '- Все routes people-section генерируются статически; mutation endpoints и auth в этой поверхности отсутствуют.',
        '- Контакты публикуются как есть в source data и считаются публичными.',
        '- Неизвестные `@slug` не допускаются: source markdown должен падать на билде до публикации.',
      ]);
}
