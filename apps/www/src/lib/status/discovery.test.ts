import { beforeAll, describe, expect, it } from 'vitest';

import type { StatusIncidentEntry } from './load';
import type { StatusArea, StatusKind, StatusService } from './schema';

interface EntryInput {
  readonly id: string;
  readonly title: string;
  readonly service: StatusService;
  readonly kind: StatusKind;
  readonly started_at: string;
  readonly ended_at?: string;
  readonly areas?: readonly StatusArea[];
  readonly source_url?: string;
  readonly body?: string;
}

const entry = (input: EntryInput): StatusIncidentEntry => ({
  id: input.id,
  body: input.body ?? '',
  data: {
    title: input.title,
    service: input.service,
    kind: input.kind,
    started_at: input.started_at,
    ...(input.ended_at ? { ended_at: input.ended_at } : {}),
    ...(input.areas ? { areas: [...input.areas] } : {}),
    source_url: input.source_url ?? `https://example.com/${input.id}`,
  },
});

let buildStatusDataset: typeof import('./load').buildStatusDataset;
let buildStatusPayload: typeof import('./discovery').buildStatusPayload;
let statusSchema: typeof import('./discovery').schema;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildStatusDataset } = await import('./load'));
  ({ buildStatusPayload, schema: statusSchema } = await import('./discovery'));
});

describe('buildStatusPayload', () => {
  it('omits incident detail URLs when no detail page is published', () => {
    const data = buildStatusDataset(
      [
        entry({
          id: '2026/05/water-no-page',
          title: 'Краткая запись без body',
          service: 'water',
          kind: 'incident',
          started_at: '03.05.2026 10:00',
        }),
        entry({
          id: '2026/05/water-with-page',
          title: 'Подробная запись с body',
          service: 'water',
          kind: 'maintenance',
          started_at: '01.05.2026 10:00',
          body: 'Первый абзац.',
        }),
      ],
      {
        now: new Date('2026-05-03T12:00:00+03:00'),
      },
    );

    const payload = buildStatusPayload(data);
    const noPage = payload.incidents.find(
      (item) => item.id === '2026/05/water-no-page',
    );
    const withPage = payload.incidents.find(
      (item) => item.id === '2026/05/water-with-page',
    );
    const water = payload.services.find((item) => item.service === 'water');

    expect(noPage).toBeDefined();
    expect(noPage!).not.toHaveProperty('html_url');
    expect(noPage!).not.toHaveProperty('markdown_url');

    expect(withPage).toMatchObject({
      html_url: 'https://example.com/status/incidents/2026/05/water-with-page/',
      markdown_url:
        'https://example.com/status/incidents/2026/05/water-with-page/index.md',
    });

    expect(water?.latest_incident).toMatchObject({
      id: '2026/05/water-no-page',
      title: 'Краткая запись без body',
    });
    expect(water?.latest_incident).not.toHaveProperty('html_url');
    expect(water?.latest_incident).not.toHaveProperty('markdown_url');
  });

  it('marks incident detail URLs as optional in the schema', () => {
    const defs = (statusSchema('https://example.com')['$defs'] ?? {}) as Record<
      string,
      { readonly required?: readonly string[] }
    >;

    expect(defs.incidentRef?.required).not.toContain('html_url');
    expect(defs.incidentRef?.required).not.toContain('markdown_url');
    expect(defs.incident?.required).not.toContain('html_url');
    expect(defs.incident?.required).not.toContain('markdown_url');
  });
});
