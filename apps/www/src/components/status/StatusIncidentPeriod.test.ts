/// <reference types="astro/client" />

import { dateTimeFromISO } from '@shelkovo/format';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

// @ts-expect-error Astro component modules are resolved by Astro/Vitest at test time.
import StatusIncidentPeriod from './StatusIncidentPeriod.astro';

const NBSP = '\u00A0';
const currentYear = dateTimeFromISO(new Date().toISOString()).year;

describe('StatusIncidentPeriod', () => {
  it('renders same-day time ranges without extra whitespace before the end time', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatusIncidentPeriod, {
      props: {
        incident: {
          is_active: false,
          started_iso: `${currentYear}-05-01T07:32:00+03:00`,
          started_has_time: true,
          ended_iso: `${currentYear}-05-01T16:38:00+03:00`,
          ended_has_time: true,
          duration: { total_minutes: 9 * 60 + 6 },
        },
      },
    });

    expect(html).toMatch(
      new RegExp(
        `<span[^>]*><time[^>]*>1${NBSP}мая, 07:32</time> -${NBSP}<time[^>]*>16:38</time> \\(9${NBSP}ч\\. 6${NBSP}мин\\.\\)</span>`,
      ),
    );
    expect(html).not.toMatch(/>\s+16:38</u);
  });
});
