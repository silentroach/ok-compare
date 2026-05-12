import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { rehypeTypograf } from './typography';

export type MarkdownPreprocessor = (markdown: string) => string;

export interface RenderOptions {
  readonly preprocess?: MarkdownPreprocessor | readonly MarkdownPreprocessor[];
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
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
