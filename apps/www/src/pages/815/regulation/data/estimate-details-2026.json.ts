import type { APIRoute } from 'astro';

import { estimateDetails2026 } from '@/data/reglament/estimate-details-2026';
import { reglamentApiCatalogPath } from '@/lib/reglament/routes';
import { canonRoot } from '@/lib/site';

export const prerender = true;

const abs = (root: string, path: string): string =>
  new URL(path.replace(/^\//, ''), `${root}/`).toString();

export const GET: APIRoute = async () => {
  const root = canonRoot();
  const body = `${JSON.stringify(estimateDetails2026, null, 2)}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Link: `<${abs(root, reglamentApiCatalogPath())}>; rel="api-catalog"; type="application/linkset+json"`,
    },
  });
};
