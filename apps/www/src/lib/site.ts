import { isAbsoluteUrl, withBase as join } from '@shelkovo/url';

const site = import.meta.env.SITE;
const base = import.meta.env.BASE_URL;

function need(val: string | undefined, key: string): string {
  if (!val) {
    throw new Error(`${key} is required`);
  }

  return val.endsWith('/') ? val : `${val}/`;
}

function trim(path: string, root: string): string {
  const url = path.startsWith('/') ? path : `/${path}`;
  const stem = root === '/' ? '/' : root.replace(/\/$/, '');

  if (stem === '/') return url;
  if (url === stem) return '/';
  if (url.startsWith(`${stem}/`)) {
    return url.slice(stem.length) || '/';
  }

  return url;
}

export function withBase(path: string): string {
  return join(base, path);
}

export function absoluteUrl(path: string): string {
  const root = need(site, 'SITE');

  if (isAbsoluteUrl(path)) {
    return new URL(path, root).toString();
  }

  return new URL(join(base, trim(path, base)), root).toString();
}

export function canon(path: string): string {
  return absoluteUrl(path);
}

export function canonRoot(): string {
  return canon('/').replace(/\/$/, '');
}
