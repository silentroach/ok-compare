import type { BlockContent, PhrasingContent, RootContent } from 'mdast';

export type MarkdownFrontmatter = Readonly<Record<string, unknown>>;

export type MarkdownDocumentInput = {
  readonly frontmatter?: MarkdownFrontmatter;
  readonly children: readonly RootContent[];
};

export type MarkdownPhrasingInput = string | readonly PhrasingContent[];

export type MarkdownListItemInput = string | readonly BlockContent[];

export type MarkdownListOptions = {
  readonly ordered?: boolean;
  readonly spread?: boolean;
  readonly start?: number;
};

export type MarkdownListItemOptions = {
  readonly checked?: boolean;
  readonly spread?: boolean;
};
