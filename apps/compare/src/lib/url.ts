import { telegram, withBase as join } from '@shelkovo/url';

/**
 * Builds URL with base path prepended
 * Handles external URLs, anchors, and special protocols
 */
export function withBase(url: string): string {
  return join(import.meta.env.BASE_URL, url);
}

export { telegram };
