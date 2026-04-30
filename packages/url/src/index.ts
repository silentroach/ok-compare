const SCHEME = /^[a-z][a-z\d+.-]*:/i;

export const isAbsoluteUrl = (value: string): boolean =>
  SCHEME.test(value) || value.startsWith('//');

/**
 * Builds URL with base path prepended.
 * Handles external URLs, anchors, and special protocols.
 */
export function withBase(base: string | undefined, url: string): string {
  if (isAbsoluteUrl(url) || url.startsWith('#')) {
    return url;
  }

  const root = base?.replace(/\/$/, '') ?? '';
  const path = url.startsWith('/') ? url : `/${url}`;

  return `${root}${path}`;
}

export function telegram(handle: string): string {
  const clean = handle.trim().replace(/^@/, '');
  return `https://t.me/${clean}`;
}
