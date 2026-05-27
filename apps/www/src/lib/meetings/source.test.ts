import { describe, expect, it } from 'vitest';

import { createMeetingSourceId } from './source';

const validData = {
  date: '2026-05-26',
  slug: 'example-meeting',
};

describe('createMeetingSourceId', () => {
  it('accepts only YYYY-MM-DD/slug/index.md sources', () => {
    expect(
      createMeetingSourceId('2026-05-26/example-meeting/index.md', validData),
    ).toBe('2026-05-26/example-meeting');
  });

  it('rejects invalid source layout', () => {
    expect(() =>
      createMeetingSourceId('2026/05/example-meeting.md', validData),
    ).toThrow('must resolve to YYYY-MM-DD/[slug]/index.md');
    expect(() =>
      createMeetingSourceId('2026-05-26/example-meeting/INDEX.md', validData),
    ).toThrow('must resolve to YYYY-MM-DD/[slug]/index.md');
  });

  it('rejects invalid date and slug directories', () => {
    expect(() =>
      createMeetingSourceId('2026-5-26/example-meeting/index.md', validData),
    ).toThrow('date directory must use YYYY-MM-DD');
    expect(() =>
      createMeetingSourceId('2026-02-31/example-meeting/index.md', validData),
    ).toThrow('date directory must use YYYY-MM-DD');
    expect(() =>
      createMeetingSourceId('2026-05-26/Example/index.md', validData),
    ).toThrow('slug must use lower-case Latin letters, digits, and hyphen');
  });

  it('rejects date and slug mismatches', () => {
    expect(() =>
      createMeetingSourceId('2026-05-27/example-meeting/index.md', validData),
    ).toThrow('must match the frontmatter date');
    expect(() =>
      createMeetingSourceId('2026-05-26/other-meeting/index.md', validData),
    ).toThrow('must match the frontmatter slug');
  });
});
