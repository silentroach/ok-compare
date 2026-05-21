import type { RawNewsAuthor } from './raw-schema';
import type { NewsAuthor } from './types';

export const mapRawNewsAuthor = (
  id: string,
  raw: RawNewsAuthor,
): NewsAuthor => ({
  id,
  name: raw.name,
  kind: raw.kind,
  shortName: raw.short_name,
  url: raw.url,
  role: raw.role,
});
