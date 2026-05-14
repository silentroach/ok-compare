import type {
  PeopleMentionRegistry,
  PersonMentionTarget,
} from '../people/mentions';

export type PreprocessedSiteMarkdownBody = string;

export interface RenderPeopleMentionsOptions {
  readonly registry: PeopleMentionRegistry;
  readonly context: string;
}

export interface RenderSiteMarkdownOptions {
  readonly people?: RenderPeopleMentionsOptions;
}

export interface PreprocessedSiteMarkdown {
  readonly markdown: PreprocessedSiteMarkdownBody;
  readonly mentions: readonly PersonMentionTarget[];
}
