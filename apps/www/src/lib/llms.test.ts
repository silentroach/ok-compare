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
