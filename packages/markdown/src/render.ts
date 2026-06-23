import rehypeStringify from 'rehype-stringify';
import type { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified, type Plugin } from 'unified';

import { assertNoMarkdownTables } from './no-tables';
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
  readonly children?: readonly HtmlTreeNode[];
};

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const nodeText = (node: HtmlTreeNode): string => {
  if (typeof node.value === 'string') {
    return node.value;
  }

  return node.children?.map(nodeText).join('') ?? '';
};

const headingSlug = (text: string): string => {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/['"«»“”„]/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/gu, '');

  return slug || 'section';
};

const uniqueHeadingSlug = (
  text: string,
  seenSlugs: Map<string, number>,
): string => {
  const slug = headingSlug(text);
  const count = seenSlugs.get(slug) ?? 0;
  seenSlugs.set(slug, count + 1);

  return count === 0 ? slug : `${slug}-${count + 1}`;
};

const addHeadingIds = (
  node: HtmlTreeNode,
  seenSlugs: Map<string, number>,
): void => {
  if (node.tagName && HEADING_TAGS.has(node.tagName)) {
    node.properties = node.properties ?? {};
    node.properties.id = uniqueHeadingSlug(nodeText(node), seenSlugs);
  }

  node.children?.forEach((child) => addHeadingIds(child, seenSlugs));
};

const rehypeHeadingIds: Plugin<[], HtmlTreeNode> = () => (tree) => {
  addHeadingIds(tree, new Map());
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
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
