import { withBase as join } from '@shelkovo/url';

import { COMPARE_BASE } from './url';

const CANONICAL_SITE = 'https://kpshelkovo.online';
const site = import.meta.env.SITE ?? CANONICAL_SITE;

function need(val: string | undefined, key: string): string {
  if (!val) {
    throw new Error(`${key} is required`);
  }

  return val.endsWith('/') ? val : `${val}/`;
}

function trim(path: string): string {
  const url = path.startsWith('/') ? path : `/${path}`;
  const base = COMPARE_BASE.replace(/\/$/, '');

  if (url === base || url === `${base}/`) return '/';
  if (url.startsWith(`${base}/`)) {
    return url.slice(base.length) || '/';
  }

  return url;
}

function abs(host: string | undefined, path: string): string {
  return new URL(join(COMPARE_BASE, trim(path)), need(host, 'SITE')).toString();
}

export function canon(path: string): string {
  return abs(site, path);
}

export function canonRoot(): string {
  return canon('/').replace(/\/$/, '');
}
