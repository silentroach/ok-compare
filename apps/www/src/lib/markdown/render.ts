import { render } from '@shelkovo/markdown';

import { normalizeEntityMentions } from '../mentions';
import type {
  EntityMentionSourceEntity,
  SiteMentionRegistry,
} from '../mentions';
import type {
  PreprocessedSiteMarkdown,
  RenderSiteMarkdownOptions,
} from './render.types';

export type {
  PreprocessedSiteMarkdown,
  PreprocessedSiteMarkdownBody,
  RenderEntityMentionsOptions,
  RenderSiteMarkdownOptions,
} from './render.types';

export const preprocessSiteMarkdown = (
  markdown: string,
  options?: RenderSiteMarkdownOptions,
): PreprocessedSiteMarkdown => {
  if (!options?.mentions) {
    return {
      markdown,
      mentions: [],
    };
  }

  return normalizeEntityMentions({
    markdown,
    context: options.mentions.context,
    registry: options.mentions.registry,
    sourceEntity: options.mentions.sourceEntity,
  });
};

export const preprocessSiteMarkdownContent = (
  markdown: string,
  context: string,
  registry: SiteMentionRegistry,
  sourceEntity?: EntityMentionSourceEntity,
): PreprocessedSiteMarkdown => {
  const body = markdown.trimEnd();

  return body.trim().length > 0
    ? preprocessSiteMarkdown(body, {
        mentions: {
          context,
          registry,
          sourceEntity,
        },
      })
    : {
        markdown: '',
        mentions: [],
      };
};

export const renderMarkdown = (
  markdown: string,
  options?: RenderSiteMarkdownOptions,
): string => render(preprocessSiteMarkdown(markdown, options).markdown);
