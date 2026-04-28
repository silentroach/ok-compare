import type { APIRoute } from 'astro';
import { sitemap } from '../lib/site';

const map = sitemap();
const body = [
  'User-agent: *',
  'Allow: /',
  'Content-Signal: ai-train=yes, search=yes, ai-input=yes',
  ...(map ? [`Sitemap: ${map}`] : []),
].join('\n');

export const GET: APIRoute = () =>
  new Response(`${body}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
