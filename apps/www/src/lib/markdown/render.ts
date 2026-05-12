import { render, type MarkdownPreprocessor } from '@shelkovo/markdown';

import {
  normalizePeopleMentions,
  type PeopleMentionRegistry,
} from '../people/mentions';

export interface RenderPeopleMentionsOptions {
  readonly registry: PeopleMentionRegistry;
  readonly context: string;
}

export interface RenderSiteMarkdownOptions {
  readonly people?: RenderPeopleMentionsOptions;
}

const peoplePreprocessor =
  (people: RenderPeopleMentionsOptions): MarkdownPreprocessor =>
  (markdown) =>
    normalizePeopleMentions({
      markdown,
      context: people.context,
      registry: people.registry,
    }).markdown;

export const renderMarkdown = (
  markdown: string,
  options?: RenderSiteMarkdownOptions,
): string => {
  if (!options?.people) {
    return render(markdown);
  }

  return render(markdown, {
    preprocess: peoplePreprocessor(options.people),
  });
};
