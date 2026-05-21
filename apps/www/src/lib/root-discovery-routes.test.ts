import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const repoRoot = join(process.cwd(), '../..');
const inventoryPath = join(
  repoRoot,
  'docs/migrations/raw-to-domain-data/inventory.md',
);

const readRepoFile = (path: string): string =>
  readFileSync(join(repoRoot, path), 'utf-8');

beforeAll(() => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });
});

describe('root discovery route smoke', () => {
  it('serves the root api-catalog with people and reglament anchors', async () => {
    const route = await import('../pages/.well-known/api-catalog');
    const response = await route.GET({} as never);
    const payload = JSON.parse(await response.text()) as {
      readonly linkset: readonly {
        readonly anchor?: string;
        readonly item?: readonly { readonly href?: string }[];
      }[];
    };
    const reglament = payload.linkset.find(
      (entry) => entry.anchor === 'https://example.com/815/regulation/',
    );

    expect(response.headers.get('Content-Type')).toContain(
      'application/linkset+json',
    );
    expect(
      payload.linkset.some(
        (entry) => entry.anchor === 'https://example.com/people/index.md',
      ),
    ).toBe(true);
    expect(reglament?.item).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: 'https://example.com/815/regulation/data/estimate-2026.json',
        }),
      ]),
    );
  });

  it('serves the root public skills index with the people skill', async () => {
    const route = await import('../pages/.well-known/agent-skills/index.json');
    const response = await route.GET({} as never);
    const payload = JSON.parse(await response.text()) as {
      readonly skills: readonly {
        readonly name: string;
        readonly url: string;
      }[];
    };

    expect(response.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    );
    expect(payload.skills).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'people-profiles',
          url: './people-profiles/SKILL.md',
        }),
      ]),
    );
  });

  it('documents migrated public DTO boundaries and intentional legacy fields', () => {
    const files = {
      comparePublicDto: readRepoFile('apps/www/src/compare/lib/public-dto.ts'),
      compareFull: readRepoFile('apps/www/src/compare/lib/full.ts'),
      compareExplorer: readRepoFile('apps/www/src/compare/lib/explorer.ts'),
      newsPublicDto: readRepoFile('apps/www/src/lib/news/public-dto.ts'),
      statusPublicDto: readRepoFile('apps/www/src/lib/status/public-dto.ts'),
      peoplePublicDto: readRepoFile('apps/www/src/lib/people/public-dto.ts'),
      inventory: readFileSync(inventoryPath, 'utf-8'),
    };

    expect(files.comparePublicDto).toContain('export interface PublicStats');
    expect(files.compareFull).toContain('export const toFullPayload');
    expect(files.compareExplorer).toContain('export const toExplorerPayload');
    expect(files.newsPublicDto).toContain('export interface NewsPublicPayload');
    expect(files.statusPublicDto).toContain(
      'export interface StatusPublicPayloadDto',
    );
    expect(files.peoplePublicDto).toContain(
      'export interface PeoplePublicPayloadDto',
    );

    expect(files.inventory).toContain('## Intentional legacy public fields');
    for (const token of [
      'short_name',
      'normalized_per_sotka_month',
      'published_at',
      'source_url',
      'started_at',
      'is_active',
      'name_cases',
      'body_markdown',
      'source_id',
    ]) {
      expect(files.inventory).toContain(token);
    }
  });
});
