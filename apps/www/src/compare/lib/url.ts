import { telegram, withBase as join } from '@shelkovo/url';

export const COMPARE_BASE = '/815/compare';

/**
 * Builds URL with base path prepended
 * Handles external URLs, anchors, and special protocols
 */
export function withBase(url: string): string {
  return join(COMPARE_BASE, url);
}

export { telegram };
