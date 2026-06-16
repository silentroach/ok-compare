/// <reference types="astro/client" />

import { describe, expect, it } from 'vitest';

import { createAstroContainer } from '@/test/astro-container';

// @ts-expect-error Astro page modules are resolved by Astro/Vitest at test time.
import StatusPage from '@/pages/status/index.astro';

const stripTags = (value: string): string => {
  let sanitized = value;
  let previous: string;

  do {
    previous = sanitized;
    sanitized = sanitized.replace(/<[^>]*>/gu, '');
  } while (sanitized !== previous);

  return sanitized.replace(/\s+/gu, ' ').trim();
};

const headingOutline = (html: string): readonly string[] =>
  [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gu)].map(
    ([, level, content]) => `h${level}: ${stripTags(content)}`,
  );

describe('/status/', () => {
  it('keeps the service overview heading outline sequential', async () => {
    const container = await createAstroContainer();
    const html = await container.renderToString(StatusPage);

    expect(headingOutline(html).slice(0, 3)).toMatchInlineSnapshot(`
      [
        "h1: Статус КП Шелково",
        "h2: Сводка по сервисам",
        "h3: Электричество",
      ]
    `);
  });
});
