import rehypeStringify from 'rehype-stringify';
import type { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified, type Plugin } from 'unified';

import { uniqueHeadingSlug } from './heading-slugs';
import { assertNoMarkdownTables } from './no-tables';
import { expandTableOfContents } from './toc';
import { rehypeTypograf } from './typography';

export type MarkdownPreprocessor = (markdown: string) => string;

export interface RenderOptions {
  readonly preprocess?: MarkdownPreprocessor | readonly MarkdownPreprocessor[];
}

const remarkNoMarkdownTables: Plugin<[], Root> = () => (tree) => {
  assertNoMarkdownTables(tree);
};

type HtmlTreeNode = {
  readonly type: string;
  readonly tagName?: string;
  readonly value?: string;
  properties?: Record<string, unknown>;
  children?: HtmlTreeNode[];
};

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const HEADING_ANCHOR_LABEL = 'Ссылка на этот раздел';

const nodeText = (node: HtmlTreeNode): string => {
  if (typeof node.value === 'string') {
    return node.value;
  }

  return node.children?.map(nodeText).join('') ?? '';
};

const headingAnchor = (slug: string): HtmlTreeNode => ({
  type: 'element',
  tagName: 'a',
  properties: {
    ariaLabel: HEADING_ANCHOR_LABEL,
    className: ['ui-heading-anchor'],
    href: `#${slug}`,
    title: HEADING_ANCHOR_LABEL,
  },
  children: [
    {
      type: 'element',
      tagName: 'span',
      properties: {
        ariaHidden: 'true',
      },
      children: [
        {
          type: 'text',
          value: '#',
        },
      ],
    },
  ],
});

const addHeadingIds = (
  node: HtmlTreeNode,
  seenSlugs: Map<string, number>,
): void => {
  if (node.tagName && HEADING_TAGS.has(node.tagName)) {
    const slug = uniqueHeadingSlug(nodeText(node), seenSlugs);

    node.properties = node.properties ?? {};
    node.properties.id = slug;
    node.children = [...(node.children ?? []), headingAnchor(slug)];
  }

  node.children?.forEach((child) => addHeadingIds(child, seenSlugs));
};

const rehypeHeadingIds: Plugin<[], HtmlTreeNode> = () => (tree) => {
  addHeadingIds(tree, new Map());
};

const remarkTableOfContents: Plugin<[], Root> = () => (tree) =>
  expandTableOfContents(tree);

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkTableOfContents)
  .use(remarkNoMarkdownTables)
  // Raw HTML is not passed through, so markdown content cannot inject markup.
  .use(remarkRehype)
  .use(rehypeHeadingIds)
  .use(rehypeTypograf)
  .use(rehypeStringify);

const preprocessMarkdown = (
  markdown: string,
  preprocess: RenderOptions['preprocess'],
): string => {
  if (!preprocess) {
    return markdown;
  }

  if (typeof preprocess === 'function') {
    return preprocess(markdown);
  }

  return preprocess.reduce((value, fn) => fn(value), markdown);
};

export const render = (markdown: string, options?: RenderOptions): string => {
  const processed = preprocessMarkdown(markdown, options?.preprocess);

  return String(processor.processSync(processed));
};
