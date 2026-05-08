import type { APIRoute } from 'astro';

import { estimateDetails2026 } from '@/data/reglament/estimate-details-2026';
import { reglamentApiCatalogPath } from '@/lib/reglament/routes';
import { absoluteUrl } from '@/lib/site';

export const prerender = true;

export const GET: APIRoute = async () => {
  const body = `${JSON.stringify(estimateDetails2026, null, 2)}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Link: `<${absoluteUrl(reglamentApiCatalogPath())}>; rel="api-catalog"; type="application/linkset+json"`,
    },
  });
};
