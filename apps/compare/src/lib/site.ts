import { withBase as join } from '@shelkovo/url';

const site = import.meta.env.SITE;
const base = import.meta.env.BASE_URL;
const canonSite = import.meta.env.COMPARE_CANONICAL_SITE ?? site;
const canonBase = import.meta.env.COMPARE_CANONICAL_BASE ?? base;

function need(val: string | undefined, key: string): string {
  if (!val) {
    throw new Error(`${key} is required`);
  }

  return val.endsWith('/') ? val : `${val}/`;
}

function trim(path: string, root: string): string {
  const url = path.startsWith('/') ? path : `/${path}`;
  const base = root === '/' ? '/' : root.replace(/\/$/, '');

  if (base === '/') return url;
  if (url === base) return '/';
  if (url.startsWith(`${base}/`)) {
    return url.slice(base.length) || '/';
  }

  return url;
}

function abs(host: string | undefined, root: string, path: string): string {
  return new URL(join(root, trim(path, base)), need(host, 'SITE')).toString();
}

export function canon(path: string): string {
  return abs(canonSite, canonBase, path);
}

export function canonRoot(): string {
  return canon('/').replace(/\/$/, '');
}
