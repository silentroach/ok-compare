import { describe, expect, it } from 'vitest';

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
