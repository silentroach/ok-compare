import type { RawNewsAuthor } from './raw-schema';
import type { NewsAuthor } from './types';

export const mapRawNewsAuthor = (
  id: string,
  raw: RawNewsAuthor,
): NewsAuthor => ({
  id,
  name: raw.name,
  kind: raw.kind,
  ...(raw.short_name ? { shortName: raw.short_name } : {}),
  ...(raw.url ? { url: raw.url } : {}),
  ...(raw.role ? { role: raw.role } : {}),
});
