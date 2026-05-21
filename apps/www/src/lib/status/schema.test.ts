import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  mapRawStatusArea,
  mapRawStatusKind,
  mapRawStatusService,
} from './mapper';
import { RawStatusIncidentSchema } from './raw-schema';
import { parseStatusTimestampInput } from './schema';

describe('parseStatusTimestampInput', () => {
  it('accepts dd.mm.yyyy', () => {
    expect(parseStatusTimestampInput('30.04.2026')).toMatchObject({
      year: '2026',
      month: '04',
      day: '30',
      has_time: false,
      iso: '2026-04-30T00:00:00+03:00',
    });
  });

  it('accepts dd.mm.yyyy hh:mm', () => {
    expect(parseStatusTimestampInput('01.05.2026 07:32')).toMatchObject({
      year: '2026',
      month: '05',
      day: '01',
      has_time: true,
      time: '07:32',
      iso: '2026-05-01T07:32:00+03:00',
    });
  });

  it('accepts compatible YYYY-MM-DD values', () => {
    expect(parseStatusTimestampInput('2026-05-01')).toMatchObject({
      year: '2026',
      month: '05',
      day: '01',
      has_time: false,
      iso: '2026-05-01T00:00:00+03:00',
    });
  });

  it('accepts Date objects produced by YAML date parsing', () => {
    expect(
      parseStatusTimestampInput(new Date('2026-05-01T00:00:00.000Z')),
    ).toMatchObject({
      year: '2026',
      month: '05',
      day: '01',
      has_time: false,
      iso: '2026-05-01T00:00:00+03:00',
    });
  });

  it('rejects unsupported formats', () => {
    expect(
      parseStatusTimestampInput('2026-05-01T07:32:00+03:00'),
    ).toBeUndefined();
    expect(parseStatusTimestampInput('01.05.2026 7:32')).toBeUndefined();
    expect(parseStatusTimestampInput('31.04.2026')).toBeUndefined();
  });
});

describe('RawStatusIncidentSchema', () => {
  it('keeps status frontmatter as an explicit reusable raw schema', () => {
    expect(
      RawStatusIncidentSchema.parse({
        service: 'water',
        kind: 'maintenance',
        started_at: '01.05.2026 07:32',
        ended_at: '01.05.2026 08:10',
        areas: ['river'],
        source_url: 'https://example.com/status/source',
      }),
    ).toMatchObject({
      service: 'water',
      kind: 'maintenance',
      started_at: '01.05.2026 07:32',
      ended_at: '01.05.2026 08:10',
      areas: ['river'],
      source_url: 'https://example.com/status/source',
    });
  });
});

describe('status raw value mappers', () => {
  it('maps raw status string values explicitly', () => {
    expect(mapRawStatusService('electricity')).toBe('electricity');
    expect(mapRawStatusKind('incident')).toBe('incident');
    expect(mapRawStatusArea('river')).toBe('river');
  });
});

describe('status raw/domain architecture', () => {
  it('keeps raw status field names out of sitemap source contracts', () => {
    const files = ['../sitemap.ts', '../sitemap-data.ts'];
    const rawStatusTokens = [
      'status_incidents',
      'started_iso',
      'ended_iso',
      'has_page',
    ];

    const offenders = files.flatMap((file) => {
      const source = readFileSync(new URL(file, import.meta.url), 'utf8');

      return rawStatusTokens
        .filter((token) => new RegExp(`\\b${token}\\b`, 'u').test(source))
        .map((token) => `${file}: ${token}`);
    });

    expect(offenders).toEqual([]);
  });
});
