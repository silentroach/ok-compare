import { beforeAll, describe, expect, it, vi } from 'vitest';

const fixtures = vi.hoisted(() => ({
  people: {
    profiles: [
      {
        canonical: 'https://example.com/people/kschemelinin/',
        markdown_url: '/people/kschemelinin/index.md',
        mentions: [{ slug: 'apetrov' }],
        backlinks: {
          news: [{ source_id: '2026/05/power-outage' }],
          status: [{ source_id: '2026/04/electricity' }],
          people: [],
        },
      },
    ],
  },
}));

vi.mock('./load', () => ({
  loadPeopleDataWithBacklinks: async () => fixtures.people,
}));

let build: typeof import('./llms').build;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ build } = await import('./llms'));
});

describe('people llms', () => {
  it('serializes the short agent overview as Markdown AST output', async () => {
    await expect(build('short')).resolves.toMatchInlineSnapshot(`
      "# Люди Шелково

      Файл: llms.txt
      Язык: русский

      ## Описание

      - Раздел \`/people/\` публикует публичные профили людей, контакты и граф упоминаний между новостями, статусом и другими профилями.
      - Сейчас в разделе 1 профиль, 1 исходящее упоминание и 2 обратные ссылки.
      - Публичного HTML-индекса \`/people/\` нет: для массового обхода используйте people.json и markdown overview.
      - У профиля могут быть \`company\`, \`position\` и \`name_cases\` для склонения canonical mentions; \`body_markdown\` может быть пустым, если базовый контекст уже есть во frontmatter.

      ## Главные URL

      - Markdown overview раздела: <https://example.com/people/index.md>
      - Основной JSON feed: <https://example.com/people/data/people.json>
      - API catalog: <https://example.com/people/.well-known/api-catalog>
      - JSON Schema: <https://example.com/people/schemas/people.schema.json>
      - OpenAPI: <https://example.com/people/openapi/people.openapi.json>
      - Расширенная версия этого текста: <https://example.com/people/llms-full.txt>

      ## Как читать раздел

      - Для массового обхода начинайте с <https://example.com/people/data/people.json>.
      - Для одной персоны переходите на <https://example.com/people/kschemelinin/> или <https://example.com/people/kschemelinin/index.md>.
      - В \`mentions\` лежат исходящие упоминания из body профиля, если body заполнен; учитываются \`@slug\`, \`@slug:case\` и \`[текст](@slug)\`, а \`[текст](@slug:case)\` не поддерживается.
      - В \`backlinks\` лежат входящие ссылки из новостей, статуса и других профилей, собранные из тех же canonical и labelled mention-синтаксисов.
      - Контакты публикуются открыто и не маскируются в feed или markdown companions.
      "
    `);
  });
});
