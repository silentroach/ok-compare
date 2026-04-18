import type { APIRoute } from 'astro';

import { PROFILE, catalog, self } from '../../lib/discovery';

export const prerender = true;

function headers(root: string): HeadersInit {
  return {
    'Content-Type': `application/linkset+json; profile="${PROFILE}"`,
    Link: self(root),
  };
}

export const GET: APIRoute = async ({ request }) => {
  const root = import.meta.env.SITE ?? new URL(request.url).origin;
  const body = `${JSON.stringify(catalog(root), null, 2)}\n`;

  return new Response(body, {
    headers: headers(root),
  });
};

export const HEAD: APIRoute = async ({ request }) => {
  const root = import.meta.env.SITE ?? new URL(request.url).origin;

  return new Response(null, {
    headers: headers(root),
  });
};
