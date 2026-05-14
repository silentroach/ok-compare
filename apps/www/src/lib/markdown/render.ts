import { render } from '@shelkovo/markdown';

import { normalizePeopleMentions } from '../people/mentions';
import type {
  PreprocessedSiteMarkdown,
  RenderSiteMarkdownOptions,
} from './render.types';

export type {
  PreprocessedSiteMarkdown,
  PreprocessedSiteMarkdownBody,
  RenderPeopleMentionsOptions,
  RenderSiteMarkdownOptions,
} from './render.types';

export const preprocessSiteMarkdown = (
  markdown: string,
  options?: RenderSiteMarkdownOptions,
): PreprocessedSiteMarkdown => {
  if (!options?.people) {
    return {
      markdown,
      mentions: [],
    };
  }

  return normalizePeopleMentions({
    markdown,
    context: options.people.context,
    registry: options.people.registry,
  });
};

export const renderMarkdown = (
  markdown: string,
  options?: RenderSiteMarkdownOptions,
): string => render(preprocessSiteMarkdown(markdown, options).markdown);
