import { beforeAll, describe, expect, it, vi } from 'vitest';

const fixtures = vi.hoisted(() => ({
  news: {
    articles: [{ id: 'news-1' }, { id: 'news-2' }, { id: 'news-3' }],
  },
  people: {
    profiles: [
      {
        canonical: 'https://example.com/people/kschemelinin/',
        markdown_url: '/people/kschemelinin/index.md',
      },
    ],
  },
  status: {
    incidents: [{ id: 'status-1' }, { id: 'status-2' }],
    active: [{ kind: 'incident' }, { kind: 'maintenance' }],
  },
}));

vi.mock('./news/load', () => ({
  loadNewsData: async () => fixtures.news,
}));

vi.mock('./people/load', () => ({
  loadPeopleDataWithBacklinks: async () => fixtures.people,
}));

vi.mock('./status/load', () => ({
  loadStatusData: async () => fixtures.status,
}));

let build: typeof import('./llms').build;
let buildHomeMarkdown: typeof import('./llms').buildHomeMarkdown;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ build, buildHomeMarkdown } = await import('./llms'));
});

describe('root llms', () => {
  it('serializes the short agent overview as Markdown AST output', async () => {
    await expect(build('short')).resolves.toMatchInlineSnapshot(`
      "# Шелково Онлайн

      Файл: llms.txt
      Язык: русский

      ## Описание

      - Это карта публичных данных и точек входа kpshelkovo.online.
      - Основные разделы: новости, статус сервисов, регламент и смета тарифа 815, профили людей и сравнение тарифов поселков.
      - Сейчас в новостях 3 статьи, в статусе 2 записи и 1 активный инцидент, в людях 1 профиль.
      - Для массового чтения используйте JSON-фиды; HTML и Markdown удобнее для ссылок и точечного чтения.

      ## Главные URL

      - Главная: <https://example.com/>
      - Главная в Markdown: <https://example.com/index.md>
      - API catalog сайта: <https://example.com/.well-known/api-catalog>
      - Инструкции для автоматического чтения сайта: <https://example.com/.well-known/agent-skills/index.json>
      - Новости: <https://example.com/news/>
      - Статус: <https://example.com/status/>
      - Регламент: <https://example.com/815/regulation/>
      - Люди в Markdown: <https://example.com/people/index.md>
      - Сравнение тарифов: <https://example.com/815/compare/>
      - Расширенная версия этого текста: <https://example.com/llms-full.txt>

      ## Как ориентироваться

      - Если задача относится к одному разделу, сначала откройте его \`llms.txt\`; если нужны данные массово, сразу берите JSON-фид.
      - Новости: <https://example.com/news/llms.txt>; основной feed: <https://example.com/news/data/articles.json>; календарные события лежат в \`articles[].events[].ics_url\`.
      - Статус сервисов: <https://example.com/status/llms.txt>; основной feed: <https://example.com/status/data/status.json>.
      - Регламент и смета: <https://example.com/815/regulation/llms.txt>; смета: <https://example.com/815/regulation/data/estimate-2026.json>; полный регламент: <https://example.com/815/regulation/full.md>; dataset: <https://example.com/815/regulation/data/full-2026.json>.
      - Люди: <https://example.com/people/llms.txt>; основной feed: <https://example.com/people/data/people.json>; одна персона: <https://example.com/people/kschemelinin/> или <https://example.com/people/kschemelinin/index.md>.
      - Сравнение тарифов поселков: <https://example.com/815/compare/llms.txt>; основной feed: <https://example.com/815/compare/data/settlements.json>.
      - Публичные инструкции помогают с типовыми задачами; у сравнения тарифов есть отдельный индекс.
      "
    `);
  });

  it('publishes public discovery endpoints without relying on section copy', async () => {
    const short = await build('short');
    const full = await build('full');
    const home = await buildHomeMarkdown();
    const combined = [short, full, home].join('\n');

    for (const url of [
      'https://example.com/.well-known/api-catalog',
      'https://example.com/.well-known/agent-skills/index.json',
      'https://example.com/news/llms.txt',
      'https://example.com/news/data/articles.json',
      'https://example.com/status/llms.txt',
      'https://example.com/status/data/status.json',
      'https://example.com/815/regulation/llms.txt',
      'https://example.com/815/regulation/data/estimate-2026.json',
      'https://example.com/815/regulation/data/full-2026.json',
      'https://example.com/people/llms.txt',
      'https://example.com/people/data/people.json',
      'https://example.com/people/kschemelinin/',
      'https://example.com/people/kschemelinin/index.md',
      'https://example.com/815/compare/llms.txt',
      'https://example.com/815/compare/data/settlements.json',
    ]) {
      expect(combined).toContain(url);
    }

    expect(combined).not.toMatch(/apps\/www|src\/|repo:/u);
  });
});
