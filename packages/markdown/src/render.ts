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

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkNoMarkdownTables)
  // Raw HTML is not passed through, so markdown content cannot inject markup.
  .use(remarkRehype)
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
