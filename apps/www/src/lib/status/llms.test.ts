import { beforeAll, describe, expect, it, vi } from 'vitest';

const fixtures = vi.hoisted(() => ({
  status: {
    active: [{ kind: 'incident' }, { kind: 'maintenance' }],
    services: [{ service: 'electricity' }],
    incidents: [
      {
        year: 2026,
        month: 5,
        slug: 'electricity-river-outage',
      },
    ],
  },
}));

vi.mock('./load', () => ({
  loadStatusData: async () => fixtures.status,
}));

let build: typeof import('./llms').build;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ build } = await import('./llms'));
});

describe('status llms', () => {
  it('serializes the short agent overview as Markdown AST output', async () => {
    await expect(build('short')).resolves.toMatchInlineSnapshot(`
      "# Статус КП Шелково

      Файл: llms.txt
      Язык: русский

      ## Описание

      - Раздел \`/status/\` показывает текущие проблемы, плановые работы и историю по сервисам КП Шелково.
      - Сейчас в разделе 1 запись, 1 активный инцидент и 1 активная работа.
      - Раздел покрывает 1 сервис: electricity, water, internet, dam.
      - HTML-страницы остаются каноническим представлением для людей, а /status/data/status.json служит основным structured feed.

      ## Главные URL

      - Главная страница /status: <https://example.com/status/>
      - Основной JSON feed: <https://example.com/status/data/status.json>
      - RSS: <https://example.com/status/feed.xml>
      - API catalog: <https://example.com/status/.well-known/api-catalog>
      - JSON Schema: <https://example.com/status/schemas/status.schema.json>
      - OpenAPI: <https://example.com/status/openapi/status.openapi.json>
      - Расширенная версия этого текста: <https://example.com/status/llms-full.txt>

      ## Как читать раздел

      - Markdown home: <https://example.com/status/index.md>
      - Пример service HTML (Электричество): <https://example.com/status/electricity/>
      - Пример service Markdown: <https://example.com/status/electricity/index.md>
      - Пример incident HTML: <https://example.com/status/incidents/2026/05/electricity-river-outage/>
      - Пример incident Markdown: <https://example.com/status/incidents/2026/05/electricity-river-outage/index.md>
      - В status.json сервисные сводки derive-ятся из массива incidents.
      - Сервисы: \`electricity\`, \`water\`, \`internet\`, \`dam\`.
      - Типы записей: \`incident\`, \`maintenance\`.
      - Текущий статус сервиса derive-ится как \`red\`, \`amber\` или \`green\`.
      "
    `);
  });
});
