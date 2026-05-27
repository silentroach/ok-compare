import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(() => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });
});

describe('meetings route helpers', () => {
  it('builds stable public paths', async () => {
    const routes = await import('./routes');
    const input = { date: '2026-05-26', slug: 'example-meeting' };

    expect(routes.meetingsPath()).toBe('/meetings/');
    expect(routes.meetingPath(input)).toBe(
      '/meetings/2026-05-26/example-meeting/',
    );
    expect(routes.meetingMarkdownPath(input)).toBe(
      '/meetings/2026-05-26/example-meeting/index.md',
    );
    expect(routes.meetingsDataPath()).toBe('/meetings/data/meetings.json');
    expect(routes.meetingsLlmsPath()).toBe('/meetings/llms.txt');
    expect(routes.meetingsLlmsFullPath()).toBe('/meetings/llms-full.txt');
  });

  it('builds URL and canonical variants', async () => {
    const routes = await import('./routes');
    const input = { date: '2026-05-26', slug: 'example-meeting' };

    expect(routes.meetingsUrl()).toBe('/meetings/');
    expect(routes.meetingUrl(input)).toBe(
      '/meetings/2026-05-26/example-meeting/',
    );
    expect(routes.meetingMarkdownUrl(input)).toBe(
      '/meetings/2026-05-26/example-meeting/index.md',
    );
    expect(routes.meetingsDataUrl()).toBe('/meetings/data/meetings.json');
    expect(routes.meetingsLlmsUrl()).toBe('/meetings/llms.txt');
    expect(routes.meetingsLlmsFullUrl()).toBe('/meetings/llms-full.txt');
    expect(routes.meetingCanonical(input)).toBe(
      'https://example.com/meetings/2026-05-26/example-meeting/',
    );
  });

  it('exposes route patterns for public surface registration', async () => {
    const routes = await import('./routes');

    expect(routes.meetingPattern()).toBe('/meetings/:date/:slug/');
    expect(routes.meetingMarkdownPattern()).toBe(
      '/meetings/:date/:slug/index.md',
    );
  });

  it('rejects blank route inputs', async () => {
    const routes = await import('./routes');

    expect(() =>
      routes.meetingPath({ date: '   ', slug: 'example-meeting' }),
    ).toThrow('date is required');
    expect(() =>
      routes.meetingPath({ date: '2026-05-26', slug: '   ' }),
    ).toThrow('slug is required');
  });
});
