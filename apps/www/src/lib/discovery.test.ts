import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('./llms', () => ({
  siteApiCatalogUrl: () => '/sub/.well-known/api-catalog',
  siteLlmsFullUrl: () => '/sub/llms-full.txt',
  siteLlmsUrl: () => '/sub/llms.txt',
  siteMarkdownUrl: () => '/sub/index.md',
}));

vi.mock('./skills', () => ({
  siteSkillsUrl: () => '/sub/.well-known/agent-skills/index.json',
}));

let catalog: typeof import('./discovery').catalog;
let self: typeof import('./discovery').self;

beforeAll(async () => {
  vi.resetModules();
  ({ catalog, self } = await import('./discovery'));
});

describe('root api catalog', () => {
  it('keeps base-prefixed site links valid in non-root deployments', () => {
    const root = 'https://example.com/sub';
    const payload = catalog(root) as {
      readonly linkset: readonly [{ readonly item?: readonly unknown[] }];
    };
    const items = payload.linkset[0]?.item ?? [];

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: 'https://example.com/sub/index.md' }),
        expect.objectContaining({ href: 'https://example.com/sub/llms.txt' }),
        expect.objectContaining({
          href: 'https://example.com/sub/llms-full.txt',
        }),
        expect.objectContaining({
          href: 'https://example.com/sub/.well-known/agent-skills/index.json',
        }),
      ]),
    );

    expect(self(root)).toBe(
      '<https://example.com/sub/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"; profile="https://www.rfc-editor.org/info/rfc9727"',
    );
  });
});
