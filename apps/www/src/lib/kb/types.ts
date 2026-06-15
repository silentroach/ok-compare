import type { PreprocessedSiteMarkdownBody } from '@/lib/markdown/render';
import type { EntityMentionTarget } from '@/lib/mentions';

export interface KbPage {
  readonly id: string;
  readonly sourceId: string;
  readonly title: string;
  readonly url: string;
  readonly canonical: string;
  readonly routeSlug?: string;
  readonly body: PreprocessedSiteMarkdownBody;
  readonly mentions: readonly EntityMentionTarget[];
}

export interface KbDataset {
  readonly pages: readonly KbPage[];
  readonly byId: ReadonlyMap<string, KbPage>;
  readonly bySourceId: ReadonlyMap<string, KbPage>;
}
