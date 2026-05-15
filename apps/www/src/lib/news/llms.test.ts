import { beforeAll, describe, expect, it, vi } from 'vitest';

const fixtures = vi.hoisted(() => ({
  news: {
    articles: [
      {
        canonical: 'https://example.com/news/2026/05/event/',
        markdown_url: '/news/2026/05/event/index.md',
      },
    ],
    archives: {
      years: [
        {
          url: '/news/2026/',
          months: [{ url: '/news/2026/05/' }],
        },
      ],
    },
    tags: [{ url: '/news/tags/electricity/' }],
  },
}));

vi.mock('./load', () => ({
  loadNewsData: async () => fixtures.news,
}));

let build: typeof import('./llms').build;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ build } = await import('./llms'));
});

describe('news llms', () => {
  it('serializes the short agent overview as Markdown AST output', async () => {
    await expect(build('short')).resolves.toMatchInlineSnapshot(`
      "# Новости Шелково

      Файл: llms.txt
      Язык: русский

      ## Описание

      - Раздел \`/news/\` публикует новости, объявления и поздние уточнения по КП Шелково.
      - Сейчас в разделе 1 статья, 1 тег и 1 архивный год.
      - HTML detail pages остаются каноническим представлением для людей, а articles.json служит основным structured feed.
      - Если новость объявляет календарные события, в \`articles[].events[]\` есть metadata событий и ссылки на article-local \`.ics\`.

      ## Главные URL

      - Главная новостей: <https://example.com/news/>
      - Основной JSON feed: <https://example.com/news/data/articles.json>
      - RSS: <https://example.com/news/feed.xml>
      - API catalog: <https://example.com/news/.well-known/api-catalog>
      - JSON Schema: <https://example.com/news/schemas/articles.schema.json>
      - OpenAPI: <https://example.com/news/openapi/articles.openapi.json>
      - Расширенная версия этого текста: <https://example.com/news/llms-full.txt>

      ## Как читать раздел

      - Пример detail HTML: <https://example.com/news/2026/05/event/>
      - Пример detail Markdown: <https://example.com/news/2026/05/event/index.md>
      - Годовой архив: <https://example.com/news/2026/>
      - Месячный архив: <https://example.com/news/2026/05/>
      - Индекс тегов: <https://example.com/news/tags/>
      - Пример tag page: <https://example.com/news/tags/electricity/>
      - В articles.json каждая статья содержит summary, полный body\\_markdown, optional \`events\` и отдельный массив addenda.
      - addenda не переписывают исходный body новости; это поздние уточнения, комментарии или новые подтвержденные факты.
      - Тип источника определяется по \`author.kind\`; официальные источники используют \`kind: official\`.
      - Для календаря события используйте \`/news/YYYY/MM/[entry]/[event-slug].ics\`; глобального календаря событий нет.
      "
    `);
  });
});
