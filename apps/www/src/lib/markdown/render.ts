import { render } from '@shelkovo/markdown';

import { normalizeEntityMentions } from '../mentions';
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
    source_entity: options.mentions.source_entity,
  });
};

export const renderMarkdown = (
  markdown: string,
  options?: RenderSiteMarkdownOptions,
): string => render(preprocessSiteMarkdown(markdown, options).markdown);
