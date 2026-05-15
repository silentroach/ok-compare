import { pluralizeRu } from '@shelkovo/format';
import {
  createMarkdownDocument,
  parseMarkdownFragment,
  serializeMarkdownDocument,
} from '@shelkovo/markdown';

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

const SECTION_TITLES = new Set([
  'Описание',
  'Главные URL',
  'Как читать раздел',
  'Проект',
  'Канонические URL',
  'Описание people.json',
  'HTML и Markdown',
  'Ограничения',
]);

const serializeLlmsDocument = (lines: readonly string[]): string =>
  serializeMarkdownDocument(
    createMarkdownDocument({
      children: parseMarkdownFragment(
        lines
          .map((line, index) => {
            if (index === 0) return `# ${line}`;
            if (SECTION_TITLES.has(line)) return `## ${line}`;

            return line;
          })
          .join('\n'),
      ),
    }),
  );

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
    ? serializeLlmsDocument([
        'Люди Шелково',
        'Файл: llms.txt',
        'Язык: русский',
        '',
        'Описание',
        '- Раздел `/people/` публикует публичные профили людей, контакты и граф упоминаний между новостями, статусом и другими профилями.',
        `- Сейчас в разделе ${count(data.profiles.length, ['профиль', 'профиля', 'профилей'])}, ${count(mentionCount, ['исходящее упоминание', 'исходящих упоминания', 'исходящих упоминаний'])} и ${count(backlinkCount, ['обратная ссылка', 'обратные ссылки', 'обратных ссылок'])}.`,
        '- Публичного HTML-индекса `/people/` нет: для массового обхода используйте people.json и markdown overview.',
        '- У профиля могут быть `company`, `position` и `name_cases` для склонения canonical mentions; `body_markdown` может быть пустым, если базовый контекст уже есть во frontmatter.',
        '',
        'Главные URL',
        `- Markdown overview раздела: ${overview}`,
        `- Основной JSON feed: ${feed}`,
        `- API catalog: ${catalog}`,
        `- JSON Schema: ${schema}`,
        `- OpenAPI: ${openapi}`,
        `- Расширенная версия этого текста: ${full}`,
        '',
        'Как читать раздел',
        `- Для массового обхода начинайте с ${feed}.`,
        `- Для одной персоны переходите на ${detailHtml} или ${detailMarkdown}.`,
        '- В `mentions` лежат исходящие упоминания из body профиля, если body заполнен; учитываются `@slug`, `@slug:case` и `[текст](@slug)`, а `[текст](@slug:case)` не поддерживается.',
        '- В `backlinks` лежат входящие ссылки из новостей, статуса и других профилей, собранные из тех же canonical и labelled mention-синтаксисов.',
        '- Контакты публикуются открыто и не маскируются в feed или markdown companions.',
      ])
    : serializeLlmsDocument([
        'Люди Шелково',
        'Файл: llms-full.txt',
        'Язык: русский',
        '',
        'Проект',
        '- Раздел `/people/` публикует detail pages людей, markdown companions, публичные контакты и mention/backlink-граф без HTML-индекса раздела.',
        '- Для массового чтения используйте JSON feed; HTML и Markdown удобнее для одного профиля.',
        `- Сейчас в разделе ${count(data.profiles.length, ['профиль', 'профиля', 'профилей'])}, ${count(mentionCount, ['исходящее упоминание', 'исходящих упоминания', 'исходящих упоминаний'])} и ${count(backlinkCount, ['обратная ссылка', 'обратные ссылки', 'обратных ссылок'])}.`,
        '',
        'Канонические URL',
        `- Markdown overview раздела: ${overview}`,
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
        '- Это основной read-only structured feed для массового обхода профилей.',
        '- Корневой объект содержит `stats` и `profiles`.',
        '- `stats` дает агрегированные counts по профилям, исходящим mentions и публичным backlinks.',
        '- `profiles[]` включает `id`, `slug`, `name`, опциональные `name_cases`, `company` и `position`, `html_url`, `markdown_url`, `contacts`, `body_markdown`, `mentions`, `mention_count`, `backlinks` и `backlink_count`.',
        '- `mentions[]` раскрывают `@slug` и `@slug:case` из body профиля в имя нужного падежа и ссылки на detail pages; `[текст](@slug)` сохраняет видимый текст автора, но учитывается в том же массиве mentions.',
        '- `[текст](@slug:case)` не является поддерживаемым mention-синтаксисом: для labelled mention нужный падеж или грамматика пишутся в самом видимом тексте.',
        '- `backlinks` группируются по `news`, `status` и `people`, чтобы отвечать на вопрос, где человек уже фигурирует на сайте; граф учитывает canonical и labelled mentions.',
        '',
        'HTML и Markdown',
        '- Публичного HTML-home route `/people/` нет и в MVP не будет.',
        '- HTML detail pages `/people/[slug]/` остаются каноническим человекочитаемым представлением одной персоны.',
        '- Markdown companions `/people/[slug]/index.md` дают text-first слой для терминалов и агентов.',
        '- `/people/index.md` работает как section overview для агентов и терминалов, а не как список-страница для обычной навигации.',
        '',
        'Ограничения',
        '- Все маршруты /people read-only; ручек для изменения данных и авторизации здесь нет.',
        '- Контакты публикуются как есть в source data и считаются публичными.',
        '- Неизвестные `@slug` и отсутствующие формы `@slug:case` не допускаются: source markdown должен падать на билде до публикации.',
      ]);
}
