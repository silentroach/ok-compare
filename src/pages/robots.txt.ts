import type { APIRoute } from 'astro';

const site = import.meta.env.SITE;

if (!site) {
  throw new Error('SITE is required to generate robots.txt');
}

const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const root = new URL(base, site);
const sitemap = new URL('sitemap-index.xml', root).toString();
const body = ['User-agent: *', 'Allow: /', `Sitemap: ${sitemap}`].join('\n');

export const GET: APIRoute = () =>
  new Response(`${body}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
