/**
 * Builds URL with base path prepended
 * Handles external URLs, anchors, and special protocols
 */
export function withBase(url: string): string {
  // External URLs or anchors - pass through
  if (
    url.startsWith('http') ||
    url.startsWith('#') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:')
  ) {
    return url;
  }

  // Ensure base URL doesn't have trailing slash and path has leading slash
  const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';
  const path = url.startsWith('/') ? url : `/${url}`;

  return `${base}${path}`;
}
