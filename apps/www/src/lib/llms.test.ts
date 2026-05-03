import { beforeAll, describe, expect, it } from 'vitest';

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
  it('mentions people discovery surfaces alongside other sections', async () => {
    const short = await build('short');
    const full = await build('full');
    const home = await buildHomeMarkdown();

    expect(short).toContain('people.json');
    expect(short).toContain('Люди в Markdown');
    expect(full).toContain('Раздел Люди');
    expect(full).toContain('/people/data/people.json');
    expect(home).toContain('Люди');
    expect(home).toContain('/people/.well-known/api-catalog');
  });
});
