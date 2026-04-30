import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { rehypeTypograf } from '../typography';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // Raw HTML stays inert text so markdown content cannot inject executable markup.
  .use(remarkRehype)
  .use(rehypeTypograf)
  .use(rehypeStringify);

export const renderNewsMarkdown = (markdown: string): string =>
  String(processor.processSync(markdown));
